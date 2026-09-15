import { Router, Request, Response } from 'express';
import { webhookService } from '../services/webhookService.js';

const router = Router();

/**
 * @swagger
 * /api/v1/webhooks/subscriptions:
 *   get:
 *     summary: List all registered webhook subscriptions
 *     tags: [Enterprise Webhooks]
 */
router.get('/subscriptions', (_req: Request, res: Response) => {
  const subscriptions = webhookService.getSubscriptions();
  res.json({
    success: true,
    data: subscriptions
  });
});

/**
 * @swagger
 * /api/v1/webhooks/subscriptions:
 *   post:
 *     summary: Register a new webhook subscription
 *     tags: [Enterprise Webhooks]
 */
router.post('/subscriptions', (req: Request, res: Response) => {
  const { url, events, secret, active, description } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Target URL is required'
    });
  }

  const sub = webhookService.createSubscription({
    url,
    events: events || ['*'],
    secret: secret || '',
    active: active !== false,
    description: description || 'Custom QA Test Webhook'
  });

  res.status(201).json({
    success: true,
    message: 'Webhook subscription created successfully',
    data: sub
  });
});

/**
 * @swagger
 * /api/v1/webhooks/subscriptions/{id}:
 *   put:
 *     summary: Update an existing webhook subscription
 *     tags: [Enterprise Webhooks]
 */
router.put('/subscriptions/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const updated = webhookService.updateSubscription(id, req.body);

  if (!updated) {
    return res.status(404).json({
      success: false,
      error: `Webhook subscription ${id} not found`
    });
  }

  res.json({
    success: true,
    message: 'Webhook subscription updated',
    data: updated
  });
});

/**
 * @swagger
 * /api/v1/webhooks/subscriptions/{id}:
 *   delete:
 *     summary: Delete a webhook subscription
 *     tags: [Enterprise Webhooks]
 */
router.delete('/subscriptions/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const deleted = webhookService.deleteSubscription(id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: `Webhook subscription ${id} not found`
    });
  }

  res.json({
    success: true,
    message: 'Webhook subscription deleted successfully'
  });
});

/**
 * @swagger
 * /api/v1/webhooks/test-ping:
 *   post:
 *     summary: Dispatch a test webhook event to all subscribed endpoints
 *     tags: [Enterprise Webhooks]
 */
