import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { Switch } from '@headlessui/react';

interface Course {
    _id: string;
    name: string;
    isActive: boolean;
}

interface Professor {
    _id: string;
    name: string;
    email: string;
    course: string;
    isActive: boolean;
}

const AddProfessorForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        course: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [courses, setCourses] = useState<Course[]>([]);
    const [professors, setProfessors] = useState<Professor[]>([]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axiosInstance.get("/courses");
                const active = res.data.data.filter((c: Course) => c.isActive);
                setCourses(active);
            } catch {
                toast.error("Failed to fetch courses");
            }
        };

        fetchCourses();
        fetchProfessors();
    }, []);

    const fetchProfessors = async () => {
        try {
            const res = await axiosInstance.get("/auth/professors");
            setProfessors(res.data.professors || []);
        } catch {
            toast.error("Failed to fetch professors");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await axiosInstance.post("/auth/register-professor", formData);
            setMessage(res.data.message);
            setFormData({ name: "", email: "", password: "", course: "" });
            fetchProfessors();
            toast.success("Professor added successfully");
        } catch (err: any) {
            setMessage(err.response?.data?.message || "Something went wrong");
            toast.error(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (professorId: string) => {
        try {
            await axiosInstance.put(`/auth/professors/${professorId}/toggle-status`);
            fetchProfessors();
            toast.success("Professor status updated");
        } catch {
            toast.error("Failed to update status");
        }
    };

    const getCourseName = (courseId: string) => {
        const course = courses.find((c) => c._id === courseId);
        return course ? course.name : "None";
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 overflow-hidden">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Add Professor</h1>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter professor's full name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 bg-gray-50 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-gray-700 mb-1">Email ID</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter professor's email address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 bg-gray-50 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Set a password for the professor"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 bg-gray-50 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>

                        <div>
                            <label className="block font-medium text-gray-700 mb-1">Course</label>
                            <select
                                name="course"
                                value={formData.course}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 bg-gray-50 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="">Select Course</option>
                                {courses.map((course) => (
                                    <option key={course._id} value={course._id}>
                                        {course.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-full shadow"
                            disabled={loading}
                        >
                            {loading ? "Adding..." : "Add Professor"}
                        </button>
                    </div>

                    {message && <p className="text-center text-sm text-red-500 mt-4">{message}</p>}
                </form>

                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Existing Professors</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto border border-gray-200 rounded-lg">
                            <thead>
                                <tr className="bg-gray-100 text-gray-700">
                                    <th className="py-2 px-4 text-left">Name</th>
                                    <th className="py-2 px-4 text-left">Email</th>
                                    <th className="py-2 px-4 text-left">Course</th>
                                    <th className="py-2 px-4 text-left">Status</th>
                                    <th className="py-2 px-4 text-left">Toggle</th>
                                </tr>
                            </thead>
                            <tbody>
                                {professors.length > 0 ? (
                                    professors.map((prof) => (
                                        <tr key={prof._id} className="border-t text-gray-800">
                                            <td className="py-2 px-4">{prof.name}</td>
                                            <td className="py-2 px-4">{prof.email}</td>
                                            <td className="py-2 px-4">{getCourseName(prof.course)}</td>
                                            <td className="py-2 px-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                        prof.isActive
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                                >
                                                    {prof.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="py-2 px-4">
                                                <Switch
                                                    checked={prof.isActive}
                                                    onChange={() => toggleStatus(prof._id)}
                                                    className={`${prof.isActive ? 'bg-green-500' : 'bg-gray-300'
                                                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none`}
                                                >
                                                    <span
                                                        className={`${prof.isActive ? 'translate-x-6' : 'translate-x-1'
                                                            } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                                                    />
                                                </Switch>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-6 text-gray-500">
                                            No professors found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddProfessorForm;