/**
 * Tên key lưu trong localStorage — tách riêng theo Customer/Admin để 2 phiên đăng nhập
 * không xung đột nhau trên cùng trình duyệt (xem BR-08, module A.1/A.3).
 */
export const STORAGE_KEYS = {
  customer: {
    accessToken: 'accessToken',
    refreshToken: 'refreshToken',
    user: 'user',
  },
  admin: {
    accessToken: 'adminAccessToken',
    refreshToken: 'adminRefreshToken',
    info: 'adminInfo',
  },
} as const;
