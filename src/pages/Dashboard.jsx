import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  UserRound,
  Briefcase,
  UserX,
  ShieldCheck,
  Calendar,
  MapPin,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Target,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatsCard from "../components/StatsCard";

import api, { getAssetUrl } from "../services/Api";
import { getAdminPollingUnits } from "../services/LocationApi";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_volunteers: 0,
    male: 0,
    female: 0,
    employed: 0,
    unemployed: 0,
    aum_members: 0,
    physically_challenged: 0,
    assigned_to_polling_unit: 0,
    unassigned_to_polling_unit: 0,
    polling_unit_target: 0,
    polling_units: 0,
  });

  const [recentVolunteers, setRecentVolunteers] = useState([]);
  const [registrationByLGA, setRegistrationByLGA] = useState([]);
  const [locationUnits, setLocationUnits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      api.get("/api/admin/dashboard"),
      api.get("/api/admin/volunteers/recent"),
      api.get("/api/admin/analytics/lga"),
      getAdminPollingUnits(),
    ]);

    const [
      statsResult,
      recentResult,
      lgaResult,
      locationResult,
    ] = results;

    let hasError = false;

    // ---------------------------------------------------------
    // DASHBOARD STATS
    // ---------------------------------------------------------

    if (statsResult.status === "fulfilled") {
      const payload = statsResult.value?.data;

      if (payload && typeof payload === "object") {
        setStats((prev) => ({
          ...prev,
          ...payload,
        }));
      }
    } else {
      hasError = true;
      console.error(
        "Dashboard stats error:",
        statsResult.reason
      );
    }

    // ---------------------------------------------------------
    // RECENT VOLUNTEERS
    // ---------------------------------------------------------

    if (recentResult.status === "fulfilled") {
      const payload = recentResult.value?.data;

      const data = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : [];

      setRecentVolunteers(data);
    } else {
      hasError = true;
      console.error(
        "Recent volunteers error:",
        recentResult.reason
      );

      setRecentVolunteers([]);
    }

    // ---------------------------------------------------------
    // LGA ANALYTICS
    // ---------------------------------------------------------

    if (lgaResult.status === "fulfilled") {
      const payload = lgaResult.value?.data;

      const data = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : [];

      setRegistrationByLGA(data);
    } else {
      hasError = true;
      console.error(
        "LGA analytics error:",
        lgaResult.reason
      );

      setRegistrationByLGA([]);
    }

    // ---------------------------------------------------------
    // POLLING UNITS
    // ---------------------------------------------------------

    if (locationResult.status === "fulfilled") {
      const payload = locationResult.value;

      const rawUnits = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
        ? payload.data
        : [];

      const normalizedUnits = rawUnits.map((unit) => {
        const target = Number(
          unit?.target_members ?? 200
        );

        const members = Number(
          unit?.registered_members ??
            unit?.member_count ??
            0
        );

        const progress =
          target > 0
            ? Math.round((members / target) * 100)
            : 0;

        return {
          ...unit,

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

          member_count: members,

          target_members: target,

          progress_percent: progress,
        };
      });

      setLocationUnits(normalizedUnits);
    } else {
      hasError = true;

      console.error(
        "Polling units error:",
        locationResult.reason
      );

      setLocationUnits([]);
    }

    if (hasError) {
      setError(
        "Some dashboard information could not be loaded. Please check the backend connection."
      );
    }

    setLoading(false);
  };

  // -----------------------------------------------------------
  // SAFE VALUES
  // -----------------------------------------------------------

  const total = Number(stats?.total_volunteers || 0);

  const male = Number(stats?.male || 0);

  const female = Number(stats?.female || 0);

  const employed = Number(
    stats?.employed || 0
  );

  const unemployed = Number(
    stats?.unemployed || 0
  );

  const aumMembers = Number(
    stats?.aum_members ??
      stats?.aum_volunteers ??
      0
  );

  const pollingUnits = Number(
    stats?.polling_units || 0
  );

  const pollingUnitTarget = Number(
    stats?.polling_unit_target ??
      stats?.target_members ??
      0
  );

  // -----------------------------------------------------------
  // GENDER DATA
  // -----------------------------------------------------------

  const genderData = useMemo(
    () => [
      {
        name: "Male",
        value: male,
      },
      {
        name: "Female",
        value: female,
      },
    ],
    [male, female]
  );

  const COLORS = ["#16a34a", "#ec4899"];

  // -----------------------------------------------------------
  // POLLING UNIT COVERAGE
  // -----------------------------------------------------------

  const occupiedUnits = useMemo(() => {
    if (!Array.isArray(locationUnits)) {
      return [];
    }

    return locationUnits
      .filter(
        (unit) =>
          Number(unit?.member_count || 0) > 0
      )
      .slice(0, 8);
  }, [locationUnits]);

  const registeredUnitCount = useMemo(() => {
    if (!Array.isArray(locationUnits)) {
      return 0;
    }

    return locationUnits.filter(
      (unit) =>
        Number(unit?.member_count || 0) > 0
    ).length;
  }, [locationUnits]);

  const getImageUrl = getAssetUrl;

  // -----------------------------------------------------------
  // LOADING
  // -----------------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-green-700" />

            <p className="mt-4 text-lg text-gray-600">
              Loading dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------
  // DASHBOARD
  // -----------------------------------------------------------

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="relative flex flex-1 flex-col">
        {/* Background */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(6,26,53,.96), rgba(8,122,61,.92))",
          }}
        />

        <div className="absolute inset-0 z-0 bg-black/50 backdrop-blur-[2px]" />

        {/* Navbar */}
        <Navbar />

        {/* Content */}
        <div className="relative z-10 flex-1 space-y-8 overflow-y-auto p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                AUM Volunteer Dashboard
              </h1>

              <p className="mt-1 text-white/70">
                AUM Volunteer Management
              </p>
            </div>

            <div className="mt-4 flex gap-3 md:mt-0">
              <a
                href="/exports"
                className="rounded-lg border border-white/30 bg-white/90 px-4 py-2 text-gray-800 shadow-sm backdrop-blur-sm transition hover:bg-white"
              >
                Export Report
              </a>

              <a
                href="/volunteers"
                className="rounded-lg bg-green-700 px-4 py-2 text-white shadow transition hover:bg-green-800"
              >
                Manage Volunteers
              </a>
            </div>
          </div>

          {/* API warning */}
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-semibold text-yellow-800">
              <AlertCircle className="mt-0.5 shrink-0" size={20} />

              <div>
                <p>{error}</p>

                <button
                  type="button"
                  onClick={fetchDashboardData}
                  className="mt-2 font-bold underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              title="Total Volunteers"
              value={total}
              icon={Users}
              color="bg-blue-600"
            />

            <StatsCard
              title="Male"
              value={male}
              icon={UserCheck}
              color="bg-green-600"
            />

            <StatsCard
              title="Female"
              value={female}
              icon={UserRound}
              color="bg-pink-600"
            />

            <StatsCard
              title="Employed"
              value={employed}
              icon={Briefcase}
              color="bg-purple-600"
            />

            <StatsCard
              title="Unemployed"
              value={unemployed}
              icon={UserX}
              color="bg-red-600"
            />

            <StatsCard
              title="AUM Volunteers"
              value={aumMembers}
              icon={ShieldCheck}
              color="bg-orange-600"
            />

            <StatsCard
              title="Polling Units"
              value={pollingUnits}
              icon={MapPin}
              color="bg-teal-600"
            />

            <StatsCard
              title="Unit Target"
              value={pollingUnitTarget}
              icon={Target}
              color="bg-yellow-600"
            />
          </div>

          {/* Charts */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* LGA */}
            <div className="rounded-2xl border border-white/30 bg-white/90 p-6 shadow-lg backdrop-blur-md">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
                <MapPin className="h-5 w-5 text-green-700" />
                Registration by LGA
              </h2>

              {registrationByLGA.length === 0 ? (
                <div className="flex h-60 items-center justify-center text-gray-500">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={registrationByLGA}
                    margin={{
                      top: 5,
                      right: 20,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="lga"
                      tick={{ fontSize: 12 }}
                    />

                    <YAxis allowDecimals={false} />

                    <Tooltip />

                    <Bar
                      dataKey="count"
                      fill="#16a34a"
                      radius={[8, 8, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Gender */}
            <div className="rounded-2xl border border-white/30 bg-white/90 p-6 shadow-lg backdrop-blur-md">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
                <Users className="h-5 w-5 text-green-700" />
                Gender Distribution
              </h2>

              {total === 0 ? (
                <div className="flex h-60 items-center justify-center text-gray-500">
                  No volunteers yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {genderData.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              COLORS[
                                index %
                                  COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Polling Unit Coverage */}
          <section className="rounded-2xl border border-white/30 bg-white/90 p-6 shadow-lg backdrop-blur-md">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800">
                  <MapPin className="h-5 w-5 text-green-700" />
                  Polling Unit Coverage
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Each registered volunteer is assigned to one ward and one polling unit.
                </p>
              </div>

              <a
                href="/polling-units"
                className="inline-flex items-center justify-center rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800"
              >
                Manage Polling Units
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </a>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {occupiedUnits.map((unit) => {
                const progress = Math.min(
                  Number(
                    unit.progress_percent || 0
                  ),
                  100
                );

                return (
                  <div
                    key={unit.id}
                    className="rounded-xl border border-green-100 bg-green-50/60 p-4"
                  >
                    <div className="text-xs font-bold uppercase tracking-wider text-green-700">
                      {unit.unit_code}
                    </div>

                    <div
                      className="mt-1 truncate font-bold text-gray-800"
                      title={unit.unit_name}
                    >
                      {unit.unit_name}
                    </div>

                    <div className="mt-1 text-xs text-gray-500">
                      {unit.lga} • {unit.ward}
                    </div>

                    <div className="mt-3 flex items-end justify-between">
                      <span className="text-xl font-black text-gray-900">
                        {unit.member_count}
                      </span>

                      <span className="text-xs font-bold text-green-700">
                        / {unit.target_members}
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 rounded-full bg-green-100">
                      <div
                        className="h-full rounded-full bg-green-600"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>

                    <div className="mt-1 text-right text-xs font-semibold text-gray-500">
                      {progress}%
                    </div>
                  </div>
                );
              })}
            </div>

            {registeredUnitCount === 0 && (
              <div className="mt-5 rounded-xl border border-dashed p-8 text-center text-sm text-gray-500">
                No polling unit registrations yet.
              </div>
            )}
          </section>

          {/* Recent registrations */}
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/30 bg-white/90 p-6 shadow-lg backdrop-blur-md lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800">
                  <Calendar className="h-5 w-5 text-green-700" />
                  Recent Registrations
                </h2>

                <a
                  href="/volunteers"
                  className="flex items-center text-sm text-green-700 hover:underline"
                >
                  View All
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </a>
              </div>

              {recentVolunteers.length === 0 ? (
                <div className="py-10 text-center text-gray-500">
                  No recent registrations
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/80 text-gray-600">
                      <tr>
                        <th className="p-3 text-left">
                          Photo
                        </th>

                        <th className="p-3 text-left">
                          Reg No
                        </th>

                        <th className="p-3 text-left">
                          Name
                        </th>

                        <th className="p-3 text-left">
                          Phone
                        </th>

                        <th className="p-3 text-left">
                          LGA
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {recentVolunteers.map((volunteer) => (
                        <tr
                          key={volunteer.id}
                          className="transition hover:bg-white/60"
                        >
                          <td className="p-3">
                            {volunteer.passport ? (
                              <img
                                src={getImageUrl(
                                  volunteer.passport
                                )}
                                alt=""
                                className="h-8 w-8 rounded-full border border-gray-200 object-cover"
                              />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-400">
                                —
                              </div>
                            )}
                          </td>

                          <td className="p-3 font-medium text-gray-800">
                            {volunteer.registration_no}
                          </td>

                          <td className="p-3">
                            {volunteer.name}
                          </td>

                          <td className="p-3 text-gray-500">
                            {volunteer.phone}
                          </td>

                          <td className="p-3 text-gray-500">
                            {volunteer.lga}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Growth */}
            <div className="rounded-2xl bg-gradient-to-br from-green-800 to-green-600 p-6 text-white shadow-lg">
              <h2 className="text-xl font-bold">
                Volunteer Growth
              </h2>

              <div className="mt-6">
                <span className="text-5xl font-black">
                  {total}
                </span>

                <p className="mt-2 text-green-100">
                  Active volunteers
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Self Employed</span>

                  <span className="font-bold">
                    {stats.self_employed || 0}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Unemployed</span>

                  <span className="font-bold">
                    {unemployed}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Employed</span>

                  <span className="font-bold">
                    {employed}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Assigned to Units</span>

                  <span className="font-bold">
                    {stats.assigned_to_polling_unit || 0}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Unassigned</span>

                  <span className="font-bold">
                    {stats.unassigned_to_polling_unit || 0}
                  </span>
                </div>
              </div>

              <div className="mt-8 border-t border-green-500 pt-6">
                <p className="text-sm text-green-100">
                  System Status
                </p>

                <p className="text-lg font-bold">
                  Online
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}