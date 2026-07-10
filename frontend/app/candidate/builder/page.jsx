"use client";
import { useEffect, useState } from "react";
import Navbar from "../../../components/layout/Navbar";
import { aiAPI } from "../../../lib/api";
import toast from "react-hot-toast";

const STEPS = ["Personal Info", "Experience", "Education", "Skills", "Projects", "AI Summary", "Export"];

export default function ResumeBuilderPage() {
  const [step, setStep] = useState(0);
  const [builderId, setBuilderId] = useState(null);
  const [data, setData] = useState({
    title: "My Resume",
    personal_info: { name: "", email: "", phone: "", location: "", title: "", linkedin: "", github: "" },
    experience: [{ title: "", company: "", duration: "", description: "" }],
    education: [{ degree: "", institution: "", year: "" }],
    skills: { technical: [], soft: [] },
    projects: [{ name: "", tech: [], description: "" }],
    ai_summary: "",
    template: "modern",
  });
  const [skillInput, setSkillInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [targetRole, setTargetRole] = useState("");

  useEffect(() => {
    // Create a builder entry on mount
    import("../../../lib/api").then(m => m.default.post("/v1/candidate/resume-builder", { title: "My Resume" }))
      .then(r => setBuilderId(r.data.data.id)).catch(() => {});
  }, []);

  const save = async () => {
    if (!builderId) return;
    await import("../../../lib/api").then(m => m.default.put(`/v1/candidate/resume-builder/${builderId}`, data)).catch(() => {});
  };

  const next = async () => { await save(); if (step < STEPS.length - 1) setStep(s => s + 1); };
  const prev = () => setStep(s => Math.max(0, s - 1));

  const setPI = k => e => setData(d => ({ ...d, personal_info: { ...d.personal_info, [k]: e.target.value } }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    setData(d => ({ ...d, skills: { ...d.skills, technical: [...(d.skills.technical || []), s] } }));
    setSkillInput("");
  };

  const removeSkill = (i) => setData(d => ({ ...d, skills: { ...d.skills, technical: d.skills.technical.filter((_, j) => j !== i) } }));

  const generateSummary = async () => {
    if (!targetRole) { toast.error("Enter a target role first."); return; }
    if (!builderId) { toast.error("Save your info first."); return; }
    await save();
    setGenerating(true);
    try {
      const res = await import("../../../lib/api").then(m => m.default.post(`/v1/candidate/resume-builder/${builderId}/generate-summary`, { target_role: targetRole, years: data.experience?.length ? "3" : "1" }));
      setData(d => ({ ...d, ai_summary: res.data.data.professional_summary }));
      toast.success("AI summary generated!");
    } catch { toast.error("Generation failed."); }
    finally { setGenerating(false); }
  };

  const exportPdf = async () => {
    if (!builderId) return;
    await save();
    setExporting(true);
    try {
      const res = await import("../../../lib/api").then(m => m.default.post(`/v1/candidate/resume-builder/${builderId}/export-pdf`));
      setPdfUrl(res.data.pdf_url);
      toast.success("PDF ready!");
    } catch { toast.error("PDF export failed."); }
    finally { setExporting(false); }
  };

  const Input = ({ label, value, onChange, placeholder, type = "text" }) => (
    <div>
      <label className="block text-xs font-semibold text-[#64748b] mb-2 uppercase tracking-wider">{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="input-tb" />
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name *"     value={data.personal_info.name}     onChange={setPI("name")}     placeholder="Priya Sharma" />
            <Input label="Email *"         value={data.personal_info.email}    onChange={setPI("email")}    placeholder="priya@email.com" type="email" />
            <Input label="Phone"           value={data.personal_info.phone}    onChange={setPI("phone")}    placeholder="+91 98765 43210" />
            <Input label="Location"        value={data.personal_info.location} onChange={setPI("location")} placeholder="Bengaluru, India" />
            <Input label="Job Title"       value={data.personal_info.title}    onChange={setPI("title")}    placeholder="Senior React Developer" />
            <Input label="LinkedIn URL"    value={data.personal_info.linkedin} onChange={setPI("linkedin")} placeholder="linkedin.com/in/priya" />
            <Input label="GitHub URL"      value={data.personal_info.github}   onChange={setPI("github")}   placeholder="github.com/priya" />
          </div>
        </div>
      );
      case 1: return (
        <div className="space-y-4">
          {data.experience.map((exp, i) => (
            <div key={i} className="rounded-2xl p-5 space-y-3" style={{ background: "#ffffff06", border: "1px solid #ffffff0a" }}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-[#a5a0ff]">Experience {i + 1}</span>
                {i > 0 && <button onClick={() => setData(d => ({ ...d, experience: d.experience.filter((_, j) => j !== i) }))} className="text-xs text-[#ff6b6b]">Remove</button>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[["Job Title", "title", "Senior Developer"], ["Company", "company", "Infosys"], ["Duration", "duration", "Jan 2022 – Present"], ["Location", "location", "Bengaluru"]].map(([l, k, ph]) => (
                  <div key={k}>
                    <label className="block text-xs font-semibold text-[#64748b] mb-2">{l}</label>
                    <input className="input-tb" placeholder={ph} value={exp[k] || ""} onChange={e => { const ex = [...data.experience]; ex[i] = { ...ex[i], [k]: e.target.value }; setData(d => ({ ...d, experience: ex })); }} />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] mb-2">Description</label>
                <textarea rows={3} className="input-tb resize-none" placeholder="Key responsibilities and achievements…" value={exp.description || ""} onChange={e => { const ex = [...data.experience]; ex[i] = { ...ex[i], description: e.target.value }; setData(d => ({ ...d, experience: ex })); }} />
              </div>
            </div>
          ))}
          <button onClick={() => setData(d => ({ ...d, experience: [...d.experience, { title: "", company: "", duration: "", description: "" }] }))}
            className="w-full py-3 rounded-xl border text-sm font-semibold transition-all"
            style={{ borderColor: "#6c63ff44", color: "#a5a0ff", borderStyle: "dashed" }}>
            + Add Experience
          </button>
        </div>
      );
      case 2: return (
        <div className="space-y-4">
          {data.education.map((edu, i) => (
            <div key={i} className="rounded-2xl p-5 space-y-3" style={{ background: "#ffffff06", border: "1px solid #ffffff0a" }}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-[#a5a0ff]">Education {i + 1}</span>
                {i > 0 && <button onClick={() => setData(d => ({ ...d, education: d.education.filter((_, j) => j !== i) }))} className="text-xs text-[#ff6b6b]">Remove</button>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[["Degree", "degree", "B.Tech Computer Science"], ["Institution", "institution", "IIT Delhi"], ["Year", "year", "2020"], ["Grade/CGPA", "grade", "8.5 CGPA"]].map(([l, k, ph]) => (
                  <div key={k}>
                    <label className="block text-xs font-semibold text-[#64748b] mb-2">{l}</label>
                    <input className="input-tb" placeholder={ph} value={edu[k] || ""} onChange={e => { const ed = [...data.education]; ed[i] = { ...ed[i], [k]: e.target.value }; setData(d => ({ ...d, education: ed })); }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button onClick={() => setData(d => ({ ...d, education: [...d.education, { degree: "", institution: "", year: "" }] }))}
            className="w-full py-3 rounded-xl border text-sm font-semibold"
            style={{ borderColor: "#6c63ff44", color: "#a5a0ff", borderStyle: "dashed" }}>
            + Add Education
          </button>
        </div>
      );
      case 3: return (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#64748b] mb-3 uppercase tracking-wider">Technical Skills</label>
            <div className="flex gap-2 mb-3">
              <input className="input-tb flex-1" placeholder="e.g. React, Node.js, Python…" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())} />
              <button onClick={addSkill} className="btn-primary-tb px-5">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 min-h-12">
              {(data.skills.technical || []).map((s, i) => (
                <span key={i} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full"
                  style={{ background: "#6c63ff18", border: "1px solid #6c63ff44", color: "#a5a0ff" }}>
                  {s}
                  <button onClick={() => removeSkill(i)} className="text-xs opacity-60 hover:opacity-100">✕</button>
                </span>
              ))}
              {(data.skills.technical || []).length === 0 && <p className="text-sm text-[#64748b]">No skills added yet. Type and press Enter or Add.</p>}
            </div>
          </div>
        </div>
      );
      case 4: return (
        <div className="space-y-4">
          {data.projects.map((proj, i) => (
            <div key={i} className="rounded-2xl p-5 space-y-3" style={{ background: "#ffffff06", border: "1px solid #ffffff0a" }}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-[#a5a0ff]">Project {i + 1}</span>
                {i > 0 && <button onClick={() => setData(d => ({ ...d, projects: d.projects.filter((_, j) => j !== i) }))} className="text-xs text-[#ff6b6b]">Remove</button>}
              </div>
              <input className="input-tb" placeholder="Project name" value={proj.name || ""} onChange={e => { const pr = [...data.projects]; pr[i] = { ...pr[i], name: e.target.value }; setData(d => ({ ...d, projects: pr })); }} />
              <input className="input-tb" placeholder="Tech stack (comma separated)" value={Array.isArray(proj.tech) ? proj.tech.join(", ") : proj.tech || ""} onChange={e => { const pr = [...data.projects]; pr[i] = { ...pr[i], tech: e.target.value.split(",").map(t => t.trim()).filter(Boolean) }; setData(d => ({ ...d, projects: pr })); }} />
              <textarea rows={3} className="input-tb resize-none" placeholder="Project description and impact…" value={proj.description || ""} onChange={e => { const pr = [...data.projects]; pr[i] = { ...pr[i], description: e.target.value }; setData(d => ({ ...d, projects: pr })); }} />
            </div>
          ))}
          <button onClick={() => setData(d => ({ ...d, projects: [...d.projects, { name: "", tech: [], description: "" }] }))}
            className="w-full py-3 rounded-xl border text-sm font-semibold"
            style={{ borderColor: "#6c63ff44", color: "#a5a0ff", borderStyle: "dashed" }}>
            + Add Project
          </button>
        </div>
      );
      case 5: return (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#64748b] mb-2 uppercase tracking-wider">Target Role (for AI)</label>
            <div className="flex gap-2 mb-5">
              <input className="input-tb flex-1" placeholder="e.g. Senior React Developer" value={targetRole} onChange={e => setTargetRole(e.target.value)} />
              <button onClick={generateSummary} disabled={generating} className="btn-primary-tb px-5 whitespace-nowrap">
                {generating ? "Generating…" : "🤖 Generate"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#64748b] mb-2 uppercase tracking-wider">Professional Summary</label>
            <textarea rows={6} className="input-tb resize-none" placeholder="Your professional summary will appear here after AI generation, or write it manually…" value={data.ai_summary} onChange={e => setData(d => ({ ...d, ai_summary: e.target.value }))} />
          </div>
        </div>
      );
      case 6: return (
        <div className="space-y-5">
          <div className="text-center py-8">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="text-xl font-bold mb-2">Ready to Export!</h3>
            <p className="text-[#64748b] text-sm mb-8">Your resume will be exported as a professional PDF.</p>
            {pdfUrl ? (
              <div className="space-y-3">
                <div className="rounded-2xl p-4 mb-4" style={{ background: "#00d4aa0a", border: "1px solid #00d4aa44" }}>
                  <p className="text-[#00d4aa] font-semibold text-sm">✅ PDF ready!</p>
                </div>
                <a href={pdfUrl} download target="_blank" rel="noreferrer" className="btn-primary-tb inline-block px-10 py-4">
                  ⬇️ Download PDF
                </a>
              </div>
            ) : (
              <button onClick={exportPdf} disabled={exporting} className="btn-primary-tb px-10 py-4 text-base">
                {exporting ? "Generating PDF…" : "🚀 Export as PDF"}
              </button>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#64748b] mb-3 uppercase tracking-wider">Template</label>
            <div className="grid grid-cols-3 gap-3">
              {["modern", "classic", "minimal"].map(t => (
                <button key={t} onClick={() => setData(d => ({ ...d, template: t }))}
                  className="py-4 rounded-xl text-sm font-semibold capitalize transition-all border"
                  style={data.template === t
                    ? { background: "linear-gradient(135deg,#6c63ff,#00d4aa)", color: "#fff", borderColor: "transparent" }
                    : { background: "#ffffff08", color: "#64748b", borderColor: "#ffffff12" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-1">Resume Builder</h1>
          <p className="text-[#64748b] text-sm">Build a professional resume with AI assistance</p>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <button key={s} onClick={() => setStep(i)}
              className="flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={i === step
                ? { background: "linear-gradient(135deg,#6c63ff,#00d4aa)", color: "#fff" }
                : i < step
                ? { background: "#00d4aa18", color: "#00d4aa" }
                : { background: "#ffffff08", color: "#64748b" }}>
              {i < step ? "✓ " : ""}{s}
            </button>
          ))}
        </div>

        {/* Step content */}
        <div className="rounded-2xl p-8 mb-6" style={{ background: "#13131f", border: "1px solid #ffffff12" }}>
          <h3 className="font-bold text-lg mb-6 pb-4" style={{ borderBottom: "1px solid #ffffff08" }}>
            Step {step + 1}: {STEPS[step]}
          </h3>
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={prev} className="flex-1 py-3 rounded-xl font-semibold border transition-all"
              style={{ borderColor: "#ffffff18", color: "#e2e8f0" }}>
              ← Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={next} className="btn-primary-tb flex-1 py-3">
              Next: {STEPS[step + 1]} →
            </button>
          ) : (
            <button onClick={save} className="flex-1 py-3 rounded-xl font-semibold border"
              style={{ borderColor: "#00d4aa44", color: "#00d4aa" }}>
              💾 Save Progress
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
