"use client";
import { useEffect, useState } from "react";
import Navbar from "../../../components/layout/Navbar";
import { adminAPI } from "../../../lib/api";

export default function AdminAnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState(null);
  const [ai, setAi] = useState(null);

  useEffect(() => {
    Promise.all([adminAPI.overview(), import("../../../lib/api").then(m => m.default.get("/v1/admin/analytics/users")), import("../../../lib/api").then(m => m.default.get("/v1/admin/analytics/ai-usage"))])
      .then(([o, u, a]) => { setOverview(o.data.data); setUsers(u.data.data); setAi(a.data.data); }).catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-8">
          <div className="text-xs font-semibold text-[#ff6b6b] tracking-[3px] uppercase mb-2">Admin</div>
          <h1 className="text-3xl font-black mb-1">Analytics</h1>
          <p className="text-[#64748b] text-sm">Platform usage and growth metrics</p>
        </div>

        {/* Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users",   value: overview?.total_users ?? "—",        color: "#6c63ff" },
            { label: "Active Jobs",   value: overview?.active_jobs ?? "—",        color: "#00d4aa" },
            { label: "Applications", value: overview?.total_applications ?? "—", color: "#ffa500" },
            { label: "AI Calls",      value: overview?.ai_calls ?? "—",           color: "#ff6b6b" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-6" style={{ background: "#13131f", border: "1px solid #ffffff12" }}>
              <div className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.value?.toLocaleString()}</div>
              <div className="text-xs text-[#64748b]">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Users by role */}
          <div className="rounded-2xl p-6" style={{ background: "#13131f", border: "1px solid #ffffff12" }}>
            <h3 className="font-bold mb-5">Users by Role</h3>
            {users?.by_role && Object.entries(users.by_role).map(([role, count]) => {
              const color = { admin: "#ff6b6b", recruiter: "#ffa500", candidate: "#6c63ff" }[role] || "#64748b";
              const total = Object.values(users.by_role).reduce((a, b) => a + b, 0);
              return (
                <div key={role} className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize font-medium">{role}</span>
                    <span className="font-bold" style={{ color }}>{count}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "#ffffff08" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${(count / total) * 100}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI usage by type */}
          <div className="rounded-2xl p-6" style={{ background: "#13131f", border: "1px solid #ffffff12" }}>
            <h3 className="font-bold mb-5">AI Usage by Type</h3>
            {ai?.by_type && Object.entries(ai.by_type).map(([type, count]) => {
              const total = Object.values(ai.by_type).reduce((a, b) => a + b, 0);
              return (
                <div key={type} className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize font-medium">{type.replace("_", " ")}</span>
                    <span className="font-bold text-[#6c63ff]">{count}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "#ffffff08" }}>
                    <div className="h-full rounded-full" style={{ width: `${(count / total) * 100}%`, background: "linear-gradient(135deg,#6c63ff,#00d4aa)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
