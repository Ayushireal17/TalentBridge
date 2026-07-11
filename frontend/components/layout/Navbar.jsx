"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../lib/auth";
import TBLogo from "../ui/TBLogo";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navBtn = {
    fontSize: 13, padding: "8px 16px", borderRadius: 10,
    background: "transparent", color: "#f1e8e8", fontWeight: 600,
    border: "1px solid #ffffff18", cursor: "pointer", transition: "all 0.2s",
    fontFamily: "Inter, sans-serif",
  };

  const adminLinks = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Users",     href: "/admin/users" },
    { label: "Jobs",      href: "/admin/jobs" },
    { label: "Analytics", href: "/admin/analytics" },
  ];

  const recruiterLinks = [
    { label: "Dashboard", href: "/recruiter/dashboard" },
    { label: "My Jobs",   href: "/recruiter/jobs" },
    { label: "Post Job",  href: "/recruiter/jobs/new" },
  ];

  const candidateLinks = [
  { label: "Dashboard",    href: "/candidate/dashboard" },
  { label: "Find Jobs",    href: "/candidate/jobs" },
  { label: "Resumes",      href: "/candidate/resumes" },
  { label: "Builder",      href: "/candidate/builder" },
  { label: "Applications", href: "/candidate/applications" },
  { label: "Interview",    href: "/candidate/interview" },
];

  const activeLinks =
    user?.role === "admin"     ? adminLinks :
    user?.role === "recruiter" ? recruiterLinks :
    user?.role === "candidate" ? candidateLinks : [];

  const roleColor =
    user?.role === "admin"     ? { bg: "#ff6b6b18", text: "#ff6b6b", border: "#ff6b6b44" } :
    user?.role === "recruiter" ? { bg: "#ffa50018", text: "#ffa500", border: "#ffa50044" } :
                                  { bg: "#e11d4818", text: "#e11d48", border: "#e11d4844" };

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled ? "rgba(15,10,10,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid #ffffff08" : "none",
      transition: "all 0.3s",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>

        {/* Logo */}
        <Link href="/"><TBLogo /></Link>

        {/* Desktop nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!isAuthenticated && (
            <div style={{ display: "flex", gap: 32, marginRight: 24 }}>
              <Link href="/candidate/jobs">
                <span style={{ fontSize: 14, color: "#9b7b7b", cursor: "pointer", fontWeight: 500 }}
                  onMouseEnter={e => e.target.style.color = "#f1e8e8"}
                  onMouseLeave={e => e.target.style.color = "#9b7b7b"}>
                  Find Jobs
                </span>
              </Link>
              <Link href="/#get-started">
                <span style={{ fontSize: 14, color: "#9b7b7b", cursor: "pointer", fontWeight: 500 }}
                  onMouseEnter={e => e.target.style.color = "#f1e8e8"}
                  onMouseLeave={e => e.target.style.color = "#9b7b7b"}>
                  For Recruiters
                </span>
              </Link>
              <Link href="/#features">
                <span style={{ fontSize: 14, color: "#9b7b7b", cursor: "pointer", fontWeight: 500 }}
                  onMouseEnter={e => e.target.style.color = "#f1e8e8"}
                  onMouseLeave={e => e.target.style.color = "#9b7b7b"}>
                  AI Features
                </span>
              </Link>
              <Link href="/#pricing">
                <span style={{ fontSize: 14, color: "#9b7b7b", cursor: "pointer", fontWeight: 500 }}
                  onMouseEnter={e => e.target.style.color = "#f1e8e8"}
                  onMouseLeave={e => e.target.style.color = "#9b7b7b"}>
                  Pricing
                </span>
              </Link>
            </div>
          )}

          {isAuthenticated && activeLinks.map(item => (
            <Link key={item.label} href={item.href}>
              <button style={navBtn}
                onMouseEnter={e => { e.target.style.borderColor = "#e11d4888"; e.target.style.background = "#e11d4811"; }}
                onMouseLeave={e => { e.target.style.borderColor = "#ffffff18"; e.target.style.background = "transparent"; }}>
                {item.label}
              </button>
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Admin button always visible */}
          <Link href="/auth/admin-login">
            <button style={{
              fontSize: 12, fontWeight: 700, color: "#ff6b6b",
              border: "1px solid #ff6b6b44", padding: "8px 14px",
              borderRadius: 10, background: "transparent", cursor: "pointer",
              fontFamily: "Inter, sans-serif", transition: "all 0.2s",
            }}
            onMouseEnter={e => e.target.style.background = "#ff6b6b11"}
            onMouseLeave={e => e.target.style.background = "transparent"}>
              🔐 Admin
            </button>
          </Link>

          {isAuthenticated ? (
            <>
              {/* Role badge */}
              <Link href={user?.role === "candidate" ? "/candidate/profile" : "#"}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 100,
                  background: roleColor.bg, color: roleColor.text,
                  border: `1px solid ${roleColor.border}`,
                  textTransform: "capitalize", cursor: user?.role === "candidate" ? "pointer" : "default",
                }}>
                  {user?.name?.split(" ")[0]} · {user?.role}
                </span>
              </Link>

              <button onClick={logout} style={{
                fontSize: 13, color: "#9b7b7b", background: "transparent",
                border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif",
              }}
              onMouseEnter={e => e.target.style.color = "#f1e8e8"}
              onMouseLeave={e => e.target.style.color = "#9b7b7b"}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <button style={navBtn}
                  onMouseEnter={e => { e.target.style.borderColor = "#e11d4844"; e.target.style.background = "#e11d4811"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "#ffffff18"; e.target.style.background = "transparent"; }}>
                  Sign in
                </button>
              </Link>
              <Link href="/auth/register">
                <button className="btn-primary-tb" style={{ fontSize: 13 }}>
                  Get started
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}