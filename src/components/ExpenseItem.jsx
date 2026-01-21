import {
  Trash2,
  ShoppingBag,
  Car,
  Utensils,
  Zap,
  Music,
  Heart,
  MoreHorizontal,
} from "lucide-react";

const categoryIcons = {
  "Food & Drinks": <Utensils className="w-5 h-5" />,
  Food: <Utensils className="w-5 h-5" />,
  Transport: <Car className="w-5 h-5" />,
  Shopping: <ShoppingBag className="w-5 h-5" />,
  Bills: <Zap className="w-5 h-5" />,
  Entertainment: <Music className="w-5 h-5" />,
  Health: <Heart className="w-5 h-5" />,
  Other: <MoreHorizontal className="w-5 h-5" />,
};

const categoryColors = {
  "Food & Drinks": "bg-orange-100 text-orange-600",
  Food: "bg-orange-100 text-orange-600",
  Transport: "bg-blue-100 text-blue-600",
  Shopping: "bg-pink-100 text-pink-600",
  Bills: "bg-yellow-100 text-yellow-600",
  Entertainment: "bg-purple-100 text-purple-600",
  Health: "bg-red-100 text-red-600",
  Other: "bg-gray-100 text-gray-600",
};

export default function ExpenseItem({
  expense,
  onDelete,
  onEdit,
  isSelected,
  onToggleSelect,
}) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all group hover:border-purple-200">
      {/* ✅ Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelect(expense.id)}
        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
      />

      {/* Icon */}
      <div
        className={`p-3 rounded-xl shadow-sm ${
          categoryColors[expense.category] || categoryColors.Other
        }`}
      >
        {categoryIcons[expense.category] || categoryIcons.Other}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900">{expense.title}</p>

        {/* Payment Method */}
        {expense.paymentMethod && (
          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
            {expense.paymentMethod}
          </span>
        )}

        {/* Notes */}
        {expense.notes && (
          <p className="text-sm text-gray-500 mt-1 truncate">
            {expense.notes}
          </p>
        )}

        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-gray-500">{expense.category}</span>
          <span className="text-gray-300">•</span>
          <span className="text-sm text-gray-500">
            {formatDate(expense.date)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ${expense.amount.toFixed(2)}
        </span>

        <button
          onClick={() => onEdit && onEdit(expense)}
          className="px-3 py-1 text-sm rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all opacity-0 group-hover:opacity-100"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(expense.id)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
          aria-label="Delete expense"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}