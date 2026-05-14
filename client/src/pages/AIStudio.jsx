import { useState } from "react";
import { api } from "../api";

const PLATFORMS = [
  { key: "instagram", label: "Instagram", color: "#e1306c", emoji: "📸" },
  { key: "youtube",   label: "YouTube",   color: "#ff0000", emoji: "▶️" },
  { key: "facebook",  label: "Facebook",  color: "#1877f2", emoji: "👥" },
];

const TONES = ["Professional", "Funny", "Inspirational", "Casual", "Viral"];
const studioBackgroundVideoUrl = import.meta.env.VITE_STUDIO_BACKGROUND_VIDEO_URL || "/bg-video.mp4";

export default function AIStudio() {
  const [topic, setTopic]       = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [tone, setTone]         = useState("Casual");
  const [keywords, setKeywords] = useState("");
  const [captions, setCaptions] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [copied, setCopied]     = useState(null);

  async function generateCaptions() {
    if (!topic.trim()) { setError("Please provide a video topic!"); return; }
    setError(""); setLoading(true); setCaptions([]);
    
    try {
      const data = await api.generateCaption({
        prompt: topic,
        platform,
        tone,
        keywords
      });
      
      if (data.success) {
        const aiCaptions = typeof data.caption === 'string' 
          ? JSON.parse(data.caption.replace(/```json|```/g, "").trim()) 
          : data.caption;
        
        setCaptions(aiCaptions);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message || "ERROR! Server issue");
    } finally {
      setLoading(false);
    }
  }

  function copyCaption(text, index) {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  }

  const selP = PLATFORMS.find((p) => p.key === platform);

  const styles = {
    container: {
      position: 'relative',
      minHeight: "100vh",
      width: "100%",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start', // Start se alignment
      overflowX: 'hidden',
      padding: "120px 20px 80px 20px", // Navbar ke liye extra space
      background: '#050510'
    },
    bgVideo: {
      position: 'fixed', // Fixed taaki scroll pe na hile
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      zIndex: 0,
      opacity: 0.9 // Content focus ke liye light rakha hai
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(to bottom, rgba(5,5,16,0.7), rgba(5,5,16,0.9))',
      zIndex: 1,
    },
    glassCard: {
      position: 'relative',
      zIndex: 2,
      width: '100%',
      maxWidth: 800,
      background: "rgba(255, 255, 255, 0.03)",
      backdropFilter: "blur(20px)", 
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: 32,
      padding: 'clamp(20px, 5vw, 40px)',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes captionEnter {
            from { opacity: 0; transform: translateY(20px); filter: blur(4px); }
            to { opacity: 1; transform: translateY(0); filter: blur(0); }
          }
        `}
      </style>
      {/* ── VIDEO BACKGROUND ── */}
      <video autoPlay loop muted playsInline style={styles.bgVideo}>
        <source src={studioBackgroundVideoUrl} type="video/mp4" />
      </video>

      {/* ── OVERLAY ── */}
      <div style={styles.overlay}></div>

      {/* ── CONTENT ── */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 800 }}>

        <div style={{ textAlign: "center", marginBottom: 48 }} data-reveal="blur" data-reveal-delay="1">
          <div style={{ display: "inline-block", background: "rgba(168, 85, 247, 0.2)", border: "1px solid rgba(168, 85, 247, 0.4)", color: "#d8b4fe", padding: "6px 16px", borderRadius: 50, fontSize: 13, marginBottom: 20 }}>✨ Studio Mode</div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, background: "linear-gradient(135deg,#fff,#a5b4fc,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 12 }}>AI Caption Studio</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16 }}>Generate professional captions for your next viral hit</p>
        </div>

        <div style={styles.glassCard} data-reveal="up" data-reveal-delay="3">
          <label style={{ display: "block", color: "rgba(255,255,255,0.8)", fontSize: 14, marginBottom: 10, fontWeight: 500 }}>🎬 Video Topic</label>
          <textarea rows={3} value={topic} onChange={(e) => setTopic(e.target.value)}
            placeholder="Jaise: Morning gym workout, Travel vlog Mumbai..."
            style={{ width: "100%", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "16px", color: "white", fontSize: 15, fontFamily: "inherit", resize: "none", outline: "none", boxSizing: "border-box", marginBottom: 28 }} />

          <label style={{ display: "block", color: "rgba(255,255,255,0.8)", fontSize: 14, marginBottom: 10, fontWeight: 500 }}>📱 Target Platform</label>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
            {PLATFORMS.map((p) => (
              <button key={p.key} onClick={() => setPlatform(p.key)}
                style={{ padding: "10px 20px", borderRadius: 50, border: `1px solid ${platform === p.key ? p.color : "rgba(255,255,255,0.1)"}`, background: platform === p.key ? p.color + "33" : "rgba(255,255,255,0.05)", color: platform === p.key ? "white" : "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 14, transition: '0.3s' }}>
                {p.emoji} {p.label}
              </button>
            ))}
          </div>

          <label style={{ display: "block", color: "rgba(255,255,255,0.8)", fontSize: 14, marginBottom: 10, fontWeight: 500 }}>🎭 Content Tone</label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
            {TONES.map((t) => (
              <button key={t} onClick={() => setTone(t)}
                style={{ padding: "8px 18px", borderRadius: 50, border: tone === t ? "1px solid #a855f7" : "1px solid rgba(255,255,255,0.1)", background: tone === t ? "linear-gradient(135deg,#6366f1,#a855f7)" : "rgba(255,255,255,0.05)", color: "white", cursor: "pointer", fontSize: 13, transition: '0.3s' }}>
                {t}
              </button>
            ))}
          </div>

          {error && <p style={{ color: "#f87171", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", padding: "12px", borderRadius: 10, fontSize: 14, marginBottom: 20 }}>{error}</p>}

          <button onClick={generateCaptions} disabled={loading}
            style={{ width: "100%", padding: 18, background: "linear-gradient(135deg,#6366f1,#a855f7)", color: "white", border: "none", borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)', transition: '0.3s' }}>
            {loading ? "⏳ AI Processing..." : "✨ Generate Captions"}
          </button>
        </div>

        {/* ── RESULTS ── */}
        {captions.length > 0 && (
          <div style={{ marginTop: 40, paddingBottom: 50 }}>
            <h2 style={{ textAlign: "center", color: "white", fontSize: 24, marginBottom: 24 }}>🎯 Resulting Captions</h2>
            {captions.map((caption, i) => (
              <div key={i} style={{ 
                background: "rgba(255, 255, 255, 0.05)", 
                backdropFilter: "blur(10px)", 
                border: "1px solid rgba(255, 255, 255, 0.1)", 
                borderRadius: 20, 
                padding: 24, 
                marginBottom: 20,
                animation: `captionEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards ${i * 0.1}s`,
                opacity: 0
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'center', marginBottom: 15 }}>
                  <span style={{ color: selP.color, fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>OPTION {i + 1}</span>
                  <button onClick={() => copyCaption(caption, i)}
                    style={{ background: copied === i ? "#22c55e" : "rgba(168, 85, 247, 0.2)", color: "white", border: "1px solid rgba(168, 85, 247, 0.4)", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12 }}>
                    {copied === i ? "✅ Copied!" : "📋 Copy"}
                  </button>
                </div>
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 16, lineHeight: 1.6 }}>{caption}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
