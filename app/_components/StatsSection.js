"use client";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";

const COLORS = ["#F59E0B", "#F472B6"];

const barDataMonthlyDemo = [
  { month: "Jan", members: 20 },
  { month: "Feb", members: 50 },
  { month: "Mar", members: 80 },
  { month: "Apr", members: 120 },
];

const barDataYearlyDemo = [
  { year: "2021", members: 200 },
  { year: "2022", members: 500 },
  { year: "2023", members: 850 },
  { year: "2024", members: 1286 },
];

export default function StatsSection() {
  const [view, setView] = useState("monthly");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let ignore = false;
    fetch("/api/stats")
      .then((r) => r.json())
      .then((res) => {
        if (!ignore && res?.success) setStats(res.data);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  const sharedRatio = (() => {
    if (!stats || !stats.totalListings) return 68;
    return Math.round((stats.completedPickups / stats.totalListings) * 100);
  })();

  const pieData = [
    { name: "Meals Shared", value: sharedRatio },
    { name: "Food Wasted", value: 100 - sharedRatio },
  ];

  const allMonths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const paddedMonthly = (() => {
    if (!stats?.monthlyData?.length) return barDataMonthlyDemo;
    const map = {};
    stats.monthlyData.forEach((m) => { map[m.month] = m.members; });
    return allMonths.map((m) => ({ month: m, members: map[m] || 0 }));
  })();

  const paddedYearly = (() => {
    if (!stats?.yearlyData?.length) return barDataYearlyDemo;
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 4;
    const map = {};
    stats.yearlyData.forEach((y) => { map[y.year] = y.members; });
    const result = [];
    for (let y = startYear; y <= currentYear; y++) {
      result.push({ year: String(y), members: map[String(y)] || 0 });
    }
    return result;
  })();

  const barData = view === "monthly" ? paddedMonthly : paddedYearly;

  return (
    <div className="flex flex-wrap gap-8 py-10">
      {/* Community Impact Card */}
      <div className="bg-primary hover:shadow-lg rounded-2xl p-6 shadow-md w-full md:w-[300px] transform transition-transform duration-300 hover:scale-105">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-extrabold text-accent-rust">Community Impact</h3>
        </div>

        <PieChart width={180} height={180}>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            paddingAngle={5}
            dataKey="value"
            labelLine={false}
            label={({ cx, cy }) => (
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm font-bold"
                fill="#DFD6C4"
              >
                Meals Saved
              </text>
            )}
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="none"
              />
            ))}
          </Pie>
        </PieChart>
        <div className="text-center text-2xl font-anton text-secondary">
          {sharedRatio}% Shared
        </div>
        <div className="flex justify-between text-sm mt-4">
          <span className="text-secondary">● Meals Shared</span>
          <span className="text-accent-pink">● Food Wasted</span>
        </div>
      </div>

      {/* Members Joined Card */}
      <div className="bg-primary rounded-2xl p-6 shadow-md flex-1 min-w-[300px] transform hover:shadow-lg transition-transform duration-300 hover:scale-105">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-extrabold text-accent-rust">Members Joined</h3>
          <div className="flex space-x-2 text-sm font-semibold">
            <button
              onClick={() => setView("monthly")}
              className={`px-3 py-1 rounded-full ${
                view === "monthly"
                  ? "bg-secondary text-primary"
                  : "bg-accent-rust text-primary"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setView("yearly")}
              className={`px-3 py-1 rounded-full ${
                view === "yearly"
                  ? "bg-secondary text-primary"
                  : "bg-accent-rust text-primary"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="text-3xl font-anton mb-1 text-accent-rust">
          {stats ? stats.totalUsers.toLocaleString() : "1,286"}
        </div>
        <p className="text-accent-rust text-sm">
          {stats
            ? `${stats.donors} donors · ${stats.recipients} recipients`
            : "↑ 24.6% vs 2024"}
        </p>

        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={barData}>
            <XAxis
              dataKey={view === "monthly" ? "month" : "year"}
              tick={{ fill: "#DFD6C4" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#480102",
                border: "1px solid #DFD6C4",
                borderRadius: "8px",
                color: "#DFD6C4",
              }}
            />
            <Bar dataKey="members" fill="#F472B6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
