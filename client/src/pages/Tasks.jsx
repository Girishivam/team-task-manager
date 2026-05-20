import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("createdAt");

  useEffect(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (sort === "dueDate") params.set("sort", "dueDate");
    api.get(`/tasks?${params}`).then((r) => setTasks(r.data));
  }, [status, sort]);

  const filtered = useMemo(
    () =>
      tasks.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase())
      ),
    [tasks, search]
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">All tasks</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="createdAt">Newest first</option>
          <option value="dueDate">Due date</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No tasks found" />
      ) : (
        <div className="bg-white border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Assignee</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const overdue =
                  t.dueDate && t.status !== "completed" && new Date(t.dueDate) < new Date();
                return (
                  <tr key={t._id} className={`border-t ${overdue ? "bg-red-50/40" : ""}`}>
                    <td className="px-4 py-3 font-medium text-slate-800">{t.title}</td>
                    <td className="px-4 py-3">
                      {t.project && (
                        <Link
                          to={`/projects/${t.project._id || t.project}`}
                          className="text-brand-600 hover:underline"
                        >
                          {t.project.title || "—"}
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-3">{t.assignedTo?.name || "—"}</td>
                    <td className="px-4 py-3">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "—"}
                      {overdue && <span className="ml-2 text-xs text-red-600">overdue</span>}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
