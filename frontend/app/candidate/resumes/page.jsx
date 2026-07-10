"use client";
import { useEffect, useRef, useState } from "react";
import Navbar from "../../../components/layout/Navbar";
import { resumeAPI } from "../../../lib/api";
import toast from "react-hot-toast";

export default function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parseStep, setParseStep] = useState("");
  const fileRef  = useRef();
  const parseRef = useRef();

  const load = () => {
    resumeAPI.list()
      .then(r => setResumes(r.data.data || []))
      .catch(() => toast.error("Failed to load resumes."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Auto-poll every 4s while any resume is still being analysed
  useEffect(() => {
    const hasProcessing = resumes.some(r => r.analysis_status === "pending" || r.analysis_status === "processing");
    if (!hasProcessing) return;
    const timer = setInterval(() => {
      resumeAPI.list()
        .then(r => setResumes(r.data.data || []))
        .catch(() => {});
    }, 4000);
    return () => clearInterval(timer);
  }, [resumes]);

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("resume", file);
    try {
      await resumeAPI.upload(form);
      toast.success("Resume uploaded! AI analysis in progress.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed. Max 5MB, PDF or DOCX.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const quickParse = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setParsing(true);
    setParseStep("📄 Reading file…");
    setAnalysis(null);
    const form = new FormData();
    form.append("file", file);
    // Show progress messages while waiting for AI
    const steps = [
      "📄 Reading file…",
      "🔍 Extracting text…",
      "🤖 AI is analysing your resume…",
      "📊 Calculating ATS score…",
      "✍️ Generating feedback…",
    ];
    let stepIdx = 0;
    const stepTimer = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, steps.length - 1);
      setParseStep(steps[stepIdx]);
    }, 8000);
    try {
      const res = await resumeAPI.parse(form);
      clearInterval(stepTimer);
      setAnalysis(res.data.data);
      toast.success("Resume parsed successfully!");
    } catch (err) {
      clearInterval(stepTimer);
      toast.error(err.response?.data?.message || "Parse failed. Please try again.");
    } finally {
      setParsing(false);
      setParseStep("");
      if (parseRef.current) parseRef.current.value = "";
    }
  };

  const setPrimary = async (id) => {
    try {
      await resumeAPI.setPrimary(id);
      toast.success("Primary resume set.");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to set primary.");
    }
  };

  const deleteResume = async (id) => {
    if (!confirm("Delete this resume?")) return;
    try {
      await resumeAPI.delete(id);
      toast.success("Resume deleted.");
      load();
    } catch (err) {
      const msg = err.response?.data?.message || "Delete failed.";
      const status = err.response?.status;
      toast.error(`Error ${status}: ${msg}`);
      console.error("Delete error:", err.response?.data);
    }
  };

  const gradeColor = (g) => ({
    A: "#00d4aa", B: "#6c63ff", C: "#ffa500", D: "#ff6b6b", F: "#ff6b6b",
  }[g] ?? "#9b7b7b");

  const inputStyle = {
    background: "#120808", border: "1px solid #ffffff18",
    borderRadius: 10, color: "#f1e8e8", padding: "12px 16px",
    fontSize: 14, outline: "none", fontFamily: "Inter, sans-serif", width: "100%",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0a0a" }}>
      <Navbar />
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "112px 24px 64px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1, marginBottom: 4 }}>My Resumes</h1>
            <p style={{ color: "#9b7b7b", fontSize: 14 }}>Upload PDF or DOCX — AI analyses instantly</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input ref={parseRef} type="file" accept=".pdf,.png,.jpg,.jpeg" style={{ display: "none" }} onChange={quickParse} />
            <button
              onClick={() => parseRef.current?.click()}
              disabled={parsing}
              style={{
                fontSize: 13, padding: "10px 18px", borderRadius: 12,
                border: "1px solid #00d4aa44", color: "#00d4aa",
                background: "transparent", cursor: "pointer", fontWeight: 600,
                fontFamily: "Inter, sans-serif", transition: "all 0.2s",
              }}>
              {parsing ? parseStep || "🤖 Parsing…" : "🤖 Quick Parse"}
            </button>

            <input ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: "none" }} onChange={upload} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="btn-primary-tb"
              style={{ fontSize: 13 }}>
              {uploading ? "Uploading…" : "+ Upload Resume"}
            </button>
          </div>
        </div>

        {/* Quick parse result */}
        {analysis && (
          <div style={{
            borderRadius: 24, padding: 28, marginBottom: 24,
            background: "#1a0f0f", border: "1px solid #00d4aa44",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #ffffff08" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>✅</span>
                <div>
                  <div style={{ fontWeight: 700 }}>Resume Parsed Successfully</div>
                  <div style={{ fontSize: 12, color: "#9b7b7b" }}>AI-extracted data</div>
                </div>
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 100,
                background: "#00d4aa18", border: "1px solid #00d4aa44", color: "#00d4aa",
              }}>🤖 AI Summary</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                ["Name",         analysis.name],
                ["Experience",   analysis.experience],
                ["Current Role", analysis.title],
                ["Education",    analysis.education?.[0]?.institution || analysis.education?.[0]],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label} style={{ borderRadius: 12, padding: 16, background: "#ffffff06" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#9b7b7b", marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 14 }}>{typeof value === "object" ? JSON.stringify(value) : value}</div>
                </div>
              ))}

              {analysis.skills?.length > 0 && (
                <div style={{ borderRadius: 12, padding: 16, background: "#ffffff06", gridColumn: "1 / -1" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#9b7b7b", marginBottom: 10 }}>Skills Detected</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {(Array.isArray(analysis.skills) ? analysis.skills : []).slice(0, 20).map(s => (
                      <span key={s} style={{
                        fontSize: 12, padding: "5px 12px", borderRadius: 100,
                        background: "#e11d4818", border: "1px solid #e11d4844", color: "#e11d48",
                      }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.ats_score != null && (
                <div style={{ borderRadius: 12, padding: 16, background: "#ffffff06", gridColumn: "1 / -1" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#9b7b7b" }}>ATS Score</div>
                    <span style={{ fontSize: 18, fontWeight: 900, color: "#00d4aa" }}>{analysis.ats_score} / 100</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 100, background: "#ffffff08", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 100, width: `${analysis.ats_score}%`, background: "linear-gradient(135deg,#e11d48,#f97316)", transition: "width 1s" }} />
                  </div>
                </div>
              )}

              {analysis.summary && (
                <div style={{ borderRadius: 12, padding: 16, background: "#ffffff06", gridColumn: "1 / -1" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#9b7b7b", marginBottom: 8 }}>AI Summary</div>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: "#f1e8e8" }}>{analysis.summary}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setAnalysis(null)}
              style={{ marginTop: 16, fontSize: 12, color: "#9b7b7b", background: "none", border: "none", cursor: "pointer" }}>
              ✕ Dismiss
            </button>
          </div>
        )}

        {/* Resume list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#9b7b7b" }}>Loading…</div>
        ) : resumes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📄</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>No resumes yet</h3>
            <p style={{ color: "#9b7b7b", marginBottom: 24, fontSize: 14 }}>Upload a PDF or DOCX to get your AI-powered ATS score.</p>
            <button onClick={() => fileRef.current?.click()} className="btn-primary-tb">Upload Resume</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {resumes.map(r => (
              <div key={r.id} style={{
                background: "#1a0f0f", border: "1px solid #ffffff12",
                borderRadius: 20, padding: 24, transition: "all 0.3s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#e11d4844"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#ffffff12"; e.currentTarget.style.transform = "translateY(0)"; }}>

                {/* File info */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <p style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>
                        {r.original_filename}
                      </p>
                      {r.is_primary && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 100,
                          background: "#e11d4818", border: "1px solid #e11d4844", color: "#e11d48", flexShrink: 0,
                        }}>Primary</span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: "#9b7b7b", marginBottom: 12 }}>
                      {r.file_type?.toUpperCase()} · {r.file_size_formatted || "—"}
                    </p>

                    {/* Status badge */}
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 100,
                      background: r.analysis_status === "done" ? "#00d4aa18" : r.analysis_status === "failed" ? "#ff6b6b18" : "#ffa50018",
                      color: r.analysis_status === "done" ? "#00d4aa" : r.analysis_status === "failed" ? "#ff6b6b" : "#ffa500",
                      border: `1px solid ${r.analysis_status === "done" ? "#00d4aa44" : r.analysis_status === "failed" ? "#ff6b6b44" : "#ffa50044"}`,
                      textTransform: "capitalize",
                      display: "flex", alignItems: "center", gap: 5,
                    }}>
                      {(r.analysis_status === "pending" || r.analysis_status === "processing") && (
                        <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#ffa500", animation: "pulse 1.2s infinite" }} />
                      )}
                      {r.analysis_status === "pending" ? "🔄 Analysing…" : r.analysis_status === "processing" ? "⚙️ Processing…" : r.analysis_status}
                    </span>
                  </div>

                  {/* ATS Score */}
                  {r.ats_score != null && (
                    <div style={{ textAlign: "center", flexShrink: 0, marginLeft: 12 }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: gradeColor(r.ats_grade) }}>{r.ats_score}</div>
                      <div style={{ fontSize: 10, color: "#9b7b7b" }}>ATS</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: gradeColor(r.ats_grade) }}>Grade {r.ats_grade}</div>
                    </div>
                  )}
                </div>

                {/* ATS bar */}
                {r.ats_score != null && (
                  <div style={{ height: 4, borderRadius: 100, background: "#ffffff08", overflow: "hidden", marginBottom: 16 }}>
                    <div style={{ height: "100%", borderRadius: 100, width: `${r.ats_score}%`, background: "linear-gradient(135deg,#e11d48,#f97316)" }} />
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {!r.is_primary && (
                    <button
                      onClick={() => setPrimary(r.id)}
                      style={{
                        fontSize: 12, padding: "7px 14px", borderRadius: 10, fontWeight: 600,
                        border: "1px solid #e11d4444", color: "#e11d48",
                        background: "transparent", cursor: "pointer", fontFamily: "Inter, sans-serif",
                      }}>
                      Set Primary
                    </button>
                  )}
                  <button
                    onClick={() => deleteResume(r.id)}
                    style={{
                      fontSize: 12, padding: "7px 14px", borderRadius: 10, fontWeight: 600,
                      background: "#ff6b6b18", color: "#ff6b6b", border: "none",
                      cursor: "pointer", fontFamily: "Inter, sans-serif",
                    }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}