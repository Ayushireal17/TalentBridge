"use client";

const messages = [
  { role: "bot",  text: "Hi! I'm BridgeAI 👋 I'm here to help with your career journey. What would you like help with?" },
  { role: "user", text: "I'm a React developer with 3 years of experience. What jobs should I apply for?" },
  { role: "bot",  text: "Great choice! With 3 years of React experience you're well positioned for mid-level roles. I'd recommend:\n• Frontend Engineer (₹12–18 LPA)\n• React Developer (₹10–16 LPA)\n• Full Stack Engineer if you know Node.js (₹14–22 LPA)\n\nShall I analyse your resume to refine these?" },
];

const chips = ["📄 Analyse my resume", "💰 Salary insights", "🎤 Interview tips", "📍 Remote jobs"];

export default function ChatbotPreview() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <div className="text-xs font-semibold tracking-[3px] uppercase text-[#00d4aa] mb-3">AI Chatbot</div>
          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ letterSpacing: "-1px" }}>Your personal career assistant</h2>
          <p className="text-[#64748b] text-lg max-w-md mx-auto">Ask anything about your job search — BridgeAI has you covered 24/7.</p>
        </div>

        <div className="rounded-3xl overflow-hidden" style={{ background: "#13131f", border: "1px solid #ffffff12" }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: "1px solid #ffffff08", background: "#ffffff04" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl relative"
              style={{ background: "linear-gradient(135deg,#6c63ff,#00d4aa)" }}>
              🤖
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full" style={{ background: "#00d4aa", border: "2px solid #13131f" }} />
            </div>
            <div>
              <div className="text-sm font-semibold">BridgeAI Assistant</div>
              <div className="text-xs" style={{ color: "#00d4aa" }}>Online · Replies instantly</div>
            </div>
            <div className="ml-auto flex gap-2">
              {["#ff6b6b","#ffa500","#00d4aa"].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
            </div>
          </div>

          {/* Messages */}
          <div className="px-6 py-6 space-y-5 min-h-[280px]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[75%]">
                  <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line"
                    style={m.role === "user"
                      ? { background: "linear-gradient(135deg,#6c63ff,#00d4aa)", borderBottomRightRadius: 4 }
                      : { background: "#ffffff08", border: "1px solid #ffffff0a", borderBottomLeftRadius: 4 }}>
                    {m.text}
                  </div>
                  <div className={`text-xs mt-1 text-[#64748b] ${m.role === "user" ? "text-right pr-1" : "pl-1"}`}>Just now</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap gap-2 px-6 pb-4">
            {chips.map(c => (
              <div key={c} className="px-3 py-2 rounded-full text-xs font-medium cursor-pointer transition-all"
                style={{ background: "#6c63ff18", border: "1px solid #6c63ff44", color: "#00d4aa" }}>
                {c}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-3 px-6 py-4" style={{ borderTop: "1px solid #ffffff08", background: "#ffffff04" }}>
            <input className="input-tb flex-1" placeholder="Ask anything about your career…" />
            <button className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#6c63ff,#00d4aa)" }}>
              ➤
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-[#64748b] mt-4">
          Full chatbot available after sign up · Powered by Gemini AI
        </p>
      </div>
    </section>
  );
}
