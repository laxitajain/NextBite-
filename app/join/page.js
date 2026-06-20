import JoinForm from "../_components/JoinForm";
import JoinStats from "../_components/JoinStats";

export const metadata = {
  title: "Join",
};

function page() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 text-center">
      <h1 className="text-4xl mb-4 font-anton uppercase">
        Ready to be a part of something great?
      </h1>
      <p className="text-lg font-semibold mb-6">
        Join us now and help end food waste; one meal at a time.
      </p>

      <JoinForm />

      <JoinStats />
    </div>
  );
}

export default page;
