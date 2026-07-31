import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight,
  ArrowUpDown, RefreshCw, ShoppingBag,
  X, Check, LogOut, ShoppingCart, User, Key, Mail,
  AlertCircle, CheckCircle, ArrowLeft, Send, ShieldCheck,
  ShieldAlert, UserCheck,
  Package, Users, Eye, Filter, Calendar, CreditCard // 👈 Đã thêm các icon mới
} from 'lucide-react';

// 🟢 Import Toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/ReactToastify.css';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeView, setActiveView] = useState('main');

  const handleUserUpdate = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setActiveView('main');
    toast.info('👋 Đã đăng xuất khỏi tài khoản');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* 🟢 ToastContainer nằm ở cấp cao nhất */}
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      {!user ? (
        <AuthScreen
          onLoginSuccess={(userData) => {
            setUser(userData);
            setActiveView('main');
          }}
        />
      ) : (
        <>
          {/* Top Navbar */}
          <nav className="bg-slate-800/80 border-b border-slate-700/60 sticky top-0 z-40 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-white text-lg tracking-tight">Shopping Store</span>
                  <span className={`ml-3 text-xs px-2.5 py-0.5 rounded-full font-semibold ${user.role === 'admin'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}>
                    {user.role === 'admin' ? 'ADMIN PANEL' : 'CUSTOMER STORE'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-white">{user.full_name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
                <button
                  onClick={() => setActiveView(activeView === 'profile' ? 'main' : 'profile')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/60 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 border border-slate-600/50 hover:border-indigo-500/30 rounded-xl text-xs font-medium transition"
                >
                  <User className="w-3.5 h-3.5" />
                  {activeView === 'profile' ? 'Trang chính' : 'Tài khoản'}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/60 hover:bg-rose-600/20 text-slate-300 hover:text-rose-400 border border-slate-600/50 hover:border-rose-500/30 rounded-xl text-xs font-medium transition"
                >
                  <LogOut className="w-3.5 h-3.5" /> Đăng xuất
                </button>
              </div>
            </div>
          </nav>

          {/* Điều hướng View dựa vào Role */}
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
        </>
      )}
    </div>
  );
}

/* =========================================================================
 1. MÀN HÌNH AUTHENTICATION (Đăng ký / Đăng nhập / Quên & Đặt lại mật khẩu)
 ========================================================================= */
function AuthScreen({ onLoginSuccess }) {
  // mode: 'login' | 'register' | 'forgot' | 'reset'
  const [authMode, setAuthMode] = useState('login');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    token: '',
    new_password: ''
  });

  // 🟢 State lưu trữ lỗi chi tiết từng trường { email: "...", password: "..." }
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset form & errors khi chuyển tab/mode
  const switchMode = (newMode) => {
    setAuthMode(newMode);
    setFieldErrors({});
    setGeneralError('');
  };

  // 🟢 Hàm validate dữ liệu phía Client trước khi gửi API
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate Email (áp dụng cho tất cả các mode)
    if (!formData.email.trim()) {
      errors.email = 'Vui lòng nhập email';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Định dạng email không hợp lệ (VD: example@gmail.com)';
    }

    // Validate Register Mode
    if (authMode === 'register') {
      if (!formData.full_name.trim()) {
        errors.full_name = 'Vui lòng nhập họ và tên';
      } else if (formData.full_name.trim().length < 2) {
        errors.full_name = 'Họ và tên phải có ít nhất 2 ký tự';
      }
    }

    // Validate Mật khẩu Đăng ký / Đăng nhập
    if (authMode === 'login' || authMode === 'register') {
      if (!formData.password) {
        errors.password = 'Vui lòng nhập mật khẩu';
      } else if (authMode === 'register' && formData.password.length < 6) {
        errors.password = 'Mật khẩu phải có tối thiểu 6 ký tự';
      }
    }

    // Validate Reset Password Mode
    if (authMode === 'reset') {
      if (!formData.token.trim()) {
        errors.token = 'Vui lòng nhập mã OTP';
      } else if (formData.token.trim().length !== 6 || !/^\d+$/.test(formData.token.trim())) {
        errors.token = 'Mã OTP phải bao gồm đúng 6 chữ số';
      }

      if (!formData.new_password) {
        errors.new_password = 'Vui lòng nhập mật khẩu mới';
      } else if (formData.new_password.length < 6) {
        errors.new_password = 'Mật khẩu mới phải có tối thiểu 6 ký tự';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0; // Trả về true nếu không có lỗi
  };

  // 🟢 Hàm hỗ trợ map lỗi từ Backend về đúng trường input
  const handleBackendErrors = (data) => {
    if (data.details && typeof data.details === 'object') {
      const mappedErrors = {};
      // Mapping từ PascalCase (Backend Go) sang snake_case (Frontend React)
      Object.keys(data.details).forEach((key) => {
        const fieldName = key
          .replace(/([A-Z])/g, '_$1')
          .toLowerCase()
          .replace(/^_/, '');
        mappedErrors[fieldName] = data.details[key];
      });
      setFieldErrors(mappedErrors);
    } else {
      setGeneralError(data.error || data.message || 'Đã có lỗi xảy ra, vui lòng thử lại');
    }
  };

  // Xử lý Submit Login & Register
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});

    if (!validateForm()) return; // Chặn gửi request nếu dữ liệu chưa hợp lệ

    setLoading(true);
    const isRegister = authMode === 'register';
    const endpoint = isRegister ? '/auth/register' : '/auth/login';

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          ...(isRegister && { full_name: formData.full_name.trim() })
        })
      });

      const data = await res.json();
      if (!res.ok) {
        handleBackendErrors(data);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      toast.success(isRegister ? '🎉 Đăng ký tài khoản thành công!' : '🔑 Đăng nhập thành công!');
      setTimeout(() => onLoginSuccess(data.user), 300);

    } catch (err) {
      setGeneralError('Không thể kết nối tới máy chủ. Vui lòng kiểm tra lại mạng.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Yêu cầu Quên Mật Khẩu
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        handleBackendErrors(data);
        return;
      }

      const otpCode = data.reset_token || '';
      setFormData(prev => ({ ...prev, token: otpCode }));
      toast.success(`🎉 Mã xác thực OTP của bạn là: ${otpCode}`);
      switchMode('reset');
    } catch (err) {
      setGeneralError('Lỗi hệ thống khi gửi yêu cầu khôi phục.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Đặt lại mật khẩu
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          token: formData.token.trim(),
          new_password: formData.new_password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        handleBackendErrors(data);
        return;
      }

      toast.success('🎉 Đổi mật khẩu thành công! Vui lòng đăng nhập.');
      switchMode('login');
      setFormData(prev => ({ ...prev, password: '', token: '', new_password: '' }));
    } catch (err) {
      setGeneralError('Đặt lại mật khẩu thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {authMode === 'login' && 'Đăng Nhập'}
            {authMode === 'register' && 'Tạo Tài Khoản Mới'}
            {authMode === 'forgot' && 'Quên Mật Khẩu'}
            {authMode === 'reset' && 'Đặt Lại Mật Khẩu'}
          </h2>
        </div>

        {/* Thông báo lỗi chung (Nếu có) */}
        {generalError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs text-center font-medium">
            {generalError}
          </div>
        )}

        {/* Form Đăng nhập / Đăng ký */}
        {(authMode === 'login' || authMode === 'register') && (
          <form onSubmit={handleAuthSubmit} className="space-y-4" noValidate>
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Họ và tên</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={formData.full_name}
                    onChange={(e) => {
                      setFormData({ ...formData, full_name: e.target.value });
                      if (fieldErrors.full_name) setFieldErrors({ ...fieldErrors, full_name: '' });
                    }}
                    className={`w-full pl-10 pr-4 py-2 bg-slate-900/80 border ${fieldErrors.full_name ? 'border-rose-500' : 'border-slate-700'
                      } rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500`}
                  />
                </div>
                {fieldErrors.full_name && (
                  <span className="text-[11px] text-rose-400 mt-1 block">{fieldErrors.full_name}</span>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                  }}
                  className={`w-full pl-10 pr-4 py-2 bg-slate-900/80 border ${fieldErrors.email ? 'border-rose-500' : 'border-slate-700'
                    } rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500`}
                />
              </div>
              {fieldErrors.email && (
                <span className="text-[11px] text-rose-400 mt-1 block">{fieldErrors.email}</span>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-slate-300">Mật khẩu</label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-[11px] text-indigo-400 hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                  }}
                  className={`w-full pl-10 pr-4 py-2 bg-slate-900/80 border ${fieldErrors.password ? 'border-rose-500' : 'border-slate-700'
                    } rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500`}
                />
              </div>
              {fieldErrors.password && (
                <span className="text-[11px] text-rose-400 mt-1 block">{fieldErrors.password}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition shadow-lg shadow-indigo-600/30 text-sm disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : authMode === 'register' ? 'Đăng Ký' : 'Đăng Nhập'}
            </button>
          </form>
        )}

        {/* Form Yêu cầu Quên mật khẩu */}
        {authMode === 'forgot' && (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email khôi phục</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                  }}
                  className={`w-full pl-10 pr-4 py-2 bg-slate-900/80 border ${fieldErrors.email ? 'border-rose-500' : 'border-slate-700'
                    } rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500`}
                />
              </div>
              {fieldErrors.email && (
                <span className="text-[11px] text-rose-400 mt-1 block">{fieldErrors.email}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition shadow-lg shadow-indigo-600/30 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Đang gửi...' : 'Gửi mã xác thực OTP'}
            </button>
          </form>
        )}

        {/* Form Đặt lại mật khẩu */}
        {authMode === 'reset' && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mã OTP (6 chữ số)</label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="VD: 495916"
                  value={formData.token}
                  onChange={(e) => {
                    setFormData({ ...formData, token: e.target.value });
                    if (fieldErrors.token) setFieldErrors({ ...fieldErrors, token: '' });
                  }}
                  className={`w-full pl-10 pr-4 py-2 bg-slate-900/80 border ${fieldErrors.token ? 'border-rose-500' : 'border-slate-700'
                    } rounded-xl text-sm text-white font-mono tracking-widest focus:outline-none focus:border-indigo-500`}
                />
              </div>
              {fieldErrors.token && (
                <span className="text-[11px] text-rose-400 mt-1 block">{fieldErrors.token}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mật khẩu mới</label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.new_password}
                  onChange={(e) => {
                    setFormData({ ...formData, new_password: e.target.value });
                    if (fieldErrors.new_password) setFieldErrors({ ...fieldErrors, new_password: '' });
                  }}
                  className={`w-full pl-10 pr-4 py-2 bg-slate-900/80 border ${fieldErrors.new_password ? 'border-rose-500' : 'border-slate-700'
                    } rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500`}
                />
              </div>
              {fieldErrors.new_password && (
                <span className="text-[11px] text-rose-400 mt-1 block">{fieldErrors.new_password}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition shadow-lg shadow-emerald-600/30 text-sm disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="text-center pt-2 border-t border-slate-700/60 flex justify-between items-center text-xs">
          {authMode !== 'login' && (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-slate-400 hover:text-white flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại đăng nhập
            </button>
          )}

          {authMode === 'login' && (
            <button
              type="button"
              onClick={() => switchMode('register')}
              className="text-indigo-400 hover:underline ml-auto"
            >
              Chưa có tài khoản? Đăng ký ngay
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

/* =========================================================================
 2. TRANG HỒ SƠ NGƯỜI DÙNG
 ========================================================================= */
function ProfilePage({ user, onBack, onUserUpdate }) {
  const [profile, setProfile] = useState(user);
  const [nameForm, setNameForm] = useState({ full_name: user?.full_name || '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '' });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [nameError, setNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await fetch(`${API_BASE_URL}/me`, {
          headers: getAuthHeaders()
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setNameForm({ full_name: data.full_name || '' });
        } else {
          const data = await res.json().catch(() => ({}));
          toast.error(data.error || 'Không thể tải thông tin tài khoản');
        }
      } catch (err) {
        toast.error('Lỗi kết nối khi tải thông tin tài khoản');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setNameError('');

    if (!nameForm.full_name.trim()) {
      setNameError('Vui lòng nhập họ và tên');
      return;
    }

    setSavingName(true);
    try {
      const res = await fetch(`${API_BASE_URL}/me`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ full_name: nameForm.full_name.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        setNameError(data.error || data.message || 'Cập nhật tên thất bại');
        return;
      }

      const updatedUser = data.user || { ...profile, full_name: nameForm.full_name.trim() };
      setProfile(updatedUser);
      onUserUpdate(updatedUser);
      toast.success('Đã cập nhật họ tên thành công');
    } catch (err) {
      toast.error('Lỗi kết nối khi cập nhật họ tên');
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordForm.current_password || !passwordForm.new_password) {
      setPasswordError('Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch(`${API_BASE_URL}/me/password`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(passwordForm)
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || data.message || 'Đổi mật khẩu thất bại');
        return;
      }

      setPasswordForm({ current_password: '', new_password: '' });
      toast.success('Đổi mật khẩu thành công');
    } catch (err) {
      toast.error('Lỗi kết nối khi đổi mật khẩu');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
      <div className="flex items-center justify-between bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
        <div>
          <h1 className="text-2xl font-bold text-white">Thông tin tài khoản</h1>
          <p className="text-xs text-slate-400">Chỉnh sửa họ tên và đổi mật khẩu từ một trang riêng</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-xs font-medium text-white border border-slate-600/50"
        >
          Quay lại
        </button>
      </div>

      {loadingProfile ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 text-center text-slate-400">
          Đang tải thông tin người dùng...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Thông tin hiện tại</h2>
                <p className="text-xs text-slate-400">Xem thông tin tài khoản đang đăng nhập</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-slate-700/60 pb-3">
                <span className="text-slate-400">Họ và tên</span>
                <span className="text-white font-medium text-right">{profile?.full_name}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-700/60 pb-3">
                <span className="text-slate-400">Email</span>
                <span className="text-white font-medium text-right break-all">{profile?.email}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-700/60 pb-3">
                <span className="text-slate-400">Vai trò</span>
                <span className="text-white font-medium capitalize text-right">{profile?.role}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Ngày tạo</span>
                <span className="text-white font-medium text-right">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleString('vi-VN') : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleUpdateName} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white">Đổi họ tên</h2>
                <p className="text-xs text-slate-400">Tên hiển thị sẽ được cập nhật ngay trong giao diện</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Họ và tên mới</label>
                <input
                  type="text"
                  value={nameForm.full_name}
                  onChange={(e) => setNameForm({ full_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                {nameError && <p className="text-[11px] text-rose-400 mt-1">{nameError}</p>}
              </div>

              <button
                type="submit"
                disabled={savingName}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium disabled:opacity-50"
              >
                {savingName ? 'Đang lưu...' : 'Cập nhật họ tên'}
              </button>
            </form>

            <form onSubmit={handleChangePassword} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-white">Đổi mật khẩu</h2>
                <p className="text-xs text-slate-400">Nhập mật khẩu hiện tại và mật khẩu mới</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/70 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {passwordError && <p className="text-[11px] text-rose-400">{passwordError}</p>}

              <button
                type="submit"
                disabled={changingPassword}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium disabled:opacity-50"
              >
                {changingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
 2. TRANG MUA SẮM DÀNH CHO CUSTOMER
 ========================================================================= */
function CustomerStorefront() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [addingId, setAddingId] = useState(null);
  const [checkoutStatus, setCheckoutStatus] = useState({ loading: false, error: null, success: false });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/products?limit=20`);
      const data = await res.json();
      setProducts(data.data || []);
    } catch (err) {
      console.error('Lỗi tải sản phẩm:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/cart`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data || []);
      }
    } catch (err) {
      console.error('Lỗi tải giỏ hàng:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, []);

  const addToCart = async (product) => {
    if (product.stock <= 0) return;

    setAddingId(product.id);
    try {
      const res = await fetch(`${API_BASE_URL}/cart/items`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1
        })
      });

      if (res.ok) {
        toast.success(`🛒 Đã thêm "${product.name}" vào giỏ hàng`);
        await fetchCart();
      } else {
        const errData = await res.json();
        toast.error(errData.error || 'Không thể thêm vào giỏ hàng');
      }
    } catch (err) {
      toast.error('Lỗi kết nối mạng khi thêm vào giỏ');
    } finally {
      setAddingId(null);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setCheckoutStatus({ loading: true, error: null, success: false });

    try {
      const res = await fetch(`${API_BASE_URL}/checkout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('🎉 Thanh toán thành công! Đơn hàng đã được ghi nhận.');
        setCheckoutStatus({ loading: false, error: null, success: true });
        setCart([]);
        fetchProducts();
      } else {
        toast.error(`❌ ${data.error || 'Thanh toán thất bại'}`);
        setCheckoutStatus({ loading: false, error: data.error || 'Thanh toán thất bại', success: false });
      }
    } catch (err) {
      toast.error('Lỗi kết nối mạng khi thanh toán');
      setCheckoutStatus({ loading: false, error: 'Lỗi kết nối khi thanh toán', success: false });
    }
  };

  const totalCartPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
      <div className="flex justify-between items-center bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
        <div>
          <h1 className="text-2xl font-bold text-white">Danh Sách Sản Phẩm</h1>
          <p className="text-xs text-slate-400">Chọn sản phẩm ưa thích và thêm vào giỏ hàng</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-600/20 text-indigo-400 px-4 py-2 rounded-xl border border-indigo-500/30">
          <ShoppingCart className="w-5 h-5" />
          <span className="font-bold text-sm">{cart.reduce((sum, i) => sum + i.quantity, 0)} món</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Danh sách sản phẩm dạng Thẻ Grid */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 text-center py-12 text-slate-400">Đang tải sản phẩm...</div>
          ) : products.map((p) => {
            const isOutOfStock = p.stock <= 0;
            const isAdding = addingId === p.id;

            return (
              <div
                key={p.id}
                className={`bg-slate-800/60 border rounded-2xl p-5 flex flex-col justify-between transition ${isOutOfStock ? 'border-rose-500/30 opacity-75' : 'border-slate-700/60 hover:border-indigo-500/50'
                  }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-white">{p.name}</h3>
                    {isOutOfStock && (
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold rounded-full uppercase tracking-wider animate-pulse">
                        Hết hàng
                      </span>
                    )}
                  </div>

                  <p className="text-emerald-400 font-bold text-base mb-3">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                  </p>

                  <p className="text-xs text-slate-400">
                    Kho hàng:{' '}
                    {isOutOfStock ? (
                      <span className="text-rose-400 font-medium">0 (Tạm hết)</span>
                    ) : (
                      <span className="text-slate-200">{p.stock} sản phẩm</span>
                    )}
                  </p>
                </div>

                <button
                  onClick={() => addToCart(p)}
                  disabled={isOutOfStock || isAdding}
                  className={`mt-4 w-full py-2.5 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5 ${isOutOfStock
                    ? 'bg-slate-700/50 text-slate-500 border border-slate-700 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98]'
                    }`}
                >
                  {isAdding ? (
                    'Đang lưu...'
                  ) : isOutOfStock ? (
                    <>
                      <X className="w-4 h-4 text-rose-400" /> Tạm hết hàng
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Thêm vào giỏ
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Cột Giỏ hàng bên phải */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 h-fit space-y-4">
          <h2 className="font-bold text-white text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-400" /> Giỏ Hàng
          </h2>

          {cart.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">Giỏ hàng của bạn đang trống</p>
          ) : (
            <div className="space-y-3">
              <div className="divide-y divide-slate-700/50 max-h-60 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id || item.product_id} className="py-2.5 flex justify-between items-start text-xs">
                    <div className="pr-4">
                      <p className="font-medium text-white">{item.product_name || item.name}</p>
                      <p className="text-slate-400 mt-0.5">{item.quantity} x {new Intl.NumberFormat('vi-VN').format(item.price)}đ</p>

                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-900/40 px-2 py-1 rounded">
                          <button
                            onClick={async () => {
                              const newQty = item.quantity - 1;
                              try {
                                const res = await fetch(`${API_BASE_URL}/cart/items/${item.product_id || item.id}`, {
                                  method: 'PATCH',
                                  headers: getAuthHeaders(),
                                  body: JSON.stringify({ quantity: newQty })
                                });

                                if (res.ok) {
                                  if (newQty <= 0) toast.info('🗑️ Đã xóa sản phẩm khỏi giỏ hàng');
                                  await fetchCart();
                                } else {
                                  const d = await res.json();
                                  toast.error(d.error || 'Không thể cập nhật số lượng');
                                }
                              } catch (err) {
                                toast.error('Lỗi kết nối khi cập nhật giỏ hàng');
                              }
                            }}
                            className="text-slate-300 hover:text-white px-1"
                            title="Giảm"
                          >
                            -
                          </button>

                          <span className="text-sm font-semibold px-2">{item.quantity}</span>

                          <button
                            onClick={async () => {
                              const newQty = item.quantity + 1;
                              try {
                                const res = await fetch(`${API_BASE_URL}/cart/items/${item.product_id || item.id}`, {
                                  method: 'PATCH',
                                  headers: getAuthHeaders(),
                                  body: JSON.stringify({ quantity: newQty })
                                });

                                if (res.ok) {
                                  await fetchCart();
                                } else {
                                  const d = await res.json();
                                  toast.error(d.error || 'Không thể cập nhật số lượng');
                                }
                              } catch (err) {
                                toast.error('Lỗi kết nối khi cập nhật giỏ hàng');
                              }
                            }}
                            className="text-slate-300 hover:text-white px-1"
                            title="Tăng"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex items-center gap-3">
                      <span className="font-bold text-emerald-400">
                        {new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)}đ
                      </span>
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`${API_BASE_URL}/cart/items/${item.product_id || item.id}`, {
                              method: 'DELETE',
                              headers: getAuthHeaders()
                            });

                            if (res.ok) {
                              toast.success('🗑️ Đã xóa sản phẩm khỏi giỏ hàng');
                              await fetchCart();
                            } else {
                              const d = await res.json();
                              toast.error(d.error || 'Không thể xóa sản phẩm');
                            }
                          } catch (err) {
                            toast.error('Lỗi kết nối khi xóa sản phẩm');
                          }
                        }}
                        className="text-rose-400 hover:text-rose-500"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-700 flex justify-between items-center text-sm font-bold">
                <span className="text-slate-300">Tổng tiền:</span>
                <span className="text-emerald-400 text-base">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalCartPrice)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || checkoutStatus.loading}
                className={`w-full py-2.5 text-xs font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2 ${cart.length === 0 || checkoutStatus.loading
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 active:scale-[0.98]'
                  }`}
              >
                {checkoutStatus.loading ? 'Đang xử lý...' : 'Tiến Hành Đặt Hàng'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
 3. TRANG DASHBOARD QUẢN LÝ DÀNH CHO ADMIN (NÂNG CẤP SIDEBAR & USER ROLES)
 ========================================================================= */
function AdminDashboard() {
  // Tab hiện tại: 'products' | 'users' | 'orders'
  const [activeTab, setActiveTab] = useState('products');

  /* -----------------------------------------------------------------------
  STATE CHO QUẢN LÝ SẢN PHẨM
  ----------------------------------------------------------------------- */
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 });
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '' });
  const [formError, setFormError] = useState('');

  /* -----------------------------------------------------------------------
  STATE CHO QUẢN LÝ NGƯỜI DÙNG & PHÂN QUYỀN
  ----------------------------------------------------------------------- */
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updatingRoleId, setUpdatingRoleId] = useState(null);

  /* -----------------------------------------------------------------------
  STATE CHO QUẢN LÝ ĐƠN HÀNG (MỚI)
  ----------------------------------------------------------------------- */
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState(false);

  // Lấy Token từ LocalStorage để thực hiện các Request Admin
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  /* =======================================================================
  API CALLS: SẢN PHẨM
  ======================================================================= */
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sort_by: sortBy,
        order: order,
      });

      if (search.trim()) params.append('search', search.trim());
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);

      const res = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
      const result = await res.json();

      setProducts(result.data || []);
      setPagination(prev => ({ ...prev, total: result.total || 0, totalPages: result.total_pages || 1 }));
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoadingProducts(false);
    }
  }, [pagination.page, pagination.limit, search, minPrice, maxPrice, sortBy, order]);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    }
  }, [fetchProducts, activeTab]);

  const openModal = (product = null) => {
    setFormError('');
    if (product) {
      setEditingProduct(product);
      setFormData({ name: product.name, price: product.price, stock: product.stock });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', stock: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setFormError('');

    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10)
    };

    try {
      const url = editingProduct ? `${API_BASE_URL}/products/${editingProduct.id}` : `${API_BASE_URL}/products`;
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Có lỗi xảy ra');
      }

      toast.success(editingProduct ? `✏️ Cập nhật "${formData.name}" thành công!` : `🎉 Thêm sản phẩm thành công!`);
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      setFormError(err.message);
      toast.error(`❌ ${err.message}`);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${name || id}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Không thể xóa sản phẩm');
      }

      toast.info(`🗑️ Đã xóa sản phẩm thành công!`);
      fetchProducts();
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    }
  };

  /* =======================================================================
  API CALLS: NGƯỜI DÙNG & QUẢN LÝ PHÂN QUYỀN
  ======================================================================= */
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: getAuthHeader()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không thể tải danh sách người dùng');
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      console.error(err);
      toast.error(`❌ ${err.message}`);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [fetchUsers, activeTab]);

  // Cập nhật Quyền (Role) cho Người Dùng
  const handleRoleChange = async (userId, newRole, userName) => {
    setUpdatingRoleId(userId);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cập nhật phân quyền thất bại');

      toast.success(`🛡️ Đã đổi quyền của "${userName}" thành: ${newRole.toUpperCase()}`);

      // Cập nhật trực tiếp State giao diện không cần reload lại toàn bộ
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setUpdatingRoleId(null);
    }
  };

  // Lọc người dùng kết hợp Tìm kiếm & Phân quyền (Role)
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  /* =======================================================================
  API CALLS: QUẢN LÝ ĐƠN HÀNG (MỚI)
  ======================================================================= */
  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders`, {
        headers: getAuthHeader()
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } else {
        toast.error('Không thể tải danh sách đơn hàng');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối khi tải đơn hàng');
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [fetchOrders, activeTab]);

  // Xem chi tiết đơn hàng
  const handleViewOrderDetail = async (orderId) => {
    setLoadingOrderDetail(true);
    setIsOrderModalOpen(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
        headers: getAuthHeader()
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data);
      } else {
        toast.error('Không thể tải chi tiết đơn hàng');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối khi tải chi tiết đơn hàng');
    } finally {
      setLoadingOrderDetail(false);
    }
  };

  // Lọc danh sách đơn hàng
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id?.toString().includes(orderSearch) ||
      order.user_id?.toString().includes(orderSearch);
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Utility định dạng
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  // Render Badge trạng thái
  const renderStatusBadge = (status) => {
    const styles = {
      PAID: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      CANCELLED: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">

      {/* ===================================================================
 1. LEFT NAVIGATION SIDEBAR
 =================================================================== */}
      <aside className="w-full md:w-64 bg-slate-800/80 border-r border-slate-700/60 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Dashboard Header */}
          <div className="flex items-center gap-3 px-3 py-2 border-b border-slate-700/50 pb-4">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">Admin Portal</h2>
              <p className="text-[11px] text-slate-400">Hệ thống Quản trị</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${activeTab === 'products'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
            >
              <Package className="w-4 h-4" />
              <span>Quản Lý Sản Phẩm</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
            >
              <Users className="w-4 h-4" />
              <span>Quản Lý Người Dùng</span>
            </button>

            {/* 🟢 MỚI: Menu Quản Lý Đơn Hàng */}
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition ${activeTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Quản Lý Đơn Hàng</span>
            </button>
          </nav>
        </div>

        {/* Info Footer */}
        <div className="pt-4 border-t border-slate-700/50 text-[11px] text-slate-500 text-center">
          Shopping System v2.0
        </div>
      </aside>

      {/* ===================================================================
 2. MAIN CONTENT AREA
 =================================================================== */}
      <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">

        {/* -----------------------------------------------------------------
 TAB 1: QUẢN LÝ SẢN PHẨM
 ----------------------------------------------------------------- */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
              <div>
                <h1 className="text-2xl font-bold text-white">Quản Lý Sản Phẩm</h1>
                <p className="text-xs text-slate-400">Tạo, chỉnh sửa, xem tồn kho và xóa sản phẩm</p>
              </div>
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition shadow-lg shadow-indigo-600/30"
              >
                <Plus className="w-4 h-4" /> Thêm sản phẩm
              </button>
            </div>

            {/* Thanh Tìm kiếm & Bộ lọc */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
              <div className="md:col-span-4 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="md:col-span-4 flex gap-2">
                <input
                  type="number"
                  placeholder="Giá từ"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-xs text-white"
                />
                <input
                  type="number"
                  placeholder="Đến"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="md:col-span-4 flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-xs text-slate-300"
                >
                  <option value="created_at">Mới nhất</option>
                  <option value="price">Giá</option>
                  <option value="name">Tên</option>
                </select>
                <button
                  onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                  className="p-2 bg-slate-900/60 border border-slate-700 rounded-xl hover:bg-slate-700/50"
                >
                  <ArrowUpDown className="w-4 h-4 text-slate-300" />
                </button>
                <button
                  onClick={fetchProducts}
                  className="p-2 bg-slate-900/60 border border-slate-700 rounded-xl hover:bg-slate-700/50"
                >
                  <RefreshCw className={`w-4 h-4 text-slate-300 ${loadingProducts ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Bảng Dữ Liệu Sản Phẩm */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/60 text-slate-400 text-xs font-semibold uppercase border-b border-slate-700/60">
                  <tr>
                    <th className="p-4">Sản Phẩm</th>
                    <th className="p-4">Giá</th>
                    <th className="p-4">Tồn Kho</th>
                    <th className="p-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {loadingProducts ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">
                        Đang tải danh sách...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">
                        Không tìm thấy sản phẩm nào
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-800/80 transition">
                        <td className="p-4 font-medium text-white">{product.name}</td>
                        <td className="p-4 text-emerald-400 font-bold">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                        </td>
                        <td className="p-4 text-slate-300">{product.stock}</td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => openModal(product)}
                            className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Phân trang */}
              <div className="p-4 bg-slate-900/40 border-t border-slate-700/60 flex justify-between items-center text-xs text-slate-400">
                <span>Tổng số: {pagination.total} sản phẩm</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    className="p-1.5 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span>Trang {pagination.page} / {pagination.totalPages}</span>
                  <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    className="p-1.5 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------
 TAB 2: QUẢN LÝ NGƯỜI DÙNG & PHÂN QUYỀN (ROLE PERMISSIONS)
 ----------------------------------------------------------------- */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
              <div>
                <h1 className="text-2xl font-bold text-white">Quản Lý Người Dùng</h1>
                <p className="text-xs text-slate-400">Danh sách tài khoản và cấp quyền truy cập (Admin / Customer)</p>
              </div>
              <button
                onClick={fetchUsers}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs rounded-xl"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} /> Tải lại
              </button>
            </div>

            {/* BỘ LỌC VÀ TÌM KIẾM NGƯỜI DÙNG */}
            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 flex flex-col sm:flex-row gap-4 items-center justify-between">

              {/* Thanh Tìm Kiếm */}
              <div className="relative w-full sm:max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo Tên hoặc Email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              {/* NÚT LỌC THEO ROLE (ALL / ADMIN / CUSTOMER) */}
              <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-700/60 w-full sm:w-auto">
                <button
                  onClick={() => setRoleFilter('all')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition ${roleFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  Tất cả ({users.length})
                </button>

                <button
                  onClick={() => setRoleFilter('admin')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition ${roleFilter === 'admin'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  Admin ({users.filter(u => u.role === 'admin').length})
                </button>

                <button
                  onClick={() => setRoleFilter('customer')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition ${roleFilter === 'customer'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  Customer ({users.filter(u => u.role === 'customer').length})
                </button>
              </div>

            </div>

            {/* Bảng Phân Quyền Người Dùng */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/60 text-slate-400 text-xs font-semibold uppercase border-b border-slate-700/60">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Họ và Tên</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Quyền Hiện Tại</th>
                    <th className="p-4 text-right">Thay Đổi Phân Quyền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        Đang tải danh sách người dùng...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        Không tìm thấy người dùng phù hợp
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-800/80 transition">
                        <td className="p-4 text-xs font-mono text-slate-400">#{user.id}</td>
                        <td className="p-4 font-medium text-white flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-indigo-400" />
                          {user.full_name}
                        </td>
                        <td className="p-4 text-slate-300 text-xs">{user.email}</td>
                        <td className="p-4">
                          {user.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <ShieldAlert className="w-3 h-3" /> ADMIN
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              <ShieldCheck className="w-3 h-3" /> CUSTOMER
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <select
                            disabled={updatingRoleId === user.id}
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value, user.full_name)}
                            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
                          >
                            <option value="customer">Gán quyền Customer</option>
                            <option value="admin">Gán quyền Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------
 TAB 3: QUẢN LÝ ĐƠN HÀNG (MỚI)
 ----------------------------------------------------------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
              <div>
                <h1 className="text-2xl font-bold text-white">Quản Lý Đơn Hàng</h1>
                <p className="text-xs text-slate-400">Xem và kiểm tra toàn bộ đơn hàng trong hệ thống</p>
              </div>
              <button
                onClick={fetchOrders}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs rounded-xl"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} /> Tải lại
              </button>
            </div>

            {/* Bộ lọc đơn hàng */}
            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo Mã Đơn / User ID..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-700/60 w-full sm:w-auto">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition ${statusFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setStatusFilter('PAID')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition ${statusFilter === 'PAID'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  Đã thanh toán
                </button>
                <button
                  onClick={() => setStatusFilter('PENDING')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition ${statusFilter === 'PENDING'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  Chờ xử lý
                </button>
                <button
                  onClick={() => setStatusFilter('CANCELLED')}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition ${statusFilter === 'CANCELLED'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  Đã hủy
                </button>
              </div>
            </div>

            {/* Bảng đơn hàng */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/60 text-slate-400 text-xs font-semibold uppercase border-b border-slate-700/60">
                  <tr>
                    <th className="p-4">Mã Đơn (#ID)</th>
                    <th className="p-4">User ID</th>
                    <th className="p-4">Tổng Tiền</th>
                    <th className="p-4">Trạng Thái</th>
                    <th className="p-4">Ngày Tạo</th>
                    <th className="p-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {loadingOrders ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        Đang tải danh sách đơn hàng...
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        Không tìm thấy đơn hàng nào
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-800/80 transition">
                        <td className="p-4 font-medium text-indigo-400">#{order.id}</td>
                        <td className="p-4 text-slate-300">User #{order.user_id}</td>
                        <td className="p-4 font-semibold text-emerald-400">
                          {formatCurrency(order.total_amount)}
                        </td>
                        <td className="p-4">{renderStatusBadge(order.status)}</td>
                        <td className="p-4 text-slate-400 text-xs">{formatDate(order.created_at)}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleViewOrderDetail(order.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* ===================================================================
 3. MODAL THÊM / SỬA SẢN PHẨM
 =================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">
                {editingProduct ? 'Cập Nhật Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tên sản phẩm</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Giá (VNĐ)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Số lượng tồn kho</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl shadow-lg shadow-indigo-600/30"
                >
                  {editingProduct ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
 4. MODAL CHI TIẾT ĐƠN HÀNG (MỚI)
 =================================================================== */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Chi Tiết Đơn Hàng #{selectedOrder?.id}
              </h2>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-700/50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {loadingOrderDetail || !selectedOrder ? (
                <div className="py-12 text-center text-slate-400">Đang tải thông tin chi tiết...</div>
              ) : (
                <div className="space-y-6">

                  {/* Thông tin chung */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-400" />
                      <div>
                        <p className="text-xs text-slate-400">Khách hàng</p>
                        <p className="font-semibold text-white">User #{selectedOrder.user_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-400" />
                      <div>
                        <p className="text-xs text-slate-400">Trạng thái</p>
                        <div style={{ paddingTop: '5px' }}>{renderStatusBadge(selectedOrder.status)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <div>
                        <p className="text-xs text-slate-400">Thời gian tạo</p>
                        <p className="font-semibold text-white text-xs">{formatDate(selectedOrder.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bảng sản phẩm trong đơn */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3">Danh Sách Sản Phẩm</h3>
                    <div className="border border-slate-700 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase border-b border-slate-700">
                          <tr>
                            <th className="py-2.5 px-3">Sản phẩm</th>
                            <th className="py-2.5 px-3 text-center">Số lượng</th>
                            <th className="py-2.5 px-3 text-right">Đơn giá</th>
                            <th className="py-2.5 px-3 text-right">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                          {selectedOrder.items?.map((item) => (
                            <tr key={item.id}>
                              <td className="py-3 px-3">
                                {/* Hiển thị Tên sản phẩm chính + ID nhỏ ở dưới */}
                                <div className="font-medium text-white">
                                  {item.product_name || `Sản phẩm #${item.product_id}`}
                                </div>
                                <div className="text-xs text-slate-400">
                                  ID: #{item.product_id}
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center text-slate-300">x{item.quantity}</td>
                              <td className="py-3 px-3 text-right text-slate-300">{formatCurrency(item.price)}</td>
                              <td className="py-3 px-3 text-right font-medium text-emerald-400">
                                {formatCurrency(item.price * item.quantity)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* Tổng tiền */}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                    <span className="font-bold text-white">Tổng Cộng Đơn Hàng:</span>
                    <span className="text-xl font-extrabold text-emerald-400">
                      {formatCurrency(selectedOrder.total_amount)}
                    </span>
                  </div>

                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-900/50 border-t border-slate-700 flex justify-end">
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 rounded-xl shadow-sm transition"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}