import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Hero = () => {
  const { t } = useTranslation();

  return (
    <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden bg-[var(--bg-base)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            <span className="block text-[var(--text-primary)]">
              {t("landing.hero_title_1") || "Manage Your Restaurant"}
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600 mt-2">
              {t("landing.hero_title_2") || "Like a Pro"}
            </span>
          </h1>
          <p className="mt-6 text-xl sm:text-2xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-12 leading-relaxed">
            {t("landing.hero_subtitle") ||
              "The all-in-one ERP solution for modern restaurants. Streamline orders, inventory, staff, and analytics in one unified platform."}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="#pricing"
              className="btn-primary text-lg px-10 py-4 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all transform hover:-translate-y-1"
            >
              {t("landing.start_free_trial") || "Start Free Trial"}
            </a>
            <a
              href="#features"
              className="px-10 py-4 rounded-xl border-2 border-[var(--border-color)] hover:bg-[var(--bg-card)] hover:border-[var(--text-secondary)] transition-all text-[var(--text-primary)] font-semibold"
            >
              {t("landing.learn_more") || "Learn More"}
            </a>
          </div>
        </div>
      </div>

      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 -z-10 opacity-40 blur-3xl pointer-events-none">
        <div
          className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-amber-200 to-amber-400 dark:from-amber-900 dark:to-amber-700 opacity-30 sm:opacity-40"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        ></div>
      </div>
    </div>
  );
};

export default Hero;
