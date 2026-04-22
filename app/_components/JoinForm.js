"use client";

import Button from "./Button";
import { benefits } from "../_lib/constants";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function JoinForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [foodTypes, setFoodTypes] = useState([]);
  const [pickupNotes, setPickupNotes] = useState("");
  const [servings, setServings] = useState("");
  const [organisationType, setOrganisationType] = useState("");
  const [allergies, setAllergies] = useState([]);
  const [requirement, setRequirement] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !phone || !address || !city || !pincode) {
      setError("Please fill out all personal details.");
      return;
    }

    if (!role) {
      setError("Please select a role.");
      return;
    }

    if (role === "donor") {
      if (foodTypes.length === 0 || !pickupNotes || !servings) {
        setError(
          "Donors must select food types and fill in pickup notes + average servings."
        );
        return;
      }
    }

    if (role === "recipient") {
      if (!organisationType || !requirement) {
        setError(
          "Recipients must fill in organisation type and average requirement."
        );
        return;
      }
    }

    try {
      const resUserExists = await fetch("/api/userExists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const { user } = await resUserExists.json();

      if (user) {
        setError("User already exists.");
        return;
      }

      const body = {
        name,
        email,
        password,
        phone,
        address,
        city,
        pincode,
        role,
      };

      if (role === "donor") {
        body.foodTypes = foodTypes;
        body.pickupNotes = pickupNotes;
        body.avgServings = Number(servings);
        body.totalMealsShared = 0;
      } else if (role === "recipient") {
        body.organisationType = organisationType;
        body.allergies = allergies;
        body.avgRequirement = Number(requirement);
        body.totalMealsReceived = 0;
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const form = e.target;
        form.reset();
        alert("You are registered successfully!");
        router.push("/login");
      } else {
        setError(data?.message || "User registration failed.");
      }
    } catch (err) {
      console.error("Error during registration:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-accent-mango rounded-lg p-6 shadow-md">
      <ul className="space-y-2 mb-6 text-base ">
        {benefits.map((benefit) => (
          <li key={benefit.description}>
            <span className="flex font-semibold gap-x-2">
              <Image
                src={benefit.src}
                alt={benefit.alt}
                height={20}
                width={20}
                quality={100}
              />
              {benefit.description}
            </span>
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="Full Name"
          className="w-full border p-2 rounded-xl"
        />
        <input
          onChange={(e) => setEmail(e.target.value)}
          type="text"
          placeholder="Email"
          className="w-full border p-2 rounded-xl"
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded-xl"
        />
        <input
          onChange={(e) => setPhone(e.target.value)}
          type="text"
          placeholder="Phone"
          className="w-full border p-2 rounded-xl"
        />
        <textarea
          onChange={(e) => setAddress(e.target.value)}
          type="text"
          placeholder="Address"
          className="w-full border p-2 rounded-xl"
        />
        <input
          onChange={(e) => setCity(e.target.value)}
          type="text"
          placeholder="City"
          className="w-full border p-2 rounded-xl"
        />
        <input
          onChange={(e) => setPincode(e.target.value)}
          type="number"
          placeholder="Pincode"
          className="w-full border p-2 rounded-xl"
        />
        <select
          name="role"
          onChange={(e) => setRole(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Select your role</option>
          <option value="donor">Donor (I often have surplus food)</option>
          <option value="recipient">
            Recipient (NGO, shelter, or individual)
          </option>
        </select>

        {role === "donor" && (
          <>
            <div className="flex flex-col gap-2">
              <label className="font-semibold">Food Types:</label>
              <div className="flex flex-wrap gap-4 m-auto">
                {["Veg", "Non-Veg", "Packaged", "Bakery"].map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={type}
                      checked={foodTypes.includes(type)}
                      onChange={(e) => {
                        const selected = e.target.value;
                        if (e.target.checked) {
                          setFoodTypes([...foodTypes, selected]);
                        } else {
                          setFoodTypes(foodTypes.filter((t) => t !== selected));
                        }
                      }}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
            <textarea
              onChange={(e) => setPickupNotes(e.target.value)}
              placeholder="Pickup Notes"
              className="w-full border p-2 rounded-xl"
            />
            <input
              onChange={(e) => setServings(e.target.value)}
              type="number"
              placeholder="Average Servings"
              className="w-full border p-2 rounded-xl"
            />
          </>
        )}
        {role === "recipient" && (
          <>
            <input
              onChange={(e) => setOrganisationType(e.target.value)}
              type="text"
              placeholder="Organisation Type"
              className="w-full border p-2 rounded-xl"
            />
            <input
              onChange={(e) =>
                setAllergies(
                  e.target.value
                    .split(",")
                    .map((a) => a.trim())
                    .filter((a) => a.length > 0)
                )
              }
              type="text"
              placeholder="Allergies (comma separated)"
              className="w-full border p-2 rounded-xl"
            />
            <input
              onChange={(e) => setRequirement(e.target.value)}
              type="number"
              placeholder="Average Requirement (in servings)"
              className="w-full border p-2 rounded-xl"
            />
          </>
        )}
        <Button type="submit">Register Now</Button>
        {error && (
          <div className="bg-red-500 text-white w-fit text-sm py-1 px-3 rounded-md mt-2">
            {error}
          </div>
        )}
        <Link className="text-sm mt-3 text-right" href={"/login"}>
          Already have an account? <span className="underline">Login</span>
        </Link>
      </form>
    </div>
  );
}
