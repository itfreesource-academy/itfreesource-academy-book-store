import { KafkaMessage, KafkaTopicInfo, KafkaConsumerGroup } from '../types/index.js';

interface TopicData {
  name: string;
  description: string;
  partitions: number;
  messages: KafkaMessage[];
  nextOffset: number;
}

class KafkaBrokerService {
  private topics: Map<string, TopicData> = new Map();
  private consumerGroups: Map<string, KafkaConsumerGroup> = new Map();

  constructor() {
    this.initDefaultBrokerState();
  }

  public initDefaultBrokerState(): void {
    this.topics.clear();
    this.consumerGroups.clear();

    // Define core platform topics
    const defaultTopics = [
      {
        name: 'bookstore.orders.created',
        description: 'Emitted when a customer checks out an order. Consumed by Inventory, Notifications, and Fulfillment.',
        partitions: 3
      },
      {
        name: 'bookstore.pricing.updated',
        description: 'Emitted when book prices, bulk CSV tiers, or seasonal discounts change. Consumed by Cache and Search Indexers.',
        partitions: 2
      },
      {
        name: 'bookstore.borrow.events',
        description: 'Emitted when academic books are borrowed, returned, or marked overdue. Consumed by Library Ledger.',
        partitions: 2
      },
      {
        name: 'bookstore.audit.events',
        description: 'Emitted on security, role changes, and compliance actions for immutable ledger recording.',
        partitions: 1
      },
      {
        name: 'bookstore.dlq.poison-pills',
        description: 'Dead-Letter Queue (DLQ) storing unprocessable, malformed, or poisoned messages for QA failure inspection.',
        partitions: 1
      }
    ];

    for (const t of defaultTopics) {
      this.topics.set(t.name, {
        name: t.name,
        description: t.description,
        partitions: t.partitions,
        messages: [],
        nextOffset: 0
      });
    }

    // Seed realistic event history
    this.seedInitialMessages();

    // Initialize standard consumer groups
    this.initConsumerGroups();
  }

  private seedInitialMessages(): void {
    // Seed initial order event
    this.produce(
      'bookstore.orders.created',
      {
        orderId: 'ord_demo_101',
        orderNumber: 'ORD-2026-8801',
        userId: 'usr_009',
        username: 'alice_wong',
        items: [
          { bookId: '1', title: 'Clean Code: A Handbook of Agile Software Craftsmanship', quantity: 1, price: 42.50 }
        ],
        subtotal: 42.50,
        tax: 3.40,
        discount: 0,
        total: 45.90,
        currency: 'USD',
        status: 'processing'
      },
      'usr_009',
      { 'content-type': 'application/json', 'event-version': 'v1.2' }
    );

    // Seed pricing update
    this.produce(
      'bookstore.pricing.updated',
      {
        bookId: '2',
        title: 'The Pragmatic Programmer: 20th Anniversary Edition',
        previousPrice: 49.99,
        newPrice: 44.99,
        changedBy: 'priya_sharma',
        reason: 'Back-to-School Tech Sale'
      },
      'book_2',
      { 'source-service': 'pricing-engine' }
    );

    // Seed borrow event
    this.produce(
      'bookstore.borrow.events',
      {
        borrowId: 'bor_seed_01',
        userId: 'usr_010',
        username: 'bob_johnson',
        bookId: '3',
        bookTitle: 'Design Patterns: Elements of Reusable Object-Oriented Software',
        action: 'BORROW_LOAN_OPENED',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        standardFee: 2.00
      },
      'bor_seed_01'
    );
  }

