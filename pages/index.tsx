import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { Transaction } from "../types";
import TransactionForm from "../components/TransactionForm";
import TransactionTable from "../components/TransactionTable";
import Dashboard from "../components/Dashboard";
import StatusBar from "../components/StatusBar";
import CommandInput from "../components/CommandInput";
import {
  SignedIn,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import axios from "axios";
import type { AxiosResponse } from "axios";
import { pusherClient } from "../utils/pusherClient";

export default function Home() {
  const { isSignedIn, user } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [currentView, setCurrentView] = useState<
    "dashboard" | "transactions" | "add"
  >("dashboard");
  const [notification, setNotification] = useState<string>("");

  useEffect(() => {
    if (isSignedIn) {
      axios.get("/api/userdata").then((res: AxiosResponse<Transaction[]>) => {
        const fetchedTransactions = Array.isArray(res.data) ? res.data : [];
        setTransactions(fetchedTransactions);
      });
    } else {
      setTransactions([]);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isSignedIn && transactions.length > 0) {
      axios.post("/api/userdata", { transactions });
    }
  }, [transactions, isSignedIn]);

  useEffect(() => {
    if (!isSignedIn || !user) return;
    const channel = pusherClient.subscribe("transactions");
    const handler = (data: { userId: string }) => {
      if (data.userId === user.id) {
        axios.get("/api/userdata").then((res: AxiosResponse<Transaction[]>) => {
          const fetchedTransactions = Array.isArray(res.data) ? res.data : [];
          setTransactions(fetchedTransactions);
        });
      }
    };
    channel.bind("updated", handler);
    return () => {
      channel.unbind("updated", handler);
      pusherClient.unsubscribe("transactions");
    };
  }, [isSignedIn, user]);

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
    showNotification("Demo data loading is not implemented.");
  }, [showNotification]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  return (
    <>
      <Head>
        <title>TUI Budgeter - Terminal Finance Tracker</title>
        <meta
          name="description"
          content="A terminal-style personal finance tracker"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="main-container">
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
            <div className="quick-actions">
              <button
                className="tui-button tui-button-danger"
                onClick={handleClearAll}
              >
                Clear All
              </button>
              <button
                className="tui-button tui-button-secondary"
                onClick={handleLoadDemo}
              >
                Load Demo
              </button>
              <button
                className="tui-button tui-button-secondary"
                onClick={handleExport}
              >
                Export CSV
              </button>
            </div>
          </div>
        </main>
        <StatusBar
          transactions={transactions}
          currentBalance={calculateBalance()}
        />
      </div>
    </>
  );
}
