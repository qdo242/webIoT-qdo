import React from 'react';

export default function NotificationCard() {
  return (
    <div className="bg-white rounded shadow p-4 w-80">
      <h2 className="font-bold text-lg mb-2">Thông báo</h2>
      <div className="text-sm text-gray-700">
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Tất cả</span>
        <p className="mt-2">🌱 Vườn 1 đang có cây bị bệnh</p>
      </div>
      <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded">Xem tất cả</button>
    </div>
  );
}
