"use client";
import { useEffect, useState, useCallback } from "react";
import Navbar from "../../../components/layout/Navbar";
import { jobAPI, aiAPI } from "../../../lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function CandidateJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [matching, setMatching] = useState({});
  const [saving, setSaving] = useState({});

  const load = useCallback(() => {
    setLoading(true);
    jobAPI.list({ search, type }).then(r => setJobs(r.data.data)).finally(() => setLoading(false));
  }, [search, type]);

  useEffect(() => { load(); }, [load]);

  const matchJob = async (id) => {
    setMatching(m => ({ ...m, [id]: true }));
    try {
      const res = await aiAPI.matchJob(id);
      toast.success(`Match: ${res.data.data.match_percentage}%!`);
      load();
    } catch { toast.error("Upload a resume first."); }
    finally { setMatching(m => ({ ...m, [id]: false })); }
  };

  const toggleSaveJob = async (id, isSaved) => {
    setSaving(s => ({ ...s, [id]: true }));
    try {
      if (isSaved) {
        await jobAPI.unsaveJob(id);
        toast.success("Job removed from saved!");
      } else {
        await jobAPI.saveJob(id);
        toast.success("Job saved!");
      }
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed.");
    } finally { setSaving(s => ({ ...s, [id]: false })); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <h1 className="text-3xl font-black mb-6">Find Jobs</h1>

        <div className="flex gap-3 mb-8">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs, companies, skills…" className="input-tb flex-1" />
          <select value={type} onChange={e => setType(e.target.value)} className="input-tb w-44">
            <option value="">All Types</option>
            {["full-time","part-time","contract","internship","freelance"].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-16 text-[#64748b]">Loading jobs…</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 text-[#64748b]">No jobs found. Try different search terms.</div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className="rounded-2xl p-6 transition-all" style={{ background: "#13131f", border: "1px solid #ffffff12" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{job.title}</h3>
                    <p className="text-sm text-[#64748b] mb-3">{job.company} · {job.location || "Remote"}</p>
                    <div className="flex gap-2 flex-wrap mb-3">
                      {[job.type, job.experience_level, job.is_remote && "Remote", job.salary_range].filter(Boolean).map((t, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-full capitalize" style={{ background: "#ffffff08", color: "#64748b" }}>{t}</span>
                      ))}
                    </div>
                    <p className="text-sm text-[#64748b] line-clamp-2">{job.description}</p>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Link href={`/candidate/jobs/${job.id}`}>
                      <button className="btn-primary-tb text-sm px-4 py-2">View & Apply</button>
                    </Link>
                    <button onClick={() => matchJob(job.id)} disabled={!!matching[job.id]}
                      className="text-sm px-4 py-2 rounded-xl border font-semibold transition-all"
                      style={{ borderColor: "#6c63ff44", color: "#a5a0ff" }}>
                      {matching[job.id] ? "Matching…" : "🤖 AI Match"}
                    </button>
                    <button onClick={() => toggleSaveJob(job.id, job.is_saved)} disabled={!!saving[job.id]}
                      className="text-sm px-4 py-2 rounded-xl font-semibold transition-all"
                      style={{
                        background: job.is_saved ? "#ffa50018" : "#ffffff08",
                        color: job.is_saved ? "#ffa500" : "#64748b"
                      }}>
                      {saving[job.id] ? "Saving…" : job.is_saved ? "🔖 Saved" : "🔖 Save"}
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
