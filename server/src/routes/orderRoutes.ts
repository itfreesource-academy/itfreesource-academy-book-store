import { Router, Response } from 'express';
import { store } from '../data/store.js';
import { authenticateToken, requirePermission, AuthenticatedRequest } from '../middleware/auth.js';
import { ROLE_PERMISSIONS, OrderStatus } from '../types/index.js';
import { kafkaBroker } from '../services/kafkaBroker.js';
import { webhookService } from '../services/webhookService.js';

const router = Router();

// GET /api/v1/orders
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const userPerms = ROLE_PERMISSIONS[user.role] || [];
  const canReadAll = userPerms.includes('orders:read_all');

  const orders = store.getOrders(user.id, canReadAll);
  res.json({ success: true, orders });
});

// GET /api/v1/orders/:id
router.get('/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const id = req.params.id as string;
  const order = store.getOrderById(id);
  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found.' });
    return;
  }

  const user = req.user!;
  const userPerms = ROLE_PERMISSIONS[user.role] || [];
  const canReadAll = userPerms.includes('orders:read_all');

  if (!canReadAll && order.userId !== user.id) {
    res.status(403).json({ success: false, error: 'Forbidden: You cannot access other users’ orders.' });
    return;
  }

  res.json({ success: true, order });
});

// POST /api/v1/orders (Create Order / Checkout)
router.post('/', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  const { items, shippingAddress, deliveryDate, paymentMethod } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ success: false, error: 'Cart must contain at least one item.' });
    return;
  }

  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street) {
    res.status(400).json({ success: false, error: 'Complete shipping address is required.' });
    return;
  }

  // Calculate totals
  let subtotal = 0;
  const verifiedItems = items.map((item: any) => {
    const book = store.getBookById(item.bookId);
    const price = book ? book.price : item.price || 0;
    subtotal += price * (item.quantity || 1);
    return {
      bookId: item.bookId,
      title: book ? book.title : item.title,
      price,
      quantity: item.quantity || 1,
      coverImage: book ? book.coverImage : item.coverImage
    };
  });

  // Calculate VIP Discount if applicable
  const userPerms = ROLE_PERMISSIONS[user.role] || [];
  const hasVipDiscount = userPerms.includes('discount:vip');
  const discount = hasVipDiscount ? parseFloat((subtotal * 0.20).toFixed(2)) : 0;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = parseFloat((taxableAmount * 0.08).toFixed(2));
  const total = parseFloat((taxableAmount + tax).toFixed(2));

  const newOrder = store.createOrder({
    userId: user.id,
    username: user.username,
    items: verifiedItems,
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount,
    tax,
    total,
    shippingAddress,
    deliveryDate: deliveryDate || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    paymentMethod: paymentMethod || 'Credit Card (Sandbox)',
    status: 'pending'
  });

  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    username: user.username,
    role: user.role,
    action: 'ORDER_PLACED',
    entity: 'Order',
    entityId: newOrder.id,
    details: `Placed order ${newOrder.orderNumber} for $${newOrder.total} (${verifiedItems.length} items). VIP discount: $${discount}`,
    ipAddress: (req.ip as string) || '127.0.0.1'
  });

  // Asynchronous Kafka Event Streaming
  kafkaBroker.produce(
    'bookstore.orders.created',
    {
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      userId: newOrder.userId,
      username: newOrder.username,
      items: newOrder.items,
      subtotal: newOrder.subtotal,
      tax: newOrder.tax,
      discount: newOrder.discount,
      total: newOrder.total,
      shippingAddress: newOrder.shippingAddress,
      paymentMethod: newOrder.paymentMethod,
      status: newOrder.status
    },
    newOrder.userId,
    { 'event-type': 'ORDER_CREATED', 'x-source': 'orders-service' }
  );

  // Asynchronous Webhook Dispatch
  webhookService.dispatch('order:created', {
    orderId: newOrder.id,
    orderNumber: newOrder.orderNumber,
    customer: newOrder.username,
    total: newOrder.total,
    currency: 'USD',
    status: newOrder.status,
    itemsCount: newOrder.items.length
  }).catch(() => {});

  res.status(201).json({ success: true, order: newOrder });
});

