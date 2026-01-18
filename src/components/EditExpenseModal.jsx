import { useState } from "react";

export default function EditExpenseModal({ expense, onClose, onSave }) {
  const [form, setForm] = useState({
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    date: expense.date,
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await onSave({
      ...expense,
      ...form,
      amount: Number(form.amount),
      date: new Date(form.date).toISOString().split("T")[0],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Edit Expense</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Description"
            required
          />

          <input
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {[
              "Food",
              "Transport",
              "Shopping",
              "Bills",
              "Entertainment",
              "Health",
              "Other",
            ].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-purple-600 text-white"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}