import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from './api/axiosInstance';
import { toast } from 'react-toastify';
import {jwtDecode} from 'jwt-decode'; // Use ES Module import

interface DecodedToken {
  userId: string;
  name: string;
  address: string;
  email: string;
  role: string;
  course: string;
  isActive: boolean;
  profileImage?: string;
  iat: number;
  exp: number;
}

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessingToken, setIsProcessingToken] = useState(false); // Prevent multiple navigations

  useEffect(() => {
    // console.log('App useEffect - Current location:', location);
    // console.log('App useEffect - location.search:', location.search);
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    const error = query.get('error');
    // console.log('App useEffect - Query params:', { token, error });

    if (isProcessingToken) {
      // console.log('App: Skipping token processing, already in progress');
      return;
    }

    if (token && !sessionStorage.getItem('token')) {
      setIsProcessingToken(true);
      try {
        const decoded: DecodedToken = jwtDecode(token);
        // console.log('App: Decoded token:', decoded);
        sessionStorage.setItem('token', token);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // console.log('App: Token stored and axios headers updated:', token);
        toast.success('Login successful');

        const isProfileComplete = decoded.address && decoded.course;
        const redirectPath = isProfileComplete ? '/' : '/complete-profile';

        // console.log('App: Redirecting to:', redirectPath);
        navigate(redirectPath, { replace: true });
      } catch (err) {
        console.error('App: Token Storage Error:', err);
        toast.error('Failed to process login token');
        navigate('/login', { replace: true });
      } finally {
        setIsProcessingToken(false);
      }
    } else if (error) {
      console.error('App: Google Auth Error:', error);
      toast.error('Google authentication failed');
      navigate('/login', { replace: true });
    } else if (!sessionStorage.getItem('token') && location.pathname !== '/login' && location.pathname !== '/register') {
      // console.log('App: No token found, redirecting to /login');
      navigate('/login', { replace: true });
    }
  }, [location, navigate, isProcessingToken]);
  return (
    <>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  )
};

export default App;
