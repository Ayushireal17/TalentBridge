"use client";
import { useEffect, useState } from "react";
import Navbar from "../../../components/layout/Navbar";
import { aiAPI, jobAPI } from "../../../lib/api";
import toast from "react-hot-toast";

export default function CoverLettersPage() {
  const [letters, setLetters] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [form, setForm] = useState({ job_id: "", tone: "professional" });

  const load = () => {
    Promise.all([aiAPI.coverLetters(), jobAPI.list({ per_page: 50 })]).then(([l, j]) => {
      setLetters(l.data.data);
      setJobs(j.data.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const generate = async (e) => {
    e.preventDefault();
    if (!form.job_id) { toast.error("Select a job."); return; }
    setGenerating(true);
    try {
      await aiAPI.generateCoverLetter(form.job_id, form.tone);
      toast.success("Cover letter generated!");
      setShowForm(false);
      load();
    } catch { toast.error("Generation failed. Upload a resume first."); }
    finally { setGenerating(false); }
  };

  const saveEdit = async () => {
    try {
      const res = await import("../../../lib/api").then(m => m.default.put(`/v1/candidate/cover-letters/${selected.id}`, { content: editContent }));
      setSelected(res.data.data);
      setEditing(false);
      toast.success("Saved!");
      load();
    } catch { toast.error("Save failed."); }
  };

  const copy = (text) => { navigator.clipboard.writeText(text); toast.success("Copied!"); };

  const del = async (id) => {
    if (!confirm("Delete this cover letter?")) return;
    await import("../../../lib/api").then(m => m.default.delete(`/v1/candidate/cover-letters/${id}`));
    toast.success("Deleted.");
    setSelected(null);
    load();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black mb-1">Cover Letters</h1>
            <p className="text-[#64748b] text-sm">AI-generated, personalized for every job</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary-tb">✨ Generate New</button>
        </div>

        {/* Generate Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#000000aa" }}>
            <div className="w-full max-w-md rounded-2xl p-8" style={{ background: "#13131f", border: "1px solid #6c63ff44" }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">Generate Cover Letter</h3>
                <button onClick={() => setShowForm(false)} className="text-[#64748b] hover:text-white text-xl">✕</button>
              </div>
              <form onSubmit={generate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#64748b] mb-2 uppercase tracking-wider">Select Job *</label>
                  <select className="input-tb" value={form.job_id} onChange={e => setForm(f => ({ ...f, job_id: e.target.value }))} required>
                    <option value="">-- Choose a job --</option>
                    {jobs.map(j => <option key={j.id} value={j.id}>{j.title} — {j.company}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748b] mb-2 uppercase tracking-wider">Tone</label>
                  <select className="input-tb" value={form.tone} onChange={e => setForm(f => ({ ...f, tone: e.target.value }))}>
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="confident">Confident</option>
                  </select>
                </div>
                <p className="text-xs text-[#64748b]">Your primary resume will be used. Make sure one is uploaded.</p>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-primary-tb flex-1 py-3" disabled={generating}>{generating ? "Generating…" : "Generate with AI"}</button>
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl font-semibold" style={{ background: "#ffffff08", color: "#64748b" }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View / Edit Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "#000000cc" }}>
            <div className="min-h-screen flex items-start justify-center p-4 pt-8">
              <div className="w-full max-w-2xl rounded-3xl" style={{ background: "#13131f", border: "1px solid #6c63ff44" }}>
                <div className="flex items-center justify-between p-6" style={{ borderBottom: "1px solid #ffffff08" }}>
                  <h3 className="font-bold text-lg">{selected.title}</h3>
                  <button onClick={() => { setSelected(null); setEditing(false); }} className="text-[#64748b] hover:text-white text-2xl">✕</button>
                </div>
                <div className="p-6">
                  <div className="flex gap-2 mb-5">
                    <span className="text-xs px-3 py-1 rounded-full" style={{ background: "#ffffff08", color: "#64748b" }}>{selected.tone}</span>
                    {selected.is_edited && <span className="text-xs px-3 py-1 rounded-full" style={{ background: "#ffa50018", color: "#ffa500" }}>Edited</span>}
                  </div>
                  {editing ? (
                    <>
                      <textarea rows={16} value={editContent} onChange={e => setEditContent(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none mb-4"
                        style={{ background: "#ffffff08", border: "1px solid #6c63ff44", color: "#e2e8f0", fontFamily: "Inter, sans-serif" }} />
                      <div className="flex gap-3">
                        <button onClick={saveEdit} className="btn-primary-tb flex-1 py-3">Save Changes</button>
                        <button onClick={() => setEditing(false)} className="flex-1 py-3 rounded-xl font-semibold" style={{ background: "#ffffff08", color: "#64748b" }}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-2xl p-5 mb-5 whitespace-pre-wrap text-sm leading-relaxed max-h-96 overflow-y-auto" style={{ background: "#ffffff06" }}>
                        {selected.content}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => { setEditContent(selected.content); setEditing(true); }} className="text-sm px-4 py-2 rounded-xl border font-semibold" style={{ borderColor: "#6c63ff44", color: "#a5a0ff" }}>Edit</button>
                        <button onClick={() => copy(selected.content)} className="text-sm px-4 py-2 rounded-xl border font-semibold" style={{ borderColor: "#00d4aa44", color: "#00d4aa" }}>Copy</button>
                        <button onClick={() => del(selected.id)} className="text-sm px-4 py-2 rounded-xl font-semibold" style={{ background: "#ff6b6b18", color: "#ff6b6b" }}>Delete</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-[#64748b]">Loading…</div>
        ) : letters.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">✉️</div>
            <h3 className="text-xl font-bold mb-2">No cover letters yet</h3>
            <p className="text-[#64748b] mb-6">Generate a personalized cover letter for any job in seconds.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary-tb">Generate Cover Letter</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {letters.map(l => (
              <div key={l.id} className="tb-card cursor-pointer" onClick={() => setSelected(l)}>
                <h3 className="font-bold mb-2">{l.title}</h3>
                <p className="text-sm text-[#64748b] leading-relaxed line-clamp-3 mb-4">{l.excerpt || l.content?.slice(0, 150)}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-1 rounded-full capitalize" style={{ background: "#ffffff08", color: "#64748b" }}>{l.tone}</span>
                  <span className="text-xs text-[#64748b]">{new Date(l.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
