import { useState } from "react";

import ExpenseList from "./components/ExpenseList.jsx";
import ExpenseSummary from "./components/ExpenseSummary.jsx";
import ExpenseForm from "./components/ExpenseForm.jsx";
import ExpenseCharts from "./components/ExpenseCharts.jsx";
export default function App() {
  const [expenses, setExpenses] = useState([]);

  const addExpense = (expense) => {
    setExpenses([{ id: Date.now().toString(), ...expense }, ...expenses]);
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const categories = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <header className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow">
          <h1 className="text-3xl font-bold">Expense Tracker</h1>
          <p className="text-gray-600">Manage your spending wisely</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <ExpenseForm onAddExpense={addExpense} categories={categories} />
            <ExpenseSummary expenses={expenses} />
          </div>

          <div className="lg:col-span-2 bg-white/80 rounded-2xl p-6 shadow">
            <h2 className="text-xl font-semibold mb-4">Recent Expenses</h2>
            <ExpenseList expenses={expenses} onDeleteExpense={deleteExpense} />
          </div>
        </div>

        {expenses.length > 0 && <ExpenseCharts expenses={expenses} />}
      </div>
    </div>
  );
}