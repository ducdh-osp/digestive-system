import React from 'react';
import { Button } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';

interface LogoutButtonProps {
  onClick: () => void;
  /** 'onColor' cho header nền màu/tối, 'onLight' cho header nền trắng */
  theme?: 'onColor' | 'onLight';
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onClick, theme = 'onColor', className = '' }) => {
  const themeClass = theme === 'onColor'
    ? 'bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/60'
    : '';

  return (
    <Button
      danger={theme === 'onLight'}
      icon={<LogoutOutlined />}
      onClick={onClick}
      className={`font-medium ${themeClass} ${className}`}
    >
      Đăng xuất
    </Button>
  );
};

export default LogoutButton;