router.post('/test-ping', async (req: Request, res: Response) => {
  const { event = 'order:created', customPayload } = req.body || {};

  const payload = customPayload || {
    orderId: `ord_test_${Date.now()}`,
    orderNumber: `ORD-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'paid',
    amount: 89.95,
    currency: 'USD',
    customer: {
      username: 'qa_engineer_tester',
      email: 'qa@itfreesource.internal'
    },
    items: [
      { sku: 'SKU-TECH-001', title: 'Clean Architecture in Practice', qty: 2, price: 44.97 }
    ]
  };

  const deliveries = await webhookService.dispatch(event, payload);

  res.json({
    success: true,
    message: `Test ping dispatched for event '${event}'`,
    deliveriesCount: deliveries.length,
    data: deliveries
  });
});

/**
 * @swagger
 * /api/v1/webhooks/deliveries:
 *   get:
 *     summary: List webhook delivery audit logs
 *     tags: [Enterprise Webhooks]
 */
router.get('/deliveries', (req: Request, res: Response) => {
  const subId = req.query.subscriptionId as string | undefined;
  const deliveries = webhookService.getDeliveries(subId);

  res.json({
    success: true,
    count: deliveries.length,
    data: deliveries
  });
});

/**
 * @swagger
 * /api/v1/webhooks/deliveries/{id}/redeliver:
 *   post:
 *     summary: Redeliver a past webhook event
 *     tags: [Enterprise Webhooks]
 */
router.post('/deliveries/:id/redeliver', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const delivery = await webhookService.redeliver(id);

  if (!delivery) {
    return res.status(404).json({
      success: false,
      error: `Delivery ${id} not found or subscription inactive`
    });
  }

  res.json({
    success: true,
    message: 'Webhook redelivery completed',
    data: delivery
  });
});

/**
 * @swagger
 * /api/v1/webhooks/mock-receiver:
 *   post:
 *     summary: Built-in Mock Webhook Receiver Sandbox (validates HMAC and logs event)
 *     tags: [Enterprise Webhooks]
 */
router.post('/mock-receiver', (req: Request, res: Response) => {
  const chaos = webhookService.getMockChaos();
  if (chaos.shouldFail) {
    return res.status(chaos.statusCode).json({
      success: false,
      error: 'Simulated webhook receiver internal server error (Chaos Lab)'
    });
  }

  const sigHeader = (req.headers['x-bookstore-signature'] as string) || '';
  const eventName = (req.headers['x-bookstore-event'] as string) || 'unknown';
  const deliveryId = (req.headers['x-bookstore-delivery'] as string) || `del_${Date.now()}`;

  // Default mock secret verification
  const isValid = webhookService.verifyHmac('whsec_itfreesource_test_secret_2026', req.body, sigHeader);

  webhookService.recordMockEvent({
    id: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    receivedAt: new Date().toISOString(),
    event: eventName,
    deliveryId,
    signature: sigHeader,
    isValidSignature: isValid,
    headers: req.headers as Record<string, string>,
    payload: req.body
  });

  res.status(200).json({
    success: true,
    message: 'Webhook received and processed by mock sandbox',
    verified: isValid,
    deliveryId
  });
});

/**
 * @swagger
 * /api/v1/webhooks/mock-receiver/events:
 *   get:
 *     summary: Get captured webhook events from the built-in mock receiver
 *     tags: [Enterprise Webhooks]
 */
router.get('/mock-receiver/events', (_req: Request, res: Response) => {
  const events = webhookService.getMockEvents();
  res.json({
    success: true,
    count: events.length,
    data: events
  });
});

/**
 * @swagger
 * /api/v1/webhooks/mock-receiver/chaos:
 *   post:
 *     summary: Toggle Chaos failure simulation on the mock receiver (e.g. 500 error for retry testing)
 *     tags: [Enterprise Webhooks]
 */
router.post('/mock-receiver/chaos', (req: Request, res: Response) => {
  const { shouldFail = false, statusCode = 500 } = req.body || {};
  webhookService.setMockChaos(Boolean(shouldFail), Number(statusCode));

  res.json({
    success: true,
    message: `Mock receiver chaos updated: shouldFail=${shouldFail}, statusCode=${statusCode}`,
    chaos: webhookService.getMockChaos()
  });
});

/**
 * @swagger
 * /api/v1/webhooks/verify-signature:
 *   post:
 *     summary: Verify HMAC-SHA256 signature of a payload
 *     tags: [Enterprise Webhooks]
 */
router.post('/verify-signature', (req: Request, res: Response) => {
  const { secret, payload, signature } = req.body;

  if (!secret || payload === undefined || !signature) {
    return res.status(400).json({
      success: false,
      error: 'Missing secret, payload, or signature in request body'
    });
  }

  const isValid = webhookService.verifyHmac(secret, payload, signature);
  const computed = webhookService.generateSignature(secret, payload);

  res.json({
    success: true,
    isValid,
    computedSignature: `sha256=${computed}`,
    providedSignature: signature
  });
});

/**
 * @swagger
 * /api/v1/webhooks/reset:
 *   post:
 *     summary: Reset webhooks to initial defaults
 *     tags: [Enterprise Webhooks]
 */
router.post('/reset', (_req: Request, res: Response) => {
  webhookService.initDefaultSubscriptions();
  res.json({
    success: true,
    message: 'Webhooks subscriptions, deliveries, and mock receiver reset to initial defaults.'
  });
});

export default router;
