import crypto from 'crypto';
import { WebhookSubscription, WebhookDelivery, MockWebhookEvent } from '../types/index.js';

class WebhookService {
  private subscriptions: Map<string, WebhookSubscription> = new Map();
  private deliveries: WebhookDelivery[] = [];
  private mockEvents: MockWebhookEvent[] = [];
  private mockReceiverChaos = { shouldFail: false, statusCode: 500 };

  constructor() {
    this.initDefaultSubscriptions();
  }

  public initDefaultSubscriptions(): void {
    this.subscriptions.clear();
    this.deliveries = [];
    this.mockEvents = [];
    this.mockReceiverChaos = { shouldFail: false, statusCode: 500 };

    // Register built-in default subscription for instant out-of-the-box testing
    const defaultSub: WebhookSubscription = {
      id: 'wh_sub_mock_receiver',
      url: 'http://localhost:5000/api/v1/webhooks/mock-receiver',
      events: ['*'],
      secret: 'whsec_itfreesource_test_secret_2026',
      active: true,
      description: 'Built-in Academy Mock Webhook Receiver Sandbox (captures signatures & payloads)',
      createdAt: new Date().toISOString()
    };
    this.subscriptions.set(defaultSub.id, defaultSub);

    // Seed realistic delivery log
    this.seedInitialDelivery();
  }

  private seedInitialDelivery(): void {
    const payload = {
      event: 'order:created',
      timestamp: new Date().toISOString(),
      data: {
        orderId: 'ord_demo_101',
        orderNumber: 'ORD-2026-8801',
        customer: 'alice_wong',
        total: 45.90,
        currency: 'USD'
      }
    };
    const signature = this.generateSignature('whsec_itfreesource_test_secret_2026', payload);

    this.deliveries.push({
      id: 'del_seed_001',
      subscriptionId: 'wh_sub_mock_receiver',
      url: 'http://localhost:5000/api/v1/webhooks/mock-receiver',
      event: 'order:created',
      payload,
      signature: `sha256=${signature}`,
      statusCode: 200,
      status: 'delivered',
      attempts: 1,
      latencyMs: 38,
      responseBody: JSON.stringify({ received: true, verified: true }),
      timestamp: new Date(Date.now() - 360000).toISOString()
    });

    this.mockEvents.push({
      id: 'mock_evt_seed_001',
      receivedAt: new Date(Date.now() - 360000).toISOString(),
      event: 'order:created',
      deliveryId: 'del_seed_001',
      signature: `sha256=${signature}`,
      isValidSignature: true,
      headers: {
        'x-bookstore-signature': `sha256=${signature}`,
        'x-bookstore-event': 'order:created',
        'x-bookstore-delivery': 'del_seed_001'
      },
      payload
    });
  }

  /**
   * Compute HMAC-SHA256 signature for payload
   */
  public generateSignature(secret: string, payload: any): string {
    const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return crypto
      .createHmac('sha256', secret)
      .update(serialized)
      .digest('hex');
  }

  /**
   * Verify HMAC-SHA256 signature
   */
  public verifyHmac(secret: string, payload: any, signatureHeader: string): boolean {
    if (!signatureHeader) return false;
    const cleanSig = signatureHeader.startsWith('sha256=')
      ? signatureHeader.slice(7)
      : signatureHeader;

    const expected = this.generateSignature(secret, payload);
    try {
      return crypto.timingSafeEqual(
        Buffer.from(cleanSig, 'utf-8'),
        Buffer.from(expected, 'utf-8')
      );
    } catch {
      return false;
    }
  }

  /**
   * Dispatch an event to all matching subscriptions
   */
  public async dispatch(event: string, data: any): Promise<WebhookDelivery[]> {
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data
    };

    const targetSubs = Array.from(this.subscriptions.values()).filter(sub => {
      if (!sub.active) return false;
      return sub.events.includes('*') || sub.events.includes(event);
    });

    const deliveries: WebhookDelivery[] = [];
    for (const sub of targetSubs) {
      const delivery = await this.deliverToSubscription(sub, event, payload);
      deliveries.push(delivery);
    }

