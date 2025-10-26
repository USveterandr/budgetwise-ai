# BudgetWise - Product Requirements Document

## Goal
Build a privacy-first, explainable personal finance app ("BudgetWise") that helps solopreneurs, business owners, and couples track spending, plan budgets, and save for major life goals (retirement, emergency fund, vacation, college, investments) — with bank statement import and exportable reports.

## Target Users
1. **Solopreneurs**: Track business + personal expenses separately; need tax-ready reports.
2. **Small Business Owners**: Monitor cash flow, categorize business vs. personal spend.
3. **Couples**: Shared budgeting, joint goal tracking, transparency without complexity.

## Jobs-to-be-Done (JTBDs)
- "Help me see where my money goes each month."
- "I want to save $X for retirement by Y without guessing."
- "Automatically categorize my bank transactions so I don't do it manually."
- "Show me if I'm on track for my vacation fund this quarter."
- "Export a clean spending report for my accountant."

## MVP vs. V2 Features

### ✅ MVP Features
- Manual expense entry
- Budget creation per category
- Goal tracking (emergency, vacation, college)
- Simple dashboard: spending vs. budget
- Export to CSV/PDF (monthly report)
- Responsive UI (Next.js + Tailwind)
- Mobile PWA support

### 🔄 V2 Features
- Bank statement import (CSV + Plaid-like connector*)
- Auto-categorization (ML or rule-based)
- Retirement projection (with inflation/ROI assumptions)
- Investment goal tracking (e.g., "$500/mo into index fund")
- Shared budgets (multi-user sync)
- Local-first data (Cloudflare D1)
- End-to-end encryption (optional)

*Note: For MVP, support CSV upload only. Plaid integration deferred to V2 due to compliance/complexity.

## Success Metrics
- **Core**: 80% of active users create ≥1 budget goal in first week
- **Engagement**: Avg. 3+ logins/week (habit formation)
- **Retention**: 40% Day-30 retention
- **Privacy**: 0 PII stored unless explicitly uploaded (e.g., bank CSV)
- **Performance**: <1s dashboard load (cached D1 queries)