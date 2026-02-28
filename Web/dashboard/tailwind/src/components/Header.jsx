import React from 'react';
import { Bell, UserCircle } from 'lucide-react';

export default function Header() {
  return (
    <div className="bg-emerald-600 text-white flex justify-between items-center px-4 py-2">
      <input
        type="text"
        placeholder="Tìm kiếm thông tin"
        className="px-3 py-1 rounded text-black w-1/3"
      />
      <div className="flex items-center gap-4">
        <Bell className="cursor-pointer" />
        <UserCircle className="cursor-pointer" />
        <span>Hoàng Mạnh Quân</span>
      </div>
    </div>
  );
}
