import React, { useState, useEffect } from 'react';
import { Plus, Users, DollarSign, Home } from 'lucide-react';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { BalanceSummary } from './components/BalanceSummary';
import { User, Expense } from './types';
import { calculateBalances } from './utils/expenseCalculations';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'You', email: 'you@example.com' },
    { id: '2', name: 'Alice', email: 'alice@example.com' },
    { id: '3', name: 'Bob', email: 'bob@example.com' },
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'expenses' | 'balances'>('expenses');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    const savedExpenses = localStorage.getItem('splitwise-expenses');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('splitwise-expenses', JSON.stringify(expenses));
  }, [expenses]);

  const balances = calculateBalances(expenses, users);

  const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
    };
    
    if (editingExpense) {
      setExpenses(prev => prev.map(e => e.id === editingExpense.id ? { ...newExpense, id: editingExpense.id } : e));
      setEditingExpense(null);
    } else {
      setExpenses(prev => [...prev, newExpense]);
    }
    
    setShowExpenseForm(false);
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(prev => prev.filter(e => e.id !== expenseId));
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleCancelExpenseForm = () => {
    setShowExpenseForm(false);
    setEditingExpense(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">Splitwise</h1>
            </div>
            <button
              onClick={() => setShowExpenseForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 font-medium transition-colors ${
                activeTab === 'expenses'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Expenses</span>
            </button>
            <button
              onClick={() => setActiveTab('balances')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 font-medium transition-colors ${
                activeTab === 'balances'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Balances</span>
            </button>
          </div>
        </div>

        {activeTab === 'expenses' ? (
          <ExpenseList
            expenses={expenses}
            users={users}
            onDelete={handleDeleteExpense}
            onEdit={handleEditExpense}
          />
        ) : (
          <BalanceSummary balances={balances} users={users} />
        )}
      </main>

      {showExpenseForm && (
        <ExpenseForm
          users={users}
          onSubmit={handleAddExpense}
          onCancel={handleCancelExpenseForm}
        />
      )}
    </div>
  );
};

export default App;
