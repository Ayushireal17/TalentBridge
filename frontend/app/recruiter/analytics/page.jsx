"use client";
import { useEffect, useState } from "react";
import Navbar from "../../../components/layout/Navbar";
import { recruiterAPI } from "../../../lib/api";
import { useAuth } from "../../../lib/auth";
import Link from "next/link";
import { 
  Briefcase, 
  CircleDot, 
  Users, 
  Sparkles, 
  ChevronLeft, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  BarChart3,
  CheckCircle,
  FileText
} from "lucide-react";

export default function RecruiterAnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    recruiterAPI.analytics()
      .then(r => {
        setData(r.data.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f" }} className="text-white">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 pt-28 pb-16 flex flex-col justify-center items-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#64748b] text-sm animate-pulse">Loading analytics...</p>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f" }} className="text-white">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 pt-28 pb-16 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-2">Error Loading Analytics</h2>
          <p className="text-[#64748b] mb-6">We could not fetch your dashboard data. Please try again later.</p>
          <Link href="/recruiter/dashboard">
            <button className="btn-primary-tb px-6 py-2 rounded-xl text-sm">
              Back to Dashboard
            </button>
          </Link>
        </main>
      </div>
    );
  }

  const {
    total_jobs,
    active_jobs,
    total_applications,
    average_match_score,
    applications_by_status,
    applications_by_job,
    match_score_segments,
    daily_trends
  } = data;

  // Chart configuration
  const chartWidth = 650;
  const chartHeight = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const maxCount = Math.max(...(daily_trends?.map(d => d.count) || []), 5);
  const xSpacing = (chartWidth - paddingLeft - paddingRight) / 13;
  const yScale = (chartHeight - paddingTop - paddingBottom) / maxCount;

  const chartPoints = daily_trends?.map((d, i) => {
    const x = paddingLeft + i * xSpacing;
    const y = chartHeight - paddingBottom - (d.count * yScale);
    return { x, y, date: d.date, count: d.count };
  }) || [];

  const linePath = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = chartPoints.length > 0 
    ? `${linePath} L ${chartPoints[chartPoints.length - 1].x} ${chartHeight - paddingBottom} L ${chartPoints[0].x} ${chartHeight - paddingBottom} Z` 
    : '';

  // Status mapping details
  const statusConfig = {
    submitted: { label: "Applied", color: "#6c63ff", bg: "#6c63ff18" },
    reviewing: { label: "Reviewing", color: "#ffa500", bg: "#ffa50018" },
    shortlisted: { label: "Shortlisted", color: "#a855f7", bg: "#a855f718" },
    interview: { label: "Interviewing", color: "#ec4899", bg: "#ec489918" },
    hired: { label: "Hired", color: "#00d4aa", bg: "#00d4aa18" },
    rejected: { label: "Rejected", color: "#ff6b6b", bg: "#ff6b6b18" },
    withdrawn: { label: "Withdrawn", color: "#64748b", bg: "#64748b18" }
  };

  const totalStatusApps = Object.values(applications_by_status).reduce((a, b) => a + b, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }} className="text-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link href="/recruiter/dashboard" className="inline-flex items-center gap-1 text-xs text-[#00d4aa] hover:underline mb-3 cursor-pointer">
              <ChevronLeft size={14} /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-black mb-1">Recruiter Analytics</h1>
            <p className="text-[#64748b] text-sm">Real-time stats and AI candidate insights for your team</p>
          </div>
          <div className="flex items-center gap-2 bg-[#13131f] border border-[#ffffff08] px-4 py-2 rounded-xl text-xs text-[#64748b]">
            <Calendar size={14} className="text-[#00d4aa]" />
            <span>Last 14 Days</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Jobs", value: total_jobs, color: "#6c63ff", icon: <Briefcase size={20} /> },
            { label: "Active Jobs", value: active_jobs, color: "#00d4aa", icon: <CircleDot size={20} /> },
            { label: "Total Candidates", value: total_applications, color: "#ffa500", icon: <Users size={20} /> },
            { label: "Avg Match Score", value: `${average_match_score}%`, color: "#ff6b6b", icon: <Sparkles size={20} /> },
          ].map((s, idx) => (
            <div key={idx} className="rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px]" style={{ background: "#13131f", border: "1px solid #ffffff12" }}>
              <div className="absolute top-4 right-4 p-2 rounded-xl" style={{ background: `${s.color}15`, color: s.color }}>
                {s.icon}
              </div>
              <div className="text-3xl font-black mb-1 mt-2" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-[#64748b] font-medium uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts & Pipeline Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Trend Chart (2 Cols) */}
          <div className="lg:col-span-2 rounded-2xl p-6" style={{ background: "#13131f", border: "1px solid #ffffff12" }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold flex items-center gap-2">
                  <TrendingUp size={18} className="text-[#6c63ff]" />
                  Application Velocity
                </h3>
                <p className="text-xs text-[#64748b]">Total candidates applying day by day</p>
              </div>
              {hoveredPoint && (
                <div className="bg-[#1e1e2f] border border-[#ffffff15] px-3 py-1 rounded-lg text-xs">
                  <span className="text-[#64748b] mr-2">{hoveredPoint.date}:</span>
                  <span className="font-bold text-[#00d4aa]">{hoveredPoint.count} apps</span>
                </div>
              )}
            </div>

            <div className="relative overflow-x-auto select-none">
              <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMinYMin meet" className="overflow-visible min-w-[500px]">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6c63ff" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#6c63ff" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6c63ff" />
                    <stop offset="100%" stopColor="#00d4aa" />
                  </linearGradient>
                </defs>

                {/* Y Axis Gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const y = paddingTop + ratio * (chartHeight - paddingTop - paddingBottom);
                  const val = Math.round(maxCount - ratio * maxCount);
                  return (
                    <g key={idx}>
                      <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke="#ffffff" strokeOpacity="0.05" strokeDasharray="3" />
                      <text x={paddingLeft - 8} y={y + 4} fill="#64748b" fontSize="10" textAnchor="end">{val}</text>
                    </g>
                  );
                })}

                {/* Areas & Lines */}
                {chartPoints.length > 0 && (
                  <>
                    <path d={areaPath} fill="url(#chartGradient)" />
                    <path d={linePath} fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round" />
                  </>
                )}

                {/* Interaction & Data Dots */}
                {chartPoints.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={hoveredPoint?.date === p.date ? 6 : 4}
                    fill={hoveredPoint?.date === p.date ? "#00d4aa" : "#6c63ff"}
                    stroke="#13131f"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}

                {/* X Axis Labels */}
                {chartPoints.map((p, i) => {
                  // Only show label every 2 items to prevent overlap
                  if (i % 2 !== 0 && i !== chartPoints.length - 1) return null;
                  return (
                    <text
                      key={i}
                      x={p.x}
                      y={chartHeight - paddingBottom + 18}
                      fill="#64748b"
                      fontSize="9"
                      textAnchor="middle"
                    >
                      {p.date}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Hiring Funnel / Pipeline (1 Col) */}
          <div className="rounded-2xl p-6" style={{ background: "#13131f", border: "1px solid #ffffff12" }}>
            <h3 className="font-bold flex items-center gap-2 mb-1">
              <BarChart3 size={18} className="text-[#ffa500]" />
              Hiring Funnel
            </h3>
            <p className="text-xs text-[#64748b] mb-6">Distribution of current applicant statuses</p>
            
            <div className="space-y-4">
              {Object.entries(applications_by_status).map(([status, count]) => {
                const conf = statusConfig[status] || { label: status, color: "#64748b", bg: "#ffffff08" };
                const percentage = totalStatusApps > 0 ? Math.round((count / totalStatusApps) * 100) : 0;
                return (
                  <div key={status} className="group">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-white/90 group-hover:text-white transition-colors">{conf.label}</span>
                      <div className="space-x-2">
                        <span className="text-[#64748b]">{count}</span>
                        <span className="font-bold" style={{ color: conf.color }}>{percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "#ffffff08" }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, background: conf.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Secondary Info Rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* AI Talent Fit Score Segments */}
          <div className="rounded-2xl p-6" style={{ background: "#13131f", border: "1px solid #ffffff12" }}>
            <h3 className="font-bold flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-[#ff6b6b]" />
              AI Talent Fit Distribution
            </h3>
            <p className="text-xs text-[#64748b] mb-6">Quality categorization of applicant match scores</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: "High Fit (80%+)", count: match_score_segments.high, pct: total_applications > 0 ? Math.round((match_score_segments.high / total_applications) * 100) : 0, color: "#00d4aa", desc: "Top matched candidate profiles" },
                { label: "Medium Fit (50-79%)", count: match_score_segments.medium, pct: total_applications > 0 ? Math.round((match_score_segments.medium / total_applications) * 100) : 0, color: "#ffa500", desc: "Solid experience matches" },
                { label: "Low Fit (<50%)", count: match_score_segments.low, pct: total_applications > 0 ? Math.round((match_score_segments.low / total_applications) * 100) : 0, color: "#ff6b6b", desc: "Lower relevant skill overlap" },
                { label: "Unranked", count: match_score_segments.unranked, pct: total_applications > 0 ? Math.round((match_score_segments.unranked / total_applications) * 100) : 0, color: "#64748b", desc: "Requires resume ranking" }
              ].map((seg, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[#ffffff06] relative overflow-hidden" style={{ background: "#ffffff03" }}>
                  <div className="text-2xl font-black mb-1" style={{ color: seg.color }}>{seg.count}</div>
                  <div className="text-[11px] font-semibold text-white/80 mb-1">{seg.label}</div>
                  <div className="text-[10px] text-[#64748b] leading-tight mb-2">{seg.desc}</div>
                  <div className="text-[10px] font-bold text-white/50">{seg.pct}% of total</div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl border border-[#00d4aa22] bg-[#00d4aa08] text-xs flex gap-3 text-white/90">
              <CheckCircle size={18} className="text-[#00d4aa] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#00d4aa]">AI Sorting Recommendation:</span> Check the <span className="font-semibold text-white">High Fit</span> candidates first to accelerate your sourcing funnel.
              </div>
            </div>
          </div>

          {/* Top Job Listings by Volume */}
          <div className="rounded-2xl p-6" style={{ background: "#13131f", border: "1px solid #ffffff12" }}>
            <h3 className="font-bold flex items-center gap-2 mb-1">
              <FileText size={18} className="text-[#6c63ff]" />
              Top Sourced Jobs
            </h3>
            <p className="text-xs text-[#64748b] mb-6">Listings attracting the highest volume of applicants</p>

            {applications_by_job.length > 0 ? (
              <div className="space-y-4">
                {applications_by_job.map((job, idx) => {
                  const maxJobApps = Math.max(...applications_by_job.map(j => j.applications_count), 1);
                  const progressWidth = Math.round((job.applications_count / maxJobApps) * 100);
                  return (
                    <div key={job.id} className="p-3.5 rounded-xl hover:bg-white/[0.02] border border-[#ffffff04] transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="grow">
                        <div className="font-semibold text-sm mb-1 line-clamp-1">{job.title}</div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/5 max-w-[250px] mt-2">
                          <div className="h-full bg-gradient-to-r from-[#6c63ff] to-[#00d4aa] rounded-full" style={{ width: `${progressWidth}%` }} />
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-3">
                        <span className="font-bold text-sm text-[#00d4aa]">{job.applications_count}</span>
                        <span className="text-xs text-[#64748b]">applicants</span>
                        <Link href={`/recruiter/jobs/${job.id}/applicants`}>
                          <button className="text-xs px-3 py-1 rounded-lg border border-[#ffffff15] hover:border-[#6c63ff44] hover:text-[#a5a0ff] transition-all bg-[#ffffff03]">
                            Manage
                          </button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-[#64748b] text-sm">
                No job postings found to analyze.
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
