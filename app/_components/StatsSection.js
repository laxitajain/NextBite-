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

const dataPie = [
  { name: "Meals Shared", value: 68 },
  { name: "Food Wasted", value: 32 },
];

const COLORS = ["#F59E0B", "#F472B6"];

const barDataMonthly = [
  { month: "Jan", members: 20 },
  { month: "Feb", members: 50 },
  { month: "Mar", members: 80 },
  { month: "Apr", members: 120 },
];

const barDataYearly = [
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

  const livePie = [
    { name: "Meals Shared", value: sharedRatio },
    { name: "Food Wasted", value: 100 - sharedRatio },
  ];

  return (
    <div className="flex flex-wrap gap-8 py-10">
      {/* Meals Shared Card */}
      <div className="bg-white hover:shadow-lg rounded-2xl p-6 shadow-md w-full md:w-[300px] transform transition-transform duration-300 hover:scale-105">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-extrabold">Community Impact</h3>
          {!stats && (
            <span className="text-[10px] uppercase bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
              Demo data
            </span>
          )}
        </div>

        <PieChart width={180} height={180}>
          <Pie
            data={stats ? livePie : dataPie}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            paddingAngle={5}
            dataKey="value"
            labelLine={false}
            label={({ cx, cy }) => {
              return (
                <>
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-sm font-bold fill-primary"
                  >
                    Meals Saved
                  </text>
                </>
              );
            }}
          >
            {dataPie.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
        <div className="text-center text-2xl font-anton">
          {sharedRatio}% Shared
        </div>
        <div className="flex justify-between text-sm mt-4">
          <span className="text-secondary">● Meals Shared</span>
          <span className="text-accent-pink">● Food Wasted</span>
        </div>
      </div>

      {/* Members Joined Card */}
      <div className="bg-white rounded-2xl p-6 shadow-md flex-1 min-w-[300px] transform hover:shadow-lg transition-transform duration-300 hover:scale-105 sm:max-w-[100px]">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-extrabold">Members Joined</h3>
          <span className="text-[10px] uppercase bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
            Demo trend
          </span>
          <div className="flex space-x-2 text-sm font-semibold">
            <button
              onClick={() => setView("monthly")}
              className={`px-3 py-1 rounded-full ${
                view === "monthly" ? "bg-secondary" : "bg-accent-rust"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setView("yearly")}
              className={`px-3 py-1 rounded-full  ${
                view === "yearly" ? "bg-secondary" : "bg-accent-light"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="text-3xl font-anton mb-1">
          {stats ? stats.totalUsers.toLocaleString() : "1,286"}
        </div>
        <p className="text-green-600 text-sm">
          {stats
            ? `${stats.donors} donors · ${stats.recipients} recipients`
            : "↑ 24.6% vs 2024"}
        </p>

        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={view === "monthly" ? barDataMonthly : barDataYearly}>
            <XAxis dataKey={view === "monthly" ? "month" : "year"} />
            <Tooltip />
            <Bar dataKey="members" fill="#F472B6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
