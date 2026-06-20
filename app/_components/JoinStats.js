"use client";

import { useEffect, useState } from "react";

export default function JoinStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((res) => {
        if (res?.success) setStats(res.data);
      })
      .catch(() => {});
  }, []);

  if (!stats) return null;

  const servings = stats.totalServings || 0;
  const users = stats.totalUsers || 0;

  return (
    <p className="mt-4 text-sm text-gray-600">
      🌱 {servings > 0 
          ? `${servings.toLocaleString()} servings shared${users > 0 ? ` by ${users.toLocaleString()} members` : ""}` 
          : `Join our growing community${users > 0 ? ` of ${users.toLocaleString()} members` : ""}`}.
    </p>
  );
}