// PATCH /api/v1/orders/:id/status (Requires orders:update_status)
router.patch('/:id/status', authenticateToken, requirePermission('orders:update_status'), (req: AuthenticatedRequest, res: Response): void => {
  const id = req.params.id as string;
  const { status, trackingNumber } = req.body;

  const validStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({ success: false, error: `Invalid status. Must be one of: [${validStatuses.join(', ')}]` });
    return;
  }

  const updated = store.updateOrderStatus(id, status, trackingNumber);
  if (!updated) {
    res.status(404).json({ success: false, error: 'Order not found.' });
    return;
  }

  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: req.user!.id,
    username: req.user!.username,
    role: req.user!.role,
    action: 'ORDER_STATUS_UPDATE',
    entity: 'Order',
    entityId: id,
    details: `Updated order ${updated.orderNumber} status to "${status}". Tracking: ${trackingNumber || 'N/A'}`,
    ipAddress: (req.ip as string) || '127.0.0.1'
  });

  kafkaBroker.produce(
    'bookstore.orders.created',
    {
      orderId: updated.id,
      orderNumber: updated.orderNumber,
      status: updated.status,
      trackingNumber: updated.trackingNumber,
      action: 'ORDER_STATUS_CHANGED'
    },
    updated.userId,
    { 'event-type': 'ORDER_STATUS_UPDATED' }
  );

  webhookService.dispatch('order:status_changed', {
    orderId: updated.id,
    orderNumber: updated.orderNumber,
    newStatus: updated.status,
    trackingNumber: updated.trackingNumber,
    updatedAt: new Date().toISOString()
  }).catch(() => {});

  res.json({ success: true, order: updated });
});

// POST /api/v1/orders/:id/cancel
router.post('/:id/cancel', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const id = req.params.id as string;
  const order = store.getOrderById(id);

  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found.' });
    return;
  }

  const user = req.user!;
  const userPerms = ROLE_PERMISSIONS[user.role] || [];
  const canCancelAny = userPerms.includes('orders:cancel');

  if (!canCancelAny && order.userId !== user.id) {
    res.status(403).json({ success: false, error: 'Forbidden: You cannot cancel another customer’s order.' });
    return;
  }

  if (['shipped', 'delivered', 'refunded'].includes(order.status)) {
    res.status(400).json({
      success: false,
      error: `Cannot cancel an order that is already in '${order.status}' status.`
    });
    return;
  }

  const updated = store.updateOrderStatus(id, 'cancelled');

  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    username: user.username,
    role: user.role,
    action: 'ORDER_CANCELLED',
    entity: 'Order',
    entityId: id,
    details: `Order ${order.orderNumber} was cancelled by ${user.username}.`,
    ipAddress: (req.ip as string) || '127.0.0.1'
  });

  webhookService.dispatch('order:cancelled', {
    orderId: updated?.id || id,
    orderNumber: order.orderNumber,
    cancelledBy: user.username,
    cancelledAt: new Date().toISOString()
  }).catch(() => {});

  res.json({ success: true, order: updated });
});

// POST /api/v1/orders/:id/refund (Requires orders:refund)
router.post('/:id/refund', authenticateToken, requirePermission('orders:refund'), (req: AuthenticatedRequest, res: Response): void => {
  const id = req.params.id as string;
  const order = store.getOrderById(id);

  if (!order) {
    res.status(404).json({ success: false, error: 'Order not found.' });
    return;
  }

  const updated = store.updateOrderStatus(id, 'refunded');

  store.addAuditLog({
    id: `aud_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    userId: req.user!.id,
    username: req.user!.username,
    role: req.user!.role,
    action: 'ORDER_REFUNDED',
    entity: 'Order',
    entityId: id,
    details: `Issued full refund of $${order.total} for order ${order.orderNumber}.`,
    ipAddress: (req.ip as string) || '127.0.0.1'
  });

  res.json({ success: true, order: updated });
});

export default router;
