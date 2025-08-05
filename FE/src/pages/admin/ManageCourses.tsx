import React, { useState, useEffect } from 'react';
import axiosInstance from "../../api/axiosInstance";
import { Switch } from '@headlessui/react';

const ManageCourses = () => {
  const [form, setForm] = useState({
    name: '',
    description: ''
  });
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axiosInstance.get('/courses');
      setCourses(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch courses');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axiosInstance.post('/courses/add', form, {
        withCredentials: true
      });

      if (response.data.success) {
        setSuccess(response.data.message);
        setForm({ name: '', description: '' });
        fetchCourses();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add course');
    }
  };

  const handleToggleStatus = async (courseId: string) => {
    try {
      const response = await axiosInstance.patch(`/courses/${courseId}/toggle-status`, {}, {
        withCredentials: true
      });

      if (response.data.success) {
        setSuccess(response.data.message);
        fetchCourses();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle course status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-5">
      <div className="w-full max-w-4xl">
        <h2 className="text-3xl font-bold mb-8 text-black">Manage Courses</h2>

        {error && <div className="mb-4 text-red-500">{error}</div>}
        {success && <div className="mb-4 text-green-500">{success}</div>}

        {/* Form without Professor ID */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 border border-gray-400 rounded-lg p-6 mb-10"
        >
          <h3 className="text-xl font-semibold mb-6 text-black">Add New Course</h3>

          <div className="mb-5">
            <label className="block text-black font-medium mb-2">Course Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter course name"
              className="w-full p-3 rounded-md bg-gray-100 focus:outline-none text-black"
              required
            />
          </div>

          <div className="mb-5">
            <label className="block text-black font-medium mb-2">Course Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter course description"
              className="w-full p-3 rounded-md bg-gray-100 focus:outline-none text-black"
              rows={3}
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="mt-2 px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Add Course
          </button>
        </form>

        {/* Table */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-black">Existing Courses</h3>
          <div className="overflow-x-auto">
            {courses.length > 0 ? (
              <table className="min-w-full text-left border border-gray-400 rounded-md overflow-hidden mb-12">
                <thead className="bg-gray-100 text-sm font-semibold text-black">
                  <tr>
                    <th className="px-4 py-3">Course Name</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Professor ID</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-800 bg-white">
                  {courses.map((course: any, index: number) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="px-4 py-3">{course.name}</td>
                      <td className="px-4 py-3">{course.description}</td>
                      <td className="px-4 py-3">{course.professor || 'None'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${course.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {course.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Switch
                          checked={course.isActive}
                          onChange={() => handleToggleStatus(course._id)}
                          className={`${course.isActive ? 'bg-green-500' : 'bg-gray-300'
                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none`}
                        >
                          <span
                            className={`${course.isActive ? 'translate-x-6' : 'translate-x-1'
                              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                          />
                        </Switch>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            ) : (
              <div className="text-gray-600 text-center p-4 border border-gray-200 rounded-md bg-white">
                No courses found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCourses;