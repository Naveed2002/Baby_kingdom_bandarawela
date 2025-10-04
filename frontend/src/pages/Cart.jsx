import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, getCartSummary } = useCart();
  const summary = getCartSummary();

  const onDecrease = (id, qty) => updateQuantity(id, qty - 1);
  const onIncrease = (id, qty) => updateQuantity(id, qty + 1);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 mb-6">Your cart is empty.</p>
            <Link to="/shop" className="btn-primary">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item._id} className="bg-white rounded-2xl p-4 sm:p-6 shadow flex items-center gap-4">
                  <img src={`${API_BASE_URL}${item.mainImage}`} alt={item.name} className="w-24 h-24 object-cover rounded-xl" onError={(e) => { e.target.src = 'https://via.placeholder.com/200x200?text=Image+Not+Found'; }} />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-primary font-bold">Rs. {item.price.toLocaleString()}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <button onClick={() => onDecrease(item._id, item.quantity)} className="p-2 rounded-md border hover:bg-gray-50">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      <button onClick={() => onIncrease(item._id, item.quantity)} className="p-2 rounded-md border hover:bg-gray-50">
                        <Plus className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeFromCart(item._id)} className="ml-4 p-2 rounded-md border text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-between">
                <button onClick={clearCart} className="text-red-600 hover:underline">Clear cart</button>
              </div>
            </div>

            {/* Summary */}
            <div>
              <div className="bg-white rounded-2xl p-6 shadow">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span>Items ({summary.itemCount})</span><span>Rs. {summary.subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>{summary.shippingCost === 0 ? 'Free' : `Rs. ${summary.shippingCost.toLocaleString()}`}</span></div>
                  <div className="flex justify-between"><span>Tax</span><span>Rs. {summary.tax.toLocaleString()}</span></div>
                  <div className="border-t pt-3 flex justify-between font-semibold"><span>Total</span><span>Rs. {summary.total.toLocaleString()}</span></div>
                </div>
                <Link to="/checkout" className="btn-primary w-full mt-6 inline-block text-center">Proceed to Checkout</Link>
                <Link to="/shop" className="btn-outline w-full mt-3 inline-block text-center">Continue Shopping</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
