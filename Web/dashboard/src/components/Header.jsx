import { Bell, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-green-600 text-white px-4 py-3 flex items-center justify-between">
      {/* Logo + Search */}
      <div className="flex items-center space-x-4">
        <img src="/logo.png" alt="Logo" className="h-10" />
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm thông tin"
            className="pl-4 pr-8 py-1 rounded-full bg-green-300 text-black"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2">
            🔍
          </span>
        </div>
      </div>

      {/* Notification + User */}
      <div className="flex items-center space-x-4">
        <Bell />
        <User />
      </div>
    </header>
  );
}
