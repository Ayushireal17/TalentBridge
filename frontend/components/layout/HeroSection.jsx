"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ThreeCanvas from "../ui/ThreeCanvas";

const TYPED_WORDS = ["Opportunities", "Your Dream Job", "Top Companies", "Success"];

export default function HeroSection() {
  const [wordIdx, setWordIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = TYPED_WORDS[wordIdx];
    let timeout;
    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 80);
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 40);
    } else {
      setDeleting(false);
      setWordIdx(i => (i + 1) % TYPED_WORDS.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, wordIdx]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 grid-bg" />
      <div className="blob w-[500px] h-[500px] top-[-100px] right-[-100px]" style={{ background: "#e11d48" }} />
      <div className="blob w-[400px] h-[400px] bottom-[-100px] left-[-100px]" style={{ background: "#f97316", animationDelay: "-3s" }} />
      <div className="blob w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ background: "#eab30844", animationDelay: "-6s" }} />

      {/* 3D Canvas (right side) */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-60 hidden lg:block">
        <ThreeCanvas />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6 animate-slide-up">
        <div className="inline-flex items-center gap-2 bg-[#6c63ff18] border border-[#6c63ff44] px-5 py-2 rounded-full text-sm font-medium text-[#00d4aa] mb-8">
          <span className="w-2 h-2 rounded-full bg-[#00d4aa] animate-pulse" />
          AI-Powered Career Intelligence Platform
        </div>

        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6" style={{ letterSpacing: "-2px" }}>
          Bridge Your Talent<br />
          <span className="gradient-text">
            to {displayed}
            <span className="border-r-2 border-[#00d4aa] ml-0.5 animate-pulse">&nbsp;</span>
          </span>
        </h1>

        <p className="text-lg text-[#64748b] max-w-xl mx-auto mb-10 leading-relaxed">
          TalentBridge uses cutting-edge AI to match candidates with their dream roles, help recruiters find perfect fits, and guide every step of your career journey.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-16">
          <Link href="/auth/register?role=candidate">
            <button className="btn-primary-tb text-base px-8 py-4 rounded-2xl">
              🚀 Find Jobs Now
            </button>
          </Link>
          <Link href="/auth/register?role=recruiter">
            <button className="border border-white/10 text-white px-8 py-4 rounded-2xl text-base font-semibold hover:border-[#6c63ff44] hover:bg-[#6c63ff08] transition-all">
              🏢 Post a Role
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/5 pt-12">
          {[
            { num: "50K+", label: "Active Jobs" },
            { num: "120K+", label: "Candidates" },
            { num: "8.5K+", label: "Companies" },
            { num: "94%", label: "Match Rate" },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="gradient-text text-3xl font-black">{s.num}</div>
              <div className="text-sm text-[#64748b] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
