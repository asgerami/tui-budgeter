import React from "react";
import { Transaction, DashboardStats } from "../types";

interface DashboardProps {
  transactions: Transaction[];
}

export default function Dashboard({ transactions }: DashboardProps) {
  const calculateStats = (): DashboardStats => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const currentBalance = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      currentBalance,
      transactionCount: transactions.length,
    };
  };

  const stats = calculateStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getBalanceClass = (balance: number) => {
    if (balance > 0) return "balance-positive";
    if (balance < 0) return "balance-negative";
    return "balance-zero";
  };

  const getCategoryStats = () => {
    const categoryTotals: { [key: string]: number } = {};

    transactions.forEach((transaction) => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = 0;
      }
      categoryTotals[transaction.category] += Math.abs(transaction.amount);
    });

    return Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  const getRecentTransactions = () => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  const categoryStats = getCategoryStats();
  const recentTransactions = getRecentTransactions();

  return (
    <div className="dashboard-stats">
      {/* Main Balance Card */}
      <div className="tui-panel">
        <div className="tui-panel-header">💰 Current Balance</div>
        <div
          className={`balance-display ${getBalanceClass(stats.currentBalance)}`}
        >
          {formatCurrency(stats.currentBalance)}
        </div>
        <div
          style={{
            textAlign: "center",
            color: "var(--ctp-mocha-subtext1)",
            fontSize: "0.9rem",
          }}
        >
          From {stats.transactionCount} transactions
        </div>
      </div>

      {/* Income/Expenses Summary */}
      <div className="tui-panel">
        <div className="tui-panel-header">📈 Summary</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <div>
            <div
              style={{ color: "var(--ctp-mocha-green)", fontWeight: "bold" }}
            >
              💰 Total Income
            </div>
            <div style={{ fontSize: "1.2rem", marginTop: "0.5rem" }}>
              {formatCurrency(stats.totalIncome)}
            </div>
          </div>
          <div>
            <div style={{ color: "var(--ctp-mocha-red)", fontWeight: "bold" }}>
              💸 Total Expenses
            </div>
            <div style={{ fontSize: "1.2rem", marginTop: "0.5rem" }}>
              {formatCurrency(stats.totalExpenses)}
            </div>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="tui-panel">
        <div className="tui-panel-header">📊 Top Categories</div>
        {categoryStats.length > 0 ? (
          <div>
            {categoryStats.map(([category, amount]) => (
              <div
                key={category}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                  padding: "0.5rem",
                  background: "var(--ctp-mocha-surface0)",
                  borderRadius: "0.25rem",
                }}
              >
                <span is-="badge" data-variant="yellow" data-cap="round">
                  {category}
                </span>
                <span style={{ fontWeight: "bold" }}>
                  {formatCurrency(amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No categories yet</p>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="tui-panel">
        <div className="tui-panel-header">🕐 Recent Transactions</div>
        {recentTransactions.length > 0 ? (
          <div>
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                  padding: "0.5rem",
                  background: "var(--ctp-mocha-surface0)",
                  borderRadius: "0.25rem",
                }}
              >
                <div>
                  <div style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
                    <span is-="badge" data-variant="yellow" data-cap="round">
                      {transaction.category}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--ctp-mocha-subtext1)",
                    }}
                  >
                    {new Date(transaction.date).toLocaleDateString()}
                    {transaction.description && ` • ${transaction.description}`}
                  </div>
                </div>
                <div
                  className={
                    transaction.amount > 0 ? "amount-income" : "amount-expense"
                  }
                >
                  {transaction.amount > 0 ? "+" : ""}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No transactions yet</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="tui-panel">
        <div className="tui-panel-header">📋 Quick Stats</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <div>
            <div style={{ color: "var(--ctp-mocha-subtext1)" }}>
              Avg Transaction
            </div>
            <div style={{ fontWeight: "bold", marginTop: "0.25rem" }}>
              {stats.transactionCount > 0
                ? formatCurrency(
                    Math.abs(stats.totalIncome - stats.totalExpenses) /
                      stats.transactionCount
                  )
                : formatCurrency(0)}
            </div>
          </div>
          <div>
            <div style={{ color: "var(--ctp-mocha-subtext1)" }}>This Month</div>
            <div style={{ fontWeight: "bold", marginTop: "0.25rem" }}>
              {
                transactions.filter((t) => {
                  const transactionDate = new Date(t.date);
                  const now = new Date();
                  return (
                    transactionDate.getMonth() === now.getMonth() &&
                    transactionDate.getFullYear() === now.getFullYear()
                  );
                }).length
              }{" "}
              transactions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
