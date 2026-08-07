import React, { useState, useEffect } from 'react';
import { Button, message, Input } from 'antd';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import type { RegisterRequest, VerifyOtpRequest } from '../types';

const VerifyOtpPage: React.FC = () => {
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
      message.success('Đã gửi lại mã OTP');
      setTimeLeft(180); // Reset timer
    } catch (error: any) {
      if (error.status === 429) {
        message.error('Bạn đã vượt quá số lần nhận mã trong ngày.');
      } else {
        message.error('Hệ thống đang bận, vui lòng thử lại sau');
      }
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
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        message.success('Xác thực và đăng nhập thành công!');
        navigate('/');
      }
    } catch (error: any) {
      if (error.status === 400) {
        message.error('Mã xác thực không đúng. Vui lòng kiểm tra lại.');
      } else if (error.status === 410) {
        message.error('Mã xác thực đã hết hạn. Vui lòng bấm gửi lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full text-center">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Xác thực số điện thoại</h2>
        <p className="text-gray-500 mt-4 leading-relaxed">
          Mã OTP 6 số đã được gửi tới SĐT <br/>
          <strong className="text-gray-800 text-lg">{registerData.phoneNumber}</strong>
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

      <div className="mb-8 text-gray-600 font-medium">
        Gửi lại mã sau:{' '}
        <span className={`${timeLeft > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
          {formatTime(timeLeft)}
        </span>
      </div>

      <Button
        type="default"
        onClick={handleResendOtp}
        disabled={timeLeft > 0 || loading}
        className="w-full h-12 rounded-lg font-semibold text-base"
      >
        Gửi lại mã
      </Button>
    </div>
  );
};

export default VerifyOtpPage;
