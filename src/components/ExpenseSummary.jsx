import { TrendingUp, Calendar, DollarSign } from "lucide-react";

/*
  JSX FIXES:
  - Removed Expense import
  - Removed interface
  - Removed typed props
  - Plain JS props destructuring
*/

export default function ExpenseSummary({ expenses }) {
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const today = new Date();

  const thisMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return (
      expenseDate.getMonth() === today.getMonth() &&
      expenseDate.getFullYear() === today.getFullYear()
    );
  });

  const monthlyTotal = thisMonthExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const thisWeekExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    return expenseDate >= weekAgo;
  });

  const weeklyTotal = thisWeekExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>

      <div className="space-y-4">
        {/* TOTAL */}
        <div className="relative overflow-hidden p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-blue-100">Total</p>
            </div>
            <p className="text-2xl font-bold text-white">
              ${totalExpenses.toFixed(2)}
            </p>
          </div>
        </div>

        {/* MONTH */}
        <div className="relative overflow-hidden p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-green-100">This Month</p>
            </div>
            <p className="text-2xl font-bold text-white">
              ${monthlyTotal.toFixed(2)}
            </p>
          </div>
        </div>

        {/* WEEK */}
        <div className="relative overflow-hidden p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-purple-100">This Week</p>
            </div>
            <p className="text-2xl font-bold text-white">
              ${weeklyTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}