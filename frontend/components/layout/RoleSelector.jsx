"use client";
import Link from "next/link";

const roles = [
  {
    id: "candidate",
    emoji: "👤",
    title: "Job Seeker",
    sub: "Find your dream role with AI-powered matching, resume analysis, and a personal career assistant.",
    perks: ["AI resume scanner & ATS score", "Personalised job recommendations", "AI chatbot career coach", "Auto cover letter generation", "Interview preparation tools"],
    btnLabel: "Get Started as Candidate →",
    colorClass: "from-[#6c63ff] to-[#00d4aa]",
    accentColor: "#6c63ff",
  },
  {
    id: "recruiter",
    emoji: "🏢",
    title: "Recruiter",
    sub: "Source, screen, and hire top talent faster with AI-powered candidate ranking and smart tools.",
    perks: ["AI candidate ranking & scoring", "Post unlimited job listings", "Smart applicant tracking", "Bulk resume analysis", "Team collaboration tools"],
    btnLabel: "Get Started as Recruiter →",
    colorClass: "from-[#ff6b6b] to-[#ffa500]",
    accentColor: "#ff6b6b",
  },
];

export default function RoleSelector() {
  return (
    <section className="py-24 px-6" id="get-started">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold tracking-[3px] uppercase text-[#00d4aa] mb-3">Get started</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ letterSpacing: "-1px" }}>Choose your path</h2>
          <p className="text-[#64748b] text-lg max-w-md mx-auto">Create an account as a job seeker or recruiter — each with a tailored experience.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {roles.map(role => (
            <div key={role.id} className="tb-card relative overflow-hidden" style={{ borderRadius: 24 }}>
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${role.colorClass}`} style={{ borderRadius: "24px 24px 0 0" }} />
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5"
                style={{ background: `${role.accentColor}18`, border: `1px solid ${role.accentColor}44` }}>
                {role.emoji}
              </div>
              <h3 className="text-xl font-bold mb-2">{role.title}</h3>
              <p className="text-[#64748b] text-sm leading-relaxed mb-6">{role.sub}</p>
              <div className="space-y-3 mb-8">
                {role.perks.map(p => (
                  <div key={p} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center text-xs flex-shrink-0"
                      style={{ background: `${role.accentColor}18`, color: role.accentColor }}>✓</div>
                    {p}
                  </div>
                ))}
              </div>
              <Link href={`/auth/register?role=${role.id}`}>
                <button className="w-full py-4 rounded-xl text-white font-semibold text-sm"
                  style={{ background: `linear-gradient(135deg, ${role.accentColor}, ${role.id === "candidate" ? "#00d4aa" : "#ffa500"})` }}>
                  {role.btnLabel}
                </button>
              </Link>
            </div>
          ))}
        </div>

        {/* Admin box */}
        <div className="flex items-center justify-between gap-4 p-5 rounded-2xl" style={{ background: "#ff6b6b0a", border: "1px solid #ff6b6b22" }}>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: "#ff6b6b18", border: "1px solid #ff6b6b44" }}>🔐</div>
            <div>
              <div className="font-semibold text-[#ff6b6b] text-sm">Admin Access</div>
              <div className="text-xs text-[#64748b]">Platform administrators only — separate secure portal</div>
            </div>
          </div>
          <Link href="/auth/admin-login">
            <button className="px-5 py-2.5 text-sm font-semibold text-[#ff6b6b] border border-[#ff6b6b44] rounded-xl hover:bg-[#ff6b6b11] transition-all whitespace-nowrap">
              Admin Login →
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
