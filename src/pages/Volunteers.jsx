import { useEffect, useState } from "react";
import {
  Search,
  Eye,
  Trash2,
  Download,
  X,
  Users,
  UserCheck,
  Briefcase,
  Accessibility,
  Loader2,
  FileText,
  MapPin,
  Phone,
  GraduationCap,
  Building2,
  QrCode,
  RefreshCw,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api, { getAssetUrl } from "../services/Api";

export default function Volunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [cardLoading, setCardLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [stats, setStats] = useState({
    total_volunteers: 0,
    male: 0,
    female: 0,
    employed: 0,
    unemployed: 0,
    physically_challenged: 0,
    aum_members: 0,
    aum_volunteers: 0,
  });

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [volunteersResponse, statsResponse] = await Promise.all([
        api.get("/api/admin/volunteers"),
        api.get("/api/admin/dashboard"),
      ]);

      console.log("Volunteers:", volunteersResponse.data);
      console.log("Stats:", statsResponse.data);

      const volunteerData = Array.isArray(volunteersResponse.data?.data)
        ? volunteersResponse.data.data
        : Array.isArray(volunteersResponse.data)
        ? volunteersResponse.data
        : [];

      setVolunteers(volunteerData);
      setFilteredVolunteers(volunteerData);

      setStats({
        total_volunteers: statsResponse.data?.total_volunteers ?? 0,
        male: statsResponse.data?.male ?? 0,
        female: statsResponse.data?.female ?? 0,
        employed: statsResponse.data?.employed ?? 0,
        unemployed: statsResponse.data?.unemployed ?? 0,
        physically_challenged:
          statsResponse.data?.physically_challenged ?? 0,
        aum_members:
          statsResponse.data?.aum_members ??
          statsResponse.data?.aum_volunteers ??
          0,
        aum_volunteers:
          statsResponse.data?.aum_volunteers ??
          statsResponse.data?.aum_members ??
          0,
      });
    } catch (error) {
      console.error(
        "Failed to load volunteers:",
        error?.response?.data || error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = (value) => {
    setSearch(value);

    const keyword = value.trim().toLowerCase();

    if (!keyword) {
      setFilteredVolunteers(volunteers);
      return;
    }

    const filtered = volunteers.filter((volunteer) => {
      return (
        volunteer.name?.toLowerCase().includes(keyword) ||
        volunteer.registration_no?.toLowerCase().includes(keyword) ||
        volunteer.phone?.toLowerCase().includes(keyword) ||
        volunteer.lga?.toLowerCase().includes(keyword) ||
        volunteer.ward?.toLowerCase().includes(keyword) ||
        volunteer.unit?.toLowerCase().includes(keyword)
      );
    });

    setFilteredVolunteers(filtered);
  };

  // =========================================================
  // VIEW MEMBER
  // =========================================================

  const viewVolunteer = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedVolunteer(null);
  };

  // =========================================================
  // DELETE MEMBER
  // =========================================================

  const deleteVolunteer = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this volunteer?\n\nThis action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await api.delete(`/api/admin/volunteer/${id}`);

      setVolunteers((previous) =>
        previous.filter((volunteer) => volunteer.id !== id)
      );

      setFilteredVolunteers((previous) =>
        previous.filter((volunteer) => volunteer.id !== id)
      );

      closeModal();

      alert("Volunteer deleted successfully.");
    } catch (error) {
      console.error(
        "Delete error:",
        error?.response?.data || error
      );

      alert(
        error?.response?.data?.detail ||
          "Failed to delete volunteer. Please try again."
      );
    }
  };

  // =========================================================
  // ASSET URL
  // =========================================================

  const getImageUrl = (path) => {
    if (!path) return null;

    try {
      return getAssetUrl(path);
    } catch (error) {
      console.error("Asset URL error:", error);
      return null;
    }
  };

  // =========================================================
  // AUTHENTICATED MEMBERSHIP CARD DOWNLOAD
  // =========================================================
  //
  // IMPORTANT:
  // Do NOT use:
  //
  // <a href="/api/admin/volunteership-card/...">
  //
  // because the endpoint requires Bearer authentication.
  //
  // We use api.get() so the Authorization header/interceptor
  // is included.
  // =========================================================

  const downloadVolunteershipCard = async (registrationNo) => {
    if (!registrationNo) {
      alert("Registration number is missing.");
      return;
    }

    try {
      setCardLoading(true);

      const response = await api.get(
        `/api/admin/volunteership-card/${encodeURIComponent(
          registrationNo
        )}`,
        {
          responseType: "blob",
        }
      );

      const contentType =
        response.headers["content-type"] ||
        "application/pdf";

      const blob = new Blob([response.data], {
        type: contentType,
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `${registrationNo}-volunteership-card.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error(
        "Volunteership card download error:",
        error?.response?.data || error
      );

      if (error?.response?.status === 401) {
        alert(
          "Your admin session has expired. Please login again."
        );
      } else if (error?.response?.status === 404) {
        alert(
          "Volunteership card was not found for this volunteer."
        );
      } else {
        alert(
          "Unable to download volunteership card. Please try again."
        );
      }
    } finally {
      setCardLoading(false);
    }
  };

  // =========================================================
  // AUTHENTICATED MEMBERSHIP CARD VIEW
  // =========================================================

  const viewVolunteershipCard = async (registrationNo) => {
    if (!registrationNo) {
      alert("Registration number is missing.");
      return;
    }

    try {
      setCardLoading(true);

      const response = await api.get(
        `/api/admin/volunteership-card/${encodeURIComponent(
          registrationNo
        )}`,
        {
          responseType: "blob",
        }
      );

      const contentType =
        response.headers["content-type"] ||
        "application/pdf";

      const blob = new Blob([response.data], {
        type: contentType,
      });

      const url = window.URL.createObjectURL(blob);

      const newWindow = window.open(
        "",
        "_blank",
        "noopener,noreferrer"
      );

      if (!newWindow) {
        window.URL.revokeObjectURL(url);

        alert(
          "Your browser blocked the new window. Please allow pop-ups and try again."
        );

        return;
      }

      newWindow.location.href = url;

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);
    } catch (error) {
      console.error(
        "Volunteership card view error:",
        error?.response?.data || error
      );

      if (error?.response?.status === 401) {
        alert(
          "Your admin session has expired. Please login again."
        );
      } else if (error?.response?.status === 404) {
        alert(
          "Volunteership card was not found for this volunteer."
        );
      } else {
        alert(
          "Unable to open volunteership card."
        );
      }
    } finally {
      setCardLoading(false);
    }
  };

  // =========================================================
  // PRINT MEMBER DETAILS
  // =========================================================

  const printVolunteerPDF = (volunteer) => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert(
        "Please allow pop-ups to print volunteer details."
      );
      return;
    }

    const passportUrl = getImageUrl(
      volunteer.passport || volunteer.passport_photo
    );

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>${escapeHtml(volunteer.name || "Volunteer")} - AUM</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              font-family: Arial, Helvetica, sans-serif;
              margin: 0;
              padding: 40px;
              color: #1f2937;
              background: #ffffff;
            }

            .header {
              background: linear-gradient(
                135deg,
                #004d2b,
                #006838
              );
              color: white;
              padding: 30px;
              border-radius: 16px;
              margin-bottom: 30px;
            }

            .header h1 {
              margin: 0;
              font-size: 28px;
            }

            .header p {
              margin-top: 8px;
              color: #f4d03f;
              font-weight: bold;
            }

            .profile {
              display: flex;
              gap: 25px;
              align-items: flex-start;
              margin-bottom: 30px;
            }

            .photo {
              width: 140px;
              height: 140px;
              object-fit: cover;
              border-radius: 14px;
              border: 3px solid #006838;
            }

            .details {
              flex: 1;
            }

            .row {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 15px;
            }

            .item {
              background: #f8fafc;
              border: 1px solid #dbe5dd;
              padding: 12px;
              border-radius: 10px;
            }

            .label {
              font-size: 11px;
              color: #6b7280;
              text-transform: uppercase;
              margin-bottom: 5px;
            }

            .value {
              font-weight: 600;
            }

            .footer {
              margin-top: 40px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #777;
            }

            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>

        <body>

          <div class="header">
            <h1>AUM</h1>
            <p>YOUTH VOLUNTEERS</p>
            <div>Volunteer Registration Details</div>
          </div>

          <div class="profile">

            ${
              passportUrl
                ? `
                <img
                  src="${passportUrl}"
                  class="photo"
                  alt="Passport"
                />
              `
                : ""
            }

            <div class="details">

              <div class="item">
                <div class="label">
                  Registration Number
                </div>

                <div class="value">
                  ${escapeHtml(
                    volunteer.registration_no || "—"
                  )}
                </div>
              </div>

            </div>

          </div>

          <div class="row">

            ${printItem("Full Name", volunteer.name)}

            ${printItem("Phone", volunteer.phone)}

          </div>

          <div class="row">

            ${printItem("Gender", volunteer.gender)}

            ${printItem("Age", volunteer.age)}

          </div>

          <div class="row">

            ${printItem("LGA", volunteer.lga)}

            ${printItem("Ward", volunteer.ward)}

          </div>

          <div class="row">

            ${printItem("Unit", volunteer.unit)}

            ${printItem(
              "Employment",
              volunteer.employment_status
            )}

          </div>

          <div class="row">

            ${printItem(
              "Highest Qualification",
              volunteer.highest_qualification
            )}

            ${printItem(
              "Additional Qualification",
              volunteer.additional_qualification
            )}

          </div>

          <div class="row">

            ${printItem(
              "Specialization",
              volunteer.specialization
            )}

            ${printItem(
              "Physically Challenged",
              volunteer.physically_challenged
                ? "Yes"
                : "No"
            )}

          </div>

          <div class="row">

            ${printItem(
              "Youth Organization Volunteer",
              volunteer.aum_member
                ? "Yes"
                : "No"
            )}

            ${printItem(
              "Organization",
              volunteer.previous_organization
            )}

          </div>

          <div class="row">

            ${printItem(
              "Position",
              volunteer.position
            )}

            ${printItem(
              "Expectations",
              volunteer.expectation
            )}

          </div>

          <div class="footer">
            AUM AUM Volunteers Volunteership System
          </div>

        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  // =========================================================
  // STAT CARDS
  // =========================================================

  const statCards = [
    {
      label: "Total",
      value: stats.total_volunteers,
      icon: Users,
      gradient: "from-emerald-600 to-emerald-400",
    },
    {
      label: "Male",
      value: stats.male,
      icon: UserCheck,
      gradient: "from-blue-600 to-blue-400",
    },
    {
      label: "Female",
      value: stats.female,
      icon: UserCheck,
      gradient: "from-pink-600 to-pink-400",
    },
    {
      label: "Employed",
      value: stats.employed,
      icon: Briefcase,
      gradient: "from-amber-600 to-amber-400",
    },
    {
      label: "Youth Orgs",
      value: stats.aum_volunteers,
      icon: Users,
      gradient: "from-purple-600 to-purple-400",
    },
    {
      label: "Challenged",
      value: stats.physically_challenged,
      icon: Accessibility,
      gradient: "from-rose-600 to-rose-400",
    },
  ];

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#061A35] to-[#087A3D]">
        <div className="text-center text-white">
          <div className="w-20 h-20 mx-auto rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <Loader2 className="animate-spin h-10 w-10 text-yellow-400" />
          </div>

          <p className="mt-5 text-lg font-semibold">
            Loading AUM volunteers...
          </p>

          <p className="text-sm text-white/60 mt-1">
            Please wait
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="flex min-h-screen bg-[#061A35]">

      <Sidebar />

      <div className="flex-1 relative overflow-hidden">

        {/* BACKGROUND */}
        <div
          className="fixed inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #061A35 0%, #064A35 48%, #087A3D 100%)",
          }}
        />

        {/* Decorative glow */}
        <div className="fixed top-[-200px] right-[-150px] w-[500px] h-[500px] rounded-full bg-emerald-400/10 blur-3xl z-0" />

        <div className="fixed bottom-[-200px] left-[-150px] w-[500px] h-[500px] rounded-full bg-yellow-400/5 blur-3xl z-0" />

        {/* OVERLAY */}
        <div className="fixed inset-0 z-0 bg-black/25" />

        <div className="relative z-10 flex flex-col min-h-screen">

          <Navbar />

          <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-7">

            {/* =================================================
                HERO
            ================================================= */}

            <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl">

              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl" />

              <div className="relative p-6 md:p-8">

                <div className="flex flex-col lg:flex-row justify-between gap-6">

                  <div>

                    <div className="flex items-center gap-3">

                      <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-yellow-400" />
                      </div>

                      <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                          AUM
                        </h1>

                        <h2 className="text-yellow-400 text-lg md:text-xl font-bold">
                          YOUTH VOLUNTEERS
                        </h2>
                      </div>

                    </div>

                    <p className="text-white/70 mt-5 max-w-2xl leading-relaxed">
                      Manage registered volunteers, view volunteer profiles,
                      download volunteership cards, and keep the AUM
                      volunteership database organised.
                    </p>

                  </div>

                  {/* REGISTERED */}
                  <div className="flex items-center gap-4 bg-white/10 border border-white/20 backdrop-blur-xl rounded-2xl px-6 py-4 min-w-[190px]">

                    <div className="w-12 h-12 rounded-xl bg-yellow-400/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-yellow-400" />
                    </div>

                    <div>
                      <div className="text-3xl font-black text-white">
                        {stats.total_volunteers}
                      </div>

                      <div className="text-sm text-white/60">
                        Registered Volunteers
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                STATS
            ================================================= */}

            <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">

              {statCards.map((card, index) => {

                const Icon = card.icon;

                return (
                  <div
                    key={index}
                    className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/15"
                  >

                    <div
                      className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.gradient}`}
                    />

                    <div className="flex items-center gap-2 mb-3">

                      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">

                        <Icon className="w-5 h-5 text-white/80" />

                      </div>

                      <span className="text-xs md:text-sm text-white/65 font-medium">
                        {card.label}
                      </span>

                    </div>

                    <div className="text-2xl md:text-3xl font-black">
                      {card.value}
                    </div>

                  </div>
                );
              })}

            </section>

            {/* =================================================
                MEMBERS TABLE
            ================================================= */}

            <section className="rounded-3xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl">

              {/* TABLE HEADER */}

              <div className="p-5 md:p-6 border-b border-white/10">

                <div className="flex flex-col md:flex-row justify-between gap-4">

                  <div>

                    <h2 className="text-xl md:text-2xl font-bold text-white">
                      Registered Volunteers
                    </h2>

                    <p className="text-sm text-white/50 mt-1">
                      {filteredVolunteers.length} volunteer
                      {filteredVolunteers.length === 1 ? "" : "s"} displayed
                    </p>

                  </div>

                  <div className="flex gap-3">

                    <div className="relative w-full md:w-96">

                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />

                      <input
                        type="text"
                        placeholder="Search name, reg no, phone, LGA..."
                        value={search}
                        onChange={(e) =>
                          handleSearch(e.target.value)
                        }
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/20 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/60 focus:border-yellow-400/50 transition"
                      />

                    </div>

                    <button
                      onClick={loadData}
                      title="Refresh volunteers"
                      className="shrink-0 w-12 h-12 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>

                  </div>

                </div>

              </div>

              {/* =================================================
                  DESKTOP TABLE
              ================================================= */}

              <div className="hidden md:block overflow-x-auto">

                <table className="w-full">

                  <thead>

                    <tr className="bg-black/15 text-white/60 text-xs uppercase tracking-wider">

                      <th className="text-left p-4 font-semibold">
                        Photo
                      </th>

                      <th className="text-left p-4 font-semibold">
                        Registration No
                      </th>

                      <th className="text-left p-4 font-semibold">
                        Name
                      </th>

                      <th className="text-left p-4 font-semibold">
                        Phone
                      </th>

                      <th className="text-left p-4 font-semibold">
                        LGA
                      </th>

                      <th className="text-left p-4 font-semibold">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredVolunteers.length === 0 ? (

                      <tr>

                        <td
                          colSpan={6}
                          className="p-14 text-center"
                        >

                          <Users className="w-12 h-12 text-white/20 mx-auto" />

                          <p className="text-white/60 mt-3">
                            No volunteers found.
                          </p>

                        </td>

                      </tr>

                    ) : (

                      filteredVolunteers.map((volunteer) => {

                        const imageUrl = getImageUrl(
                          volunteer.passport ||
                            volunteer.passport_photo
                        );

                        return (

                          <tr
                            key={volunteer.id}
                            className="border-t border-white/10 hover:bg-white/10 transition"
                          >

                            {/* PHOTO */}

                            <td className="p-4">

                              {imageUrl ? (

                                <img
                                  src={imageUrl}
                                  alt={volunteer.name || "Volunteer"}
                                  className="w-11 h-11 rounded-full object-cover border-2 border-white/20"
                                  onError={(event) => {
                                    event.currentTarget.style.display =
                                      "none";
                                  }}
                                />

                              ) : (

                                <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                                  <Users className="w-5 h-5 text-white/40" />
                                </div>

                              )}

                            </td>

                            {/* REGISTRATION */}

                            <td className="p-4">

                              <span className="font-bold text-yellow-400">
                                {volunteer.registration_no || "—"}
                              </span>

                            </td>

                            {/* NAME */}

                            <td className="p-4">

                              <div className="font-semibold text-white">
                                {volunteer.name || "—"}
                              </div>

                            </td>

                            {/* PHONE */}

                            <td className="p-4 text-white/70">
                              {volunteer.phone || "—"}
                            </td>

                            {/* LGA */}

                            <td className="p-4 text-white/70">
                              {volunteer.lga || "—"}
                            </td>

                            {/* ACTIONS */}

                            <td className="p-4">

                              <div className="flex items-center gap-2">

                                <button
                                  onClick={() =>
                                    viewVolunteer(volunteer)
                                  }
                                  title="View volunteer"
                                  className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-400/20 text-blue-300 hover:bg-blue-500 hover:text-white transition flex items-center justify-center"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() =>
                                    downloadVolunteershipCard(
                                      volunteer.registration_no
                                    )
                                  }
                                  disabled={cardLoading}
                                  title="Download volunteership card"
                                  className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400/20 text-emerald-300 hover:bg-emerald-500 hover:text-white transition flex items-center justify-center disabled:opacity-50"
                                >
                                  {cardLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Download className="w-4 h-4" />
                                  )}
                                </button>

                                <button
                                  onClick={() =>
                                    deleteVolunteer(volunteer.id)
                                  }
                                  title="Delete volunteer"
                                  className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-400/20 text-rose-300 hover:bg-rose-500 hover:text-white transition flex items-center justify-center"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>

                              </div>

                            </td>

                          </tr>

                        );
                      })

                    )}

                  </tbody>

                </table>

              </div>

              {/* =================================================
                  MOBILE
              ================================================= */}

              <div className="md:hidden p-4 space-y-4">

                {filteredVolunteers.length === 0 ? (

                  <div className="text-center py-12">

                    <Users className="w-12 h-12 text-white/20 mx-auto" />

                    <p className="text-white/60 mt-3">
                      No volunteers found.
                    </p>

                  </div>

                ) : (

                  filteredVolunteers.map((volunteer) => {

                    const imageUrl = getImageUrl(
                      volunteer.passport ||
                        volunteer.passport_photo
                    );

                    return (

                      <div
                        key={volunteer.id}
                        className="rounded-2xl bg-black/15 border border-white/10 p-4"
                      >

                        <div className="flex items-center gap-4">

                          {imageUrl ? (

                            <img
                              src={imageUrl}
                              alt={volunteer.name || "Volunteer"}
                              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20"
                            />

                          ) : (

                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                              <Users className="w-6 h-6 text-white/40" />
                            </div>

                          )}

                          <div className="min-w-0">

                            <h3 className="font-bold text-white truncate">
                              {volunteer.name || "—"}
                            </h3>

                            <p className="text-sm text-yellow-400 font-semibold">
                              {volunteer.registration_no || "—"}
                            </p>

                            <p className="text-sm text-white/60">
                              {volunteer.phone || "—"}
                            </p>

                          </div>

                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-4">

                          <button
                            onClick={() =>
                              viewVolunteer(volunteer)
                            }
                            className="py-2.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/20 text-sm font-semibold"
                          >
                            <Eye className="inline w-4 h-4 mr-1" />
                            View
                          </button>

                          <button
                            onClick={() =>
                              downloadVolunteershipCard(
                                volunteer.registration_no
                              )
                            }
                            disabled={cardLoading}
                            className="py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 text-sm font-semibold disabled:opacity-50"
                          >
                            <Download className="inline w-4 h-4 mr-1" />
                            Card
                          </button>

                          <button
                            onClick={() =>
                              deleteVolunteer(volunteer.id)
                            }
                            className="py-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/20 text-sm font-semibold"
                          >
                            <Trash2 className="inline w-4 h-4 mr-1" />
                            Delete
                          </button>

                        </div>

                      </div>

                    );
                  })

                )}

              </div>

            </section>

          </main>

        </div>

        {/* =====================================================
            MEMBER MODAL
        ===================================================== */}

        {showModal && selectedVolunteer && (

          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                closeModal();
              }
            }}
          >

            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden">

              {/* MODAL HEADER */}

              <div className="relative bg-gradient-to-r from-[#004d2b] via-[#006838] to-[#087A3D] text-white p-6">

                <button
                  onClick={closeModal}
                  className="absolute right-5 top-5 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-4">

                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-yellow-400" />
                  </div>

                  <div>

                    <h2 className="text-2xl font-black">
                      Volunteer Profile
                    </h2>

                    <p className="text-white/60 text-sm">
                      AUM AUM Volunteers
                    </p>

                  </div>

                </div>

              </div>

              {/* MODAL BODY */}

              <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(92vh-100px)]">

                <div className="flex flex-col lg:flex-row gap-8">

                  {/* PROFILE */}

                  <div className="lg:w-64 shrink-0">

                    <div className="rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 p-5 text-center">

                      {getImageUrl(
                        selectedVolunteer.passport ||
                          selectedVolunteer.passport_photo
                      ) ? (

                        <img
                          src={getImageUrl(
                            selectedVolunteer.passport ||
                              selectedVolunteer.passport_photo
                          )}
                          alt={selectedVolunteer.name || "Volunteer"}
                          className="w-44 h-44 mx-auto rounded-3xl object-cover border-4 border-white shadow-xl"
                        />

                      ) : (

                        <div className="w-44 h-44 mx-auto rounded-3xl bg-green-100 flex items-center justify-center">
                          <Users className="w-16 h-16 text-green-300" />
                        </div>

                      )}

                      <h3 className="text-xl font-black text-gray-800 mt-5">
                        {selectedVolunteer.name || "—"}
                      </h3>

                      <div className="text-green-700 font-bold mt-1">
                        {selectedVolunteer.registration_no || "—"}
                      </div>

                      <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-bold">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        ACTIVE MEMBER
                      </div>

                    </div>

                    {/* QR */}

                    {selectedVolunteer.qr_code && (

                      <div className="mt-5 bg-gray-50 rounded-2xl border p-5 text-center">

                        <QrCode className="w-5 h-5 mx-auto text-green-700 mb-2" />

                        <img
                          src={getImageUrl(
                            selectedVolunteer.qr_code
                          )}
                          alt="Volunteer QR Code"
                          className="w-32 h-32 mx-auto object-contain bg-white rounded-xl p-2"
                        />

                        <p className="text-xs text-gray-500 mt-2">
                          Volunteership QR Code
                        </p>

                      </div>

                    )}

                  </div>

                  {/* DETAILS */}

                  <div className="flex-1">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      <DetailItem
                        icon={Phone}
                        label="Phone"
                        value={selectedVolunteer.phone}
                      />

                      <DetailItem
                        icon={UserCheck}
                        label="Gender"
                        value={selectedVolunteer.gender}
                      />

                      <DetailItem
                        icon={UserCheck}
                        label="Age"
                        value={selectedVolunteer.age}
                      />

                      <DetailItem
                        icon={MapPin}
                        label="LGA"
                        value={selectedVolunteer.lga}
                      />

                      <DetailItem
                        icon={MapPin}
                        label="Ward"
                        value={selectedVolunteer.ward}
                      />

                      <DetailItem
                        icon={Building2}
                        label="Unit"
                        value={selectedVolunteer.unit}
                      />

                      <DetailItem
                        icon={GraduationCap}
                        label="Highest Qualification"
                        value={
                          selectedVolunteer.highest_qualification
                        }
                      />

                      <DetailItem
                        icon={Briefcase}
                        label="Employment"
                        value={
                          selectedVolunteer.employment_status
                        }
                      />

                      <DetailItem
                        icon={GraduationCap}
                        label="Specialization"
                        value={
                          selectedVolunteer.specialization
                        }
                      />

                      <DetailItem
                        icon={FileText}
                        label="Additional Qualification"
                        value={
                          selectedVolunteer.additional_qualification
                        }
                      />

                      <DetailItem
                        icon={Accessibility}
                        label="Physically Challenged"
                        value={
                          selectedVolunteer.physically_challenged
                            ? "Yes"
                            : "No"
                        }
                      />

                      <DetailItem
                        icon={Users}
                        label="Youth Organization"
                        value={
                          selectedVolunteer.aum_member
                            ? "Yes"
                            : "No"
                        }
                      />

                      {selectedVolunteer.previous_organization && (

                        <DetailItem
                          icon={Building2}
                          label="Organization"
                          value={
                            selectedVolunteer.previous_organization
                          }
                        />

                      )}

                      {selectedVolunteer.position && (

                        <DetailItem
                          icon={Briefcase}
                          label="Position"
                          value={selectedVolunteer.position}
                        />

                      )}

                    </div>

                    {/* EXPECTATIONS */}

                    {selectedVolunteer.expectation && (

                      <div className="mt-6">

                        <h3 className="text-sm font-bold text-gray-700 mb-2">
                          Expectations
                        </h3>

                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-600 leading-relaxed">
                          {selectedVolunteer.expectation}
                        </div>

                      </div>

                    )}

                    {/* ACTIONS */}

                    <div className="mt-7 pt-6 border-t flex flex-wrap gap-3">

                      <button
                        onClick={() =>
                          downloadVolunteershipCard(
                            selectedVolunteer.registration_no
                          )
                        }
                        disabled={cardLoading}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold shadow-lg transition disabled:opacity-50"
                      >

                        {cardLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Download className="w-5 h-5" />
                        )}

                        Download Volunteership Card

                      </button>

                      <button
                        onClick={() =>
                          viewVolunteershipCard(
                            selectedVolunteer.registration_no
                          )
                        }
                        disabled={cardLoading}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-bold shadow-lg transition disabled:opacity-50"
                      >

                        <Eye className="w-5 h-5" />

                        View Card

                      </button>

                      <button
                        onClick={() =>
                          printVolunteerPDF(selectedVolunteer)
                        }
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg transition"
                      >

                        <FileText className="w-5 h-5" />

                        Volunteer Details

                      </button>

                      <button
                        onClick={() =>
                          deleteVolunteer(selectedVolunteer.id)
                        }
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg transition"
                      >

                        <Trash2 className="w-5 h-5" />

                        Delete Volunteer

                      </button>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

// =============================================================
// DETAIL ITEM
// =============================================================

function DetailItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 hover:bg-green-50/50 transition">

      <div className="flex items-center gap-2 mb-2">

        {Icon && (
          <Icon className="w-4 h-4 text-green-700" />
        )}

        <p className="text-[11px] text-gray-500 uppercase tracking-wider font-bold">
          {label}
        </p>

      </div>

      <p className="font-semibold text-gray-800 break-words">
        {value === null ||
        value === undefined ||
        value === ""
          ? "—"
          : String(value)}
      </p>

    </div>
  );
}

// =============================================================
// PRINT HELPERS
// =============================================================

function escapeHtml(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function printItem(label, value) {
  return `
    <div class="item">
      <div class="label">
        ${escapeHtml(label)}
      </div>

      <div class="value">
        ${escapeHtml(
          value === null ||
            value === undefined ||
            value === ""
            ? "—"
            : String(value)
        )}
      </div>
    </div>
  `;
}