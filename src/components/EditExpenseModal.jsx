import { useState, useEffect } from "react";

export default function EditExpenseModal({ expense, onClose, onSave }) {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
  });

  // Populate form when expense changes
  useEffect(() => {
    if (!expense) return;

    setForm({
      title: expense.title || "",
      amount: expense.amount ?? "",
      category: expense.category || "",
      date: expense.date
        ? new Date(expense.date).toISOString().split("T")[0]
        : "",
    });
  }, [expense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await onSave({
        id: expense.id,
        title: form.title,
        amount: Number(form.amount),
        category: form.category,
        paymentMethod: expense.paymentMethod || "Cash",
        notes: expense.notes || "",
        date: form.date,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Edit Expense</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Expense name"
            required
          />

          {/* Amount */}
          <input
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            min="0"
            step="0.01"
            required
          />

          {/* Category */}
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            {[
              "Food & Drinks",
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

          {/* Date */}
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />

          {/* Actions */}
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