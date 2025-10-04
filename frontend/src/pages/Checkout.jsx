import { useMemo, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const Checkout = () => {
  const { getCartSummary, cart } = useCart();
  const summary = getCartSummary();
  const savings = useMemo(() => {
    return cart.reduce((sum, item) => {
      if (item.originalPrice && item.originalPrice > item.price) {
        return sum + (item.originalPrice - item.price) * item.quantity;
      }
      return sum;
    }, 0);
  }, [cart]);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    notes: '',
  });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    // Placeholder: integrate with orders API here
    alert('Order placed successfully!');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <Link to="/shop" className="btn-primary">Go to Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <form onSubmit={onSubmit} className="lg:col-span-2 bg-white rounded-2xl p-6 shadow space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input name="fullName" value={form.fullName} onChange={onChange} className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:border-primary focus:outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={form.email} onChange={onChange} className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:border-primary focus:outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input name="phone" value={form.phone} onChange={onChange} className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:border-primary focus:outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input name="city" value={form.city} onChange={onChange} className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:border-primary focus:outline-none" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                <input name="addressLine1" value={form.addressLine1} onChange={onChange} className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:border-primary focus:outline-none" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                <input name="addressLine2" value={form.addressLine2} onChange={onChange} className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input name="postalCode" value={form.postalCode} onChange={onChange} className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:border-primary focus:outline-none" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea name="notes" value={form.notes} onChange={onChange} className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 focus:border-primary focus:outline-none" rows="3" />
              </div>
            </div>
            <button type="submit" className="btn-primary">Place Order</button>
          </form>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span>Items ({summary.itemCount})</span><span>Rs. {summary.subtotal.toLocaleString()}</span></div>
                {savings > 0 && (
                  <div className="flex justify-between text-green-600"><span>Savings</span><span>- Rs. {savings.toLocaleString()}</span></div>
                )}
                <div className="flex justify-between"><span>Shipping</span><span>{summary.shippingCost === 0 ? 'Free' : `Rs. ${summary.shippingCost.toLocaleString()}`}</span></div>
                <div className="flex justify-between"><span>Tax (15%)</span><span>Rs. {summary.tax.toLocaleString()}</span></div>
                <div className="border-t pt-3 flex justify-between font-semibold"><span>Total</span><span>Rs. {summary.total.toLocaleString()}</span></div>
              </div>
              <div className="mt-4 space-y-3 text-sm text-gray-700">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={`${API_BASE_URL}${item.mainImage}`} alt={item.name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=No+Image'; }} />
                      <div className="truncate">
                        <div className="font-medium truncate">{item.name}</div>
                        <div className="text-gray-500">Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {item.originalPrice && item.originalPrice > item.price ? (
                        <div className="space-x-2">
                          <span className="font-semibold">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                          <span className="text-gray-400 line-through text-xs">Rs. {(item.originalPrice * item.quantity).toLocaleString()}</span>
                        </div>
                      ) : (
                        <span className="font-semibold">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-gray-500">
                Estimated delivery within 3-5 business days. Free shipping for orders over Rs. 5,000.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
