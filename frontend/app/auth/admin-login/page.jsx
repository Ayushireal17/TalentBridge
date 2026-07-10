"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/auth";
import TBLogo from "../../../components/ui/TBLogo";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const { adminLogin } = useAuth();
  const nav = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminLogin(form.email, form.password);
      toast.success("Admin access granted.");
      nav.push("/admin/dashboard");
    } catch {
      toast.error("Invalid admin credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: "#0a0a0f" }}>
      <div className="blob w-96 h-96 top-0 right-0" style={{ background: "#ff6b6b" }} />
      <div className="blob w-80 h-80 bottom-0 left-0" style={{ background: "#ff6b6b88", animationDelay: "-3s" }} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6"><Link href="/"><TBLogo /></Link></div>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
            style={{ background: "#ff6b6b18", border: "1px solid #ff6b6b44" }}>🔐</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "#ff6b6b" }}>Admin Portal</h1>
          <p className="text-[#64748b] text-sm">Restricted access — authorised personnel only</p>
        </div>

        <div className="rounded-2xl p-6 mb-6" style={{ background: "#ff6b6b08", border: "1px solid #ff6b6b22" }}>
          <p className="text-xs text-[#ff6b6b] font-medium">⚠️ This portal is for platform administrators only. All access attempts are logged.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">Admin email</label>
            <input className="input-tb" type="email" placeholder="admin@talentbridge.ai"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-2">Admin password</label>
            <input className="input-tb" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-xl font-semibold text-sm transition-all"
            style={{ background: "linear-gradient(135deg,#ff6b6b,#ffa500)", color: "#fff" }}>
            {loading ? "Authenticating…" : "Access Admin Dashboard →"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/auth/login" className="text-sm text-[#64748b] hover:text-white transition-colors">
            ← Back to regular login
          </Link>
        </div>
      </div>
    </div>
  );
}
