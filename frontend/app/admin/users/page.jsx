"use client";
import { useEffect, useState } from "react";
import Navbar from "../../../components/layout/Navbar";
import { adminAPI } from "../../../lib/api";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  const load = () => {
    setLoading(true);
    adminAPI.users({ search, role })
      .then(r => setUsers(r.data.data || []))
      .catch(() => toast.error("Failed to load users."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, role]);

  const toggleUser = async (id) => {
    try {
      await adminAPI.toggleUser(id);
      toast.success("User status changed.");
      load();
    } catch { toast.error("Failed."); }
  };

  const changeRole = async (id, newRole) => {
    try {
      await adminAPI.changeRole(id, newRole);
      toast.success("Role updated.");
      load();
    } catch { toast.error("Failed."); }
  };

  const roleColor = (r) => ({
    admin:     { bg: "#ff6b6b18", text: "#ff6b6b", border: "#ff6b6b44" },
    recruiter: { bg: "#ffa50018", text: "#ffa500", border: "#ffa50044" },
    candidate: { bg: "#e11d4818", text: "#e11d48", border: "#e11d4844" },
  }[r] || { bg: "#ffffff08", text: "#9b7b7b", border: "#ffffff18" });

  const inputStyle = {
    background: "#120808", border: "1px solid #ffffff18",
    borderRadius: 10, color: "#f1e8e8", padding: "12px 16px",
    fontSize: 14, outline: "none", fontFamily: "Inter, sans-serif", width: "100%",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0a0a" }}>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "112px 24px 64px" }}>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#ff6b6b", marginBottom: 8 }}>Admin</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1, marginBottom: 4 }}>Manage Users</h1>
          <p style={{ color: "#9b7b7b", fontSize: 14 }}>{users.length} users found</p>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Search by name or email…" style={{ ...inputStyle, flex: 1 }} />
          <select value={role} onChange={e => setRole(e.target.value)}
            style={{ ...inputStyle, width: 160 }}>
            <option value="" style={{ background: "#120808" }}>All Roles</option>
            <option value="candidate" style={{ background: "#120808" }}>Candidates</option>
            <option value="recruiter" style={{ background: "#120808" }}>Recruiters</option>
            <option value="admin" style={{ background: "#120808" }}>Admins</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#9b7b7b" }}>Loading users…</div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#9b7b7b" }}>No users found.</div>
        ) : (
          <div style={{ background: "#1a0f0f", border: "1px solid #ffffff12", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "14px 24px", borderBottom: "1px solid #ffffff08", gap: 12 }}>
              {["User", "Role", "Joined", "Status", "Actions"].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#9b7b7b" }}>{h}</div>
              ))}
            </div>

            {users.map((u, i) => {
              const rc = roleColor(u.role);
              return (
                <div key={u.id} style={{
                  display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                  padding: "16px 24px", gap: 12, alignItems: "center",
                  borderBottom: i < users.length - 1 ? "1px solid #ffffff05" : "none",
                  transition: "background 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#ffffff04"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: "#9b7b7b" }}>{u.email}</div>
                  </div>

                  <div>
                    <select value={u.role} onChange={e => changeRole(u.id, e.target.value)}
                      style={{
                        background: rc.bg, color: rc.text, border: `1px solid ${rc.border}`,
                        borderRadius: 8, padding: "5px 10px", fontSize: 12, fontWeight: 700,
                        cursor: "pointer", outline: "none", fontFamily: "Inter, sans-serif",
                      }}>
                      <option value="candidate" style={{ background: "#120808", color: "#f1e8e8" }}>candidate</option>
                      <option value="recruiter" style={{ background: "#120808", color: "#f1e8e8" }}>recruiter</option>
                      <option value="admin" style={{ background: "#120808", color: "#f1e8e8" }}>admin</option>
                    </select>
                  </div>

                  <div style={{ fontSize: 12, color: "#9b7b7b" }}>
                    {new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>

                  <div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 100,
                      background: u.deleted_at ? "#ff6b6b18" : "#00d4aa18",
                      color: u.deleted_at ? "#ff6b6b" : "#00d4aa",
                      border: `1px solid ${u.deleted_at ? "#ff6b6b44" : "#00d4aa44"}`,
                    }}>
                      {u.deleted_at ? "Inactive" : "Active"}
                    </span>
                  </div>

                  <div>
                    <button onClick={() => toggleUser(u.id)} style={{
                      fontSize: 12, padding: "6px 14px", borderRadius: 8,
                      fontWeight: 600, cursor: "pointer", border: "none",
                      fontFamily: "Inter, sans-serif", transition: "all 0.2s",
                      background: u.deleted_at ? "#00d4aa18" : "#ff6b6b18",
                      color: u.deleted_at ? "#00d4aa" : "#ff6b6b",
                    }}>
                      {u.deleted_at ? "Activate" : "Deactivate"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 24 }}>
          {[
            { label: "Total Users", value: users.length,                             color: "#e11d48" },
            { label: "Active",      value: users.filter(u => !u.deleted_at).length,  color: "#00d4aa" },
            { label: "Inactive",    value: users.filter(u => u.deleted_at).length,   color: "#ff6b6b" },
          ].map(s => (
            <div key={s.label} style={{ background: "#1a0f0f", border: "1px solid #ffffff12", borderRadius: 16, padding: "20px 24px" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.color, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#9b7b7b" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}