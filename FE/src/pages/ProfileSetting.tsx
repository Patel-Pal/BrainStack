import {  useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
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

const ProfileSettings = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [course, setCourse] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [currentProfileImage, setCurrentProfileImage] = useState<string>('');
  const [role, setRole] = useState(false);
  // const token = sessionStorage.getItem('token');


  // Fetch user data on mount
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    let userRole: string | null = null;

    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setName(decoded.name || '');
        setAddress(decoded.address || ''); // Populate address from token
        setCourse(decoded.course || '');
        setEmail(decoded.email || '');
        setCurrentProfileImage(decoded.profileImage || '');
        userRole = decoded.role || null;
        if (userRole === 'admin') {
          setRole(true);
        }
      } catch (err) {
        toast.error("Invalid token");
      }
    }
  }, []);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("address", address);
    formData.append("course", course);
    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    try {
      const response = await axiosInstance.put('/auth/update-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      // Update token with new user data
      const newToken = response.data.token;
      if (newToken) {
        sessionStorage.setItem("token", newToken);
      }

      // Update state with new user data
      setName(response.data.user.name);
      setAddress(response.data.user.address);
      setCourse(response.data.user.course);
      setCurrentProfileImage(response.data.user.profileImage || '');

      toast.success("Profile updated successfully");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };


  return (
    <div className="flex bg-gray-100 min-h-screen">
      <div className="flex-1 flex flex-col">
        <main className="py-5 px-12">
          <h2 className="text-3xl font-bold mb-8 text-black">Profile Settings</h2>
          <form className="max-w-xl space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block font-medium mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>

            {!role && (
              <>
                <div>
                  <label className="block font-medium mb-1">Course</label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                {/* <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="" disabled>Select a course</option>
                {courses.map((courseOption) => (
                  <option key={courseOption} value={courseOption}>
                    {courseOption}
                  </option>
                ))}
              </select> */}
              </>

            )}

            <div>
              <label className="block font-medium mb-1">Profile Picture</label>
              {currentProfileImage && (
                <div className="mb-2">
                  <img
                    src={currentProfileImage}
                    alt="Profile"
                    className="w-24 h-24 object-cover rounded-full"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                className="w-full p-2 border rounded-md file:bg-blue-600 file:text-white"
              />
              {profileImage && <p className="text-sm mt-2">Selected: {profileImage.name}</p>}
            </div>
            <button
              type="submit"
              className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default ProfileSettings;