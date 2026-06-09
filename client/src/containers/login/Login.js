import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
    if (success) setSuccess("");
  };

  const validate = () => {
    if (!isLogin) {
      if (!form.firstName.trim()) return "First name is required.";
      if (!form.lastName.trim()) return "Last name is required.";
    }
    if (!form.email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Please enter a valid email address.";
    if (!form.password) return "Password is required.";
    if (form.password.length < 6)
      return "Password must be at least 6 characters.";
    if (!isLogin && form.password !== form.confirmPassword)
      return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) return setError(validationError);

    setLoading(true);
    setError("");
    setSuccess("");

    const url = isLogin
      ? "http://localhost:8082/login"
      : "http://localhost:8082/register";

    const body = isLogin
      ? { email: form.email.trim(), password: form.password }
      : {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
        };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }

      if (isLogin) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => {
          navigate(data.user.role === "admin" ? "/admin/dashboard" : "/home");
        }, 800);
      } else {
        setSuccess("Account created! Please log in.");
        setTimeout(() => switchMode(true), 1200);
      }
    } catch {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () =>
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

  const switchMode = (toLogin) => {
    setIsLogin(toLogin);
    setError("");
    setSuccess("");
    resetForm();
    setShowPassword(false);
    setShowConfirm(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">E</div>
          <h1>{isLogin ? "Welcome back" : "Create account"}</h1>
          <p>
            {isLogin
              ? "Sign in to your Everwear account"
              : "Join Everwear today"}
          </p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? "active" : ""}`}
            onClick={() => switchMode(true)}
            type="button"
          >
            Login
          </button>
          <button
            className={`auth-tab ${!isLogin ? "active" : ""}`}
            onClick={() => switchMode(false)}
            type="button"
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Name — register only */}
          {!isLogin && (
            <div className="name-row">
              <div className="input-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="John"
                  value={form.firstName}
                  onChange={handleChange}
                  autoComplete="given-name"
                />
              </div>
              <div className="input-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={handleChange}
                  autoComplete="family-name"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="input-group">
            <label>Password</label>
            <div className="input-password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={
                  isLogin ? "Enter your password" : "Min. 6 characters"
                }
                value={form.password}
                onChange={handleChange}
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              <button
                type="button"
                className="toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Confirm Password — register only */}
          {!isLogin && (
            <div className="input-group">
              <label>Confirm Password</label>
              <div className="input-password-wrap">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-eye"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
          )}

          {/* Forgot Password — login only */}
          {isLogin && (
            <div className="forgot-wrap">
              <span className="forgot-link">Forgot password?</span>
            </div>
          )}

          {/* Success */}
          {success && <div className="success-box">✅ {success}</div>}

          {/* Error */}
          {error && <div className="error-box">⚠️ {error}</div>}

          {/* Submit Button */}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? (
              <span className="spinner-wrap">
                <span className="spinner" />
                {isLogin ? "Signing in..." : "Creating account..."}
              </span>
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="auth-footer">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span className="auth-switch" onClick={() => switchMode(!isLogin)}>
            {isLogin ? "Sign Up" : "Log In"}
          </span>
        </p>
      </div>
    </div>
  );
}
