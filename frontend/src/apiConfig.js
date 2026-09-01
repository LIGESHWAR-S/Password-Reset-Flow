export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
    return `http://${hostname}:5000/api/auth`;
  }
  // Production default fallback
  return 'https://password-reset-backend.onrender.com/api/auth';
};
