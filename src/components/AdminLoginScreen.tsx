import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import {
  AdminCredentials,
  validateAdminLogin,
} from '../utils/storeLogic';

interface AdminLoginScreenProps {
  expectedCredentials: AdminCredentials;
  onLoginSuccess: () => void;
  onBackToStore: () => void;
}

export const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({
  expectedCredentials,
  onLoginSuccess,
  onBackToStore,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateAdminLogin(username, password, expectedCredentials);
    if (!check.valid) {
      setError(check.error || 'Thông tin đăng nhập không hợp lệ.');
      return;
    }
    setError('');
    onLoginSuccess();
  };

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-3xl bg-white border-2 border-dashed border-[#F4B8C6] p-8 shadow-sm">
        <button
          type="button"
          onClick={onBackToStore}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7D4E57] hover:text-[#E14B68] mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Quay về cửa hàng Handmade PA</span>
        </button>

        <div className="flex items-center gap-2.5 text-[#E14B68] mb-2">
          <Lock className="h-5 w-5" />
          <span className="font-mono-tabular text-xs font-semibold">
            /adminpa · CỔNG QUẢN TRỊ NỘI BỘ
          </span>
        </div>

        <h1 className="font-serif-display text-2xl font-bold text-[#4A252B]">
          Đăng Nhập Quản Trị Viên
        </h1>
        <p className="mt-1.5 text-xs text-[#6E3B44] leading-relaxed">
          Trang quản trị dành riêng cho người bán Handmade PA. Vui lòng nhập tài khoản quản trị để cập nhật sản phẩm, quản lý ảnh Google Drive và đối soát đơn hàng.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-medium text-red-700"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="adminpa-username"
              className="block text-xs font-semibold text-[#4A252B] mb-1.5"
            >
              Tên đăng nhập quản trị *
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C47E8C]" />
              <input
                id="adminpa-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập (ví dụ: adminpa)"
                className="w-full rounded-xl border border-[#F5C6D0] pl-10 pr-4 py-2.5 text-sm text-[#4A252B] focus:border-[#E14B68] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="adminpa-password"
              className="block text-xs font-semibold text-[#4A252B] mb-1.5"
            >
              Mật khẩu quản trị *
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C47E8C]" />
              <input
                id="adminpa-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full rounded-xl border border-[#F5C6D0] pl-10 pr-10 py-2.5 text-sm text-[#4A252B] focus:border-[#E14B68] focus:outline-none"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C47E8C] hover:text-[#4A252B]"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-full bg-[#E14B68] px-5 py-3 text-sm font-semibold text-white hover:bg-[#C83754] transition-colors"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Đăng nhập vào /adminpa</span>
          </button>
        </form>

        {/* Helpful Seller Account Info Box */}
        <div className="mt-6 rounded-2xl bg-[#FFF6F8] border border-dashed border-[#F4B8C6] p-4 text-xs text-[#6E3B44] space-y-1.5">
          <div className="font-semibold text-[#4A252B]">
            Thông tin tài khoản quản trị mặc định:
          </div>
          <div className="flex items-center justify-between">
            <span>Tên đăng nhập: <strong className="font-mono-tabular text-[#4A252B]">{expectedCredentials.username}</strong></span>
            <span>Mật khẩu: <strong className="font-mono-tabular text-[#4A252B]">{expectedCredentials.password}</strong></span>
          </div>
          <button
            type="button"
            onClick={() => {
              setUsername(expectedCredentials.username);
              setPassword(expectedCredentials.password);
              setError('');
            }}
            className="mt-1 text-[#E14B68] font-semibold hover:underline"
          >
            Điền nhanh tài khoản quản trị mẫu
          </button>
        </div>
      </div>
    </section>
  );
};
