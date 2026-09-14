import type { ReactNode } from "react";
import { Check, LockKeyhole, Sparkles } from "lucide-react";

/* ============================================================
   ARROW PATHS
   ============================================================ */

const PATHS = {
  left: {
    d: "M 10 118 C 34 94, 61 88, 88 101",
    color: "#60A5FA",
    marker: "arrow-blue",
  },

  right: {
    d: "M 150 104 C 126 86, 104 88, 82 102",
    color: "#A78BFA",
    marker: "arrow-violet",
  },

  bottom: {
    d: "M 18 34 C 40 51, 62 58, 84 49",
    color: "#6EE7B7",
    marker: "arrow-emerald",
  },
} as const;

/* ============================================================
   RESUME DOCUMENT
   ============================================================ */

function ResumeDocument() {
  return (
    <div
      className="
        relative
        h-[324px]
        w-[194px]
        shrink-0
        overflow-hidden
        rounded-[10px]
        border
        border-slate-200/80
        bg-white
        px-3
        py-2.5
        shadow-[0_18px_40px_rgba(15,23,42,0.13)]

        sm:h-[344px]
        sm:w-[205px]
        sm:rounded-[11px]
        sm:px-3.5
        sm:py-2.5

        md:h-[365px]
        md:w-[220px]
        md:px-3.5
        md:py-3

        lg:h-[385px]
        lg:w-[232px]
        lg:px-4
        lg:py-3
      "
    >
      {/* ======================================================
          PDF DOCUMENT HEADER
          ====================================================== */}

      <div
        className="
          mb-1.5
          flex
          items-center
          justify-between
          border-b
          border-slate-100
          pb-1.5

          sm:mb-2
          sm:pb-1.5

          md:mb-2
          md:pb-2
        "
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <div
            className="
              flex
              h-4
              w-4
              shrink-0
              items-center
              justify-center
              rounded-[4px]
              bg-rose-50
              text-[3.5px]
              font-extrabold
              text-rose-500
              ring-1
              ring-rose-100

              sm:h-[18px]
              sm:w-[18px]
              sm:text-[4px]

              md:h-5
              md:w-5
              md:text-[4.2px]
            "
          >
            PDF
          </div>

          <div className="min-w-0">
            <p
              className="
                truncate
                text-[4.2px]
                font-semibold
                text-slate-700

                sm:text-[4.5px]

                md:text-[4.8px]
              "
            >
              Alex_Morgan_Resume.pdf
            </p>

            <p
              className="
                text-[3.7px]
                text-slate-400

                sm:text-[4px]

                md:text-[4.2px]
              "
            >
              1 page · 245 KB
            </p>
          </div>
        </div>

        <div
          className="
            flex
            shrink-0
            items-center
            gap-1
            rounded-full
            border
            border-emerald-100
            bg-emerald-50
            px-1
            py-0.5

            md:px-1.5
            md:py-1
          "
        >
          <span className="h-1 w-1 rounded-full bg-emerald-500 sm:h-1.5 sm:w-1.5" />

          <span
            className="
              text-[3.8px]
              font-semibold
              text-emerald-600

              sm:text-[4.2px]

              md:text-[4.5px]
            "
          >
            Analyzing
          </span>
        </div>
      </div>

      {/* ======================================================
          PERSONAL HEADER
          ====================================================== */}

      <header className="border-b border-slate-100 pb-1.5 sm:pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2
              className="
                text-[11px]
                font-extrabold
                leading-none
                tracking-[-0.03em]
                text-slate-900

                sm:text-[12.5px]

                md:text-[13.5px]
              "
            >
              Alex Morgan
            </h2>

            <p
              className="
                mt-0.5
                text-[5.3px]
                font-semibold
                text-blue-600

                sm:text-[5.8px]

                md:text-[6.2px]
              "
            >
              Data Analyst
            </p>
          </div>

          <div
            className="
              flex
              h-5.5
              w-5.5
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-gradient-to-br
              from-blue-50
              via-indigo-50
              to-violet-50
              text-[5.3px]
              font-bold
              text-indigo-600
              ring-1
              ring-indigo-100

              sm:h-6.5
              sm:w-6.5
              sm:text-[5.8px]

              md:h-7
              md:w-7
              md:text-[6.2px]
            "
          >
            AM
          </div>
        </div>

        <div
          className="
            mt-1
            flex
            flex-wrap
            gap-x-1
            gap-y-0.5

            sm:mt-1.5
            sm:gap-x-1.5

            md:mt-1.5
            md:gap-x-2
          "
        >
          <ResumeMeta>alex.morgan@email.com</ResumeMeta>
          <ResumeDivider />
          <ResumeMeta>+1 234 567 890</ResumeMeta>
          <ResumeDivider />
          <ResumeMeta>New York, USA</ResumeMeta>
        </div>

        <div
          className="
            mt-0.5
            flex
            flex-wrap
            gap-x-1

            sm:gap-x-1.5

            md:gap-x-2
          "
        >
          <ResumeMeta>linkedin.com/in/alexmorgan</ResumeMeta>
          <ResumeDivider />
          <ResumeMeta>github.com/alexmorgan</ResumeMeta>
        </div>
      </header>

      {/* ======================================================
          PROFESSIONAL SUMMARY
          ====================================================== */}

      <ResumeSection title="PROFESSIONAL SUMMARY">
        <p
          className="
            text-[4.1px]
            leading-[1.45]
            text-slate-500

            sm:text-[4.5px]

            md:text-[4.9px]
          "
        >
          Data Analyst with experience in SQL, Python, Power BI and Excel.
          Skilled in transforming complex datasets into actionable insights,
          dashboards and business recommendations.
        </p>
      </ResumeSection>

      {/* ======================================================
          WORK EXPERIENCE
          ====================================================== */}

      <ResumeSection title="WORK EXPERIENCE">
        <div className="space-y-1.5 sm:space-y-2">
          {/* Experience 1 */}
          <div>
            <div className="flex items-start justify-between gap-1.5">
              <div className="min-w-0">
                <p
                  className="
                    truncate
                    text-[4.9px]
                    font-bold
                    text-slate-800

                    sm:text-[5.3px]

                    md:text-[5.7px]
                  "
                >
                  Data Analyst
                </p>

                <p
                  className="
                    mt-0.5
                    text-[4.1px]
                    font-semibold
                    text-blue-600

                    sm:text-[4.5px]

                    md:text-[4.8px]
                  "
                >
                  ABC Technologies
                </p>
              </div>

              <span
                className="
                  shrink-0
                  text-[3.8px]
                  font-medium
                  text-slate-400

                  sm:text-[4px]

                  md:text-[4.3px]
                "
              >
                Jan 2022 – Present
              </span>
            </div>

            <div className="mt-0.5 space-y-[2px]">
              <ResumeBullet>
                Built Power BI dashboards to monitor business KPIs.
              </ResumeBullet>

              <ResumeBullet>
                Cleaned and transformed 50K+ records using SQL and Python.
              </ResumeBullet>

              <ResumeBullet>
                Identified trends that supported data-driven decisions.
              </ResumeBullet>
            </div>
          </div>

          {/* Experience 2 */}
          <div>
            <div className="flex items-start justify-between gap-1.5">
              <div className="min-w-0">
                <p
                  className="
                    truncate
                    text-[4.9px]
                    font-bold
                    text-slate-800

                    sm:text-[5.3px]

                    md:text-[5.7px]
                  "
                >
                  Junior Data Analyst
                </p>

                <p
                  className="
                    mt-0.5
                    text-[4.1px]
                    font-semibold
                    text-blue-600

                    sm:text-[4.5px]

                    md:text-[4.8px]
                  "
                >
                  XYZ Solutions
                </p>
              </div>

              <span
                className="
                  shrink-0
                  text-[3.8px]
                  font-medium
                  text-slate-400

                  sm:text-[4px]

                  md:text-[4.3px]
                "
              >
                Jul 2020 – Dec 2021
              </span>
            </div>

            <div className="mt-0.5 space-y-[2px]">
              <ResumeBullet>
                Prepared recurring reports using Excel and SQL.
              </ResumeBullet>

              <ResumeBullet>
                Performed exploratory analysis to identify business trends.
              </ResumeBullet>
            </div>
          </div>
        </div>
      </ResumeSection>

      {/* ======================================================
          PROJECT — ONE
          ====================================================== */}

      <ResumeSection title="PROJECT">
        <div>
          <div className="flex items-start justify-between gap-1.5">
            <p
              className="
                text-[4.9px]
                font-bold
                text-slate-800

                sm:text-[5.3px]

                md:text-[5.7px]
              "
            >
              Sales Performance Dashboard
            </p>

            <span
              className="
                shrink-0
                rounded-full
                bg-blue-50
                px-1
                py-0.5
                text-[3.5px]
                font-semibold
                text-blue-600
                ring-1
                ring-blue-100

                md:px-1.5
              "
            >
              Power BI
            </span>
          </div>

          <p
            className="
              mt-0.5
              text-[4px]
              leading-[1.4]
              text-slate-500

              sm:text-[4.4px]

              md:text-[4.8px]
            "
          >
            Built an interactive dashboard with KPI tracking, trend analysis,
            regional performance insights and executive-level reporting.
          </p>

          <div className="mt-0.5 space-y-[2px]">
            <ResumeBullet>
              Designed reusable KPI views for business stakeholders.
            </ResumeBullet>

            <ResumeBullet>
              Improved visibility into monthly sales performance.
            </ResumeBullet>
          </div>
        </div>
      </ResumeSection>

      {/* ======================================================
          SKILLS — EXACTLY FIVE
          ====================================================== */}

      <ResumeSection title="SKILLS">
        <div className="flex flex-wrap gap-1">
          <ResumeSkill label="Python" tone="blue" />
          <ResumeSkill label="SQL" tone="indigo" />
          <ResumeSkill label="Power BI" tone="violet" />
          <ResumeSkill label="Excel" tone="emerald" />
          <ResumeSkill label="Pandas" tone="slate" />
        </div>
      </ResumeSection>

      {/* ======================================================
          EDUCATION
          ====================================================== */}

      <ResumeSection title="EDUCATION">
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0">
            <p
              className="
                truncate
                text-[4.7px]
                font-bold
                text-slate-800

                sm:text-[5.1px]

                md:text-[5.5px]
              "
            >
              B.Sc. Computer Science
            </p>

            <p
              className="
                mt-0.5
                text-[4px]
                text-slate-500

                sm:text-[4.3px]

                md:text-[4.7px]
              "
            >
              University of California
            </p>
          </div>

          <span
            className="
              shrink-0
              text-[3.8px]
              font-medium
              text-slate-400

              sm:text-[4px]

              md:text-[4.3px]
            "
          >
            2016 – 2020
          </span>
        </div>
      </ResumeSection>

      {/* ======================================================
          CERTIFICATION
          ====================================================== */}

      <ResumeSection title="CERTIFICATION">
        <div className="flex items-center justify-between gap-1.5">
          <p
            className="
              text-[4.1px]
              font-medium
              text-slate-600

              sm:text-[4.5px]

              md:text-[4.8px]
            "
          >
            Microsoft Power BI Data Analyst
          </p>

          <span
            className="
              shrink-0
              rounded-full
              bg-emerald-50
              px-1
              py-0.5
              text-[3.5px]
              font-semibold
              text-emerald-600
              ring-1
              ring-emerald-100

              sm:px-1.5
            "
          >
            Certified
          </span>
        </div>
      </ResumeSection>

      {/* ======================================================
          SCAN HIGHLIGHT 1
          ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-3
          right-3
          top-[32%]
          h-[29px]
          rounded-[5px]
          border
          border-blue-200/40
          bg-blue-50/20
          shadow-[0_0_16px_rgba(96,165,250,0.07)]
          animate-[scanHighlightOne_5.8s_ease-in-out_infinite]

          sm:left-3.5
          sm:right-3.5
          sm:h-[32px]
        "
      />

      {/* ======================================================
          SCAN HIGHLIGHT 2
          ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-3
          right-3
          top-[49%]
          h-[33px]
          rounded-[5px]
          border
          border-violet-200/30
          bg-violet-50/14
          animate-[scanHighlightTwo_5.8s_ease-in-out_infinite]

          sm:left-3.5
          sm:right-3.5
          sm:h-[36px]
        "
      />

      {/* ======================================================
          SCAN HIGHLIGHT 3
          ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-3
          right-3
          top-[68%]
          h-[22px]
          rounded-[5px]
          border
          border-emerald-200/25
          bg-emerald-50/12
          animate-[scanHighlightThree_5.8s_ease-in-out_infinite]

          sm:left-3.5
          sm:right-3.5
          sm:h-[24px]
        "
      />

      {/* ======================================================
          SCANNER BEAM
          ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          left-2
          right-2
          top-0
          z-30
          h-7
          animate-[resumeScan_5.8s_cubic-bezier(0.45,0.05,0.55,0.95)_infinite]

          sm:left-2.5
          sm:right-2.5
        "
      >
        {/* Soft beam */}
        <div
          className="
            absolute
            inset-x-[3%]
            top-0
            h-7
            bg-gradient-to-b
            from-blue-400/15
            via-blue-300/7
            to-transparent
            blur-[4px]
          "
        />

        {/* Main line */}
        <div
          className="
            absolute
            inset-x-0
            top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-blue-500
            to-transparent
            shadow-[0_0_8px_rgba(59,130,246,0.85)]
          "
        />

        {/* Bright center */}
        <div
          className="
            absolute
            left-1/2
            top-[-1px]
            h-[3px]
            w-[28%]
            -translate-x-1/2
            rounded-full
            bg-blue-400/90
            blur-[1.5px]
          "
        />

        {/* Scan point */}
        <div
          className="
            absolute
            left-1/2
            top-[-2px]
            h-1
            w-1
            -translate-x-1/2
            rounded-full
            bg-white
            shadow-[0_0_8px_2px_rgba(96,165,250,0.8)]
          "
        />
      </div>
    </div>
  );
}

