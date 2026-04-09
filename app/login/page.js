import LoginForm from "../_components/LoginForm";

export const metadata = {
  title: "Login",
};

function page() {
  return (
    <div className="max-w-5xl sm:max-w-2xl mx-auto py-10 px-2 text-center">
      <h1 className="text-4xl mb-4 font-anton uppercase">
        Welcome Back! Keep sharing, keep saving :)
      </h1>
      <p className="text-lg font-semibold mb-6">
        Do your part and help end food waste; one meal at a time.
      </p>

      <LoginForm />

      <p className="mt-4 text-sm text-gray-600 ">
        🌱 Over 2,000 meals shared in the last 30 days.
      </p>
    </div>
  );
}

export default page;
