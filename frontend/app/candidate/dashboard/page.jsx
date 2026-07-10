"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../../lib/auth";
import Navbar from "../../../components/layout/Navbar";
import { jobAPI, resumeAPI, aiAPI } from "../../../lib/api";
import Link from "next/link";
import BridgeAIChatbot from "../../../components/chatbot/BridgeAIChatbot";

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    import("../../../lib/api").then(m => {
      m.default.get("/candidate/dashboard").then(r => setData(r.data.data)).catch(() => {});
    });
  }, []);

  const stats = [
    { label: "Applications sent", value: data?.total_applications ?? 0,    color: "#6c63ff" },
    { label: "ATS score",         value: data?.resume_score ?? "—",         color: "#00d4aa" },
    { label: "Interviews",        value: data?.interviews_count ?? 0,       color: "#ffa500" },
    { label: "Profile complete",  value: `${data?.profile_percent ?? 85}%`, color: "#ff6b6b" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold text-[#00d4aa] tracking-[3px] uppercase mb-2">Welcome back</div>
            <h1 className="text-3xl font-black mb-1">Hi, {user?.name?.split(" ")[0]} 👋</h1>
            <p className="text-[#64748b] text-sm">Here&apos;s your career snapshot</p>
          </div>
          <Link href="/candidate/profile">
            <button className="btn-primary-tb text-sm px-4 py-2">⚙️ Edit Profile</button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(s => {
            const cardEl = (
              <div key={s.label} className="rounded-2xl p-6 transition-all hover:border-[#6c63ff44] cursor-pointer" style={{ background: "#13131f", border: "1px solid #ffffff12" }}>
                <div className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs text-[#64748b]">{s.label}</div>
              </div>
            );
            return s.label === "Profile complete" ? (
              <Link key={s.label} href="/candidate/profile">{cardEl}</Link>
            ) : (
              <div key={s.label}>{cardEl}</div>
            );
          })}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: "📄", label: "My Resumes",      href: "/candidate/resumes" },
            { icon: "🔍", label: "Find Jobs",        href: "/candidate/jobs" },
            { icon: "🎯", label: "Interview Prep",   href: "/candidate/interview" },
            { icon: "✉️", label: "Cover Letters",    href: "/candidate/cover-letters" },
          ].map(a => (
            <Link key={a.label} href={a.href}>
              <div className="tb-card text-center py-6 cursor-pointer">
                <div className="text-3xl mb-3">{a.icon}</div>
                <div className="text-sm font-semibold">{a.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent applications */}
        <div className="rounded-2xl p-6" style={{ background: "#13131f", border: "1px solid #ffffff12" }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold">Recent Applications</h3>
            <Link href="/candidate/applications" className="text-xs font-semibold" style={{ color: "#00d4aa" }}>View all →</Link>
          </div>
          {data?.recent_applications?.length ? (
            <div className="space-y-3">
              {data.recent_applications.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#ffffff06" }}>
                  <div>
                    <div className="font-medium text-sm">{a.job?.title}</div>
                    <div className="text-xs text-[#64748b]">{a.job?.company}</div>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full font-semibold capitalize"
                    style={{ background: "#6c63ff18", color: "#a5a0ff" }}>{a.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#64748b] text-sm">
              No applications yet. <Link href="/candidate/jobs" style={{ color: "#00d4aa" }}>Find a job →</Link>
            </div>
          )}
        </div>
      </main>

      {/* Floating chatbot */}
      <button onClick={() => setShowChat(o => !o)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl z-50 shadow-2xl transition-all hover:scale-110"
        style={{ background: "linear-gradient(135deg,#6c63ff,#00d4aa)" }}>
        {showChat ? "✕" : "🤖"}
      </button>
      {showChat && (
        <div className="fixed bottom-24 right-6 z-50 w-96">
          <BridgeAIChatbot onClose={() => setShowChat(false)} />
        </div>
      )}
    </div>
  );
}
