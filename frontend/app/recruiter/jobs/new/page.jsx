"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../../components/layout/Navbar";
import { recruiterAPI } from "../../../../lib/api";
import toast from "react-hot-toast";

export default function NewJobPage() {
  const nav = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", company: "", location: "", is_remote: false, type: "full-time",
    experience_level: "mid", salary_min: "", salary_max: "", salary_currency: "INR",
    salary_period: "yearly", description: "", requirements: "", benefits: "", category: "", expires_at: "",
  });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await recruiterAPI.createJob(form);
      toast.success("Job posted successfully!");
      nav.push("/recruiter/jobs");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post job.");
    } finally { setLoading(false); }
  };

  const Field = ({ label, children, full = false }) => (
    <div className={full ? "col-span-2" : ""}>
      <label className="block text-xs font-semibold text-[#64748b] mb-2 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );

  const Input = (props) => <input {...props} className="input-tb" />;
  const Select = ({ children, ...props }) => (
    <select {...props} className="input-tb">{children}</select>
  );
  const Textarea = (props) => <textarea {...props} className="input-tb resize-none" />;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-1">Post a New Job</h1>
          <p className="text-[#64748b] text-sm">Fill in the details to attract the right candidates.</p>
        </div>

        <form onSubmit={submit}>
          <div className="rounded-2xl p-8 mb-6" style={{ background: "#13131f", border: "1px solid #ffffff12" }}>
            <h3 className="font-bold mb-6 pb-4" style={{ borderBottom: "1px solid #ffffff08" }}>Basic Information</h3>
            <div className="grid grid-cols-2 gap-5">
              <Field label="Job Title" full><Input placeholder="Senior React Developer" value={form.title} onChange={set("title")} required /></Field>
              <Field label="Company Name"><Input placeholder="Acme Corp" value={form.company} onChange={set("company")} required /></Field>
              <Field label="Location"><Input placeholder="Bengaluru, India" value={form.location} onChange={set("location")} /></Field>
              <Field label="Job Type">
                <Select value={form.type} onChange={set("type")}>
                  {["full-time","part-time","contract","internship","freelance"].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </Select>
              </Field>
              <Field label="Experience Level">
                <Select value={form.experience_level} onChange={set("experience_level")}>
                  {["entry","mid","senior","lead","executive"].map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
                </Select>
              </Field>
              <Field label="Category"><Input placeholder="Engineering, Marketing…" value={form.category} onChange={set("category")} /></Field>
              <Field label="Remote">
                <label className="flex items-center gap-3 cursor-pointer mt-1">
                  <input type="checkbox" checked={form.is_remote} onChange={set("is_remote")} className="w-4 h-4 accent-[#6c63ff]" />
                  <span className="text-sm text-[#e2e8f0]">Remote friendly position</span>
                </label>
              </Field>
              <Field label="Expires At"><Input type="date" value={form.expires_at} onChange={set("expires_at")} /></Field>
            </div>
          </div>

          <div className="rounded-2xl p-8 mb-6" style={{ background: "#13131f", border: "1px solid #ffffff12" }}>
            <h3 className="font-bold mb-6 pb-4" style={{ borderBottom: "1px solid #ffffff08" }}>Salary</h3>
            <div className="grid grid-cols-2 gap-5">
              <Field label="Min Salary (₹)"><Input type="number" placeholder="500000" value={form.salary_min} onChange={set("salary_min")} /></Field>
              <Field label="Max Salary (₹)"><Input type="number" placeholder="1200000" value={form.salary_max} onChange={set("salary_max")} /></Field>
              <Field label="Currency"><Select value={form.salary_currency} onChange={set("salary_currency")}><option value="INR">INR ₹</option><option value="USD">USD $</option></Select></Field>
              <Field label="Period"><Select value={form.salary_period} onChange={set("salary_period")}><option value="yearly">Yearly</option><option value="monthly">Monthly</option></Select></Field>
            </div>
          </div>

          <div className="rounded-2xl p-8 mb-6" style={{ background: "#13131f", border: "1px solid #ffffff12" }}>
            <h3 className="font-bold mb-6 pb-4" style={{ borderBottom: "1px solid #ffffff08" }}>Details</h3>
            <div className="space-y-5">
              <Field label="Job Description" full><Textarea rows={6} placeholder="Describe the role, responsibilities, and what makes this opportunity exciting…" value={form.description} onChange={set("description")} required /></Field>
              <Field label="Requirements" full><Textarea rows={5} placeholder="List the must-have skills, experience, and qualifications…" value={form.requirements} onChange={set("requirements")} required /></Field>
              <Field label="Benefits" full><Textarea rows={3} placeholder="Health insurance, ESOPs, flexible hours…" value={form.benefits} onChange={set("benefits")} /></Field>
            </div>
          </div>

          <button type="submit" className="btn-primary-tb w-full py-4 text-base" disabled={loading}>
            {loading ? "Posting job…" : "Post Job →"}
          </button>
        </form>
      </main>
    </div>
  );
}
