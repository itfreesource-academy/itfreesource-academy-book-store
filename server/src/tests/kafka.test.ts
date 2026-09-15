import { describe, it, expect, beforeEach } from 'vitest';
import { kafkaBroker } from '../services/kafkaBroker.js';

describe('Apache Kafka Event Streaming Broker', () => {
  beforeEach(() => {
    kafkaBroker.initDefaultBrokerState();
  });

  it('should initialize core platform topics with partitions and descriptions', () => {
    const topics = kafkaBroker.getTopics();
    const topicNames = topics.map(t => t.name);

    expect(topicNames).toContain('bookstore.orders.created');
    expect(topicNames).toContain('bookstore.pricing.updated');
    expect(topicNames).toContain('bookstore.borrow.events');
    expect(topicNames).toContain('bookstore.audit.events');
    expect(topicNames).toContain('bookstore.dlq.poison-pills');

    const ordersTopic = topics.find(t => t.name === 'bookstore.orders.created');
    expect(ordersTopic?.partitions).toBe(3);
  });

  it('should produce an event message and assign incrementing offsets', () => {
    const topic = 'bookstore.orders.created';
    const initialMessages = kafkaBroker.getMessages(topic);
    const initialOffset = initialMessages.messages.length > 0 ? initialMessages.messages[0].offset : -1;

    const payload = {
      orderId: 'ord_test_001',
      total: 99.99,
      customer: 'sdet_tester'
    };

    const msg = kafkaBroker.produce(topic, payload, 'sdet_tester', { 'x-test': 'vitest' });
    expect(msg.topic).toBe(topic);
    expect(msg.offset).toBeGreaterThan(initialOffset);
    expect(msg.key).toBe('sdet_tester');
    expect(msg.value).toEqual(payload);
    expect(msg.headers?.['x-test']).toBe('vitest');

    const updated = kafkaBroker.getMessages(topic);
    expect(updated.messages[0].id).toBe(msg.id);
  });

  it('should list consumer groups and calculate lag accurately', () => {
    const groups = kafkaBroker.getConsumerGroups();
    expect(groups.length).toBeGreaterThan(0);

    const invGroup = groups.find(g => g.groupId === 'inventory-service-cg');
    expect(invGroup).toBeDefined();
    expect(typeof invGroup?.lag).toBe('number');
    expect(invGroup?.lag).toBeGreaterThanOrEqual(0);
  });

  it('should commit consumer offset and reduce consumer lag', () => {
    // Produce 3 messages to accumulate lag
    const topic = 'bookstore.orders.created';
    for (let i = 0; i < 3; i++) {
      kafkaBroker.produce(topic, { testIndex: i }, `key_${i}`);
    }

    const beforeCommit = kafkaBroker.getConsumerGroups().find(g => g.groupId === 'inventory-service-cg')!;
    const latestOffset = beforeCommit.latestOffset;

    // Commit consumer offset to latest
    const committed = kafkaBroker.commitOffset('inventory-service-cg', topic, latestOffset);
    expect(committed?.committedOffset).toBe(latestOffset);
    expect(committed?.lag).toBe(0);
  });

  it('should inject a poison pill and automatically route it to DLQ', () => {
    const { poisonMessage, dlqMessage } = kafkaBroker.injectPoisonPill(
      'bookstore.orders.created',
      'CORRUPTED_JSON_SCHEMA_FAULT'
    );

    expect(poisonMessage.value._poisonPill).toBe(true);
    expect(dlqMessage.topic).toBe('bookstore.dlq.poison-pills');
    expect(dlqMessage.value.originalTopic).toBe('bookstore.orders.created');
    expect(dlqMessage.value.reason).toBe('CORRUPTED_JSON_SCHEMA_FAULT');

    const dlqMessages = kafkaBroker.getMessages('bookstore.dlq.poison-pills');
    expect(dlqMessages.messages.some(m => m.id === dlqMessage.id)).toBe(true);
  });

  it('should replay a DLQ message back to the original topic with recovery metadata', () => {
    const { dlqMessage } = kafkaBroker.injectPoisonPill(
      'bookstore.orders.created',
      'REPLAY_TEST_FAULT'
    );

    const replayed = kafkaBroker.replayDlqMessage(dlqMessage.id);
    expect(replayed).not.toBeNull();
    expect(replayed?.topic).toBe('bookstore.orders.created');
    expect(replayed?.value._recoveredFromDlq).toBe(true);
    expect(replayed?.headers?.['x-replayed-from-dlq']).toBe(dlqMessage.id);
  });
});
