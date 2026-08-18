import { message as staticMessage } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';

/**
 * `axiosClient.ts` không phải component React nên không thể gọi hook `App.useApp()` của antd để lấy
 * instance `message` theo đúng theme/algorithm hiện tại (static `import { message } from 'antd'`
 * dùng holder DOM riêng, KHÔNG nằm trong cây `ConfigProvider` nên luôn hiện Toast nền trắng dù đang
 * Dark Mode). `MessageApiBridge` (đặt trong AppProviders) gọi `setMessageApi` ngay khi mount để
 * "bơm" instance theme-aware vào đây; trước thời điểm đó (hoặc nếu vì lý do gì App chưa mount) vẫn
 * fallback về API tĩnh để không bao giờ throw.
 */
let activeMessageApi: MessageInstance = staticMessage;

export function setMessageApi(api: MessageInstance) {
  activeMessageApi = api;
}

export function getMessageApi(): MessageInstance {
  return activeMessageApi;
}
