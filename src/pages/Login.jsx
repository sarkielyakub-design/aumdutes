import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  User,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

import api from "../services/Api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanUsername = username.trim();

    if (!cleanUsername || !password) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/api/auth/login", {
        username: cleanUsername,
        password,
      });

      const accessToken = res?.data?.access_token;

      if (!accessToken) {
        throw new Error("Authentication token was not returned.");
      }

      login(accessToken);

      navigate("/dashboard", {
        replace: true,
      });
    } catch (err) {
      console.error("AUM login error:", err);

      const status = err?.response?.status;

      if (status === 401) {
        setError(
          "Invalid username or password. Please check your credentials."
        );
      } else if (status === 403) {
        setError(
          "You are not authorized to access the AUM admin system."
        );
      } else if (status >= 500) {
        setError(
          "The server is currently unavailable. Please try again."
        );
      } else if (err?.response?.data?.detail) {
        setError(
          typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : "Unable to sign in. Please try again."
        );
      } else {
        setError(
          "Unable to connect to the AUM server. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#061A35]">
      {/* ================================================== */}
      {/* BACKGROUND */}
      {/* ================================================== */}

      <div className="absolute inset-0 bg-linear-to-br from-[#061A35] via-[#0B2347] to-[#087A3D]" />

      {/* Green glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-green-500/20 blur-3xl" />

      {/* Blue glow */}
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/35" />

      {/* ================================================== */}
      {/* LOGIN CONTAINER */}
      {/* ================================================== */}

      <div className="relative z-10 w-full max-w-md px-5 py-8">
        <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-2xl backdrop-blur-2xl">

          {/* ================================================== */}
          {/* HEADER */}
          {/* ================================================== */}

          <div className="px-7 pt-9 text-center">

            {/* Logo */}
            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white/80 bg-white shadow-xl">
              <img
                src="/aum-logo.svg"
                alt="AUM Logo"
                className="h-full w-full object-contain"
              />
            </div>

            {/* Organization */}
            <h1 className="text-3xl font-extrabold tracking-wide text-white">
              AUM
            </h1>

            <p className="mt-2 text-sm font-medium leading-5 text-blue-100">
              AMB. USMAN &amp;
              <br />
              Development Network
            </p>

            {/* Admin badge */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-green-300/20 bg-green-500/15 px-4 py-2 text-xs font-semibold text-green-200">
              <ShieldCheck size={16} />
              Official Administration Portal
            </div>
          </div>

          {/* ================================================== */}
          {/* FORM */}
          {/* ================================================== */}

          <form
            onSubmit={handleSubmit}
            className="p-7 sm:p-8"
            noValidate
          >

            {/* Error */}
            {error && (
              <div
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/15 p-3.5 text-sm text-red-100"
                role="alert"
              >
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <span className="leading-5">
                  {error}
                </span>
              </div>
            )}

            {/* ================================================== */}
            {/* USERNAME */}
            {/* ================================================== */}

            <div className="mb-5">
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-semibold text-white"
              >
                Username
              </label>

              <div className="relative">
                <User
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                />

                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError("");
                  }}
                  required
                  autoComplete="username"
                  autoFocus
                  disabled={loading}
                  className="w-full rounded-xl border border-white/20 bg-white/10 py-3.5 pl-11 pr-4 text-white outline-none transition-all placeholder:text-gray-400 focus:border-green-400 focus:bg-white/15 focus:ring-4 focus:ring-green-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            {/* ================================================== */}
            {/* PASSWORD */}
            {/* ================================================== */}

            <div className="mb-6">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-white"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-white/20 bg-white/10 py-3.5 pl-11 pr-12 text-white outline-none transition-all placeholder:text-gray-400 focus:border-green-400 focus:bg-white/15 focus:ring-4 focus:ring-green-500/15 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* ================================================== */}
            {/* LOGIN BUTTON */}
            {/* ================================================== */}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#087A3D] to-[#075B30] py-3.5 font-bold text-white shadow-lg shadow-green-900/30 transition-all duration-300 hover:from-[#09964B] hover:to-[#087A3D] hover:shadow-green-900/40 focus:outline-none focus:ring-4 focus:ring-green-400/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={19}
                    className="animate-spin"
                  />
                  Signing In...
                </>
              ) : (
                <>
                  <ShieldCheck size={19} />
                  Sign In
                </>
              )}
            </button>

            {/* ================================================== */}
            {/* SECURITY NOTICE */}
            {/* ================================================== */}

            <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-gray-300">
              <Lock size={13} />
              <span>
                Authorized personnel only
              </span>
            </div>

            {/* ================================================== */}
            {/* FOOTER */}
            {/* ================================================== */}

            <div className="mt-4 text-center text-xs text-gray-400">
              © 2026 AUM Volunteer Registration System
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}