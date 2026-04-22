import RecipientForm from "@/app/_components/RecipientForm";

export default function RecipientProfilePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-anton text-primary mb-2">
          Profile
        </h1>
        <p className="text-primary/70">
          Manage your recipient profile and location settings
        </p>
      </div>
      <RecipientForm />
    </div>
  );
}
