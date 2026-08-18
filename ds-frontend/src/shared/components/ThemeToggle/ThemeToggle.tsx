import { Button, Tooltip } from 'antd';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../app/providers/ThemeProvider';

interface ThemeToggleProps {
  className?: string;
}

/** F.1.1 — Nút bật/tắt Dark Mode, đặt cạnh LanguageSwitcher trên Header (CustomerLayout/AdminLayout/AuthLayout). */
const ThemeToggle = ({ className = '' }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === 'dark';
  const label = isDark ? t('theme.switchToLight') : t('theme.switchToDark');

  return (
    <Tooltip title={label}>
      <Button
        type="text"
        shape="circle"
        onClick={toggleTheme}
        icon={isDark ? <SunOutlined /> : <MoonOutlined />}
        aria-label={label}
        className={`!w-11 !h-11 !text-lg ${className}`}
      />
    </Tooltip>
  );
};

export default ThemeToggle;
