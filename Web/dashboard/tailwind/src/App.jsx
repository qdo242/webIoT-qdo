import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import NotificationCard from './components/NotificationCard';
import WeatherCard from './components/WeatherCard';

function App() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 bg-gray-100">
        <Header />
        <div className="p-4 flex gap-4">
          <WeatherCard />
          <NotificationCard />
        </div>
      </div>
    </div>
  );
}

export default App;
