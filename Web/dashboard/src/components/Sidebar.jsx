import { Menu, Home, Leaf, RadioTower, Settings } from 'lucide-react';
import IconBtn from './iconbtn';

export default function Sidebar() {
  return (
    <aside className="bg-green-700 w-16 flex flex-col items-center py-4 text-white">
      <button className="mb-4 p-2 hover:bg-green-600 rounded-full">
        <Menu />
      </button>
      <div className="flex-1 space-y-6 mt-4">
        <IconBtn icon={<Home />} />
        <IconBtn icon={<Leaf />} />
        <IconBtn icon={<RadioTower />} />
      </div>
      <IconBtn icon={<Settings />} />
    </aside>
  );
}
