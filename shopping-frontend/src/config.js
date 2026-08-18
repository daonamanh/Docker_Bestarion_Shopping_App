// Cấu hình URL gốc cho API. Nếu đang chạy ở localhost, dùng cổng 8080 của backend;
// nếu không, vẫn fallback về localhost để tránh lỗi khi dev trong môi trường container.
// Cấu hình URL gốc cho API. Nếu đang chạy ở localhost, dùng cổng 8080 của backend;
// nếu không, vẫn fallback về localhost để tránh lỗi khi dev trong môi trường container.
const getDefaultApiBaseUrl = () => {
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
    return 'http://127.0.0.1:8082/api/v1';
  }
  return 'http://localhost:8082/api/v1';
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || getDefaultApiBaseUrl();

// Tạo header chuẩn cho request có kèm token xác thực nếu người dùng đã đăng nhập.
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const getAuthHeaderOnly = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};
