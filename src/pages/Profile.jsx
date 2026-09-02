import { useEffect, useMemo, useState } from "react";
import {
  User,
  Mail,
  Shield,
  Lock,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  CalendarDays,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/Api";

export default function Profile() {
  const [profile, setProfile] = useState({
    username: "",
    role: "",
  });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [updatingPassword, setUpdatingPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // LOAD ADMIN PROFILE
  // ============================================================

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/api/admin/me");

      setProfile({
        username: res.data?.username || "",
        role: res.data?.role || "",
      });
    } catch (err) {
      console.error("Failed to load admin profile:", err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load administrator profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL
  // ============================================================

  const profileInitial = useMemo(() => {
    const username = profile.username?.trim();

    if (!username) {
      return "A";
    }

    return username.charAt(0).toUpperCase();
  }, [profile.username]);

  // ============================================================
  // UPDATE PASSWORD
  // ============================================================

  const updatePassword = async () => {
    setError("");
    setSuccess("");

    // ----------------------------------------------------------
    // Validation
    // ----------------------------------------------------------

    if (!password.trim()) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setUpdatingPassword(true);

      await api.put(
        "/api/admin/change-password",
        {
          password,
        }
      );

      setPassword("");
      setConfirmPassword("");

      setSuccess(
        "Your password has been updated successfully."
      );
    } catch (err) {
      console.error(
        "Failed to update password:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to update password. Please try again."
      );
    } finally {
      setUpdatingPassword(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-100">
        <Sidebar />

        <div className="flex-1 min-w-0">
          <Navbar />

          <main className="p-5 md:p-8">
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <Loader2
                  size={40}
                  className="mx-auto animate-spin text-green-600"
                />

                <p className="mt-4 text-sm font-medium text-slate-500">
                  Loading administrator profile...
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* ====================================================== */}
      {/* SIDEBAR */}
      {/* ====================================================== */}

      <Sidebar />

      {/* ====================================================== */}
      {/* MAIN */}
      {/* ====================================================== */}

      <div className="flex-1 min-w-0">
        <Navbar />

        <main className="p-5 md:p-8">

          {/* ================================================== */}
          {/* HEADER */}
          {/* ================================================== */}

          <div className="mb-8">
            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
                <User
                  size={28}
                  className="text-green-700"
                />
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                  Admin Profile
                </h1>

                <p className="mt-1 text-slate-500">
                  Manage your AUM administrator account.
                </p>
              </div>

            </div>
          </div>

          {/* ================================================== */}
          {/* ERROR */}
          {/* ================================================== */}

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">

              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0"
              />

              <p className="text-sm font-medium">
                {error}
              </p>

            </div>
          )}

          {/* ================================================== */}
          {/* SUCCESS */}
          {/* ================================================== */}

          {success && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">

              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0"
              />

              <p className="text-sm font-medium">
                {success}
              </p>

            </div>
          )}

          {/* ================================================== */}
          {/* CONTENT */}
          {/* ================================================== */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ================================================= */}
            {/* PROFILE SUMMARY */}
            {/* ================================================= */}

            <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

              <div className="text-center">

                {/* Avatar */}

                <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#075b30] to-[#07833f] text-5xl font-black text-white shadow-xl ring-8 ring-green-50">

                  {profileInitial}

                </div>

                {/* Username */}

                <h2 className="mt-6 break-words text-2xl font-bold text-slate-900">
                  {profile.username || "Administrator"}
                </h2>

                {/* Role */}

                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">

                  <Shield size={16} />

                  {profile.role || "Administrator"}

                </div>

              </div>

              {/* Account status */}

              <div className="mt-8 rounded-2xl border border-green-100 bg-green-50 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">

                    <CheckCircle2
                      size={20}
                      className="text-green-600"
                    />

                  </div>

                  <div>

                    <p className="text-xs font-bold uppercase tracking-wider text-green-600">
                      Account Status
                    </p>

                    <p className="mt-1 font-bold text-green-800">
                      Active
                    </p>

                  </div>

                </div>

              </div>

              {/* Security */}

              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">

                    <KeyRound
                      size={19}
                      className="text-slate-600"
                    />

                  </div>

                  <div>

                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Security
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      Protected administrator account
                    </p>

                  </div>

                </div>

              </div>

            </section>

            {/* ================================================= */}
            {/* ACCOUNT INFORMATION */}
            {/* ================================================= */}

            <section className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-7 md:p-8 shadow-sm">

              <div className="mb-7">

                <h2 className="text-2xl font-bold text-slate-900">
                  Account Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your administrator account information.
                </p>

              </div>

              <div className="space-y-5">

                {/* Username */}

                <div>

                  <label
                    htmlFor="username"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Username
                  </label>

                  <div className="relative">

                    <User
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="username"
                      value={profile.username}
                      disabled
                      className="
                        w-full
                        rounded-xl
                        border border-slate-200
                        bg-slate-50
                        py-3.5
                        pl-12
                        pr-4
                        text-slate-600
                        outline-none
                      "
                    />

                  </div>

                </div>

                {/* Email */}

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email
                  </label>

                  <div className="relative">

                    <Mail
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="email"
                      type="email"
                      value="exigpadamuyouthvolunteers@gmail.com"
                      disabled
                      className="
                        w-full
                        rounded-xl
                        border border-slate-200
                        bg-slate-50
                        py-3.5
                        pl-12
                        pr-4
                        text-slate-600
                        outline-none
                      "
                    />

                  </div>

                </div>

                {/* Role */}

                <div>

                  <label
                    htmlFor="role"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Role
                  </label>

                  <div className="relative">

                    <Shield
                      size={19}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="role"
                      value={profile.role}
                      disabled
                      className="
                        w-full
                        rounded-xl
                        border border-slate-200
                        bg-slate-50
                        py-3.5
                        pl-12
                        pr-4
                        text-slate-600
                        outline-none
                      "
                    />

                  </div>

                </div>

                {/* Divider */}

                <div className="border-t border-slate-100 pt-7">

                  <div className="mb-6">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">

                        <Lock
                          size={19}
                          className="text-green-700"
                        />

                      </div>

                      <div>

                        <h3 className="font-bold text-slate-900">
                          Change Password
                        </h3>

                        <p className="text-sm text-slate-500">
                          Update your administrator password.
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* New password */}

                  <div className="mb-5">

                    <label
                      htmlFor="new-password"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      New Password
                    </label>

                    <div className="relative">

                      <Lock
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="new-password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                          setSuccess("");
                        }}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        className="
                          w-full
                          rounded-xl
                          border border-slate-200
                          bg-white
                          py-3.5
                          pl-12
                          pr-12
                          text-slate-700
                          outline-none
                          transition
                          focus:border-green-500
                          focus:ring-4
                          focus:ring-green-100
                        "
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >

                        {showPassword ? (
                          <EyeOff size={19} />
                        ) : (
                          <Eye size={19} />
                        )}

                      </button>

                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Password must contain at least 8 characters.
                    </p>

                  </div>

                  {/* Confirm password */}

                  <div className="mb-6">

                    <label
                      htmlFor="confirm-password"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Confirm New Password
                    </label>

                    <div className="relative">

                      <Lock
                        size={19}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="confirm-password"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(
                            e.target.value
                          );
                          setError("");
                          setSuccess("");
                        }}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        className="
                          w-full
                          rounded-xl
                          border border-slate-200
                          bg-white
                          py-3.5
                          pl-12
                          pr-12
                          text-slate-700
                          outline-none
                          transition
                          focus:border-green-500
                          focus:ring-4
                          focus:ring-green-100
                        "
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            !showConfirmPassword
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >

                        {showConfirmPassword ? (
                          <EyeOff size={19} />
                        ) : (
                          <Eye size={19} />
                        )}

                      </button>

                    </div>

                  </div>

                  {/* Save */}

                  <button
                    type="button"
                    onClick={updatePassword}
                    disabled={updatingPassword}
                    className="
                      inline-flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-gradient-to-r
                      from-[#075b30]
                      to-[#07833f]
                      px-6
                      py-3.5
                      font-semibold
                      text-white
                      shadow-lg
                      shadow-green-900/10
                      transition
                      hover:from-[#064725]
                      hover:to-[#075b30]
                      focus:outline-none
                      focus:ring-4
                      focus:ring-green-200
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >

                    {updatingPassword ? (
                      <>
                        <Loader2
                          size={19}
                          className="animate-spin"
                        />

                        Updating Password...
                      </>
                    ) : (
                      <>
                        <Save size={19} />

                        Update Password
                      </>
                    )}

                  </button>

                </div>

              </div>

            </section>

          </div>

          {/* ================================================== */}
          {/* FOOTER INFO */}
          {/* ================================================== */}

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500 shadow-sm">

            <CalendarDays
              size={18}
              className="text-slate-400"
            />

            <span>
              AUM Administrator Management System
            </span>

          </div>

        </main>
      </div>
    </div>
  );
}