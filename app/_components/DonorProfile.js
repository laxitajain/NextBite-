// "use client";

// import { useEffect, useState } from "react";
// import Button from "../_components/Button";

// export default function DonorProfile({ user }) {
//   const [formData, setFormData] = useState({
//     fullName: user?.name || "",
//     email: user?.email || "",
//     phone: user?.phone || "",
//     address: user?.address || "",
//     foodTypes: [],
//     preferredDays: [],
//     servings: "",
//     pickupNotes: "",
//   });

//   const [status, setStatus] = useState(null);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleCheckboxChange = (name, value) => {
//     setFormData((prev) => {
//       const values = new Set(prev[name]);
//       values.has(value) ? values.delete(value) : values.add(value);
//       return { ...prev, [name]: Array.from(values) };
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setStatus("submitting");

//     try {
//       const res = await fetch("/api/profile", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       if (res.ok) {
//         setStatus("success");
//       } else {
//         setStatus("error");
//         console.error("Failed to update profile");
//       }
//     } catch (err) {
//       console.error("Error submitting form:", err);
//       setStatus("error");
//     }
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="bg-white text-primary rounded-xl p-8 shadow-md max-w-3xl mx-auto space-y-6"
//     >
//       <h2 className="text-2xl font-bold text-center mb-4">Donor Profile</h2>

//       <div className="grid grid-cols-1 gap-4">
//         <input
//           type="text"
//           name="fullName"
//           value={formData.fullName}
//           onChange={handleChange}
//           placeholder="Full Name"
//           className="p-3 border border-accent-light rounded-md"
//         />

//         <input
//           type="email"
//           name="email"
//           value={formData.email}
//           readOnly
//           className="p-3 border border-accent-light bg-accent-light/30 text-gray-500 rounded-md cursor-not-allowed"
//         />

//         <input
//           type="text"
//           name="phone"
//           value={formData.phone}
//           onChange={handleChange}
//           placeholder="Phone Number"
//           className="p-3 border border-accent-light rounded-md"
//         />

//         <textarea
//           name="address"
//           value={formData.address}
//           onChange={handleChange}
//           placeholder="Address"
//           className="p-3 border border-accent-light rounded-md"
//         />

//         <div>
//           <label className="block font-semibold mb-1">
//             Types of Food You Donate
//           </label>
//           <div className="flex flex-wrap gap-3">
//             {["Veg", "Non-Veg", "Packaged", "Bakery"].map((type) => (
//               <label
//                 key={type}
//                 className="bg-accent-light text-sm px-3 py-1 rounded-full cursor-pointer"
//               >
//                 <input
//                   type="checkbox"
//                   className="mr-2"
//                   checked={formData.foodTypes.includes(type)}
//                   onChange={() => handleCheckboxChange("foodTypes", type)}
//                 />
//                 {type}
//               </label>
//             ))}
//           </div>
//         </div>

//         <div>
//           <label className="block font-semibold mb-1">
//             Preferred Donation Days
//           </label>
//           <div className="flex gap-4">
//             {["Mon", "Wed", "Fri"].map((day) => (
//               <label key={day} className="text-sm">
//                 <input
//                   type="checkbox"
//                   className="mr-2"
//                   checked={formData.preferredDays.includes(day)}
//                   onChange={() => handleCheckboxChange("preferredDays", day)}
//                 />
//                 {day}
//               </label>
//             ))}
//           </div>
//         </div>

//         <input
//           type="number"
//           name="servings"
//           value={formData.servings}
//           onChange={handleChange}
//           placeholder="Maximum Serving Capacity"
//           className="p-3 border border-accent-light rounded-md"
//         />

//         <textarea
//           name="pickupNotes"
//           value={formData.pickupNotes}
//           onChange={handleChange}
//           placeholder="Pickup Instructions or Notes"
//           className="p-3 border border-accent-light rounded-md"
//         />
//       </div>

//       <div className="text-center mt-4">
//         <Button type="submit">Update Profile</Button>
//         {status === "success" && (
//           <p className="text-green-600 mt-2">Profile updated successfully.</p>
//         )}
//         {status === "error" && (
//           <p className="text-red-600 mt-2">Something went wrong.</p>
//         )}
//       </div>
//     </form>
//   );
// }

// "use client";

// import { useEffect, useState } from "react";
// import Button from "../_components/Button";

