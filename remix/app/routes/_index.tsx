import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => [
  { title: "BudgetWise AI — Smart Financial Management" },
  {
    name: "description",
    content:
      "AI-powered budgeting, expense tracking, and personalized financial insights. Take control of your money with BudgetWise AI.",
  },
];

export default function IndexRoute() {
  return (
    <main>
      {/* Hero */}
      <section className="landing-hero">
        <span className="landing-badge">Powered by Cloudflare AI</span>
        <h1>Your Finances, Intelligently Managed</h1>
        <p className="subtitle">
          BudgetWise AI combines smart expense tracking with AI-driven insights
          to help you save more, spend wisely, and plan for the future.
        </p>
        <div className="hero-buttons">
          <Link to="/dashboard" className="btn btn--primary btn--lg">
            Open Dashboard
          </Link>
          <a
            href="https://apps.apple.com"
            className="btn btn--outline btn--lg"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download App
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="features-grid">
        <div className="feature-card">
          <div
            className="feature-icon"
            style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10B981" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h3>Smart Budgeting</h3>
          <p>
            Set category budgets and track spending in real time. Visual progress
            bars show exactly where your money goes each month.
          </p>
        </div>

        <div className="feature-card">
          <div
            className="feature-icon"
            style={{ background: "rgba(139, 92, 246, 0.12)", color: "#8B5CF6" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
              <path d="M20.5 7.5L12 12" />
            </svg>
          </div>
          <h3>AI Categorization</h3>
          <p>
            Transactions are automatically categorized using Cloudflare AI.
            No more manual sorting — let AI do the heavy lifting.
          </p>
        </div>

        <div className="feature-card">
          <div
            className="feature-icon"
            style={{ background: "rgba(6, 182, 212, 0.12)", color: "#06B6D4" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <h3>Monthly Reports</h3>
          <p>
            Get AI-generated monthly financial reports with spending breakdowns,
            trends, and actionable recommendations.
          </p>
        </div>

        <div className="feature-card">
          <div
            className="feature-icon"
            style={{ background: "rgba(244, 114, 182, 0.12)", color: "#F472B6" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3>Advisor Booking</h3>
          <p>
            Book a free 30-minute consultation with a real financial advisor.
            Get personalized guidance on your financial goals.
          </p>
        </div>

        <div className="feature-card">
          <div
            className="feature-icon"
            style={{ background: "rgba(245, 158, 11, 0.12)", color: "#F59E0B" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <h3>Secure by Design</h3>
          <p>
            Built on Cloudflare Workers with D1 database, R2 storage, and
            JWT authentication. Your data never leaves Cloudflare's edge network.
          </p>
        </div>

        <div className="feature-card">
          <div
            className="feature-icon"
            style={{ background: "rgba(248, 250, 252, 0.08)", color: "#F8FAFC" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </div>
          <h3>Mobile + Web</h3>
          <p>
            Native iOS/Android app via Expo plus this web dashboard via Remix.
            Your finances are always within reach.
          </p>
        </div>
      </section>

      {/* API Reference */}
      <section className="api-section">
        <h2>API Endpoints</h2>
        <ul className="api-list">
          <li className="api-item">
            <span className="api-method api-method--post">POST</span>
            /api/auth/register
          </li>
          <li className="api-item">
            <span className="api-method api-method--post">POST</span>
            /api/auth/login
          </li>
          <li className="api-item">
            <span className="api-method api-method--get">GET</span>
            /api/transactions
          </li>
          <li className="api-item">
            <span className="api-method api-method--post">POST</span>
            /api/transactions
          </li>
          <li className="api-item">
            <span className="api-method api-method--post">POST</span>
            /api/ai/categorize
          </li>
          <li className="api-item">
            <span className="api-method api-method--post">POST</span>
            /api/ai/monthly-report
          </li>
          <li className="api-item">
            <span className="api-method api-method--post">POST</span>
            /api/advisor/book
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>BudgetWise AI &middot; Built with Remix + Cloudflare Pages</p>
      </footer>
    </main>
  );
}
