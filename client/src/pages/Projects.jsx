import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import Modal from "../components/Modal.jsx";
import EmptyState from "../components/EmptyState.jsx";
import toast from "react-hot-toast";

export default function Projects() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", description: "" });

  const load = () =>
    api
      .get("/projects")
      .then((r) => setProjects(r.data))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "" });
    setOpen(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ title: p.title, description: p.description || "" });
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/projects/${editing._id}`, form);
      else await api.post("/projects", form);
      toast.success("Saved");
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this project and its tasks?")) return;
    await api.delete(`/projects/${id}`);
    toast.success("Deleted");
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Projects</h1>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + New project
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : projects.length === 0 ? (
        <EmptyState title="No projects yet" hint={isAdmin ? "Create your first project." : "Ask an admin to add you."} />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div key={p._id} className="bg-white rounded-2xl border p-5">
              <Link
                to={`/projects/${p._id}`}
                className="font-semibold text-slate-800 hover:text-brand-600"
              >
                {p.title}
              </Link>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                {p.description || "No description"}
              </p>
              <p className="text-xs text-slate-400 mt-3">
                {p.members?.length || 0} member(s)
              </p>
              {isAdmin && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="text-xs px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(p._id)}
                    className="text-xs px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit project" : "New project"}>
        <form onSubmit={save} className="space-y-4">
          <input
            required
            placeholder="Title"
            className="w-full border rounded-lg px-3 py-2"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            placeholder="Description"
            rows={4}
            className="w-full border rounded-lg px-3 py-2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <button className="w-full bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-lg font-medium">
            Save
          </button>
        </form>
      </Modal>
    </div>
  );
}
