import React, { useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '../types/index.js';
import { apiClient } from '../api/client.js';
import { Breadcrumbs } from '../components/common/Breadcrumbs.js';
import { DateRangePicker } from '../components/common/DateRangePicker.js';
import { Modal } from '../components/common/Modal.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { useCurrency } from '../context/CurrencyContext.js';
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  Eye,
  AlertCircle
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Transition status modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [targetOrder, setTargetOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('processing');
  const [trackingNumber, setTrackingNumber] = useState('');

  const { user, hasPermission } = useAuth();
  const { addToast } = useToast();
  const { formatPrice } = useCurrency();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/orders');
      setOrders(res.data.orders || []);
    } catch (err: any) {
      addToast(err.message || 'Failed to load orders.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async () => {
    if (!targetOrder) return;
    try {
      await apiClient.patch(`/orders/${targetOrder.id}/status`, {
        status: newStatus,
        trackingNumber: trackingNumber || undefined
      });
      addToast(`Order ${targetOrder.orderNumber} status updated to ${newStatus}.`, 'success');
      setIsStatusModalOpen(false);
      fetchOrders();
    } catch (err: any) {
      addToast(err.message || 'Status update failed.', 'error');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await apiClient.post(`/orders/${orderId}/cancel`);
      addToast('Order cancelled successfully.', 'info');
      fetchOrders();
    } catch (err: any) {
      addToast(err.message || 'Failed to cancel order.', 'error');
    }
  };

  const handleRefundOrder = async (orderId: string) => {
    if (!confirm('Issue full refund for this order?')) return;
    try {
      await apiClient.post(`/orders/${orderId}/refund`);
      addToast('Order refunded successfully.', 'success');
      fetchOrders();
    } catch (err: any) {
      addToast(err.message || 'Failed to refund order.', 'error');
    }
  };

  // Filter orders by status & date range
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (startDate && o.createdAt.split('T')[0] < startDate) return false;
    if (endDate && o.createdAt.split('T')[0] > endDate) return false;
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    const map = {
      pending: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
      processing: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
      shipped: 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60',
      delivered: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
      cancelled: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
      refunded: 'bg-purple-950/60 text-purple-300 border-purple-800/60'
    };
    return (
      <span
        data-testid={`order-status-badge-${status}`}
        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${map[status]}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-16" data-testid="orders-page">
      <Breadcrumbs items={[{ label: 'Orders' }]} />

      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white" data-testid="orders-page-title">
            Order Management & Tracking
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {hasPermission('orders:read_all')
              ? 'Viewing all system orders (Store Management & Fulfillment scope)'
              : 'Viewing your personal account purchase history'}
          </p>
        </div>

        {/* Date Range Picker Filter */}
        <div className="max-w-md w-full">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onRangeChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
            label="Filter Orders by Date"
            testId="orders-date-range"
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2" data-testid="status-filter-tabs">
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            data-testid={`status-tab-${st}`}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
              statusFilter === st
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center" data-testid="no-orders-found">
            <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-400">No matching orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300" data-testid="orders-table">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-4 px-4">Order #</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Items</th>
                  <th className="py-4 px-4">Total</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800" data-testid="orders-table-body">
                {filteredOrders.map((order) => (
                  <tr key={order.id} data-testid={`order-row-${order.id}`} className="hover:bg-slate-800/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-white" data-testid={`order-num-${order.id}`}>
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-300">
                      @{order.username}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-200">{order.items.length} items</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white" data-testid={`order-total-${order.id}`}>
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDetailModalOpen(true);
                          }}
                          data-testid={`order-view-btn-${order.id}`}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Order Fulfillment Status Transition Trigger */}
                        {hasPermission('orders:update_status') && !['cancelled', 'refunded'].includes(order.status) && (
                          <button
                            onClick={() => {
                              setTargetOrder(order);
                              setNewStatus(order.status);
                              setTrackingNumber(order.trackingNumber || '');
                              setIsStatusModalOpen(true);
                            }}
                            data-testid={`order-status-btn-${order.id}`}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-950/50 rounded-lg transition-colors"
                            title="Update Status"
                          >
                            <Truck className="w-4 h-4" />
                          </button>
                        )}

                        {/* Support Agent Refund Action */}
                        {hasPermission('orders:refund') && order.status !== 'refunded' && (
                          <button
                            onClick={() => handleRefundOrder(order.id)}
                            data-testid={`order-refund-btn-${order.id}`}
                            className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-purple-950/50 rounded-lg transition-colors"
                            title="Issue Refund"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}

                        {/* Customer / Admin Cancel Action */}
                        {!['shipped', 'delivered', 'cancelled', 'refunded'].includes(order.status) && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            data-testid={`order-cancel-btn-${order.id}`}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors"
                            title="Cancel Order"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Order: ${selectedOrder.orderNumber}`}
          testId="order-detail-modal"
          footer={
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700"
            >
              Close
            </button>
          }
        >
          <div className="space-y-4 text-xs text-slate-200">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 block mb-0.5">Status</span>
                <div>{getStatusBadge(selectedOrder.status)}</div>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Tracking Number</span>
                <span className="font-semibold text-slate-200">{selectedOrder.trackingNumber || 'Awaiting Dispatch'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Expected Delivery</span>
                <span className="font-semibold text-slate-200">{selectedOrder.deliveryDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Payment Method</span>
                <span className="font-semibold text-slate-200">{selectedOrder.paymentMethod}</span>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-white mb-2">Purchased Items</h5>
              <div className="divide-y divide-slate-800">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={it.coverImage} alt={it.title} className="w-8 h-11 object-cover rounded shadow-sm border border-slate-800" />
                      <div>
                        <h6 className="font-bold text-white">{it.title}</h6>
                        <span className="text-slate-400">Qty: {it.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-white">{formatPrice(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between font-black text-sm">
              <span className="text-slate-300">Total Paid:</span>
              <span className="text-indigo-400">{formatPrice(selectedOrder.total)}</span>
            </div>
          </div>
        </Modal>
      )}

      {/* Order Status Transition Modal (Requires orders:update_status) */}
      {targetOrder && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={`Update Order Status: ${targetOrder.orderNumber}`}
          testId="status-transition-modal"
          footer={
            <>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold rounded-lg hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                data-testid="status-confirm-btn"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-500/25"
              >
                Save Status
              </button>
            </>
          }
        >
          <div className="space-y-4 text-xs text-slate-200">
            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Select Lifecycle Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                data-testid="order-status-select"
                className="w-full px-3 py-2 border border-slate-700 bg-slate-950 text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Carrier Tracking Number
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. TRK-98124-FEDEX"
                data-testid="order-tracking-input"
                className="w-full px-3 py-2 border border-slate-700 bg-slate-950 text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
