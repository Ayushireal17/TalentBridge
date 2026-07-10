"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../../../lib/auth";
import Navbar from "../../../components/layout/Navbar";
import { recruiterAPI } from "../../../lib/api";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    recruiterAPI.jobs().then(r => setJobs(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    await recruiterAPI.toggleJob(id);
    toast.success("Job status updated.");
    load();
  };

  const del = async (id) => {
    if (!confirm("Delete this job?")) return;
    await recruiterAPI.deleteJob(id);
    toast.success("Job deleted.");
    load();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black">My Job Postings</h1>
          <Link href="/recruiter/jobs/new">
            <button className="btn-primary-tb">+ Post New Job</button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-[#64748b]">Loading…</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">💼</div>
            <h3 className="text-xl font-bold mb-2">No jobs posted yet</h3>
            <p className="text-[#64748b] mb-6">Post your first job to start receiving applications.</p>
            <Link href="/recruiter/jobs/new"><button className="btn-primary-tb">Post a Job</button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className="rounded-2xl p-6 transition-all" style={{ background: "#13131f", border: "1px solid #ffffff12" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg">{job.title}</h3>
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: job.is_active ? "#00d4aa18" : "#64748b18", color: job.is_active ? "#00d4aa" : "#64748b" }}>
                        {job.is_active ? "Active" : "Paused"}
                      </span>
                    </div>
                    <p className="text-sm text-[#64748b] mb-3">{job.type} · {job.location || "Remote"} · {job.experience_level}</p>
                    <div className="text-xs text-[#64748b]">
                      {job.applications_count ?? 0} applications ·
                      {job.expires_at ? ` Expires ${new Date(job.expires_at).toLocaleDateString()}` : " No expiry"}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Link href={`/recruiter/jobs/${job.id}/applicants`}>
                      <button className="text-sm px-4 py-2 rounded-xl border font-semibold" style={{ borderColor: "#6c63ff44", color: "#a5a0ff" }}>
                        Applicants
                      </button>
                    </Link>
                    <button onClick={() => toggle(job.id)} className="text-sm px-4 py-2 rounded-xl border font-semibold transition-all" style={{ borderColor: "#ffffff18", color: "#e2e8f0" }}>
                      {job.is_active ? "Pause" : "Activate"}
                    </button>
                    <button onClick={() => del(job.id)} className="text-sm px-4 py-2 rounded-xl font-semibold" style={{ background: "#ff6b6b18", color: "#ff6b6b" }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
