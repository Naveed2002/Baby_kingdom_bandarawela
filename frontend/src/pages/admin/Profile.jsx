import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AdminProfile = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onChangePwd = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const onSave = async (e) => {
    e.preventDefault();
    await updateProfile(form);
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    await changePassword(passwords.currentPassword, passwords.newPassword);
    setPasswords({ currentPassword: '', newPassword: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Admin Profile</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Profile Details</h2>
          <form onSubmit={onSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input name="name" value={form.name} onChange={onChange} className="w-full border-2 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <input type="email" name="email" value={form.email} onChange={onChange} className="w-full border-2 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Phone</label>
              <input name="phone" value={form.phone} onChange={onChange} className="w-full border-2 rounded-lg px-3 py-2" />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary">Save Changes</button>
              <button type="button" onClick={logout} className="btn-outline ml-3">Logout</button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Change Password</h2>
          <form onSubmit={onChangePassword} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Current Password</label>
              <input type="password" name="currentPassword" value={passwords.currentPassword} onChange={onChangePwd} className="w-full border-2 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">New Password</label>
              <input type="password" name="newPassword" value={passwords.newPassword} onChange={onChangePwd} className="w-full border-2 rounded-lg px-3 py-2" />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary">Change Password</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;


