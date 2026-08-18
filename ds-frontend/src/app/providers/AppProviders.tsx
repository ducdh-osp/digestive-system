import { useEffect, type ReactNode } from 'react';
import { App as AntdApp, ConfigProvider, theme as antdTheme } from 'antd';
import viVN from 'antd/locale/vi_VN';
import enUS from 'antd/locale/en_US';
import { useTranslation } from 'react-i18next';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { setMessageApi } from '../../core/api/messageBridge';

/**
 * Cầu nối giữa ThemeProvider/i18n (state của app) và antd `ConfigProvider` — để các component antd
 * (Button, Input, Popover, Dropdown...) tự đổi theo Dark/Light (F.1.1) và Việt/Anh (F.1.2) mà không
 * phải sửa tay từng component. Đặt ở gốc app, các `ConfigProvider` lồng bên trong từng Layout (token
 * màu thương hiệu riêng của CustomerLayout/AdminLayout) vẫn kế thừa `algorithm`/`locale` từ đây.
 */
function AntdThemeBridge({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const { i18n } = useTranslation();

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        // AntD dark algorithm mặc định để text phụ (Typography type="secondary", mô tả...) rất mờ
        // (~45% trắng) — trên nền gần đen (slate-900/950) của app thì khó đọc. Tăng độ sáng lên một
        // bậc cho toàn bộ text phụ/mô tả trong Dark Mode, không đổi gì ở Light Mode.
        token: theme === 'dark'
          ? { colorTextSecondary: 'rgba(255, 255, 255, 0.75)', colorTextDescription: 'rgba(255, 255, 255, 0.65)' }
          : {},
      }}
      locale={i18n.language === 'en' ? enUS : viVN}
    >
      <AntdApp>
        <MessageApiBridge>{children}</MessageApiBridge>
      </AntdApp>
    </ConfigProvider>
  );
}

/**
 * `App.useApp()` chỉ hoạt động trong component con của `<App>` — "bơm" instance `message` của nó
 * (theme-aware, vì `<App>` nằm trong `ConfigProvider` ở trên) vào messageBridge để `axiosClient.ts`
 * (module thường, không phải component) dùng lại thay cho `message` tĩnh của antd.
 */
function MessageApiBridge({ children }: { children: ReactNode }) {
  const { message } = AntdApp.useApp();

  useEffect(() => {
    setMessageApi(message);
  }, [message]);

  return children;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AntdThemeBridge>{children}</AntdThemeBridge>
    </ThemeProvider>
  );
}
