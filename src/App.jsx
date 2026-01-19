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

  // FILTER + SORT
  const [filterCategory, setFilterCategory] = useState(
    () => localStorage.getItem("filterCategory") || "ALL"
  );
  const [sortBy, setSortBy] = useState(
    () => localStorage.getItem("sortBy") || "DATE_DESC"
  );

  // PAGINATION (✅ NEW)
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 5;

  useEffect(() => {
    localStorage.setItem("filterCategory", filterCategory);
  }, [filterCategory]);

  useEffect(() => {
    localStorage.setItem("sortBy", sortBy);
  }, [sortBy]);

  // ---------------- BACKEND VERIFICATION ----------------
  const verifyBackend = async () => {
    await api.get("/expenses");
  };

  // ---------------- INITIAL AUTH CHECK ----------------
  useEffect(() => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      setAuthenticated(false);
      setLoading(false);
      return;
    }

    verifyBackend()
      .then(() => setAuthenticated(true))
      .catch(() => {
        localStorage.removeItem("jwt");
        setAuthenticated(false);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (authenticated) fetchExpenses();
  }, [authenticated]);

  // ---------------- API CALLS ----------------
  const fetchExpenses = async () => {
    const res = await api.get("/expenses");
    setExpenses(res.data);
  };

  const addExpense = async (expense) => {
    const res = await api.post("/expenses", expense);
    setExpenses((prev) => [res.data, ...prev]);
  };

  const deleteExpense = async (id) => {
    await api.delete(`/expenses/${id}`);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const updateExpense = async (expense) => {
    const res = await api.put(`/expenses/${expense.id}`, expense);
    setExpenses((prev) =>
      prev.map((e) => (e.id === expense.id ? res.data : e))
    );
    setEditingExpense(null);
  };

  // ---------------- LOGOUT (UNCHANGED) ----------------
  const handleLogout = () => {
    localStorage.removeItem("jwt");
    setAuthenticated(false);
    setExpenses([]);
    setEditingExpense(null);
  };

  // ---------------- FILTER + SORT ----------------
  const visibleExpenses = [...expenses]
    .filter((e) =>
      filterCategory === "ALL" ? true : e.category === filterCategory
    )
    .sort((a, b) => {
      if (sortBy === "DATE_DESC") return new Date(b.date) - new Date(a.date);
      if (sortBy === "DATE_ASC") return new Date(a.date) - new Date(b.date);
      if (sortBy === "AMOUNT_DESC") return b.amount - a.amount;
      if (sortBy === "AMOUNT_ASC") return a.amount - b.amount;
      return 0;
    });

  // PAGINATED DATA (✅ NEW)
  const totalPages = Math.ceil(visibleExpenses.length / PAGE_SIZE);
  const paginatedExpenses = visibleExpenses.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE
  );

  // ---------------- UI STATES ----------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking backend…</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Login
          onSuccess={async () => {
            try {
              await verifyBackend();
              setAuthenticated(true);
            } catch {
              alert("Backend is unavailable");
            }
          }}
        />
      </div>
    );
  }

  const categories = [
    "Food & Drinks",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health",
    "Other",
  ];

  // ---------------- EXPORT CSV (UNCHANGED) ----------------
  const exportCSV = () => {
    if (!expenses.length) return;

    const headers = ["Title", "Category", "Amount", "Date"];
    const rows = expenses.map((e) => [
      `"${e.title || ""}"`,
      `"${e.category}"`,
      e.amount,
      e.date,
    ]);

    const csv =
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `expenses_${new Date()
      .toISOString()
      .split("T")[0]}.csv`;
    link.click();
  };

  // ---------------- RENDER ----------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <header className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Expense Tracker
            </h1>
            <p className="text-gray-600">Manage your spending wisely</p>
          </div>

          <div>
            <button
              onClick={exportCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl"
            >
              Export CSV
            </button>

            <button
              onClick={handleLogout}
              className="ml-3 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl"
            >
              Logout
            </button>
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
              expenses={paginatedExpenses}
              onDeleteExpense={deleteExpense}
              onEditExpense={(e) => setEditingExpense(e)}
            />

            {/* PAGINATION UI (✅ NEW) */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 rounded-lg border disabled:opacity-50"
                >
                  Prev
                </button>

                <span className="text-sm text-gray-600">
                  Page {page + 1} of {totalPages}
                </span>

                <button
                  disabled={page === totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-lg border disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
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