/* ============================================================
   RESUME SECTION
   ============================================================ */

function ResumeSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-1.5 sm:mt-2">
      <div className="mb-0.5 flex items-center gap-1">
        <h3
          className="
            text-[5px]
            font-extrabold
            tracking-[0.08em]
            text-slate-700

            sm:text-[5.4px]

            md:text-[5.8px]
          "
        >
          {title}
        </h3>

        <div className="h-px flex-1 bg-slate-100" />
      </div>

      {children}
    </section>
  );
}

/* ============================================================
   RESUME META
   ============================================================ */

function ResumeMeta({ children }: { children: ReactNode }) {
  return (
    <span
      className="
        text-[3.8px]
        font-medium
        text-slate-400

        sm:text-[4.1px]

        md:text-[4.5px]
      "
    >
      {children}
    </span>
  );
}

function ResumeDivider() {
  return <span className="text-[3.2px] text-slate-200">•</span>;
}

/* ============================================================
   RESUME BULLET
   ============================================================ */

function ResumeBullet({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-1">
      <span className="mt-[2px] h-[3px] w-[3px] shrink-0 rounded-full bg-slate-300" />

      <p
        className="
          text-[3.8px]
          leading-[1.4]
          text-slate-500

          sm:text-[4.1px]

          md:text-[4.5px]
        "
      >
        {children}
      </p>
    </div>
  );
}

