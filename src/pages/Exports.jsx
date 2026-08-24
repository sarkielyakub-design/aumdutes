import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {
  FileSpreadsheet,
  FileText,
  Download,
  Database,
  Users,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import api from "../services/Api";

export default function Exports() {
  const [downloading, setDownloading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ============================================================
  // AUTHENTICATED FILE DOWNLOAD
  // ============================================================

  const downloadAuthenticatedFile = async (
    endpoint,
    filename
  ) => {
    try {
      setError("");
      setMessage("");
      setDownloading(filename);

      const response = await api.get(endpoint, {
        responseType: "blob",
      });

      const blob = new Blob([response.data]);

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = filename;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      setMessage(`${filename} downloaded successfully.`);
    } catch (err) {
      console.error("Export download error:", err);

      // --------------------------------------------------------
      // Blob error responses need special handling
      // --------------------------------------------------------

      let errorMessage = "Download failed. Please try again.";

      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();

          const parsed = JSON.parse(text);

          if (parsed?.detail) {
            errorMessage = parsed.detail;
          }
        } catch {
          // Keep default message
        }
      } else if (err?.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }

      setError(errorMessage);
    } finally {
      setDownloading("");
    }
  };

  // ============================================================
  // EXCEL
  // ============================================================

  const downloadExcel = () => {
    downloadAuthenticatedFile(
      "/api/admin/export/excel",
      "AUM-volunteers.xlsx"
    );
  };

  // ============================================================
  // PDF
  //
  // Only use this if your backend actually provides:
  //
  // GET /api/admin/export/pdf
  //
  // ============================================================

  const downloadPdf = () => {
    downloadAuthenticatedFile(
      "/api/admin/export/pdf",
      "AUM-volunteers-report.pdf"
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* ====================================================== */}
      {/* SIDEBAR */}
      {/* ====================================================== */}

      <Sidebar />

      {/* ====================================================== */}
      {/* MAIN */}
      {/* ====================================================== */}

      <div className="flex-1 min-w-0">

        <Navbar />

        <main className="p-5 md:p-8">

          {/* ================================================== */}
          {/* HEADER */}
          {/* ================================================== */}

          <div className="mb-8">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>

                <div className="flex items-center gap-3 mb-2">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">

                    <Download
                      size={25}
                      className="text-green-700"
                    />

                  </div>

                  <div>

                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                      Export Center
                    </h1>

                  </div>

                </div>

                <p className="text-slate-500">
                  Download official AUM volunteer records
                  and administrative reports.
                </p>

              </div>

              {/* Security badge */}

              <div className="inline-flex items-center gap-2 self-start rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">

                <ShieldCheck size={17} />

                Authorized Admin Export

              </div>

            </div>

          </div>

          {/* ================================================== */}
          {/* SUCCESS MESSAGE */}
          {/* ================================================== */}

          {message && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-green-700">

              <CheckCircle2
                size={20}
                className="shrink-0"
              />

              <span className="text-sm font-medium">
                {message}
              </span>

            </div>
          )}

          {/* ================================================== */}
          {/* ERROR MESSAGE */}
          {/* ================================================== */}

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">

              <AlertCircle
                size={20}
                className="shrink-0"
              />

              <span className="text-sm font-medium">
                {error}
              </span>

            </div>
          )}

          {/* ================================================== */}
          {/* STATISTICS */}
          {/* ================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

            {/* Volunteers */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">

                  <Users
                    size={28}
                    className="text-green-600"
                  />

                </div>

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Volunteer Records
                  </p>

                  <h2 className="text-xl font-bold text-slate-900">
                    All Volunteers
                  </h2>

                </div>

              </div>

            </div>

            {/* Database */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">

                  <Database
                    size={28}
                    className="text-blue-600"
                  />

                </div>

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Source
                  </p>

                  <h2 className="text-xl font-bold text-slate-900">
                    Live Database
                  </h2>

                </div>

              </div>

            </div>

            {/* Reports */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100">

                  <FileText
                    size={28}
                    className="text-orange-600"
                  />

                </div>

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Reports
                  </p>

                  <h2 className="text-xl font-bold text-slate-900">
                    Export Ready
                  </h2>

                </div>

              </div>

            </div>

          </div>

          {/* ================================================== */}
          {/* EXPORT OPTIONS */}
          {/* ================================================== */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ================================================== */}
            {/* EXCEL */}
            {/* ================================================== */}

            <div className="rounded-3xl border border-slate-200 bg-white p-7 md:p-8 shadow-sm">

              <div className="flex items-start gap-5 mb-7">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-green-100">

                  <FileSpreadsheet
                    size={34}
                    className="text-green-600"
                  />

                </div>

                <div>

                  <h2 className="text-2xl font-bold text-slate-900">
                    Excel Export
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Download all registered AUM
                    volunteers as an Excel spreadsheet.
                  </p>

                </div>

              </div>

              <div className="mb-7 rounded-2xl bg-slate-50 p-5">

                <p className="mb-3 text-sm font-semibold text-slate-700">
                  Included volunteer information
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">

                  <div>✓ Registration Number</div>
                  <div>✓ Full Name</div>
                  <div>✓ Phone Number</div>
                  <div>✓ Gender</div>
                  <div>✓ LGA</div>
                  <div>✓ Ward</div>
                  <div>✓ Unit</div>
                  <div>✓ Qualification</div>
                  <div>✓ Employment Status</div>
                  <div>✓ Registration Date</div>

                </div>

              </div>

              <button
                type="button"
                onClick={downloadExcel}
                disabled={Boolean(downloading)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {downloading === "AUM-volunteers.xlsx" ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                    Preparing Excel...
                  </>
                ) : (
                  <>
                    <Download size={19} />
                    Export Excel
                  </>
                )}

              </button>

            </div>

            {/* ================================================== */}
            {/* PDF */}
            {/* ================================================== */}

            <div className="rounded-3xl border border-slate-200 bg-white p-7 md:p-8 shadow-sm">

              <div className="flex items-start gap-5 mb-7">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-red-100">

                  <FileText
                    size={34}
                    className="text-red-600"
                  />

                </div>

                <div>

                  <h2 className="text-2xl font-bold text-slate-900">
                    PDF Report
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Download a printable official
                    AUM volunteer report.
                  </p>

                </div>

              </div>

              <div className="mb-7 rounded-2xl bg-slate-50 p-5">

                <p className="mb-3 text-sm font-semibold text-slate-700">
                  Report contents
                </p>

                <div className="space-y-2 text-sm text-slate-600">

                  <div>✓ Official AUM Report</div>
                  <div>✓ Registration Summary</div>
                  <div>✓ Volunteer List</div>
                  <div>✓ Print Ready</div>

                </div>

              </div>

              <button
                type="button"
                onClick={downloadPdf}
                disabled={Boolean(downloading)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {downloading === "AUM-volunteers-report.pdf" ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                    Preparing PDF...
                  </>
                ) : (
                  <>
                    <Download size={19} />
                    Export PDF
                  </>
                )}

              </button>

            </div>

          </div>

          {/* ================================================== */}
          {/* EXPORT INFORMATION */}
          {/* ================================================== */}

          <div className="mt-8 rounded-3xl border border-blue-100 bg-blue-50 p-6">

            <div className="flex items-start gap-4">

              <Database
                size={22}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <div>

                <h3 className="font-bold text-blue-900">
                  Export information
                </h3>

                <p className="mt-1 text-sm leading-6 text-blue-700">
                  Exported records are generated directly
                  from the current AUM database. Only
                  authenticated administrators can access
                  these downloads.
                </p>

              </div>

            </div>

          </div>

        </main>

      </div>
    </div>
  );
}