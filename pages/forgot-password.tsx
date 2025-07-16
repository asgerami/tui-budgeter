import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../utils/firebaseClient";
import TerminalAuthLayout from "../components/TerminalAuthLayout";
import Link from "next/link";
import { FirebaseError } from "firebase/app";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent! Check your inbox.");
    } catch (err: unknown) {
      let msg = "Failed to send reset email.";
      if (err instanceof FirebaseError) {
        if (err.code === "auth/user-not-found")
          msg = "No user found with that email.";
        else if (err.code === "auth/invalid-email")
          msg = "Invalid email address.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TerminalAuthLayout title="Reset Password">
      <form onSubmit={handleSubmit} className="terminal-auth-form-area">
        <label className="terminal-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          className="terminal-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <button
          className="terminal-btn"
          type="submit"
          disabled={loading || !email}
        >
          {loading ? <span className="terminal-loading" /> : "Send Reset Email"}
        </button>
        {error && (
          <div className="terminal-error" role="alert">
            {error}
          </div>
        )}
        {success && <div className="terminal-success">{success}</div>}
        <div style={{ marginTop: "1rem" }}>
          <Link href="/signin" className="terminal-link">
            Back to Sign In
          </Link>
        </div>
      </form>
    </TerminalAuthLayout>
  );
}
