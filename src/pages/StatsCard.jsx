import React from "react";

export default function StatsCard({
  title,
  value,
  icon,
  color,
}) {
  const Icon = icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">

      <div className="flex justify-between items-center">

        <div>
          <p className="text-slate-500 text-sm">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2 text-slate-900">
            {value}
          </h2>
        </div>

        <div
          className={`${color} w-14 h-14 rounded-xl flex items-center justify-center`}
        >
          <Icon
            size={28}
            className="text-white"
          />
        </div>

      </div>

    </div>
  );
}