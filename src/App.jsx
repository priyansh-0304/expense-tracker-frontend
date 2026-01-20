import { useEffect, useState } from "react";
import api from "./api";

import ExpenseList from "./components/ExpenseList";
import ExpenseSummary from "./components/ExpenseSummary";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseCharts from "./components/ExpenseCharts";
import MonthlyBudget from "./components/MonthlyBudget";
import Login from "./pages/Login";
import EditExpenseModal from "./components/EditExpenseModal";
import ExpenseInsights from "./components/ExpenseInsights";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);

  // ---------------- FILTER + SORT ----------------
  const [filterCategory, setFilterCategory] = useState(
    () => localStorage.getItem("filterCategory") || "ALL"
  );
  const [sortBy, setSortBy] = useState(
    () => localStorage.getItem("sortBy") || "DATE_DESC"
  );

  // ---------------- PAGINATION ----------------
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem("filterCategory", filterCategory);
  }, [filterCategory]);

  useEffect(() => {
    localStorage.setItem("sortBy", sortBy);
  }, [sortBy]);

  // ---------------- BACKEND CHECK ----------------
  const verifyBackend = async () => {
    await api.get("/actuator/health");
  };

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
    if (authenticated) {
      fetchExpenses();          // paginated
      fetchMonthlyExpenses();   // full dataset for analytics
    }
  }, [authenticated, page, filterCategory, sortBy]);

  // ---------------- API ----------------
  const fetchExpenses = async () => {
    let sortField = "createdAt";
    let sortDir = "desc";

    if (sortBy === "DATE_ASC") {
      sortField = "createdAt";
      sortDir = "asc";
    } else if (sortBy === "AMOUNT_DESC") {
      sortField = "amount";
      sortDir = "desc";
    } else if (sortBy === "AMOUNT_ASC") {
      sortField = "amount";
      sortDir = "asc";
    }

    const res = await api.get("/expenses/filter", {
      params: {
        page,
        size: PAGE_SIZE,
        category: filterCategory === "ALL" ? null : filterCategory,
        sortBy: sortField,
        sortDir,
      },
    });

    setExpenses(res.data.content || []);
    setTotalPages(res.data.totalPages || 0);
  };

  const fetchMonthlyExpenses = async () => {
    const res = await api.get("/expenses", {
      params: {
        page: 0,
        size: 1000, // big enough to cover a month
        sortBy: "createdAt",
        sortDir: "desc",
      },
    });

    setMonthlyExpenses(res.data.content || []);
  };

  const addExpense = async (expense) => {
    try {
      const res = await api.post("/expenses", expense); // 👈 api, NOT axios

      fetchExpenses();
      setMonthlyExpenses((prev) => [res.data, ...prev]);
    } catch (err) {
      console.error("Add expense failed:", err);
    }
  };

  const deleteExpense = async (id) => {
    await api.delete(`/expenses/${id}`);

    fetchExpenses();

    // 🔹 keep analytics in sync
    setMonthlyExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const updateExpense = async (expense) => {
    const res = await api.put(`/expenses/${expense.id}`, expense);

    setExpenses((prev) =>
      prev.map((e) => (e.id === expense.id ? res.data : e))
    );

    // 🔹 update analytics data too
    setMonthlyExpenses((prev) =>
      prev.map((e) => (e.id === expense.id ? res.data : e))
    );

    setEditingExpense(null);
  };

  // ---------------- LOGOUT ----------------
  const handleLogout = () => {
    localStorage.removeItem("jwt");
    setAuthenticated(false);
    setExpenses([]);
    setEditingExpense(null);
  };

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

  // ---------------- EXPORT CSV ----------------
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
  const searchedExpenses = expenses.filter((e) =>
    e.title?.toLowerCase().includes(search.toLowerCase())
  );
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Expenses</h2>
              <input
                type="text"
                placeholder="Search expenses..."
                value={search}
                onChange={(e) => {
                  setPage(0);
                  setSearch(e.target.value);
                }}
                className="w-64 px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-3 mb-4">
              <select
                value={filterCategory}
                onChange={(e) => {
                  setPage(0);
                  setFilterCategory(e.target.value);
                }}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => {
                  setPage(0);
                  setSortBy(e.target.value);
                }}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="DATE_DESC">Newest first</option>
                <option value="DATE_ASC">Oldest first</option>
                <option value="AMOUNT_DESC">Highest amount</option>
                <option value="AMOUNT_ASC">Lowest amount</option>
              </select>
            </div>

            <ExpenseList
              expenses={searchedExpenses}
              onDeleteExpense={deleteExpense}
              onEditExpense={(e) => setEditingExpense(e)}
            />
            <ExpenseInsights expenses={monthlyExpenses} />
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

        {monthlyExpenses.length > 0 && (
          <ExpenseCharts expenses={monthlyExpenses} />
        )}
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