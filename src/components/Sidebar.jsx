import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  UserCog,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import api from "../services/Api";

export default function Sidebar() {
  // ============================================================
  // STATE
  // ============================================================

  const [open, setOpen] = useState(false);

  const [profile, setProfile] = useState({
    username: "",
    role: "",
  });

  const [profileLoading, setProfileLoading] =
    useState(true);

  // ============================================================
  // ROUTER / AUTH
  // ============================================================

  const location = useLocation();
  const navigate = useNavigate();

  const { logout } = useAuth();

  // ============================================================
  // MENU
  // ============================================================

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Volunteers",
      path: "/volunteers",
      icon: Users,
    },
    {
      name: "Export Center",
      path: "/exports",
      icon: FileSpreadsheet,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: UserCog,
    },
  ];

  // ============================================================
  // LOAD ADMIN PROFILE
  // ============================================================

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setProfileLoading(true);

      const res = await api.get(
        "/api/admin/me"
      );

      setProfile({
        username:
          res.data?.username ||
          "Administrator",

        role:
          res.data?.role ||
          "Super Admin",
      });
    } catch (error) {
      console.error(
        "Failed to load admin profile:",
        error
      );

      setProfile({
        username: "Administrator",
        role: "Super Admin",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    setOpen(false);

    logout();

    navigate("/");
  };

  // ============================================================
  // ADMIN INITIAL
  // ============================================================

  const adminInitial =
    profile.username &&
    profile.username !== "Administrator"
      ? profile.username
          .trim()
          .charAt(0)
          .toUpperCase()
      : "A";

  // ============================================================
  // ACTIVE ROUTE
  // ============================================================

  const isActiveRoute = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <>
      {/* ====================================================== */}
      {/* MOBILE MENU BUTTON */}
      {/* ====================================================== */}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          md:hidden
          fixed
          top-4
          left-4
          z-50
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-xl
          bg-green-600
          text-white
          shadow-lg
          transition
          hover:bg-green-700
        "
        aria-label="Open navigation menu"
      >
        <Menu size={22} />
      </button>

      {/* ====================================================== */}
      {/* SIDEBAR */}
      {/* ====================================================== */}

      <aside
        className={`
          fixed
          md:sticky
          md:top-0
          top-0
          left-0
          z-40
          flex
          min-h-screen
          w-72
          flex-col
          bg-gradient-to-b
          from-slate-950
          via-slate-900
          to-slate-950
          text-white
          shadow-2xl
          transition-transform
          duration-300
          ease-in-out

          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }

          md:translate-x-0
        `}
      >

        {/* ==================================================== */}
        {/* MOBILE CLOSE */}
        {/* ==================================================== */}

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="
            md:hidden
            absolute
            top-4
            right-4
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            text-slate-300
            transition
            hover:bg-slate-800
            hover:text-white
          "
          aria-label="Close navigation menu"
        >
          <X size={22} />
        </button>

        {/* ==================================================== */}
        {/* BRAND HEADER */}
        {/* ==================================================== */}

        <div
          className="
            border-b
            border-slate-800
            px-6
            py-6
          "
        >
          <div className="flex items-center gap-4">

            <div
              className="
                h-14
                w-14
                shrink-0
                overflow-hidden
                rounded-full
                border-2
                border-green-500
                bg-white
                shadow-lg
              "
            >
              <img
                src="/aum-logo.svg"
                alt="AUM"
                className="
                  h-full
                  w-full
                  object-cover
                "
              />
            </div>

            <div className="min-w-0">

              <h1 className="text-xl font-bold tracking-wide">
                AUM
              </h1>

              <p className="mt-0.5 text-xs text-slate-400">
                Volunteer Management
              </p>

            </div>

          </div>
        </div>

        {/* ==================================================== */}
        {/* ADMIN CARD */}
        {/* ==================================================== */}

        <div className="px-5 py-5">

          <div
            className="
              rounded-2xl
              border
              border-slate-700
              bg-slate-800/80
              p-4
              shadow-inner
            "
          >

            <div className="flex items-center gap-3">

              {/* Avatar */}

              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-gradient-to-br
                  from-green-500
                  to-green-700
                  text-lg
                  font-bold
                  text-white
                  shadow
                "
              >
                {profileLoading ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  adminInitial
                )}
              </div>

              {/* Admin information */}

              <div className="min-w-0">

                <h3 className="truncate font-semibold text-white">
                  {profileLoading
                    ? "Administrator"
                    : profile.username}
                </h3>

                <div className="mt-1 flex items-center gap-1.5">

                  <ShieldCheck
                    size={12}
                    className="shrink-0 text-green-400"
                  />

                  <p className="truncate text-xs text-slate-400">
                    {profileLoading
                      ? "Loading..."
                      : profile.role}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ==================================================== */}
        {/* NAVIGATION */}
        {/* ==================================================== */}

        <nav className="flex-1 px-4">

          <p
            className="
              mb-3
              px-3
              text-[11px]
              font-semibold
              uppercase
              tracking-wider
              text-slate-500
            "
          >
            Main Navigation
          </p>

          <div className="space-y-1.5">

            {menuItems.map((item) => {

              const Icon = item.icon;

              const active =
                isActiveRoute(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() =>
                    setOpen(false)
                  }
                  className={`
                    group
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    px-4
                    py-3
                    transition-all
                    duration-200

                    ${
                      active
                        ? `
                          bg-green-600
                          text-white
                          shadow-lg
                          shadow-green-900/20
                        `
                        : `
                          text-slate-300
                          hover:bg-slate-800
                          hover:text-white
                        `
                    }
                  `}
                >

                  <div className="flex items-center gap-3">

                    <Icon
                      size={20}
                      className={
                        active
                          ? "text-white"
                          : "text-slate-400 group-hover:text-white"
                      }
                    />

                    <span className="font-medium">
                      {item.name}
                    </span>

                  </div>

                  {active && (
                    <ChevronRight
                      size={16}
                      className="text-white"
                    />
                  )}

                </Link>
              );
            })}

          </div>

        </nav>

        {/* ==================================================== */}
        {/* FOOTER */}
        {/* ==================================================== */}

        <div
          className="
            border-t
            border-slate-800
            p-4
          "
        >

          {/* Logout */}

          <button
            type="button"
            onClick={handleLogout}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-red-400
              transition
              hover:bg-red-600
              hover:text-white
            "
          >
            <LogOut size={20} />

            <span className="font-medium">
              Logout
            </span>
          </button>

          {/* Version */}

          <div
            className="
              mt-4
              text-center
              text-[11px]
              leading-5
              text-slate-500
            "
          >
            <div>
              AUM Admin Panel
            </div>

            <div>
              Version 1.0.0
            </div>
          </div>

        </div>

      </aside>

      {/* ====================================================== */}
      {/* MOBILE OVERLAY */}
      {/* ====================================================== */}

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="
            fixed
            inset-0
            z-30
            bg-black/60
            backdrop-blur-[2px]
            md:hidden
          "
          aria-hidden="true"
        />
      )}
    </>
  );
}