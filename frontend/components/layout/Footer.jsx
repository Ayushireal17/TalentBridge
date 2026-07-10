import Link from "next/link";
import TBLogo from "../ui/TBLogo";

const cols = [
  {
    title: "For Candidates",
    links: [
      { label: "Find Jobs", href: "/candidate/jobs" },
      { label: "Resume Builder", href: "/candidate/resumes" },
      { label: "AI Chatbot", href: "/candidate/dashboard" },
      { label: "Interview Prep", href: "/candidate/interview" },
      { label: "Salary Insights", href: "/candidate/jobs" }
    ]
  },
  {
    title: "For Recruiters",
    links: [
      { label: "Post Jobs", href: "/recruiter/jobs" },
      { label: "Search Talent", href: "/recruiter/dashboard" },
      { label: "AI Ranking", href: "/recruiter/dashboard" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Enterprise", href: "/#pricing" }
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/#features" },
      { label: "Blog", href: "/#features" },
      { label: "Careers", href: "/#features" },
      { label: "Privacy", href: "/#features" },
      { label: "Terms", href: "/#features" }
    ]
  },
];

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #ffffff0a", padding: "60px 40px 40px", marginTop: 40 }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div>
            <TBLogo />
            <p className="text-sm text-[#64748b] mt-4 leading-relaxed max-w-[220px]">
              The AI-powered career intelligence platform connecting talent with opportunity across India.
            </p>
            <div className="flex gap-3 mt-5">
              {["𝕏", "in", "gh", "@"].map(s => (
                <div key={s} className="w-9 h-9 rounded-xl flex items-center justify-center text-sm cursor-pointer transition-all"
                  style={{ background: "#ffffff08", border: "1px solid #ffffff12" }}>
                  {s}
                </div>
              ))}
            </div>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold mb-5">{col.title}</h4>
              <div className="space-y-3">
                {col.links.map(l => (
                  <div key={l.label}>
                    <Link href={l.href} className="text-sm text-[#64748b] cursor-pointer hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-8" style={{ borderTop: "1px solid #ffffff0a" }}>
          <p className="text-xs text-[#64748b]">© 2026 TalentBridge. All rights reserved.</p>
          <p className="text-xs text-[#64748b]">Made with ❤️ Ayushi laravel + react project</p>
        </div>
      </div>
    </footer>
  );
}
