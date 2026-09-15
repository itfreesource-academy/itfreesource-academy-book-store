import { describe, it, expect, beforeEach } from 'vitest';
import { webhookService } from '../services/webhookService.js';

describe('Enterprise Webhook Dispatcher & Verification Engine', () => {
  beforeEach(() => {
    webhookService.initDefaultSubscriptions();
  });

  it('should initialize with built-in default mock receiver subscription', () => {
    const subs = webhookService.getSubscriptions();
    expect(subs.length).toBeGreaterThan(0);

    const mockSub = subs.find(s => s.id === 'wh_sub_mock_receiver');
    expect(mockSub).toBeDefined();
    expect(mockSub?.active).toBe(true);
    expect(mockSub?.secret).toBe('whsec_itfreesource_test_secret_2026');
  });

  it('should accurately compute and verify HMAC-SHA256 signatures', () => {
    const secret = 'whsec_secret_key_123';
    const payload = { event: 'order:created', total: 49.99 };

    const signatureHex = webhookService.generateSignature(secret, payload);
    expect(signatureHex).toBeDefined();
    expect(signatureHex.length).toBe(64); // SHA-256 hex is 64 characters

    // Verify correct signature
    const isValid = webhookService.verifyHmac(secret, payload, `sha256=${signatureHex}`);
    expect(isValid).toBe(true);

    // Reject forged / tampered signature
    const isTamperedValid = webhookService.verifyHmac(secret, payload, 'sha256=tampered_signature_hex_00000000000000000000000000000000000000000000');
    expect(isTamperedValid).toBe(false);

    // Reject tampered payload
    const isPayloadTamperedValid = webhookService.verifyHmac(secret, { ...payload, total: 1000.00 }, `sha256=${signatureHex}`);
    expect(isPayloadTamperedValid).toBe(false);
  });

  it('should dispatch an event to the mock receiver and record delivery logs', async () => {
    const payload = {
      orderId: 'ord_auto_999',
      customer: 'automation_tester',
      amount: 75.00
    };

    const deliveries = await webhookService.dispatch('order:created', payload);
    expect(deliveries.length).toBeGreaterThan(0);

    const delivery = deliveries[0];
    expect(delivery.statusCode).toBe(200);
    expect(delivery.status).toBe('delivered');
    expect(delivery.signature).toMatch(/^sha256=[a-f0-9]{64}$/);
    expect(typeof delivery.latencyMs).toBe('number');

    // Confirm delivery log appears in audit history
    const allDeliveries = webhookService.getDeliveries();
    expect(allDeliveries.some(d => d.id === delivery.id)).toBe(true);

    // Confirm mock receiver captured the event
    const mockEvents = webhookService.getMockEvents();
    expect(mockEvents.some(m => m.deliveryId === delivery.id)).toBe(true);
  });

  it('should support registering, updating, and deleting custom webhook subscriptions', () => {
    // Create
    const newSub = webhookService.createSubscription({
      url: 'https://webhook.site/test-uuid-1234',
      events: ['order:created', 'inventory:low_stock'],
      secret: 'whsec_custom_123',
      active: true,
      description: 'External Monitoring Endpoint'
    });

    expect(newSub.id).toBeDefined();
    expect(webhookService.getSubscription(newSub.id)).toBeDefined();

    // Update
    const updated = webhookService.updateSubscription(newSub.id, { active: false });
    expect(updated?.active).toBe(false);

    // Delete
    const deleted = webhookService.deleteSubscription(newSub.id);
    expect(deleted).toBe(true);
    expect(webhookService.getSubscription(newSub.id)).toBeUndefined();
  });

  it('should record failure when mock receiver chaos injection is enabled', async () => {
    // Enable simulated 500 receiver outage
    webhookService.setMockChaos(true, 503);

    const deliveries = await webhookService.dispatch('order:created', { test: 'chaos' });
    expect(deliveries.length).toBeGreaterThan(0);

    const failedDelivery = deliveries[0];
    expect(failedDelivery.statusCode).toBe(503);
    expect(failedDelivery.status).toBe('failed');
    expect(failedDelivery.error).toContain('503');

    // Restore chaos
    webhookService.setMockChaos(false, 500);
  });

  it('should redeliver a past delivery attempt', async () => {
    const initialDeliveries = await webhookService.dispatch('borrow:created', { bookId: '10' });
    const pastDelivery = initialDeliveries[0];

    const redelivered = await webhookService.redeliver(pastDelivery.id);
    expect(redelivered).not.toBeNull();
    expect(redelivered?.attempts).toBe(pastDelivery.attempts + 1);
  });
});
