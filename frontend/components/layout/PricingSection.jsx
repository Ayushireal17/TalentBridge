"use client";
import Link from "next/link";

const plans = [
  {
    name: "Starter", price: 0, per: "forever free",
    items: ["5 job applications / month", "Basic resume analysis", "AI chatbot (10 queries/day)", "Job board access"],
    btn: "Get started free", featured: false, btnStyle: "secondary",
  },
  {
    name: "Pro", price: 799, per: "per month",
    items: ["Unlimited applications", "Full ATS analysis + score", "Unlimited AI chatbot", "Cover letter generator", "Interview prep coach", "Priority job matching"],
    btn: "Upgrade to Pro", featured: true, btnStyle: "primary",
  },
  {
    name: "Recruiter", price: 2999, per: "per month",
    items: ["Unlimited job postings", "AI candidate ranking", "Bulk resume parsing", "Team collaboration", "Analytics dashboard", "Priority support"],
    btn: "Start Hiring", featured: false, btnStyle: "accent",
  },
];

export default function PricingSection() {
  return (
    <section className="py-24 px-6" id="pricing">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold tracking-[3px] uppercase text-[#00d4aa] mb-3">Pricing</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ letterSpacing: "-1px" }}>Simple, transparent pricing</h2>
          <p className="text-[#64748b] text-lg max-w-md mx-auto">Start free. Upgrade when you&apos;re ready. No hidden fees.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map(p => (
            <div key={p.name} className="relative rounded-2xl p-8 transition-all"
              style={{
                background: "#13131f",
                border: p.featured ? "1px solid #6c63ff88" : "1px solid #ffffff12",
                boxShadow: p.featured ? "0 0 40px #6c63ff22" : "none",
              }}>
              {p.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 gradient-text px-5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap"
                  style={{ background: "linear-gradient(135deg, #6c63ff, #00d4aa)" }}>
                  <span className="text-white">Most Popular</span>
                </div>
              )}
              <div className="text-sm font-semibold text-[#64748b] mb-4">{p.name}</div>
              <div className="text-5xl font-black mb-1">
                <span className="text-xl font-normal text-[#64748b]">₹</span>{p.price.toLocaleString()}
              </div>
              <div className="text-sm text-[#64748b] mb-8">{p.per}</div>
              <div className="space-y-3 mb-8">
                {p.items.map(i => (
                  <div key={i} className="text-sm flex items-center gap-2">
                    <span className="text-[#00d4aa] font-bold text-xs">✓</span>{i}
                  </div>
                ))}
              </div>
              <Link href="/auth/register">
                <button className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
                  style={
                    p.btnStyle === "primary" ? { background: "linear-gradient(135deg,#6c63ff,#00d4aa)", color: "#fff" } :
                    p.btnStyle === "accent"  ? { background: "linear-gradient(135deg,#ff6b6b,#ffa500)", color: "#fff" } :
                    { background: "#ffffff12", color: "#fff", border: "1px solid #ffffff18" }
                  }>
                  {p.btn}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
