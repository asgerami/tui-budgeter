// components/TransactionTable.tsx
import React, { useState } from "react";
import { Transaction, FilterOptions } from "../types";

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function TransactionTable({
  transactions,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortBy, setSortBy] = useState<"date" | "amount" | "category">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(transactions.map((t) => t.category))];
    return categories.sort();
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (filters.category && transaction.category !== filters.category)
      return false;
    if (filters.type && transaction.type !== filters.type) return false;
    if (filters.dateFrom && transaction.date < filters.dateFrom) return false;
    if (filters.dateTo && transaction.date > filters.dateTo) return false;
    return true;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case "date":
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        break;
      case "amount":
        aValue = Math.abs(a.amount);
        bValue = Math.abs(b.amount);
        break;
      case "category":
        aValue = a.category.toLowerCase();
        bValue = b.category.toLowerCase();
        break;
      default:
        aValue = a.date;
        bValue = b.date;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (column: "date" | "amount" | "category") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getSortIcon = (column: "date" | "amount" | "category") => {
    if (sortBy !== column) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  if (transactions.length === 0) {
    return (
      <div className="tui-panel">
        <div className="tui-panel-header">📊 Transaction History</div>
        <div className="empty-state">
          <p>No transactions yet.</p>
          <p>Add your first transaction to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tui-panel">
      <div className="tui-panel-header">
        📊 Transaction History ({filteredTransactions.length} of{" "}
        {transactions.length})
      </div>

      {/* Filters */}
      <div
        className="form-row"
        style={{ marginBottom: "1rem", alignItems: "end" }}
      >
        <div className="form-group" style={{ minWidth: 0 }}>
          <label style={{ fontSize: "0.95em" }}>Filter by Category</label>
          <select
            className="tui-select"
            style={{
              height: "2.1em",
              fontSize: "0.95em",
              padding: "0.25em 0.5em",
            }}
            value={filters.category || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                category: e.target.value || undefined,
              }))
            }
          >
            <option value="">All Categories</option>
            {getUniqueCategories().map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ minWidth: 0 }}>
          <label style={{ fontSize: "0.95em" }}>Filter by Type</label>
          <select
            className="tui-select"
            style={{
              height: "2.1em",
              fontSize: "0.95em",
              padding: "0.25em 0.5em",
            }}
            value={filters.type || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                type: e.target.value as "income" | "expense" | undefined,
              }))
            }
          >
            <option value="">All Types</option>
            <option value="income">💰 Income</option>
            <option value="expense">💸 Expense</option>
          </select>
        </div>

        <div className="form-group" style={{ minWidth: 0 }}>
          <label style={{ fontSize: "0.95em" }}>Date Range</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="date"
              className="tui-input"
              style={{
                height: "2.1em",
                fontSize: "0.95em",
                padding: "0.25em 0.5em",
              }}
              value={filters.dateFrom || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  dateFrom: e.target.value || undefined,
                }))
              }
              placeholder="From"
            />
            <input
              type="date"
              className="tui-input"
              style={{
                height: "2.1em",
                fontSize: "0.95em",
                padding: "0.25em 0.5em",
              }}
              value={filters.dateTo || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  dateTo: e.target.value || undefined,
                }))
              }
              placeholder="To"
            />
          </div>
        </div>

        <div
          className="form-group"
          style={{
            minWidth: 0,
            display: "flex",
            alignItems: "end",
            flex: "none",
            marginLeft: "1rem",
          }}
        >
          <button
            type="button"
            className="tui-button"
            style={{
              width: "80px",
              height: "2.1em",
              fontSize: "0.95em",
              padding: "0.25em 0.5em",
            }}
            onClick={clearFilters}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      <div style={{ overflowX: "auto" }}>
        <table className="tui-table">
          <thead>
            <tr>
              <th
                onClick={() => handleSort("date")}
                style={{ cursor: "pointer" }}
              >
                Date {getSortIcon("date")}
              </th>
              <th
                onClick={() => handleSort("category")}
                style={{ cursor: "pointer" }}
              >
                Category {getSortIcon("category")}
              </th>
              <th>Description</th>
              <th
                onClick={() => handleSort("amount")}
                style={{ cursor: "pointer" }}
              >
                Amount {getSortIcon("amount")}
              </th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{formatDate(transaction.date)}</td>
                <td>
                  <span className="category-tag">{transaction.category}</span>
                </td>
                <td>{transaction.description || "-"}</td>
                <td
                  className={
                    transaction.amount > 0 ? "amount-income" : "amount-expense"
                  }
                >
                  {transaction.amount > 0 ? "+" : ""}
                  {formatCurrency(transaction.amount)}
                </td>
                <td>
                  {transaction.type === "income" ? "💰" : "💸"}
                  {transaction.type.charAt(0).toUpperCase() +
                    transaction.type.slice(1)}
                </td>
                <td>
                  <div className="transaction-actions">
                    <button
                      className="tui-button"
                      onClick={() => onEdit(transaction)}
                      style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                    >
                      ✏️
                    </button>
                    <button
                      className="tui-button tui-button-danger"
                      onClick={() => onDelete(transaction.id)}
                      style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTransactions.length === 0 && transactions.length > 0 && (
        <div className="empty-state">
          <p>No transactions match the current filters.</p>
          <button className="tui-button" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      )}

    </div>
  );
}
