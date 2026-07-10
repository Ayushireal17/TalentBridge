"use client";
import { useEffect, useState } from "react";
import Navbar from "../../../components/layout/Navbar";
import { jobAPI } from "../../../lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

const STATUS_COLORS = {
  submitted:   { bg: "#6c63ff18", text: "#a5a0ff" },
  reviewing:   { bg: "#ffa50018", text: "#ffa500" },
  shortlisted: { bg: "#00d4aa18", text: "#00d4aa" },
  interview:   { bg: "#6c63ff33", text: "#6c63ff" },
  hired:       { bg: "#22c55e18", text: "#22c55e" },
  rejected:    { bg: "#ff6b6b18", text: "#ff6b6b" },
  withdrawn:   { bg: "#64748b18", text: "#64748b" },
};

export default function ApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("applications");

  const load = () => {
    setLoading(true);
    Promise.all([
      jobAPI.applications(),
      jobAPI.savedJobs()
    ])
      .then(([appsRes, savedRes]) => {
        setApps(appsRes.data.data || []);
        setSavedJobs(savedRes.data.data || []);
      })
      .catch(() => toast.error("Failed to load applications or saved jobs."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const withdraw = async (id) => {
    if (!confirm("Withdraw this application?")) return;
    try {
      await import("../../../lib/api").then(m => m.default.delete(`/v1/candidate/applications/${id}`));
      toast.success("Application withdrawn.");
      load();
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot withdraw.");
    }
  };

  const unsaveJob = async (jobId) => {
    try {
      await jobAPI.unsaveJob(jobId);
      toast.success("Job removed from saved!");
      load();
    } catch {
      toast.error("Could not remove from saved.");
    }
  };

  const statuses = [...new Set(apps.map(a => a.status))];
  const filtered = filter ? apps.filter(a => a.status === filter) : apps;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-4">My Applications & Jobs</h1>
          
          {/* Tab Selector */}
          <div className="flex gap-6 border-b border-[#ffffff12]">
            <button onClick={() => setActiveTab("applications")}
              className="pb-3 text-base font-bold transition-all relative outline-none"
              style={{ color: activeTab === "applications" ? "#fff" : "#64748b" }}>
              Applications ({apps.length})
              {activeTab === "applications" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(135deg,#6c63ff,#00d4aa)" }} />
              )}
            </button>
            <button onClick={() => setActiveTab("saved")}
              className="pb-3 text-base font-bold transition-all relative outline-none"
              style={{ color: activeTab === "saved" ? "#fff" : "#64748b" }}>
              Saved Jobs ({savedJobs.length})
              {activeTab === "saved" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(135deg,#6c63ff,#00d4aa)" }} />
              )}
            </button>
          </div>
        </div>

        {activeTab === "applications" ? (
          <>
            {/* Status filter pills */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {["", ...Object.keys(STATUS_COLORS)].map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all"
                  style={filter === s
                    ? { background: "linear-gradient(135deg,#6c63ff,#00d4aa)", color: "#fff" }
                    : { background: "#ffffff08", color: "#64748b" }}>
                  {s || "All"} {s ? `(${apps.filter(a => a.status === s).length})` : `(${apps.length})`}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-16 text-[#64748b]">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-xl font-bold mb-2">No applications {filter ? `with status "${filter}"` : "yet"}</h3>
                <p className="text-[#64748b] text-sm">Start applying to jobs to track them here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(app => {
                  const sc = STATUS_COLORS[app.status] || STATUS_COLORS.submitted;
                  return (
                    <div key={app.id}
                      onClick={() => setSelected(app)}
                      className="rounded-2xl p-5 cursor-pointer transition-all hover:border-[#6c63ff44]"
                      style={{ background: "#13131f", border: "1px solid #ffffff12" }}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                            style={{ background: "linear-gradient(135deg,#6c63ff22,#00d4aa22)", border: "1px solid #6c63ff33" }}>
                            {app.job?.company?.[0]?.toUpperCase() || "J"}
                          </div>
                          <div>
                            <h3 className="font-bold text-base">{app.job?.title}</h3>
                            <p className="text-sm text-[#64748b]">{app.job?.company} · {app.job?.location || "Remote"}</p>
                            <p className="text-xs text-[#64748b] mt-1">Applied {new Date(app.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span className="text-xs px-3 py-1.5 rounded-full font-semibold capitalize"
                            style={{ background: sc.bg, color: sc.text }}>
                            {app.status}
                          </span>
                          {app.match_score != null && (
                            <span className="text-xs font-bold" style={{ color: "#00d4aa" }}>
                              {app.match_score}% match
                            </span>
                          )}
                        </div>
                      </div>
                      {app.ai_summary && (
                        <p className="text-xs text-[#64748b] mt-3 line-clamp-2">{app.ai_summary}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {loading ? (
              <div className="text-center py-16 text-[#64748b]">Loading…</div>
            ) : savedJobs.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔖</div>
                <h3 className="text-xl font-bold mb-2">No saved jobs yet</h3>
                <p className="text-[#64748b] text-sm">Save jobs from the search board to track them here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedJobs.map(item => (
                  <div key={item.id} className="rounded-2xl p-6 transition-all" style={{ background: "#13131f", border: "1px solid #ffffff12" }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{item.job?.title}</h3>
                        <p className="text-sm text-[#64748b] mb-3">{item.job?.company} · {item.job?.location || "Remote"}</p>
                        <div className="flex gap-2 flex-wrap mb-3">
                          {[item.job?.type, item.job?.experience_level, item.job?.is_remote && "Remote", item.job?.salary_range].filter(Boolean).map((t, i) => (
                            <span key={i} className="text-xs px-2.5 py-1 rounded-full capitalize" style={{ background: "#ffffff08", color: "#64748b" }}>{t}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Link href={`/candidate/jobs/${item.job?.id}`}>
                          <button className="btn-primary-tb text-sm px-4 py-2">View & Apply</button>
                        </Link>
                        <button onClick={() => unsaveJob(item.job?.id)}
                          className="text-sm px-4 py-2 rounded-xl font-semibold"
                          style={{ background: "#ff6b6b18", color: "#ff6b6b" }}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md h-full overflow-y-auto p-6"
            style={{ background: "#13131f", borderLeft: "1px solid #ffffff12" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Application Detail</h3>
              <button onClick={() => setSelected(null)} className="text-[#64748b] hover:text-white text-xl">✕</button>
            </div>

            <div className="space-y-5">
              <div>
                <h4 className="font-bold text-xl">{selected.job?.title}</h4>
                <p className="text-[#64748b]">{selected.job?.company}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Status",  <span key="s" className="capitalize font-semibold" style={{ color: STATUS_COLORS[selected.status]?.text }}>{selected.status}</span>],
                  ["Applied", new Date(selected.applied_at).toLocaleDateString()],
                  ["Match",   selected.match_score != null ? `${selected.match_score}%` : "—"],
                  ["Type",    selected.job?.type || "—"],
                ].map(([label, val]) => (
                  <div key={label} className="rounded-xl p-3" style={{ background: "#ffffff06" }}>
                    <div className="text-xs text-[#64748b] mb-1">{label}</div>
                    <div className="text-sm font-medium">{val}</div>
                  </div>
                ))}
              </div>

              {selected.matched_skills?.length > 0 && (
                <div>
                  <p className="text-xs text-[#64748b] mb-2 font-semibold uppercase tracking-wider">✅ Matched Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.matched_skills.map(s => (
                      <span key={s} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#00d4aa18", color: "#00d4aa" }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {selected.missing_skills?.length > 0 && (
                <div>
                  <p className="text-xs text-[#64748b] mb-2 font-semibold uppercase tracking-wider">❌ Missing Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.missing_skills.map(s => (
                      <span key={s} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#ff6b6b18", color: "#ff6b6b" }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {selected.ai_summary && (
                <div className="rounded-xl p-4" style={{ background: "#6c63ff0a", border: "1px solid #6c63ff22" }}>
                  <p className="text-xs font-semibold text-[#a5a0ff] mb-2">🤖 AI Assessment</p>
                  <p className="text-sm leading-relaxed">{selected.ai_summary}</p>
                </div>
              )}

              {selected.recruiter_note && (
                <div className="rounded-xl p-4" style={{ background: "#00d4aa0a", border: "1px solid #00d4aa22" }}>
                  <p className="text-xs font-semibold text-[#00d4aa] mb-2">💬 Recruiter Note</p>
                  <p className="text-sm leading-relaxed">{selected.recruiter_note}</p>
                </div>
              )}

              {!["hired","rejected","withdrawn"].includes(selected.status) && (
                <button onClick={() => withdraw(selected.id)}
                  className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: "#ff6b6b18", color: "#ff6b6b", border: "1px solid #ff6b6b33" }}>
                  Withdraw Application
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
