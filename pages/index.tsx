// pages/index.tsx
import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { Transaction } from "../types";
import TransactionForm from "../components/TransactionForm";
import TransactionTable from "../components/TransactionTable";
import Dashboard from "../components/Dashboard";
import StatusBar from "../components/StatusBar";
import CommandInput from "../components/CommandInput";
import { auth } from "../utils/firebaseClient";
import { getIdToken, onAuthStateChanged, signOut, User } from "firebase/auth";
import Link from "next/link";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [currentView, setCurrentView] = useState<
    "dashboard" | "transactions" | "add"
  >("dashboard");
  const [notification, setNotification] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Helper to get the current user's ID token and build headers
  const getAuthHeaders = useCallback(async (contentType = false) => {
    const user = auth.currentUser;
    const headers: Record<string, string> = {};
    if (contentType) headers["Content-Type"] = "application/json";
    if (user) {
      const token = await getIdToken(user);
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }, []);

  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  }, []);

  // Fetch transactions from API
  const fetchTransactions = useCallback(async () => {
    const headers = await getAuthHeaders();
    const res = await fetch("/api/transactions", { headers });
    if (res.ok) {
      const data = await res.json();
      setTransactions(data);
    }
  }, [getAuthHeaders]);

  const handleClearAll = useCallback(async () => {
    if (!user) {
      showNotification("Please sign in to clear transactions.");
      return;
    }
    if (
      confirm(
        "Are you sure you want to clear all transactions? This action cannot be undone."
      )
    ) {
      const headers = await getAuthHeaders();
      for (const tx of transactions) {
        await fetch(`/api/transactions/${tx.id}`, {
          method: "DELETE",
          headers,
        });
      }
      fetchTransactions();
      showNotification("All transactions cleared!");
    }
  }, [user, transactions, getAuthHeaders, fetchTransactions, showNotification]);

  const handleLoadDemo = useCallback(() => {
    // This function is no longer needed as transactions are fetched from API
    // StorageService.loadDemoData();
    // setTransactions(StorageService.getTransactions());
    showNotification("Demo data loading is no longer available.");
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoadingAuth(false);
      if (firebaseUser) {
        fetchTransactions();
      } else {
        setTransactions([]);
      }
    });
    return () => unsubscribe();
  }, [fetchTransactions]);

  const handleAddTransaction = async (transaction: Transaction) => {
    if (!user) {
      showNotification("Please sign in to add transactions.");
      return;
    }
    const headers = await getAuthHeaders(true);
    await fetch("/api/transactions", {
      method: "POST",
      headers,
      body: JSON.stringify(transaction),
    });
    fetchTransactions();
    showNotification("Transaction added successfully!");
    setCurrentView("dashboard");
  };

  const handleEditTransaction = (transaction: Transaction) => {
    if (!user) {
      showNotification("Please sign in to edit transactions.");
      return;
    }
    setEditingTransaction(transaction);
    setCurrentView("add");
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) {
      showNotification("Please sign in to delete transactions.");
      return;
    }
    if (confirm("Are you sure you want to delete this transaction?")) {
      const headers = await getAuthHeaders();
      await fetch(`/api/transactions/${id}`, { method: "DELETE", headers });
      fetchTransactions();
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
    if (!user) {
      showNotification("Please sign in to export transactions.");
      return;
    }
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
            {loadingAuth ? (
              <span className="terminal-loading">Loading...</span>
            ) : user ? (
              <button
                className="tui-button tui-button-danger"
                onClick={async () => {
                  await signOut(auth);
                  setNotification("Logged out successfully.");
                }}
              >
                Log Out
              </button>
            ) : (
              <>
                <Link
                  className="tui-button"
                  href="/signin"
                  style={{ marginRight: 8 }}
                >
                  Sign In
                </Link>
                <Link className="tui-button tui-button-success" href="/signup">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Navigation */}
        {loadingAuth ? (
          <div
            className="terminal-loading"
            style={{ textAlign: "center", margin: "2rem 0" }}
          >
            Loading...
          </div>
        ) : (
          <nav className="tui-panel">
            <div
              style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
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
                disabled={!user}
              >
                ➕ Add Transaction [A]
              </button>
              <button
                className={`tui-button ${
                  currentView === "transactions" ? "tui-button-success" : ""
                }`}
                onClick={() => setCurrentView("transactions")}
                disabled={!user}
              >
                📋 Transactions [T]
              </button>
            </div>
          </nav>
        )}

        {/* Main Content */}
        <main className="dashboard-grid">
          <div className="left-panel">
            {currentView === "add" && user && (
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

            {currentView === "transactions" && user && (
              <TransactionTable
                transactions={transactions}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            )}
            {currentView !== "dashboard" && !user && (
              <div style={{ marginTop: 32, textAlign: "center" }}>
                <p>Please sign in to access this feature.</p>
                <div
                  style={{
                    marginTop: 16,
                    display: "flex",
                    justifyContent: "center",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <Link className="tui-button" href="/signin">
                    Sign In
                  </Link>
                  <Link
                    className="tui-button tui-button-success"
                    href="/signup"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
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
                  disabled={!user}
                >
                  ➕ Add Transaction
                </button>
                <button
                  className="tui-button"
                  onClick={handleExport}
                  disabled={transactions.length === 0 || !user}
                >
                  📥 Export CSV
                </button>
                <button
                  className="tui-button tui-button-danger"
                  onClick={handleClearAll}
                  disabled={transactions.length === 0 || !user}
                >
                  🗑️ Clear All
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Status Bar */}
        {!loadingAuth && (
          <StatusBar
            transactions={transactions}
            currentBalance={currentBalance}
          />
        )}
      </div>
    </>
  );
}

export async function getServerSideProps() {
  // Remove all code related to NextAuth session logic.
  return { props: {} };
}
