export default function TBLogo({ size = 36 }) {
  return (
    <div className="flex items-center gap-3 cursor-pointer">
      <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tbg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        <rect width="44" height="44" rx="12" fill="url(#tbg)" />
        <path d="M10 32 L22 12 L34 32" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M15 24 L29 24" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <circle cx="22" cy="12" r="3" fill="white" />
        <circle cx="10" cy="32" r="2.5" fill="white" opacity="0.7" />
        <circle cx="34" cy="32" r="2.5" fill="white" opacity="0.7" />
      </svg>
      <div>
        <div style={{
          background: "linear-gradient(135deg, #6c63ff, #00d4aa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          fontSize: "20px",
          fontWeight: 700,
          letterSpacing: "-0.5px",
          lineHeight: 1,
        }}>TalentBridge</div>
        <div style={{ fontSize: "9px", color: "#00d4aa", letterSpacing: "2px", fontWeight: 600, textTransform: "uppercase" }}>
          AI Powered
        </div>
      </div>
    </div>
  );
}
