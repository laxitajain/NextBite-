"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DonorForm from "../_components/DonorForm";
import Button from "../_components/Button";

export default function DonorPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("create");

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserProfile();
    }
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/donor/${session.user.email}`);
      const result = await response.json();
      if (result.success) {
        setUser(result.data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Please log in to access donor features
          </h1>
          <Button onClick={() => (window.location.href = "/login")}>
            Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome, {user?.name || session.user.name}!
          </h1>
          <p className="text-gray-600">
            Help reduce food waste by sharing your surplus food with those in
            need.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("create")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "create"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Create Listing
            </button>
            <button
              onClick={() => setActiveTab("my-listings")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "my-listings"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              My Listings
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "requests"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pickup Requests
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "create" && <DonorForm user={user} />}

          {activeTab === "my-listings" && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">My Food Listings</h2>
              <p className="text-gray-600">
                Your active food listings will appear here once you create them.
              </p>
            </div>
          )}

          {activeTab === "requests" && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Pickup Requests</h2>
              <p className="text-gray-600">
                Requests from recipients for your food listings will appear
                here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
