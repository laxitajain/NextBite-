import ProfileCard from "@/app/_components/ProfileCard";

function page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">
            Manage your donor profile and location settings
          </p>
        </div>
        <ProfileCard />
      </div>
    </div>
  );
}

export default page;
