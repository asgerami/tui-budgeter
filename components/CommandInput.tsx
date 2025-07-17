import React, { useState } from "react";

interface CommandInputProps {
  onCommand: (command: string) => void;
}

export default function CommandInput({ onCommand }: CommandInputProps) {
  const [command, setCommand] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      onCommand(command.trim());
      setCommandHistory((prev) => [...prev, command.trim()]);
      setCommand("");
      setHistoryIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp" && commandHistory.length > 0) {
      e.preventDefault();
      const newIndex =
        historyIndex === -1
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setCommand(commandHistory[newIndex]);
    } else if (e.key === "ArrowDown" && historyIndex >= 0) {
      e.preventDefault();
      const newIndex =
        historyIndex === commandHistory.length - 1 ? -1 : historyIndex + 1;
      setHistoryIndex(newIndex);
      setCommand(newIndex === -1 ? "" : commandHistory[newIndex]);
    }
  };

  return (
    <div className="tui-panel">
      <div className="tui-panel-header">⌨️ Command Input</div>

      <form onSubmit={handleSubmit} className="command-input">
        <span style={{ color: "var(--ctp-mocha-blue)", fontWeight: "bold" }}>
          $
        </span>
        <input
          type="text"
          is-="input"
          className="tui-input"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter command (try 'add', 'clear', 'export')"
          autoComplete="off"
          style={{ border: "none", outline: "none" }}
        />
      </form>

      <div className="shortcuts">
        <span className="shortcut">
          <span is-="badge" data-variant="orange" data-cap="round">
            a
          </span>{" "}
          Add transaction
        </span>
        <span className="shortcut">
          <span is-="badge" data-variant="yellow" data-cap="round">
            c
          </span>{" "}
          Clear all
        </span>
        <span className="shortcut">
          <span is-="badge" data-variant="green" data-cap="round">
            e
          </span>{" "}
          Export
        </span>
        <span className="shortcut">
          <span is-="badge" data-variant="yellow" data-cap="round">
            t
          </span>{" "}
          Transactions
        </span>
        <span className="shortcut">
          <span is-="badge" data-variant="blue" data-cap="round">
            s
          </span>{" "}
          Dashboard
        </span>
      </div>

      <div
        style={{
          marginTop: "1rem",
          fontSize: "0.9rem",
          color: "var(--ctp-mocha-subtext1)",
        }}
      >
        <strong>Available Commands:</strong>
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1rem" }}>
          <li>
            <code>add</code> - Focus on add transaction form
          </li>
          <li>
            <code>clear</code> - Clear all transactions
          </li>
          <li>
            <code>export</code> - Export transactions to CSV
          </li>
          <li>
            <code>stats</code> - Show detailed statistics
          </li>
          <li>
            <code>transactions</code> - Show transaction history
          </li>
        </ul>
      </div>
    </div>
  );
}
