import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/utils/auth.server";
import { fetchAll } from "~/utils/db.server";

export const meta: MetaFunction = () => [{ title: "Dashboard | BudgetWise AI" }];

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: string;
  date: string;
}

interface Budget {
  id: string;
  category: string;
  budget_limit: number;
  spent: number;
  month: string;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.env;
  const userId = await requireUserId(request, env);

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [transactions, budgets] = await Promise.all([
    fetchAll<Transaction>(
      env,
      "SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC LIMIT 20",
      [userId]
    ),
    fetchAll<Budget>(
      env,
      "SELECT * FROM budgets WHERE user_id = ? AND month = ?",
      [userId, currentMonth]
    ),
  ]);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return json({
    transactions,
    budgets,
    summary: {
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses,
      month: currentMonth,
    },
  });
}

export default function DashboardRoute() {
  const { transactions, budgets, summary } = useLoaderData<typeof loader>();

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="month-label">{summary.month}</p>
      </header>

      {/* Summary Cards */}
      <section className="summary-cards">
        <div className="card card--income">
          <span className="card-label">Income</span>
          <span className="card-value">${summary.totalIncome.toLocaleString()}</span>
        </div>
        <div className="card card--expense">
          <span className="card-label">Expenses</span>
          <span className="card-value">${summary.totalExpenses.toLocaleString()}</span>
        </div>
        <div className="card card--savings">
          <span className="card-label">Net Savings</span>
          <span className="card-value">${summary.netSavings.toLocaleString()}</span>
        </div>
      </section>

      {/* Advisor CTA */}
      <section className="advisor-cta">
        <div className="advisor-cta-content">
          <div className="advisor-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <h3>Talk to a Real Advisor</h3>
            <p>Free 30-min consultation with a financial expert.</p>
          </div>
        </div>
        <form method="post" action="/api/advisor/book">
          <button type="submit" className="btn btn--primary">
            Book Free Call
          </button>
        </form>
      </section>

      {/* Budgets */}
      {budgets.length > 0 && (
        <section className="section">
          <h2>Budgets</h2>
          <div className="budget-list">
            {budgets.map((b) => {
              const pct = b.budget_limit > 0 ? Math.min((b.spent / b.budget_limit) * 100, 100) : 0;
              return (
                <div key={b.id} className="budget-item">
                  <div className="budget-header">
                    <span>{b.category}</span>
                    <span className="text-muted">
                      ${b.spent.toLocaleString()} / ${b.budget_limit.toLocaleString()}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct > 90 ? "#EF4444" : pct > 70 ? "#F59E0B" : "#10B981",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Transactions */}
      <section className="section">
        <h2>Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-muted">No transactions yet.</p>
        ) : (
          <div className="transaction-list">
            {transactions.map((t) => (
              <div key={t.id} className="transaction-item">
                <div>
                  <span className="transaction-desc">{t.description}</span>
                  <span className="transaction-meta">
                    {t.category} &middot; {t.date}
                  </span>
                </div>
                <span className={t.type === "income" ? "amount-income" : "amount-expense"}>
                  {t.type === "income" ? "+" : "-"}${Math.abs(t.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
