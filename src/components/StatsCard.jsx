import {
  Users,
  UserCheck,
  UserX,
  Briefcase,
  Venus,
  Mars,
  Accessibility,
} from "lucide-react";

export default function StatsCard({ title, value }) {
  // ============================================================
  // ICON CONFIGURATION
  // ============================================================

  const getIcon = () => {
    switch (title) {
      case "Total Volunteers":
        return <Users size={26} strokeWidth={2.2} />;

      case "Male":
        return <Mars size={26} strokeWidth={2.2} />;

      case "Female":
        return <Venus size={26} strokeWidth={2.2} />;

      case "Employed":
        return <Briefcase size={26} strokeWidth={2.2} />;

      case "Unemployed":
        return <UserX size={26} strokeWidth={2.2} />;

      case "AUM Volunteers":
        return <UserCheck size={26} strokeWidth={2.2} />;

      case "Physically Challenged":
        return (
          <Accessibility
            size={26}
            strokeWidth={2.2}
          />
        );

      default:
        return (
          <Users
            size={26}
            strokeWidth={2.2}
          />
        );
    }
  };

  // ============================================================
  // CARD
  // ============================================================

  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        border-green-700/20
        bg-gradient-to-br
        from-[#0B3D2E]
        via-[#0F5132]
        to-[#14532D]
        p-6
        text-white
        shadow-md
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
    >
      {/* ====================================================== */}
      {/* DECORATIVE BACKGROUND */}
      {/* ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -right-10
          -top-10
          h-32
          w-32
          rounded-full
          bg-white/10
          transition-transform
          duration-500
          group-hover:scale-125
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-12
          -left-12
          h-28
          w-28
          rounded-full
          bg-white/5
        "
      />

      {/* ====================================================== */}
      {/* CONTENT */}
      {/* ====================================================== */}

      <div className="relative z-10">

        <div className="flex items-start justify-between gap-4">

          {/* ================================================== */}
          {/* TEXT */}
          {/* ================================================== */}

          <div className="min-w-0">

            <p
              className="
                text-sm
                font-medium
                text-white/75
              "
            >
              {title}
            </p>

            <h2
              className="
                mt-2
                text-4xl
                font-bold
                tracking-tight
                text-white
              "
            >
              {value ?? 0}
            </h2>

          </div>

          {/* ================================================== */}
          {/* ICON */}
          {/* ================================================== */}

          <div
            className="
              flex
              h-14
              w-14
              shrink-0
              items-center
              justify-center
              rounded-2xl
              border
              border-white/10
              bg-white/15
              text-white
              shadow-inner
              backdrop-blur-sm
              transition-all
              duration-300
              group-hover:bg-white/20
              group-hover:scale-105
            "
          >
            {getIcon()}
          </div>

        </div>

        {/* ==================================================== */}
        {/* BOTTOM ACCENT */}
        {/* ==================================================== */}

        <div
          className="
            mt-5
            h-1
            w-12
            rounded-full
            bg-white/30
            transition-all
            duration-300
            group-hover:w-20
          "
        />

      </div>
    </div>
  );
}