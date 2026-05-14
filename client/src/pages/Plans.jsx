const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    period: "/ month",
    description: "For creators testing their first multi-platform workflow.",
    badge: "Free",
    cta: "Start Free",
    features: [
      "2 connected platforms",
      "10 posts each month",
      "Basic AI captions",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    period: "/ month",
    description: "For growing creators publishing consistently everywhere.",
    badge: "Most Popular",
    cta: "Get Pro",
    featured: true,
    features: [
      "All 4 supported platforms",
      "Unlimited posts",
      "Advanced AI captions",
      "Smart scheduling",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$49",
    period: "/ month",
    description: "For teams and agencies managing content at scale.",
    badge: "Teams",
    cta: "Contact Sales",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Custom branding",
      "API access",
      "Dedicated support",
    ],
  },
];

export default function Plans({ selectedPlan = "starter", user, onChoosePlan, onContactSales }) {
  return (
    <div style={{ paddingTop: "100px" }}>
      <div className="page-shell plans-page">
        <div className="hero plans-hero">
          <div>
            <p className="eyebrow">Plans</p>
            <h1>Creator Plans</h1>
            <p className="lead">
              Pick the publishing plan that matches how often you post, how many
              platforms you use, and how much support you need.
            </p>
          </div>
          <div className="hero-actions">
            <div className="status-chip plans-status-chip">
              {user ? `Signed in as ${user.name}` : "Start free, upgrade anytime"}
            </div>
          </div>
        </div>

        <div className="plans-grid">
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const cardClass = [
              "pricing-card",
              "plans-card",
              plan.featured ? "pricing-card--featured" : "",
              isSelected ? "plans-card--selected" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div className={cardClass} key={plan.id}>
                <div className="pricing-badge">{plan.badge}</div>
                {isSelected && <div className="plans-selected-label">Selected</div>}
                <h3>{plan.name}</h3>
                <div className="pricing-price">
                  <span className="price-amount">{plan.price}</span>
                  <span className="price-period"> {plan.period}</span>
                </div>
                <p className="pricing-desc">{plan.description}</p>
                <ul className="pricing-features">
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <span className="check-icon">+</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`${plan.featured ? "primary-button" : "ghost-button"} pricing-cta`}
                  onClick={() =>
                    plan.id === "enterprise"
                      ? onContactSales()
                      : onChoosePlan(plan.id)
                  }
                >
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        <div className="panel plans-note">
          <div>
            <p className="eyebrow">Included</p>
            <h2>Every plan keeps your backend connected</h2>
          </div>
          <p>
            Your API connection, auth flow, uploads, analytics, and social
            account routes keep using the same backend. This page only changes
            where users review plans before choosing one.
          </p>
        </div>

        <footer className="app-footer">
          (c) 2026 <span>PulsePost Studio</span> - All rights reserved
        </footer>
      </div>
    </div>
  );
}
