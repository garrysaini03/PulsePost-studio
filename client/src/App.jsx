import { useEffect, useRef, useState, useCallback } from "react";
import AIStudio from "./pages/AIStudio";
import Analytics from "./pages/Analytics";
import AuthModal from "./pages/AuthModal";
import ContactUs from "./pages/ContactUs";
import Dashboard from "./pages/Dashboard";
import Plans from "./pages/Plans";
import { api } from "./api";

const landingHeroVideoUrl = import.meta.env.VITE_LANDING_HERO_VIDEO_URL || "/AIBG-video.mp4";
const floatingPlatforms = [
  { key: "instagram", label: "Instagram", icon: "📸", color: "#E4405F" },
  { key: "youtube", label: "YouTube", icon: "▶️", color: "#FF0000" },
  { key: "facebook", label: "Facebook", icon: "👥", color: "#1877F2" },
  { key: "tiktok", label: "TikTok", icon: "🎵", color: "#00f2ea" },
];

export default function App() {
  const [page, setPage] = useState("landing");
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("starter");

  /* ── Check existing session on mount ── */
  useEffect(() => {
    const token = localStorage.getItem("pulsepost-token");
    if (token) {
      api
        .me()
        .then((data) => {
          setUser(data.user);
        })
        .catch(() => {
          localStorage.removeItem("pulsepost-token");
        })
        .finally(() => setCheckingAuth(false));
    } else {
      setCheckingAuth(false);
    }
  }, []);

  /* ── Check for OAuth callback redirect ── */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    if (connected) {
      window.history.replaceState({}, "", window.location.pathname);
      if (user) setPage("dashboard");
    }
  }, [user]);

  /* ── Scroll listener ── */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* ── Scroll-reveal Intersection Observer ── */
  const observerRef = useRef(null);

  useEffect(() => {
    // No page restriction, observe elements on any page

    // Small delay to let DOM render
    const timer = setTimeout(() => {
      const els = document.querySelectorAll("[data-reveal]");
      if (!els.length) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("revealed");
              observerRef.current?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );

      els.forEach((el) => observerRef.current.observe(el));
    }, 100);

    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, [page]);

  /* ── Navigation helpers ── */
  function handleGetStarted() {
    if (user) {
      setPage("dashboard");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setShowAuth(true);
    }
  }

  function handlePlatformClick() {
    handleGetStarted();
  }

  function goToPlans(plan = "starter") {
    setSelectedPlan(plan);
    setPage("plans");
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleAuthSuccess(userData) {
    setUser(userData);
    setShowAuth(false);
    setPage("dashboard");
    window.scrollTo({ top: 0 });
  }

  function handleLogout() {
    localStorage.removeItem("pulsepost-token");
    setUser(null);
    setPage("landing");
    window.scrollTo({ top: 0 });
  }

  function scrollToTop(e) {
    e?.preventDefault();
    if (user) {
      setPage("dashboard");
    } else {
      setPage("landing");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ── Loading state ── */
  if (checkingAuth) {
    return (
      <div
        style={{
          background: "var(--bg, #06060f)",
          color: "#fff",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.1rem",
          fontFamily: "Space Grotesk, system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "linear-gradient(135deg, #8b5cf6, #06b6d4)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
              marginBottom: 16,
              animation: "glowPulse 2s ease-in-out infinite",
            }}
          >
            ▶
          </div>
          <p style={{ opacity: 0.6 }}>Loading PulsePost...</p>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     NAVBAR (shared across all pages)
     ══════════════════════════════════════════ */

  function navTo(target, e) {
    e.preventDefault();
    setMenuOpen(false);
    if (target === "home") {
      setPage("landing");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (["dashboard", "plans", "analytics", "aistudio", "contact"].includes(target)) {
      setPage(target);
      window.scrollTo({ top: 0 });
    } else {
      if (page !== "landing") {
        setPage("landing");
        setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: "smooth" }), 150);
      } else {
        document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  const navLinks = page === "landing" || page === "contact" || !user
    ? [
        { label: "Home", target: "home" },
        { label: "Features", target: "features" },
        { label: "How It Works", target: "how-it-works" },
        { label: "Plans", target: "plans" },
        { label: "Contact Us", target: "contact" },
      ]
    : [
        { label: "Home", target: "home" },
        { label: "Dashboard", target: "dashboard" },
        { label: "Plans", target: "plans" },
        { label: "Analytics 📊", target: "analytics" },
        { label: "AI Studio ✨", target: "aistudio" },
      ];

  const Navbar = () => (
    <nav className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
      <div className="navbar-inner">
        <a className="navbar-brand" href="#" onClick={(e) => { e.preventDefault(); setMenuOpen(false); setPage("landing"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <span className="brand-icon">▶</span>
          <span className="brand-text">PulsePost</span>
        </a>

        {/* Desktop links */}
        <div className="navbar-links">
          {navLinks.map((l) => (
            <a key={l.target} href="#" onClick={(e) => navTo(l.target, e)}>{l.label}</a>
          ))}
        </div>

        <div className="navbar-right">
          {user ? (
            <>
              <span className="navbar-user-name">{user.name}</span>
              {page !== "dashboard" && (
                <button className="primary-button navbar-cta" onClick={() => { setPage("dashboard"); window.scrollTo({ top: 0 }); }}>
                  Dashboard →
                </button>
              )}
            </>
          ) : (
            <>
              <button className="ghost-button navbar-signin" onClick={() => setShowAuth(true)}>
                Sign In
              </button>
              <button className="primary-button navbar-cta" onClick={handleGetStarted}>
                Get Started <span className="btn-arrow">→</span>
              </button>
            </>
          )}

          {/* Hamburger */}
          <button
            className={`hamburger${menuOpen ? " hamburger--open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div className={`mobile-menu${menuOpen ? " mobile-menu--open" : ""}`}>
        {navLinks.map((l) => (
          <a key={l.target} href="#" className="mobile-menu-link" onClick={(e) => navTo(l.target, e)}>{l.label}</a>
        ))}
        <hr className="mobile-menu-divider" />
        {user ? (
          <>
            <span className="mobile-menu-user">👤 {user.name}</span>
            {page !== "dashboard" && (
              <a href="#" className="mobile-menu-link" onClick={(e) => navTo("dashboard", e)}>Dashboard →</a>
            )}
          </>
        ) : (
          <>
            <a href="#" className="mobile-menu-link" onClick={(e) => { e.preventDefault(); setMenuOpen(false); setShowAuth(true); }}>Sign In</a>
            <a href="#" className="mobile-menu-link mobile-menu-cta" onClick={(e) => { e.preventDefault(); setMenuOpen(false); handleGetStarted(); }}>Get Started →</a>
          </>
        )}
      </div>
    </nav>
  );

  /* ══════════════════════════════════════════
     PAGE: AI STUDIO
     ══════════════════════════════════════════ */
  if (page === "aistudio") {
    return (
      <div>
        <Navbar />
        <AIStudio />
        <div style={{ textAlign: "center", padding: "20px" }}>
          <button
            className="ghost-button"
            onClick={() => setPage(user ? "dashboard" : "landing")}
          >
            ← {user ? "Back to Dashboard" : "Back to Home"}
          </button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     PAGE: ANALYTICS
     ══════════════════════════════════════════ */
  if (page === "plans") {
    return (
      <div>
        <Navbar />
        <Plans
          selectedPlan={selectedPlan}
          user={user}
          onChoosePlan={(plan) => {
            setSelectedPlan(plan);
            handleGetStarted();
          }}
          onContactSales={() => {
            setPage("contact");
            window.scrollTo({ top: 0 });
          }}
        />
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onAuth={handleAuthSuccess}
          />
        )}
      </div>
    );
  }

  if (page === "analytics" && user) {
    return (
      <div>
        <Navbar />
        <Analytics />
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onAuth={handleAuthSuccess}
          />
        )}
      </div>
    );
  }

  /* ══════════════════════════════════════════
     PAGE: DASHBOARD
     ══════════════════════════════════════════ */
  if (page === "dashboard" && user) {
    return (
      <div>
        <Navbar />
        <Dashboard
          user={user}
          onLogout={handleLogout}
          onGoToAI={() => {
            setPage("aistudio");
            window.scrollTo({ top: 0 });
          }}
        />
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onAuth={handleAuthSuccess}
          />
        )}
      </div>
    );
  }

  /* ══════════════════════════════════════════
     PAGE: CONTACT US
     ══════════════════════════════════════════ */
  if (page === "contact") {
    return (
      <div>
        <Navbar />
        <ContactUs />
        {/* ── Footer ── */}
        <footer className="site-footer">
          <div className="landing-container">
            <div className="footer-grid">
              <div className="footer-brand">
                <a className="navbar-brand" href="#" onClick={scrollToTop}>
                  <span className="brand-icon">▶</span>
                  <span className="brand-text">PulsePost</span>
                </a>
                <p>
                  The all-in-one platform for creators to publish, optimize, and
                  grow their social media presence across every platform.
                </p>
              </div>
              <div className="footer-col">
                <h4>Product</h4>
                <a href="#" onClick={(e) => { e.preventDefault(); setPage("landing"); window.scrollTo({ top: 0 }); }}>Home</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setPage("landing"); setTimeout(() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }), 100); }}>Features</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setPage("landing"); setTimeout(() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }), 100); }}>Pricing</a>
              </div>
              <div className="footer-col">
                <h4>Company</h4>
                <a href="#">About</a>
                <a href="#">Blog</a>
                <a href="#">Careers</a>
              </div>
              <div className="footer-col">
                <h4>Legal</h4>
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setPage("contact"); window.scrollTo({ top: 0 }); }}>Contact Us</a>
              </div>
            </div>
            <hr className="gradient-divider" />
            <div className="footer-bottom">
              <p>
                © 2026 <span>PulsePost Studio</span> — All rights reserved
              </p>
            </div>
          </div>
        </footer>
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onAuth={handleAuthSuccess}
          />
        )}
      </div>
    );
  }

  /* ══════════════════════════════════════════
     PAGE: LANDING
     ══════════════════════════════════════════ */
  return (
    <div>
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section className="landing-hero" style={{ position: "relative", overflow: "hidden" }}>
          {/* Background Video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
              opacity: 0.25,
              pointerEvents: "none",
            }}
          >
            <source src={landingHeroVideoUrl} type="video/mp4" />
          </video>
          {/* Dark overlay for readability */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, rgba(6,6,15,0.4), rgba(6,6,15,0.85))",
              zIndex: 1,
              pointerEvents: "none",
            }}
          />
          <div className="landing-container" style={{ position: "relative", zIndex: 2 }}>
            <div className="hero-badge" data-reveal="down" data-reveal-delay="1">✦ AI-Powered Social Media Suite</div>
            <h1 className="landing-h1" data-reveal="blur" data-reveal-delay="2" data-reveal-duration="slow">
              Post Once,
              <br />
              <span className="hero-gradient-text">Dominate Everywhere</span>
            </h1>
            <p className="landing-lead" data-reveal="up" data-reveal-delay="3">
              Upload your content and let PulsePost publish it to Instagram,
              YouTube, Facebook, and TikTok — with AI-optimized captions,
              hashtags, and formatting for each platform.
            </p>
            <div className="floating-platforms" aria-label="Open dashboard by platform">
              {floatingPlatforms.map((platform, index) => (
                <button
                  key={platform.key}
                  type="button"
                  className="floating-platform"
                  onClick={handlePlatformClick}
                  style={{
                    "--platform-color": platform.color,
                    "--float-delay": `${index * 0.45}s`,
                  }}
                  aria-label={`Open dashboard for ${platform.label}`}
                >
                  <span className="floating-platform-icon">{platform.icon}</span>
                  <span>{platform.label}</span>
                </button>
              ))}
            </div>
            <div className="hero-buttons" data-reveal="up" data-reveal-delay="4">
              <button
                className="primary-button hero-primary"
                onClick={handleGetStarted}
              >
                Get Started Free <span className="btn-arrow">→</span>
              </button>
              <button
                className="ghost-button hero-secondary"
                onClick={() => {
                  setPage("aistudio");
                  window.scrollTo({ top: 0 });
                }}
              >
                Try AI Studio ✨
              </button>
            </div>
            <div className="hero-stats" data-reveal="up" data-reveal-delay="5">
              <div className="stat-item">
                <strong>3</strong>
                <span>Platforms</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <strong>1-Click</strong>
                <span>Publishing</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <strong>AI</strong>
                <span>Captions</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <strong>Free</strong>
                <span>To Start</span>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="hero-preview" data-reveal="zoom" data-reveal-delay="6" data-reveal-duration="slow">
              <img
                src="/dashboard-preview.png"
                alt="PulsePost Dashboard Preview"
                className="hero-preview-img"
              />
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="landing-section landing-section--alt">
          <div className="landing-container">
            <div className="section-eyebrow" data-reveal="down">
              <div className="hero-badge">✦ Features</div>
            </div>
            <h2 className="section-heading" data-reveal="blur" data-reveal-delay="1">Everything You Need to Go Viral</h2>
            <p className="section-subheading" data-reveal="up" data-reveal-delay="2">
              Powerful tools designed to maximize your reach across every major
              social platform.
            </p>
            <div className="features-grid">
              {[
                {
                  icon: "🚀",
                  title: "One-Click Publishing",
                  desc: "Upload once and publish to Instagram, YouTube, and Facebook simultaneously.",
                },
                {
                  icon: "🤖",
                  title: "AI Caption Engine",
                  desc: "Our AI generates platform-specific captions optimized for engagement and reach.",
                },
                {
                  icon: "📊",
                  title: "Performance Analytics",
                  desc: "Track your content performance across all connected platforms in one dashboard.",
                },
                {
                  icon: "⏰",
                  title: "Smart Scheduling",
                  desc: "Schedule posts for optimal times based on your audience's activity patterns.",
                },
                {
                  icon: "#️⃣",
                  title: "Hashtag Optimizer",
                  desc: "AI-powered hashtag suggestions that maximize discoverability on each platform.",
                },
                {
                  icon: "🔗",
                  title: "OAuth Integration",
                  desc: "Securely connect your accounts with official platform OAuth 2.0 flows.",
                },
              ].map((f, i) => {
                const anims = ["flip", "zoom", "left", "right", "rotate", "up"];
                return (
                  <div className="feature-card" key={i} data-reveal={anims[i % anims.length]} data-reveal-delay={String(i + 1)}>
                    <div className="feature-icon">{f.icon}</div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="landing-section">
          <div className="landing-container">
            <div className="section-eyebrow" data-reveal="down">
              <div className="hero-badge">✦ How It Works</div>
            </div>
            <h2 className="section-heading" data-reveal="blur" data-reveal-delay="1">Four Steps to Everywhere</h2>
            <p className="section-subheading" data-reveal="up" data-reveal-delay="2">
              From upload to viral — it takes less than 60 seconds.
            </p>
            <div className="steps-grid">
              {[
                {
                  num: "01",
                  title: "Connect",
                  desc: "Link your Instagram, YouTube, and Facebook accounts via secure OAuth.",
                },
                {
                  num: "02",
                  title: "Upload",
                  desc: "Upload your video or image content. We handle all format conversions automatically.",
                },
                {
                  num: "03",
                  title: "AI Magic",
                  desc: "Our AI generates optimized captions, hashtags, and formatting for each platform.",
                },
                {
                  num: "04",
                  title: "Go Viral",
                  desc: "Hit publish and your content goes live on all selected platforms instantly.",
                },
              ].map((step, i) => (
                <div className="step-card" key={i} data-reveal="flip" data-reveal-delay={String(i + 1)}>
                  <div className="step-num">{step.num}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Platforms ── */}
        <section className="landing-section landing-section--alt">
          <div className="landing-container">
            <div className="section-eyebrow" data-reveal="down">
              <div className="hero-badge">✦ Platforms</div>
            </div>
            <h2 className="section-heading" data-reveal="blur" data-reveal-delay="1">Supported Platforms</h2>
            <p className="section-subheading" data-reveal="up" data-reveal-delay="2">
              Reach your audience wherever they are — all from one dashboard.
            </p>
            <div className="platforms-row">
              {[
                { icon: "📸", name: "Instagram", desc: "Reels, Stories & Posts" },
                { icon: "▶️", name: "YouTube", desc: "Shorts & Videos" },
                { icon: "👥", name: "Facebook", desc: "Posts & Reels" },
                { icon: "🎵", name: "TikTok", desc: "Short Videos" },
              ].map((p, i) => {
                const anims = ["left", "up", "up", "right"];
                return (
                  <div className="platform-card" key={i} data-reveal={anims[i]} data-reveal-delay={String(i + 1)}>
                    <div className="platform-card-icon" style={{ fontSize: "2rem" }}>
                      {p.icon}
                    </div>
                    <h3>{p.name}</h3>
                    <p>{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="landing-section">
          <div className="landing-container">
            <div className="section-eyebrow" data-reveal="down">
              <div className="hero-badge">✦ Pricing</div>
            </div>
            <h2 className="section-heading" data-reveal="blur" data-reveal-delay="1">Simple, Transparent Pricing</h2>
            <p className="section-subheading" data-reveal="up" data-reveal-delay="2">
              Start for free. Scale when you're ready.
            </p>
            <div className="pricing-grid">
              {/* Free */}
              <div className="pricing-card" data-reveal="left" data-reveal-delay="2">
                <h3>Starter</h3>
                <div className="pricing-price">
                  <span className="price-amount">$0</span>
                  <span className="price-period"> / month</span>
                </div>
                <p className="pricing-desc">Perfect for getting started</p>
                <ul className="pricing-features">
                  <li><span className="check-icon">✓</span> 2 platforms</li>
                  <li><span className="check-icon">✓</span> 10 posts/month</li>
                  <li><span className="check-icon">✓</span> Basic AI captions</li>
                  <li><span className="check-icon">✓</span> Community support</li>
                </ul>
                <button
                  className="ghost-button pricing-cta"
                  onClick={handleGetStarted}
                >
                  Start Free
                </button>
              </div>

              {/* Pro */}
              <div className="pricing-card pricing-card--featured" data-reveal="zoom" data-reveal-delay="3">
                <div className="pricing-badge">Most Popular</div>
                <h3>Pro</h3>
                <div className="pricing-price">
                  <span className="price-amount">$19</span>
                  <span className="price-period"> / month</span>
                </div>
                <p className="pricing-desc">For growing creators</p>
                <ul className="pricing-features">
                  <li><span className="check-icon">✓</span> All 4 platforms</li>
                  <li><span className="check-icon">✓</span> Unlimited posts</li>
                  <li><span className="check-icon">✓</span> Advanced AI captions</li>
                  <li><span className="check-icon">✓</span> Smart scheduling</li>
                  <li><span className="check-icon">✓</span> Priority support</li>
                </ul>
                <button
                  className="primary-button pricing-cta"
                  onClick={handleGetStarted}
                >
                  Get Pro <span className="btn-arrow">→</span>
                </button>
              </div>

              {/* Enterprise */}
              <div className="pricing-card" data-reveal="right" data-reveal-delay="4">
                <h3>Enterprise</h3>
                <div className="pricing-price">
                  <span className="price-amount">$49</span>
                  <span className="price-period"> / month</span>
                </div>
                <p className="pricing-desc">For teams and agencies</p>
                <ul className="pricing-features">
                  <li><span className="check-icon">✓</span> Everything in Pro</li>
                  <li><span className="check-icon">✓</span> Team collaboration</li>
                  <li><span className="check-icon">✓</span> Custom branding</li>
                  <li><span className="check-icon">✓</span> API access</li>
                  <li><span className="check-icon">✓</span> Dedicated support</li>
                </ul>
                <button
                  className="ghost-button pricing-cta"
                  onClick={() => window.location.href = "mailto:team@pulsepost.studio"}
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta-section">
          <div className="landing-container">
            <div className="cta-card" data-reveal="zoom" data-reveal-duration="slow">
              <h2>Ready to Dominate Social Media?</h2>
              <p>
                Join thousands of creators who publish smarter with PulsePost
                Studio.
              </p>
              <button
                className="primary-button cta-btn"
                onClick={handleGetStarted}
              >
                Start Publishing Free <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="landing-container">
          <div className="footer-grid">
            <div className="footer-brand" data-reveal="left">
              <a className="navbar-brand" href="#" onClick={scrollToTop}>
                <span className="brand-icon">▶</span>
                <span className="brand-text">PulsePost</span>
              </a>
              <p>
                The all-in-one platform for creators to publish, optimize, and
                grow their social media presence across every platform.
              </p>
            </div>
            <div className="footer-col" data-reveal="up" data-reveal-delay="1">
              <h4>Product</h4>
              <a href="#" onClick={(e) => { e.preventDefault(); setPage("landing"); window.scrollTo({ top: 0 }); }}>Home</a>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#pricing">Pricing</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setPage("contact"); window.scrollTo({ top: 0 }); }}>Contact Us</a>
            </div>
            <div className="footer-col" data-reveal="up" data-reveal-delay="2">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
            </div>
            <div className="footer-col" data-reveal="up" data-reveal-delay="3">
              <h4>Legal</h4>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">DMCA</a>
            </div>
          </div>
          <hr className="gradient-divider" data-reveal="left" data-reveal-delay="4" />
          <div className="footer-bottom" data-reveal="blur" data-reveal-delay="5">
            <p>
              © 2026 <span>PulsePost Studio</span> — All rights reserved
            </p>
          </div>
        </div>
      </footer>

      {/* ── Auth Modal ── */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onAuth={handleAuthSuccess}
        />
      )}
    </div>
  );
}
