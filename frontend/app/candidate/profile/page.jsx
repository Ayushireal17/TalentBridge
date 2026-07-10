"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/layout/Navbar";
import { profileAPI } from "../../../lib/api";
import { useAuth } from "../../../lib/auth";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    name: "", phone: "", location: "", bio: "",
    linkedin_url: "", github_url: "", portfolio_url: "",
    avatar_path: ""
  });
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    profileAPI.get()
      .then(res => {
        const u = res.data.data;
        setProfile({
          name: u.name || "",
          phone: u.phone || "",
          location: u.location || "",
          bio: u.bio || "",
          linkedin_url: u.linkedin_url || "",
          github_url: u.github_url || "",
          portfolio_url: u.portfolio_url || "",
          avatar_path: u.avatar_path || ""
        });
        if (u.avatar_path) {
          // Backend assets are served from storage disk
          setAvatarUrl(u.avatar_url || `http://localhost:8000/storage/${u.avatar_path}`);
        }
      })
      .catch(() => toast.error("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar size should be less than 2MB.");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    setUploading(true);
    try {
      const res = await profileAPI.updateAvatar(formData);
      setAvatarUrl(res.data.avatar_url);
      toast.success("Avatar updated!");
      if (refreshUser) refreshUser(); // Update navbar info if method exists
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload avatar.");
    } finally { setUploading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      toast.error("Name is required.");
      return;
    }

    setSaving(true);
    try {
      await profileAPI.update(profile);
      toast.success("Profile saved successfully!");
      if (refreshUser) refreshUser();
      router.push("/candidate/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
        <Navbar />
        <div style={{ textAlign: "center", paddingTop: 200, color: "#64748b", fontSize: 18 }}>
          Loading profile details…
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-16">
        {/* Back Button */}
        <button onClick={() => router.back()}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24,
            background: "none", border: "none", color: "#64748b", fontSize: 14,
            cursor: "pointer", fontFamily: "Inter, sans-serif", padding: 0,
          }}>
          ← Back
        </button>

        <div style={{
          borderRadius: 24, padding: 32,
          background: "#13131f", border: "1px solid #ffffff12"
        }}>
          <h1 className="text-3xl font-black mb-1 text-white">Edit Profile</h1>
          <p className="text-[#64748b] text-sm mb-8">Update your profile info and personal details</p>

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Avatar upload section */}
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{
                position: "relative", width: 80, height: 80, borderRadius: "50%",
                background: "#ffffff08", border: "2px solid #6c63ff44",
                overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: 32 }}>👤</span>
                )}
                {uploading && (
                  <div style={{
                    position: "absolute", inset: 0, background: "#000000bb",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: "#fff", fontWeight: 700
                  }}>
                    Uploading…
                  </div>
                )}
              </div>
              <div>
                <label style={{
                  display: "inline-block", padding: "8px 16px", borderRadius: 10,
                  background: "#6c63ff18", border: "1px solid #6c63ff44",
                  color: "#a5a0ff", fontSize: 13, fontWeight: 600, cursor: "pointer"
                }}>
                  Change Image
                  <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
                </label>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>Max 2MB (JPG, PNG, WEBP)</div>
              </div>
            </div>

            {/* Inputs Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] mb-2 uppercase tracking-wider">Full Name *</label>
                <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="input-tb" placeholder="Ayushi Chowdhury" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] mb-2 uppercase tracking-wider">Phone Number</label>
                <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                  className="input-tb" placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748b] mb-2 uppercase tracking-wider">Location</label>
              <input value={profile.location} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))}
                className="input-tb" placeholder="Kolkata, West Bengal" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748b] mb-2 uppercase tracking-wider">Short Bio</label>
              <textarea rows={4} value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none BoxSizing-border-box"
                style={{
                  background: "#0a0a0f", border: "1px solid #ffffff12",
                  color: "#f1f5f9", fontFamily: "Inter, sans-serif", lineHeight: 1.6,
                  boxSizing: "border-box"
                }}
                onFocus={e => e.target.style.borderColor = "#6c63ff88"}
                onBlur={e => e.target.style.borderColor = "#ffffff12"}
                placeholder="Tell recruiters about yourself…"
              />
            </div>

            {/* Social profiles */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", borderBottom: "1px solid #ffffff08", paddingBottom: 6 }}>Social Profiles</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="block text-xs font-semibold text-[#64748b] mb-2 uppercase tracking-wider">LinkedIn URL</label>
                  <input value={profile.linkedin_url} onChange={e => setProfile(p => ({ ...p, linkedin_url: e.target.value }))}
                    className="input-tb" placeholder="https://linkedin.com/in/username" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748b] mb-2 uppercase tracking-wider">GitHub URL</label>
                  <input value={profile.github_url} onChange={e => setProfile(p => ({ ...p, github_url: e.target.value }))}
                    className="input-tb" placeholder="https://github.com/username" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748b] mb-2 uppercase tracking-wider">Portfolio URL</label>
                <input value={profile.portfolio_url} onChange={e => setProfile(p => ({ ...p, portfolio_url: e.target.value }))}
                  className="input-tb" placeholder="https://username.dev" />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, paddingTop: 16 }}>
              <button type="submit" disabled={saving} className="btn-primary-tb" style={{ flex: 1, padding: "14px" }}>
                {saving ? "Saving Changes…" : "Save Profile"}
              </button>
              <button type="button" onClick={() => router.push("/candidate/dashboard")}
                style={{
                  flex: 1, padding: "14px", borderRadius: 12, fontWeight: 600,
                  background: "#ffffff08", color: "#64748b", border: "none",
                  cursor: "pointer", fontFamily: "Inter, sans-serif",
                }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
