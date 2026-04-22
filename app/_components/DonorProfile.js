"use client";

import { useState } from "react";
import Button from "../_components/Button";
import { Pencil } from "lucide-react";
import { useEffect } from "react";

const FOOD_OPTIONS = ["Veg", "Non-Veg", "Packaged", "Bakery"];
const DAYS_OPTIONS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function DonorProfile({ user }) {
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    foodTypes: user?.foodTypes || [],
    preferredDays: user?.preferredDays || [],
    servings: user?.servings || "",
    pickupNotes: user?.pickupNotes || "",
  });

  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(user?.image || "");
  const [status, setStatus] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);

  const requiredFields = ["fullName", "email", "phone", "address", "servings"];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setFormData({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          foodTypes: data.foodTypes || [],
          preferredDays: data.preferredDays || [],
          servings: data.servings || "",
          pickupNotes: data.pickupNotes || "",
        });
        setPreviewImage(data.image || "/user.png");
      } catch (err) {
        console.error("Error loading profile", err);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCheckboxChange = (name, value) => {
    setFormData((prev) => {
      const values = new Set(prev[name]);
      values.has(value) ? values.delete(value) : values.add(value);
      return { ...prev, [name]: Array.from(values) };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const newErrors = {};
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        newErrors[field] = "This field is required";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!validate()) return;

    setStatus("submitting");

    let uploadedImageUrl = previewImage;

    if (fileToUpload) {
      const formDataImage = new FormData();
      formDataImage.append("image", fileToUpload);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataImage,
      });

      const data = await res.json();
      uploadedImageUrl = data.url;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, image: uploadedImageUrl }),
      });

      res.ok ? setStatus("success") : setStatus("error");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white text-primary rounded-xl p-8 shadow-md max-w-3xl mx-auto space-y-6"
    >
      {/* Profile Image */}
      <div className="flex items-center space-x-4">
        <img
          src={
            previewImage instanceof File
              ? URL.createObjectURL(previewImage)
              : previewImage
          }
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover"
        />

        <div>
          <h2 className="text-xl font-bold">
            {formData.fullName || "Donor Name"}
          </h2>
          <div className="flex gap-3 mt-2">
            <label className="px-4 py-1 rounded-3xl bg-accent-mango text-white text-sm cursor-pointer">
              Upload New Picture
              <input
                type="file"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={() => setPreviewImage("")}
              className="px-4 py-1 rounded-3xl bg-accent-light text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {[
          {
            label: "Full Name",
            name: "fullName",
            type: "text",
            required: true,
          },
          {
            label: "Email",
            name: "email",
            type: "email",
            required: true,
            readOnly: true,
          },
          {
            label: "Phone Number",
            name: "phone",
            type: "text",
            required: true,
          },
          { label: "Address", name: "address", type: "text", required: true },
        ].map((field) => (
          <div key={field.name}>
            <label className="block font-medium mb-1">
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </label>
            <div className="relative">
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.label}
                readOnly={field.readOnly}
                className={`w-full p-3 pr-10 border rounded-md ${
                  field.readOnly
                    ? "bg-accent-light/30 text-gray-500 cursor-not-allowed"
                    : "border-accent-light"
                } ${errors[field.name] && "border-red-500"}`}
              />
              {!field.readOnly && (
                <Pencil
                  size={16}
                  className="absolute right-3 top-3 text-accent-rust"
                />
              )}
            </div>
            {errors[field.name] && (
              <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
            )}
          </div>
        ))}

        {/* Food Types */}
        <div>
          <label className="block font-semibold mb-1">
            Types of Food You Donate
          </label>
          <div className="flex flex-wrap gap-3">
            {FOOD_OPTIONS.map((type) => (
              <label
                key={type}
                className="bg-accent-light text-sm px-3 py-1 rounded-full cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={formData.foodTypes.includes(type)}
                  onChange={() => handleCheckboxChange("foodTypes", type)}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* Preferred Days */}
        <div>
          <label className="block font-semibold mb-1">
            Preferred Donation Days
          </label>
          <select
            multiple
            name="preferredDays"
            value={formData.preferredDays}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                preferredDays: Array.from(
                  e.target.selectedOptions,
                  (o) => o.value
                ),
              }))
            }
            className="w-full p-3 border border-accent-light rounded-md"
          >
            {DAYS_OPTIONS.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        {/* Serving Capacity */}
        <div>
          <label className="block font-medium mb-1">
            Maximum Serving Capacity<span className="text-red-500"> *</span>
          </label>
          <input
            type="number"
            name="servings"
            value={formData.servings}
            onChange={handleChange}
            placeholder="Maximum Serving Capacity"
            className={`p-3 border rounded-md w-full ${
              errors.servings ? "border-red-500" : "border-accent-light"
            }`}
          />
          {errors.servings && (
            <p className="text-red-500 text-sm mt-1">{errors.servings}</p>
          )}
        </div>

        {/* Pickup Notes */}
        <div>
          <label className="block font-medium mb-1">
            Pickup Instructions or Notes
          </label>
          <textarea
            name="pickupNotes"
            value={formData.pickupNotes}
            onChange={handleChange}
            placeholder="Any extra info..."
            className="p-3 border border-accent-light rounded-md w-full"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="text-center mt-6">
        <Button
          type="submit"
          className="bg-accent-rust text-white px-6 py-2 rounded-md hover:bg-accent-pink transition"
        >
          Update
        </Button>
        {status === "success" && (
          <p className="text-green-600 mt-2">Profile updated successfully.</p>
        )}
        {status === "error" && (
          <p className="text-red-600 mt-2">Something went wrong.</p>
        )}
      </div>
    </form>
  );
}
