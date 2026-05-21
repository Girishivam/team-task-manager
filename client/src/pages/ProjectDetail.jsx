import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Modal from "../components/Modal.jsx";
import EmptyState from "../components/EmptyState.jsx";
import toast from "react-hot-toast";

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [memberEmail, setMemberEmail] = useState("");
  const [taskOpen, setTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    status: "Todo",
    dueDate: "",
  });

  const load = async () => {
    const p = await api.get(`/projects/${id}`);
    setProject(p.data);
    const t = await api.get(`/tasks?project=${id}`);
    setTasks(t.data);
  };

  useEffect(() => {
    load();
  }, [id]);

  const addMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail });
      setMemberEmail("");
      toast.success("Member added");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const removeMember = async (uid) => {
    await api.delete(`/projects/${id}/members/${uid}`);
    load();
  };

  const openNewTask = () => {
    setEditingTask(null);
    setTaskForm({ title: "", description: "", assignedTo: "", status: "Todo", dueDate: "" });
    setTaskOpen(true);
  };

  const openEditTask = (t) => {
    setEditingTask(t);
    setTaskForm({
      title: t.title,
      description: t.description || "",
      assignedTo: t.assignedTo?._id || "",
      status: t.status,
      dueDate: t.dueDate ? t.dueDate.slice(0, 10) : "",
    });
    setTaskOpen(true);
  };

  const saveTask = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...taskForm, project: id };
      if (editingTask) await api.put(`/tasks/${editingTask._id}`, payload);
      else await api.post("/tasks", payload);
      toast.success("Saved");
      setTaskOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const updateStatus = async (t, status) => {
    await api.put(`/tasks/${t._id}`, { status });
    load();
  };

  const deleteTask = async (tid) => {
    if (!confirm("Delete task?")) return;
    await api.delete(`/tasks/${tid}`);
    load();
  };

  if (!project) return <p className="text-slate-500">Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">{project.title}</h1>
      <p className="text-slate-500 mt-1">{project.description}</p>

      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-white border rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-slate-700">Tasks</h2>
            {isAdmin && (
              <button
                onClick={openNewTask}
                className="text-sm bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg"
              >
                + Add task
              </button>
            )}
          </div>
          {tasks.length === 0 ? (
            <EmptyState title="No tasks yet" />
          ) : (
            <ul className="divide-y">
              {tasks.map((t) => {
                const overdue =
                  t.dueDate && t.status !== "Completed" && new Date(t.dueDate) < new Date();
                const canUpdateStatus =
                  isAdmin || (t.assignedTo && t.assignedTo._id === user._id);
                return (
                  <li
                    key={t._id}
                    className={`py-3 flex flex-wrap items-center gap-3 ${overdue ? "bg-red-50/40 -mx-2 px-2 rounded-lg" : ""}`}
                  >
                    <div className="flex-1 min-w-[200px]">
                      <p className="font-medium text-slate-800">{t.title}</p>
                      <p className="text-xs text-slate-500">
                        {t.assignedTo?.name || "Unassigned"} ·{" "}
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No due date"}
                        {overdue && <span className="text-red-600 font-medium"> · Overdue</span>}
                      </p>
                    </div>
                    {canUpdateStatus ? (
                      <select
                        value={t.status}
                        onChange={(e) => updateStatus(t, e.target.value)}
                        className="text-xs border rounded-lg px-2 py-1"
                      >
                        <option value="Todo">Todo</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    ) : (
                      <StatusBadge status={t.status} />
                    )}
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => openEditTask(t)}
                          className="text-xs px-2 py-1 rounded bg-slate-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTask(t._id)}
                          className="text-xs px-2 py-1 rounded bg-red-50 text-red-600"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="bg-white border rounded-2xl p-5">
          <h2 className="font-semibold text-slate-700 mb-4">Members</h2>
          <ul className="space-y-2">
            {project.members.map((m) => (
              <li key={m._id} className="flex justify-between items-center text-sm">
                <span>
                  {m.name}{" "}
                  <span className="text-slate-400 text-xs">({m.email})</span>
                </span>
                {isAdmin && (
                  <button
                    onClick={() => removeMember(m._id)}
                    className="text-xs text-red-600"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
            {project.members.length === 0 && (
              <li className="text-sm text-slate-400">No members yet</li>
            )}
          </ul>
          {isAdmin && (
            <form onSubmit={addMember} className="mt-4 flex gap-2">
              <input
                type="email"
                required
                placeholder="user@email.com"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
              />
              <button className="bg-brand-600 hover:bg-brand-700 text-white px-3 rounded-lg text-sm">
                Add
              </button>
            </form>
          )}
        </div>
      </div>

      <Modal
        open={taskOpen}
        onClose={() => setTaskOpen(false)}
        title={editingTask ? "Edit task" : "New task"}
      >
        <form onSubmit={saveTask} className="space-y-3">
          <input
            required
            placeholder="Title"
            className="w-full border rounded-lg px-3 py-2"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          />
          <textarea
            placeholder="Description"
            rows={3}
            className="w-full border rounded-lg px-3 py-2"
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          />
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={taskForm.assignedTo}
            onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
          >
            <option value="">Unassigned</option>
            {project.members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <select
              className="border rounded-lg px-3 py-2"
              value={taskForm.status}
              onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
            >
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <input
              type="date"
              className="border rounded-lg px-3 py-2"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
            />
          </div>
          <button className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-lg font-medium">
            Save
          </button>
        </form>
      </Modal>
    </div>
  );
}
