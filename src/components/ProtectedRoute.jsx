import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token, logout } = useAuth();
  const location = useLocation();

  // ============================================================
  // NO TOKEN
  // ============================================================

  if (!token) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  // ============================================================
  // VERIFY JWT
  // ============================================================

  try {
    const parts = token.split(".");

    // A valid JWT must contain:
    // header.payload.signature

    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    // ----------------------------------------------------------
    // Decode JWT payload safely
    // ----------------------------------------------------------

    const base64Payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const paddedPayload =
      base64Payload.padEnd(
        Math.ceil(base64Payload.length / 4) * 4,
        "="
      );

    const payload = JSON.parse(
      atob(paddedPayload)
    );

    // ----------------------------------------------------------
    // Check expiration
    // ----------------------------------------------------------

    const currentTime =
      Math.floor(Date.now() / 1000);

    if (
      payload.exp &&
      Number(payload.exp) <= currentTime
    ) {
      console.warn(
        "Authentication token has expired."
      );

      // Clear AuthContext + localStorage
      logout();

      return (
        <Navigate
          to="/"
          replace
          state={{
            sessionExpired: true,
          }}
        />
      );
    }

    // ----------------------------------------------------------
    // Optional: reject token without expiration
    // ----------------------------------------------------------
    //
    // If your backend always provides exp,
    // this makes the route stricter.
    //
    // Uncomment if required:
    //
    // if (!payload.exp) {
    //   logout();
    //   return <Navigate to="/" replace />;
    // }

  } catch (error) {
    console.error(
      "Invalid authentication token:",
      error
    );

    // Clear authentication state
    logout();

    return (
      <Navigate
        to="/"
        replace
        state={{
          sessionExpired: false,
        }}
      />
    );
  }

  // ============================================================
  // AUTHENTICATED
  // ============================================================

  return children;
}