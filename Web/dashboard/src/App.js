import Sidebar from './components/Sidebar';
import Header from './components/Header';

export default function Dashboard() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-100">
        <Header />
        <main className="p-4">
          <h1 className="text-xl text-gray-800">Nội dung ở đây</h1>
        </main>
      </div>
    </div>
  );
}
