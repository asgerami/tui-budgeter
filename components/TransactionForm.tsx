import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Transaction,
  TransactionFormData,
  RecurringTransaction,
} from "../types";

interface TransactionFormProps {
  onSubmit: (transaction: Transaction) => void;
  editingTransaction?: Transaction;
  onCancel?: () => void;
}

const CATEGORIES = {
  income: [
    "Salary",
    "Freelance",
    "Investment",
    "Gift",
    "Rental Income",
    "Interest",
    "Dividends",
    "Refund",
    "Other Income",
  ],
  expense: [
    "Rent",
    "Mortgage",
    "Utilities",
    "Groceries",
    "Transport",
    "Car Payment",
    "Fuel",
    "Insurance",
    "Healthcare",
    "Childcare",
    "Education",
    "Subscriptions",
    "Shopping",
    "Entertainment",
    "Dining Out",
    "Travel",
    "Bills",
    "Phone/Internet",
    "Pets",
    "Personal Care",
    "Gifts/Donations",
    "Other Expense",
  ],
};

export default function TransactionForm({
  onSubmit,
  editingTransaction,
  onCancel,
}: TransactionFormProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    date: editingTransaction?.date || new Date().toISOString().split("T")[0],
    category: editingTransaction?.category || "",
    amount: editingTransaction
      ? Math.abs(editingTransaction.amount).toString()
      : "",
    type: editingTransaction?.type || "expense",
    description: editingTransaction?.description || "",
  });

  const [errors, setErrors] = useState<Partial<TransactionFormData>>({});
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDetails, setRecurringDetails] = useState({
    frequency: "monthly",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<TransactionFormData> = {};

    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.amount) {
      newErrors.amount = "Amount is required";
    } else if (
      isNaN(parseFloat(formData.amount)) ||
      parseFloat(formData.amount) <= 0
    ) {
      newErrors.amount = "Amount must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof TransactionFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleRecurringChange = (field: string, value: string) => {
    setRecurringDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const amount = parseFloat(formData.amount);
    const finalAmount = formData.type === "expense" ? -amount : amount;

    const transaction: Transaction = {
      id: editingTransaction?.id || uuidv4(),
      date: formData.date,
      category: formData.category,
      amount: finalAmount,
      type: formData.type,
      description: formData.description || undefined,
    };

    onSubmit(transaction);

    if (isRecurring) {
      // Save recurring transaction to localStorage
      const rec: RecurringTransaction = {
        id: uuidv4(),
        name: formData.description || formData.category,
        amount: Math.abs(finalAmount),
        category: formData.category,
        type: formData.type,
        description: formData.description,
        startDate: recurringDetails.startDate,
        frequency:
          recurringDetails.frequency as RecurringTransaction["frequency"],
        endDate: recurringDetails.endDate || undefined,
        lastGenerated: recurringDetails.startDate,
      };
      try {
        const data = localStorage.getItem("recurring_transactions");
        const recs: RecurringTransaction[] = data ? JSON.parse(data) : [];
        recs.push(rec);
        localStorage.setItem("recurring_transactions", JSON.stringify(recs));
      } catch {}
    }

    // Reset form if not editing
    if (!editingTransaction) {
      setFormData({
        date: new Date().toISOString().split("T")[0],
        category: "",
        amount: "",
        type: "expense",
        description: "",
      });
      setIsRecurring(false);
      setRecurringDetails({
        frequency: "monthly",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
      });
    }
  };

  const getCurrentCategories = () => {
    return CATEGORIES[formData.type];
  };

  return (
    <div className="tui-panel">
      <div className="tui-panel-header">
        {editingTransaction ? "✏️ Edit Transaction" : "➕ Add New Transaction"}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              className="tui-input"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              required
            />
            {errors.date && (
              <div
                style={{ color: "var(--ctp-mocha-red)", fontSize: "0.8rem" }}
              >
                {errors.date}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              className="tui-select"
              value={formData.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
            >
              <option value="expense">💸 Expense</option>
              <option value="income">💰 Income</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              className="tui-select"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {getCurrentCategories().map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <div
                style={{ color: "var(--ctp-mocha-red)", fontSize: "0.8rem" }}
              >
                {errors.category}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              className="tui-input"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              placeholder="0.00"
              required
            />
            {errors.amount && (
              <div
                style={{ color: "var(--ctp-mocha-red)", fontSize: "0.8rem" }}
              >
                {errors.amount}
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (optional)</label>
          <input
            id="description"
            type="text"
            className="tui-input"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Optional description..."
          />
        </div>
        <div className="form-group" style={{ marginTop: "1rem" }}>
          <label>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              style={{ marginRight: "0.5em" }}
            />
            Make this a recurring transaction
          </label>
        </div>
        {isRecurring && (
          <div className="form-row" style={{ marginTop: "0.5rem" }}>
            <div className="form-group">
              <label>Frequency</label>
              <select
                className="tui-select"
                value={recurringDetails.frequency}
                onChange={(e) =>
                  handleRecurringChange("frequency", e.target.value)
                }
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                className="tui-input"
                value={recurringDetails.startDate}
                onChange={(e) =>
                  handleRecurringChange("startDate", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>End Date (optional)</label>
              <input
                type="date"
                className="tui-input"
                value={recurringDetails.endDate}
                onChange={(e) =>
                  handleRecurringChange("endDate", e.target.value)
                }
              />
            </div>
          </div>
        )}
        <div className="transaction-actions">
          <button
            type="submit"
            className={`tui-button ${
              editingTransaction ? "tui-button-success" : ""
            }`}
          >
            {editingTransaction ? "💾 Update" : "➕ Add Transaction"}
          </button>

          {editingTransaction && onCancel && (
            <button type="button" className="tui-button" onClick={onCancel}>
              ❌ Cancel
            </button>
          )}
        </div>
      </form>

      <div className="shortcuts">
        <span className="shortcut">
          <span className="shortcut-key">Enter</span> Submit
        </span>
        <span className="shortcut">
          <span className="shortcut-key">Esc</span> Cancel
        </span>
      </div>
    </div>
  );
}
