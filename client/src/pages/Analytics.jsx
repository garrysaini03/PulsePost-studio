import { useEffect, useState } from "react";
import { api } from "../api";

const PLATFORMS = [
  { key: "facebook", label: "Facebook", icon: "FB", color: "#1877F2" },
  { key: "instagram", label: "Instagram", icon: "IG", color: "#E4405F" },
  { key: "youtube", label: "YouTube", icon: "YT", color: "#FF0000" },
  { key: "Tiktok", label: "Tiktok", icon: "YT", color: "#FF0000" },
];

function formatNum(value) {
  const number = Number(value || 0);
  if (number >= 1000000) return (number / 1000000).toFixed(1) + "M";
  if (number >= 1000) return (number / 1000).toFixed(1) + "K";
  return String(number);
}

function formatDate(value) {
  if (!value) return "Not available";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MiniBarChart({ data, color, labels }) {
  const max = Math.max(...data, 1);

  return (
    <div className="mini-chart">
      {data.map((value, index) => (
        <div className="mini-chart-col" key={`${labels[index]}-${index}`}>
          <div
            className="mini-chart-bar"
            style={{
              height: `${Math.max((value / max) * 100, value > 0 ? 12 : 2)}%`,
              background: color,
            }}
            title={`${labels[index]}: ${formatNum(value)} published`}
          />
          <span className="mini-chart-label">{labels[index]}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ datasets, labels }) {
  const allValues = datasets.flatMap((dataset) => dataset.data);
  const max = Math.max(...allValues, 1);
  const width = 640;
  const height = 220;
  const padX = 42;
  const padY = 24;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  function toX(index) {
    return labels.length <= 1 ? padX : padX + (index / (labels.length - 1)) * chartW;
  }

  function toY(value) {
    return padY + chartH - (value / max) * chartH;
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="line-chart-svg">
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
        <g key={pct}>
          <line
            x1={padX}
            y1={toY(max * pct)}
            x2={width - padX}
            y2={toY(max * pct)}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
          <text x={padX - 8} y={toY(max * pct) + 4} textAnchor="end" fill="var(--muted)" fontSize="9">
            {Math.round(max * pct)}
          </text>
        </g>
      ))}

      {labels.map((label, index) => (
        <text key={label} x={toX(index)} y={height - 4} textAnchor="middle" fill="var(--muted)" fontSize="9">
          {index % 2 === 0 || labels.length <= 7 ? label : ""}
        </text>
      ))}

      {datasets.map((dataset) => {
        const points = dataset.data.map((value, index) => `${toX(index)},${toY(value)}`).join(" ");
        return (
          <g key={dataset.label}>
            <polyline
              points={points}
              fill="none"
              stroke={dataset.color}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 6px ${dataset.color}55)` }}
            />
            {dataset.data.map((value, index) => (
              <circle key={`${dataset.label}-${index}`} cx={toX(index)} cy={toY(value)} r="3.5" fill={dataset.color}>
                <title>{`${dataset.label}: ${value}`}</title>
              </circle>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

function SuccessRing({ value }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="analytics-ring-wrap">
      <svg viewBox="0 0 140 140" className="analytics-ring">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="var(--emerald)"
          strokeWidth="14"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
        />
        <text x="70" y="66" textAnchor="middle" fill="var(--ink)" fontSize="24" fontWeight="700">
          {value}%
        </text>
        <text x="70" y="88" textAnchor="middle" fill="var(--muted)" fontSize="10">
          Success
        </text>
      </svg>
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const response = await api.getAnalytics();
        if (response.success) {
          setData(response.data);
          setError("");
        } else {
          setError(response.message || "Failed to load analytics");
        }
      } catch (err) {
        setError(err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ paddingTop: "100px", textAlign: "center", color: "var(--ink-secondary)" }}>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ paddingTop: "100px", textAlign: "center", color: "var(--rose)" }}>
        <p>{error}</p>
      </div>
    );
  }

  const totals = data.totals || {};
  const platformStats = data.platformStats || [];

  return (
    <div style={{ paddingTop: "100px" }}>
      <div className="page-shell">
        <div className="hero">
          <div>
            <p className="eyebrow">Analytics</p>
            <h1>Publishing Health</h1>
            <p className="lead">
              See what published, what failed, and where each platform stands.
            </p>
          </div>
          <div className="hero-actions">
            <div className="status-chip">
              {data.hasData ? `${formatNum(totals.totalPosts)} posts tracked` : "No posts yet"}
            </div>
          </div>
        </div>

        {!data.hasData && (
          <div className="panel analytics-empty">
            <p className="eyebrow">Fresh Workspace</p>
            <h2>No publishing data yet</h2>
            <p>
              Analytics will populate after you upload media and publish to Facebook, Instagram, or YouTube.
            </p>
          </div>
        )}

        <div className="analytics-overview">
          {[
            { label: "Posts Created", value: formatNum(totals.totalPosts), note: "All composer posts" },
            { label: "Published", value: formatNum(totals.totalPublished), note: "Successful platform results" },
            { label: "Failed", value: formatNum(totals.totalFailed), note: "Needs attention" },
            { label: "Scheduled", value: formatNum(totals.scheduledPosts), note: "Waiting in queue" },
          ].map((stat) => (
            <div className="analytics-stat-card" key={stat.label}>
              <div>
                <p className="analytics-stat-label">{stat.label}</p>
                <p className="analytics-stat-value">{stat.value}</p>
                <span className="analytics-stat-change neutral">{stat.note}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="analytics-charts-row">
          <div className="panel analytics-chart-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Last 14 Days</p>
                <h2>Published Results</h2>
              </div>
            </div>
            <div className="analytics-chart-container">
              <LineChart
                labels={data.labels || []}
                datasets={platformStats.map((platform) => ({
                  label: platform.label,
                  color: platform.color,
                  data: platform.chartData,
                }))}
              />
              <div className="chart-legend">
                {platformStats.map((platform) => (
                  <span key={platform.key} className="chart-legend-item">
                    <span className="chart-legend-dot" style={{ background: platform.color }} />
                    {platform.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="panel analytics-donut-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Reliability</p>
                <h2>Publish Success Rate</h2>
              </div>
            </div>
            <SuccessRing value={totals.successRate || 0} />
            <div className="analytics-ring-stats">
              <span>{formatNum(totals.totalPublished)} successful</span>
              <span>{formatNum(totals.totalFailed)} failed</span>
              <span>{formatNum(totals.totalPending)} pending</span>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Platforms</p>
              <h2>Publishing Breakdown</h2>
            </div>
          </div>
          <div className="analytics-platform-grid">
            {platformStats.map((platform) => (
              <div className="analytics-platform-card" key={platform.key}>
                <div className="analytics-platform-header" style={{ background: platform.gradient }}>
                  <span className="analytics-platform-icon">{platform.icon}</span>
                  <span className="analytics-platform-name">{platform.label}</span>
                </div>
                <div className="analytics-platform-body">
                  <div className="analytics-platform-stats">
                    <div className="analytics-platform-stat">
                      <span className="analytics-platform-stat-val">{formatNum(platform.published)}</span>
                      <span className="analytics-platform-stat-label">Published</span>
                    </div>
                    <div className="analytics-platform-stat">
                      <span className="analytics-platform-stat-val">{formatNum(platform.failed)}</span>
                      <span className="analytics-platform-stat-label">Failed</span>
                    </div>
                    <div className="analytics-platform-stat">
                      <span className="analytics-platform-stat-val">{platform.successRate}%</span>
                      <span className="analytics-platform-stat-label">Success</span>
                    </div>
                  </div>
                  <MiniBarChart data={platform.chartData} color={platform.color} labels={data.labels || []} />
                  <div className="analytics-platform-growth">
                    <span className={platform.failed > 0 ? "negative" : "positive"}>
                      {platform.failed > 0 ? "Review failures" : "Healthy"}
                    </span>
                    <span className="analytics-platform-growth-label">
                      {formatNum(platform.selected)} selected post{platform.selected === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Recent</p>
              <h2>Latest Publish Results</h2>
            </div>
          </div>
          <div className="analytics-posts-table">
            <div className="analytics-table-header analytics-results-header">
              <span>Post</span>
              <span>Platform</span>
              <span>Status</span>
              <span>Media</span>
              <span>Updated</span>
            </div>
            {(data.recentPosts || []).map((post, index) => {
              const platform = PLATFORMS.find((item) => item.key === post.platform);
              return (
                <div className="analytics-table-row analytics-results-row" key={`${post.title}-${index}`}>
                  <span className="analytics-table-title">
                    {post.title}
                    {post.message && <small>{post.message}</small>}
                  </span>
                  <span className="analytics-table-platform">
                    <span
                      className="analytics-table-plat-badge"
                      style={{
                        background: `${platform?.color || "#8b5cf6"}20`,
                        color: platform?.color || "var(--accent)",
                        borderColor: `${platform?.color || "#8b5cf6"}40`,
                      }}
                    >
                      {platform?.icon || "--"} {platform?.label || "Pending"}
                    </span>
                  </span>
                  <span className={`analytics-status-pill ${post.status}`}>{post.status}</span>
                  <span className="analytics-table-num">{post.mediaResourceType || "media"}</span>
                  <span className="analytics-table-date">{formatDate(post.date)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <footer className="app-footer">
          © 2026 <span>PulsePost Studio</span> — All rights reserved
        </footer>
      </div>
    </div>
  );
}
