import { useEffect, useState, useRef } from "react";
import { api, startOAuth } from "../api";

/* ── Platform metadata ── */
const PLATFORMS = [
  {
    key: "facebook",
    label: "Facebook",
    icon: "👥",
    colorClass: "facebook",
    gradient: "linear-gradient(135deg, #1877F2, #42a5f5)",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: "📸",
    colorClass: "instagram",
    gradient: "linear-gradient(135deg, #E4405F, #fd1d1d, #fcb045)",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: "▶️",
    colorClass: "youtube",
    gradient: "linear-gradient(135deg, #FF0000, #ff4444)",
  },
  {
    key: "Tiktok",
    label: "Tiktok",
    icon: "▶️",
    colorClass: "Tiktok",
    gradient: "linear-gradient(135deg, #FF0000, #ff4444)",
  },

];


export default function Dashboard({ user, onLogout, onGoToAI }) {
  /* ── State ── */
  const [accounts, setAccounts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Composer state
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedAsset, setUploadedAsset] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState("");
  const fileRef = useRef(null);

  /* ── Load data on mount ── */
  useEffect(() => {
    loadAccounts();
    loadPosts();
  }, []);

  async function loadAccounts() {
    try {
      const data = await api.getConnections();
      setAccounts(data.accounts || []);
    } catch { /* ignore */ }
    setLoadingAccounts(false);
  }

  async function loadPosts() {
    try {
      const data = await api.getPosts();
      setPosts(data.posts || []);
    } catch { /* ignore */ }
    setLoadingPosts(false);
  }

  /* ── Helpers ── */
  function getConnection(provider) {
    return accounts.find((a) => a.provider === provider);
  }

  function togglePlatform(key) {
    setSelectedPlatforms((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setUploadedAsset(null);

    // Generate preview
    const url = URL.createObjectURL(f);
    setFilePreview({ url, type: f.type });
  }

  /* ── Upload ── */
  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setPublishStatus("");
    try {
      const formData = new FormData();
      formData.append("media", file);
      const data = await api.uploadVideo(formData);
      setUploadedAsset(data.asset);
      setPublishStatus("✅ Upload successful!");
    } catch (err) {
      setPublishStatus("❌ Upload failed: " + (err.message || "Unknown error"));
    }
    setUploading(false);
  }

  /* ── Publish ── */
  async function handlePublish() {
    if (!uploadedAsset) {
      setPublishStatus("⚠️ Please upload a file first.");
      return;
    }
    if (!title.trim() || !caption.trim()) {
      setPublishStatus("⚠️ Title and caption are required.");
      return;
    }
    if (selectedPlatforms.length === 0) {
      setPublishStatus("⚠️ Select at least one platform.");
      return;
    }

    setPublishing(true);
    setPublishStatus("");
    try {
      const tagsArray = hashtags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const data = await api.createPost({
        title,
        caption,
        hashtags: tagsArray,
        mediaUrl: uploadedAsset.url || uploadedAsset.secure_url || uploadedAsset.secureUrl,
        mediaPublicId: uploadedAsset.public_id || uploadedAsset.publicId,
        mediaResourceType: uploadedAsset.resourceType,
        platforms: selectedPlatforms,
      });

      const failedResults = data.post?.results?.filter((result) => result.status === "failed") || [];
      setPublishStatus(
        failedResults.length > 0
          ? `❌ ${failedResults.map((result) => `${result.provider}: ${result.message}`).join(" | ")}`
          : "🎉 Published successfully to all selected platforms!"
      );
      // Reset form
      setTitle("");
      setCaption("");
      setHashtags("");
      setSelectedPlatforms([]);
      setFile(null);
      setFilePreview(null);
      setUploadedAsset(null);
      if (fileRef.current) fileRef.current.value = "";

      // Refresh posts
      loadPosts();
    } catch (err) {
      setPublishStatus("❌ Publish failed: " + (err.message || "Unknown error"));
    }
    setPublishing(false);
  }

  /* ── Status chip class ── */
  function statusClass(s) {
    if (s === "published") return "post-status-published";
    if (s === "failed") return "post-status-failed";
    return "post-status-queued";
  }

  /* ── Render ── */
  return (
    <div style={{ paddingTop: "100px" }}>
      <div className="page-shell">
        {/* ═══ Hero Header ═══ */}
        <div className="hero">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Welcome, {user?.name || "Creator"} 👋</h1>
            <p className="lead">
              Upload your content once and publish it everywhere — Instagram,
              YouTube, Facebook &amp; Instagram.
            </p>
          </div>
          <div className="hero-actions">
            <div className="status-chip">
              <span style={{ fontSize: "1.1em" }}>⚡</span>
              {accounts.length} platform{accounts.length !== 1 ? "s" : ""}{" "}
              connected
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="ghost-button" onClick={onGoToAI} style={{ padding: "10px 18px", fontSize: "0.85rem" }}>
                ✨ AI Studio
              </button>
              <button
                className="ghost-button"
                onClick={onLogout}
                style={{ padding: "10px 18px", fontSize: "0.85rem" }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* ═══ Connected Accounts ═══ */}
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Platforms</p>
                <h2>Connected Accounts</h2>
              </div>
            </div>

            {loadingAccounts ? (
              <p style={{ color: "var(--muted)", textAlign: "center", padding: "20px" }}>
                Loading accounts...
              </p>
            ) : (
              <div className="connection-grid">
                {PLATFORMS.map((p) => {
                  const connection = getConnection(p.key);
                  const connected = Boolean(connection);
                  const configuredByServer = connection?.source === "environment";
                  return (
                    <div className="connection-card" key={p.key}>
                      <strong>
                        <span className={`platform-icon ${p.colorClass}`} style={{ fontSize: "1.4em" }}>
                          {p.icon}
                        </span>
                        {p.label}
                      </strong>
                      <span
                        className={`connection-status ${connected ? "connected" : "disconnected"}`}
                      >
                        {connected ? "Connected" : "Not connected"}
                      </span>
                      {configuredByServer ? (
                        <button
                          className="ghost-button"
                          disabled
                          style={{
                            padding: "8px 14px",
                            fontSize: "0.82rem",
                            marginTop: "auto",
                            width: "100%",
                            textAlign: "center",
                            opacity: 0.75,
                            cursor: "default",
                          }}
                        >
                          Server configured
                        </button>
                      ) : connected ? (
                        <button
                          className="ghost-button"
                          onClick={() => startOAuth(p.key).catch(() => {})}
                          style={{
                            padding: "8px 14px",
                            fontSize: "0.82rem",
                            marginTop: "auto",
                            width: "100%",
                            textAlign: "center",
                          }}
                        >
                          Reconnect
                        </button>
                      ) : (
                        <button
                          className="primary-button"
                          style={{ marginTop: "auto" }}
                          onClick={() => startOAuth(p.key).catch(() => {})}
                        >
                          Connect {p.label}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ═══ Content Composer ═══ */}
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Create</p>
                <h2>Content Composer</h2>
              </div>
            </div>

            <div className="composer-grid">
              {/* Left: Form */}
              <div className="composer-form">
                <label>
                  Media Upload
                  <input
                    type="file"
                    accept="video/*,image/*"
                    ref={fileRef}
                    onChange={handleFileChange}
                  />
                </label>

                {file && !uploadedAsset && (
                  <button
                    className="primary-button"
                    onClick={handleUpload}
                    disabled={uploading}
                    style={{ width: "100%" }}
                  >
                    {uploading ? "⏳ Uploading..." : "☁️ Upload to Cloud"}
                  </button>
                )}

                <label>
                  Title
                  <input
                    type="text"
                    placeholder="e.g. Morning Workout Routine"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </label>

                <label>
                  Caption
                  <textarea
                    rows={4}
                    placeholder="Write your post caption here..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                </label>

                <label>
                  Hashtags
                  <input
                    type="text"
                    placeholder="#fitness, #motivation, #gym"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                  />
                </label>

                <label>
                  Publish To
                  <div className="platform-picker">
                    {PLATFORMS.map((p) => (
                      <label className="platform-toggle" key={p.key}>
                        <input
                          type="checkbox"
                          checked={selectedPlatforms.includes(p.key)}
                          onChange={() => togglePlatform(p.key)}
                        />
                        <span>
                          {p.icon} {p.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </label>

                <button
                  className="primary-button"
                  onClick={handlePublish}
                  disabled={publishing || uploading}
                  style={{
                    width: "100%",
                    padding: "18px",
                    fontSize: "1rem",
                  }}
                >
                  {publishing
                    ? "⏳ Publishing..."
                    : "🚀 Publish Everywhere"}
                </button>

                {publishStatus && (
                  <p
                    style={{
                      textAlign: "center",
                      fontSize: "0.9rem",
                      padding: "12px",
                      borderRadius: "var(--radius-sm)",
                      background: publishStatus.includes("❌") || publishStatus.includes("⚠️")
                        ? "rgba(244, 63, 94, 0.1)"
                        : "rgba(16, 185, 129, 0.1)",
                      border: `1px solid ${
                        publishStatus.includes("❌") || publishStatus.includes("⚠️")
                          ? "rgba(244, 63, 94, 0.2)"
                          : "rgba(16, 185, 129, 0.2)"
                      }`,
                      color: publishStatus.includes("❌") || publishStatus.includes("⚠️")
                        ? "var(--rose)"
                        : "var(--emerald)",
                    }}
                  >
                    {publishStatus}
                  </p>
                )}
              </div>

              {/* Right: Preview */}
              <div className="upload-summary">
                <p className="eyebrow">Preview</p>
                <hr className="gradient-divider" />

                {filePreview ? (
                  filePreview.type.startsWith("video") ? (
                    <video
                      className="preview"
                      src={filePreview.url}
                      controls
                      muted
                      style={{ marginTop: "12px" }}
                    />
                  ) : (
                    <img
                      className="preview"
                      src={filePreview.url}
                      alt="Preview"
                      style={{ marginTop: "12px" }}
                    />
                  )
                ) : (
                  <div
                    className="preview"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "3rem",
                      opacity: 0.15,
                      minHeight: "200px",
                    }}
                  >
                    🎬
                  </div>
                )}

                <h3 style={{ marginTop: "16px" }}>
                  {title || "Your title here"}
                </h3>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.6, marginTop: "8px" }}>
                  {caption || "Your caption will appear here..."}
                </p>

                {hashtags && (
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--accent)",
                      marginTop: "8px",
                    }}
                  >
                    {hashtags}
                  </p>
                )}

                {selectedPlatforms.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      flexWrap: "wrap",
                      marginTop: "12px",
                    }}
                  >
                    {selectedPlatforms.map((key) => {
                      const p = PLATFORMS.find((pl) => pl.key === key);
                      return (
                        <span
                          key={key}
                          style={{
                            background: "rgba(139, 92, 246, 0.12)",
                            border: "1px solid rgba(139, 92, 246, 0.25)",
                            padding: "4px 10px",
                            borderRadius: "var(--radius-pill)",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                          }}
                        >
                          {p?.icon} {p?.label}
                        </span>
                      );
                    })}
                  </div>
                )}

                {uploadedAsset && (
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "10px 14px",
                      background: "rgba(16, 185, 129, 0.08)",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.82rem",
                      color: "var(--emerald)",
                    }}
                  >
                    ☁️ Uploaded to cloud
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══ Post History ═══ */}
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">History</p>
                <h2>Recent Posts</h2>
              </div>
              <button className="ghost-button" onClick={loadPosts} style={{ padding: "8px 16px", fontSize: "0.82rem" }}>
                ↻ Refresh
              </button>
            </div>

            {loadingPosts ? (
              <p style={{ color: "var(--muted)", textAlign: "center", padding: "20px" }}>
                Loading posts...
              </p>
            ) : posts.length === 0 ? (
              <div className="empty-state">
                No posts yet. Create your first post above! 🚀
              </div>
            ) : (
              <div className="post-list">
                {posts.map((post) => (
                  <div className="post-card" key={post._id}>
                    <div className="post-top">
                      <strong>{post.title}</strong>
                      <span className={statusClass(post.status)}>
                        {post.status}
                      </span>
                    </div>
                    <p>{post.caption?.slice(0, 120)}{post.caption?.length > 120 ? "…" : ""}</p>
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        flexWrap: "wrap",
                        marginBottom: "8px",
                      }}
                    >
                      {post.platforms?.map((key) => {
                        const p = PLATFORMS.find((pl) => pl.key === key);
                        return (
                          <span
                            key={key}
                            style={{
                              background: "rgba(139, 92, 246, 0.1)",
                              border: "1px solid rgba(139, 92, 246, 0.2)",
                              padding: "2px 8px",
                              borderRadius: "var(--radius-pill)",
                              fontSize: "0.72rem",
                              fontWeight: 600,
                            }}
                          >
                            {p?.icon} {p?.label}
                          </span>
                        );
                      })}
                    </div>
                    <small>
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>

                    {/* Per-platform results */}
                    {post.results?.length > 0 && (
                      <div style={{ marginTop: "10px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {post.results.map((r, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: "0.72rem",
                              padding: "3px 8px",
                              borderRadius: "var(--radius-pill)",
                              background: r.status === "published"
                                ? "rgba(16,185,129,0.1)"
                                : r.status === "failed"
                                ? "rgba(244,63,94,0.1)"
                                : "rgba(245,158,11,0.1)",
                              color: r.status === "published"
                                ? "var(--emerald)"
                                : r.status === "failed"
                                ? "var(--rose)"
                                : "var(--amber)",
                              border: `1px solid ${
                                r.status === "published"
                                  ? "rgba(16,185,129,0.2)"
                                  : r.status === "failed"
                                  ? "rgba(244,63,94,0.2)"
                                  : "rgba(245,158,11,0.2)"
                              }`,
                            }}
                          >
                            {r.provider}: {r.status}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ═══ Footer ═══ */}
        <footer className="app-footer">
          © 2026 <span>PulsePost Studio</span> — All rights reserved
        </footer>
      </div>
    </div>
  );
}
