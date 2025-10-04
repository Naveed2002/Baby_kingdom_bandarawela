import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const AdminSettings = () => {
  const [store, setStore] = useState({ name: '', email: '', phone: '', address: '' });
  const [shipping, setShipping] = useState({ freeOver: 5000, flatRate: 500 });
  const [ui, setUi] = useState({ theme: 'light', primaryColor: '#3b82f6' });

  useEffect(() => {
    // Optionally load existing settings from an endpoint if available
  }, []);

  const saveStore = async (e) => {
    e.preventDefault();
    // Placeholder: integrate with backend settings save
    alert('Store settings saved');
  };

  const saveShipping = async (e) => {
    e.preventDefault();
    alert('Shipping settings saved');
  };

  const saveUi = async (e) => {
    e.preventDefault();
    alert('UI settings saved');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Store settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">Store Information</h2>
            <form onSubmit={saveStore} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Store Name</label>
                <input className="w-full border-2 rounded-lg px-3 py-2" value={store.name} onChange={(e)=>setStore({...store,name:e.target.value})} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <input type="email" className="w-full border-2 rounded-lg px-3 py-2" value={store.email} onChange={(e)=>setStore({...store,email:e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phone</label>
                  <input className="w-full border-2 rounded-lg px-3 py-2" value={store.phone} onChange={(e)=>setStore({...store,phone:e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Address</label>
                <textarea rows="3" className="w-full border-2 rounded-lg px-3 py-2" value={store.address} onChange={(e)=>setStore({...store,address:e.target.value})} />
              </div>
              <button type="submit" className="btn-primary">Save</button>
            </form>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">Shipping</h2>
            <form onSubmit={saveShipping} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Free Over (LKR)</label>
                  <input type="number" className="w-full border-2 rounded-lg px-3 py-2" value={shipping.freeOver} onChange={(e)=>setShipping({...shipping,freeOver:Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Flat Rate (LKR)</label>
                  <input type="number" className="w-full border-2 rounded-lg px-3 py-2" value={shipping.flatRate} onChange={(e)=>setShipping({...shipping,flatRate:Number(e.target.value)})} />
                </div>
              </div>
              <button type="submit" className="btn-primary">Save</button>
            </form>
          </div>

          {/* UI */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">UI</h2>
            <form onSubmit={saveUi} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Theme</label>
                  <select className="w-full border-2 rounded-lg px-3 py-2" value={ui.theme} onChange={(e)=>setUi({...ui,theme:e.target.value})}>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Primary Color</label>
                  <input type="color" className="w-16 h-10 p-0 border-2 rounded" value={ui.primaryColor} onChange={(e)=>setUi({...ui,primaryColor:e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn-primary">Save</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;


