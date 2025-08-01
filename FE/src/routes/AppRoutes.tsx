import { Routes, Route } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ProfileSettings from '../pages/ProfileSetting';
import Layout from '../components/Layout';

const AppRoutes = () => {
  return (
    <Routes>
      {/* No layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* With sidebar + header layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<div className="text-center mt-10">Welcome to Learning Platform</div>} />
        <Route path="/profile-settings" element={<ProfileSettings />} />
        {/* Add more nested routes here */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;
