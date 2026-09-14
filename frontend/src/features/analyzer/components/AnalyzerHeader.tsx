import { motion } from "framer-motion";

function AnalyzerHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="mx-auto w-full max-w-2xl px-1 text-center sm:px-0"
    >
      <h1
        className="
          text-[27px] font-bold leading-[1.1]
          tracking-[-0.035em] text-slate-950
          sm:text-3xl sm:leading-[1.1]
          lg:text-[2.55rem]
        "
      >
        Understand your job fit
        <br />
        <span className="careermap-text-gradient">
          before you apply.
        </span>
      </h1>

      <p
        className="
          mx-auto mt-2.5 max-w-xl
          text-[13px] leading-5.5 text-slate-500
          sm:mt-3 sm:text-[15px] sm:leading-7
        "
      >
        Upload your resume and add a target job description to
        understand your match, skill gaps, and improvement
        opportunities.
      </p>
    </motion.header>
  );
}

export default AnalyzerHeader;