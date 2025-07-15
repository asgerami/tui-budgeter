import React, { useEffect, useState } from "react";
import Head from "next/head";
import { RecurringTransaction } from "../types";
import { v4 as uuidv4 } from "uuid";

const defaultRecurring: Partial<RecurringTransaction> = {
  name: "",
  amount: 0,
  category: "",
  type: "expense",
  startDate: new Date().toISOString().split("T")[0],
  frequency: "monthly",
};

export default function RecurringPage() {
  const [recurrings, setRecurrings] = useState<RecurringTransaction[]>([]);
  const [form, setForm] =
    useState<Partial<RecurringTransaction>>(defaultRecurring);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecurrings = async () => {
    setLoading(true);
    const res = await fetch("/api/recurring?userId=demo-user");
    const data = await res.json();
    setRecurrings(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRecurrings();
  }, []);

  const handleInput = (field: keyof RecurringTransaction, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (
      !form.name ||
      !form.amount ||
      !form.category ||
      !form.type ||
      !form.startDate ||
      !form.frequency
    ) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    if (editingId) {
      await fetch(`/api/recurring/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setForm(defaultRecurring);
    setEditingId(null);
    fetchRecurrings();
    setLoading(false);
  };

  const handleEdit = (rec: RecurringTransaction) => {
    setForm(rec);
    setEditingId(rec.id);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    await fetch(`/api/recurring/${id}`, { method: "DELETE" });
    fetchRecurrings();
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Recurring Transactions - TUI Budgeter</title>
      </Head>
      <div className="main-container">
        <header className="header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <a href="/">
              <button className="tui-button">⬅️ Back to Dashboard</button>
            </a>
            <div>
              <h1 style={{ margin: 0 }}>🔁 Recurring Transactions</h1>
              <p style={{ margin: 0 }}>
                Manage your recurring income and expenses here.
              </p>
            </div>
          </div>
        </header>
        <div className="tui-panel">
          <div className="tui-panel-header">
            {editingId
              ? "Edit Recurring Transaction"
              : "Add Recurring Transaction"}
          </div>
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              alignItems: "end",
            }}
          >
            <div className="form-group" style={{ minWidth: 120 }}>
              <label>Name</label>
              <input
                className="tui-input"
                value={form.name || ""}
                onChange={(e) => handleInput("name", e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ minWidth: 100 }}>
              <label>Amount</label>
              <input
                className="tui-input"
                type="number"
                value={form.amount || ""}
                onChange={(e) => handleInput("amount", Number(e.target.value))}
                required
              />
            </div>
            <div className="form-group" style={{ minWidth: 120 }}>
              <label>Category</label>
              <input
                className="tui-input"
                value={form.category || ""}
                onChange={(e) => handleInput("category", e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ minWidth: 100 }}>
              <label>Type</label>
              <select
                className="tui-select"
                value={form.type || "expense"}
                onChange={(e) => handleInput("type", e.target.value)}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="form-group" style={{ minWidth: 120 }}>
              <label>Start Date</label>
              <input
                className="tui-input"
                type="date"
                value={form.startDate || ""}
                onChange={(e) => handleInput("startDate", e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ minWidth: 120 }}>
              <label>Frequency</label>
              <select
                className="tui-select"
                value={form.frequency || "monthly"}
                onChange={(e) => handleInput("frequency", e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="form-group" style={{ minWidth: 120 }}>
              <label>End Date</label>
              <input
                className="tui-input"
                type="date"
                value={form.endDate || ""}
                onChange={(e) => handleInput("endDate", e.target.value)}
              />
            </div>
            <div className="form-group" style={{ minWidth: 180 }}>
              <label>Description</label>
              <input
                className="tui-input"
                value={form.description || ""}
                onChange={(e) => handleInput("description", e.target.value)}
              />
            </div>
            <button
              className="tui-button tui-button-success"
              type="submit"
              disabled={loading}
              style={{ minWidth: 120 }}
            >
              {editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button
                className="tui-button"
                type="button"
                onClick={() => {
                  setForm(defaultRecurring);
                  setEditingId(null);
                }}
              >
                Cancel
              </button>
            )}
          </form>
          {error && (
            <div style={{ color: "var(--ctp-mocha-red)", marginTop: 8 }}>
              {error}
            </div>
          )}
        </div>
        <div className="tui-panel" style={{ marginTop: "1rem" }}>
          <div className="tui-panel-header">Your Recurring Transactions</div>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="tui-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Start</th>
                  <th>Frequency</th>
                  <th>End</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recurrings.map((rec) => (
                  <tr key={rec.id}>
                    <td>{rec.name}</td>
                    <td>
                      {rec.type === "expense" ? "-" : "+"}${rec.amount}
                    </td>
                    <td>{rec.category}</td>
                    <td>{rec.type}</td>
                    <td>{rec.startDate}</td>
                    <td>{rec.frequency}</td>
                    <td>{rec.endDate || "-"}</td>
                    <td>{rec.description || "-"}</td>
                    <td>
                      <button
                        className="tui-button"
                        style={{
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.8rem",
                        }}
                        onClick={() => handleEdit(rec)}
                      >
                        ✏️
                      </button>
                      <button
                        className="tui-button tui-button-danger"
                        style={{
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.8rem",
                        }}
                        onClick={() => handleDelete(rec.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
