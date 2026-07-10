"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../../components/layout/Navbar";
import { jobAPI, aiAPI, resumeAPI } from "../../../../lib/api";
import toast from "react-hot-toast";

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [matching, setMatching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [matchResult, setMatchResult] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      jobAPI.get(id),
      resumeAPI.list().catch(() => ({ data: { data: [] } }))
    ])
      .then(([r, res]) => {
        setJob(r.data.data);
        setApplied(r.data.applied || false);
        setSaved(r.data.saved || false);
        setResumes(res.data.data || []);
      })
      .catch(() => {
        toast.error("Job not found.");
        router.push("/candidate/jobs");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  const matchJob = async () => {
    setMatching(true);
    try {
      const res = await aiAPI.matchJob(id);
      setMatchResult(res.data.data);
      toast.success(`Match: ${res.data.data.match_percentage}%!`);
    } catch { toast.error("Upload a resume first to get AI match."); }
    finally { setMatching(false); }
  };

  const toggleSaveJob = async () => {
    setSaving(true);
    try {
      if (saved) {
        await jobAPI.unsaveJob(id);
        toast.success("Job removed from saved!");
        setSaved(false);
      } else {
        await jobAPI.saveJob(id);
        toast.success("Job saved!");
        setSaved(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed.");
    } finally { setSaving(false); }
  };

  const applyJob = async (e) => {
    e.preventDefault();
    if (resumes.length === 0) {
      toast.error("Please upload a resume first under the 'Resumes' tab.");
      return;
    }
    const primaryResume = resumes.find(r => r.is_primary) || resumes[0];

    setApplying(true);
    try {
      await jobAPI.apply(id, {
        resume_id: primaryResume.id,
        candidate_note: coverLetter
      });
      toast.success("Application submitted!");
      setApplied(true);
      setShowApplyModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Application failed.");
    } finally { setApplying(false); }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
        <Navbar />
        <div style={{ textAlign: "center", paddingTop: 200, color: "#64748b", fontSize: 18 }}>
          Loading job details…
        </div>
      </div>
    );
  }

  if (!job) return null;

  const salaryDisplay = job.salary_min
    ? `${job.salary_currency || "INR"} ${Number(job.salary_min).toLocaleString()}${job.salary_max ? ` – ${Number(job.salary_max).toLocaleString()}` : ""} / ${job.salary_period || "year"}`
    : "Salary not disclosed";

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      <Navbar />

      {/* Apply Modal */}
      {showApplyModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
          background: "#000000bb",
        }}>
          <div style={{
            width: "100%", maxWidth: 520, borderRadius: 24, padding: 32,
            background: "#13131f", border: "1px solid #6c63ff33",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>Apply for {job.title}</h3>
              <button onClick={() => setShowApplyModal(false)}
                style={{ background: "none", border: "none", color: "#64748b", fontSize: 22, cursor: "pointer" }}>
                ✕
              </button>
            </div>
            <form onSubmit={applyJob} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 2 }}>
                  Cover Letter (optional)
                </label>
                <textarea
                  rows={6}
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  placeholder="Tell the recruiter why you're a great fit…"
                  style={{
                    width: "100%", padding: "12px 16px", borderRadius: 12,
                    background: "#0a0a0f", border: "1px solid #ffffff12",
                    color: "#f1f5f9", fontSize: 14, resize: "none", outline: "none",
                    fontFamily: "Inter, sans-serif", lineHeight: 1.6,
                    boxSizing: "border-box",
                  }}
                  onFocus={e => e.target.style.borderColor = "#6c63ff88"}
                  onBlur={e => e.target.style.borderColor = "#ffffff12"}
                />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <button type="submit" disabled={applying} className="btn-primary-tb" style={{ flex: 1, padding: "14px" }}>
                  {applying ? "Submitting…" : "🚀 Submit Application"}
                </button>
                <button type="button" onClick={() => setShowApplyModal(false)}
                  style={{
                    flex: 1, padding: "14px", borderRadius: 12, fontWeight: 600,
                    background: "#ffffff08", color: "#64748b", border: "none",
                    cursor: "pointer", fontFamily: "Inter, sans-serif",
                  }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        {/* Back button */}
        <button onClick={() => router.back()}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24,
            background: "none", border: "none", color: "#64748b", fontSize: 14,
            cursor: "pointer", fontFamily: "Inter, sans-serif", padding: 0,
          }}>
          ← Back to Jobs
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
          {/* Main content */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Job header card */}
            <div style={{
              borderRadius: 20, padding: 32,
              background: "#13131f", border: "1px solid #ffffff12",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
                <div>
                  <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -0.5, marginBottom: 6, color: "#fff" }}>
                    {job.title}
                  </h1>
                  <p style={{ fontSize: 16, color: "#64748b", marginBottom: 0 }}>
                    {job.company} · {job.location || "Remote"}
                  </p>
                </div>
                <div style={{ flexShrink: 0 }}>
                  {applied ? (
                    <span style={{
                      padding: "8px 20px", borderRadius: 100, fontSize: 13, fontWeight: 700,
                      background: "#00d4aa18", color: "#00d4aa", border: "1px solid #00d4aa33",
                    }}>
                      ✓ Applied
                    </span>
                  ) : (
                    <button onClick={() => setShowApplyModal(true)} className="btn-primary-tb" style={{ padding: "10px 24px" }}>
                      Apply Now
                    </button>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {[job.type, job.experience_level, job.is_remote && "Remote"].filter(Boolean).map((t, i) => (
                  <span key={i} style={{
                    fontSize: 12, padding: "5px 14px", borderRadius: 100, textTransform: "capitalize",
                    background: "#6c63ff18", color: "#a5a0ff", border: "1px solid #6c63ff22",
                  }}>
                    {t}
                  </span>
                ))}
              </div>

              {/* Salary */}
              <div style={{
                padding: "14px 18px", borderRadius: 12,
                background: "#ffffff06", border: "1px solid #ffffff08",
                display: "inline-flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>💰</span>
                <div>
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 2 }}>Compensation</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>{salaryDisplay}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{
              borderRadius: 20, padding: 32,
              background: "#13131f", border: "1px solid #ffffff12",
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#fff" }}>About This Role</h2>
              <p style={{ color: "#94a3b8", lineHeight: 1.8, fontSize: 14, whiteSpace: "pre-wrap" }}>
                {job.description}
              </p>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div style={{
                borderRadius: 20, padding: 32,
                background: "#13131f", border: "1px solid #ffffff12",
              }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#fff" }}>Requirements</h2>
                <p style={{ color: "#94a3b8", lineHeight: 1.8, fontSize: 14, whiteSpace: "pre-wrap" }}>
                  {job.requirements}
                </p>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && (
              <div style={{
                borderRadius: 20, padding: 32,
                background: "#13131f", border: "1px solid #ffffff12",
              }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#fff" }}>Benefits & Perks</h2>
                <p style={{ color: "#94a3b8", lineHeight: 1.8, fontSize: 14, whiteSpace: "pre-wrap" }}>
                  {job.benefits}
                </p>
              </div>
            )}

            {/* AI Match Result */}
            {matchResult && (
              <div style={{
                borderRadius: 20, padding: 32,
                background: "#13131f", border: "1px solid #6c63ff33",
              }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: "#fff" }}>🤖 AI Match Analysis</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 48, fontWeight: 900, color: matchResult.match_percentage >= 70 ? "#00d4aa" : matchResult.match_percentage >= 50 ? "#ffa500" : "#ff6b6b" }}>
                      {matchResult.match_percentage}%
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Match Score</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4, color: "#a5a0ff" }}>{matchResult.match_grade}</div>
                    <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{matchResult.suitability_summary}</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {matchResult.matched_skills?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#00d4aa", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>✓ Matched Skills</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {matchResult.matched_skills.map((s, i) => (
                          <span key={i} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, background: "#00d4aa18", color: "#00d4aa" }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {matchResult.missing_skills?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#ff6b6b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>✗ Missing Skills</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {matchResult.missing_skills.map((s, i) => (
                          <span key={i} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, background: "#ff6b6b18", color: "#ff6b6b" }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 100 }}>
            {/* Actions */}
            <div style={{
              borderRadius: 20, padding: 24,
              background: "#13131f", border: "1px solid #ffffff12",
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "#fff" }}>Quick Actions</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {!applied ? (
                  <button onClick={() => setShowApplyModal(true)} className="btn-primary-tb" style={{ width: "100%", padding: "12px" }}>
                    🚀 Apply Now
                  </button>
                ) : (
                  <div style={{
                    textAlign: "center", padding: "12px", borderRadius: 12,
                    background: "#00d4aa18", color: "#00d4aa", fontWeight: 700, fontSize: 14,
                  }}>
                    ✓ Application Sent
                  </div>
                )}
                <button onClick={matchJob} disabled={matching}
                  style={{
                    width: "100%", padding: "12px", borderRadius: 12, fontWeight: 600,
                    border: "1px solid #6c63ff44", color: "#a5a0ff", background: "transparent",
                    cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 14,
                    transition: "all 0.2s",
                  }}>
                  {matching ? "Analyzing…" : "🤖 AI Match Score"}
                </button>
                <button onClick={toggleSaveJob} disabled={saving}
                  style={{
                    width: "100%", padding: "12px", borderRadius: 12, fontWeight: 600,
                    background: saved ? "#ffa50018" : "#ffffff08",
                    color: saved ? "#ffa500" : "#64748b", border: "none",
                    cursor: "pointer", fontFamily: "Inter, sans-serif", fontSize: 14,
                  }}>
                  {saving ? "Saving…" : saved ? "🔖 Saved Job" : "🔖 Save Job"}
                </button>
              </div>
            </div>

            {/* Job info */}
            <div style={{
              borderRadius: 20, padding: 24,
              background: "#13131f", border: "1px solid #ffffff12",
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: "#fff" }}>Job Details</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { icon: "🏢", label: "Company", val: job.company },
                  { icon: "📍", label: "Location", val: job.location || "Remote" },
                  { icon: "💼", label: "Type", val: job.type },
                  { icon: "📊", label: "Level", val: job.experience_level },
                  { icon: "👁️", label: "Views", val: job.views_count?.toLocaleString() || "0" },
                  { icon: "👥", label: "Applicants", val: job.applications_count?.toLocaleString() || "0" },
                ].map(({ icon, label, val }) => val && (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16, width: 24 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, textTransform: "capitalize", color: "#cbd5e1" }}>{val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Required Skills */}
            {job.required_skills?.length > 0 && (
              <div style={{
                borderRadius: 20, padding: 24,
                background: "#13131f", border: "1px solid #ffffff12",
              }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "#fff" }}>Required Skills</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {job.required_skills.map((s, i) => (
                    <span key={i} style={{
                      fontSize: 12, padding: "5px 12px", borderRadius: 100,
                      background: "#ffffff08", color: "#94a3b8",
                    }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
