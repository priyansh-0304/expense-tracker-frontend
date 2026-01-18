import { useEffect, useState } from "react";
import api from "./api";

import ExpenseList from "./components/ExpenseList";
import ExpenseSummary from "./components/ExpenseSummary";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseCharts from "./components/ExpenseCharts";
import MonthlyBudget from "./components/MonthlyBudget";
import Login from "./pages/Login";
import EditExpenseModal from "./components/EditExpenseModal";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);

  // ---------------- AUTH CHECK ----------------
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      setLoading(false);
      return;
    }

    fetchExpenses()
      .then(() => setAuthenticated(true))
      .catch(() => {
        localStorage.removeItem("jwt");
        setAuthenticated(false);
      })
      .finally(() => setLoading(false));
  }, []);

  // ---------------- API CALLS ----------------
  const fetchExpenses = async () => {
    const res = await api.get("/expenses");
    setExpenses(res.data);
  };

  const addExpense = async (expense) => {
    const payload = {
      ...expense,
      date: new Date(expense.date).toISOString().split("T")[0],
    };

    const res = await api.post("/expenses", payload);
    setExpenses((prev) => [res.data, ...prev]);
  };

  const deleteExpense = async (id) => {
    await api.delete(`/expenses/${id}`);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // ✅ FIXED UPDATE (THIS WAS THE BUG)
  const updateExpense = async (expense) => {
    const payload = {
      ...expense,
      title: expense.title, // ✅ DO NOT USE description
      date: new Date(expense.date).toISOString().split("T")[0],
    };

    const res = await api.put(`/expenses/${expense.id}`, payload);

    setExpenses((prev) =>
      prev.map((e) => (e.id === expense.id ? res.data : e))
    );

    setEditingExpense(null);
  };

  // ---------------- UI STATES ----------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading…</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Login
          onSuccess={async () => {
            setAuthenticated(true);
            await fetchExpenses();
          }}
        />
      </div>
    );
  }

  // ---------------- CONSTANTS ----------------
  const categories = [
    "Food & Drinks",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health",
    "Other",
  ];

  // ---------------- RENDER ----------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <header className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12h-4a2 2 0 000 4h4v-4z"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Expense Tracker
              </h1>
              <p className="text-gray-600">Manage your spending wisely</p>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <ExpenseForm onAddExpense={addExpense} categories={categories} />
            <MonthlyBudget expenses={expenses} />
            <ExpenseSummary expenses={expenses} />
          </div>

          <div className="lg:col-span-2 bg-white/80 rounded-2xl p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Expenses</h2>
            <ExpenseList
              expenses={expenses}
              onDeleteExpense={deleteExpense}
              onEditExpense={(expense) => setEditingExpense(expense)}
            />
          </div>
        </div>

        {expenses.length > 0 && <ExpenseCharts expenses={expenses} />}
      </div>

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onSave={updateExpense}
          onClose={() => setEditingExpense(null)}
        />
      )}
    </div>
  );
}