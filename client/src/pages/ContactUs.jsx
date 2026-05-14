import { useState } from "react";
import { api } from "../api";

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setStatus("Please fill in all required fields.");
      return;
    }
    
    setLoading(true);
    setStatus("");
    
    try {
      const response = await api.submitContact(form);
      if (response.success) {
        setStatus("✨ Message sent! We'll get back to you within 24 hours.");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("Error sending message. Please try again.");
      }
    } catch (error) {
      setStatus(error.message || "Error sending message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="contact-page">
      <div className="landing-container">
        {/* Header */}
        <div className="contact-header" data-reveal="blur" data-reveal-delay="1">
          <div className="hero-badge">✦ Get In Touch</div>
          <h1 className="section-heading" style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", marginBottom: "12px" }}>
            Contact Us
          </h1>
          <p className="section-subheading" style={{ marginBottom: "56px" }}>
            Have a question, feedback, or partnership inquiry? We'd love to hear from you.
          </p>
        </div>

        {/* Illustration */}
        <div className="contact-illustration" data-reveal="zoom" data-reveal-delay="2" data-reveal-duration="slow">
          <img src="/contact-illustration.png" alt="Contact us" className="contact-illust-img" />
        </div>

        {/* Everything below overlaps the sticky illustration */}
        <div className="contact-overlap-content">
          <div className="contact-layout">
            {/* Contact Info Cards */}
            <div className="contact-info-col">
              {[
                {
                  icon: "📧",
                  title: "Email Us",
                  detail: "support@pulsepost.studio",
                  sub: "We reply within 24 hours",
                },
                {
                  icon: "💬",
                  title: "Live Chat",
                  detail: "Available Mon–Fri",
                  sub: "9 AM – 6 PM IST",
                },
                {
                  icon: "📍",
                  title: "Office",
                  detail: "Bangalore, India",
                  sub: "HQ & Engineering",
                },
              ].map((item, i) => {
                const anims = ["left", "left", "left"];
                return (
                  <div className="contact-info-card" key={i} data-reveal={anims[i]} data-reveal-delay={String(i + 1)}>
                    <div className="contact-info-icon">{item.icon}</div>
                    <div>
                      <h3>{item.title}</h3>
                      <p className="contact-detail">{item.detail}</p>
                      <p className="contact-sub">{item.sub}</p>
                    </div>
                  </div>
                );
              })}

              {/* Socials */}
              <div className="contact-socials-card" data-reveal="up" data-reveal-delay="4">
                <h3>Follow Us</h3>
                <div className="contact-socials-row">
                  {["𝕏", "in", "📸", "▶️"].map((icon, i) => (
                    <a href="#" className="contact-social-link" key={i}>
                      {icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-card" data-reveal="right" data-reveal-delay="2">
              <h2 className="contact-form-heading">Send a Message</h2>
              <p className="contact-form-lead">Fill out the form below and we'll get back to you as soon as possible.</p>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-form-row">
                  <label>
                    <span>Name <span style={{ color: "var(--rose)" }}>*</span></span>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </label>
                  <label>
                    <span>Email <span style={{ color: "var(--rose)" }}>*</span></span>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </label>
                </div>
                <label>
                  <span>Subject</span>
                  <input
                    type="text"
                    name="subject"
                    placeholder="What's this about?"
                    value={form.subject}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  <span>Message <span style={{ color: "var(--rose)" }}>*</span></span>
                  <textarea
                    name="message"
                    rows="5"
                    placeholder="Tell us how we can help..."
                    value={form.message}
                    onChange={handleChange}
                  />
                </label>
                <button type="submit" className="primary-button contact-submit" disabled={loading}>
                  {loading ? "Sending..." : <>Send Message <span className="btn-arrow">→</span></>}
                </button>
                {status && <p className="contact-status">{status}</p>}
              </form>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="contact-faq" data-reveal="up" data-reveal-delay="3">
            <h2 className="section-heading" style={{ marginTop: "80px", marginBottom: "36px" }}>Frequently Asked Questions</h2>
            <div className="faq-grid">
              {[
                { q: "How do I connect my social accounts?", a: "Head to the Dashboard, click 'Connect' on any platform card, and authorize via OAuth. It takes under 30 seconds." },
                { q: "Is there a free plan?", a: "Yes! Our Starter plan is completely free and includes 2 platforms with 10 posts per month." },
                { q: "Can I schedule posts for later?", a: "Absolutely. Pro and Enterprise plans include smart scheduling with AI-recommended optimal posting times." },
                { q: "How does AI caption generation work?", a: "Our AI analyzes your content and generates platform-specific captions optimized for engagement, hashtags, and character limits." },
              ].map((faq, i) => (
                <div className="faq-card" key={i} data-reveal="zoom" data-reveal-delay={String(i + 1)}>
                  <h3>{faq.q}</h3>
                  <p>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
