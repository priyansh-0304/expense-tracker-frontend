import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { useState } from 'react';
import { PieChartIcon, BarChart3, TrendingUp } from 'lucide-react';

/* ---- CATEGORY COLORS ---- */
const COLORS = {
  Food: '#f97316',
  Transport: '#3b82f6',
  Shopping: '#ec4899',
  Bills: '#eab308',
  Entertainment: '#a855f7',
  Health: '#ef4444',
  Other: '#6b7280',
};

/* ---- CATEGORY NORMALIZER ---- */
const normalizeCategory = (category) => {
  if (category === 'Food & Drinks') return 'Food';
  return category || 'Other';
};

export default function ExpenseCharts({ expenses }) {
  const [chartType, setChartType] = useState('pie');

  if (!expenses || expenses.length === 0) {
    return null;
  }

  /* ---- CATEGORY TOTALS ---- */
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = normalizeCategory(expense.category);
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {});

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2)),
  }));

  const barData = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category,
      amount: Number(amount.toFixed(2)),
    }))
    .sort((a, b) => b.amount - a.amount);

  /* ---- DAILY TREND ---- */
  const dailyExpenses = expenses.reduce((acc, expense) => {
    const date = expense.date;
    acc[date] = (acc[date] || 0) + expense.amount;
    return acc;
  }, {});

  const trendData = Object.entries(dailyExpenses)
    .map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      amount: Number(amount.toFixed(2)),
    }))
    .slice(-14);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>

        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setChartType('pie')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md ${
              chartType === 'pie'
                ? 'bg-white shadow-sm text-purple-600'
                : 'text-gray-600'
            }`}
          >
            <PieChartIcon className="w-4 h-4" />
            Pie
          </button>

          <button
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md ${
              chartType === 'bar'
                ? 'bg-white shadow-sm text-purple-600'
                : 'text-gray-600'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Bar
          </button>

          <button
            onClick={() => setChartType('trend')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md ${
              chartType === 'trend'
                ? 'bg-white shadow-sm text-purple-600'
                : 'text-gray-600'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Trend
          </button>
        </div>
      </div>

      {chartType === 'pie' && (
        <>
          <p className="text-sm text-gray-600 mb-4">Spending by Category</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[entry.name] || COLORS.Other}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `$${v}`} />
            </PieChart>
          </ResponsiveContainer>
        </>
      )}

      {chartType === 'bar' && (
        <>
          <p className="text-sm text-gray-600 mb-4">Category Comparison</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(v) => `$${v}`} />
              <Bar dataKey="amount">
                {barData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[entry.category] || COLORS.Other}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </>
      )}

      {chartType === 'trend' && (
        <>
          <p className="text-sm text-gray-600 mb-4">
            Daily Spending Trend (Last 14 Days)
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(v) => `$${v}`} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}