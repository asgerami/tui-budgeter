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
import Link from "next/link";
import { FirebaseError } from "firebase/app";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const provider = new GoogleAuthProvider();

  const getFriendlyError = (err: unknown) => {
    if (err instanceof FirebaseError) {
      switch (err.code) {
        case "auth/user-not-found":
          return "No account found with this email.";
        case "auth/wrong-password":
          return "Incorrect password. Please try again.";
        case "auth/invalid-credential":
          return "Invalid credentials. Please check your email and password and try again.";
        case "auth/too-many-requests":
          return "Too many attempts. Please wait and try again.";
        case "auth/popup-closed-by-user":
          return "Google sign-in was cancelled.";
        case "auth/network-request-failed":
          return "Network error. Please check your connection.";
        default:
          return "Authentication failed. Please try again or reset your password.";
      }
    }
    if (typeof err === "object" && err && "message" in err) {
      return (
        (err as { message?: string }).message || "An unknown error occurred."
      );
    }
    return "An unknown error occurred.";
  };

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
    } catch (err: unknown) {
      setError(getFriendlyError(err));
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
    } catch (err: unknown) {
      setError(getFriendlyError(err));
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
          <div style={{ margin: "0.5rem 0 1rem 0", textAlign: "right" }}>
            <Link className="terminal-link" href="/forgot-password">
              Forgot password?
            </Link>
          </div>
          <button className="terminal-btn" type="submit">
            <span>&gt; Login</span>
            <span className="terminal-cursor">█</span>
          </button>
          {error && <div className="terminal-error">{error}</div>}
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <Link className="terminal-link" href="/signup">
              Need an account? Sign up
            </Link>
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