/* ============================================================
   RESUME SKILL
   ============================================================ */

function ResumeSkill({
  label,
  tone,
}: {
  label: string;
  tone: "blue" | "indigo" | "violet" | "emerald" | "slate";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    violet: "bg-violet-50 text-violet-600 ring-violet-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    slate: "bg-slate-50 text-slate-600 ring-slate-100",
  };

  return (
    <span
      className={`
        rounded-[3px]
        px-1.5
        py-0.5
        text-[3.9px]
        font-semibold
        ring-1

        sm:text-[4.2px]

        md:text-[4.5px]

        ${tones[tone]}
      `}
    >
      {label}
    </span>
  );
}

/* ============================================================
   MAGNIFYING GLASS
   ============================================================
   REDESIGN NOTE:
   Previously the lens was a plain div (`inset-0`, circular
   border) and the handle was a SEPARATE div positioned with
   manual bottom/right offsets + its own rotate. Two independent
   elements with independently-guessed offsets never line up
   pixel-perfectly across breakpoints, which is why the handle
   looked "detached" from the glass.

   Fix: draw the entire magnifying glass — frame, glass, collar
   joint and handle — as ONE SVG so the geometry is exact and
   scales together at every breakpoint:
     1. The handle is a single rounded line whose start point
        sits exactly on the frame's own radius (no guesswork).
     2. A small "collar" (ferrule) circle is drawn on top of the
        seam, exactly like the metal ring on a real magnifying
        glass, so there's a deliberate joint rather than a gap
        or an awkward overlap.
     3. Frame + lens are drawn last, so the handle is visually
        anchored under/at the rim rather than floating near it.
   ============================================================ */

