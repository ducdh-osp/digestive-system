import React, { useState, useEffect } from 'react';
import { Input } from 'antd';
import { getMessageApi } from '../../../core/api/messageBridge';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/authApi';
import type { RegisterRequest, VerifyOtpRequest } from '../types';
import { PrimaryButton } from '../../../shared/components/Button';
import { STORAGE_KEYS } from '../../../core/constants/storageKeys';

const VerifyOtpPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 180s countdown
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve temporary register data passed from RegisterPage
  const registerData = location.state as RegisterRequest;

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  if (!registerData || !registerData.phoneNumber) {
    // If accessed directly without going through register, redirect
    return <Navigate to="/register" replace />;
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0) return;
    try {
      setLoading(true);
      await authApi.register(registerData);
      getMessageApi().success(t('auth.verifyOtp.resendSuccess'));
      setTimeLeft(180); // Reset timer
    } catch {
      // Toast lỗi API đã được axiosClient hiển thị toàn cục.
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (otpCode: string) => {
    try {
      setLoading(true);
      const payload: VerifyOtpRequest = {
        phoneNumber: registerData.phoneNumber,
        fullName: registerData.fullName,
        password: registerData.password,
        otpCode: otpCode,
      };

      const response = await authApi.verifyOtp(payload);
      if (response.success && response.data) {
        localStorage.setItem(STORAGE_KEYS.customer.accessToken, response.data.accessToken);
        localStorage.setItem(STORAGE_KEYS.customer.refreshToken, response.data.refreshToken);
        localStorage.setItem(STORAGE_KEYS.customer.user, JSON.stringify(response.data.user));
        getMessageApi().success(t('auth.verifyOtp.verifySuccess'));
        navigate('/');
      }
    } catch {
      // Toast lỗi API đã được axiosClient hiển thị toàn cục.
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full text-center">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">{t('auth.verifyOtp.title')}</h2>
        <p className="text-gray-500 dark:text-slate-300 mt-4 leading-relaxed">
          {t('auth.verifyOtp.subtitlePrefix')} <br/>
          <strong className="text-gray-800 dark:text-slate-200 text-lg">{registerData.phoneNumber}</strong>
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <Input.OTP
          length={6}
          size="large"
          formatter={(str) => str.replace(/\D/g, '')}
          onChange={(text) => {
             if (text.length === 6) {
                onFinish(text);
             }
          }}
          disabled={loading}
        />
      </div>

      <div className="mb-8 text-gray-600 dark:text-slate-300 font-medium">
        {t('auth.verifyOtp.resendLabel')}{' '}
        <span className={`${timeLeft > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-400'}`}>
          {formatTime(timeLeft)}
        </span>
      </div>

      <PrimaryButton
        variant="outline"
        onClick={handleResendOtp}
        disabled={timeLeft > 0 || loading}
      >
        {t('auth.verifyOtp.resendButton')}
      </PrimaryButton>
    </div>
  );
};

export default VerifyOtpPage;
