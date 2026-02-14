import React from 'react';
import { ArrowUpRight, ArrowDownRight, Users } from 'lucide-react';
import { Balance, User } from '../types';
import { simplifyDebts } from '../utils/expenseCalculations';

interface BalanceSummaryProps {
  balances: Balance[];
  users: User[];
}

export const BalanceSummary: React.FC<BalanceSummaryProps> = ({ balances, users }) => {
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown';
  };

  const totalOwed = balances
    .filter(b => b.isOwed)
    .reduce((sum, b) => sum + b.amount, 0);

  const totalOwe = balances
    .filter(b => !b.isOwed)
    .reduce((sum, b) => sum + b.amount, 0);

  const simplifiedTransactions = simplifyDebts(balances);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">You are owed</p>
              <p className="text-2xl font-bold text-green-700">
                ${totalOwed.toFixed(2)}
              </p>
            </div>
            <ArrowUpRight className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">You owe</p>
              <p className="text-2xl font-bold text-red-700">
                ${totalOwe.toFixed(2)}
              </p>
            </div>
            <ArrowDownRight className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Individual Balances
        </h3>
        <div className="space-y-2">
          {balances.map(balance => {
            const userName = getUserName(balance.userId);
            return (
              <div key={balance.userId} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="font-medium">{userName}</span>
                <span className={`font-semibold ${balance.isOwed ? 'text-green-600' : 'text-red-600'}`}>
                  {balance.isOwed ? '+' : '-'}${balance.amount.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {simplifiedTransactions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-3">Suggested Settlements</h3>
          <div className="space-y-2">
            {simplifiedTransactions.map((transaction, index) => (
              <div key={index} className="flex justify-between items-center py-2 bg-white rounded px-3">
                <span className="text-sm">
                  {getUserName(transaction.from)} → {getUserName(transaction.to)}
                </span>
                <span className="font-semibold text-blue-600">
                  ${transaction.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
