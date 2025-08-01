import { NavLink } from 'react-router-dom';
import { FaBookOpen, FaFileAlt, FaTasks, FaChartBar, FaCog, FaTimes } from 'react-icons/fa';

interface SidebarProps {
  closeSidebar?: () => void;
}

const Sidebar = ({ closeSidebar }: SidebarProps) => {
  const navItems = [
    { path: '/', label: 'Overview', icon: <FaBookOpen /> },
    { path: '/', label: 'Content', icon: <FaFileAlt /> },
    { path: '/', label: 'Assignments', icon: <FaTasks /> },
    { path: '/', label: 'Grades', icon: <FaChartBar /> },
    { path: '/profile-settings', label: 'Profile Settings', icon: <FaCog /> },
  ];

  return (
    <aside className="h-full p-6 w-64 bg-white shadow-lg overflow-y-auto relative">
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
          <li key={item.path}>
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
      </ul>
    </aside>
  );
};

export default Sidebar;
