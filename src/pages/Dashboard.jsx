import { useEffect, useState } from "react";
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

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [recentVolunteers, setRecentVolunteers] = useState([]);
  const [registrationByLGA, setRegistrationByLGA] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Use the dedicated recent endpoint instead of query params
      const [statsRes, recentRes, lgaRes] = await Promise.all([
        api.get("/api/admin/dashboard"),
        api.get("/api/admin/volunteers/recent"),   // ✅ new dedicated endpoint
        api.get("/api/admin/analytics/lga"),
      ]);
      setStats(statsRes.data);
      // /volunteers/recent returns a plain array, not { data: [...] }
      setRecentVolunteers(recentRes.data || []);
      setRegistrationByLGA(lgaRes.data || []);
    } catch (error) {
      console.error("Dashboard fetch error", error);
      // If API fails, leave empty states – no mock data
    } finally {
      setLoading(false);
    }
  };

  const total = stats.total_volunteers || 0;
  const male = stats.male || 0;
  const female = stats.female || 0;

  const genderData = [
    { name: "Male", value: male },
    { name: "Female", value: female },
  ];
  const COLORS = ["#16a34a", "#ec4899"];

  const getImageUrl = getAssetUrl;

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-green-700 mx-auto" />
            <p className="mt-4 text-lg text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col relative">
        {/* AUM Background */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: "linear-gradient(135deg, rgba(6,26,53,.96), rgba(8,122,61,.92))" }}
        />
        <div className="absolute inset-0 z-0 bg-black/50 backdrop-blur-[2px]" />

        {/* Navbar (should contain bell, settings, avatar) */}
        <Navbar />

        {/* Dashboard Content */}
        <div className="relative z-10 flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                Government Dashboard
              </h1>
              <p className="text-white/70 mt-1">
                AUM AUM Volunteer Management
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button className="bg-white/90 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-lg shadow-sm text-gray-800 hover:bg-white transition">
                Export Report
              </button>
              <button className="bg-green-700 text-white px-4 py-2 rounded-lg shadow hover:bg-green-800 transition">
                Generate ID Cards
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <StatsCard title="Total Volunteers" value={total} icon={Users} color="bg-blue-600" />
            <StatsCard title="Male" value={male} icon={UserCheck} color="bg-green-600" />
            <StatsCard title="Female" value={female} icon={UserRound} color="bg-pink-600" />
            <StatsCard title="Employed" value={stats.employed || 0} icon={Briefcase} color="bg-purple-600" />
            <StatsCard title="Unemployed" value={stats.unemployed || 0} icon={UserX} color="bg-red-600" />
            <StatsCard title="AUM Volunteers" value={stats.aum_volunteers || 0} icon={ShieldCheck} color="bg-orange-600" />
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* LGA Bar Chart */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/30">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-700" />
                Registration by LGA
              </h2>
              {registrationByLGA.length === 0 ? (
                <div className="flex items-center justify-center h-60 text-gray-500">No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={registrationByLGA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="lga" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#16a34a" radius={[8, 8, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Gender Pie Chart */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/30">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-700" />
                Gender Distribution
              </h2>
              {total === 0 ? (
                <div className="flex items-center justify-center h-60 text-gray-500">No volunteers yet</div>
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
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent Registrations & Growth */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Volunteers Table */}
            <div className="lg:col-span-2 bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-700" />
                  Recent Registrations
                </h2>
                <a href="/admin/volunteers" className="text-sm text-green-700 hover:underline flex items-center">
                  View All <ArrowUpRight className="w-4 h-4 ml-1" />
                </a>
              </div>
              {recentVolunteers.length === 0 ? (
                <div className="py-10 text-center text-gray-500">No recent registrations</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/80 text-gray-600">
                      <tr>
                        <th className="p-3 text-left">Photo</th>
                        <th className="p-3 text-left">Reg No</th>
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Phone</th>
                        <th className="p-3 text-left">LGA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentVolunteers.map((v) => (
                        <tr key={v.id} className="hover:bg-white/60 transition">
                          <td className="p-3">
                            <img
                              src={getImageUrl(v.passport)}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-gray-200"
                            />
                          </td>
                          <td className="p-3 font-medium text-gray-800">{v.registration_no}</td>
                          <td className="p-3">{v.name}</td>
                          <td className="p-3 text-gray-500">{v.phone}</td>
                          <td className="p-3 text-gray-500">{v.lga}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Growth Card */}
<div className="bg-gradient-to-br from-green-800 to-green-600 rounded-2xl p-6 text-white shadow-lg">
  <h2 className="text-xl font-bold">Volunteer Growth</h2>
  <div className="mt-6">
    <span className="text-5xl font-black">{total}</span>
    <p className="text-green-100 mt-2">Active volunteers</p>
  </div>
  <div className="mt-8 space-y-3">
    <div className="flex justify-between text-sm">
      <span>Self Employed</span>
      <span className="font-bold">{stats.self_employed || 0}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span>Unemployed</span>
      <span className="font-bold">{stats.unemployed || 0}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span>Employed</span>
      <span className="font-bold">{stats.employed || 0}</span>
    </div>
  </div>
  <div className="mt-8 pt-6 border-t border-green-500">
    <p className="text-green-100 text-sm">System Status</p>
    <p className="font-bold text-lg">Online</p>
  </div>
</div>
          </div>
        </div>
      </div>
    </div>
  );
}