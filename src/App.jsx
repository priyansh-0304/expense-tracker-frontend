import { useEffect, useState, useRef } from "react";
import api from "./api";

import ExpenseList from "./components/ExpenseList";
import ExpenseSummary from "./components/ExpenseSummary";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseCharts from "./components/ExpenseCharts";
import MonthlyBudget from "./components/MonthlyBudget";
import Login from "./pages/Login";
import EditExpenseModal from "./components/EditExpenseModal";
import ExpenseInsights from "./components/ExpenseInsights";
import ExpenseAlerts from "./components/ExpenseAlerts";
import ExpenseListSkeleton from "./components/ExpenseListSkeleton";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  
  const [totalPages, setTotalPages] = useState(0);
  const [authenticated, setAuthenticated] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [search, setSearch] = useState("");

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [activeQuickFilter, setActiveQuickFilter] = useState(null);

  const [selectedExpenseIds, setSelectedExpenseIds] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);
  const deleteTimeoutRef = useRef(null);

  const [exportScope, setExportScope] = useState("view");
  const [showExportModal, setShowExportModal] = useState(false);
  const [tempExportScope, setTempExportScope] = useState(exportScope);

  const monthlyExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return (
      d.getMonth() === selectedMonth &&
      d.getFullYear() === selectedYear
    );
  });

  const analyticsExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    const now = new Date();
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    return diff <= 14;
  });

  const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // FILTER + SORT
  const [filterCategory, setFilterCategory] = useState(
    () => localStorage.getItem("filterCategory") || "ALL"
  );
  const [sortBy, setSortBy] = useState(
    () => localStorage.getItem("sortBy") || "DATE_DESC"
  );

  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const searchedExpenses = expenses.filter((e) =>
    e.title?.toLowerCase().includes(search.toLowerCase())
  );

  // Backend verification and login
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      setAuthenticated(false);
      setInitializing(false);
      return;
    }
    api.get("/actuator/health")
      .then(() => setAuthenticated(true))
      .catch(() => {
        localStorage.removeItem("jwt");
        setAuthenticated(false);
      })
      .finally(() => setInitializing(false));
  }, []);

  // Table data fetch (pagination and filters)
  useEffect(() => {
    if (!authenticated) return;
    fetchExpenses();
  }, [authenticated, page, filterCategory, sortBy]);

  // Persist filter/sort to localStorage
  useEffect(() => {
    localStorage.setItem("filterCategory", filterCategory);
  }, [filterCategory]);
  useEffect(() => {
    localStorage.setItem("sortBy", sortBy);
  }, [sortBy]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      if (cmdOrCtrl && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setSelectedExpenseIds(searchedExpenses.map((e) => e.id));
      }
      if (cmdOrCtrl && e.key.toLowerCase() === "z" && pendingDelete) {
        e.preventDefault();
        undoBulkDelete();
      }
      if (
        cmdOrCtrl &&
        e.key === "Backspace" &&
        selectedExpenseIds.length > 0
      ) {
        e.preventDefault();
        bulkDeleteExpenses();
        clearSelection();
      }
      if (e.key === "Escape") {
        clearSelection();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchedExpenses, pendingDelete, selectedExpenseIds]);

  // ---- API ----
  async function fetchExpenses() {
    setLoading(true);
    try {
      let sortField = "createdAt";
      let sortDir = "desc";
      if (sortBy === "DATE_ASC") {
        sortDir = "asc";
      } else if (sortBy === "AMOUNT_DESC") {
        sortField = "amount";
        sortDir = "desc";
      } else if (sortBy === "AMOUNT_ASC") {
        sortField = "amount";
        sortDir = "asc";
      }
      const params = {
        page,
        size: PAGE_SIZE,
        sortBy: sortField,
        sortDir
      };
      if (filterCategory && filterCategory !== "ALL") {
        params.category = filterCategory;
      }
      if (fromDate) {
        params.from =
          typeof fromDate === "string"
            ? fromDate
            : new Date(fromDate).toISOString().split("T")[0];
      }
      if (toDate) {
        params.to =
          typeof toDate === "string"
            ? toDate
            : new Date(toDate).toISOString().split("T")[0];
      }
      const res = await api.get("/expenses/filter", { params });
      setExpenses(Array.isArray(res.data?.content) ? res.data.content : []);
      setTotalPages(Number.isInteger(res.data?.totalPages) ? res.data.totalPages : 0);
    } catch (err) {
      console.error("fetchExpenses failed:", err);
      setExpenses([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }

  function applyQuickFilter(type) {
    const { from, to } = getDateRange(type);

    // Reset conflicting state FIRST
    setActiveQuickFilter(type);
    setFilterCategory("ALL");
    localStorage.setItem("filterCategory", "ALL");
    setSearch("");
    setPage(0);

    // Set dates together
    setFromDate(from);
    setToDate(to);

    if (type === "month") {
      const now = new Date();
      setSelectedMonth(now.getMonth());
      setSelectedYear(now.getFullYear());
    }

    // 🔑 fetch ONLY ONCE with final state
    setTimeout(fetchExpenses, 0);
  }

  function getDateRange(type) {
    const today = new Date();
    let from = null;
    let to = today;
    switch (type) {
      case "today":
        from = today;
        break;
      case "week":
        from = new Date();
        from.setDate(today.getDate() - 6);
        break;
      case "month":
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "30days":
        from = new Date();
        from.setDate(today.getDate() - 29);
        break;
      default:
        return { from: null, to: null };
    }
    return {
      from: from.toISOString().split("T")[0],
      to: to.toISOString().split("T")[0]
    };
  }

  // ---- CRUD and analytics fetch triggers ----
  async function addExpense(expense) {
    await api.post("/expenses", expense);

    // reset to first page so new expense is visible
    setPage(0);

    // refetch from backend (filters, sorting stay correct)
    await fetchExpenses();
  }

  async function deleteExpense(id) {
    const deleted = expenses.find((e) => e.id === id);
    if (!deleted) return;

    await api.delete(`/expenses/${id}`);

    // optimistic UI removal
    setExpenses((prev) => prev.filter((e) => e.id !== id));

    // reuse SAME undo system as bulk delete
    setPendingDelete([deleted]);

    deleteTimeoutRef.current = setTimeout(() => {
      setPendingDelete(null);
      fetchExpenses(); // 🔑 resync after undo window expires
    }, 5000);
  }

  async function updateExpense(expense) {
    await api.put(`/expenses/${expense.id}`, expense);

    setEditingExpense(null);

    // refetch to keep charts, insights, pagination in sync
    await fetchExpenses();
  }

  function toggleSelectExpense(id) {
    setSelectedExpenseIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  }

  function clearSelection() {
    setSelectedExpenseIds([]);
  }

  async function bulkDeleteExpenses() {
    const toDelete = expenses.filter((e) =>
      selectedExpenseIds.includes(e.id)
    );

    await Promise.all(
      selectedExpenseIds.map((id) => api.delete(`/expenses/${id}`))
    );

    setExpenses((prev) =>
      prev.filter((e) => !selectedExpenseIds.includes(e.id))
    );

    setPendingDelete(toDelete);

    deleteTimeoutRef.current = setTimeout(() => {
      setPendingDelete(null);
    }, 5000);

    setSelectedExpenseIds([]);
  }

  function undoBulkDelete() {
    if (!pendingDelete) return;
    clearTimeout(deleteTimeoutRef.current);
    setExpenses(prev => [...pendingDelete, ...prev]);
    
    setPendingDelete(null);
  }

  function handleLogout() {
    localStorage.removeItem("jwt");
    setAuthenticated(false);
    setExpenses([]);
    setEditingExpense(null);
  }

  const categories = [
    "Food & Drinks",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health",
    "Other"
  ];

  // CSV Export
  async function exportCSV(scope = exportScope) {
    let data = [];
    if (scope === "view") {
      data = searchedExpenses;
    }
    if (scope === "month") {
      data = monthlyExpenses;
    }
    if (scope === "all") {
      const res = await api.get("/expenses/filter", {
        params: {
          page: 0,
          size: 10000,
          sortBy: "createdAt",
          sortDir: "desc"
        }
      });
      data = res.data.content || [];
    }
    if (!data.length) return;
    const headers = [
      "Title",
      "Category",
      "Amount",
      "Date",
      "Payment Method",
      "Notes"
    ];
    const rows = data.map((e) => [
      `"${e.title || ""}"`,
      `"${e.category}"`,
      e.amount,
      e.date,
      `"${e.paymentMethod || ""}"`,
      `"${e.notes || ""}"`
    ]);
    const csv =
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `expenses_${exportScope}_${new Date()
      .toISOString()
      .split("T")[0]}.csv`;
    link.click();
  }

  // ---- UI ----
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking backend…</p>
      </div>
    );
  }
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-indigo-50">
        <Login
          onSuccess={() => {
            setAuthenticated(true);
          }}
        />
      </div>
    );
  }

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
              onClick={() => {
                setTempExportScope(exportScope);
                setShowExportModal(true);
              }}
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
            <MonthlyBudget expenses={monthlyExpenses} />
            <ExpenseAlerts expenses={monthlyExpenses} budget={3000} />
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

            <div className="flex justify-center gap-3 mb-4 flex-wrap items-center">
              {[
                { label: "Today", key: "today", icon: "🕒" },
                { label: "This Week", key: "week", icon: "📅" },
                { label: "This Month", key: "month", icon: "🗓️" },
                { label: "Last 30 Days", key: "30days", icon: "📈" },
              ].map(({ label, key, icon }) => {
                const isActive = activeQuickFilter === key;

                return (
                  <button
                    key={key}
                    onClick={() => applyQuickFilter(key)}
                    className={`
                      flex items-center gap-2
                      px-5 py-2
                      rounded-full
                      border
                      text-sm font-medium
                      shadow-sm
                      transition-all
                      ${
                        isActive
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-white text-gray-800 border-gray-200 hover:bg-purple-50 hover:border-purple-300"
                      }
                    `}
                  >
                    <span className="text-base">{icon}</span>
                    {label}
                  </button>
                );
              })}

              <button
                onClick={() => {
                  setActiveQuickFilter(null);
                  setFromDate(null);
                  setToDate(null);
                  setSearch("");
                  setPage(0);
                  setFilterCategory("ALL");
                  localStorage.setItem("filterCategory", "ALL");
                  fetchExpenses();
                }}
                className="
                  flex items-center gap-2
                  px-5 py-2
                  rounded-full
                  bg-red-50
                  text-red-600 text-sm font-medium
                  hover:bg-red-100
                  transition-all
                "
              >
                Clear
              </button>
            </div>

            {selectedExpenseIds.length > 0 && (
              <div className="mb-4 flex items-center justify-between bg-purple-50 border border-purple-200 rounded-xl px-4 py-2">
                <span className="text-sm text-purple-700">
                  {selectedExpenseIds.length} selected
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      bulkDeleteExpenses();
                      clearSelection();
                    }}
                    className="text-sm px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700"
                  >
                    Delete selected
                  </button>
                  <button
                    onClick={clearSelection}
                    className="text-sm px-3 py-1 rounded-lg border"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
            {loading ? (
              <ExpenseListSkeleton rows={5} />
            ) : searchedExpenses.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <p className="text-sm font-medium">No expenses found</p>
                <p className="text-xs mt-1">Add an expense to get started</p>
              </div>
            ) : (
              <ExpenseList
                expenses={searchedExpenses}
                onDeleteExpense={deleteExpense}
                onEditExpense={(e) => setEditingExpense(e)}
                selectedExpenseIds={selectedExpenseIds}
                onToggleSelect={toggleSelectExpense}
              />
            )}
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
            <div className="sticky top-6 z-10 mt-6 mb-24">
              <ExpenseInsights expenses={monthlyExpenses} />
            </div>
          </div>
        </div>
        <ExpenseCharts expenses={analyticsExpenses} loading={loading} />
      </div>
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onSave={updateExpense}
          onClose={() => setEditingExpense(null)}
        />
      )}
      {pendingDelete && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-4 z-50">
          <span>{pendingDelete.length} expenses deleted</span>
          <button
            onClick={undoBulkDelete}
            className="font-semibold underline hover:text-purple-300"
          >
            Undo
          </button>
        </div>
      )}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
            <h3 className="text-lg font-semibold">Export Expenses</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="exportScope"
                  value="view"
                  checked={tempExportScope === "view"}
                  onChange={() => setTempExportScope("view")}
                />
                <span>
                  <p className="font-medium">Current View</p>
                  <p className="text-xs text-gray-500">
                    Exports filtered & searched expenses
                  </p>
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="exportScope"
                  value="month"
                  checked={tempExportScope === "month"}
                  onChange={() => setTempExportScope("month")}
                />
                <span>
                  <p className="font-medium">This Month</p>
                  <p className="text-xs text-gray-500">
                    Exports all expenses for selected month
                  </p>
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="exportScope"
                  value="all"
                  checked={tempExportScope === "all"}
                  onChange={() => setTempExportScope("all")}
                />
                <span>
                  <p className="font-medium">All Expenses</p>
                  <p className="text-xs text-gray-500">
                    Exports your entire expense history
                  </p>
                </span>
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-lg border text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setExportScope(tempExportScope);
                  setShowExportModal(false);
                  exportCSV(tempExportScope);
                }}
                className="px-5 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}