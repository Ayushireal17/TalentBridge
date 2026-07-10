"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../../lib/auth";
import Navbar from "../../../components/layout/Navbar";
import { recruiterAPI } from "../../../lib/api";
import Link from "next/link";

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    recruiterAPI.dashboard().then(r => setData(r.data.data)).catch(() => {});
  }, []);

  const stats = [
    { label: "Total Jobs",         value: data?.total_jobs ?? 0,        color: "#6c63ff" },
    { label: "Active Jobs",        value: data?.active_jobs ?? 0,       color: "#00d4aa" },
    { label: "Total Applications", value: data?.total_applications ?? 0, color: "#ffa500" },
    { label: "New (Unreviewed)",   value: data?.new_applications ?? 0,  color: "#ff6b6b" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-8">
          <div className="text-xs font-semibold text-[#00d4aa] tracking-[3px] uppercase mb-2">Recruiter Portal</div>
          <h1 className="text-3xl font-black mb-1">Hi, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-[#64748b] text-sm">{user?.recruiter?.company_name}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="rounded-2xl p-6" style={{ background: "#13131f", border: "1px solid #ffffff12" }}>
              <div className="text-3xl font-black mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-[#64748b]">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: "💼", label: "My Jobs",     href: "/recruiter/jobs" },
            { icon: "👥", label: "Applicants",  href: "/recruiter/jobs" },
            { icon: "📊", label: "Analytics",   href: "/recruiter/analytics" },
          ].map(a => (
            <Link key={a.label} href={a.href}>
              <div className="tb-card text-center py-8 cursor-pointer">
                <div className="text-4xl mb-3">{a.icon}</div>
                <div className="font-semibold">{a.label}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl p-6" style={{ background: "#13131f", border: "1px solid #ffffff12" }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold">Recent Jobs</h3>
            <Link href="/recruiter/jobs">
              <button className="btn-primary-tb text-xs px-4 py-2">+ Post Job</button>
            </Link>
          </div>
          {data?.recent_jobs?.length ? (
            <div className="space-y-3">
              {data.recent_jobs.map(job => (
                <div key={job.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#ffffff06" }}>
                  <div>
                    <div className="font-medium text-sm">{job.title}</div>
                    <div className="text-xs text-[#64748b]">{job.type} · {job.location || "Remote"}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#64748b]">{job.applications_count} applicants</span>
                    <span className="text-xs px-2 py-1 rounded-full" style={{ background: job.is_active ? "#00d4aa18" : "#64748b18", color: job.is_active ? "#00d4aa" : "#64748b" }}>
                      {job.is_active ? "Active" : "Paused"}
                    </span>
                    <Link href={`/recruiter/jobs/${job.id}/applicants`}>
                      <button className="text-xs px-3 py-1 rounded-lg border" style={{ borderColor: "#6c63ff44", color: "#a5a0ff" }}>View</button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#64748b] text-sm">
              No jobs yet. <Link href="/recruiter/jobs/new" style={{ color: "#00d4aa" }}>Post your first job →</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
