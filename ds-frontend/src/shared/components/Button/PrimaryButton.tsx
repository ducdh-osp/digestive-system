import React from 'react';
import { Button } from 'antd';
import type { ButtonProps } from 'antd';

interface PrimaryButtonProps extends Omit<ButtonProps, 'type' | 'size' | 'color' | 'variant'> {
  color?: 'blue' | 'indigo';
  variant?: 'solid' | 'outline';
  fullWidth?: boolean;
}

const SOLID_CLASSES: Record<string, string> = {
  blue: 'bg-blue-600 hover:bg-blue-500 border-0',
  indigo: 'bg-indigo-600 hover:bg-indigo-500 border-0',
};

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  color = 'blue',
  variant = 'solid',
  fullWidth = true,
  className = '',
  children,
  ...rest
}) => {
  const variantClass = variant === 'solid'
    ? `${SOLID_CLASSES[color]} text-white`
    : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:border-gray-400 dark:hover:border-slate-500 hover:text-gray-800 dark:hover:text-white';

  return (
    <Button
      type={variant === 'solid' ? 'primary' : 'default'}
      size="large"
      className={`${fullWidth ? 'w-full' : ''} h-12 rounded-lg font-semibold text-base transition-all shadow-md hover:shadow-lg ${variantClass} ${className}`}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default PrimaryButton;
