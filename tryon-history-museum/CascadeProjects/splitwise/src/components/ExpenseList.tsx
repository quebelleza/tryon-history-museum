import React from 'react';
import { Trash2, Edit2, DollarSign } from 'lucide-react';
import { Expense, User } from '../types';

interface ExpenseListProps {
  expenses: Expense[];
  users: User[];
  onDelete: (expenseId: string) => void;
  onEdit: (expense: Expense) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, users, onDelete, onEdit }) => {
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-3">
      {expenses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No expenses yet</p>
          <p className="text-sm">Add your first expense to get started</p>
        </div>
      ) : (
        expenses.map(expense => (
          <div key={expense.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{expense.description}</h3>
                <div className="text-sm text-gray-600 mt-1">
                  <span>Paid by {getUserName(expense.paidBy)}</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(expense.date)}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Split between: {expense.splits.map(split => getUserName(split.userId)).join(', ')}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-lg font-semibold text-gray-900">
                  ${expense.amount.toFixed(2)}
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => onEdit(expense)}
                    className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(expense.id)}
                    className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
