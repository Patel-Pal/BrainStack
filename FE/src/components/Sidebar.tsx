import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaBookOpen,
  FaFileAlt,
  FaTasks,
  FaChartBar,
  FaCog,
  FaTimes,
  FaSignOutAlt,
} from 'react-icons/fa';

interface SidebarProps {
  closeSidebar?: () => void;
}

const Sidebar = ({ closeSidebar }: SidebarProps) => {
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: 'Overview', icon: <FaBookOpen /> },
    { path: '/', label: 'Content', icon: <FaFileAlt /> },
    { path: '/', label: 'Assignments', icon: <FaTasks /> },
    { path: '/', label: 'Grades', icon: <FaChartBar /> },
    { path: '/profile-settings', label: 'Profile Settings', icon: <FaCog /> },
  ];

  const handleLogout = () => {
    sessionStorage.clear(); // ✅ Clear session
    navigate('/login'); // 🔁 Redirect to login
  };

  return (
    <aside className="h-full p-6 w-64 bg-white shadow-lg overflow-y-auto relative transition-transform duration-300 ease-in-out">
      {/* Close button for mobile */}
      <button
        className="md:hidden absolute top-4 right-4 text-gray-600"
        onClick={closeSidebar}
        aria-label="Close Sidebar"
      >
        <FaTimes />
      </button>

      <h1 className="text-2xl font-bold text-indigo-600 mb-8">EduHub</h1>

      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.label}>
            <NavLink
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-lg ${
                  isActive
                    ? 'bg-indigo-100 text-indigo-700 font-semibold'
                    : 'hover:bg-gray-100 text-gray-700'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}

        {/* ✅ Logout Item */}
        <li>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded-lg text-lg text-red-600 hover:bg-red-100 transition-all duration-200 w-full"
          >
            <span className="text-xl">
              <FaSignOutAlt />
            </span>
            <span>Logout</span>
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
