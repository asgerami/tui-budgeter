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


                ████████╗██╗░░░██╗██╗
                ╚══██╔══╝██║░░░██║██║
                ░░░██║░░░██║░░░██║██║
                ░░░██║░░░██║░░░██║██║
                ░░░██║░░░╚██████╔╝██║
                ░░░╚═╝░░░░╚═════╝░╚═╝

██████╗░██╗░░░██╗██████╗░░██████╗░███████╗████████╗███████╗██████╗░
██╔══██╗██║░░░██║██╔══██╗██╔════╝░██╔════╝╚══██╔══╝██╔════╝██╔══██╗
██████╦╝██║░░░██║██║░░██║██║░░██╗░█████╗░░░░░██║░░░█████╗░░██████╔╝
██╔══██╗██║░░░██║██║░░██║██║░░╚██╗██╔══╝░░░░░██║░░░██╔══╝░░██╔══██╗
██████╦╝╚██████╔╝██████╔╝╚██████╔╝███████╗░░░██║░░░███████╗██║░░██║
╚═════╝░░╚═════╝░╚═════╝░░╚═════╝░╚══════╝░░░╚═╝░░░╚══════╝╚═╝░░╚═╝

`}</pre>
          <div className="terminal-title">{title}</div>
        </div>
        <div className="terminal-auth-content">{children}</div>
      </div>
      <div className="terminal-scanlines" />
    </div>
  );
}
