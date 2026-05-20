import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="bg-white p-8 rounded-2xl shadow-sm border w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-slate-800">Sign in</h1>
        <p className="text-sm text-slate-500 mt-1">to your TaskFlow workspace</p>

        <div className="mt-6 space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            className="w-full border rounded-lg px-3 py-2"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            required
            placeholder="Password"
            className="w-full border rounded-lg px-3 py-2"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button
          disabled={loading}
          className="mt-6 w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white py-2 rounded-lg font-medium"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-sm text-slate-500 mt-4 text-center">
          No account?{" "}
          <Link to="/register" className="text-brand-600 font-medium">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
