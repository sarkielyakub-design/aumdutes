import { useEffect, useState } from "react";
import {
  Loader2,
  Upload,
  CheckCircle,
  Download,
  Printer,
  User,
  MapPin,
  GraduationCap,
  BriefcaseBusiness,
  Users,
  MessageSquare,
  Camera,
  ShieldCheck,
  ArrowRight,
  Phone,
  Mail,
  Award,
} from "lucide-react";

import { registerVolunteer } from "../services/VolunteerApi";
import { getAssetUrl } from "../services/Api";

export default function RegisterVolunteer() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    gender: "",
    age: "",
    lga: "",
    ward: "",
    unit: "",
    highest_qualification: "",
    additional_qualification: "",
    specialization: "",
    employment_status: "",
    physically_challenged: false,
    aum_member: false,
    previous_organization: "",
    position: "",
    expectation: "",
  });

  const [passport, setPassport] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePassport = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid passport image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Passport photograph must not exceed 5MB.");
      return;
    }

    setError("");
    setPassport(file);

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!passport) {
      setError("Please upload your passport photograph.");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value);
      });

      data.append("passport", passport);

      const response = await registerVolunteer(data);

      setResult(response);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(err);

      const message =
        err?.response?.data?.detail ||
        err?.message ||
        "Registration failed. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // SUCCESS
  // ==========================================================

  if (result) {
    const cardUrl = getAssetUrl(
      result.volunteer_card || result.id_card
    );

    return (
      <div className="min-h-screen bg-slate-100 relative overflow-hidden">
        {/* Logo watermark */}
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.035] bg-center bg-no-repeat bg-contain"
          style={{
            backgroundImage: "url('/aum-logo.png')",
            backgroundSize: "650px",
          }}
        />

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-xl">

            {/* Brand */}
            <div className="text-center mb-7">
              <div className="inline-flex w-24 h-24 rounded-2xl bg-white shadow-xl p-3">
                <img
                  src="/aum-logo.png"
                  alt="AUM"
                  className="w-full h-full object-contain"
                />
              </div>

              <h1 className="text-2xl font-black text-slate-900 mt-4">
                AMB. USMAN MOVEMENT
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Official Volunteer Registration
              </p>
            </div>

            {/* Success card */}
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">

              <div className="bg-[#063b24] px-8 py-10 text-center text-white">
                <div className="mx-auto w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-5">
                  <CheckCircle className="w-11 h-11 text-green-300" />
                </div>

                <p className="text-xs uppercase tracking-[0.3em] text-green-200 font-bold">
                  AUM VOLUNTEER
                </p>

                <h2 className="text-3xl font-black mt-2">
                  Registration Successful
                </h2>

                <p className="text-green-100/80 mt-3">
                  Welcome to AMB. USMAN MOVEMENT.
                </p>
              </div>

              <div className="p-8 sm:p-10 text-center">

                <p className="text-sm text-slate-500">
                  Your Volunteer Registration Number
                </p>

                <div className="inline-flex mt-3 px-7 py-4 rounded-xl bg-green-50 border border-green-200">
                  <span className="text-2xl font-black tracking-wider text-[#075b30]">
                    {result.registration_no}
                  </span>
                </div>

                <p className="text-sm text-slate-500 mt-5">
                  Keep this registration number safe for future
                  verification.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mt-8">

                  <a
                    href={cardUrl}
                    download
                    className="flex items-center justify-center gap-2 bg-[#075b30] hover:bg-[#064725] text-white font-bold px-5 py-4 rounded-xl transition"
                  >
                    <Download size={19} />
                    Download Card
                  </a>

                  <button
                    type="button"
                    onClick={() =>
                      window.open(cardUrl, "_blank")
                    }
                    className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-4 rounded-xl transition"
                  >
                    <Printer size={19} />
                    Print Card
                  </button>

                </div>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-7 text-[#075b30] font-bold hover:underline"
                >
                  Register another volunteer
                </button>
              </div>
            </div>

            <p className="text-center text-slate-400 text-xs mt-6">
              TOGETHER FOR PROGRESS.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // STYLES
  // ==========================================================

  const inputClasses =
    "w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-[#087a3d] focus:ring-4 focus:ring-green-100";

  // ==========================================================
  // FORM
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#f4f7f5] relative overflow-hidden">

      {/* ======================================================
          PROFESSIONAL BACKGROUND
      ======================================================= */}

      <div className="fixed inset-0 pointer-events-none">

        {/* Logo watermark */}
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-contain opacity-[0.025]"
          style={{
            backgroundImage: "url('/aum-logo.png')",
            backgroundSize: "850px",
          }}
        />

        {/* Soft decorative shapes */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-green-100/70 blur-3xl" />

        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-emerald-100/60 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 w-[450px] h-[250px] rounded-full bg-green-100/50 blur-3xl" />
      </div>

      {/* ======================================================
          PAGE
      ======================================================= */}

      <div className="relative z-10 px-4 py-8 sm:py-12">

        <div className="max-w-6xl mx-auto">

          {/* ==================================================
              HEADER
          =================================================== */}

          <header className="text-center mb-9">

            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-xl border border-slate-200 p-3">
              <img
                src="/aum-logo.png"
                alt="AMB. USMAN MOVEMENT"
                className="w-full h-full object-contain"
              />
            </div>

            <p className="mt-6 text-xs uppercase tracking-[0.35em] font-bold text-[#087a3d]">
              Official Volunteer Registration Portal
            </p>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mt-2">
              AMB. USMAN MOVEMENT
            </h1>

            <p className="text-slate-500 mt-3 max-w-2xl mx-auto">
              Join the movement and become part of a growing community
              working together for progress.
            </p>

            <div className="flex items-center justify-center gap-3 mt-5">
              <span className="h-px w-14 bg-[#d4a017]" />

              <span className="text-[#a57b00] text-xs font-black tracking-widest">
                TOGETHER FOR PROGRESS
              </span>

              <span className="h-px w-14 bg-[#d4a017]" />
            </div>
          </header>

          {/* ==================================================
              MAIN FORM
          =================================================== */}

          <main className="bg-white rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden">

            {/* Header */}
            <div className="bg-[#063b24] px-6 sm:px-10 py-7 text-white">

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                <div>
                  <p className="text-green-300 text-xs uppercase tracking-widest font-bold">
                    AUM VOLUNTEER PORTAL
                  </p>

                  <h2 className="text-2xl sm:text-3xl font-black mt-1">
                    Volunteer Registration
                  </h2>

                  <p className="text-green-100/70 text-sm mt-2">
                    Complete all required information accurately.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-xl px-4 py-3">
                  <ShieldCheck className="text-[#d4a017]" size={21} />

                  <div>
                    <p className="text-xs text-green-200">
                      STATUS
                    </p>

                    <p className="text-sm font-bold">
                      Official Registration
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="p-5 sm:p-8 lg:p-10"
            >

              {error && (
                <div className="mb-8 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 text-sm font-medium">
                  {error}
                </div>
              )}

              {/* PERSONAL */}
              <section className="mb-10">

                <SectionHeader
                  icon={<User className="w-5 h-5" />}
                  title="Personal Information"
                  description="Provide your basic personal details."
                />

                <div className="grid md:grid-cols-2 gap-5">

                  <Field label="Full Name" required>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={inputClasses}
                      required
                    />
                  </Field>

                  <Field label="Phone Number" required>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className={inputClasses}
                      required
                    />
                  </Field>

                  <Field label="Gender" required>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className={inputClasses}
                      required
                    >
                      <option value="">
                        Select gender
                      </option>
                      <option value="Male">
                        Male
                      </option>
                      <option value="Female">
                        Female
                      </option>
                    </select>
                  </Field>

                  <Field label="Age" required>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      name="age"
                      value={form.age}
                      onChange={handleChange}
                      placeholder="Enter age"
                      className={inputClasses}
                      required
                    />
                  </Field>

                </div>
              </section>

              {/* LOCATION */}
              <section className="mb-10">

                <SectionHeader
                  icon={<MapPin className="w-5 h-5" />}
                  title="Location Information"
                  description="Provide your local administrative information."
                />

                <div className="grid md:grid-cols-3 gap-5">

                  <Field label="Local Government Area" required>
                    <input
                      name="lga"
                      value={form.lga}
                      onChange={handleChange}
                      placeholder="LGA"
                      className={inputClasses}
                      required
                    />
                  </Field>

                  <Field label="Ward" required>
                    <input
                      name="ward"
                      value={form.ward}
                      onChange={handleChange}
                      placeholder="Ward"
                      className={inputClasses}
                      required
                    />
                  </Field>

                  <Field label="Unit" required>
                    <input
                      name="unit"
                      value={form.unit}
                      onChange={handleChange}
                      placeholder="Unit"
                      className={inputClasses}
                      required
                    />
                  </Field>

                </div>
              </section>

              {/* EDUCATION */}
              <section className="mb-10">

                <SectionHeader
                  icon={<GraduationCap className="w-5 h-5" />}
                  title="Educational Information"
                  description="Provide your educational background."
                />

                <div className="grid md:grid-cols-2 gap-5">

                  <Field
                    label="Highest Qualification"
                    required
                  >
                    <input
                      name="highest_qualification"
                      value={form.highest_qualification}
                      onChange={handleChange}
                      placeholder="e.g. B.Sc, HND, SSCE"
                      className={inputClasses}
                      required
                    />
                  </Field>

                  <Field label="Additional Qualification">
                    <input
                      name="additional_qualification"
                      value={form.additional_qualification}
                      onChange={handleChange}
                      placeholder="Optional"
                      className={inputClasses}
                    />
                  </Field>

                  <div className="md:col-span-2">

                    <Field label="Area of Specialization">
                      <input
                        name="specialization"
                        value={form.specialization}
                        onChange={handleChange}
                        placeholder="e.g. Computer Science, Education, Health"
                        className={inputClasses}
                      />
                    </Field>

                  </div>

                </div>
              </section>

              {/* EMPLOYMENT */}
              <section className="mb-10">

                <SectionHeader
                  icon={<BriefcaseBusiness className="w-5 h-5" />}
                  title="Employment Information"
                  description="Select your current employment status."
                />

                <div className="grid sm:grid-cols-3 gap-4">

                  {[
                    "Employed",
                    "Unemployed",
                    "Self Employed",
                  ].map((status) => {

                    const active =
                      form.employment_status === status;

                    return (
                      <label
                        key={status}
                        className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                          active
                            ? "border-[#087a3d] bg-green-50"
                            : "border-slate-200 hover:border-green-300"
                        }`}
                      >

                        <input
                          type="radio"
                          name="employment_status"
                          value={status}
                          checked={active}
                          onChange={handleChange}
                          className="accent-green-700"
                          required
                        />

                        <span
                          className={`font-semibold ${
                            active
                              ? "text-[#075b30]"
                              : "text-slate-700"
                          }`}
                        >
                          {status}
                        </span>

                        {active && (
                          <CheckCircle
                            className="w-5 h-5 text-[#07833f] ml-auto"
                          />
                        )}

                      </label>
                    );
                  })}

                </div>
              </section>

              {/* ADDITIONAL */}
              <section className="mb-10">

                <SectionHeader
                  icon={<Users className="w-5 h-5" />}
                  title="Additional Information"
                  description="Provide additional information about your involvement."
                />

                <div className="grid lg:grid-cols-2 gap-5">

                  <BooleanCard
                    label="Are you physically challenged?"
                    value={form.physically_challenged}
                    onChange={(value) =>
                      setForm((previous) => ({
                        ...previous,
                        physically_challenged: value,
                      }))
                    }
                  />

                  <BooleanCard
                    label="Are you a member of any youth organization?"
                    value={form.aum_member}
                    onChange={(value) =>
                      setForm((previous) => ({
                        ...previous,
                        aum_member: value,
                      }))
                    }
                  />

                </div>

                {form.aum_member && (
                  <div className="mt-5 rounded-2xl bg-green-50 border border-green-200 p-5">

                    <h3 className="font-bold text-[#075b30] mb-4">
                      Organization Details
                    </h3>

                    <div className="grid md:grid-cols-2 gap-5">

                      <Field label="Organization Name">
                        <input
                          name="previous_organization"
                          value={form.previous_organization}
                          onChange={handleChange}
                          placeholder="Name of organization"
                          className={inputClasses}
                        />
                      </Field>

                      <Field label="Position Held">
                        <input
                          name="position"
                          value={form.position}
                          onChange={handleChange}
                          placeholder="e.g. Volunteer, Secretary"
                          className={inputClasses}
                        />
                      </Field>

                    </div>
                  </div>
                )}
              </section>

              {/* EXPECTATIONS */}
              <section className="mb-10">

                <SectionHeader
                  icon={<MessageSquare className="w-5 h-5" />}
                  title="Your Expectations"
                  description="Tell us what you hope to contribute or gain."
                />

                <textarea
                  name="expectation"
                  value={form.expectation}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Tell us your expectations..."
                  className={`${inputClasses} h-auto py-4 resize-none`}
                />

              </section>

              {/* PASSPORT */}
              <section className="mb-10">

                <SectionHeader
                  icon={<Camera className="w-5 h-5" />}
                  title="Passport Photograph"
                  description="Upload a clear passport photograph for your official volunteer card."
                />

                <div className="grid md:grid-cols-[1fr_190px] gap-5">

                  <label className="relative min-h-[190px] border-2 border-dashed border-slate-300 hover:border-[#087a3d] bg-slate-50 hover:bg-green-50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition p-6">

                    <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
                      <Upload className="w-7 h-7 text-[#087a3d]" />
                    </div>

                    <p className="font-bold text-slate-700">
                      Upload Passport
                    </p>

                    <p className="text-sm text-slate-400 mt-1 text-center">
                      JPG, JPEG, PNG, HEIC or WebP
                      <br />
                      Maximum 5MB
                    </p>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                      required
                      onChange={handlePassport}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />

                  </label>

                  <div className="min-h-[190px] rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden">

                    {preview ? (
                      <img
                        src={preview}
                        alt="Passport preview"
                        className="w-full h-full min-h-[190px] object-cover"
                      />
                    ) : (
                      <div className="text-center px-5">
                        <Camera className="w-10 h-10 mx-auto text-slate-300" />
                        <p className="text-sm text-slate-400 mt-2">
                          Photo preview
                        </p>
                      </div>
                    )}

                  </div>

                </div>
              </section>

              {/* =================================================
                  CONTACT
              ================================================== */}

              <div className="rounded-2xl bg-[#063b24] p-6 mb-8 text-white">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                  <div>

                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                        <ShieldCheck className="text-[#d4a017]" />
                      </div>

                      <div>
                        <p className="font-black">
                          Registration Support
                        </p>

                        <p className="text-sm text-green-100/70">
                          Need assistance with your application?
                        </p>
                      </div>
                    </div>

                  </div>

                  <div className="space-y-2 text-sm">

                    <a
                      href="tel:+2347017408813"
                      className="flex items-center gap-2 hover:text-green-300 transition"
                    >
                      <Phone size={16} />
                      +234 701 740 8813
                    </a>

                    <a
                      href="tel:09038312185"
                      className="flex items-center gap-2 hover:text-green-300 transition"
                    >
                      <Phone size={16} />
                      0903 831 2185
                    </a>

                    <a
                      href="mailto:Dutsecapitallimited@gmail.com"
                      className="flex items-center gap-2 hover:text-green-300 transition break-all"
                    >
                      <Mail size={16} />
                      Dutsecapitallimited@gmail.com
                    </a>

                  </div>

                </div>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="group w-full h-14 rounded-xl bg-[#075b30] hover:bg-[#064725] text-white font-black text-lg shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >

                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Processing Registration...
                  </>
                ) : (
                  <>
                    Submit Volunteer Registration
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}

              </button>

              <p className="text-center text-xs text-slate-400 mt-5">
                By submitting this form, you confirm that the information
                provided is accurate.
              </p>

            </form>

            {/* FOOTER */}
            <footer className="bg-slate-950 px-6 py-8 text-center">

              <div className="flex items-center justify-center gap-3 text-green-100 text-xs font-bold">
                <Award size={16} className="text-[#d4a017]" />
                <span>AMB. USMAN MOVEMENT</span>
              </div>

              <p className="text-[#d4a017] font-black tracking-widest mt-4">
                TOGETHER FOR PROGRESS.
              </p>

              <p className="text-slate-500 text-xs mt-2">
                © {new Date().getFullYear()} AMB. USMAN MOVEMENT
              </p>

            </footer>

          </main>
        </div>
      </div>
    </div>
  );
}


// ============================================================
// SECTION HEADER
// ============================================================

function SectionHeader({
  icon,
  title,
  description,
}) {
  return (
    <div className="flex items-start gap-4 mb-6">

      <div className="w-11 h-11 shrink-0 rounded-xl bg-green-100 text-[#087a3d] flex items-center justify-center">
        {icon}
      </div>

      <div className="flex-1">

        <h2 className="text-xl font-black text-[#075b30]">
          {title}
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          {description}
        </p>

        <div className="h-px bg-slate-200 mt-4 relative">
          <div className="absolute left-0 top-0 h-0.5 w-20 bg-[#087a3d]" />
        </div>

      </div>
    </div>
  );
}


// ============================================================
// FIELD
// ============================================================

function Field({
  label,
  required = false,
  children,
}) {
  return (
    <div>

      <label className="block text-sm font-semibold text-slate-700 mb-2">

        {label}

        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}

      </label>

      {children}

    </div>
  );
}


// ============================================================
// YES / NO CARD
// ============================================================

function BooleanCard({
  label,
  value,
  onChange,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

      <p className="text-sm font-bold text-slate-700">
        {label}
      </p>

      <div className="grid grid-cols-2 gap-3 mt-4">

        <button
          type="button"
          onClick={() => onChange(true)}
          className={`h-11 rounded-xl border-2 font-semibold transition ${
            value
              ? "border-[#087a3d] bg-green-100 text-[#075b30]"
              : "border-slate-200 bg-white text-slate-600 hover:border-green-300"
          }`}
        >
          Yes
        </button>

        <button
          type="button"
          onClick={() => onChange(false)}
          className={`h-11 rounded-xl border-2 font-semibold transition ${
            !value
              ? "border-[#087a3d] bg-green-100 text-[#075b30]"
              : "border-slate-200 bg-white text-slate-600 hover:border-green-300"
          }`}
        >
          No
        </button>

      </div>
    </div>
  );
}