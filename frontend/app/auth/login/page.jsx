"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/auth";
import TBLogo from "../../../components/ui/TBLogo";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useSearchParams();
  const { login } = useAuth();
  const [role, setRole] = useState("candidate");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const nav = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password, role);
      toast.success(`Welcome back, ${user.name}!`);
      nav.push(role === "recruiter" ? "/recruiter/dashboard" : "/candidate/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: "#0a0a0f" }}>
      <div className="blob w-96 h-96 top-0 right-0" style={{ background: "#6c63ff" }} />
      <div className="blob w-80 h-80 bottom-0 left-0" style={{ background: "#00d4aa", animationDelay: "-3s" }} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6"><Link href="/"><TBLogo /></Link></div>
          <h1 className="text-2xl font-bold mb-2">Welcome back 👋</h1>
          <p className="text-[#64748b] text-sm">Sign in to continue your journey</p>
        </div>

        {/* Role tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-8" style={{ background: "#ffffff08" }}>
          {["candidate", "recruiter"].map(r => (
            <button key={r} onClick={() => setRole(r)}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize"
              style={role === r
                ? { background: "linear-gradient(135deg,#6c63ff,#00d4aa)", color: "#fff", boxShadow: "0 4px 12px #6c63ff44" }
                : { color: "#64748b" }}>
              {r === "candidate" ? "👤 Job Seeker" : "🏢 Recruiter"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">Email address</label>
            <input className="input-tb" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">Password</label>
            <input className="input-tb" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <button type="submit" className="btn-primary-tb w-full py-4" disabled={loading}>
            {loading ? "Signing in…" : `Sign in as ${role === "candidate" ? "Job Seeker" : "Recruiter"} →`}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full" style={{ borderTop: "1px solid #ffffff12" }} /></div>
          <div className="relative flex justify-center"><span className="px-4 text-xs text-[#64748b]" style={{ background: "#0a0a0f" }}>or</span></div>
        </div>

        <Link href="/auth/admin-login">
          <button className="w-full py-3 text-sm font-semibold text-[#ff6b6b] border rounded-xl transition-all mb-6"
            style={{ borderColor: "#ff6b6b44", background: "transparent" }}>
            🔐 Admin Login Portal
          </button>
        </Link>

        <p className="text-center text-sm text-[#64748b]">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="font-semibold" style={{ color: "#00d4aa" }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