// export default function DonorProfile({ user }) {
//   const [formData, setFormData] = useState({
//     fullName: user?.name || "",
//     email: user?.email || "",
//     phone: user?.phone || "",
//     address: user?.address || "",
//     foodTypes: [],
//     preferredDays: [],
//     servings: "",
//     pickupNotes: "",
//   });

//   const [status, setStatus] = useState(null);
//   const [previewImage, setPreviewImage] = useState(user?.image || "");

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleCheckboxChange = (name, value) => {
//     setFormData((prev) => {
//       const values = new Set(prev[name]);
//       values.has(value) ? values.delete(value) : values.add(value);
//       return { ...prev, [name]: Array.from(values) };
//     });
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const imageUrl = URL.createObjectURL(file);
//       setPreviewImage(imageUrl);
//       // Optional: include image upload logic here
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setStatus("submitting");

//     try {
//       const res = await fetch("/api/profile", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       if (res.ok) {
//         setStatus("success");
//       } else {
//         setStatus("error");
//         console.error("Failed to update profile");
//       }
//     } catch (err) {
//       console.error("Error submitting form:", err);
//       setStatus("error");
//     }
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="bg-white text-primary rounded-xl p-8 shadow-md max-w-3xl mx-auto space-y-6"
//     >
//       <h2 className="text-2xl font-bold text-center mb-4">Donor Profile</h2>

//       <div className="flex flex-col items-center">
//         {previewImage && (
//           <img
//             src={previewImage}
//             alt="Profile Preview"
//             className="w-24 h-24 rounded-full object-cover mb-2 border border-gray-300"
//           />
//         )}
//         <label className="text-sm font-medium mb-2">
//           Change Profile Picture
//         </label>
//         <input
//           type="file"
//           accept="image/*"
//           onChange={handleImageChange}
//           className="text-sm text-gray-500"
//         />
//       </div>

//       <div className="grid grid-cols-1 gap-4">
//         <input
//           type="text"
//           name="fullName"
//           value={formData.fullName}
//           onChange={handleChange}
//           placeholder="Full Name"
//           className="p-3 border border-accent-light rounded-md"
//         />

//         <input
//           type="email"
//           name="email"
//           value={formData.email}
//           readOnly
//           className="p-3 border border-accent-light bg-accent-light/30 text-gray-500 rounded-md cursor-not-allowed"
//         />

//         <input
//           type="text"
//           name="phone"
//           value={formData.phone}
//           onChange={handleChange}
//           placeholder="Phone Number"
//           className="p-3 border border-accent-light rounded-md"
//         />

//         <textarea
//           name="address"
//           value={formData.address}
//           onChange={handleChange}
//           placeholder="Address"
//           className="p-3 border border-accent-light rounded-md"
//         />

//         <div>
//           <label className="block font-semibold mb-1">
//             Types of Food You Donate
//           </label>
//           <div className="flex flex-wrap gap-3">
//             {["Veg", "Non-Veg", "Packaged", "Bakery"].map((type) => (
//               <label
//                 key={type}
//                 className="bg-accent-light text-sm px-3 py-1 rounded-full cursor-pointer"
//               >
//                 <input
//                   type="checkbox"
//                   className="mr-2"
//                   checked={formData.foodTypes.includes(type)}
//                   onChange={() => handleCheckboxChange("foodTypes", type)}
//                 />
//                 {type}
//               </label>
//             ))}
//           </div>
//         </div>

//         <div>
//           <label className="block font-semibold mb-1">
//             Preferred Donation Days
//           </label>
//           <div className="flex gap-4">
//             {["Mon", "Wed", "Fri"].map((day) => (
//               <label key={day} className="text-sm">
//                 <input
//                   type="checkbox"
//                   className="mr-2"
//                   checked={formData.preferredDays.includes(day)}
//                   onChange={() => handleCheckboxChange("preferredDays", day)}
//                 />
//                 {day}
//               </label>
//             ))}
//           </div>
//         </div>

//         <input
//           type="number"
//           name="servings"
//           value={formData.servings}
//           onChange={handleChange}
//           placeholder="Maximum Serving Capacity"
//           className="p-3 border border-accent-light rounded-md"
//         />

//         <textarea
//           name="pickupNotes"
//           value={formData.pickupNotes}
//           onChange={handleChange}
//           placeholder="Pickup Instructions or Notes"
//           className="p-3 border border-accent-light rounded-md"
//         />
//       </div>

//       <div className="text-center mt-4">
//         <Button type="submit">Update Profile</Button>
//         {status === "success" && (
//           <p className="text-green-600 mt-2">Profile updated successfully.</p>
//         )}
//         {status === "error" && (
//           <p className="text-red-600 mt-2">Something went wrong.</p>
//         )}
//       </div>
//     </form>
//   );
// }

// "use client";

// import { useState } from "react";
// import Button from "../_components/Button";
// import { Pencil } from "lucide-react";

// export default function DonorProfile({ user }) {
//   const [formData, setFormData] = useState({
//     fullName: user?.name || "",
//     email: user?.email || "",
//     phone: user?.phone || "",
//     address: user?.address || "",
//     city: "",
//     state: "",
//     street: "",
//     apartment: "",
//   });

//   const [previewImage, setPreviewImage] = useState(user?.image || "");
//   const [status, setStatus] = useState(null);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setPreviewImage(URL.createObjectURL(file));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setStatus("submitting");

//     try {
//       const res = await fetch("/api/profile", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       res.ok ? setStatus("success") : setStatus("error");
//     } catch (err) {
//       console.error(err);
//       setStatus("error");
//     }
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="bg-white text-primary rounded-xl p-8 shadow-md max-w-3xl mx-auto space-y-6"
//     >
//       <div className="flex items-center space-x-4">
//         <img
//           src={previewImage}
//           alt="Profile"
//           className="w-40 h-40 rounded-full object-cover"
//         />
//         <div>
//           <h2 className="text-xl font-bold">
//             {formData.fullName || "Donor Name"}
//           </h2>

//           <div className="flex gap-3 mt-2">
//             <label className="px-4 py-1 rounded-3xl bg-secondary text-white text-sm cursor-pointer">
//               Upload New Picture
//               <input
//                 type="file"
//                 onChange={handleImageChange}
//                 className="hidden"
//               />
//             </label>
//             <button
//               type="button"
//               onClick={() => setPreviewImage("")}
//               className="px-4 py-1 rounded-3xl bg-accent-light text-sm"
//             >
//               Delete
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Form Fields */}
//       <div className="space-y-4">
//         {[
//           { label: "Full Name", name: "fullName", type: "text" },
//           { label: "Email", name: "email", type: "email", readOnly: true },
//           { label: "Phone Number", name: "phone", type: "text" },
//         ].map((field) => (
//           <div key={field.name} className="relative">
//             <input
//               type={field.type}
//               name={field.name}
//               value={formData[field.name]}
//               onChange={handleChange}
//               placeholder={field.label}
//               readOnly={field.readOnly}
//               className={`w-full p-3 pr-10 border rounded-md ${
//                 field.readOnly
//                   ? "bg-accent-light/30 text-gray-500 cursor-not-allowed"
//                   : "border-accent-light"
//               }`}
//             />
//             {!field.readOnly && (
//               <Pencil
//                 size={16}
//                 className="absolute right-3 top-3 text-accent-rust"
//               />
//             )}
//           </div>
//         ))}

