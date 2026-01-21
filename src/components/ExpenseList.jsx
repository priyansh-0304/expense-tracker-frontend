import ExpenseItem from "./ExpenseItem";

/*
  JSX FIXES APPLIED:
  - Removed Expense import
  - Removed interface
  - Removed type annotations
  - Switched to default import for ExpenseItem
*/

export default function ExpenseList({
  expenses,
  onDeleteExpense,
  onEditExpense,
  selectedExpenseIds = [],
  onToggleSelect,
}) {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          No expenses yet. Add your first expense to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          onDelete={onDeleteExpense}
          onEdit={onEditExpense}
          isSelected={selectedExpenseIds.includes(expense.id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}