  private initConsumerGroups(): void {
    const cgDefinitions = [
      {
        groupId: 'inventory-service-cg',
        topic: 'bookstore.orders.created',
        committedOffset: 1,
        status: 'active' as const
      },
      {
        groupId: 'notification-service-cg',
        topic: 'bookstore.orders.created',
        committedOffset: 1,
        status: 'active' as const
      },
      {
        groupId: 'analytics-pipeline-cg',
        topic: 'bookstore.orders.created',
        committedOffset: 0,
        status: 'lagging' as const
      },
      {
        groupId: 'pricing-cache-invalidator-cg',
        topic: 'bookstore.pricing.updated',
        committedOffset: 1,
        status: 'active' as const
      },
      {
        groupId: 'library-ledger-cg',
        topic: 'bookstore.borrow.events',
        committedOffset: 1,
        status: 'active' as const
      }
    ];

    for (const cg of cgDefinitions) {
      const topicData = this.topics.get(cg.topic);
      const latestOffset = topicData ? topicData.nextOffset : 0;
      const lag = Math.max(0, latestOffset - cg.committedOffset);

      this.consumerGroups.set(cg.groupId, {
        groupId: cg.groupId,
        topic: cg.topic,
        committedOffset: cg.committedOffset,
        latestOffset,
        lag,
        status: lag > 2 ? 'lagging' : cg.status,
        lastPolledAt: new Date().toISOString()
      });
    }
  }

  /**
   * Produce an event message to a Kafka topic
   */
  public produce(
    topic: string,
    value: any,
    key: string | null = null,
    headers: Record<string, string> = {}
  ): KafkaMessage {
    let topicData = this.topics.get(topic);
    if (!topicData) {
      topicData = {
        name: topic,
        description: `Dynamically created topic: ${topic}`,
        partitions: 1,
        messages: [],
        nextOffset: 0
      };
      this.topics.set(topic, topicData);
    }

    const partition = topicData.partitions > 1 && key
      ? Math.abs(this.hashCode(key)) % topicData.partitions
      : 0;

    const offset = topicData.nextOffset++;
    const message: KafkaMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      topic,
      partition,
      offset,
      timestamp: new Date().toISOString(),
      key,
      value,
      headers: {
        'x-broker': 'bookstore-kafka-cluster-us-east-1',
        ...headers
      }
    };

    topicData.messages.push(message);

    // Keep memory bounded to last 200 messages per topic
    if (topicData.messages.length > 200) {
      topicData.messages.shift();
    }

    // Refresh lag on subscribed consumer groups
    this.refreshConsumerGroupMetrics(topic);

