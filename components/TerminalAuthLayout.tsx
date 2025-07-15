import React from "react";

export default function TerminalAuthLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="terminal-auth-bg">
      <div className="terminal-auth-window">
        <div className="terminal-auth-header">
          <pre className="terminal-ascii-art">{`
   _______  _______  ___   _  _______  _______  __   __  _______ 
  |       ||       ||   | | ||       ||       ||  | |  ||       |
  |    ___||   _   ||   |_| ||    ___||   _   ||  |_|  ||    ___|
  |   | __ |  | |  ||      _||   |___ |  | |  ||       ||   |___ 
  |   ||  ||  |_|  ||     |_ |    ___||  |_|  ||       ||    ___|
  |   |_| ||       ||    _  ||   |    |       ||   _   ||   |___ 
  |_______||_______||___| |_||___|    |_______||__| |__||_______|
`}</pre>
          <div className="terminal-title">{title}</div>
        </div>
        <div className="terminal-auth-content">{children}</div>
      </div>
      <div className="terminal-scanlines" />
    </div>
  );
}