//         {/* Address Breakdown */}
//         <div className="grid grid-cols-2 gap-4">
//           <input
//             type="text"
//             name="street"
//             value={formData.street}
//             onChange={handleChange}
//             placeholder="Street Number"
//             className="p-3 border border-accent-light rounded-md"
//           />
//           <input
//             type="text"
//             name="apartment"
//             value={formData.apartment}
//             onChange={handleChange}
//             placeholder="Apt / House Number"
//             className="p-3 border border-accent-light rounded-md"
//           />
//         </div>
//         <div className="grid grid-cols-2 gap-4">
//           <input
//             type="text"
//             name="city"
//             value={formData.city}
//             onChange={handleChange}
//             placeholder="City"
//             className="p-3 border border-accent-light rounded-md"
//           />
//           <input
//             type="text"
//             name="state"
//             value={formData.state}
//             onChange={handleChange}
//             placeholder="State"
//             className="p-3 border border-accent-light rounded-md"
//           />
//         </div>
//       </div>

//       {/* Submit */}
//       <div className="text-center mt-6">
//         <Button
//           type="submit"
//           className="bg-accent-rust text-white px-6 py-2 rounded-md hover:bg-accent-pink transition"
//         >
//           Update
//         </Button>
//         {status === "success" && (
//           <p className="text-green-600 mt-2">Profile updated successfully.</p>
//         )}
//         {status === "error" && (
//           <p className="text-red-600 mt-2">Something went wrong.</p>
//         )}
//       </div>
//     </form>
//   );
// }

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
