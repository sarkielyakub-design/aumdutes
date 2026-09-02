import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Camera,
  CheckCircle,
  Download,
  GraduationCap,
  Loader2,
  MapPin,
  MessageSquare,
  Printer,
  Upload,
  User,
  Users,
  AlertCircle,
  Target,
  CreditCard,
} from "lucide-react";

import { registerVolunteer } from "../services/VolunteerApi";
import { getAssetUrl } from "../services/Api";
import {
  getLgas,
  getWards,
  getPollingUnits,
} from "../services/LocationApi";

const initialForm = {
  name: "",
  phone: "",
  gender: "",
  age: "",
  voter_card_number: "",

  lga: "",
  ward: "",
  ward_id: "",
  unit: "",
  polling_unit_id: "",

  highest_qualification: "",
  additional_qualification: "",
  specialization: "",

  employment_status: "",

  physically_challenged: false,
  aum_member: false,

  previous_organization: "",
  position: "",
  expectation: "",
};

export default function RegisterVolunteer() {
  const [form, setForm] = useState(initialForm);

  // ============================================================
  // LOCATION STATE
  // ============================================================

  const [lgas, setLgas] = useState([]);
  const [wards, setWards] = useState([]);
  const [units, setUnits] = useState([]);

  const [lgaLoading, setLgaLoading] = useState(true);
  const [wardLoading, setWardLoading] = useState(false);
  const [unitLoading, setUnitLoading] = useState(false);

  // ============================================================
  // PASSPORT STATE
  // ============================================================

  const [passport, setPassport] = useState(null);
  const [preview, setPreview] = useState(null);

  // ============================================================
  // SUBMISSION STATE
  // ============================================================

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD LGAs
  // ============================================================

  useEffect(() => {
    let active = true;

    const loadLgas = async () => {
      setLgaLoading(true);
      setError("");

      try {
        const response = await getLgas();

        if (!active) return;

        const data = Array.isArray(response)
          ? response
          : response?.data || [];

        setLgas(data);
      } catch (err) {
        console.error("LGA loading error:", err);

        if (active) {
          setError(
            "Unable to load the official LGA list. Please refresh and try again."
          );
        }
      } finally {
        if (active) {
          setLgaLoading(false);
        }
      }
    };

    loadLgas();

    return () => {
      active = false;
    };
  }, []);

  // ============================================================
  // LOAD WARDS WHEN LGA CHANGES
  // ============================================================

  useEffect(() => {
    let active = true;

    const loadWards = async () => {
      if (!form.lga) {
        setWards([]);
        setUnits([]);
        return;
      }

      setWardLoading(true);
      setError("");

      try {
        const response = await getWards(form.lga);

        if (!active) return;

        const data = Array.isArray(response)
          ? response
          : response?.data || [];

        setWards(data);
      } catch (err) {
        console.error("Ward loading error:", err);

        if (active) {
          setWards([]);
          setUnits([]);
          setError(
            "Unable to load wards for the selected LGA. Please try again."
          );
        }
      } finally {
        if (active) {
          setWardLoading(false);
        }
      }
    };

    loadWards();

    return () => {
      active = false;
    };
  }, [form.lga]);

  // ============================================================
  // LOAD POLLING UNITS WHEN WARD CHANGES
  // ============================================================

  useEffect(() => {
    let active = true;

    const loadPollingUnits = async () => {
      if (!form.ward_id) {
        setUnits([]);
        return;
      }

      setUnitLoading(true);
      setError("");

      try {
        const response = await getPollingUnits(form.ward_id);

        if (!active) return;

        const data = Array.isArray(response)
          ? response
          : response?.data || [];

        setUnits(data);
      } catch (err) {
        console.error("Polling unit loading error:", err);

        if (active) {
          setUnits([]);
          setError(
            "Unable to load polling units for the selected ward. Please try again."
          );
        }
      } finally {
        if (active) {
          setUnitLoading(false);
        }
      }
    };

    loadPollingUnits();

    return () => {
      active = false;
    };
  }, [form.ward_id]);

  // ============================================================
  // PREVIEW CLEANUP
  // ============================================================

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // ============================================================
  // SELECTED POLLING UNIT
  // ============================================================

  const selectedUnit = useMemo(() => {
    if (!form.polling_unit_id) return null;

    return units.find(
      (unit) => String(unit.id) === String(form.polling_unit_id)
    );
  }, [units, form.polling_unit_id]);

  // ============================================================
  // GENERIC FORM UPDATE
  // ============================================================

  const update = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // LGA CHANGE
  // ============================================================

  const handleLga = (value) => {
    setForm((prev) => ({
      ...prev,
      lga: value,

      ward: "",
      ward_id: "",

      unit: "",
      polling_unit_id: "",
    }));

    setWards([]);
    setUnits([]);
    setError("");
  };

  // ============================================================
  // WARD CHANGE
  // ============================================================

  const handleWard = (value) => {
    const selectedWard = wards.find(
      (ward) => String(ward.id) === String(value)
    );

    setForm((prev) => ({
      ...prev,

      ward: selectedWard?.name || "",
      ward_id: selectedWard?.id || "",

      unit: "",
      polling_unit_id: "",
    }));

    setUnits([]);
    setError("");
  };

  // ============================================================
  // POLLING UNIT CHANGE
  // ============================================================

  const handleUnit = (value) => {
    const unit = units.find(
      (item) => String(item.id) === String(value)
    );

    setForm((prev) => ({
      ...prev,

      polling_unit_id: unit?.id || "",

      unit:
        unit?.name ||
        unit?.unit_name ||
        "",
    }));

    setError("");
  };

  // ============================================================
  // PASSPORT
  // ============================================================

  const handlePassport = (event) => {
    const file = event.target.files?.[0];

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

  // ============================================================
  // SUBMIT REGISTRATION
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.lga) {
      setError("Please select your LGA.");
      return;
    }

    if (!form.ward_id) {
      setError("Please select your ward.");
      return;
    }

    if (!form.polling_unit_id) {
      setError("Please select your polling unit.");
      return;
    }

    if (!passport) {
      setError("Please upload your passport photograph.");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      // --------------------------------------------------------
      // SEND ALL REGISTRATION FIELDS
      // --------------------------------------------------------

      Object.entries(form).forEach(([key, value]) => {
        /*
         * ward_id is only used internally by the frontend
         * to load polling units.
         *
         * The backend uses polling_unit_id to resolve
         * the authoritative ward.
         */
        if (key === "ward_id") return;

        data.append(key, value ?? "");
      });

      // --------------------------------------------------------
      // PASSPORT
      // --------------------------------------------------------

      data.append("passport", passport);

      // --------------------------------------------------------
      // API REQUEST
      // --------------------------------------------------------

      const response = await registerVolunteer(data);

      setResult(response);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("Registration error:", err);

      setError(
        err?.response?.data?.detail ||
          "Registration failed. Please check the form and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SUCCESS SCREEN
  // ============================================================

  if (result) {
    const cardUrl = getAssetUrl(
      result.id_card || result.volunteer_card
    );

    return (
      <div className="min-h-screen bg-[#063b24] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.035] bg-center bg-no-repeat bg-contain pointer-events-none"
          style={{
            backgroundImage: "url('/aum-logo.png')",
            backgroundSize: "650px",
          }}
        />

        <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-2xl">
            <div className="flex justify-center mb-7">
              <div className="w-24 h-24 rounded-full bg-white p-3 shadow-2xl">
                <img
                  src="/aum-logo.png"
                  alt="AUM"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-[32px] bg-white shadow-2xl">
              <div className="bg-gradient-to-br from-[#07833f] to-[#04572b] px-6 py-10 text-center text-white sm:px-8">
                <CheckCircle className="mx-auto mb-4 h-16 w-16" />

                <p className="text-xs font-bold uppercase tracking-[0.25em] text-green-100">
                  AUM Volunteer Registration
                </p>

                <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                  Registration Successful
                </h1>

                <p className="mt-3 text-green-100">
                  Your membership has been assigned to the selected
                  polling unit.
                </p>
              </div>

              <div className="p-6 text-center sm:p-10">
                <p className="text-sm font-semibold text-slate-500">
                  Registration Number
                </p>

                <div className="mt-2 inline-flex max-w-full overflow-hidden rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-2xl font-black tracking-wider text-[#075b30] sm:px-7 sm:text-3xl">
                  {result.registration_no}
                </div>

                {result.location && (
                  <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-green-100 bg-green-50/70 p-4 text-left">
                    <div className="flex items-center gap-2 font-black text-[#075b30]">
                      <MapPin size={18} />
                      Assigned Location
                    </div>

                    <p className="mt-2 font-semibold">
                      {result.location.lga} •{" "}
                      {result.location.ward}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {result.location.unit_code} —{" "}
                      {result.location.unit_name}
                    </p>

                    <p className="mt-2 text-xs font-bold text-green-700">
                      Unit target:{" "}
                      {result.location.target_members} members
                    </p>
                  </div>
                )}

                <p className="mt-5 text-sm text-slate-500">
                  Keep your registration number safe for verification
                  and card access.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <a
                    href={cardUrl}
                    download
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#075b30] px-5 py-4 font-bold text-white shadow-lg transition hover:bg-[#064b28]"
                  >
                    <Download size={19} />
                    Download Card
                  </a>

                  <button
                    type="button"
                    onClick={() =>
                      window.open(cardUrl, "_blank")
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#d4a017] px-5 py-4 font-bold text-white shadow-lg transition hover:bg-[#b98a12]"
                  >
                    <Printer size={19} />
                    View / Print Card
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-6 font-semibold text-[#075b30] hover:underline"
                >
                  Register another volunteer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // FORM STYLES
  // ============================================================

  const input =
    "w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-slate-800 outline-none transition focus:border-[#07833f] focus:ring-4 focus:ring-green-100";

  const select = `${input} cursor-pointer`;

  // ============================================================
  // REGISTRATION FORM
  // ============================================================

  return (
    <div className="min-h-screen bg-[#063b24] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-40 -top-40 h-[550px] w-[550px] rounded-full bg-[#07833f]/30 blur-3xl" />

        <div className="absolute -right-48 top-1/3 h-[600px] w-[600px] rounded-full bg-[#d4a017]/10 blur-3xl" />

        <div
          className="absolute inset-0 bg-center bg-no-repeat opacity-[0.035] bg-contain"
          style={{
            backgroundImage: "url('/aum-logo.png')",
            backgroundSize: "700px",
          }}
        />
      </div>

      <div className="relative z-10 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-5xl">
          {/* ==================================================
              HEADER
          ================================================== */}

          <header className="mb-8 text-center text-white">
            <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-white p-3 shadow-2xl">
              <img
                src="/aum-logo.png"
                alt="AUM"
                className="h-full w-full object-contain"
              />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.3em] text-green-200">
              Official Volunteership Portal
            </p>

            <h1 className="mt-2 text-5xl font-black">
              AUM
            </h1>

            <p className="mt-2 text-green-100">
              AMB. USMAN MOVEMENT
            </p>
          </header>

          {/* ==================================================
              MAIN CARD
          ================================================== */}

          <main className="overflow-hidden rounded-[32px] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.3)]">
            {/* HEADER */}

            <div className="bg-gradient-to-r from-[#075b30] via-[#07833f] to-[#075b30] px-6 py-7 text-white sm:px-10">
              <p className="text-xs font-bold uppercase tracking-widest text-green-100">
                Volunteership Application
              </p>

              <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-3xl font-black">
                    Become a Volunteer
                  </h2>

                  <p className="mt-2 text-sm text-green-100/80">
                    Register once and be assigned to your exact ward
                    and polling unit.
                  </p>
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold">
                  <Target
                    size={18}
                    className="text-yellow-300"
                  />

                  200-member unit target
                </div>
              </div>
            </div>

            {/* ==================================================
                FORM
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              className="p-5 sm:p-8 lg:p-10"
            >
              {/* ERROR */}

              {error && (
                <div className="mb-7 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                  <AlertCircle
                    className="mt-0.5 shrink-0"
                    size={19}
                  />

                  <span>{error}</span>
                </div>
              )}

              {/* =================================================
                  PERSONAL INFORMATION
              ================================================= */}

              <SectionHeader
                icon={<User size={19} />}
                title="Personal Information"
                description="Provide your basic personal details."
              />

              <div className="mb-10 grid gap-5 md:grid-cols-2">
                {/* FULL NAME */}

                <Field
                  label="Full Name"
                  required
                >
                  <input
                    className={input}
                    name="name"
                    value={form.name}
                    onChange={(e) =>
                      update("name", e.target.value)
                    }
                    required
                    placeholder="Enter full name"
                  />
                </Field>

                {/* PHONE */}

                <Field
                  label="Phone Number"
                  required
                >
                  <input
                    className={input}
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={(e) =>
                      update("phone", e.target.value)
                    }
                    required
                    placeholder="Enter phone number"
                  />
                </Field>

                {/* GENDER */}

                <Field
                  label="Gender"
                  required
                >
                  <select
                    className={select}
                    name="gender"
                    value={form.gender}
                    onChange={(e) =>
                      update("gender", e.target.value)
                    }
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

                {/* AGE */}

                <Field
                  label="Age"
                  required
                >
                  <input
                    className={input}
                    type="number"
                    min="1"
                    max="120"
                    name="age"
                    value={form.age}
                    onChange={(e) =>
                      update("age", e.target.value)
                    }
                    required
                    placeholder="Age"
                  />
                </Field>

                {/* VOTER CARD */}

                <div className="md:col-span-2">
                  <Field label="Voter's Card Number (VIN)">
                    <div className="relative">
                      <CreditCard
                        size={19}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        className={`${input} pl-11`}
                        type="text"
                        name="voter_card_number"
                        value={form.voter_card_number}
                        onChange={(e) =>
                          update(
                            "voter_card_number",
                            e.target.value
                          )
                        }
                        placeholder="Enter your Voter's Card Number / VIN"
                        maxLength={100}
                        autoComplete="off"
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Optional. Enter the Voter Identification Number
                      printed on your voter's card.
                    </p>
                  </Field>
                </div>
              </div>

              {/* =================================================
                  LOCATION
              ================================================= */}

              <SectionHeader
                icon={<MapPin size={19} />}
                title="Ward & Polling Unit"
                description="Select your official location. Your registration will be saved under this exact polling unit."
              />

              <div className="mb-5 grid gap-5 md:grid-cols-3">
                {/* LGA */}

                <Field
                  label="LGA"
                  required
                >
                  <select
                    className={select}
                    value={form.lga}
                    onChange={(e) =>
                      handleLga(e.target.value)
                    }
                    required
                    disabled={lgaLoading}
                  >
                    <option value="">
                      {lgaLoading
                        ? "Loading LGAs..."
                        : "Select LGA"}
                    </option>

                    {lgas.map((lga) => (
                      <option
                        key={lga}
                        value={lga}
                      >
                        {lga}
                      </option>
                    ))}
                  </select>
                </Field>

                {/* WARD */}

                <Field
                  label="Ward"
                  required
                >
                  <select
                    className={select}
                    value={form.ward_id}
                    onChange={(e) =>
                      handleWard(e.target.value)
                    }
                    required
                    disabled={
                      !form.lga ||
                      wardLoading
                    }
                  >
                    <option value="">
                      {wardLoading
                        ? "Loading wards..."
                        : !form.lga
                        ? "Select LGA first"
                        : "Select ward"}
                    </option>

                    {wards.map((ward) => (
                      <option
                        key={ward.id}
                        value={ward.id}
                      >
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </Field>

                {/* POLLING UNIT */}

                <Field
                  label="Polling Unit"
                  required
                >
                  <select
                    className={select}
                    value={form.polling_unit_id}
                    onChange={(e) =>
                      handleUnit(e.target.value)
                    }
                    required
                    disabled={
                      !form.ward_id ||
                      unitLoading
                    }
                  >
                    <option value="">
                      {unitLoading
                        ? "Loading polling units..."
                        : !form.ward_id
                        ? "Select ward first"
                        : "Select polling unit"}
                    </option>

                    {units.map((unit) => (
                      <option
                        key={unit.id}
                        value={unit.id}
                      >
                        {unit.code ||
                          unit.unit_code}{" "}
                        —{" "}
                        {unit.name ||
                          unit.unit_name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* SELECTED LOCATION */}

              {selectedUnit && (
                <div className="mb-10 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                        Selected polling unit
                      </p>

                      <h3 className="mt-1 break-words text-lg font-black text-slate-800">
                        {selectedUnit.name ||
                          selectedUnit.unit_name}
                      </h3>

                      <p className="mt-1 break-words text-sm text-slate-500">
                        {form.lga} • {form.ward} •{" "}
                        {selectedUnit.code ||
                          selectedUnit.unit_code}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-xl bg-white px-4 py-3 text-center shadow-sm">
                      <p className="text-xs text-slate-400">
                        Member target
                      </p>

                      <p className="text-xl font-black text-green-700">
                        {selectedUnit.target_members ??
                          200}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================
                  EDUCATION
              ================================================= */}

              <SectionHeader
                icon={<GraduationCap size={19} />}
                title="Educational Information"
                description="Provide your educational background."
              />

              <div className="mb-10 grid gap-5 md:grid-cols-2">
                <Field
                  label="Highest Qualification"
                  required
                >
                  <input
                    className={input}
                    name="highest_qualification"
                    value={
                      form.highest_qualification
                    }
                    onChange={(e) =>
                      update(
                        "highest_qualification",
                        e.target.value
                      )
                    }
                    required
                    placeholder="e.g. B.Sc, HND, SSCE"
                  />
                </Field>

                <Field label="Additional Qualification">
                  <input
                    className={input}
                    name="additional_qualification"
                    value={
                      form.additional_qualification
                    }
                    onChange={(e) =>
                      update(
                        "additional_qualification",
                        e.target.value
                      )
                    }
                    placeholder="Optional"
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field label="Area of Specialization">
                    <input
                      className={input}
                      name="specialization"
                      value={
                        form.specialization
                      }
                      onChange={(e) =>
                        update(
                          "specialization",
                          e.target.value
                        )
                      }
                      placeholder="e.g. Computer Science, Education, Health"
                    />
                  </Field>
                </div>
              </div>

              {/* =================================================
                  EMPLOYMENT
              ================================================= */}

              <SectionHeader
                icon={<BriefcaseBusiness size={19} />}
                title="Employment Information"
                description="Select your current employment status."
              />

              <div className="mb-10 grid gap-4 sm:grid-cols-3">
                {[
                  "Employed",
                  "Unemployed",
                  "Self Employed",
                ].map((status) => (
                  <label
                    key={status}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition ${
                      form.employment_status ===
                      status
                        ? "border-green-600 bg-green-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="employment_status"
                      value={status}
                      checked={
                        form.employment_status ===
                        status
                      }
                      onChange={(e) =>
                        update(
                          "employment_status",
                          e.target.value
                        )
                      }
                      required
                    />

                    <span className="font-semibold">
                      {status}
                    </span>
                  </label>
                ))}
              </div>

              {/* =================================================
                  ADDITIONAL INFORMATION
              ================================================= */}

              <SectionHeader
                icon={<Users size={19} />}
                title="Additional Information"
                description="Help us understand your involvement and needs."
              />

              <div className="mb-10 grid gap-5 lg:grid-cols-2">
                <BooleanCard
                  label="Are you physically challenged?"
                  value={
                    form.physically_challenged
                  }
                  onChange={(value) =>
                    update(
                      "physically_challenged",
                      value
                    )
                  }
                />

                <BooleanCard
                  label="Are you a volunteer of any youth organization?"
                  value={form.aum_member}
                  onChange={(value) =>
                    update(
                      "aum_member",
                      value
                    )
                  }
                />
              </div>

              {form.aum_member && (
                <div className="mb-10 grid gap-5 rounded-2xl border border-green-200 bg-green-50 p-5 md:grid-cols-2">
                  <Field label="Organization Name">
                    <input
                      className={input}
                      name="previous_organization"
                      value={
                        form.previous_organization
                      }
                      onChange={(e) =>
                        update(
                          "previous_organization",
                          e.target.value
                        )
                      }
                      placeholder="Organization name"
                    />
                  </Field>

                  <Field label="Position Held">
                    <input
                      className={input}
                      name="position"
                      value={form.position}
                      onChange={(e) =>
                        update(
                          "position",
                          e.target.value
                        )
                      }
                      placeholder="e.g. Volunteer, Secretary"
                    />
                  </Field>
                </div>
              )}

              {/* =================================================
                  EXPECTATIONS
              ================================================= */}

              <SectionHeader
                icon={<MessageSquare size={19} />}
                title="Your Expectations"
                description="Tell us what you hope to gain or contribute."
              />

              <textarea
                className={`${input} mb-10 h-32 resize-none py-4`}
                name="expectation"
                value={form.expectation}
                onChange={(e) =>
                  update(
                    "expectation",
                    e.target.value
                  )
                }
                placeholder="Tell us your expectations..."
              />

              {/* =================================================
                  PASSPORT
              ================================================= */}

              <SectionHeader
                icon={<Camera size={19} />}
                title="Passport Photograph"
                description="Upload a clear passport photograph. Maximum 5MB."
              />

              <div className="mb-10 grid gap-5 md:grid-cols-[1fr_190px]">
                <label className="flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition hover:border-green-500 hover:bg-green-50">
                  <Upload className="mb-3 h-9 w-9 text-green-700" />

                  <p className="font-bold text-slate-700">
                    Upload Passport
                  </p>

                  <p className="mt-1 text-center text-sm text-slate-400">
                    JPG, PNG, WebP, HEIC or HEIF
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handlePassport}
                    className="hidden"
                  />
                </label>

                <div className="min-h-[190px] overflow-hidden rounded-2xl border bg-slate-50">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Passport preview"
                      className="h-full min-h-[190px] w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full min-h-[190px] items-center justify-center text-sm text-slate-400">
                      Photo preview
                    </div>
                  )}
                </div>
              </div>

              {/* =================================================
                  SUBMIT
              ================================================= */}

              <button
                type="submit"
                disabled={
                  loading ||
                  lgaLoading ||
                  wardLoading ||
                  unitLoading
                }
                className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#075b30] via-[#07833f] to-[#075b30] text-base font-black text-white shadow-xl transition hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-60 sm:text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Processing Registration...
                  </>
                ) : (
                  <>
                    Submit Volunteership Registration

                    <ArrowRight className="transition group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <p className="mt-5 text-center text-xs text-slate-400">
                By submitting, you confirm that the information
                provided is accurate.
              </p>
            </form>

            {/* ==================================================
                FOOTER
            ================================================== */}

            <footer className="bg-[#063b24] px-6 py-7 text-center text-xs text-green-100">
              <div className="font-bold">
                EDUCATE • ENGAGE • EMPOWER • ADVOCATE
              </div>

              <div className="mt-3 font-black tracking-wide text-[#d4a017]">
                TOGETHER FOR PROGRESS.
              </div>

              <div className="mt-2 text-green-100/50">
                © {new Date().getFullYear()} AMB. USMAN MOVEMENT
              </div>
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
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-[#07833f]">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-black text-[#075b30]">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>

        <div className="relative mt-4 h-0.5 bg-green-100">
          <div className="absolute left-0 top-0 h-0.5 w-20 bg-[#07833f]" />
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
  required,
  children,
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

// ============================================================
// BOOLEAN CARD
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

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`h-11 rounded-xl border-2 font-semibold transition ${
            value
              ? "border-green-600 bg-green-100 text-green-800"
              : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          Yes
        </button>

        <button
          type="button"
          onClick={() => onChange(false)}
          className={`h-11 rounded-xl border-2 font-semibold transition ${
            !value
              ? "border-green-600 bg-green-100 text-green-800"
              : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          No
        </button>
      </div>
    </div>
  );
}