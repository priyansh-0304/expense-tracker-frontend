import { useEffect, useState } from "react";

const DEFAULT_BUDGETS = {
  Food: 5000,
  Transport: 2000,
  Shopping: 3000,
  Bills: 4000,
  Entertainment: 2000,
  Health: 1500,
  Other: 1000,
};

export default function MonthlyBudget({ expenses = [] }) {
  // ---------- LOAD FROM LOCAL STORAGE ONCE ----------
  const [budgets, setBudgets] = useState(() => {
    try {
      const stored = localStorage.getItem("monthlyBudgets");
      return stored ? JSON.parse(stored) : DEFAULT_BUDGETS;
    } catch {
      return DEFAULT_BUDGETS;
    }
  });

  // ---------- SAVE TO LOCAL STORAGE ----------
  useEffect(() => {
    localStorage.setItem("monthlyBudgets", JSON.stringify(budgets));
  }, [budgets]);

  // ---------- DATE CONTEXT ----------
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // ---------- SAFE EXPENSE REDUCE ----------
  const spentByCategory = (Array.isArray(expenses) ? expenses : []).reduce(
    (acc, expense) => {
      if (!expense?.date || !expense?.category) return acc;

      const d = new Date(expense.date);
      if (
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      ) {
        acc[expense.category] =
          (acc[expense.category] || 0) + Number(expense.amount || 0);
      }
      return acc;
    },
    {}
  );

  // ---------- UPDATE BUDGET ----------
  const handleBudgetChange = (category, value) => {
    setBudgets((prev) => ({
      ...prev,
      [category]: Math.max(0, Number(value) || 0),
    }));
  };

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow">
      <h2 className="text-xl font-semibold mb-4">Monthly Budgets</h2>

      <div className="space-y-6">
        {Object.keys(budgets).map((category) => {
          const spent = spentByCategory[category] || 0;
          const limit = budgets[category];
          const percent =
            limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

          return (
            <div key={category}>
              {/* HEADER */}
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{category}</span>

                <input
                  type="number"
                  min="0"
                  value={limit}
                  onChange={(e) =>
                    handleBudgetChange(category, e.target.value)
                  }
                  className="w-28 text-sm px-2 py-1 border rounded-md text-right focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* STATS */}
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Spent: ₹{spent.toFixed(0)}</span>
                <span>Limit: ₹{limit}</span>
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 transition-all rounded-full ${
                    percent < 70
                      ? "bg-green-500"
                      : percent < 100
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* WARNING */}
              {spent > limit && limit > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  Over budget by ₹{(spent - limit).toFixed(0)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}