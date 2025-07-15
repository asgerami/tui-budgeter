import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import TerminalAuthLayout from "../components/TerminalAuthLayout";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (data.error) setError(data.error);
    else {
      setSuccess("Account created! Redirecting to sign in...");
      setTimeout(() => router.push("/signin"), 1500);
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up - TUI Budgeter</title>
      </Head>
      <TerminalAuthLayout title="Sign Up">
        <form onSubmit={handleSubmit} autoComplete="off">
          <label className="terminal-label" htmlFor="name">
            &gt; Name
          </label>
          <input
            id="name"
            className="terminal-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            required
          />
          <label className="terminal-label" htmlFor="email">
            &gt; Email
          </label>
          <input
            id="email"
            className="terminal-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="terminal-label" htmlFor="password">
            &gt; Password
          </label>
          <input
            id="password"
            className="terminal-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label className="terminal-label" htmlFor="confirmPassword">
            &gt; Confirm Password
          </label>
          <input
            id="confirmPassword"
            className="terminal-input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button className="terminal-btn" type="submit">
            <span>&gt; Create Account</span>
            <span className="terminal-cursor">█</span>
          </button>
          {error && <div className="terminal-error">{error}</div>}
          {success && (
            <div style={{ color: "#00ff99", marginTop: 8 }}>{success}</div>
          )}
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <a className="terminal-link" href="/signin">
              Already have an account? Sign in
            </a>
          </div>
        </form>
      </TerminalAuthLayout>
    </>
  );
}
