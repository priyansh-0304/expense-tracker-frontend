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

/*
  JSX RULES APPLIED:
  - Removed interface
  - Removed Expense type import
  - Removed Record<> typings
  - Props are plain JS
*/

const categoryIcons = {
  Food: <Utensils className="w-5 h-5" />,
  Transport: <Car className="w-5 h-5" />,
  Shopping: <ShoppingBag className="w-5 h-5" />,
  Bills: <Zap className="w-5 h-5" />,
  Entertainment: <Music className="w-5 h-5" />,
  Health: <Heart className="w-5 h-5" />,
  Other: <MoreHorizontal className="w-5 h-5" />,
};

const categoryColors = {
  Food: "bg-orange-100 text-orange-600",
  Transport: "bg-blue-100 text-blue-600",
  Shopping: "bg-pink-100 text-pink-600",
  Bills: "bg-yellow-100 text-yellow-600",
  Entertainment: "bg-purple-100 text-purple-600",
  Health: "bg-red-100 text-red-600",
  Other: "bg-gray-100 text-gray-600",
};

export default function ExpenseItem({ expense, onDelete }) {
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
      <div
        className={`p-3 rounded-xl shadow-sm ${
          categoryColors[expense.category] || categoryColors.Other
        }`}
      >
        {categoryIcons[expense.category] || categoryIcons.Other}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900">
          {expense.description}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-gray-500">
            {expense.category}
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-sm text-gray-500">
            {formatDate(expense.date)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ${expense.amount.toFixed(2)}
        </span>

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