import { useState, useEffect } from "react";

/*
  NOTE:
  Recurring expenses rely on App.jsx updating `expenses`.
  We emit a global event to allow App.jsx to react (pagination reset, scroll, etc).
*/

const DEFAULT_RECURRING = [
  { id: 1, title: "Rent", amount: 1200, category: "Bills", frequency: "Monthly" },
  { id: 2, title: "Netflix", amount: 15, category: "Bills", frequency: "Monthly" },
  { id: 3, title: "Spotify", amount: 10, category: "Bills", frequency: "Monthly" },
];

export default function RecurringExpenses({ onAddExpense }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem("recurringExpenses");
      return stored ? JSON.parse(stored) : DEFAULT_RECURRING;
    } catch {
      return DEFAULT_RECURRING;
    }
  });

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("Bills");
  const [frequency, setFrequency] = useState("Monthly");

  // persist
  useEffect(() => {
    localStorage.setItem("recurringExpenses", JSON.stringify(items));
  }, [items]);

  const addItem = (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        title,
        amount: Number(amount),
        category,
        frequency,
      },
    ]);

    setTitle("");
    setAmount("");
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const total = items.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-gray-900">
          Recurring Expenses
        </h2>
        {open && (
          <button
            onClick={() => setOpen(false)}
            className="text-sm text-purple-600 hover:underline"
          >
            Cancel
          </button>
        )}
      </div>

      {!open && (
        <>
          <p className="text-sm text-gray-600 mb-4">
            Track subscriptions and recurring payments
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => setOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-2.5 rounded-xl font-medium shadow"
            >
              Add Recurring Expense
            </button>
          </div>
        </>
      )}

      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!title || !amount) return;

            setItems((prev) => [
              ...prev,
              {
                id: Date.now(),
                title,
                amount: Number(amount),
                category,
                frequency,
              },
            ]);

            setTitle("");
            setAmount("");
          }}
          className="mt-4 space-y-3 bg-blue-50/60 p-4 rounded-xl"
        >
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2.5 border rounded-xl"
          />

          <input
            type="text"
            placeholder="Description (e.g. Netflix)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 border rounded-xl"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 border rounded-xl"
          >
            <option>Food & Drinks</option>
            <option>Transport</option>
            <option>Bills</option>
            <option>Shopping</option>
            <option>Entertainment</option>
            <option>Health</option>
            <option>Other</option>
          </select>

          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full px-4 py-2.5 border rounded-xl"
          >
            <option>Daily</option>
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Annually</option>
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium"
          >
            Add
          </button>
        </form>
      )}

      {/* Preview list with Add buttons */}
      {items.length > 0 && (
        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-white border rounded-xl"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-500">
                  ${item.amount.toFixed(2)} / {item.frequency.toLowerCase()}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    const created = await onAddExpense({
                      title: item.title,
                      amount: item.amount,
                      category: item.category,
                      date: new Date().toISOString().split("T")[0],
                    });

                    if (!created) return;

                    // force UX feedback
                    window.dispatchEvent(new Event("expense-added"));
                  }}
                  className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm"
                >
                  Add
                </button>

                <button
                  onClick={() => removeItem(item.id)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}