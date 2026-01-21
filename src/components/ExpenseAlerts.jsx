import { useEffect, useState } from "react";

export default function ExpenseAlerts({ expenses = [], budgets = {} }) {
  if (!expenses.length) return null;

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
  const STORAGE_KEY = `expense-alerts-${monthKey}`;

  const [dismissed, setDismissed] = useState({});

  // ---------- LOAD DISMISSED STATE (MONTHLY) ----------
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setDismissed(stored ? JSON.parse(stored) : {});
  }, [STORAGE_KEY]);

  const persist = (next) => {
    setDismissed(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  // ---------- CATEGORY TOTALS ----------
  const categoryTotals = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] =
      (categoryTotals[e.category] || 0) + e.amount;
  });

  // ---------- BUDGET ALERTS (RETRIGGER-SAFE) ----------
  const budgetAlerts = Object.entries(budgets)
    .map(([category, limit]) => {
      const spent = categoryTotals[category] || 0;
      if (spent <= limit) return null;

      const overBy = spent - limit;
      const key = `budget-${category}`;
      const last = dismissed[key];

      // 🔹 Retrigger ONLY if:
      // 1. overage increased OR
      // 2. budget changed OR
      // 3. total spent changed
      if (
        last &&
        last.limit === limit &&
        last.spent === spent
      ) {
        return null;
      }

      return { category, limit, overBy, spent };
    })
    .filter(Boolean);

  // ---------- LARGE EXPENSE ALERT (PER EXPENSE) ----------
  const LARGE_EXPENSE_LIMIT = 500;

  const largeExpenseAlerts = expenses
    .filter((e) => e.amount >= LARGE_EXPENSE_LIMIT)
    .filter((e) => {
      const key = `expense-${e.id}`;
      const last = dismissed[key];

      if (!last) return true;

      // retrigger if amount changed
      return last.amount !== e.amount;
    });

  if (!budgetAlerts.length && !largeExpenseAlerts.length) return null;

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 space-y-4">
      <div className="font-semibold text-orange-700">
        ⚠️ Spending Alerts
      </div>

      {/* ---------- BUDGET ALERTS ---------- */}
      {budgetAlerts.map(({ category, limit, overBy, spent }) => (
        <div
          key={category}
          className="flex items-start justify-between gap-4"
        >
          <p className="text-sm text-gray-800">
            <strong>{category}</strong> is over budget by{" "}
            <strong>${overBy.toFixed(2)}</strong>{" "}
            <span className="text-gray-500">
              (limit ${limit})
            </span>
          </p>

          <button
            onClick={() =>
              persist({
                ...dismissed,
                [`budget-${category}`]: {
                  limit,
                  spent,
                },
              })
            }
            className="text-xs underline text-orange-700 hover:text-orange-900"
          >
            Dismiss
          </button>
        </div>
      ))}

      {/* ---------- LARGE EXPENSE ALERT ---------- */}
      {largeExpenseAlerts.map((e) => (
        <div
          key={e.id}
          className="flex items-start justify-between gap-4"
        >
          <p className="text-sm text-gray-800">
            A large expense of{" "}
            <strong>${e.amount.toFixed(2)}</strong>{" "}
            was recorded in{" "}
            <strong>{e.category}</strong>.
          </p>

          <button
            onClick={() =>
              persist({
                ...dismissed,
                [`expense-${e.id}`]: {
                  amount: e.amount,
                },
              })
            }
            className="text-xs underline text-orange-700 hover:text-orange-900"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}