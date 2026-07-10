"use client";
const features = [
  { icon: "🤖", label: "New",     color: "#6c63ff", title: "AI Career Chatbot",      desc: "Get real-time career guidance, job search tips, and personalised advice from BridgeAI — available 24/7." },
  { icon: "📄", label: "Popular", color: "#00d4aa", title: "PDF/Image Resume Parser", desc: "Upload any resume — PDF or photo — and our AI instantly extracts and structures your experience, skills, and education." },
  { icon: "🎯", label: "",        color: "#ff6b6b", title: "Smart Job Matching",      desc: "AI compares your profile against thousands of roles and surfaces the ones most likely to get you hired." },
  { icon: "✉️", label: "",        color: "#ffa500", title: "Cover Letter Generator",  desc: "One click to generate a polished, role-specific cover letter tailored to any job description." },
  { icon: "📊", label: "",        color: "#6c63ff", title: "ATS Score Analyser",      desc: "See how your resume performs against Applicant Tracking Systems with a detailed improvement plan." },
  { icon: "🎤", label: "",        color: "#00d4aa", title: "Interview Prep Coach",     desc: "Practice with AI-generated questions for your target role and receive detailed answer feedback." },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 px-6" id="features">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold tracking-[3px] uppercase text-[#00d4aa] mb-3">AI Features</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ letterSpacing: "-1px" }}>
            Powered by intelligence
          </h2>
          <p className="text-[#64748b] text-lg max-w-xl mx-auto leading-relaxed">
            Six AI-powered modules that make TalentBridge the smartest career platform in India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => (
            <div key={f.title} className="tb-card group cursor-pointer">
              {f.label && (
                <span className="inline-block text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-md mb-4"
                  style={{ background: `${f.color}18`, color: f.color }}>
                  {f.label}
                </span>
              )}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5"
                style={{ background: `${f.color}18`, border: `1px solid ${f.color}44` }}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold mb-3">{f.title}</h3>
              <p className="text-[#64748b] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
