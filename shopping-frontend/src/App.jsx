import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, 
  ArrowUpDown, RefreshCw, ShoppingBag, X, Check, LogOut, ShoppingCart, User, Key, Mail, AlertCircle, CheckCircle, ArrowLeft, Send
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.info('👋 Đã đăng xuất khỏi tài khoản');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* 🟢 ToastContainer nằm ở cấp cao nhất */}
      <ToastContainer theme="dark" position="top-right" autoClose={3000} />

      {!user ? (
        <AuthScreen onLoginSuccess={(userData) => setUser(userData)} />
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
                  <span className={`ml-3 text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    user.role === 'admin' 
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
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/60 hover:bg-rose-600/20 text-slate-300 hover:text-rose-400 border border-slate-600/50 hover:border-rose-500/30 rounded-xl text-xs font-medium transition"
                >
                  <LogOut className="w-3.5 h-3.5" /> Đăng xuất
                </button>
              </div>
            </div>
          </nav>

          {/* Điều hướng View dựa vào Role */}
          {user.role === 'admin' ? <AdminDashboard /> : <CustomerStorefront />}
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
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Xử lý submit cho Login và Register
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const isRegister = authMode === 'register';
    const endpoint = isRegister ? '/auth/register' : '/auth/login';

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          ...(isRegister && { full_name: formData.full_name })
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đã có lỗi xảy ra');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast.success(isRegister ? '🎉 Đăng ký tài khoản thành công!' : '🔑 Đăng nhập thành công!');

      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 300);

    } catch (err) {
      setError(err.message);
      toast.error(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Bước 1: Yêu cầu mã OTP 6 số Quên mật khẩu
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      // 🟢 Đọc Response JSON DUY NHẤT 1 LẦN tại đây
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không thể gửi yêu cầu đặt lại mật khẩu');

      // Tự động lấy mã OTP 6 số điền trước vào state cho tiện test
      const otpCode = data.reset_token || '';
      setFormData(prev => ({ ...prev, token: otpCode }));

      toast.success(`🎉 Mã xác thực OTP của bạn là: ${otpCode}`);
      setAuthMode('reset');
    } catch (err) {
      setError(err.message);
      toast.error(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Đặt lại Mật khẩu mới bằng Mã OTP 6 số
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.token.trim().length !== 6) {
      const errMsg = 'Mã OTP xác thực phải bao gồm đúng 6 chữ số';
      setError(errMsg);
      toast.error(`❌ ${errMsg}`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email,
          token: formData.token.trim(),
          new_password: formData.new_password 
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đặt lại mật khẩu thất bại');

      toast.success('🎉 Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      setAuthMode('login');
      setFormData(prev => ({ ...prev, password: '', token: '', new_password: '' }));
    } catch (err) {
      setError(err.message);
      toast.error(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header Section */}
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
          <p className="text-xs text-slate-400">
            {authMode === 'login' && 'Chào mừng bạn quay trở lại'}
            {authMode === 'register' && 'Đăng ký tài khoản để bắt đầu trải nghiệm mua sắm'}
            {authMode === 'forgot' && 'Nhập email để nhận mã OTP 6 số khôi phục'}
            {authMode === 'reset' && 'Nhập mã OTP 6 số và mật khẩu mới của bạn'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Form Đăng nhập / Đăng ký */}
        {(authMode === 'login' || authMode === 'register') && (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Họ và tên</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-slate-300">Mật khẩu</label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot'); setError(''); }}
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
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
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
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email khôi phục</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
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

        {/* Form Đặt lại mật khẩu bằng Mã OTP 6 số */}
        {authMode === 'reset' && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Mã OTP Xác Thực (6 Chữ Số)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="VD: 495916"
                  value={formData.token}
                  onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white font-mono tracking-widest focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mật khẩu mới</label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.new_password}
                  onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
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
              onClick={() => { setAuthMode('login'); setError(''); }}
              className="text-slate-400 hover:text-white flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại đăng nhập
            </button>
          )}

          {authMode === 'login' && (
            <button
              onClick={() => { setAuthMode('register'); setError(''); }}
              className="text-indigo-400 hover:underline ml-auto"
            >
              Chưa có tài khoản? Đăng ký ngay
            </button>
          )}

          {authMode === 'forgot' && (
            <button
              onClick={() => { setAuthMode('reset'); setError(''); }}
              className="text-indigo-400 hover:underline ml-auto"
            >
              Đã có mã OTP? Đặt lại ngay
            </button>
          )}
        </div>

      </div>
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
                className={`bg-slate-800/60 border rounded-2xl p-5 flex flex-col justify-between transition ${
                  isOutOfStock ? 'border-rose-500/30 opacity-75' : 'border-slate-700/60 hover:border-indigo-500/50'
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
                  className={`mt-4 w-full py-2.5 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                    isOutOfStock
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
                  <div key={item.id || item.product_id} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-medium text-white">{item.product_name || item.name}</p>
                      <p className="text-slate-400">{item.quantity} x {new Intl.NumberFormat('vi-VN').format(item.price)}đ</p>
                    </div>
                    <span className="font-bold text-emerald-400">
                      {new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)}đ
                    </span>
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
                className={`w-full py-2.5 text-xs font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2 ${
                  cart.length === 0 || checkoutStatus.loading
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
   3. TRANG DASHBOARD QUẢN LÝ DÀNH CHO ADMIN
   ========================================================================= */
function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('desc');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '' });
  const [formError, setFormError] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, minPrice, maxPrice, sortBy, order]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

  const handleSubmit = async (e) => {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Có lỗi xảy ra');
      }

      if (editingProduct) {
        toast.success(`✏️ Cập nhật "${formData.name}" thành công!`);
      } else {
        toast.success(`🎉 Thêm sản phẩm "${formData.name}" thành công!`);
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      setFormError(err.message);
      toast.error(`❌ ${err.message}`);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${name || id}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Không thể xóa sản phẩm');
      }

      toast.info(`🗑️ Đã xóa sản phẩm khỏi cơ sở dữ liệu!`);
      fetchProducts();
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
      <div className="flex justify-between items-center bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản Lý Sản Phẩm</h1>
          <p className="text-xs text-slate-400">Quyền Admin: Tạo, chỉnh sửa, xóa dữ liệu</p>
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
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
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
            <RefreshCw className={`w-4 h-4 text-slate-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bảng Dữ Liệu Admin */}
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
            {loading ? (
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
                      onClick={() => handleDelete(product.id, product.name)}
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

      {/* Modal Thêm/Sửa */}
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

            <form onSubmit={handleSubmit} className="space-y-4">
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
    </div>
  );
}