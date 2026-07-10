"use client";
import { useEffect, useState } from "react";
import Navbar from "../../../components/layout/Navbar";
import { adminAPI } from "../../../lib/api";
import toast from "react-hot-toast";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => adminAPI.jobs().then(r => setJobs(r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const toggleJob = async (id) => {
    await adminAPI.toggleJob(id);
    toast.success("Job status changed.");
    load();
  };

  const deleteJob = async (id) => {
    if (!confirm("Delete this job permanently?")) return;
    await import("../../../lib/api").then(m => m.default.delete(`/v1/admin/jobs/${id}`));
    toast.success("Job deleted.");
    load();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-8">
          <div className="text-xs font-semibold text-[#ff6b6b] tracking-[3px] uppercase mb-2">Admin</div>
          <h1 className="text-3xl font-black mb-1">Manage Jobs</h1>
          <p className="text-[#64748b] text-sm">{jobs.length} jobs in system</p>
        </div>
        {loading ? (
          <div className="text-center py-16 text-[#64748b]">Loading…</div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: "#13131f", border: "1px solid #ffffff12" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #ffffff08" }}>
                  {["Job", "Recruiter", "Applications", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-[#64748b] px-5 py-4 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id} style={{ borderBottom: "1px solid #ffffff05" }}>
                    <td className="px-5 py-4">
                      <div className="font-semibold">{job.title}</div>
                      <div className="text-xs text-[#64748b]">{job.company} · {job.type}</div>
                    </td>
                    <td className="px-5 py-4 text-[#64748b] text-xs">{job.recruiter?.company_name || "—"}</td>
                    <td className="px-5 py-4 text-center font-bold" style={{ color: "#6c63ff" }}>{job.applications_count ?? 0}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                        style={{ background: job.is_active ? "#00d4aa18" : "#ff6b6b18", color: job.is_active ? "#00d4aa" : "#ff6b6b" }}>
                        {job.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => toggleJob(job.id)} className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                          style={{ background: job.is_active ? "#ff6b6b18" : "#00d4aa18", color: job.is_active ? "#ff6b6b" : "#00d4aa" }}>
                          {job.is_active ? "Disable" : "Enable"}
                        </button>
                        <button onClick={() => deleteJob(job.id)} className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                          style={{ background: "#ff6b6b18", color: "#ff6b6b" }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