function MagnifyingGlass() {
  return (
    <div
      className="
        pointer-events-none
        absolute
        left-[52%]
        top-[40%]
        z-40
        h-[100px]
        w-[100px]
        animate-[magnifierScan_6.4s_linear_infinite]

        sm:h-[110px]
        sm:w-[110px]

        md:h-[120px]
        md:w-[120px]

        lg:h-[130px]
        lg:w-[130px]
      "
    >
      <svg
        viewBox="0 0 132 132"
        className="h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="lensGlass" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#EFF6FF" stopOpacity="0.6" />
            <stop offset="45%" stopColor="#DBEAFE" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#C7D2FE" stopOpacity="0.1" />
          </radialGradient>

          {/* Frame — brushed chrome/silver, lighter & cooler than
              the handle so the rim reads as a distinct material */}
          <linearGradient id="frameMetal" x1="15%" y1="5%" x2="90%" y2="95%">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="35%" stopColor="#CBD5E1" />
            <stop offset="65%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>

          {/* Handle — dark walnut wood tone, warm and clearly
              different from the frame's cool chrome */}
          <linearGradient id="handleWood" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B4783F" />
            <stop offset="40%" stopColor="#8A5A2B" />
            <stop offset="75%" stopColor="#5E3A1A" />
            <stop offset="100%" stopColor="#3D2410" />
          </linearGradient>

          {/* Collar / ferrule — brushed brass accent, distinct from
              both the chrome frame and the wooden handle */}
          <linearGradient id="collarBrass" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#FDE9A8" />
            <stop offset="45%" stopColor="#D9A441" />
            <stop offset="100%" stopColor="#93651C" />
          </linearGradient>

          <filter id="glassShine" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.8" />
          </filter>

          <filter id="glassDropShadow" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="4"
              floodColor="#0F172A"
              floodOpacity="0.18"
            />
          </filter>
        </defs>

        {/* Outer breathing ring (decorative pulse, matches original) */}
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="#60A5FA"
          strokeWidth="1"
          className="animate-[lensOuterBreath_2.4s_ease-in-out_infinite]"
          style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
        />

        {/* Inner breathing ring */}
        <circle
          cx="50"
          cy="50"
          r="41"
          fill="none"
          stroke="#3B82F6"
          strokeWidth="1.5"
          className="animate-[lensBreath_2.4s_ease-in-out_infinite]"
          style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
        />

        {/* Handle — starts exactly on the frame's own radius so
            there is zero gap between glass and handle */}
        <line
          x1="79"
          y1="79"
          x2="110"
          y2="110"
          stroke="url(#handleWood)"
          strokeWidth="15"
          strokeLinecap="round"
          filter="url(#glassDropShadow)"
        />

        {/* Wood grain highlight on the handle */}
        <line
          x1="85"
          y1="85"
          x2="107"
          y2="107"
          stroke="#F4D9A8"
          strokeOpacity="0.3"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Grip texture on the handle */}
        <line
          x1="87"
          y1="87"
          x2="105"
          y2="105"
          stroke="#000000"
          strokeOpacity="0.22"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="3 4"
        />

        {/* Frame + lens (drawn after the handle start, so the
            rim visually sits on top of the handle's root) */}
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="url(#lensGlass)"
          stroke="url(#frameMetal)"
          strokeWidth="9"
          filter="url(#glassDropShadow)"
        />

        {/* Inner rim highlight */}
        <circle
          cx="50"
          cy="50"
          r="31.5"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.25"
          strokeWidth="1"
        />

        {/* Collar / ferrule — brass ring that visually joins the
            frame to the handle, covering the seam with a
            contrasting accent color */}
        <circle
          cx="79"
          cy="79"
          r="8.5"
          fill="url(#collarBrass)"
          stroke="#6B4614"
          strokeWidth="1"
        />

        <circle cx="76.5" cy="76.5" r="1.6" fill="#FFFDF3" opacity="0.55" />

        {/* Glass shine */}
        <ellipse
          cx="35"
          cy="32"
          rx="13"
          ry="5.5"
          fill="#FFFFFF"
          opacity="0.55"
          filter="url(#glassShine)"
          transform="rotate(-35 35 32)"
        />

        <circle cx="68" cy="66" r="2.4" fill="#FFFFFF" opacity="0.4" />
      </svg>
    </div>
  );
}

