import { useState} from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });

 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post('/auth/login', form);
      sessionStorage.setItem('token', res.data.token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      toast.success('Login successful');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };  

  const handleGoogleLogin = () => {
    // console.log('Initiating Google login'); // Log for debugging
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleGithubLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/github';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow">
        <h2 className="text-2xl font-bold text-center mb-6">Welcome back to EduHub</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-md"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"  
            value={form.password}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-md"
          />
          <Link to="/forgot-password" className="text-sm text-gray-600 hover:underline">Forgot Password?</Link>
          <button
            type="submit"
            className="bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700 transition"
          >
            Login
          </button>
        </form>

        <div className="mt-6 flex justify-between gap-4">
          <button
            onClick={handleGoogleLogin}
            className="w-1/2 bg-gray-100 py-2 rounded-md hover:bg-gray-200 flex items-center justify-center gap-2"
          >
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" className="h-5 w-5" />
            <span className="text-sm font-medium">Google</span>
          </button>
          <button 
            onClick={handleGithubLogin} 
            className="w-1/2 bg-gray-100 py-2 rounded-md hover:bg-gray-200 flex items-center justify-center gap-2">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" className="h-5 w-5" />
            <span className="text-sm font-medium">GitHub</span>
          </button>
        </div>

        <p className="text-center text-sm mt-4">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;