"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/auth";
import TBLogo from "../../../components/ui/TBLogo";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const params = useSearchParams();
  const { register } = useAuth();
  const nav = useRouter();

  const [role, setRole] = useState(params.get("role") || "candidate");
  const [form, setForm] = useState({ name: "", email: "", password: "", password_confirmation: "", company_name: "" });
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) { toast.error("Passwords do not match."); return; }
    setLoading(true);
    try {
      await register({ ...form, role });
      toast.success("Account created! Welcome to TalentBridge 🎉");
      nav.push(role === "recruiter" ? "/recruiter/dashboard" : "/candidate/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden" style={{ background: "#0a0a0f" }}>
      <div className="blob w-96 h-96 top-0 right-0" style={{ background: "#6c63ff" }} />
      <div className="blob w-80 h-80 bottom-0 left-0" style={{ background: "#00d4aa", animationDelay: "-3s" }} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6"><Link href="/"><TBLogo /></Link></div>
          <h1 className="text-2xl font-bold mb-2">Create your account ✨</h1>
          <p className="text-[#64748b] text-sm">Join thousands building their careers</p>
        </div>

        {/* Role selector */}
        <div className="flex gap-1 p-1 rounded-xl mb-8" style={{ background: "#ffffff08" }}>
          {["candidate","recruiter"].map(r => (
            <button key={r} onClick={() => setRole(r)}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={role === r
                ? { background: "linear-gradient(135deg,#6c63ff,#00d4aa)", color: "#fff" }
                : { color: "#64748b" }}>
              {r === "candidate" ? "👤 Job Seeker" : "🏢 Recruiter"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">Full name</label>
            <input className="input-tb" type="text" placeholder="Priya Sharma" value={form.name} onChange={set("name")} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">Email address</label>
            <input className="input-tb" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
          </div>
          {role === "recruiter" && (
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-2">Company name</label>
              <input className="input-tb" type="text" placeholder="Acme Inc." value={form.company_name} onChange={set("company_name")} required />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">Password</label>
            <input className="input-tb" type="password" placeholder="Min 8 chars, uppercase, number" value={form.password} onChange={set("password")} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">Confirm password</label>
            <input className="input-tb" type="password" placeholder="••••••••" value={form.password_confirmation} onChange={set("password_confirmation")} required />
          </div>
          <button type="submit" className="btn-primary-tb w-full py-4 mt-2" disabled={loading}>
            {loading ? "Creating account…" : `Create ${role === "candidate" ? "Candidate" : "Recruiter"} Account →`}
          </button>
        </form>

        <p className="text-center text-sm text-[#64748b] mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold" style={{ color: "#00d4aa" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
