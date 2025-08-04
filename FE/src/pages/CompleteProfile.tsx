import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

interface ProfileForm {
  address: string;
  course: string;
}

const CompleteProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState<ProfileForm>({ address: '', course: '' });

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    if (token) {
      sessionStorage.setItem('token', token);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      navigate('/login');
    }
  }, [location, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put('/auth/complete-profile', form);
      const newToken = response.data.token; // Get new token from response
      if (newToken) {
        sessionStorage.setItem('token', newToken); // Update token in sessionStorage
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`; // Update axios headers
      }
      toast.success('Profile completed successfully!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to complete profile');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow">
        <h2 className="text-2xl font-bold text-center mb-6">Complete Your EduHub Profile</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-md"
            required
          />
          <select
            name="course"
            value={form.course}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded-md"
            required
          >
            <option value="">Select Course</option>
            <option value="BCA">BCA</option>
            <option value="MCA">MCA</option>
            <option value="BSc IT">BSc IT</option>
            <option value="MSc CS">MSc CS</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            Complete Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;