/* ============================================================
   ANIMATED ARROW
   ============================================================ */

function AnimatedArrow({
  path,
  color,
  marker,
  className,
  delay = "0s",
}: {
  path: string;
  color: string;
  marker: string;
  className: string;
  delay?: string;
}) {
  return (
    <svg
      className={`pointer-events-none absolute hidden overflow-visible lg:block ${className}`}
      viewBox="0 0 160 160"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <filter
          id={`${marker}-glow`}
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur
            stdDeviation="2"
            result="blur"
          />

          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <marker
          id={marker}
          markerWidth="7"
          markerHeight="7"
          refX="5.5"
          refY="3.5"
          orient="auto-start-reverse"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M 0 0 L 7 3.5 L 0 7 Z"
            fill={color}
          />
        </marker>
      </defs>

      {/* Glow */}
      <path
        d={path}
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.07"
        filter={`url(#${marker}-glow)`}
      />

      {/* Dashed path */}
      <path
        d={path}
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="5 7"
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd={`url(#${marker})`}
        opacity="0.64"
        className="animate-[arrowDash_3.4s_linear_infinite]"
        style={{ animationDelay: delay }}
      />

      {/* Moving point */}
      <circle
        r="3.4"
        fill="white"
        opacity="0.9"
        filter={`url(#${marker}-glow)`}
      >
        <animateMotion
          dur="3.4s"
          begin={delay}
          repeatCount="indefinite"
          path={path}
        />
      </circle>
    </svg>
  );
}

/* ============================================================
   STATUS PILL
   ============================================================ */

function StatusPill({
  color,
  children,
  className,
}: {
  color: "blue" | "violet" | "emerald";
  children: ReactNode;
  className: string;
}) {
  const iconColors = {
    blue: "bg-blue-500",
    violet: "bg-violet-500",
    emerald: "bg-emerald-500",
  };

  return (
    <div
      className={`
        absolute
        z-50
        hidden
        items-center
        gap-1
        whitespace-nowrap
        rounded-full
        border
        border-white/90
        bg-white/95
        px-1.5
        py-1
        shadow-[0_5px_14px_rgba(15,23,42,0.055)]
        backdrop-blur-sm

        lg:flex
        lg:gap-1.5
        lg:px-2
        lg:py-1.5

        ${className}
      `}
    >
      <span
        className={`
          flex
          h-4
          w-4
          shrink-0
          items-center
          justify-center
          rounded-full

          lg:h-5
          lg:w-5

          ${iconColors[color]}
        `}
      >
        <Check
          size={9}
          strokeWidth={2.8}
          className="text-white lg:h-2.5 lg:w-2.5"
        />
      </span>

      <span className="text-[7px] font-semibold leading-none text-slate-700 lg:text-[8px]">
        {children}
      </span>
    </div>
  );
}

