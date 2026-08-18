import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { STORAGE_KEYS } from '../../core/constants/storageKeys';
import { profileApi } from '../../modules/profile/api/profileApi';
import type { Theme } from '../../modules/profile/types';

const THEME_STORAGE_KEY = 'theme';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyThemeClass(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

function readStoredTheme(): Theme | null {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'dark' || stored === 'light' ? stored : null;
}

/**
 * F.1.1 — Cung cấp theme hiện tại + hàm toggle cho toàn app.
 * Thứ tự ưu tiên khi tải trang (BR-02): localStorage thiết bị hiện tại > giá trị đồng bộ từ Backend
 * (chỉ khi thiết bị này chưa từng chọn gì và khách hàng đã đăng nhập) > mặc định Light (BR-01).
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme() ?? 'light');

  useEffect(() => {
    if (readStoredTheme() !== null) return;

    const isAuthenticated = Boolean(localStorage.getItem(STORAGE_KEYS.customer.accessToken));
    if (!isAuthenticated) return;

    profileApi.getProfile()
      .then((response) => {
        const serverTheme: Theme = response.data.theme === 'dark' ? 'dark' : 'light';
        localStorage.setItem(THEME_STORAGE_KEY, serverTheme);
        setTheme(serverTheme);
      })
      .catch(() => {
        // Không lấy được hồ sơ (vd token hết hạn) — giữ nguyên mặc định Light, không chặn app.
      });
  }, []);

  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_STORAGE_KEY, next);

      // BR-03: đổi giao diện ngay, đồng bộ Backend chạy ngầm (fire-and-forget), không chặn/không rollback.
      if (localStorage.getItem(STORAGE_KEYS.customer.accessToken)) {
        profileApi.updateTheme({ theme: next }).catch(() => {});
      }

      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
