import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { Transaction } from "../types";
import { RecurringTransaction } from "../types";
import TransactionForm from "../components/TransactionForm";
import TransactionTable from "../components/TransactionTable";
import Dashboard from "../components/Dashboard";
import StatusBar from "../components/StatusBar";
import CommandInput from "../components/CommandInput";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import axios from "axios";
import type { AxiosResponse } from "axios";

export default function Home() {
  const { user, isSignedIn } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [currentView, setCurrentView] = useState<
    "dashboard" | "transactions" | "add"
  >("dashboard");
  const [notification, setNotification] = useState<string>("");

  // Fetch transactions from the database on sign in
  useEffect(() => {
    if (isSignedIn) {
      axios.get("/api/userdata").then((res: AxiosResponse<any>) => {
        const fetchedTransactions = Array.isArray(res.data) ? res.data : [];
        setTransactions(fetchedTransactions);
      });
    } else {
      setTransactions([]);
    }
  }, [isSignedIn]);

  // Save transactions to the database on change (but not on initial load)
  useEffect(() => {
    if (isSignedIn && transactions.length > 0) {
      axios.post("/api/userdata", { transactions });
    }
  }, [transactions, isSignedIn]);

  // Helper to get next date for recurring
  function getNextDate(
    date: Date,
    frequency: RecurringTransaction["frequency"]
  ): Date {
    const d = new Date(date);
    switch (frequency) {
      case "daily":
        d.setDate(d.getDate() + 1);
        break;
      case "weekly":
        d.setDate(d.getDate() + 7);
        break;
      case "monthly":
        d.setMonth(d.getMonth() + 1);
        break;
      case "yearly":
        d.setFullYear(d.getFullYear() + 1);
        break;
      default:
        d.setDate(d.getDate() + Number(frequency));
    }
    return d;
  }

  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  }, []);

  const handleClearAll = useCallback(async () => {
    if (
      confirm(
        "Are you sure you want to clear all transactions? This action cannot be undone."
      )
    ) {
      setTransactions([]);
      showNotification("All transactions cleared!");
    }
  }, [showNotification]);

  const handleLoadDemo = useCallback(() => {
    // Optionally, load demo data here
    showNotification("Demo data loading is not implemented.");
  }, [showNotification]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "a":
          e.preventDefault();
          setCurrentView("add");
          break;
        case "d":
          e.preventDefault();
          if (e.shiftKey) {
            handleLoadDemo();
          }
          break;
        case "c":
          e.preventDefault();
          if (e.shiftKey) {
            handleClearAll();
          }
          break;
        case "t":
          e.preventDefault();
          setCurrentView("transactions");
          break;
        case "h":
          e.preventDefault();
          setCurrentView("dashboard");
          break;
        case "escape":
          e.preventDefault();
          setEditingTransaction(null);
          setCurrentView("dashboard");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClearAll, handleLoadDemo]);

  const handleAddTransaction = async (transaction: Transaction) => {
    const newTxs = [...transactions, transaction];
    setTransactions(newTxs);
    showNotification("Transaction added successfully!");
    setCurrentView("dashboard");
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setCurrentView("add");
  };

  const handleDeleteTransaction = async (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      const newTxs = transactions.filter((tx) => tx.id !== id);
      setTransactions(newTxs);
      showNotification("Transaction deleted successfully!");
    }
  };

  const handleCommand = (command: string) => {
    const cmd = command.toLowerCase().trim();

    switch (cmd) {
      case "add":
      case "a":
        setCurrentView("add");
        showNotification("Switched to add transaction");
        break;
      case "clear":
      case "c":
        handleClearAll();
        break;
      case "export":
      case "e":
        handleExport();
        break;
      case "stats":
      case "s":
        setCurrentView("dashboard");
        showNotification("Showing dashboard statistics");
        break;
      case "transactions":
      case "t":
        setCurrentView("transactions");
        showNotification("Showing transaction history");
        break;
      default:
        showNotification(
          `Unknown command: ${command}. Type 'help' for available commands.`
        );
    }
  };

  const handleExport = () => {
    if (transactions.length === 0) {
      showNotification("No transactions to export");
      return;
    }

    const csvContent = [
      "Date,Category,Description,Amount,Type",
      ...transactions.map(
        (t) =>
          `${t.date},${t.category},"${t.description || ""}",${t.amount},${
            t.type
          }`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showNotification("Transactions exported to CSV!");
  };

  const calculateBalance = () => {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  };

  const currentBalance = calculateBalance();

  return (
    <>
      <Head>
        <title>TUI Budgeter - Terminal Finance Tracker</title>
        <meta
          name="description"
          content="A terminal-style personal finance tracker"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="main-container">
        {/* Header */}
        <header className="header">
          <h1>💰 TUI BUDGETER</h1>
          <p>Terminal-style Personal Finance Tracker</p>
          {notification && (
            <div className="tui-notification">
              {notification}
              <span className="tui-blink">█</span>
            </div>
          )}
          <div style={{ marginTop: 8, textAlign: "right" }}>
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonPopoverCard: "tui-panel",
                    userButtonPopoverActionButton: "tui-button",
                  },
                }}
              />
            </SignedIn>
          </div>
        </header>

        {/* Show the full app for all users, with auth overlay for unsigned users */}
        {/* Navigation */}
        <nav className="tui-panel">
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
            }}
          >
            <button
              className={`tui-button ${
                currentView === "dashboard" ? "tui-button-success" : ""
              }`}
              onClick={() => setCurrentView("dashboard")}
            >
              📊 Dashboard [H]
            </button>
            <button
              className={`tui-button ${
                currentView === "add" ? "tui-button-success" : ""
              }`}
              onClick={() => setCurrentView("add")}
            >
              ➕ Add Transaction [A]
            </button>
            <button
              className={`tui-button ${
                currentView === "transactions" ? "tui-button-success" : ""
              }`}
              onClick={() => setCurrentView("transactions")}
            >
              📋 Transactions [T]
            </button>
          </div>
        </nav>
        {/* Main Content */}
        <main className="dashboard-grid">
          <div className="left-panel">
            {currentView === "add" && (
              <TransactionForm
                onSubmit={handleAddTransaction}
                editingTransaction={editingTransaction ?? undefined}
                onCancel={() => {
                  setEditingTransaction(null);
                  setCurrentView("dashboard");
                }}
              />
            )}
            {currentView === "dashboard" && (
              <Dashboard transactions={transactions} />
            )}
            {currentView === "transactions" && (
              <TransactionTable
                transactions={transactions}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            )}
          </div>
          <div className="right-panel">
            <CommandInput onCommand={handleCommand} />
            {/* Quick Actions */}
            <div className="tui-panel">
              <div className="tui-panel-header">⚡ Quick Actions</div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.5rem",
                }}
              >
                <button
                  className="tui-button tui-button-success"
                  onClick={() => setCurrentView("add")}
                >
                  ➕ Add Transaction
                </button>
                <button className="tui-button" onClick={handleExport}>
                  📥 Export CSV
                </button>
                <button
                  className="tui-button tui-button-danger"
                  onClick={handleClearAll}
                >
                  🗑️ Clear All
                </button>
              </div>
            </div>
          </div>
        </main>
        {/* Status Bar */}
        <StatusBar
          transactions={transactions}
          currentBalance={calculateBalance()}
        />

        {/* Auth overlay for unsigned users */}
        {!isSignedIn && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "var(--surface0)",
                padding: "2rem",
                borderRadius: "8px",
                textAlign: "center",
                maxWidth: "400px",
                width: "90%",
              }}
            >
              <h2 style={{ color: "var(--blue)", marginBottom: "1rem" }}>
                Welcome to TUI Budgeter
              </h2>
              <p style={{ marginBottom: "2rem", color: "var(--text)" }}>
                Sign in or create an account to start tracking your finances
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                }}
              >
                <SignInButton mode="modal" />
                <SignUpButton mode="modal" />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export async function getServerSideProps() {
  // Remove all code related to NextAuth session logic.
  return { props: {} };
}
