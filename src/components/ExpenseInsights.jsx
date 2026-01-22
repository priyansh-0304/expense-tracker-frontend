import {
  TrendingUp,
  DollarSign,
  Calendar,
} from "lucide-react";

export default function ExpenseInsights({ expenses }) {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 text-center text-gray-500">
        <p className="text-sm font-medium">No insights yet</p>
        <p className="text-xs mt-1">
          Add expenses to unlock spending insights
        </p>
      </div>
    );
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const avg = total / expenses.length;

  const categoryTotals = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] =
      (categoryTotals[e.category] || 0) + e.amount;
  });

  const topCategory = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const largestExpense = expenses.reduce((max, e) =>
    e.amount > max.amount ? e : max
  );

  const lastMonthTotal = 0;
  const changePercent =
    lastMonthTotal === 0 ? 0 : ((total - lastMonthTotal) / lastMonthTotal) * 100;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Insights</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5 bg-blue-50">
          <div className="flex items-center gap-2 text-gray-700">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>VS Last Month</span>
          </div>
          <div className="text-4xl font-bold text-green-600 mt-2">
            {changePercent.toFixed(1)}%
          </div>
          <p className="text-gray-500 mt-1">
            Last month: ${lastMonthTotal.toFixed(2)}
          </p>
        </div>

        <div className="rounded-2xl p-5 bg-purple-50">
          <div className="flex items-center gap-2 text-gray-700">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <span>Avg. Expense</span>
          </div>
          <div className="text-4xl font-bold text-purple-600 mt-2">
            ${avg.toFixed(2)}
          </div>
          <p className="text-gray-500 mt-1">Per transaction</p>
        </div>

        <div className="rounded-2xl p-5 bg-yellow-50">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-5 h-5 text-orange-600" />
            <span>Top Category</span>
          </div>
          <div className="text-3xl font-bold text-orange-600 mt-2">
            {topCategory?.[0]}
          </div>
          <p className="text-gray-500 mt-1">
            ${topCategory?.[1].toFixed(2)} spent
          </p>
        </div>

        <div className="rounded-2xl p-5 bg-red-50">
          <div className="flex items-center gap-2 text-gray-700">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <span>Largest</span>
          </div>
          <div className="text-3xl font-bold text-red-600 mt-2">
            ${largestExpense.amount.toFixed(2)}
          </div>
          <p className="text-gray-500 mt-1">{largestExpense.title}</p>
        </div>
      </div>
    </div>
  );
}