import { useState } from "react";

import {
  X,
  Phone,
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  BadgeCheck,
  CalendarDays,
  Building2,
  Users,
  ShieldCheck,
  Download,
  Printer,
  HeartHandshake,
  Loader2,
  AlertCircle,
} from "lucide-react";

import api, { getAssetUrl } from "../services/Api";

export default function VolunteerModal({ volunteer, onClose }) {
  const [cardLoading, setCardLoading] = useState(false);
  const [cardAction, setCardAction] = useState(null);

  if (!volunteer) return null;

  // ==========================================================
  // MEMBER ASSETS
  // ==========================================================

  const passportPath =
    volunteer.passport ||
    volunteer.passport_photo ||
    volunteer.photo ||
    null;

  const passportUrl = passportPath
    ? getAssetUrl(passportPath)
    : null;

  const qrPath =
    volunteer.qr_code ||
    volunteer.qr ||
    null;

  const qrUrl = qrPath
    ? getAssetUrl(qrPath)
    : null;

  // ==========================================================
  // JOINED DATE
  // ==========================================================

  const joinedDate = volunteer.created_at
    ? new Date(volunteer.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  // ==========================================================
  // AUTHENTICATED MEMBERSHIP CARD REQUEST
  // ==========================================================
  //
  // IMPORTANT:
  //
  // DO NOT use:
  //
  // getAssetUrl(`/api/admin/volunteership-card/...`)
  //
  // or:
  //
  // <a href="...">
  //
  // because the endpoint requires the admin Bearer token.
  //
  // We use the authenticated Axios instance instead.
  // ==========================================================

  const fetchVolunteershipCard = async () => {
    if (!volunteer.registration_no) {
      throw new Error(
        "Volunteer registration number is missing."
      );
    }

    const response = await api.get(
      `/api/admin/volunteership-card/${encodeURIComponent(
        volunteer.registration_no
      )}`,
      {
        responseType: "blob",
      }
    );

    const contentType =
      response.headers["content-type"] ||
      "application/pdf";

    return new Blob([response.data], {
      type: contentType,
    });
  };

  // ==========================================================
  // DOWNLOAD CARD
  // ==========================================================

  const downloadCard = async () => {
    if (cardLoading) return;

    try {
      setCardLoading(true);
      setCardAction("download");

      const blob = await fetchVolunteershipCard();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `${
        volunteer.registration_no || "AUM-volunteer"
      }-volunteership-card.pdf`;

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

      await handleCardError(error);
    } finally {
      setCardLoading(false);
      setCardAction(null);
    }
  };

  // ==========================================================
  // VIEW / PRINT CARD
  // ==========================================================

  const printCard = async () => {
    if (cardLoading) return;

    try {
      setCardLoading(true);
      setCardAction("print");

      // Open window immediately so popup blockers do not block it.
      const cardWindow = window.open(
        "",
        "_blank",
        "width=1200,height=900"
      );

      if (!cardWindow) {
        alert(
          "Your browser blocked the volunteership card window. Please allow pop-ups and try again."
        );

        return;
      }

      cardWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>AUM Volunteer Card</title>

            <style>
              html,
              body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                background: #111827;
                font-family: Arial, Helvetica, sans-serif;
              }

              .loading {
                width: 100%;
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 18px;
              }

              iframe {
                width: 100%;
                height: 100vh;
                border: 0;
              }
            </style>
          </head>

          <body>
            <div class="loading">
              Loading volunteership card...
            </div>
          </body>
        </html>
      `);

      cardWindow.document.close();

      const blob = await fetchVolunteershipCard();

      const url = window.URL.createObjectURL(blob);

      cardWindow.document.body.innerHTML = `
        <iframe
          src="${url}"
          title="AUM Volunteer Card"
        ></iframe>
      `;

      // Revoke later so the PDF remains available in the window.
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 120000);
    } catch (error) {
      console.error(
        "Volunteership card print/view error:",
        error?.response?.data || error
      );

      await handleCardError(error);
    } finally {
      setCardLoading(false);
      setCardAction(null);
    }
  };

  // ==========================================================
  // CARD ERROR HANDLER
  // ==========================================================

  const handleCardError = async (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      alert(
        "Your admin session has expired. Please login again."
      );
      return;
    }

    if (status === 403) {
      alert(
        "You are not authorised to access this volunteership card."
      );
      return;
    }

    if (status === 404) {
      alert(
        "Volunteership card was not found for this volunteer."
      );
      return;
    }

    if (status === 405) {
      alert(
        "The volunteership card endpoint does not accept this request method. Please check the backend route."
      );
      return;
    }

    if (status >= 500) {
      alert(
        "The server encountered an error while generating the volunteership card."
      );
      return;
    }

    alert(
      "Unable to load the volunteership card. Please try again."
    );
  };

  // ==========================================================
  // PRINT MEMBER DETAILS
  // ==========================================================

  const printVolunteerDetails = () => {
    const printWindow = window.open(
      "",
      "_blank",
      "width=1000,height=900"
    );

    if (!printWindow) {
      alert(
        "Please allow pop-ups to print volunteer details."
      );
      return;
    }

    const passport = passportUrl
      ? `
        <img
          src="${escapeHtml(passportUrl)}"
          class="passport"
          alt="Volunteer passport"
        />
      `
      : `
        <div class="passport placeholder">
          AUM
        </div>
      `;

    const html = `
      <!DOCTYPE html>

      <html>

        <head>

          <meta charset="UTF-8" />

          <title>
            ${escapeHtml(volunteer.name || "AUM Volunteer")}
            - AUM
          </title>

          <style>

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 40px;
              font-family:
                Arial,
                Helvetica,
                sans-serif;
              color: #1f2937;
              background: #ffffff;
            }

            .header {
              background:
                linear-gradient(
                  135deg,
                  #063b24,
                  #07833f
                );

              color: white;

              padding: 30px;

              border-radius: 18px;

              margin-bottom: 30px;
            }

            .header h1 {
              margin: 0;
              font-size: 30px;
              font-weight: 900;
            }

            .header h2 {
              margin: 6px 0 0;
              color: #d4a017;
              font-size: 18px;
            }

            .header p {
              margin: 10px 0 0;
              color: rgba(255,255,255,0.8);
              font-size: 13px;
            }

            .profile {
              display: flex;
              gap: 25px;
              align-items: center;
              margin-bottom: 30px;
            }

            .passport {
              width: 140px;
              height: 140px;
              object-fit: cover;
              border-radius: 18px;
              border: 4px solid #07833f;
            }

            .placeholder {
              display: flex;
              align-items: center;
              justify-content: center;
              background: #eef7f1;
              color: #07833f;
              font-weight: 900;
            }

            .profile-info {
              flex: 1;
            }

            .profile-info h2 {
              margin: 0;
              color: #063b24;
              font-size: 25px;
            }

            .registration {
              margin-top: 7px;
              color: #07833f;
              font-weight: 900;
              font-size: 16px;
            }

            .status {
              display: inline-block;
              margin-top: 12px;
              padding: 7px 13px;
              border-radius: 30px;
              background: #dcfce7;
              color: #166534;
              font-size: 11px;
              font-weight: 900;
            }

            .section-title {
              margin-top: 30px;
              margin-bottom: 15px;
              padding-bottom: 8px;
              border-bottom: 2px solid #dff1e5;
              color: #075b30;
              font-size: 16px;
              font-weight: 900;
            }

            .grid {
              display: grid;
              grid-template-columns:
                repeat(2, minmax(0, 1fr));
              gap: 12px;
            }

            .item {
              padding: 14px;
              border-radius: 12px;
              background: #f7faf8;
              border: 1px solid #e5eee8;
            }

            .label {
              color: #7b8794;
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 1px;
              font-weight: 900;
            }

            .value {
              margin-top: 6px;
              color: #1f2937;
              font-size: 13px;
              font-weight: 700;
              word-break: break-word;
            }

            .expectation {
              margin-top: 12px;
              padding: 15px;
              background: #f7faf8;
              border: 1px solid #e5eee8;
              border-radius: 12px;
            }

            .footer {
              margin-top: 40px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
              text-align: center;
              color: #777;
              font-size: 10px;
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

            <h2>YOUTH VOLUNTEERS</h2>

            <p>
              AMB. USMAN MOVEMENT
            </p>

          </div>

          <div class="profile">

            ${passport}

            <div class="profile-info">

              <h2>
                ${escapeHtml(
                  volunteer.name || "Unknown Volunteer"
                )}
              </h2>

              <div class="registration">
                ${escapeHtml(
                  volunteer.registration_no || "—"
                )}
              </div>

              <div class="status">
                ACTIVE MEMBER
              </div>

            </div>

          </div>

          <div class="section-title">
            Personal Information
          </div>

          <div class="grid">

            ${printItem("Phone Number", volunteer.phone)}

            ${printItem("Gender", volunteer.gender)}

            ${printItem("Age", volunteer.age)}

            ${printItem(
              "Registration Number",
              volunteer.registration_no
            )}

          </div>

          <div class="section-title">
            Location Information
          </div>

          <div class="grid">

            ${printItem("LGA", volunteer.lga)}

            ${printItem("Ward", volunteer.ward)}

            ${printItem("Unit", volunteer.unit)}

          </div>

          <div class="section-title">
            Educational Information
          </div>

          <div class="grid">

            ${printItem(
              "Highest Qualification",
              volunteer.highest_qualification
            )}

            ${printItem(
              "Additional Qualification",
              volunteer.additional_qualification
            )}

            ${printItem(
              "Specialization",
              volunteer.specialization
            )}

          </div>

          <div class="section-title">
            Employment Information
          </div>

          <div class="grid">

            ${printItem(
              "Employment Status",
              volunteer.employment_status
            )}

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

            ${printItem(
              "Position",
              volunteer.position
            )}

          </div>

          <div class="section-title">
            Additional Information
          </div>

          <div class="grid">

            ${printItem(
              "Physically Challenged",
              volunteer.physically_challenged
                ? "Yes"
                : "No"
            )}

          </div>

          ${
            volunteer.expectation
              ? `
                <div class="section-title">
                  Volunteer Expectations
                </div>

                <div class="expectation">
                  ${escapeHtml(volunteer.expectation)}
                </div>
              `
              : ""
          }

          <div class="footer">
            AUM AUM Volunteers Volunteership System
            <br />
            Volunteer since ${escapeHtml(joinedDate)}
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

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-[#021d11]/80
        backdrop-blur-md
        flex items-center justify-center
        p-3 sm:p-5
      "
      onClick={onClose}
    >

      <div
        className="
          relative
          bg-white
          w-full
          max-w-6xl
          max-h-[95vh]
          overflow-y-auto
          rounded-[28px]
          sm:rounded-[34px]
          shadow-[0_30px_100px_rgba(0,0,0,0.35)]
          overflow-hidden
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        {/* ====================================================
            TOP BRAND HEADER
        ===================================================== */}

        <div
          className="
            relative
            overflow-hidden
            bg-gradient-to-r
            from-[#063b24]
            via-[#075b30]
            to-[#07833f]
            text-white
          "
        >

          {/* Watermark */}

          <div
            className="
              absolute
              inset-0
              bg-center
              bg-no-repeat
              bg-contain
              opacity-[0.055]
              pointer-events-none
            "
            style={{
              backgroundImage:
                "url('/aum-logo.png')",
              backgroundSize: "420px",
            }}
          />

          {/* Gold line */}

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#d4a017]" />

          <div className="relative px-5 sm:px-8 py-6">

            <div className="flex items-center justify-between gap-4">

              {/* Branding */}

              <div className="flex items-center gap-4">

                <div
                  className="
                    w-14 h-14
                    sm:w-16 sm:h-16
                    rounded-full
                    bg-white
                    p-1.5
                    shadow-lg
                    shrink-0
                  "
                >

                  <img
                    src="/aum-logo.png"
                    alt="AUM"
                    className="w-full h-full object-contain"
                  />

                </div>

                <div>

                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-green-200 font-bold">
                    AUM
                  </p>

                  <h2 className="text-xl sm:text-2xl font-black">
                    Volunteer Profile
                  </h2>

                  <p className="text-xs sm:text-sm text-green-100/80 mt-1">
                    AMB. USMAN MOVEMENT
                  </p>

                </div>

              </div>

              {/* Close */}

              <button
                type="button"
                onClick={onClose}
                className="
                  w-10 h-10
                  rounded-xl
                  bg-white/10
                  hover:bg-white/20
                  border border-white/10
                  flex items-center justify-center
                  transition
                  shrink-0
                "
                aria-label="Close"
              >
                <X size={22} />
              </button>

            </div>

          </div>

        </div>

        {/* ====================================================
            PROFILE CONTENT
        ===================================================== */}

        <div className="grid lg:grid-cols-[280px_1fr]">

          {/* ==================================================
              LEFT PROFILE
          =================================================== */}

          <aside
            className="
              relative
              bg-[#f5faf7]
              border-b
              lg:border-b-0
              lg:border-r
              border-green-100
            "
          >

            {/* Watermark */}

            <div
              className="
                absolute inset-0
                bg-center
                bg-no-repeat
                bg-contain
                opacity-[0.025]
                pointer-events-none
              "
              style={{
                backgroundImage:
                  "url('/aum-logo.png')",
                backgroundSize: "250px",
              }}
            />

            <div className="relative p-6 sm:p-8">

              {/* Photo */}

              <div className="flex justify-center">

                <div
                  className="
                    relative
                    w-36 h-36
                    sm:w-40 sm:h-40
                  "
                >

                  <div
                    className="
                      absolute -inset-2
                      rounded-[26px]
                      bg-gradient-to-br
                      from-[#07833f]
                      via-[#075b30]
                      to-[#d4a017]
                      opacity-90
                    "
                  />

                  <div
                    className="
                      relative
                      w-full h-full
                      rounded-[22px]
                      overflow-hidden
                      bg-white
                      p-1
                      shadow-xl
                    "
                  >

                    {passportUrl ? (

                      <img
                        src={passportUrl}
                        alt={volunteer.name || "Volunteer"}
                        className="
                          w-full
                          h-full
                          object-cover
                          rounded-[18px]
                        "
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />

                    ) : (

                      <div
                        className="
                          w-full h-full
                          rounded-[18px]
                          bg-gray-100
                          flex
                          items-center
                          justify-center
                        "
                      >
                        <User className="w-14 h-14 text-gray-300" />
                      </div>

                    )}

                  </div>

                </div>

              </div>

              {/* Name */}

              <div className="text-center mt-7">

                <h3 className="text-xl font-black text-[#063b24] break-words">
                  {volunteer.name || "Unknown Volunteer"}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  AUM Volunteer
                </p>

              </div>

              {/* Status */}

              <div className="flex justify-center mt-5">

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-4 py-2
                    rounded-full
                    bg-green-100
                    border border-green-200
                    text-[#075b30]
                    text-xs
                    font-black
                    tracking-wide
                  "
                >

                  <span className="w-2 h-2 rounded-full bg-[#07833f]" />

                  ACTIVE MEMBER

                </div>

              </div>

              {/* Registration */}

              <div
                className="
                  mt-7
                  rounded-2xl
                  bg-white
                  border border-green-100
                  p-4
                  shadow-sm
                "
              >

                <div className="flex items-center gap-2 text-gray-400">

                  <BadgeCheck size={16} />

                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Volunteership Number
                  </span>

                </div>

                <p className="mt-2 text-lg font-black text-[#075b30] break-all">
                  {volunteer.registration_no || "—"}
                </p>

              </div>

              {/* Joined */}

              <div className="mt-4 flex items-center gap-3 px-2">

                <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">

                  <CalendarDays
                    size={17}
                    className="text-[#07833f]"
                  />

                </div>

                <div>

                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                    Volunteer Since
                  </p>

                  <p className="text-sm font-semibold text-gray-700">
                    {joinedDate}
                  </p>

                </div>

              </div>

              {/* QR */}

              {qrUrl && (

                <div
                  className="
                    mt-5
                    rounded-2xl
                    bg-white
                    border border-green-100
                    p-4
                    text-center
                  "
                >

                  <img
                    src={qrUrl}
                    alt="Volunteership QR Code"
                    className="w-28 h-28 mx-auto object-contain"
                  />

                  <p className="text-xs text-gray-400 mt-2">
                    Volunteership QR Code
                  </p>

                </div>

              )}

            </div>

          </aside>

          {/* ==================================================
              RIGHT DETAILS
          =================================================== */}

          <section className="p-5 sm:p-8 lg:p-10">

            {/* Section title */}

            <div className="flex items-start gap-3 mb-7">

              <div
                className="
                  w-11 h-11
                  rounded-xl
                  bg-green-100
                  text-[#07833f]
                  flex items-center justify-center
                  shrink-0
                "
              >
                <ShieldCheck size={21} />
              </div>

              <div>

                <h3 className="text-xl font-black text-[#075b30]">
                  Registration Details
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Official information associated with this AUM volunteer.
                </p>

              </div>

            </div>

            {/* PERSONAL */}

            <DetailSection
              title="Personal Information"
              icon={<User size={18} />}
            >

              <DetailCard
                icon={<Phone size={17} />}
                label="Phone Number"
                value={volunteer.phone}
              />

              <DetailCard
                icon={<User size={17} />}
                label="Gender"
                value={volunteer.gender}
              />

              <DetailCard
                icon={<CalendarDays size={17} />}
                label="Age"
                value={volunteer.age}
              />

              <DetailCard
                icon={<BadgeCheck size={17} />}
                label="Registration Number"
                value={volunteer.registration_no}
                highlight
              />

            </DetailSection>

            {/* LOCATION */}

            <DetailSection
              title="Location Information"
              icon={<MapPin size={18} />}
            >

              <DetailCard
                icon={<MapPin size={17} />}
                label="Local Government Area"
                value={volunteer.lga}
              />

              <DetailCard
                icon={<MapPin size={17} />}
                label="Ward"
                value={volunteer.ward}
              />

              <DetailCard
                icon={<Building2 size={17} />}
                label="Unit"
                value={volunteer.unit}
              />

            </DetailSection>

            {/* EDUCATION */}

            <DetailSection
              title="Educational Information"
              icon={<GraduationCap size={18} />}
            >

              <DetailCard
                icon={<GraduationCap size={17} />}
                label="Highest Qualification"
                value={volunteer.highest_qualification}
                full
              />

              <DetailCard
                icon={<GraduationCap size={17} />}
                label="Additional Qualification"
                value={volunteer.additional_qualification}
              />

              <DetailCard
                icon={<GraduationCap size={17} />}
                label="Specialization"
                value={volunteer.specialization}
              />

            </DetailSection>

            {/* EMPLOYMENT */}

            <DetailSection
              title="Employment Information"
              icon={<Briefcase size={18} />}
            >

              <DetailCard
                icon={<Briefcase size={17} />}
                label="Employment Status"
                value={volunteer.employment_status}
              />

              <DetailCard
                icon={<Users size={17} />}
                label="Youth Organization Volunteer"
                value={
                  volunteer.aum_member
                    ? "Yes"
                    : "No"
                }
              />

              {volunteer.aum_member && (
                <>
                  <DetailCard
                    icon={<Building2 size={17} />}
                    label="Organization"
                    value={volunteer.previous_organization}
                  />

                  <DetailCard
                    icon={<BadgeCheck size={17} />}
                    label="Position"
                    value={volunteer.position}
                  />
                </>
              )}

            </DetailSection>

            {/* ADDITIONAL */}

            <DetailSection
              title="Additional Information"
              icon={<HeartHandshake size={18} />}
            >

              <DetailCard
                icon={<HeartHandshake size={17} />}
                label="Physically Challenged"
                value={
                  volunteer.physically_challenged
                    ? "Yes"
                    : "No"
                }
              />

              {volunteer.expectation && (

                <div className="md:col-span-2">

                  <div className="rounded-2xl bg-[#f7faf8] border border-green-100 p-5">

                    <p className="text-[10px] uppercase tracking-wider font-black text-[#07833f]">
                      Volunteer Expectations
                    </p>

                    <p className="text-sm text-gray-700 leading-6 mt-2">
                      {volunteer.expectation}
                    </p>

                  </div>

                </div>

              )}

            </DetailSection>

            {/* ==================================================
                ACTIONS
            =================================================== */}

            <div className="mt-8 pt-7 border-t border-gray-100">

              <div className="flex flex-col sm:flex-row gap-3">

                {/* DOWNLOAD */}

                <button
                  type="button"
                  onClick={downloadCard}
                  disabled={cardLoading}
                  className="
                    flex-1
                    flex items-center justify-center gap-2
                    bg-gradient-to-r
                    from-[#075b30]
                    to-[#07833f]
                    hover:from-[#064725]
                    hover:to-[#075b30]
                    text-white
                    px-6 py-3.5
                    rounded-xl
                    font-bold
                    shadow-lg
                    shadow-green-900/10
                    transition
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                  "
                >

                  {cardLoading &&
                  cardAction === "download" ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Download size={18} />
                  )}

                  {cardLoading &&
                  cardAction === "download"
                    ? "Downloading..."
                    : "Download ID Card"}

                </button>

                {/* PRINT / VIEW */}

                <button
                  type="button"
                  onClick={printCard}
                  disabled={cardLoading}
                  className="
                    flex-1
                    flex items-center justify-center gap-2
                    bg-[#d4a017]
                    hover:bg-[#b8890f]
                    text-white
                    px-6 py-3.5
                    rounded-xl
                    font-bold
                    shadow-lg
                    transition
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                  "
                >

                  {cardLoading &&
                  cardAction === "print" ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Printer size={18} />
                  )}

                  {cardLoading &&
                  cardAction === "print"
                    ? "Loading Card..."
                    : "View / Print Card"}

                </button>

                {/* MEMBER DETAILS */}

                <button
                  type="button"
                  onClick={printVolunteerDetails}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    px-6 py-3.5
                    rounded-xl
                    font-bold
                    shadow-lg
                    transition
                  "
                >

                  <Printer size={18} />

                  Volunteer Details

                </button>

                {/* CLOSE */}

                <button
                  type="button"
                  onClick={onClose}
                  className="
                    sm:w-auto
                    flex
                    items-center
                    justify-center
                    gap-2
                    bg-gray-100
                    hover:bg-gray-200
                    text-gray-700
                    px-6 py-3.5
                    rounded-xl
                    font-bold
                    transition
                  "
                >

                  <X size={18} />

                  Close

                </button>

              </div>

              {/* AUTH NOTE */}

              <div className="mt-4 flex items-start gap-2 text-xs text-gray-400">

                <AlertCircle
                  size={14}
                  className="mt-0.5 shrink-0"
                />

                <p>
                  Volunteership cards are retrieved securely through
                  the authenticated AUM admin API.
                </p>

              </div>

            </div>

          </section>

        </div>

        {/* ====================================================
            FOOTER
        ===================================================== */}

        <div className="bg-[#063b24] px-6 py-5 text-center">

          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[10px] sm:text-xs font-black text-green-100">

            <span>EDUCATE</span>

            <span className="text-[#d4a017]">
              •
            </span>

            <span>ENGAGE</span>

            <span className="text-[#d4a017]">
              •
            </span>

            <span>EMPOWER</span>

            <span className="text-[#d4a017]">
              •
            </span>

            <span>ADVOCATE</span>

          </div>

          <p className="text-[#d4a017] text-xs font-black tracking-wider mt-2">
            TOGETHER FOR PROGRESS.
          </p>

        </div>

      </div>

    </div>
  );
}


// ============================================================
// DETAIL SECTION
// ============================================================

function DetailSection({
  title,
  icon,
  children,
}) {
  return (
    <div className="mb-8">

      <div className="flex items-center gap-2 mb-4">

        <div className="text-[#07833f]">
          {icon}
        </div>

        <h4 className="font-black text-[#075b30]">
          {title}
        </h4>

        <div className="h-px bg-green-100 flex-1 ml-2" />

      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {children}
      </div>

    </div>
  );
}


// ============================================================
// DETAIL CARD
// ============================================================

function DetailCard({
  icon,
  label,
  value,
  highlight = false,
  full = false,
}) {
  return (
    <div
      className={`
        ${full ? "md:col-span-2" : ""}
        rounded-2xl
        border
        p-4
        transition
        ${
          highlight
            ? "bg-green-50 border-green-200"
            : "bg-[#f8faf9] border-gray-100"
        }
      `}
    >

      <div className="flex items-center gap-2">

        <div
          className={`
            w-8 h-8
            rounded-lg
            flex items-center justify-center
            ${
              highlight
                ? "bg-green-100 text-[#07833f]"
                : "bg-white text-[#07833f]"
            }
          `}
        >
          {icon}
        </div>

        <span className="text-[10px] uppercase tracking-wider font-black text-gray-400">
          {label}
        </span>

      </div>

      <p
        className={`
          mt-3
          text-sm
          break-words
          ${
            highlight
              ? "font-black text-[#075b30]"
              : "font-semibold text-gray-700"
          }
        `}
      >
        {value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
          ? value
          : "—"}
      </p>

    </div>
  );
}


// ============================================================
// PRINT HELPERS
// ============================================================

function escapeHtml(value) {
  if (
    value === null ||
    value === undefined
  ) {
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
          String(value).trim() === ""
            ? "—"
            : String(value)
        )}
      </div>

    </div>
  `;
}