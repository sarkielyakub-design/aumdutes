import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Target,
  Users,
  X,
  AlertCircle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  getAdminPollingUnits,
  getPollingUnitMembers,
} from "../services/LocationApi";

import { getAssetUrl } from "../services/Api";

const format = (value) => String(value ?? "").trim();

const normalizeUnit = (unit) => {
  const target = Number(unit?.target_members ?? 200);

  const members = Number(
    unit?.registered_members ??
      unit?.member_count ??
      0
  );

  const remaining = Math.max(
    target - members,
    0
  );

  const progress =
    target > 0
      ? Math.min(
          Math.round((members / target) * 100),
          100
        )
      : 0;

  return {
    ...unit,

    id: unit?.id,

    unit_code:
      unit?.unit_code ??
      unit?.code ??
      "",

    unit_name:
      unit?.unit_name ??
      unit?.name ??
      "",

    lga:
      unit?.lga ??
      unit?.ward?.lga ??
      "",

    ward:
      unit?.ward_name ??
      unit?.ward?.name ??
      "",

    state:
      unit?.state ??
      unit?.ward?.state ??
      "JIGAWA",

    member_count: members,

    target_members: target,

    remaining,

    progress_percent: progress,
  };
};

export default function PollingUnits() {
  const [units, setUnits] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [lga, setLga] = useState("");

  const [ward, setWard] = useState("");

  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState(null);

  const [members, setMembers] = useState([]);

  const [memberLoading, setMemberLoading] =
    useState(false);

  // ==========================================================
  // LOAD POLLING UNITS
  // ==========================================================

  const loadUnits = async (showLoader = true) => {
    try {
      setError("");

      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const params = {};

      if (lga) {
        params.lga = lga;
      }

      /*
       * The backend expects ward_id, not ward name.
       *
       * We filter ward locally because this page's
       * current filter stores the ward name.
       */
      const response =
        await getAdminPollingUnits(params);

      const rawData = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : [];

      const normalized = rawData.map(normalizeUnit);

      setUnits(normalized);
    } catch (err) {
      console.error(
        "Failed to load polling units:",
        err
      );

      setUnits([]);

      setError(
        err?.response?.data?.detail ||
          "Unable to load polling units from the server."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUnits(true);
  }, [lga]);

  // ==========================================================
  // LGA LIST
  // ==========================================================

  const lgas = useMemo(() => {
    if (!Array.isArray(units)) {
      return [];
    }

    return [
      ...new Set(
        units
          .map((unit) => format(unit.lga))
          .filter(Boolean)
      ),
    ].sort();
  }, [units]);

  // ==========================================================
  // WARD LIST
  // ==========================================================

  const wards = useMemo(() => {
    if (!Array.isArray(units)) {
      return [];
    }

    return [
      ...new Set(
        units
          .filter(
            (unit) =>
              !lga ||
              format(unit.lga) === format(lga)
          )
          .map((unit) => format(unit.ward))
          .filter(Boolean)
      ),
    ].sort();
  }, [units, lga]);

  // ==========================================================
  // FILTERED UNITS
  // ==========================================================

  const filtered = useMemo(() => {
    if (!Array.isArray(units)) {
      return [];
    }

    const key = search.trim().toLowerCase();

    return units.filter((unit) => {
      const matchesLga =
        !lga ||
        format(unit.lga) === format(lga);

      const matchesWard =
        !ward ||
        format(unit.ward) === format(ward);

      const matchesSearch =
        !key ||
        [
          unit.unit_name,
          unit.unit_code,
          unit.ward,
          unit.lga,
        ].some((value) =>
          format(value)
            .toLowerCase()
            .includes(key)
        );

      return (
        matchesLga &&
        matchesWard &&
        matchesSearch
      );
    });
  }, [units, lga, ward, search]);

  // ==========================================================
  // TOTALS
  // ==========================================================

  const totals = useMemo(() => {
    if (!Array.isArray(filtered)) {
      return {
        units: 0,
        members: 0,
        target: 0,
        remaining: 0,
        percent: 0,
      };
    }

    const members = filtered.reduce(
      (sum, unit) =>
        sum +
        Number(unit.member_count || 0),
      0
    );

    const target = filtered.reduce(
      (sum, unit) =>
        sum +
        Number(unit.target_members || 200),
      0
    );

    const remaining = Math.max(
      target - members,
      0
    );

    const percent =
      target > 0
        ? Math.min(
            Math.round(
              (members / target) * 100
            ),
            100
          )
        : 0;

    return {
      units: filtered.length,
      members,
      target,
      remaining,
      percent,
    };
  }, [filtered]);

  // ==========================================================
  // OPEN POLLING UNIT
  // ==========================================================

  const openUnit = async (unit) => {
    setSelected(unit);

    setMembers([]);

    setMemberLoading(true);

    try {
      const response =
        await getPollingUnitMembers(unit.id);

      const data = Array.isArray(response)
        ? response
        : Array.isArray(response?.members)
        ? response.members
        : Array.isArray(response?.data)
        ? response.data
        : [];

      setMembers(data);
    } catch (err) {
      console.error(
        "Failed to load polling unit members:",
        err
      );

      setMembers([]);
    } finally {
      setMemberLoading(false);
    }
  };

  // ==========================================================
  // CLOSE
  // ==========================================================

  const closeUnit = () => {
    setSelected(null);
    setMembers([]);
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#061A35] text-white">
      <Sidebar />

      <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden">
        {/* Background */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#061A35] via-[#064A35] to-[#087A3D]" />

        <div className="fixed inset-0 -z-10 bg-black/20" />

        <Navbar />

        {/* ================================================== */}
        {/* MAIN */}
        {/* ================================================== */}

        <main className="w-full flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">

          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <section className="mb-5 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-6 md:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

              <div className="min-w-0">
                <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-yellow-300 sm:text-xs">
                  <Target
                    size={14}
                    className="shrink-0"
                  />

                  <span>
                    200-member target per polling unit
                  </span>
                </div>

                <h1 className="text-2xl font-black sm:text-3xl md:text-4xl">
                  Polling Units
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                  Manage every ward and polling unit
                  separately. Each unit has its own
                  member list and progress toward the
                  200-member target.
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadUnits(false)}
                disabled={refreshing}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <RefreshCw
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                  size={18}
                />

                {refreshing
                  ? "Refreshing..."
                  : "Refresh"}
              </button>
            </div>
          </section>

          {/* ================================================= */}
          {/* ERROR */}
          {/* ================================================= */}

          {error && (
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-red-300/20 bg-red-500/10 p-4 text-sm text-red-100 sm:flex-row sm:items-center">
              <AlertCircle
                size={20}
                className="shrink-0 text-red-300"
              />

              <span className="flex-1">
                {error}
              </span>

              <button
                type="button"
                onClick={() => loadUnits(true)}
                className="rounded-lg bg-white/10 px-3 py-2 font-bold hover:bg-white/20"
              >
                Retry
              </button>
            </div>
          )}

          {/* ================================================= */}
          {/* SUMMARY */}
          {/* ================================================= */}

          <section className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <Summary
              label="Polling Units"
              value={totals.units}
              icon={MapPin}
            />

            <Summary
              label="Registered"
              value={totals.members}
              icon={Users}
            />

            <Summary
              label="Target"
              value={totals.target}
              icon={Target}
            />

            <Summary
              label="Progress"
              value={`${totals.percent}%`}
              icon={ChevronRight}
            />
          </section>

          {/* ================================================= */}
          {/* FILTERS */}
          {/* ================================================= */}

          <section className="mb-5 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-xl sm:rounded-3xl sm:p-5">
            <div className="grid gap-3 md:grid-cols-4">

              {/* LGA */}
              <select
                value={lga}
                onChange={(e) => {
                  setLga(e.target.value);
                  setWard("");
                }}
                className="h-12 min-w-0 rounded-xl border border-white/15 bg-[#092640] px-3 text-sm text-white outline-none focus:border-yellow-400 sm:px-4"
              >
                <option value="">
                  All LGAs
                </option>

                {lgas.map((value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {value}
                  </option>
                ))}
              </select>

              {/* WARD */}
              <select
                value={ward}
                onChange={(e) =>
                  setWard(e.target.value)
                }
                className="h-12 min-w-0 rounded-xl border border-white/15 bg-[#092640] px-3 text-sm text-white outline-none focus:border-yellow-400 sm:px-4"
              >
                <option value="">
                  All Wards
                </option>

                {wards.map((value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {value}
                  </option>
                ))}
              </select>

              {/* SEARCH */}
              <div className="relative md:col-span-2">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 sm:left-4"
                  size={19}
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search polling unit, code, ward..."
                  className="h-12 w-full min-w-0 rounded-xl border border-white/15 bg-black/20 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/35 outline-none focus:border-yellow-400 sm:pl-11"
                />
              </div>
            </div>
          </section>

          {/* ================================================= */}
          {/* POLLING UNITS */}
          {/* ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl sm:rounded-3xl">

            <div className="border-b border-white/10 px-4 py-4 sm:px-5 sm:py-5">
              <h2 className="text-lg font-black sm:text-xl">
                Separate Polling Unit Lists
              </h2>

              <p className="mt-1 text-xs text-white/50 sm:text-sm">
                Click any unit to open its dedicated
                member list.
              </p>
            </div>

            {loading ? (
              <div className="flex min-h-72 items-center justify-center">
                <div className="text-center">
                  <Loader2
                    className="mx-auto animate-spin text-yellow-400"
                    size={36}
                  />

                  <p className="mt-3 text-sm text-white/50">
                    Loading polling units...
                  </p>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center sm:p-14">
                <MapPin
                  className="mx-auto mb-3 text-white/20"
                  size={40}
                />

                <p className="text-sm text-white/50">
                  No polling units match your filters.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 p-3 sm:gap-4 sm:p-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((unit) => (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    onOpen={() =>
                      openUnit(unit)
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* ==================================================== */}
      {/* MOBILE / DESKTOP MODAL */}
      {/* ==================================================== */}

      {selected && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeUnit();
            }
          }}
        >
          <div className="flex max-h-[96vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white text-slate-900 shadow-2xl sm:max-h-[92vh] sm:max-w-6xl sm:rounded-3xl">

            {/* MODAL HEADER */}
            <div className="flex shrink-0 items-start justify-between gap-4 bg-gradient-to-r from-[#075b30] to-[#087A3D] p-4 text-white sm:p-6">

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-green-100 sm:text-xs">
                  Dedicated Polling Unit List
                </p>

                <h2 className="mt-1 truncate text-lg font-black sm:text-2xl">
                  {selected.unit_name}
                </h2>

                <p className="mt-1 truncate text-xs text-white/70 sm:text-sm">
                  {selected.lga} •{" "}
                  {selected.ward} •{" "}
                  {selected.unit_code}
                </p>
              </div>

              <button
                type="button"
                onClick={closeUnit}
                className="shrink-0 rounded-xl bg-white/10 p-2 hover:bg-white/20"
              >
                <X size={22} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6">

              {/* UNIT SUMMARY */}
              <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">

                <SummaryLight
                  label="Members"
                  value={
                    selected.member_count
                  }
                />

                <SummaryLight
                  label="Target"
                  value={
                    selected.target_members
                  }
                />

                <SummaryLight
                  label="Remaining"
                  value={
                    selected.remaining
                  }
                />

                <SummaryLight
                  label="Progress"
                  value={`${selected.progress_percent}%`}
                />
              </div>

              {/* MEMBERS */}
              {memberLoading ? (
                <div className="flex min-h-52 items-center justify-center">
                  <Loader2
                    className="animate-spin text-green-700"
                    size={34}
                  />
                </div>
              ) : members.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-slate-500 sm:p-10">
                  No members registered in this
                  polling unit yet.
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border">

                  {/* MOBILE CARDS */}
                  <div className="divide-y md:hidden">
                    {members.map(
                      (member) => (
                        <div
                          key={member.id}
                          className="p-4"
                        >
                          <div className="flex items-center gap-3">

                            {member.passport ? (
                              <img
                                src={getAssetUrl(
                                  member.passport
                                )}
                                alt=""
                                className="h-11 w-11 shrink-0 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-400">
                                —
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <p className="truncate font-bold text-slate-900">
                                {member.name}
                              </p>

                              <p className="mt-0.5 text-xs font-bold text-green-700">
                                {member.registration_no}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-[10px] font-bold uppercase text-slate-400">
                                Phone
                              </p>

                              <p className="mt-1 truncate">
                                {member.phone ||
                                  "—"}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] font-bold uppercase text-slate-400">
                                Gender
                              </p>

                              <p className="mt-1">
                                {member.gender ||
                                  "—"}
                              </p>
                            </div>

                            <div className="col-span-2">
                              <p className="text-[10px] font-bold uppercase text-slate-400">
                                Joined
                              </p>

                              <p className="mt-1">
                                {member.created_at
                                  ? new Date(
                                      member.created_at
                                    ).toLocaleDateString()
                                  : "—"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* DESKTOP TABLE */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[700px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="p-4">
                            Photo
                          </th>

                          <th className="p-4">
                            Registration No
                          </th>

                          <th className="p-4">
                            Name
                          </th>

                          <th className="p-4">
                            Phone
                          </th>

                          <th className="p-4">
                            Gender
                          </th>

                          <th className="p-4">
                            Joined
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {members.map(
                          (member) => (
                            <tr
                              key={member.id}
                              className="border-t hover:bg-green-50"
                            >
                              <td className="p-4">
                                {member.passport ? (
                                  <img
                                    src={getAssetUrl(
                                      member.passport
                                    )}
                                    alt=""
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-slate-100" />
                                )}
                              </td>

                              <td className="p-4 font-bold text-green-700">
                                {
                                  member.registration_no
                                }
                              </td>

                              <td className="p-4 font-semibold">
                                {member.name}
                              </td>

                              <td className="p-4">
                                {member.phone}
                              </td>

                              <td className="p-4">
                                {member.gender ||
                                  "—"}
                              </td>

                              <td className="p-4">
                                {member.created_at
                                  ? new Date(
                                      member.created_at
                                    ).toLocaleDateString()
                                  : "—"}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SUMMARY
// ============================================================

function Summary({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="min-w-0 rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur-xl sm:rounded-2xl sm:p-4">
      <div className="flex min-w-0 items-center gap-1.5 text-[10px] font-semibold text-white/55 sm:gap-2 sm:text-xs">
        <Icon
          size={15}
          className="shrink-0 sm:h-4 sm:w-4"
        />

        <span className="truncate">
          {label}
        </span>
      </div>

      <div className="mt-1 text-xl font-black sm:mt-2 sm:text-2xl">
        {value}
      </div>
    </div>
  );
}

// ============================================================
// LIGHT SUMMARY
// ============================================================

function SummaryLight({
  label,
  value,
}) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 p-3 sm:rounded-2xl sm:p-4">
      <div className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">
        {label}
      </div>

      <div className="mt-1 truncate text-lg font-black text-slate-800 sm:text-xl">
        {value}
      </div>
    </div>
  );
}

// ============================================================
// UNIT CARD
// ============================================================

function UnitCard({
  unit,
  onOpen,
}) {
  const percent = Math.min(
    Number(unit?.progress_percent || 0),
    100
  );

  const count = Number(
    unit?.member_count || 0
  );

  const target = Number(
    unit?.target_members || 200
  );

  const remaining = Math.max(
    target - count,
    0
  );

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group w-full min-w-0 rounded-2xl border border-white/10 bg-black/10 p-4 text-left transition hover:-translate-y-0.5 hover:border-yellow-400/30 hover:bg-white/10 sm:p-5"
    >
      <div className="flex min-w-0 items-start justify-between gap-3">

        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-bold uppercase tracking-wider text-yellow-300 sm:text-xs">
            {unit.unit_code ||
              "NO CODE"}
          </p>

          <h3
            className="mt-1 truncate font-black text-white"
            title={unit.unit_name}
          >
            {unit.unit_name ||
              "Unnamed Polling Unit"}
          </h3>

          <p className="mt-1 truncate text-xs text-white/45 sm:text-sm">
            {unit.lga || "—"} •{" "}
            {unit.ward || "—"}
          </p>
        </div>

        <ChevronRight
          className="mt-1 shrink-0 text-white/30 transition group-hover:translate-x-1 group-hover:text-yellow-300"
          size={20}
        />
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <span className="text-2xl font-black">
            {count}
          </span>

          <span className="text-sm text-white/45">
            {" "}
            / {target}
          </span>
        </div>

        <span className="text-sm font-bold text-green-300">
          {percent}%
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-500 to-yellow-400 transition-all"
          style={{
            width: `${percent}%`,
          }}
        />
      </div>

      <p className="mt-2 text-xs text-white/45">
        {remaining} members remaining to target
      </p>
    </button>
  );
}