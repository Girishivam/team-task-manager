import { useEffect, useState } from "react";
import api from "../services/api.js";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const Card = ({ label, value, accent }) => (
  <div className="bg-white rounded-2xl border p-5">
    <p className="text-sm text-slate-500">{label}</p>
    <p className={`text-3xl font-bold mt-2 ${accent || "text-slate-800"}`}>
      {value}
    </p>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    projects: 0,
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
  });

  useEffect(() => {
    Promise.all([api.get("/projects"), api.get("/tasks")]).then(
      ([p, t]) => {
        const tasks = t.data;
        const now = new Date();
        setStats({
          projects: p.data.length,
          total: tasks.length,
          completed: tasks.filter((x) => x.status === "completed").length,
          pending: tasks.filter((x) => x.status !== "completed").length,
          overdue: tasks.filter(
            (x) => x.dueDate && x.status !== "completed" && new Date(x.dueDate) < now
          ).length,
        });
      }
    );
  }, []);

  const data = [
    { name: "Completed", value: stats.completed, color: "#10b981" },
    { name: "Pending", value: stats.pending, color: "#f59e0b" },
    { name: "Overdue", value: stats.overdue, color: "#ef4444" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card label="Projects" value={stats.projects} accent="text-brand-600" />
        <Card label="Total Tasks" value={stats.total} />
        <Card label="Completed" value={stats.completed} accent="text-emerald-600" />
        <Card label="Pending" value={stats.pending} accent="text-amber-600" />
        <Card label="Overdue" value={stats.overdue} accent="text-red-600" />
      </div>

      <div className="bg-white rounded-2xl border p-5">
        <h2 className="font-semibold text-slate-700 mb-4">Task status</h2>
        <div className="h-72">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