    return message;
  }

  /**
   * Inject a poison pill into a topic to test DLQ & consumer fault handling
   */
  public injectPoisonPill(
    targetTopic: string = 'bookstore.orders.created',
    failureReason: string = 'MALFORMED_CORRUPTED_PAYLOAD_SCHEMA_VIOLATION'
  ): { poisonMessage: KafkaMessage; dlqMessage: KafkaMessage } {
    // 1. Produce the poison pill to target topic
    const poisonPayload = {
      _poisonPill: true,
      corruptedAt: new Date().toISOString(),
      rawBytes: '0xDEADBEEF_NULL_BYTE_EXPLOIT_TEST',
      errorSimulation: failureReason,
      orderId: null,
      total: -9999.99
    };

    const poisonMessage = this.produce(
      targetTopic,
      poisonPayload,
      'POISON_KEY',
      { 'x-chaos-injection': 'true', 'x-failure-reason': failureReason }
    );

    // 2. Automatically intercept and route to Dead-Letter Queue (DLQ)
    const dlqPayload = {
      dlqId: `dlq_${Date.now()}`,
      originalTopic: targetTopic,
      originalOffset: poisonMessage.offset,
      originalPartition: poisonMessage.partition,
      originalMessageId: poisonMessage.id,
      failedAt: new Date().toISOString(),
      reason: failureReason,
      failedConsumerGroup: 'inventory-service-cg',
      stackTrace: `ConsumerError: SchemaValidationFailed at Consumer.processMessage (${targetTopic}:${poisonMessage.offset})`,
      poisonValue: poisonPayload
    };

    const dlqMessage = this.produce(
      'bookstore.dlq.poison-pills',
      dlqPayload,
      poisonMessage.id,
      { 'x-dlq-routed': 'true', 'x-original-topic': targetTopic }
    );

    return { poisonMessage, dlqMessage };
  }

  /**
   * Replay a dead-letter queue message back to its original destination topic
   */
  public replayDlqMessage(dlqMessageId: string): KafkaMessage | null {
    const dlqTopic = this.topics.get('bookstore.dlq.poison-pills');
    if (!dlqTopic) return null;

    const dlqItem = dlqTopic.messages.find(m => m.id === dlqMessageId);
    if (!dlqItem) return null;

    const originalTopic = dlqItem.value.originalTopic || 'bookstore.orders.created';
    const recoveredPayload = {
      ...dlqItem.value.poisonValue,
      _recoveredFromDlq: true,
      _replayedAt: new Date().toISOString(),
      total: 49.99,
      orderId: `ord_replayed_${Date.now()}`
    };

    return this.produce(
      originalTopic,
      recoveredPayload,
      'REPLAYED_KEY',
      { 'x-replayed-from-dlq': dlqMessageId }
    );
  }

  /**
   * Retrieve all topic summaries
   */
  public getTopics(): KafkaTopicInfo[] {
    return Array.from(this.topics.values()).map(t => ({
      name: t.name,
      partitions: t.partitions,
      messageCount: t.messages.length,
      earliestOffset: t.messages.length > 0 ? t.messages[0].offset : 0,
      latestOffset: t.nextOffset,
      description: t.description
    }));
  }

  /**
   * Retrieve messages from a topic
   */
  public getMessages(topic: string, limit: number = 50, offset?: number): { messages: KafkaMessage[]; total: number } {
    const topicData = this.topics.get(topic);
    if (!topicData) return { messages: [], total: 0 };

    let msgs = [...topicData.messages];
    if (typeof offset === 'number') {
      msgs = msgs.filter(m => m.offset >= offset);
    }
    msgs.sort((a, b) => b.offset - a.offset);

    return {
      messages: msgs.slice(0, limit),
      total: topicData.messages.length
    };
  }

  /**
   * List consumer groups and calculate active lag
   */
  public getConsumerGroups(): KafkaConsumerGroup[] {
    for (const cg of this.consumerGroups.values()) {
      const topicData = this.topics.get(cg.topic);
      if (topicData) {
        cg.latestOffset = topicData.nextOffset;
        cg.lag = Math.max(0, cg.latestOffset - cg.committedOffset);
        cg.status = cg.lag > 2 ? 'lagging' : 'active';
      }
    }
    return Array.from(this.consumerGroups.values());
  }

  /**
   * Commit offset for a consumer group
   */
  public commitOffset(groupId: string, topic: string, offset: number): KafkaConsumerGroup | null {
    let cg = this.consumerGroups.get(groupId);
    const topicData = this.topics.get(topic);
    const latestOffset = topicData ? topicData.nextOffset : offset;

    if (!cg) {
      cg = {
        groupId,
        topic,
        committedOffset: offset,
        latestOffset,
        lag: Math.max(0, latestOffset - offset),
        status: 'active',
        lastPolledAt: new Date().toISOString()
      };
      this.consumerGroups.set(groupId, cg);
    } else {
      cg.committedOffset = offset;
      cg.latestOffset = latestOffset;
      cg.lag = Math.max(0, latestOffset - offset);
      cg.status = cg.lag > 2 ? 'lagging' : 'active';
      cg.lastPolledAt = new Date().toISOString();
    }

    return cg;
  }

  private refreshConsumerGroupMetrics(topicName: string): void {
    const topicData = this.topics.get(topicName);
    if (!topicData) return;

    for (const cg of this.consumerGroups.values()) {
      if (cg.topic === topicName) {
        cg.latestOffset = topicData.nextOffset;
        cg.lag = Math.max(0, cg.latestOffset - cg.committedOffset);
        cg.status = cg.lag > 2 ? 'lagging' : 'active';
      }
    }
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}

export const kafkaBroker = new KafkaBrokerService();
