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
      <div className="py-12 text-center text-gray-500">
        <p className="text-sm">No expenses found</p>
        <p className="text-xs mt-1">Add an expense to see insights</p>
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