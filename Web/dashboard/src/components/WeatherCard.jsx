import React from 'react';

export default function WeatherCard() {
  return (
    <div className="bg-white rounded shadow p-4 w-fit">
      <h2 className="font-semibold">Monday | February 28</h2>
      <div className="grid grid-cols-5 gap-4 mt-2 text-center text-sm">
        {['Now', '10:00', '11:00', '12:00', '13:00'].map((time) => (
          <div key={time}>
            🌤️
            <div>20°/25°</div>
            <div>69% rain</div>
            <div>{time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
