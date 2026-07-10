"use client";

const skills = ["React","TypeScript","Next.js","Node.js","Tailwind","GraphQL","AWS"];

export default function ResumeParserPreview() {
  return (
    <section className="py-24 px-6" style={{ background: "#0d0d18" }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold tracking-[3px] uppercase text-[#00d4aa] mb-3">AI Resume Parser</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ letterSpacing: "-1px" }}>Upload. Parse. Apply.</h2>
          <p className="text-[#64748b] text-lg max-w-md mx-auto">Drop your resume (PDF or image) — BridgeAI extracts everything in seconds.</p>
        </div>

        {/* Drop zone */}
        <div className="rounded-3xl p-16 text-center mb-6 cursor-pointer transition-all"
          style={{ border: "2px dashed #6c63ff44", background: "#6c63ff06" }}>
          <div className="text-6xl mb-5">📤</div>
          <h3 className="text-xl font-bold mb-2">Drop your resume here</h3>
          <p className="text-[#64748b] text-sm mb-5">Our AI will instantly extract and structure all your information</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {["PDF","PNG","JPG","DOCX"].map(t => (
              <span key={t} className="px-4 py-1.5 rounded-full text-xs text-[#64748b]"
                style={{ background: "#ffffff08", border: "1px solid #ffffff12" }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Result card */}
        <div className="rounded-3xl p-8" style={{ background: "#13131f", border: "1px solid #00d4aa44" }}>
          <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: "1px solid #ffffff08" }}>
            <span className="text-2xl">✅</span>
            <div>
              <div className="font-bold">Resume analysed successfully</div>
              <div className="text-xs text-[#64748b]">resume_priya_sharma.pdf · 2 seconds ago</div>
            </div>
            <div className="ml-auto px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: "#00d4aa18", border: "1px solid #00d4aa44", color: "#00d4aa" }}>
              🤖 AI Summary
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Name",         value: "Priya Sharma" },
              { label: "Experience",   value: "4 years" },
              { label: "Current Role", value: "Senior Frontend Developer at Infosys", full: true },
              { label: "Education",    value: "B.Tech CSE · Delhi University" },
            ].map(f => (
              <div key={f.label} className={`rounded-xl p-4 ${f.full ? "col-span-2" : ""}`}
                style={{ background: "#ffffff06" }}>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#64748b] mb-1.5">{f.label}</div>
                <div className="text-sm text-[#e2e8f0]">{f.value}</div>
              </div>
            ))}

            <div className="col-span-2 rounded-xl p-4" style={{ background: "#ffffff06" }}>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#64748b] mb-3">Skills detected</div>
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <span key={s} className="px-3 py-1.5 rounded-full text-xs" style={{ background: "#6c63ff18", border: "1px solid #6c63ff44", color: "#a5a0ff" }}>{s}</span>
                ))}
              </div>
            </div>

            <div className="col-span-2 rounded-xl p-4" style={{ background: "#ffffff06" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">ATS Score</div>
                <span className="font-bold text-lg" style={{ color: "#00d4aa" }}>78 / 100</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "#ffffff08" }}>
                <div className="h-full rounded-full" style={{ width: "78%", background: "linear-gradient(135deg,#6c63ff,#00d4aa)" }} />
              </div>
            </div>

            <div className="col-span-2 rounded-xl p-4" style={{ background: "#ffffff06" }}>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#64748b] mb-2">AI Summary</div>
              <p className="text-sm text-[#e2e8f0] leading-relaxed">
                Experienced frontend developer with strong React ecosystem expertise. Good ATS performance with room to improve keyword density for senior roles. Recommend adding quantified achievements and system design experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