/* ============================================================
   BACKGROUND DECORATIONS
   ============================================================ */

function BackgroundDecorations() {
  return (
    <>
      <div
        className="
          pointer-events-none
          absolute
          left-[21%]
          top-[16%]
          h-36
          w-36
          rounded-full
          bg-blue-200/20
          blur-3xl

          sm:h-44
          sm:w-44

          md:h-52
          md:w-52
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          right-[12%]
          top-[24%]
          h-32
          w-32
          rounded-full
          bg-violet-200/18
          blur-3xl

          sm:h-40
          sm:w-40

          md:h-48
          md:w-48
        "
      />

      <div className="pointer-events-none absolute left-[10%] top-[8%] h-8 w-8 rounded-full bg-white/55 blur-sm sm:h-10 sm:w-10 md:h-12 md:w-12" />

      <div className="pointer-events-none absolute left-[16%] top-[20%] h-2.5 w-2.5 rounded-full bg-white/85 sm:h-3 sm:w-3" />

      <div className="pointer-events-none absolute right-[14%] top-[21%] h-4 w-4 rounded-full bg-white/70 sm:h-5 sm:w-5" />

      <div className="pointer-events-none absolute left-[9%] bottom-[24%] h-5 w-5 rounded-full bg-emerald-200/40 sm:h-6 sm:w-6" />

      <div className="pointer-events-none absolute right-[12%] bottom-[16%] h-6 w-6 rounded-full bg-violet-200/30 sm:h-7 sm:w-7" />

      <div className="pointer-events-none absolute right-[8%] bottom-[33%] h-2.5 w-2.5 rounded-full bg-emerald-100/60 sm:h-3 sm:w-3" />

      <Sparkles
        className="
          pointer-events-none
          absolute
          right-[18%]
          top-[11%]
          h-3
          w-3
          text-violet-300/70

          sm:h-3.5
          sm:w-3.5

          md:h-4
          md:w-4
        "
        aria-hidden="true"
      />
    </>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function ResumeAnalysisPreview() {
  return (
    <div className="mx-auto w-full max-w-[500px] sm:max-w-[520px] md:max-w-[540px] lg:max-w-[560px]">
      <div
        className="
          relative
          overflow-hidden
          rounded-[20px]
          border
          border-slate-200/70
          bg-gradient-to-br
          from-[#E8FFF6]
          via-[#EEF2FF]
          to-[#F4ECFF]
          px-2
          pb-3
          pt-3
          shadow-[0_16px_45px_-10px_rgba(59,130,246,0.10)]

          sm:rounded-[22px]
          sm:px-2.5
          sm:pb-3.5
          sm:pt-4

          md:rounded-[24px]
          md:px-3
          md:pb-4
          md:pt-5

          lg:rounded-[26px]
          lg:px-4
          lg:pb-5
          lg:pt-6
        "
      >
        <BackgroundDecorations />

        {/* ======================================================
            DESKTOP STATUS LABELS
            ====================================================== */}

        <StatusPill
          color="blue"
          className="
            left-[2%]
            top-[20%]
          "
        >
          Scanning content
        </StatusPill>

        <StatusPill
          color="violet"
          className="
            right-[2%]
            top-[38%]
          "
        >
          Analyzing relevance
        </StatusPill>

        <StatusPill
          color="emerald"
          className="
            bottom-[8%]
            left-[3%]
          "
        >
          Checking key skills
        </StatusPill>

        {/* ======================================================
            DESKTOP CURVED ARROWS
            ====================================================== */}

        <AnimatedArrow
          path={PATHS.left.d}
          color={PATHS.left.color}
          marker={PATHS.left.marker}
          delay="0s"
          className="
            left-[1%]
            top-[18%]
            h-[145px]
            w-[145px]

            xl:h-[155px]
            xl:w-[155px]
          "
        />

        <AnimatedArrow
          path={PATHS.right.d}
          color={PATHS.right.color}
          marker={PATHS.right.marker}
          delay="1.1s"
          className="
            right-[1%]
            top-[29%]
            h-[145px]
            w-[145px]

            xl:h-[155px]
            xl:w-[155px]
          "
        />

        <AnimatedArrow
          path={PATHS.bottom.d}
          color={PATHS.bottom.color}
          marker={PATHS.bottom.marker}
          delay="2.2s"
          className="
            bottom-[8%]
            left-[3%]
            h-[140px]
            w-[140px]

            xl:h-[150px]
            xl:w-[150px]
          "
        />

        {/* ======================================================
            RESUME STAGE
            ====================================================== */}

        <div
          className="
            relative
            z-20
            flex
            min-h-[350px]
            items-center
            justify-center

            sm:min-h-[370px]

            md:min-h-[395px]

            lg:min-h-[415px]
          "
        >
          <ResumeDocument />

          <MagnifyingGlass />
        </div>

        {/* ======================================================
            GROUND SHADOW
            ====================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            bottom-[31px]
            left-1/2
            h-5
            w-[125px]
            -translate-x-1/2
            rounded-full
            bg-blue-300/15
            blur-xl

            sm:bottom-[34px]
            sm:h-6
            sm:w-[145px]

            md:bottom-[36px]
            md:h-7
            md:w-[165px]

            lg:bottom-[39px]
            lg:h-8
            lg:w-[180px]
          "
        />

        {/* ======================================================
            PRIVACY MESSAGE
            ====================================================== */}

        <div
          className="
            relative
            z-[60]
            flex
            items-center
            justify-center
            gap-1.5
          "
        >
          <LockKeyhole
            size={11}
            strokeWidth={1.9}
            className="text-emerald-500 sm:h-3 sm:w-3"
            aria-hidden="true"
          />

          <span
            className="
              text-[7px]
              font-medium
              text-slate-500

              sm:text-[8px]

              md:text-[8.5px]

              lg:text-[9px]
            "
          >
            Your resume is analyzed securely
          </span>
        </div>
      </div>

      {/* ========================================================
          CAPTION
          ======================================================== */}

      <p
        className="
          mt-2
          px-2
          text-center
          text-[7px]
          font-medium
          leading-4
          text-slate-400

          sm:mt-2.5
          sm:px-0
          sm:text-[8px]

          md:mt-3
          md:text-[8.5px]
        "
      >
        Resume structure, skills and role fit are analyzed together.
      </p>

      {/* ========================================================
          ANIMATION STYLES
          ======================================================== */}

      <style>{`
        /* ========================================================
           MAGNIFIER
           ------------------------------------------------------
           linear timing + dense (every ~3-4%) keyframes generated
           along a smooth closed elliptical loop. Because the
           timing function is linear and consecutive points are
           close together, the browser's interpolation between
           each pair of stops is effectively straight-line motion
           over a tiny arc — the result reads as one continuous,
           constant-speed sweep with no braking at any point.
           ======================================================== */

        @keyframes magnifierScan {
          0%   { transform: translate3d(-7px, -72px, 0) rotate(-8deg); }
          3%   { transform: translate3d(-6.6px, -69px, 0) rotate(-7.8deg); }
          6%   { transform: translate3d(-6px, -64px, 0) rotate(-7.4deg); }
          9%   { transform: translate3d(-5px, -58px, 0) rotate(-6.9deg); }
          12%  { transform: translate3d(-3.6px, -51px, 0) rotate(-6.2deg); }
          15%  { transform: translate3d(-2px, -43px, 0) rotate(-5.4deg); }
          18%  { transform: translate3d(-0.2px, -35px, 0) rotate(-4.5deg); }
          21%  { transform: translate3d(1.6px, -27px, 0) rotate(-3.5deg); }
          24%  { transform: translate3d(3.4px, -19px, 0) rotate(-2.5deg); }
          27%  { transform: translate3d(5px, -11px, 0) rotate(-1.4deg); }
          30%  { transform: translate3d(6.4px, -3px, 0) rotate(-0.3deg); }
          33%  { transform: translate3d(7.5px, 5px, 0) rotate(0.8deg); }
          36%  { transform: translate3d(8px, 13px, 0) rotate(1.9deg); }
          39%  { transform: translate3d(7.9px, 20px, 0) rotate(2.9deg); }
          42%  { transform: translate3d(7.2px, 27px, 0) rotate(3.9deg); }
          45%  { transform: translate3d(6px, 33px, 0) rotate(4.7deg); }
          48%  { transform: translate3d(4.4px, 38px, 0) rotate(5.3deg); }
          50%  { transform: translate3d(3px, 41px, 0) rotate(5.7deg); }
          53%  { transform: translate3d(0.8px, 44.5px, 0) rotate(6deg); }
          56%  { transform: translate3d(-1.6px, 46.5px, 0) rotate(5.9deg); }
          59%  { transform: translate3d(-3.6px, 47px, 0) rotate(5.5deg); }
          62%  { transform: translate3d(-5.2px, 46px, 0) rotate(4.8deg); }
          65%  { transform: translate3d(-6.4px, 43.5px, 0) rotate(3.9deg); }
          68%  { transform: translate3d(-7.1px, 39.5px, 0) rotate(2.8deg); }
          71%  { transform: translate3d(-7.4px, 34.5px, 0) rotate(1.6deg); }
          74%  { transform: translate3d(-7.3px, 28.5px, 0) rotate(0.3deg); }
          77%  { transform: translate3d(-6.9px, 21.5px, 0) rotate(-1.1deg); }
          80%  { transform: translate3d(-6.2px, 14px, 0) rotate(-2.5deg); }
          83%  { transform: translate3d(-5.4px, 6px, 0) rotate(-3.8deg); }
          86%  { transform: translate3d(-5px, -2px, 0) rotate(-5deg); }
          88%  { transform: translate3d(-4.8px, -8px, 0) rotate(-5.8deg); }
          90%  { transform: translate3d(-4.8px, -16px, 0) rotate(-6.6deg); }
          92%  { transform: translate3d(-5px, -24px, 0) rotate(-7.2deg); }
          94%  { transform: translate3d(-5.5px, -33px, 0) rotate(-7.7deg); }
          96%  { transform: translate3d(-6.2px, -44px, 0) rotate(-8deg); }
          98%  { transform: translate3d(-6.8px, -58px, 0) rotate(-8.1deg); }
          100% { transform: translate3d(-7px, -72px, 0) rotate(-8deg); }
        }

        /* ========================================================
           LENS
           ======================================================== */

        @keyframes lensBreath {
          0%,
          100% {
            opacity: 0;
            transform: scale(0.98);
          }

          50% {
            opacity: 0.2;
            transform: scale(1.02);
          }
        }

        @keyframes lensOuterBreath {
          0%,
          100% {
            opacity: 0;
            transform: scale(0.98);
          }

          50% {
            opacity: 0.12;
            transform: scale(1.04);
          }
        }

        /* ========================================================
           HIGHLIGHT 1
           ======================================================== */

        @keyframes scanHighlightOne {
          0%,
          7% {
            opacity: 0;
            transform: translateY(-16px);
          }

          16% {
            opacity: 0.1;
          }

          25% {
            opacity: 0.58;
            transform: translateY(0);
          }

          38% {
            opacity: 0.12;
          }

          50%,
          100% {
            opacity: 0;
            transform: translateY(18px);
          }
        }

        /* ========================================================
           HIGHLIGHT 2
           ======================================================== */

        @keyframes scanHighlightTwo {
          0%,
          30% {
            opacity: 0;
            transform: translateY(-18px);
          }

          42% {
            opacity: 0.08;
          }

          52% {
            opacity: 0.52;
            transform: translateY(0);
          }

          65% {
            opacity: 0.12;
          }

          77%,
          100% {
            opacity: 0;
            transform: translateY(18px);
          }
        }

        /* ========================================================
           HIGHLIGHT 3
           ======================================================== */

        @keyframes scanHighlightThree {
          0%,
          55% {
            opacity: 0;
            transform: translateY(-12px);
          }

          66% {
            opacity: 0.08;
          }

          76% {
            opacity: 0.46;
            transform: translateY(0);
          }

          88% {
            opacity: 0.1;
          }

          100% {
            opacity: 0;
            transform: translateY(14px);
          }
        }

        /* ========================================================
           SCANNER BEAM
           ======================================================== */

        @keyframes resumeScan {
          0% {
            top: 0%;
            opacity: 0;
          }

          6% {
            opacity: 0.22;
          }

          11% {
            opacity: 1;
          }

          40% {
            opacity: 0.95;
          }

          68% {
            opacity: 0.88;
          }

          88% {
            opacity: 0.58;
          }

          96% {
            opacity: 0.18;
          }

          100% {
            top: 100%;
            opacity: 0;
          }
        }

        /* ========================================================
           ARROWS
           ======================================================== */

        @keyframes arrowDash {
          from {
            stroke-dashoffset: 0;
          }

          to {
            stroke-dashoffset: -24px;
          }
        }

        /* ========================================================
           REDUCED MOTION
           ======================================================== */

        @media (prefers-reduced-motion: reduce) {
          .animate-\\[magnifierScan_6\\.4s_linear_infinite\\],
          .animate-\\[lensBreath_2\\.4s_ease-in-out_infinite\\],
          .animate-\\[lensOuterBreath_2\\.4s_ease-in-out_infinite\\],
          .animate-\\[scanHighlightOne_5\\.8s_ease-in-out_infinite\\],
          .animate-\\[scanHighlightTwo_5\\.8s_ease-in-out_infinite\\],
          .animate-\\[scanHighlightThree_5\\.8s_ease-in-out_infinite\\],
          .animate-\\[resumeScan_5\\.8s_cubic-bezier\\(0\\.45\\,0\\.05\\,0\\.55\\,0\\.95\\)_infinite\\],
          .animate-\\[arrowDash_3\\.4s_linear_infinite\\] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}