import React, { useState, useEffect } from "react";
import { Transaction } from "../types";

interface StatusBarProps {
  transactions: Transaction[];
  currentBalance: number;
}

export default function StatusBar({
  transactions,
  currentBalance,
}: StatusBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return "var(--ctp-mocha-green)";
    if (balance < 0) return "var(--ctp-mocha-red)";
    return "var(--ctp-mocha-text)";
  };

  return (
    <div className="status-bar">
      <div className="status-left">
        <span>
          📊 Transactions: <strong>{transactions.length}</strong>
        </span>
        <span>
          💰 Balance:{" "}
          <strong style={{ color: getBalanceColor(currentBalance) }}>
            {formatCurrency(currentBalance)}
          </strong>
        </span>
        <span>
          🎯 Mode: <strong>NORMAL</strong>
        </span>
      </div>

      <div className="status-right">
        <span>{hasMounted ? formatDate(currentTime) : ""}</span>
        {hasMounted && (
          <span style={{ marginLeft: "1rem", fontWeight: "bold" }}>
            {formatTime(currentTime)}
          </span>
        )}
      </div>
    </div>
  );
}
