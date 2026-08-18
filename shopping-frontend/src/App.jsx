import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/ReactToastify.css';

import Navbar from './components/common/Navbar';
import AuthScreen from './components/auth/AuthScreen';
import ProfilePage from './components/profile/ProfilePage';
import CustomerStorefront from './components/customer/CustomerStorefront';
import AdminDashboard from './components/admin/AdminDashboard';

// Component App là trung tâm điều phối trạng thái toàn ứng dụng.
// Nó quyết định xem người dùng đã đăng nhập hay chưa, và chuyển giữa các view như auth, profile, storefront hoặc admin dashboard.
export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [activeView, setActiveView] = useState('main'); // 'main' | 'profile'

  // Cập nhật thông tin người dùng vào state và localStorage sau khi profile thay đổi.
  const handleUserUpdate = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // Đăng xuất sẽ xóa token và dữ liệu người dùng khỏi trình duyệt, sau đó quay về màn hình chính.
  // Đăng xuất sẽ xóa token và dữ liệu người dùng khỏi trình duyệt, sau đó quay về màn hình chính.
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setActiveView('main');
    toast.info('👋 Logged out of account successfully');
  };

  // JSX render giao diện chính của ứng dụng.
  // JSX render giao diện chính của ứng dụng.
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      {!user ? (
        <AuthScreen onLoginSuccess={(loggedUser) => {
          localStorage.setItem('user', JSON.stringify(loggedUser));
          setUser(loggedUser);
        }} />
      ) : (
        <>
          {/* Top Navbar */}
          <Navbar
            user={user}
            activeView={activeView}
            setActiveView={setActiveView}
            onLogout={handleLogout}
          />

          {/* Main View Router */}
          <div className="flex-1">
            {activeView === 'profile' ? (
              <ProfilePage
                user={user}
                onBack={() => setActiveView('main')}
                onUserUpdate={handleUserUpdate}
              />
            ) : user.role === 'admin' ? (
              <AdminDashboard />
            ) : (
              <CustomerStorefront />
            )}
          </div>
        </>
      )}
    </div>
  );
}