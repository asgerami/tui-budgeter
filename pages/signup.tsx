import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import TerminalAuthLayout from "../components/TerminalAuthLayout";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../utils/firebaseClient";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const provider = new GoogleAuthProvider();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, { displayName: name });
      await sendEmailVerification(userCredential.user);
      setSuccess(
        "Account created! Please check your email to verify your account."
      );
      setTimeout(() => router.push("/signin"), 2500);
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setSuccess("");
    try {
      const result = await signInWithPopup(auth, provider);
      // No need to check emailVerified for Google accounts
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to sign up with Google");
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
        <button
          type="button"
          className="terminal-btn"
          style={{ marginTop: "1rem", background: "#4285F4", color: "#fff" }}
          onClick={handleGoogleSignUp}
        >
          <span>&gt; Sign up with Google</span>
          <span className="terminal-cursor">█</span>
        </button>
      </TerminalAuthLayout>
    </>
  );
}
