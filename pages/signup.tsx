import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

const asciiArt = `
         ______
       _|__||__|_
      |  _    _  |
      | |_|  |_| |    .--.
      |  ___     |   |o_o |
      | |___|    |   |:_/ |
      |   ||     |  //   \\ \
     /|   ||     |\ ||___| |
    /_|___||_____|_\ \_____/
     ||    ||    ||
    [__]  [__]  [__]

      Booting... Please Log In.

`;

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
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--ctp-mocha-base)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            width: "min(900px, 95vw)",
            background: "var(--ctp-mocha-mantle)",
            borderRadius: "0.5rem",
            boxShadow: "0 0 0 1px var(--ctp-mocha-surface2)",
            overflow: "hidden",
          }}
        >
          {/* Left: ASCII art and tagline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem",
              background: "var(--ctp-mocha-base)",
              borderRight: "1px solid var(--ctp-mocha-surface2)",
            }}
          >
            <h2
              style={{
                fontFamily: "inherit",
                fontWeight: 400,
                marginBottom: "2rem",
                letterSpacing: 2,
              }}
            >
              TUI Budgeter
            </h2>
            <pre
              style={{
                background: "var(--ctp-mocha-mantle)",
                color: "var(--ctp-mocha-overlay1)",
                padding: "1rem",
                borderRadius: "0.25rem",
                fontSize: "1rem",
                marginBottom: "2rem",
              }}
            >
              {asciiArt}
            </pre>
            <div
              style={{
                color: "var(--ctp-mocha-subtext1)",
                fontFamily: "inherit",
                fontSize: "1rem",
                textAlign: "center",
              }}
            >
              <span>Terminal-style personal finance tracker</span>
            </div>
          </div>
          {/* Right: Form */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "2rem",
            }}
          >
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                width: "100%",
              }}
            >
              <input
                className="tui-input"
                type="text"
                placeholder="Username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ fontFamily: "inherit" }}
              />
              <input
                className="tui-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ fontFamily: "inherit" }}
              />
              <input
                className="tui-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ fontFamily: "inherit" }}
              />
              <input
                className="tui-input"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ fontFamily: "inherit" }}
              />
              <button
                className="tui-button tui-button-success"
                type="submit"
                style={{
                  width: "100%",
                  fontFamily: "inherit",
                  fontSize: "1.1rem",
                  marginTop: "0.5rem",
                }}
              >
                Sign Up
              </button>
              {error && (
                <div style={{ color: "var(--ctp-mocha-red)" }}>{error}</div>
              )}
              {success && (
                <div style={{ color: "var(--ctp-mocha-green)" }}>{success}</div>
              )}
            </form>
            <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
              <a
                href="/signin"
                style={{
                  color: "var(--ctp-mocha-blue)",
                  textDecoration: "underline",
                  fontFamily: "inherit",
                }}
              >
                Already have an account? Log In
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
