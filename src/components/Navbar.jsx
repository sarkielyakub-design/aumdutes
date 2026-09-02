import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Settings,
  UserCircle,
  CalendarDays,
  CheckCheck,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";

import api from "../services/Api";

export default function Navbar() {
  const navigate = useNavigate();

  // ============================================================
  // DATE
  // ============================================================

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ============================================================
  // ADMIN PROFILE
  // ============================================================

  const [profile, setProfile] = useState({
    username: "",
    role: "",
  });

  const [profileLoading, setProfileLoading] =
    useState(true);

  // ============================================================
  // SEARCH
  // ============================================================

  const [search, setSearch] = useState("");

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  const [notifications, setNotifications] = useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [showNotifDropdown, setShowNotifDropdown] =
    useState(false);

  const [notificationsLoading, setNotificationsLoading] =
    useState(false);

  const notifRef = useRef(null);

  // ============================================================
  // LOAD ADMIN PROFILE
  // ============================================================

  useEffect(() => {
    loadProfile();
    fetchNotifications();
  }, []);

  const loadProfile = async () => {
    try {
      setProfileLoading(true);

      const res = await api.get(
        "/api/admin/me"
      );

      setProfile({
        username:
          res.data?.username || "Administrator",

        role:
          res.data?.role || "Super Admin",
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
  // FETCH NOTIFICATIONS
  // ============================================================

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);

      const res = await api.get(
        "/api/admin/notifications"
      );

      const data = Array.isArray(res.data)
        ? res.data
        : [];

      const latest = data
        .sort((a, b) => {
          const dateA = new Date(
            a?.created_at || 0
          ).getTime();

          const dateB = new Date(
            b?.created_at || 0
          ).getTime();

          return dateB - dateA;
        })
        .slice(0, 5);

      setNotifications(latest);

      setUnreadCount(
        latest.filter(
          (notification) =>
            !notification?.read
        ).length
      );
    } catch (error) {
      console.error(
        "Failed to fetch notifications:",
        error
      );

      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // ============================================================
  // CLOSE NOTIFICATION DROPDOWN
  // ============================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target)
      ) {
        setShowNotifDropdown(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ============================================================
  // MARK NOTIFICATION READ
  // ============================================================

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification
      )
    );

    setUnreadCount((prev) =>
      Math.max(0, prev - 1)
    );
  };

  // ============================================================
  // MARK ALL READ
  // ============================================================

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
      }))
    );

    setUnreadCount(0);
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearch = (event) => {
    event.preventDefault();

    const keyword = search.trim();

    if (!keyword) {
      return;
    }

    navigate(
      `/volunteers?search=${encodeURIComponent(
        keyword
      )}`
    );
  };

  const clearSearch = () => {
    setSearch("");
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
  // ROLE DISPLAY
  // ============================================================

  const displayRole =
    profile.role || "Super Admin";

  return (
    <header
      className="
        sticky
        top-0
        z-30
        bg-white
        border-b
        border-slate-200
        px-4
        md:px-6
        lg:px-8
        py-3
      "
    >
      <div className="flex items-center justify-between gap-4">

        {/* ================================================== */}
        {/* LEFT */}
        {/* ================================================== */}

        <div className="shrink-0">

          <h1 className="text-lg md:text-2xl font-bold text-slate-900">
            AUM Volunteer System
          </h1>

          <div className="hidden sm:flex items-center gap-2 mt-1">

            <CalendarDays
              size={14}
              className="text-slate-400"
            />

            <span className="text-xs md:text-sm text-slate-500">
              {today}
            </span>

          </div>

        </div>

        {/* ================================================== */}
        {/* SEARCH */}
        {/* ================================================== */}

        <form
          onSubmit={handleSearch}
          className="
            hidden
            xl:block
            flex-1
            max-w-xl
            mx-6
          "
        >
          <div className="relative">

            <Search
              size={18}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-400
                pointer-events-none
              "
            />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search volunteers..."
              className="
                w-full
                bg-slate-100
                border
                border-slate-200
                rounded-xl
                pl-11
                pr-11
                py-3
                text-sm
                text-slate-700
                placeholder:text-slate-400
                outline-none
                transition
                focus:bg-white
                focus:border-green-500
                focus:ring-4
                focus:ring-green-100
              "
            />

            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                  hover:text-slate-600
                "
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            )}

          </div>
        </form>

        {/* ================================================== */}
        {/* RIGHT */}
        {/* ================================================== */}

        <div className="flex items-center gap-2 md:gap-3">

          {/* ================================================= */}
          {/* NOTIFICATIONS */}
          {/* ================================================= */}

          <div
            className="relative"
            ref={notifRef}
          >

            <button
              type="button"
              onClick={() => {
                setShowNotifDropdown(
                  (prev) => !prev
                );

                if (!showNotifDropdown) {
                  fetchNotifications();
                }
              }}
              className="
                relative
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-slate-100
                text-slate-600
                transition
                hover:bg-slate-200
                hover:text-slate-900
              "
              aria-label="Notifications"
            >

              <Bell size={20} />

              {unreadCount > 0 && (
                <span
                  className="
                    absolute
                    -right-1
                    -top-1
                    flex
                    h-5
                    min-w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-red-500
                    px-1
                    text-[10px]
                    font-bold
                    text-white
                    ring-2
                    ring-white
                  "
                >
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}

            </button>

            {/* ============================================= */}
            {/* NOTIFICATION DROPDOWN */}
            {/* ============================================= */}

            {showNotifDropdown && (
              <div
                className="
                  absolute
                  right-0
                  mt-3
                  w-[350px]
                  max-w-[calc(100vw-24px)]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  shadow-2xl
                  z-50
                "
              >

                {/* Header */}

                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">

                  <div>

                    <h3 className="font-bold text-slate-900">
                      Notifications
                    </h3>

                    <p className="text-xs text-slate-400 mt-0.5">
                      Recent system activity
                    </p>

                  </div>

                  <div className="flex items-center gap-1">

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="
                          flex
                          items-center
                          gap-1
                          rounded-lg
                          px-2
                          py-1.5
                          text-xs
                          font-semibold
                          text-green-700
                          hover:bg-green-50
                        "
                      >
                        <CheckCheck size={14} />
                        Read all
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setShowNotifDropdown(
                          false
                        )
                      }
                      className="
                        rounded-lg
                        p-1.5
                        text-slate-400
                        hover:bg-slate-100
                        hover:text-slate-700
                      "
                      aria-label="Close notifications"
                    >
                      <X size={17} />
                    </button>

                  </div>

                </div>

                {/* Notification list */}

                <div className="max-h-[360px] overflow-y-auto">

                  {notificationsLoading ? (
                    <div className="flex flex-col items-center justify-center px-5 py-10">

                      <Loader2
                        size={28}
                        className="animate-spin text-green-600"
                      />

                      <p className="mt-3 text-sm text-slate-500">
                        Loading notifications...
                      </p>

                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-5 py-10 text-center">

                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">

                        <Bell
                          size={20}
                          className="text-slate-400"
                        />

                      </div>

                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        No notifications
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        You're all caught up.
                      </p>

                    </div>
                  ) : (
                    notifications.map(
                      (notification, index) => (
                        <button
                          type="button"
                          key={
                            notification.id ??
                            index
                          }
                          onClick={() =>
                            markAsRead(
                              notification.id
                            )
                          }
                          className={`
                            block
                            w-full
                            text-left
                            border-b
                            border-slate-100
                            px-4
                            py-4
                            transition
                            hover:bg-slate-50
                            ${
                              !notification.read
                                ? "bg-green-50/50"
                                : "bg-white"
                            }
                          `}
                        >

                          <div className="flex gap-3">

                            <div
                              className={`
                                mt-1
                                h-2
                                w-2
                                shrink-0
                                rounded-full
                                ${
                                  !notification.read
                                    ? "bg-green-500"
                                    : "bg-slate-200"
                                }
                              `}
                            />

                            <div className="min-w-0">

                              <p
                                className={`
                                  text-sm
                                  leading-5
                                  ${
                                    !notification.read
                                      ? "font-semibold text-slate-900"
                                      : "text-slate-600"
                                  }
                                `}
                              >
                                {notification.message ||
                                  "New notification"}
                              </p>

                              {notification.created_at && (
                                <p className="mt-1.5 text-xs text-slate-400">
                                  {new Date(
                                    notification.created_at
                                  ).toLocaleString()}
                                </p>
                              )}

                            </div>

                          </div>

                        </button>
                      )
                    )
                  )}

                </div>

                {/* Footer */}

                <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">

                  <button
                    type="button"
                    onClick={() =>
                      setShowNotifDropdown(
                        false
                      )
                    }
                    className="
                      w-full
                      rounded-lg
                      py-2
                      text-center
                      text-xs
                      font-semibold
                      text-slate-500
                      transition
                      hover:bg-white
                      hover:text-slate-700
                    "
                  >
                    Close
                  </button>

                </div>

              </div>
            )}

          </div>

          {/* ================================================= */}
          {/* SETTINGS */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={() =>
              navigate("/profile")
            }
            className="
              hidden
              sm:flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-slate-100
              text-slate-600
              transition
              hover:bg-slate-200
              hover:text-slate-900
            "
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>

          {/* ================================================= */}
          {/* ADMIN PROFILE */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={() =>
              navigate("/profile")
            }
            className="
              flex
              items-center
              gap-2
              md:gap-3
              rounded-2xl
              bg-slate-100
              px-2
              md:px-3
              py-1.5
              md:py-2
              transition
              hover:bg-slate-200
            "
          >

            {/* Avatar */}

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-gradient-to-br
                from-[#075b30]
                to-[#07833f]
                text-sm
                font-bold
                text-white
                shadow-sm
              "
            >
              {profileLoading ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                adminInitial
              )}
            </div>

            {/* Name */}

            <div className="hidden md:block text-left">

              <h3 className="max-w-[140px] truncate text-sm font-bold text-slate-900">
                {profileLoading
                  ? "Administrator"
                  : profile.username}
              </h3>

              <div className="flex items-center gap-1">

                <ShieldCheck
                  size={11}
                  className="text-green-600"
                />

                <p className="max-w-[120px] truncate text-[11px] text-slate-500">
                  {displayRole}
                </p>

              </div>

            </div>

            <UserCircle
              size={18}
              className="hidden lg:block text-slate-400"
            />

          </button>

        </div>
      </div>
    </header>
  );
}