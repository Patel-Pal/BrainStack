import { FaBars } from 'react-icons/fa';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="bg-white shadow-sm flex items-center justify-between px-4 py-3 h-16">
      {/* Mobile menu button */}
      <button
        className="text-gray-600 text-xl md:hidden"
        onClick={onMenuClick}
        aria-label="Toggle Sidebar"
      >
        <FaBars />
      </button>

      <div className="text-sm text-gray-500 hidden md:block">
       
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search"
          className="border px-3 py-1 rounded-md text-sm"
        />
        <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
      </div>
    </header>
  );
};

export default Header;
