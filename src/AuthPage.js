import React, { useState } from "react";
import "./AuthPage.css";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { auth } from "./firebase";

function AuthPage() {
  const [mode, setMode] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await updateProfile(result.user, {
        displayName: name.trim(),
      });

      setMessage("Account created successfully! 🎵");

    } catch (err) {
      console.error(err);

      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Password must be at least 6 characters.");
      } else {
        setError(err.message || "Account creation failed.");
      }

    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

    } catch (err) {
      console.error(err);

      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password"
      ) {
        setError("Incorrect email or password.");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(err.message || "Login failed.");
      }

    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setMessage("");
    setPassword("");
  };

  return (
    <div className="auth-page">

      {/* Animated background */}
      <div className="music-particles">
        <span>♪</span>
        <span>♫</span>
        <span>♬</span>
        <span>♪</span>
        <span>♫</span>
        <span>♬</span>
        <span>♪</span>
        <span>♫</span>
      </div>

      {/* Glow effects */}
      <div className="auth-glow glow-one"></div>
      <div className="auth-glow glow-two"></div>

      {/* Main content */}
      <div className="auth-container">

        {/* Left side */}
        <div className="auth-intro">

          <div className="soundify-logo">
            <div className="logo-icon">♫</div>
            <span>Soundify</span>
          </div>

          <h1>
            Your Music.
            <br />
            <span>Your Vibe.</span>
          </h1>

          <p>
            Discover millions of songs, create your playlists
            and enjoy music your way.
          </p>

          {/* Equalizer */}
          <div className="auth-equalizer">
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
            <i></i>
          </div>

          <div className="auth-tagline">
            <span>●</span> Feel the music
          </div>

        </div>

        {/* Auth card */}
        <div className="auth-card">

          <div className="auth-card-header">
            <h2>
              {mode === "login"
                ? "Welcome Back"
                : "Join Soundify"}
            </h2>

            <p>
              {mode === "login"
                ? "Login to continue your musical journey"
                : "Create your account and start listening"}
            </p>
          </div>

          {/* Login / Signup toggle */}
          <div className="auth-toggle">

            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => switchMode("login")}
            >
              Login
            </button>

            <button
              type="button"
              className={mode === "signup" ? "active" : ""}
              onClick={() => switchMode("signup")}
            >
              Sign Up
            </button>

          </div>

          <form
            onSubmit={
              mode === "login"
                ? handleLogin
                : handleSignup
            }
          >

            {/* Name */}
            {mode === "signup" && (
              <div className="input-group auth-animation">

                <label>Full Name</label>

                <div className="input-box">
                  <span>👤</span>

                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                  />
                </div>

              </div>
            )}

            {/* Email */}
            <div className="input-group">

              <label>Email Address</label>

              <div className="input-box">
                <span>✉</span>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />
              </div>

            </div>

            {/* Password */}
            <div className="input-group">

              <label>Password</label>

              <div className="input-box">
                <span>🔒</span>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />
              </div>

            </div>

            {mode === "login" && (
              <div className="forgot-password">
                Forgot password?
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                style={{
                  color: "#ff5c5c",
                  fontSize: "13px",
                  marginTop: "10px",
                  lineHeight: "1.4",
                }}
              >
                {error}
              </div>
            )}

            {/* Success */}
            {message && (
              <div
                style={{
                  color: "#1db954",
                  fontSize: "13px",
                  marginTop: "10px",
                  lineHeight: "1.4",
                }}
              >
                {message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login to Soundify"
                : "Create Soundify Account"}

              <span>→</span>
            </button>

          </form>

          <div className="secure-text">
            🔐 Your information is securely protected
          </div>

        </div>
      </div>
    </div>
  );
}

export default AuthPage;