"use client";
import { useEffect, useState } from "react";
import Navbar from "../../../components/layout/Navbar";
import { aiAPI } from "../../../lib/api";
import toast from "react-hot-toast";

const selectStyle = {
  width: "100%", padding: "12px 16px", borderRadius: 10,
  background: "#120808", border: "1px solid #ffffff18",
  color: "#f1e8e8", fontSize: 14, outline: "none",
  fontFamily: "Inter, sans-serif", cursor: "pointer",
};

const optStyle = { background: "#120808", color: "#f1e8e8" };

export default function InterviewPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [active, setActive] = useState(null);
  const [answers, setAnswers] = useState({});
  const [evaluating, setEvaluating] = useState(false);
  const [form, setForm] = useState({
    role_title: "", session_type: "mixed",
    difficulty: "medium", questions_count: 10,
  });

  const load = () => {
    setLoading(true);
    aiAPI.listInterviews()
      .then(r => setSessions(r.data.data || []))
      .catch(() => toast.error("Failed to load sessions."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    if (!form.role_title.trim()) { toast.error("Enter a role title."); return; }
    setCreating(true);
    try {
      await aiAPI.createSession(form);
      toast.success("Session created! Questions generating…");
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create session.");
    } finally { setCreating(false); }
  };

  const openSession = async (id) => {
    try {
      const res = await aiAPI.getInterview(id);
      setActive(res.data.data);
      setAnswers({});
    } catch { toast.error("Failed to load session."); }
  };

  const submitAnswers = async () => {
    try {
      await import("../../../lib/api").then(m =>
        m.default.post(`/v1/candidate/interview-sessions/${active.id}/submit-answers`, { answers })
      );
      toast.success("Answers saved!");
      const res = await aiAPI.getInterview(active.id);
      setActive(res.data.data);
    } catch { toast.error("Save failed."); }
  };

  const evaluate = async () => {
    setEvaluating(true);
    try {
      await aiAPI.evaluateInterview(active.id);
      const res = await aiAPI.getInterview(active.id);
      setActive(res.data.data);
      toast.success("Evaluation complete!");
    } catch { toast.error("Evaluation failed. Check Gemini API key."); }
    finally { setEvaluating(false); }
  };

  const del = async (id) => {
    if (!confirm("Delete session?")) return;
    try {
      await aiAPI.deleteInterview(id);
      toast.success("Session deleted.");
      load();
    } catch { toast.error("Delete failed."); }
  };

  const gradeColor = (g) => ({
    Excellent: "#00d4aa", Good: "#6c63ff",
    Fair: "#ffa500", "Needs Work": "#ff6b6b", Poor: "#ff6b6b",
  }[g] ?? "#9b7b7b");

  const statusColor = (s) => ({
    completed:           { bg: "#00d4aa18", text: "#00d4aa" },
    in_progress:         { bg: "#ffa50018", text: "#ffa500" },
    questions_generated: { bg: "#e11d4818", text: "#e11d48" },
    generating:          { bg: "#ffffff08", text: "#9b7b7b" },
  }[s] || { bg: "#ffffff08", text: "#9b7b7b" });

  return (
    <div style={{ minHeight: "100vh", background: "#0f0a0a" }}>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "112px 24px 64px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1, marginBottom: 4 }}>Interview Prep</h1>
            <p style={{ color: "#9b7b7b", fontSize: 14 }}>Practice with AI-generated questions tailored to your role</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary-tb">+ New Session</button>
        </div>

        {/* Create Session Modal */}
        {showForm && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
            background: "#000000bb",
          }}>
            <div style={{
              width: "100%", maxWidth: 480, borderRadius: 24, padding: 32,
              background: "#1a0f0f", border: "1px solid #e11d4844",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700 }}>New Interview Session</h3>
                <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "#9b7b7b", fontSize: 22, cursor: "pointer" }}>✕</button>
              </div>

              <form onSubmit={create} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Role title */}
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9b7b7b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 2 }}>
                    Target Role *
                  </label>
                  <input
                    className="input-tb"
                    placeholder="Senior React Developer"
                    value={form.role_title}
                    onChange={e => setForm(f => ({ ...f, role_title: e.target.value }))}
                    style={{ background: "#120808", color: "#f1e8e8", border: "1px solid #ffffff18" }}
                    required
                  />
                </div>

                {/* Session type */}
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9b7b7b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 2 }}>
                    Session Type
                  </label>
                  <select
                    value={form.session_type}
                    onChange={e => setForm(f => ({ ...f, session_type: e.target.value }))}
                    style={selectStyle}>
                    <option value="mixed"     style={optStyle}>Mixed (Technical + HR)</option>
                    <option value="technical" style={optStyle}>Technical Only</option>
                    <option value="hr"        style={optStyle}>HR / Behavioral Only</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9b7b7b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 2 }}>
                    Difficulty
                  </label>
                  <select
                    value={form.difficulty}
                    onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
                    style={selectStyle}>
                    <option value="easy"   style={optStyle}>Easy — Entry Level</option>
                    <option value="medium" style={optStyle}>Medium — 2-4 Years</option>
                    <option value="hard"   style={optStyle}>Hard — Senior Level</option>
                  </select>
                </div>

                {/* Questions count */}
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9b7b7b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 2 }}>
                    Number of Questions
                  </label>
                  <select
                    value={form.questions_count}
                    onChange={e => setForm(f => ({ ...f, questions_count: Number(e.target.value) }))}
                    style={selectStyle}>
                    {[5, 8, 10, 15, 20].map(n => (
                      <option key={n} value={n} style={optStyle}>{n} Questions</option>
                    ))}
                  </select>
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
                  <button type="submit" className="btn-primary-tb" style={{ flex: 1, padding: "14px" }} disabled={creating}>
                    {creating ? "✨ Generating…" : "✨ Generate Questions"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)}
                    style={{
                      flex: 1, padding: "14px", borderRadius: 12, fontWeight: 600,
                      background: "#ffffff08", color: "#9b7b7b", border: "none",
                      cursor: "pointer", fontFamily: "Inter, sans-serif",
                    }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Session Detail Modal */}
        {active && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, overflowY: "auto", background: "#000000cc" }}>
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "32px 16px" }}>
              <div style={{ width: "100%", maxWidth: 720, borderRadius: 24, background: "#1a0f0f", border: "1px solid #e11d4844" }}>

                {/* Modal header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #ffffff08" }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700 }}>{active.role_title}</h3>
                  <button onClick={() => setActive(null)} style={{ background: "none", border: "none", color: "#9b7b7b", fontSize: 24, cursor: "pointer" }}>✕</button>
                </div>

                <div style={{ padding: 24 }}>
                  {/* Readiness score */}
                  {active.readiness_score != null && (
                    <div style={{
                      textAlign: "center", padding: "24px", marginBottom: 24, borderRadius: 20,
                      background: "#e11d480a", border: "1px solid #e11d4822",
                    }}>
                      <div style={{ fontSize: 56, fontWeight: 900, color: gradeColor(active.readiness_grade), marginBottom: 8 }}>
                        {active.readiness_score}<span style={{ fontSize: 24, color: "#9b7b7b" }}>/100</span>
                      </div>
                      <div style={{ fontWeight: 700, color: gradeColor(active.readiness_grade), marginBottom: 8 }}>
                        {active.readiness_grade}
                      </div>
                      {active.overall_feedback && (
                        <p style={{ fontSize: 13, color: "#9b7b7b", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
                          {active.overall_feedback}
                        </p>
                      )}
                    </div>
                  )}

                  {/* No questions yet */}
                  {!active.questions ? (
                    <div style={{ textAlign: "center", padding: "48px 0", color: "#9b7b7b" }}>
                      <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
                      <p style={{ fontWeight: 600, marginBottom: 8 }}>AI is generating your questions…</p>
                      <p style={{ fontSize: 13 }}>Come back in a moment and refresh.</p>
                      <button onClick={() => openSession(active.id)} style={{
                        marginTop: 16, padding: "10px 24px", borderRadius: 10,
                        background: "#e11d4818", color: "#e11d48", border: "1px solid #e11d4844",
                        cursor: "pointer", fontFamily: "Inter, sans-serif", fontWeight: 600,
                      }}>
                        🔄 Refresh
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {active.questions.map((q, i) => {
                        const ev = active.evaluations?.find(e => e.question_id === q.id);
                        return (
                          <div key={q.id} style={{
                            borderRadius: 16, padding: 20,
                            background: "#ffffff06", border: "1px solid #ffffff08",
                          }}>
                            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                              <span style={{ fontSize: 14, fontWeight: 900, color: "#e11d48", flexShrink: 0, width: 32 }}>Q{i + 1}</span>
                              <div style={{ flex: 1 }}>
                                <p style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.6 }}>{q.question}</p>
                                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                                  {[q.type, q.topic, q.difficulty].filter(Boolean).map((t, j) => (
                                    <span key={j} style={{
                                      fontSize: 11, padding: "3px 10px", borderRadius: 100,
                                      background: "#ffffff08", color: "#9b7b7b", textTransform: "capitalize",
                                    }}>{t}</span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {ev ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                <span style={{
                                  fontSize: 13, fontWeight: 700, padding: "6px 14px", borderRadius: 100, display: "inline-block",
                                  background: ev.score >= 7 ? "#00d4aa18" : ev.score >= 5 ? "#ffa50018" : "#ff6b6b18",
                                  color: ev.score >= 7 ? "#00d4aa" : ev.score >= 5 ? "#ffa500" : "#ff6b6b",
                                }}>
                                  {ev.grade} — {ev.score}/10
                                </span>
                                <p style={{ fontSize: 13, lineHeight: 1.7, padding: "12px 16px", borderRadius: 12, background: "#ffffff08" }}>{ev.feedback}</p>
                                {ev.better_answer && (
                                  <p style={{ fontSize: 13, color: "#00d4aa", padding: "12px 16px", borderRadius: 12, background: "#00d4aa08" }}>
                                    <strong>Better answer:</strong> {ev.better_answer}
                                  </p>
                                )}
                                <details style={{ fontSize: 13 }}>
                                  <summary style={{ cursor: "pointer", color: "#e11d48", fontWeight: 600 }}>View sample answer</summary>
                                  <p style={{ marginTop: 8, padding: "12px 16px", borderRadius: 12, background: "#ffffff06", color: "#9b7b7b", lineHeight: 1.7 }}>
                                    {q.sample_answer}
                                  </p>
                                </details>
                              </div>
                            ) : (
                              <textarea
                                rows={3}
                                value={answers[q.id] || ""}
                                onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                                placeholder="Type your answer here…"
                                style={{
                                  width: "100%", padding: "12px 16px", borderRadius: 12,
                                  background: "#120808", border: "1px solid #ffffff12",
                                  color: "#f1e8e8", fontSize: 13, resize: "none", outline: "none",
                                  fontFamily: "Inter, sans-serif", lineHeight: 1.6,
                                }}
                                onFocus={e => e.target.style.borderColor = "#e11d4888"}
                                onBlur={e => e.target.style.borderColor = "#ffffff12"}
                              />
                            )}
                          </div>
                        );
                      })}

                      {active.status !== "completed" && (
                        <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
                          <button onClick={submitAnswers} style={{
                            flex: 1, padding: "14px", borderRadius: 12, fontWeight: 600,
                            background: "transparent", color: "#e11d48",
                            border: "1px solid #e11d4844", cursor: "pointer",
                            fontFamily: "Inter, sans-serif",
                          }}>
                            💾 Save Answers
                          </button>
                          <button onClick={evaluate} disabled={evaluating} className="btn-primary-tb" style={{ flex: 1, padding: "14px" }}>
                            {evaluating ? "🤖 Evaluating…" : "🤖 Get AI Evaluation"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sessions list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#9b7b7b" }}>Loading…</div>
        ) : sessions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎯</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>No sessions yet</h3>
            <p style={{ color: "#9b7b7b", marginBottom: 24, fontSize: 14 }}>Create a session to practice with AI-generated questions.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary-tb">Create Session</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
            {sessions.map(s => {
              const sc = statusColor(s.status);
              return (
                <div key={s.id}
                  onClick={() => openSession(s.id)}
                  style={{
                    background: "#1a0f0f", border: "1px solid #ffffff12",
                    borderRadius: 20, padding: 24, cursor: "pointer", transition: "all 0.3s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#e11d4844"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#ffffff12"; e.currentTarget.style.transform = "translateY(0)"; }}>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{s.role_title}</h3>
                      <p style={{ fontSize: 12, color: "#9b7b7b", textTransform: "capitalize" }}>
                        {s.session_type} · {s.difficulty} · {s.questions_count} questions
                      </p>
                    </div>
                    {s.readiness_score != null && (
                      <div style={{ textAlign: "center", flexShrink: 0 }}>
                        <div style={{ fontSize: 24, fontWeight: 900, color: "#00d4aa" }}>{s.readiness_score}</div>
                        <div style={{ fontSize: 11, color: "#9b7b7b" }}>/ 100</div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 100,
                      background: sc.bg, color: sc.text, textTransform: "capitalize",
                    }}>
                      {s.status?.replace(/_/g, " ")}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); del(s.id); }}
                      style={{ fontSize: 12, color: "#ff6b6b", background: "none", border: "none", cursor: "pointer" }}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}