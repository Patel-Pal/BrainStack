import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ProfileSettings from '../pages/ProfileSetting';
import Layout from '../components/Layout';
import CompleteProfile from '../pages/CompleteProfile';
import ManageCourses from '../pages/admin/ManageCourses';


// Inline protected route component
const PrivateRoute = () => {
  const token = sessionStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<div className="text-center mt-10">Welcome to Learning Platform</div>} />
          <Route path="/profile-settings" element={<ProfileSettings />} />
          

          <Route path="//manage-courses" element={<ManageCourses />} />
          {/* Add more protected routes here */}
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
