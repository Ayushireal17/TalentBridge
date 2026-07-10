"use client";
import { useEffect, useState } from "react";
import Navbar from "../../../components/layout/Navbar";
import { adminAPI } from "../../../lib/api";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.overview()
      .then(r => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Total Users",        value: stats?.total_users ?? 0,        color: "#e11d48", icon: "👥" },
    { label: "Candidates",         value: stats?.total_candidates ?? 0,   color: "#f97316", icon: "👤" },
    { label: "Recruiters",         value: stats?.total_recruiters ?? 0,   color: "#eab308", icon: "🏢" },
    { label: "Total Jobs",         value: stats?.total_jobs ?? 0,         color: "#e11d48", icon: "💼" },
    { label: "Active Jobs",        value: stats?.active_jobs ?? 0,        color: "#00d4aa", icon: "✅" },
    { label: "Applications",       value: stats?.total_applications ?? 0, color: "#f97316", icon: "📋" },
    { label: "AI Calls",           value: stats?.ai_calls ?? 0,           color: "#ff6b6b", icon: "🤖" },
  ];

  const quickLinks = [
    { icon: "👤", label: "Manage Users",  href: "/admin/users",     color: "#e11d48", desc: "View, activate, deactivate users" },
    { icon: "💼", label: "Manage Jobs",   href: "/admin/jobs",      color: "#f97316", desc: "Monitor and control job listings" },
    { icon: "📊", label: "Analytics",     href: "/admin/analytics", color: "#eab308", desc: "Platform usage and growth data" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0f0a0a" }}>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "112px 24px 64px" }}>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#ff6b6b", marginBottom: 8 }}>Admin Portal</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1, marginBottom: 4 }}>Platform Dashboard</h1>
          <p style={{ color: "#9b7b7b", fontSize: 14 }}>TalentBridge system overview</p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#9b7b7b" }}>Loading…</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
            {cards.map(c => (
              <div key={c.label} style={{
                background: "#1a0f0f", border: "1px solid #ffffff12",
                borderRadius: 20, padding: "24px", transition: "all 0.3s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${c.color}44`; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#ffffff12"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: c.color, marginBottom: 4 }}>{(c.value || 0).toLocaleString()}</div>
                <div style={{ fontSize: 12, color: "#9b7b7b" }}>{c.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {quickLinks.map(q => (
            <Link key={q.label} href={q.href}>
              <div style={{
                background: "#1a0f0f", border: "1px solid #ffffff12",
                borderRadius: 20, padding: "32px 24px", textAlign: "center",
                cursor: "pointer", transition: "all 0.3s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${q.color}44`; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#ffffff12"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{q.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{q.label}</div>
                <div style={{ fontSize: 13, color: "#9b7b7b" }}>{q.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{
          marginTop: 32, padding: "16px 24px", borderRadius: 16,
          background: "#ff6b6b08", border: "1px solid #ff6b6b22",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 600, color: "#ff6b6b", fontSize: 13 }}>Admin Access Active</div>
            <div style={{ fontSize: 12, color: "#9b7b7b" }}>All actions are logged. Use responsibly.</div>
          </div>
        </div>
      </main>
    </div>
  );
}