import { Expense, Balance, User } from '../types';

export const calculateBalances = (expenses: Expense[], users: User[]): Balance[] => {
  const balances: { [userId: string]: number } = {};
  
  users.forEach(user => {
    balances[user.id] = 0;
  });

  expenses.forEach(expense => {
    const paidBy = expense.paidBy;
    balances[paidBy] += expense.amount;

    expense.splits.forEach(split => {
      balances[split.userId] -= split.amount;
    });
  });

  return Object.entries(balances).map(([userId, amount]) => ({
    userId,
    amount: Math.abs(amount),
    isOwed: amount > 0
  }));
};

export const simplifyDebts = (balances: Balance[]): { from: string; to: string; amount: number }[] => {
  const debtors = balances.filter(b => !b.isOwed).sort((a, b) => b.amount - a.amount);
  const creditors = balances.filter(b => b.isOwed).sort((a, b) => b.amount - a.amount);
  
  const transactions: { from: string; to: string; amount: number }[] = [];
  
  let i = 0, j = 0;
  
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    
    const amount = Math.min(debtor.amount, creditor.amount);
    
    transactions.push({
      from: debtor.userId,
      to: creditor.userId,
      amount
    });
    
    debtor.amount -= amount;
    creditor.amount -= amount;
    
    if (debtor.amount === 0) i++;
    if (creditor.amount === 0) j++;
  }
  
  return transactions;
};

export const splitEqually = (amount: number, userIds: string[]): { userId: string; amount: number; paid: boolean }[] => {
  const shareAmount = amount / userIds.length;
  return userIds.map(userId => ({
    userId,
    amount: shareAmount,
    paid: false
  }));
};

export const splitByPercentage = (
  amount: number, 
  splits: { userId: string; percentage: number }[]
): { userId: string; amount: number; paid: boolean }[] => {
  return splits.map(split => ({
    userId: split.userId,
    amount: (amount * split.percentage) / 100,
    paid: false
  }));
};
