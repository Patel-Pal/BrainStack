import { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { MdCloudUpload } from 'react-icons/md';
import { toast } from 'react-toastify';


interface RegisterForm {
  name: string;
  address: string;
  email: string;
  password: string;
  course: string;
  profileImage?: File | null;
}

const Register = () => {
  const navigate = useNavigate();
    const [preview, setPreview] = useState<string | null>(null);

  const [form, setForm] = useState<RegisterForm>({
    name: '',
    address: '',
    email: '',
    password: '',
    course: '',
    profileImage: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, profileImage: file }));
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('address', form.address);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('course', form.course);
      if (form.profileImage) {
        formData.append('profileImage', form.profileImage);
      }

      await axiosInstance.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Registered successfully!');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className=' py-10  bg-gray-50'>
    <div className="min-h-screen flex items-center justify-center  ">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow">
        <h2 className="text-2xl font-bold text-center mb-6">Create your EduHub account</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-md"
          />
          <input
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-md"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-md"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-md"
          />
          <select
            name="course"
            value={form.course}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-md"
          >
            <option value="">Select Course</option>
            <option value="BCA">BCA</option>
            <option value="MCA">MCA</option>
            <option value="BSc IT">BSc IT</option>
            <option value="MSc CS">MSc CS</option>
          </select>

{/* Profile Image Upload */}
<div className="flex items-center gap-4">
  {preview ? (
    <img
      src={preview}
      alt="Preview"
      className="h-12 w-16 rounded-full object-cover border border-gray-300"
    />
  ) : (
    <div className="h-12 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border border-gray-300">
      <MdCloudUpload size={24} />
    </div>
  )}

  <div className="w-full">
    <label
      htmlFor="profileImage"
      className="cursor-pointer flex items-center gap-2 w-full px-4 py-2 border border-dashed border-gray-500 text-gray-500 rounded-md hover:bg-blue-50 transition"
    >
      <MdCloudUpload className="text-xl" />
      <span className="text-sm font-medium">Upload Profile Image</span>
    </label>
    <input
      id="profileImage"
      type="file"
      accept="image/*"
      onChange={handleFileChange}
      className="hidden"
    />
  </div>
</div>

          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            Sign Up
          </button>
        </form>

         {/* Social Buttons Row */}
        <div className="mt-6 flex justify-between gap-4">
          <button className="w-1/2 bg-gray-100 py-2 rounded-md hover:bg-gray-200 flex items-center justify-center gap-2">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" className="h-5 w-5" />
            <span className="text-sm font-medium">Google</span>
          </button>
          <button className="w-1/2 bg-gray-100 py-2 rounded-md hover:bg-gray-200 flex items-center justify-center gap-2">
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" alt="GitHub" className="h-5 w-5" />
            <span className="text-sm font-medium">GitHub</span>
          </button>
        </div>

        {/* Link to login */}
        <p className="text-center text-sm mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
    </div>
  );
};

export default Register;
