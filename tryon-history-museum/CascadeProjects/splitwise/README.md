# Splitwise Clone

A React-based expense sharing application inspired by Splitwise.

## Features

- Add and manage expenses
- Split expenses equally among multiple users
- Track individual balances
- View settlement suggestions
- Persistent data storage using localStorage
- Responsive design with Tailwind CSS

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Usage

1. **Add Expenses**: Click the "Add Expense" button to create new expenses
2. **View Expenses**: Switch to the "Expenses" tab to see all expenses
3. **Check Balances**: Switch to the "Balances" tab to see who owes whom
4. **Settlements**: The app suggests optimal settlement transactions

## Technologies Used

- React 18
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- LocalStorage for data persistence

## Project Structure

```
src/
├── components/          # React components
│   ├── ExpenseForm.tsx  # Add/edit expense form
│   ├── ExpenseList.tsx  # List of expenses
│   └── BalanceSummary.tsx # Balance overview
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
│   └── expenseCalculations.ts # Balance calculations
├── App.tsx             # Main application component
└── index.tsx           # Application entry point
```
