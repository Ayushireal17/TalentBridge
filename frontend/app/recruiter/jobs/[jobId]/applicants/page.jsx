"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "../../../../../components/layout/Navbar";
import { recruiterAPI } from "../../../../../lib/api";
import toast from "react-hot-toast";

const STATUSES = ["submitted","reviewing","shortlisted","interview","hired","rejected"];

export default function ApplicantsPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("");

  const load = () => {
    Promise.all([
      import("../../../../../lib/api").then(m => m.default.get(`/v1/recruiter/jobs/${jobId}`)),
      recruiterAPI.applicants(jobId),
    ]).then(([jr, ar]) => {
      setJob(jr.data.data);
      setApplicants(ar.data.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const rankAll = async () => {
    setRanking(true);
    try {
      await recruiterAPI.rankCandidates(jobId);
      toast.success("AI ranking started! Results ready shortly.");
      setTimeout(load, 10000);
    } catch { toast.error("Ranking failed."); }
    finally { setRanking(false); }
  };

  const updateStatus = async (appId, status) => {
    await recruiterAPI.updateStatus(jobId, appId, status);
    toast.success("Status updated.");
    load();
  };

  const filtered = filter ? applicants.filter(a => a.status === filter) : applicants;

  if (loading) return <div style={{ minHeight: "100vh", background: "#0a0a0f" }}><Navbar /><div className="text-center pt-40 text-[#64748b]">Loading…</div></div>;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black">{job?.title}</h1>
            <p className="text-[#64748b] text-sm mt-1">{applicants.length} applicants · {job?.company}</p>
          </div>
          <button onClick={rankAll} disabled={ranking}
            className="text-sm px-5 py-2.5 rounded-xl font-semibold border transition-all"
            style={{ borderColor: "#6c63ff44", color: "#a5a0ff", background: ranking ? "#6c63ff22" : "transparent" }}>
            {ranking ? "🤖 Ranking…" : "🤖 AI Rank All"}
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {["", ...STATUSES].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="px-4 py-2 rounded-full text-sm font-semibold flex-shrink-0 transition-all capitalize"
              style={filter === s
                ? { background: "linear-gradient(135deg,#6c63ff,#00d4aa)", color: "#fff" }
                : { background: "#ffffff08", color: "#64748b" }}>
              {s || "All"}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#64748b]">No applicants {filter ? `with status "${filter}"` : "yet"}.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(app => (
              <div key={app.id} className="rounded-2xl p-5 cursor-pointer transition-all" style={{ background: "#13131f", border: "1px solid #ffffff12" }}
                onClick={() => setSelected(app)}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                      style={{ background: "linear-gradient(135deg,#6c63ff22,#00d4aa22)", border: "1px solid #6c63ff44" }}>
                      {app.user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold">{app.user?.name}</div>
                      <div className="text-xs text-[#64748b]">{app.user?.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {app.match_score != null && (
                      <div className="text-center">
                        <div className="font-black text-xl" style={{ color: "#00d4aa" }}>{app.match_score}%</div>
                        <div className="text-xs text-[#64748b]">match</div>
                      </div>
                    )}
                    <select value={app.status} onClick={e => e.stopPropagation()}
                      onChange={e => updateStatus(app.id, e.target.value)}
                      className="text-xs px-3 py-2 rounded-lg border outline-none capitalize font-semibold"
                      style={{ background: "#0a0a0f", borderColor: "#ffffff18", color: "#e2e8f0" }}>
                      {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </select>
                  </div>
                </div>
                {app.ai_summary && (
                  <p className="text-xs text-[#64748b] mt-3 px-1 line-clamp-2">{app.ai_summary}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Applicant detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md h-full overflow-y-auto p-6" style={{ background: "#13131f", borderLeft: "1px solid #ffffff12" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">{selected.user?.name}</h3>
              <button onClick={() => setSelected(null)} className="text-[#64748b] hover:text-white text-xl">✕</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-[#64748b] mb-1">Email</p><p className="font-medium">{selected.user?.email}</p></div>
                <div><p className="text-xs text-[#64748b] mb-1">Applied</p><p className="font-medium">{new Date(selected.applied_at).toLocaleDateString()}</p></div>
                {selected.match_score != null && (
                  <div className="col-span-2"><p className="text-xs text-[#64748b] mb-1">AI Match Score</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#ffffff08" }}>
                        <div className="h-full rounded-full" style={{ width: `${selected.match_score}%`, background: "linear-gradient(135deg,#6c63ff,#00d4aa)" }} />
                      </div>
                      <span className="font-black text-lg" style={{ color: "#00d4aa" }}>{selected.match_score}%</span>
                    </div>
                  </div>
                )}
              </div>
              {selected.matched_skills?.length > 0 && (
                <div>
                  <p className="text-xs text-[#64748b] mb-2">✅ Matched Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.matched_skills.map(s => <span key={s} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#00d4aa18", color: "#00d4aa" }}>{s}</span>)}
                  </div>
                </div>
              )}
              {selected.missing_skills?.length > 0 && (
                <div>
                  <p className="text-xs text-[#64748b] mb-2">❌ Missing Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.missing_skills.map(s => <span key={s} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#ff6b6b18", color: "#ff6b6b" }}>{s}</span>)}
                  </div>
                </div>
              )}
              {selected.ai_summary && (
                <div className="rounded-xl p-4" style={{ background: "#6c63ff0a", border: "1px solid #6c63ff22" }}>
                  <p className="text-xs font-semibold text-[#a5a0ff] mb-2">🤖 AI Assessment</p>
                  <p className="text-sm text-[#e2e8f0] leading-relaxed">{selected.ai_summary}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-[#64748b] mb-3">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => { updateStatus(selected.id, s); setSelected(p => ({ ...p, status: s })); }}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold capitalize transition-all"
                      style={selected.status === s
                        ? { background: "linear-gradient(135deg,#6c63ff,#00d4aa)", color: "#fff" }
                        : { background: "#ffffff08", color: "#64748b" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
