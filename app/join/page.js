import JoinForm from "../_components/JoinForm";
import { connectMongoDB } from "@/lib/mongodb";

export const metadata = {
  title: "Join",
};

connectMongoDB();

function page() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-2 text-center">
      <h1 className="text-4xl mb-4 font-anton uppercase">
        Ready to be a part of something great?
      </h1>
      <p className="text-lg font-semibold mb-6">
        Join us now and help end food waste; one meal at a time.
      </p>

      <JoinForm />

      <p className="mt-4 text-sm text-gray-600 ">
        🌱 Over 2,000 meals shared in the last 30 days.
      </p>
    </div>
  );
}

export default page;
