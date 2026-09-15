import { Router, Request, Response } from 'express';
import { kafkaBroker } from '../services/kafkaBroker.js';

const router = Router();

/**
 * @swagger
 * /api/v1/kafka/topics:
 *   get:
 *     summary: List all Kafka topics, partition counts, and latest offsets
 *     tags: [Kafka Event Streaming]
 *     responses:
 *       200:
 *         description: List of active topics
 */
router.get('/topics', (_req: Request, res: Response) => {
  const topics = kafkaBroker.getTopics();
  res.json({
    success: true,
    data: topics,
    cluster: {
      clusterId: 'itfreesource-kafka-cluster-01',
      brokerCount: 3,
      status: 'healthy'
    }
  });
});

/**
 * @swagger
 * /api/v1/kafka/topics/{topic}/messages:
 *   get:
 *     summary: Stream messages from a specific Kafka topic
 *     tags: [Kafka Event Streaming]
 *     parameters:
 *       - in: path
 *         name: topic
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 */
router.get('/topics/:topic/messages', (req: Request, res: Response) => {
  const topic = req.params.topic as string;
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = req.query.offset !== undefined ? parseInt(req.query.offset as string) : undefined;

  const result = kafkaBroker.getMessages(topic, limit, offset);
  res.json({
    success: true,
    topic,
    totalMessages: result.total,
    count: result.messages.length,
    data: result.messages
  });
});

/**
 * @swagger
 * /api/v1/kafka/produce:
 *   post:
 *     summary: Publish an event message to a Kafka topic
 *     tags: [Kafka Event Streaming]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [topic, value]
 *             properties:
 *               topic:
 *                 type: string
 *               value:
 *                 type: object
 *               key:
 *                 type: string
 *               headers:
 *                 type: object
 */
router.post('/produce', (req: Request, res: Response) => {
  const { topic, value, key, headers } = req.body;
  if (!topic || value === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters: topic and value are required.'
    });
  }

  const message = kafkaBroker.produce(topic, value, key || null, headers || {});
  res.status(201).json({
    success: true,
    message: `Message produced to topic ${topic} at offset ${message.offset}`,
    data: message
  });
});

/**
 * @swagger
 * /api/v1/kafka/consumer-groups:
 *   get:
 *     summary: List consumer groups, committed offsets, and consumer lag
 *     tags: [Kafka Event Streaming]
 */
router.get('/consumer-groups', (_req: Request, res: Response) => {
  const consumerGroups = kafkaBroker.getConsumerGroups();
  res.json({
    success: true,
    data: consumerGroups
  });
});

/**
 * @swagger
 * /api/v1/kafka/consumer-groups/{groupId}/commit:
 *   post:
 *     summary: Manually commit offset for a consumer group (testing lag reduction)
 *     tags: [Kafka Event Streaming]
 */
router.post('/consumer-groups/:groupId/commit', (req: Request, res: Response) => {
  const groupId = req.params.groupId as string;
  const { topic, offset } = req.body;

  if (!topic || typeof offset !== 'number') {
    return res.status(400).json({
      success: false,
      error: 'Missing topic or numeric offset in request body'
    });
  }

  const updated = kafkaBroker.commitOffset(groupId, topic, offset);
  res.json({
    success: true,
    message: `Offset committed for ${groupId} on topic ${topic}`,
    data: updated
  });
});

/**
 * @swagger
 * /api/v1/kafka/chaos/poison-pill:
 *   post:
 *     summary: Inject a malformed poison pill message to trigger consumer failure & DLQ routing
 *     tags: [Kafka Event Streaming]
 */
router.post('/chaos/poison-pill', (req: Request, res: Response) => {
  const { topic = 'bookstore.orders.created', reason = 'PAYLOAD_SCHEMA_VIOLATION_POISON_PILL' } = req.body || {};
  const result = kafkaBroker.injectPoisonPill(topic, reason);

  res.status(201).json({
    success: true,
    message: `Poison pill injected into ${topic} and automatically intercepted by Dead-Letter Queue (DLQ)`,
    data: result
  });
});

/**
 * @swagger
 * /api/v1/kafka/dlq/replay:
 *   post:
 *     summary: Replay a message from Dead-Letter Queue back to destination topic
 *     tags: [Kafka Event Streaming]
 */
router.post('/dlq/replay', (req: Request, res: Response) => {
  const { dlqMessageId } = req.body;
  if (!dlqMessageId) {
    return res.status(400).json({
      success: false,
      error: 'Missing dlqMessageId in request body'
    });
  }

  const replayed = kafkaBroker.replayDlqMessage(dlqMessageId);
  if (!replayed) {
    return res.status(404).json({
      success: false,
      error: `DLQ message ${dlqMessageId} not found`
    });
  }

  res.json({
    success: true,
    message: `Message replayed successfully from DLQ to ${replayed.topic}`,
    data: replayed
  });
});

/**
 * @swagger
 * /api/v1/kafka/reset:
 *   post:
 *     summary: Reset Kafka cluster state and re-seed default messages
 *     tags: [Kafka Event Streaming]
 */
router.post('/reset', (_req: Request, res: Response) => {
  kafkaBroker.initDefaultBrokerState();
  res.json({
    success: true,
    message: 'Kafka broker state and consumer groups reset to initial defaults.'
  });
});

export default router;
