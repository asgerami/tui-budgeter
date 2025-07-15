import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Head from "next/head";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (res?.error) setError(res.error);
    if (res?.ok) window.location.href = "/";
  };

  return (
    <>
      <Head>
        <title>Sign In - TUI Budgeter</title>
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
            >{`
         ______
       _|__||__|_
      |  _    _  |
      | |_|  |_| |    .--.
      |  ___     |   |o_o |
      | |___|    |   |:_/ |
      |   ||     |  //   \ \
     /|   ||     |\ ||___| |
    /_|___||_____|_\ \_____/
     ||    ||    ||
    [__]  [__]  [__]

      Booting... Please Log In.

`}</pre>
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
                Sign In
              </button>
              {error && (
                <div style={{ color: "var(--ctp-mocha-red)" }}>{error}</div>
              )}
            </form>
            <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
              <a
                href="/signup"
                style={{
                  color: "var(--ctp-mocha-blue)",
                  textDecoration: "underline",
                  fontFamily: "inherit",
                }}
              >
                Don't have an account? Sign up
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
