"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Button from "./Button";
import ProfileMap from "./ProfileMap";
import { 
  MapPin, User, Mail, Phone, Home, Edit3, Save, X, Camera, 
  HeartHandshake, BarChart, Info, Map, Building2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ORG_TYPES = ["NGO", "Shelter", "Community Kitchen", "Individual", "Other"];

const inputBase =
  "w-full px-3 py-2 rounded-xl border border-accent-rust bg-white text-primary placeholder:text-primary/40 transition focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary disabled:bg-accent-light/60 disabled:cursor-not-allowed";

const sectionCard =
  "bg-white/80 backdrop-blur-sm border border-accent-rust/60 rounded-2xl shadow-sm p-6";

export default function RecipientForm() {
  const { data: session, update: updateSession } = useSession();
  const [user, setUser] = useState(null);
  
  // Tab and Edit states
  const [activeTab, setActiveTab] = useState("general");
  const [editingSection, setEditingSection] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    coordinates: { latitude: 0, longitude: 0 },
    organisationType: "",
    allergies: [],
    avgRequirement: "",
    image: null,
  });
  const [allergiesText, setAllergiesText] = useState("");

  const [locationPermission, setLocationPermission] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/donor/${session.user.email}`);
      const result = await response.json();

      if (result.success) {
        setUser(result.data);
        resetFormData(result.data);
      } else {
        setError("Failed to load profile data");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const resetFormData = (data) => {
    setFormData({
      name: data.name || "",
      phone: data.phone || "",
      address: data.address || "",
      city: data.city || "",
      pincode: data.pincode || "",
      coordinates: data.coordinates || { latitude: 0, longitude: 0 },
      organisationType: data.organisationType || "",
      allergies: data.allergies || [],
      avgRequirement: data.avgRequirement || "",
      image: data.image || null,
    });
    setAllergiesText((data.allergies || []).join(", "));
  };

  const requestLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setFormData((prev) => ({
          ...prev,
          coordinates: { latitude: lat, longitude: lng },
        }));
        setLocationPermission(true);

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
          const data = await res.json();
          if (data && data.address) {
            setFormData((prev) => ({
              ...prev,
              city: data.address.city || data.address.town || data.address.village || prev.city,
              pincode: data.address.postcode || prev.pincode,
              address: data.display_name || prev.address
            }));
          }
        } catch (e) {
          console.error("Reverse geocoding failed", e);
        }
      },
      () => setLocationPermission(false)
    );
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const result = await res.json();
      if (result.success) {
        setFormData((prev) => ({ ...prev, image: result.url }));
        await fetch(`/api/donor/${session.user.email}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: result.url }),
        });
        await updateSession?.();
      } else {
        setError(result.message || "Upload failed");
      }
    } catch {
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const allergies = allergiesText
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      const response = await fetch(`/api/donor/${session.user.email}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          allergies,
          avgRequirement: parseInt(formData.avgRequirement) || 0,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess("Profile updated successfully!");
        setUser(result.data);
        setEditingSection(null);
        await updateSession?.();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!user) return;
    resetFormData(user);
    setEditingSection(null);
    setError("");
  };

  const changeTab = (tabId) => {
    if (editingSection) handleCancel();
    setActiveTab(tabId);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={sectionCard}>
        <p className="text-red-700">Failed to load profile data</p>
      </div>
    );
  }

  const TabButton = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => changeTab(id)}
      className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl transition font-semibold text-left ${
        activeTab === id 
          ? "bg-accent-mango text-primary shadow-sm border border-accent-rust/30" 
          : "text-primary/70 hover:bg-white/60 hover:text-primary"
      }`}
    >
      <Icon className={`w-5 h-5 ${activeTab === id ? "text-secondary" : ""}`} />
      {label}
    </button>
  );

  const EditActions = ({ sectionId }) => {
    if (editingSection !== sectionId) {
      return (
        <Button onClick={() => setEditingSection(sectionId)} className="!w-auto !py-1.5 !px-4 text-sm shadow-none border-accent-rust/30">
          <Edit3 className="w-4 h-4 mr-1" /> Edit
        </Button>
      );
    }
    return (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center gap-1 text-sm bg-white text-primary border border-accent-rust rounded-full p-1.5 px-3 font-bold hover:bg-accent-light transition"
        >
          <X className="w-3 h-3" /> Cancel
        </button>
        <Button onClick={handleSubmit} disabled={saving} className="!w-auto !py-1.5 !px-4 text-sm">
          <Save className="w-4 h-4 mr-1" /> {saving ? "..." : "Save"}
        </Button>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
      
      {/* Left Sidebar */}
      <div className="w-full lg:w-1/3 xl:w-1/4 space-y-6 shrink-0">
        <div className={`${sectionCard} flex flex-col items-center text-center p-8`}>
          <div className="relative group mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-md bg-gradient-to-br from-accent-pink to-secondary flex items-center justify-center border-4 border-white">
              {formData.image ? (
                <Image src={formData.image} alt="Profile" width={96} height={96} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition">
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
          <h2 className="text-2xl font-anton text-primary">{user.name}</h2>
          <span className="inline-block mt-2 px-3 py-1 bg-accent-rust/20 text-secondary font-bold text-xs rounded-full uppercase tracking-wider">
            Recipient
          </span>
        </div>

        <div className={`${sectionCard} p-3 flex flex-col gap-1`}>
          <TabButton id="general" icon={User} label="General Settings" />
          <TabButton id="location" icon={MapPin} label="Location & Map" />
          <TabButton id="preferences" icon={HeartHandshake} label="Requirements" />
          <TabButton id="stats" icon={BarChart} label="My Impact" />
        </div>
      </div>

      {/* Right Content */}
      <div className="w-full lg:w-2/3 xl:w-3/4 space-y-6 overflow-hidden min-h-[60vh]">
        
        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-xl">
            {success}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full space-y-6"
          >
        
            {/* General Tab */}
            {activeTab === "general" && (
              <div className={sectionCard}>
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-accent-rust/30">
                  <div>
                    <h3 className="text-2xl font-anton text-primary">Personal Information</h3>
                    <p className="text-primary/60 text-sm">Update your basic profile details</p>
                  </div>
                  <EditActions sectionId="general" />
                </div>

                <form className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-primary/80 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        disabled={editingSection !== "general"}
                        className={inputBase}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary/80 mb-1.5">Organisation Type</label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-primary/50 absolute left-3 top-1/2 -translate-y-1/2" />
                        <select
                          value={formData.organisationType}
                          onChange={(e) => handleInputChange("organisationType", e.target.value)}
                          disabled={editingSection !== "general"}
                          className={`${inputBase} pl-9 appearance-none`}
                        >
                          <option value="">Select type...</option>
                          {ORG_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-primary/80 mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-primary/50 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input type="email" value={user.email} disabled className={`${inputBase} pl-9 bg-stone-100 cursor-not-allowed`} />
                      </div>
                      <p className="text-xs text-primary/50 mt-1.5 flex items-center gap-1"><Info className="w-3 h-3"/> Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary/80 mb-1.5">Phone Number</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-primary/50 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          disabled={editingSection !== "general"}
                          className={`${inputBase} pl-9`}
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Location Tab */}
            {activeTab === "location" && (
              <div className="space-y-6">
                <div className={sectionCard}>
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-accent-rust/30">
                    <div>
                      <h3 className="text-2xl font-anton text-primary">Location Information</h3>
                      <p className="text-primary/60 text-sm">Where you will collect food from</p>
                    </div>
                    <EditActions sectionId="location" />
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-primary/80 mb-1.5">Address</label>
                      <div className="relative">
                        <Home className="w-4 h-4 text-primary/50 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          disabled={editingSection !== "location"}
                          className={`${inputBase} pl-9`}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-primary/80 mb-1.5">City</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          disabled={editingSection !== "location"}
                          className={inputBase}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary/80 mb-1.5">Pincode</label>
                        <input
                          type="number"
                          value={formData.pincode}
                          onChange={(e) => handleInputChange("pincode", e.target.value)}
                          disabled={editingSection !== "location"}
                          className={inputBase}
                        />
                      </div>
                    </div>

                    {editingSection === "location" && (
                      <div className="bg-accent-light/50 p-4 rounded-xl border border-accent-rust/40">
                        <label className="block text-sm font-semibold text-primary mb-3">
                          Drop a pin or find me
                        </label>
                        <div className="flex items-center gap-3">
                          <Button type="button" onClick={requestLocation} className="!w-auto text-sm">
                            <MapPin className="w-4 h-4 mr-2" /> Auto-Locate
                          </Button>
                          {locationPermission && (
                            <span className="text-sm text-green-700 font-semibold bg-green-100 px-3 py-1 rounded-full border border-green-200">
                              Location successfully pinned!
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className={sectionCard}>
                  <h3 className="text-xl font-anton mb-4 flex items-center gap-2 text-primary">
                    <Map className="w-5 h-5 text-secondary" />
                    Preview Map
                  </h3>
                  <div className="h-72 rounded-xl overflow-hidden border-2 border-accent-rust/40">
                    <ProfileMap
                      coordinates={formData.coordinates}
                      address={`${formData.address}, ${formData.city}, ${formData.pincode}`}
                      className="h-full w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div className="space-y-6">
                <div className={sectionCard}>
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-accent-rust/30">
                    <div>
                      <h3 className="text-2xl font-anton text-primary">Dietary Requirements</h3>
                      <p className="text-primary/60 text-sm">Specify what food you can accept</p>
                    </div>
                    <EditActions sectionId="preferences" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-primary/80 mb-1.5">
                        Average Requirement (Servings)
                      </label>
                      <input
                        type="number"
                        value={formData.avgRequirement}
                        onChange={(e) => handleInputChange("avgRequirement", e.target.value)}
                        disabled={editingSection !== "preferences"}
                        min="1"
                        className={inputBase}
                        placeholder="e.g. 50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary/80 mb-1.5">
                        Allergies & Restrictions
                      </label>
                      <input
                        type="text"
                        value={allergiesText}
                        onChange={(e) => setAllergiesText(e.target.value)}
                        disabled={editingSection !== "preferences"}
                        className={inputBase}
                        placeholder="e.g. Nuts, Dairy, Gluten (comma separated)"
                      />
                      <p className="text-xs text-primary/50 mt-1.5 flex items-center gap-1">
                        <Info className="w-3 h-3"/> Separate multiple items with commas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === "stats" && (
              <div className={sectionCard}>
                <div className="mb-6 pb-4 border-b border-accent-rust/30">
                  <h3 className="text-2xl font-anton text-primary">My Impact</h3>
                  <p className="text-primary/60 text-sm">Your journey with NextBite</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-accent-mango/50 to-white rounded-2xl border border-accent-rust/30">
                    <span className="text-5xl font-anton text-secondary mb-2">{user.totalMealsReceived || 0}</span>
                    <span className="text-sm font-bold text-primary/70 uppercase tracking-wide">Meals Received</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-accent-light/50 to-white rounded-2xl border border-accent-rust/30">
                    <span className="text-5xl font-anton text-primary mb-2">{formData.avgRequirement || 0}</span>
                    <span className="text-sm font-bold text-primary/70 uppercase tracking-wide">Avg Request</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-accent-pink/20 to-white rounded-2xl border border-accent-rust/30">
                    <span className="text-5xl font-anton text-accent-pink mb-2">{user.allergies?.length || 0}</span>
                    <span className="text-sm font-bold text-primary/70 uppercase tracking-wide">Restrictions</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
