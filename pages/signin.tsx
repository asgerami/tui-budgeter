import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Head from "next/head";
import TerminalAuthLayout from "../components/TerminalAuthLayout";
import { useRouter } from "next/router";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (res?.error) setError(res.error);
    if (res?.ok) router.push("/");
  };

  return (
    <>
      <Head>
        <title>Sign In - TUI Budgeter</title>
      </Head>
      <TerminalAuthLayout title="Sign In">
        <form onSubmit={handleSubmit} autoComplete="off">
          <label className="terminal-label" htmlFor="email">
            &gt; Email
          </label>
          <input
            id="email"
            className="terminal-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
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
          <button className="terminal-btn" type="submit">
            <span>&gt; Login</span>
            <span className="terminal-cursor">█</span>
          </button>
          {error && <div className="terminal-error">{error}</div>}
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <a className="terminal-link" href="/signup">
              Need an account? Sign up
            </a>
          </div>
        </form>
      </TerminalAuthLayout>
    </>
  );
}
