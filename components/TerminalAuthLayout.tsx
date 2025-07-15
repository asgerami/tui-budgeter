import React from "react";

export default function TerminalAuthLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="terminal-auth-fullscreen">
      <div className="terminal-auth-content-area">
        <div className="terminal-title-large">{title}</div>
        <div className="terminal-auth-form-area">{children}</div>
      </div>
      <div className="terminal-scanlines" />
    </div>
  );
}
