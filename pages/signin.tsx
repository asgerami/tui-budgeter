import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../utils/firebaseClient";
import Head from "next/head";
import TerminalAuthLayout from "../components/TerminalAuthLayout";
import { useRouter } from "next/router";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const provider = new GoogleAuthProvider();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (!userCredential.user.emailVerified) {
        setError("Please verify your email before logging in.");
        return;
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      const result = await signInWithPopup(auth, provider);
      // Only check emailVerified for password users
      if (
        !result.user.emailVerified &&
        result.user.providerData[0]?.providerId === "password"
      ) {
        setError("Please verify your email before logging in.");
        return;
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    }
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
        <button
          type="button"
          className="terminal-btn"
          style={{ marginTop: "1rem", background: "#4285F4", color: "#fff" }}
          onClick={handleGoogleSignIn}
        >
          <span>&gt; Sign in with Google</span>
          <span className="terminal-cursor">█</span>
        </button>
      </TerminalAuthLayout>
    </>
  );
}
