"use client";
import { useState, useRef, useEffect } from "react";
import { aiAPI } from "../../lib/api";
import toast from "react-hot-toast";

const INITIAL_MSG = [{ role: "assistant", content: "Hi! I'm BridgeAI 👋 I can help you with job searching, resume tips, interview prep, and salary insights. What would you like help with?" }];

const CHIPS = ["Improve my resume", "Top paying tech jobs", "Interview tips for React", "Remote work opportunities", "Salary negotiation advice"];

export default function BridgeAIChatbot({ onClose }) {
  const [messages, setMessages] = useState(INITIAL_MSG);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
  const msg = text || input.trim();
  if (!msg) return;
  setInput("");

  const newMessages = [...messages, { role: "user", content: msg }];
  setMessages(newMessages);
  setLoading(true);

  try {
    const res = await aiAPI.chat(newMessages, "candidate");
    setMessages(m => [...m, {
      role: "assistant",
      content: res.data.data.reply
    }]);
  } catch (err) {
    const status = err.response?.status;
    const errMsg = err.response?.data?.message || err.message;
    console.error("BridgeAI error:", status, errMsg);

    let userMsg = "Sorry, I'm having trouble connecting. Please try again.";

    if (status === 401) userMsg = "Please log in to use BridgeAI.";
    else if (status === 403) userMsg = "Access denied. Please log in as a candidate.";
    else if (status === 500) userMsg = `Server error: ${errMsg}. Check your Gemini API key.`;
    else if (!navigator.onLine) userMsg = "No internet connection.";

    setMessages(m => [...m, {
      role: "assistant",
      content: userMsg,
    }]);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#13131f", border: "1px solid #6c63ff44" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid #ffffff08", background: "linear-gradient(135deg,#6c63ff22,#00d4aa11)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg relative"
          style={{ background: "linear-gradient(135deg,#6c63ff,#00d4aa)" }}>
          🤖
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: "#00d4aa", border: "2px solid #13131f" }} />
        </div>
        <div>
          <div className="text-sm font-semibold">BridgeAI</div>
          <div className="text-xs" style={{ color: "#00d4aa" }}>Career Assistant</div>
        </div>
        <button onClick={onClose} className="ml-auto text-[#64748b] hover:text-white transition-colors text-lg">✕</button>
      </div>

      {/* Messages */}
      <div className="px-4 py-4 space-y-4 overflow-y-auto" style={{ maxHeight: 320 }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[85%] px-3 py-2.5 rounded-xl text-sm leading-relaxed"
              style={m.role === "user"
                ? { background: "linear-gradient(135deg,#6c63ff,#00d4aa)", borderBottomRightRadius: 4 }
                : { background: "#ffffff0a", border: "1px solid #ffffff08", borderBottomLeftRadius: 4 }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "#ffffff0a", border: "1px solid #ffffff08" }}>
              <span className="animate-pulse">BridgeAI is thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Chips */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-2 no-scrollbar">
        {CHIPS.map(c => (
          <button key={c} onClick={() => send(c)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-all"
            style={{ background: "#6c63ff18", border: "1px solid #6c63ff44", color: "#00d4aa" }}>
            {c}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 px-4 py-3" style={{ borderTop: "1px solid #ffffff08" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask anything…"
          className="input-tb flex-1 text-sm py-2"
        />
        <button onClick={() => send()} disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold"
          style={{ background: "linear-gradient(135deg,#6c63ff,#00d4aa)" }}>
          ➤
        </button>
      </div>
    </div>
  );
}
