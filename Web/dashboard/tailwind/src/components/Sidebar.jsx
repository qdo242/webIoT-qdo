import {Home, Leaf, RadioTower, Settings } from 'lucide-react';
import {Menu} from 'lucide-react';
export default function Sidebar() {
  return (
    <div className="bg-emerald-600 text-white w-16 min-h-screen flex flex-col items-center py-4">
      {/* Nút Menu */}
      <div className="mb-4">
        <button className="bg-emerald-600 p-2 rounded-full hover:bg-emerald-500">
          <Menu className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Các biểu tượng chính */}
      <div className="space-y-6 flex-1 mt-4">
        <IconBtn icon={<Home className="w-6 h-6" />} />
        <IconBtn icon={<Leaf className="w-6 h-6" />} />
        <IconBtn icon={<RadioTower className="w-6 h-6" />} />
      </div>

      {/* Biểu tượng Cài đặt */}
      <div className="mb-2">
        <IconBtn icon={<Settings className="w-6 h-6" />} />
      </div>
    </div>
  );
}

function IconBtn({ icon }) {
  return (
    <div className="p-2 rounded-full hover:bg-emerald-500 cursor-pointer transition">
      {icon}
    </div>
  );
}