    return deliveries;
  }

  /**
   * Deliver payload to a specific subscription with retry logic
   */
  private async deliverToSubscription(
    sub: WebhookSubscription,
    event: string,
    payload: any,
    attempt: number = 1
  ): Promise<WebhookDelivery> {
    const deliveryId = `del_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const signatureHex = this.generateSignature(sub.secret, payload);
    const signatureHeader = `sha256=${signatureHex}`;

    const startTime = Date.now();
    let statusCode = 0;
    let responseBody = '';
    let status: 'delivered' | 'failed' | 'retrying' = 'failed';
    let errorMessage: string | undefined;

    // Check if target is internal mock receiver
    if (sub.url.includes('/api/v1/webhooks/mock-receiver')) {
      if (this.mockReceiverChaos.shouldFail) {
        statusCode = this.mockReceiverChaos.statusCode;
        responseBody = JSON.stringify({ error: 'Chaos injection simulated webhook receiver outage' });
        status = 'failed';
        errorMessage = `HTTP ${statusCode}: Target returned failure response`;
      } else {
        statusCode = 200;
        responseBody = JSON.stringify({ received: true, verified: true });
        status = 'delivered';

        this.recordMockEvent({
          id: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          receivedAt: new Date().toISOString(),
          event,
          deliveryId,
          signature: signatureHeader,
          isValidSignature: true,
          headers: {
            'x-bookstore-signature': signatureHeader,
            'x-bookstore-event': event,
            'x-bookstore-delivery': deliveryId,
            'content-type': 'application/json'
          },
          payload
        });
      }
    } else {
      // Outbound external HTTP POST
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(sub.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-BookStore-Signature': signatureHeader,
            'X-BookStore-Event': event,
            'X-BookStore-Delivery': deliveryId,
            'User-Agent': 'ITFreeSource-Academy-Webhook-Dispatcher/1.0'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        statusCode = res.status;
        responseBody = await res.text().catch(() => '');
        status = res.ok ? 'delivered' : 'failed';
        if (!res.ok) {
          errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        }
      } catch (err: any) {
        statusCode = 0;
        status = 'failed';
        errorMessage = err.message || 'Network connection failed';
      }
    }

    const latencyMs = Date.now() - startTime;

    const deliveryRecord: WebhookDelivery = {
      id: deliveryId,
      subscriptionId: sub.id,
      url: sub.url,
      event,
      payload,
      signature: signatureHeader,
      statusCode,
      status,
      attempts: attempt,
      latencyMs,
      responseBody: responseBody.slice(0, 500),
      error: errorMessage,
      timestamp: new Date().toISOString()
    };

    this.deliveries.unshift(deliveryRecord);
    if (this.deliveries.length > 200) {
      this.deliveries.pop();
    }

    return deliveryRecord;
  }

  public recordMockEvent(evt: MockWebhookEvent): void {
    this.mockEvents.unshift(evt);
    if (this.mockEvents.length > 100) {
      this.mockEvents.pop();
    }
  }

  public getSubscriptions(): WebhookSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  public getSubscription(id: string): WebhookSubscription | undefined {
    return this.subscriptions.get(id);
  }

  public createSubscription(
    data: Omit<WebhookSubscription, 'id' | 'createdAt'>
  ): WebhookSubscription {
    const id = `wh_sub_${Date.now().toString(36)}`;
    const sub: WebhookSubscription = {
      id,
      url: data.url,
      events: data.events && data.events.length > 0 ? data.events : ['*'],
      secret: data.secret || `whsec_${crypto.randomBytes(16).toString('hex')}`,
      active: data.active !== false,
      description: data.description || 'Custom QA Test Webhook Endpoint',
      createdAt: new Date().toISOString()
    };
    this.subscriptions.set(id, sub);
    return sub;
  }

  public updateSubscription(
    id: string,
    updates: Partial<WebhookSubscription>
  ): WebhookSubscription | null {
    const existing = this.subscriptions.get(id);
    if (!existing) return null;

    const updated: WebhookSubscription = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt
    };
    this.subscriptions.set(id, updated);
    return updated;
  }

  public deleteSubscription(id: string): boolean {
    return this.subscriptions.delete(id);
  }

  public getDeliveries(subscriptionId?: string): WebhookDelivery[] {
    if (subscriptionId) {
      return this.deliveries.filter(d => d.subscriptionId === subscriptionId);
    }
    return this.deliveries;
  }

  public getDelivery(id: string): WebhookDelivery | undefined {
    return this.deliveries.find(d => d.id === id);
  }

  public async redeliver(deliveryId: string): Promise<WebhookDelivery | null> {
    const past = this.deliveries.find(d => d.id === deliveryId);
    if (!past) return null;

    const sub = this.subscriptions.get(past.subscriptionId);
    if (!sub) return null;

    return this.deliverToSubscription(sub, past.event, past.payload, past.attempts + 1);
  }

  public getMockEvents(): MockWebhookEvent[] {
    return this.mockEvents;
  }

  public clearMockEvents(): void {
    this.mockEvents = [];
  }

  public setMockChaos(shouldFail: boolean, statusCode: number = 500): void {
    this.mockReceiverChaos = { shouldFail, statusCode };
  }

  public getMockChaos(): { shouldFail: boolean; statusCode: number } {
    return this.mockReceiverChaos;
  }
}

export const webhookService = new WebhookService();
