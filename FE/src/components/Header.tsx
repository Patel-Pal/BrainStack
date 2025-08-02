import { useEffect, useState } from 'react';
import { FaBars, FaUserCircle } from 'react-icons/fa'; // ✅ FaUserCircle icon
import { jwtDecode } from 'jwt-decode';

interface HeaderProps {
  onMenuClick: () => void;
}

interface DecodedToken {
  profileImage?: string;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        setProfileImage(decoded.profileImage || null);
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
  }, []);

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
        {/* breadcrumb */}
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search"
          className="border px-3 py-1 rounded-md text-sm"
        />
        {profileImage ? (
          <img
            src={profileImage}
            alt="Profile"
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <FaUserCircle className="h-8 w-8 text-gray-400" /> // 👈 Fallback icon
        )}
      </div>
    </header>
  );
};

export default Header;
