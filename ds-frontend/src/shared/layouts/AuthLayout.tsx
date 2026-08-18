import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authBg from '../assets/auth-bg.png';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import LanguageSwitcher from '../components/LanguageSwitcher/LanguageSwitcher';

const AuthLayout: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 relative">
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>

      {/* Left Side - Image/Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-blue-900 overflow-hidden">
        <img
          src={authBg}
          alt="Medical AI Background"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white h-full">
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight">{t('auth.brandTitle')}</h1>
          <p className="text-xl font-light text-blue-100 max-w-lg leading-relaxed">
            {t('auth.brandSubtitle')}
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8 sm:p-12 lg:p-24 bg-white dark:bg-slate-900 shadow-2xl z-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
