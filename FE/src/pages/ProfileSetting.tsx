import { useState } from "react";


const ProfileSettings = () => {
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">

      <div className="flex-1 flex flex-col">

        <main className="p-10">
          <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>

          <form className="max-w-xl space-y-4">
            <div>
              <label className="block font-medium mb-1">Name</label>
              <input type="text" className="w-full p-2 border rounded-md" />
            </div>

            <div>
              <label className="block font-medium mb-1">Email</label>
              <input type="email" className="w-full p-2 border rounded-md" />
            </div>

            <div>
              <label className="block font-medium mb-1">Major</label>
              <input type="text" className="w-full p-2 border rounded-md" />
            </div>

            <div>
              <label className="block font-medium mb-1">Year</label>
              <input type="text" className="w-full p-2 border rounded-md" />
            </div>

            <div>
              <label className="block font-medium mb-1">Upload Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-2 border rounded-md file:mr-4 file:py-1 file:px-4 file:border-0 file:bg-blue-600 file:text-white file:rounded-md"
              />
              {profileImage && (
                <p className="text-sm text-gray-500 mt-2">Selected: {profileImage.name}</p>
              )}
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
