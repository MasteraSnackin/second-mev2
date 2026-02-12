'use client';

export function LoginButton() {
  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  return (
    <button
      onClick={handleLogin}
      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
    >
      使用 SecondMe 登录
    </button>
  );
}

export function LogoutButton() {
  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
    >
      登出
    </button>
  );
}
