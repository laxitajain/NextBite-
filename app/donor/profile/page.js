import ProfileCard from "@/app/_components/ProfileCard";

export default function Page() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-anton text-primary mb-2">
          Profile
        </h1>
        <p className="text-primary/70">
          Manage your donor profile and location settings
        </p>
      </div>
      <ProfileCard />
    </div>
  );
}
