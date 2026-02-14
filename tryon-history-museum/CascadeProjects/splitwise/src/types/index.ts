export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  date: string;
  splits: ExpenseSplit[];
  groupId?: string;
}

export interface ExpenseSplit {
  userId: string;
  amount: number;
  paid: boolean;
}

export interface Group {
  id: string;
  name: string;
  members: User[];
  expenses: Expense[];
}

export interface Balance {
  userId: string;
  amount: number;
  isOwed: boolean;
}
