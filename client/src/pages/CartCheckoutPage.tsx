import React, { useState } from 'react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { useCurrency } from '../context/CurrencyContext.js';
import { apiClient } from '../api/client.js';
import { Breadcrumbs } from '../components/common/Breadcrumbs.js';
import { DatePicker } from '../components/common/DatePicker.js';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  CreditCard,
  Truck,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Crown,
  Trash2,
  PackageCheck
} from 'lucide-react';

export const CartCheckoutPage: React.FC = () => {
  const { items, subtotal, discount, tax, total, isVip, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // Shipping Form State
  const [fullName, setFullName] = useState(user?.fullName || 'John Doe');
  const [street, setStreet] = useState('100 Test Parkway, Suite 400');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');
  const [zipCode, setZipCode] = useState('94107');
  const [country, setCountry] = useState('United States');
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState('Credit Card (Sandbox)');

  const handleNextStep = () => {
    if (!isAuthenticated) {
      addToast('Please login before continuing with checkout.', 'warning');
      navigate('/login');
      return;
    }
    if (currentStep === 2) {
      if (!fullName || !street || !city || !zipCode) {
        addToast('Please complete all required shipping address fields.', 'error');
        return;
      }
    }
    setCurrentStep((prev) => (prev + 1) as 2 | 3);
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const orderPayload = {
        items: items.map((i) => ({
          bookId: i.book.id,
          title: i.book.title,
          price: i.book.price,
          quantity: i.quantity,
          coverImage: i.book.coverImage
        })),
        shippingAddress: {
          fullName,
          street,
          city,
          state,
          zipCode,
          country
        },
        deliveryDate,
        paymentMethod
      };

      const res = await apiClient.post('/orders', orderPayload);
      setCompletedOrder(res.data.order);
      clearCart();
      addToast('Order placed successfully!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to place order.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order Confirmation Success Screen
  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6" data-testid="order-success-screen">
        <div className="w-16 h-16 bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <PackageCheck className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-extrabold text-white" data-testid="order-success-heading">
          Order Confirmed!
        </h1>
        <p className="text-xs text-slate-400">
          Thank you, <span className="font-bold text-slate-200">{completedOrder.username}</span>. Your order has been placed and is queued for fulfillment.
        </p>

        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 text-left space-y-3 text-xs shadow-2xl backdrop-blur-xl">
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Order Number:</span>
            <span className="font-bold text-white" data-testid="confirmed-order-number">
              {completedOrder.orderNumber}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Expected Delivery Date:</span>
            <span className="font-semibold text-slate-200">{completedOrder.deliveryDate}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Total Charged:</span>
            <span className="font-black text-indigo-400 text-sm">{formatPrice(completedOrder.total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Initial Status:</span>
            <span className="bg-amber-950/60 border border-amber-800/60 text-amber-300 font-bold px-2 py-0.5 rounded-full uppercase text-[10px]">
              {completedOrder.status}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            to="/orders"
            data-testid="view-orders-btn"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
          >
            View My Orders
          </Link>
          <Link
            to="/books"
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all border border-slate-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16" data-testid="checkout-page">
      <Breadcrumbs items={[{ label: 'Catalog', href: '/books' }, { label: 'Cart & Checkout' }]} />

      <h1 className="text-2xl font-extrabold text-white">Checkout & Order Review</h1>

      {items.length === 0 ? (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-12 text-center shadow-2xl backdrop-blur-xl" data-testid="empty-checkout-card">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Your cart is empty</h3>
          <p className="text-xs text-slate-400 mb-4">Add books to proceed with multi-step checkout</p>
          <Link
            to="/books"
            className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/25"
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Checkout Form / Steps (Left 8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step Indicators */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow-2xl backdrop-blur-xl text-xs">
              <div
                className={`flex items-center gap-2 font-bold ${
                  currentStep >= 1 ? 'text-indigo-400' : 'text-slate-600'
                }`}
                data-testid="step-indicator-1"
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  currentStep >= 1 ? 'bg-indigo-950/80 border border-indigo-700 text-indigo-300' : 'bg-slate-800 border border-slate-700 text-slate-500'
                }`}>
                  1
                </span>
                <span>Review Cart</span>
              </div>
              <div className="w-12 h-0.5 bg-slate-800" />
              <div
                className={`flex items-center gap-2 font-bold ${
                  currentStep >= 2 ? 'text-indigo-400' : 'text-slate-600'
                }`}
                data-testid="step-indicator-2"
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  currentStep >= 2 ? 'bg-indigo-950/80 border border-indigo-700 text-indigo-300' : 'bg-slate-800 border border-slate-700 text-slate-500'
                }`}>
                  2
                </span>
                <span>Shipping & Date</span>
              </div>
              <div className="w-12 h-0.5 bg-slate-800" />
              <div
                className={`flex items-center gap-2 font-bold ${
                  currentStep === 3 ? 'text-indigo-400' : 'text-slate-600'
                }`}
                data-testid="step-indicator-3"
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  currentStep === 3 ? 'bg-indigo-950/80 border border-indigo-700 text-indigo-300' : 'bg-slate-800 border border-slate-700 text-slate-500'
                }`}>
                  3
                </span>
                <span>Payment</span>
              </div>
            </div>

            {/* Step 1: Review Items */}
            {currentStep === 1 && (
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl backdrop-blur-xl space-y-4" data-testid="step-1-content">
                <h3 className="text-base font-bold text-white">Step 1: Review Cart Items</h3>
                <div className="divide-y divide-slate-800" data-testid="checkout-items-list">
                  {items.map((item) => (
                    <div key={item.book.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.book.coverImage}
                          alt={item.book.title}
                          className="w-12 h-16 object-cover rounded shadow-sm border border-slate-800"
                        />
                        <div>
                          <h4 className="font-bold text-white">{item.book.title}</h4>
                          <span className="text-slate-400">{item.book.authorName}</span>
                          <div className="font-bold text-indigo-400 mt-1">{formatPrice(item.book.price)} each</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="1"
                          max={item.book.stock}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.book.id, parseInt(e.target.value, 10))}
                          data-testid={`checkout-qty-input-${item.book.id}`}
                          className="w-16 px-2 py-1 border border-slate-700 bg-slate-950 text-slate-100 rounded text-center focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => removeFromCart(item.book.id)}
                          data-testid={`checkout-remove-btn-${item.book.id}`}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleNextStep}
                    data-testid="step-1-next-btn"
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
                  >
                    <span>Proceed to Shipping</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Shipping Address & DatePicker */}
            {currentStep === 2 && (
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl backdrop-blur-xl space-y-4" data-testid="step-2-content">
                <h3 className="text-base font-bold text-white">Step 2: Shipping Destination & Calendar Date</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Recipient Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      data-testid="shipping-name-input"
                      className="w-full px-3 py-2 border border-slate-700 bg-slate-950 rounded-lg text-slate-100 focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Street Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      data-testid="shipping-street-input"
                      className="w-full px-3 py-2 border border-slate-700 bg-slate-950 rounded-lg text-slate-100 focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      City <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      data-testid="shipping-city-input"
                      className="w-full px-3 py-2 border border-slate-700 bg-slate-950 rounded-lg text-slate-100 focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      State / Province
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      data-testid="shipping-state-input"
                      className="w-full px-3 py-2 border border-slate-700 bg-slate-950 rounded-lg text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      ZIP / Postal Code <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      data-testid="shipping-zip-input"
                      className="w-full px-3 py-2 border border-slate-700 bg-slate-950 rounded-lg text-slate-100 focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      data-testid="shipping-country-input"
                      className="w-full px-3 py-2 border border-slate-700 bg-slate-950 rounded-lg text-slate-100 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Delivery Date Picker */}
                <div className="pt-2">
                  <DatePicker
                    label="Preferred Delivery Calendar Date"
                    value={deliveryDate}
                    onChange={setDeliveryDate}
                    minDate={new Date().toISOString().split('T')[0]}
                    testId="delivery-date-picker"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleNextStep}
                    data-testid="step-2-next-btn"
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment & Final Submit */}
            {currentStep === 3 && (
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl backdrop-blur-xl space-y-4" data-testid="step-3-content">
                <h3 className="text-base font-bold text-white">Step 3: Payment Method</h3>

                <div className="space-y-2 text-xs">
                  {['Credit Card (Sandbox)', 'PayPal Mock Sandbox', 'Corporate Purchase Order'].map((pm) => (
                    <label
                      key={pm}
                      data-testid={`payment-method-${pm.split(' ')[0]}`}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === pm
                          ? 'border-indigo-500 bg-indigo-950/50 text-white'
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === pm}
                        onChange={() => setPaymentMethod(pm)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <CreditCard className="w-4 h-4 text-indigo-400" />
                      <span className="font-semibold">{pm}</span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    data-testid="place-order-submit-btn"
                    className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'Placing Order...' : `Authorize & Pay ${formatPrice(total)}`}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary (4 Cols) */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl backdrop-blur-xl space-y-4 text-xs sticky top-24" data-testid="checkout-summary-card">
              <h4 className="font-bold text-white text-sm pb-2 border-b border-slate-800">
                Order Summary
              </h4>

              {isVip && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-rose-950/40 to-amber-950/40 p-2.5 rounded-lg border border-rose-800/60 text-rose-300 font-semibold text-[11px]">
                  <Crown className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>VIP 20% discount applied</span>
                </div>
              )}

              <div className="space-y-2 text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-semibold text-slate-200">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-rose-400 font-semibold">
                    <span>VIP Member Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Sales Tax (8%)</span>
                  <span className="text-slate-200">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Standard Shipping</span>
                  <span className="font-bold">FREE</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline font-black text-white">
                <span className="text-sm">Total Due</span>
                <span className="text-lg text-indigo-400" data-testid="checkout-final-total">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
