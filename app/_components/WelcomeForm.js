"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "./Button";

export default function WelcomeForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    role: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { fullName, email, phone, address, role } = form;
    if (!fullName || !email || !phone || !address || !role) {
      return setError("Please fill in all fields.");
    }

    const res = await fetch("/api/welcome", {
      method: "POST",
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push(`/${role}/profile`);
    } else {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto bg-white p-6 shadow-md rounded-md space-y-4"
    >
      <h1 className="text-2xl font-bold mb-4">Tell us about yourself</h1>

      {error && <p className="text-red-600">{error}</p>}

      <input
        name="fullName"
        placeholder="Full Name"
        value={form.fullName}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        type="email"
      />

      <input
        name="phone"
        placeholder="Phone"
        value={form.phone}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      <input
        name="address"
        placeholder="Address"
        value={form.address}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      <label className="block text-sm font-semibold">
        How would you like to contribute to the community?
      </label>
      <select
        name="role"
        value={form.role}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      >
        <option value="">Select your role</option>
        <option value="donor">Donor (I often have surplus food)</option>
        <option value="recipient">
          Recipient (NGO, shelter, or individual)
        </option>
      </select>

      <Button type="submit">Submit</Button>
    </form>
  );
}
