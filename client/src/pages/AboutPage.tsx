import React from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs.js';
import {
  BookOpen,
  Linkedin,
  Github,
  Award,
  ExternalLink,
  Sparkles,
  GraduationCap,
  FileCode2,
  Server,
  Zap,
  Smartphone
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-10 pb-20 max-w-5xl mx-auto" data-testid="about-page">
      <Breadcrumbs items={[{ label: 'About Platform' }]} />

      {/* Hero Showcase */}
      <div className="bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 rounded-3xl p-8 sm:p-12 text-slate-900 dark:text-white shadow-sm dark:shadow-xl relative overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-400/30">
            <Award className="w-3.5 h-3.5" />
            <span>Open Source Enterprise Reference Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight text-slate-900 dark:text-white" data-testid="about-hero-title">
            ITFreeSource Academy Book Store
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            An enterprise-grade, high-concurrency retail and lending platform created as an open-source contribution by{' '}
            <a
              href="https://www.linkedin.com/in/vishalprajapati2k25/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 dark:text-amber-400 font-extrabold hover:underline inline-flex items-center gap-1"
              data-testid="creator-linkedin-link"
            >
              <span>Vishal Prajapati</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            . Engineered on modern edge infrastructure capable of handling thousands of requests per second with sub-50ms latency, dual-mode buy/rent state machines, and real-time multi-currency conversions.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="https://www.linkedin.com/in/vishalprajapati2k25/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
            >
              <Linkedin className="w-4 h-4" />
              <span>Connect on LinkedIn</span>
            </a>

            <a
              href="https://github.com/itfreesource-academy/itfreesource-academy-book-store"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/20 font-bold text-xs shadow-sm transition-all"
            >
              <Github className="w-4 h-4" />
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>

        {/* Decorative Grid Glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none hidden lg:block" />
      </div>

      {/* Primary Callout: Direct to Official Course on Academy */}
      <section
        data-testid="academy-course-callout"
        className="rounded-3xl bg-gradient-to-r from-purple-50 via-white to-indigo-50 dark:from-slate-900 dark:via-purple-950/40 dark:to-slate-900 p-8 sm:p-10 border border-purple-200 dark:border-purple-800/40 shadow-sm dark:shadow-xl space-y-5"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
              ITFreeSource Academy Curriculum
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Practical Quality Engineering & Automation Course
            </h2>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          To preserve an authentic production user experience for our global customers and candidates, all test automation walkthroughs, RBAC user persona credentials, Playwright & Cypress test suites, chaos injection scenarios, and course grading rubrics are hosted directly on our official academy platform.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-1">
          <a
            href="https://academy.itfreesource.com"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="course-academy-link"
            className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Go to Practical QE Course on ITFreeSource Academy</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* Enterprise Architecture Highlights */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Architecture & Production Standards
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Designed to simulate mission-critical, high-availability e-commerce infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center font-bold">
              <Server className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">High-Concurrency Edge Runtime</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Powered by Cloudflare Workers and Hono. Handles thousands of requests per second with instant global routing, zero cold starts, and asset caching across 300+ data centers.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Dual Retail & Lending Engine</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Supports permanent volume purchases and 10-day digital academic lending cycles. Integrated with atomic stock reservations and idempotency key safety.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Multi-Platform Synchronization</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Seamlessly harmonized across the modern web (React 18, Tailwind CSS, TypeScript) and the native Android application built with Jetpack Compose and Material Design 3.
            </p>
          </div>
        </div>
      </div>

      {/* Developer API & Integration Contracts */}
      <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm dark:shadow-xl space-y-5">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>OpenAPI 3.0 & Developer Integration Specifications</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Standardized RESTful contracts for partner integrations, automation frameworks, and backend services.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="/swagger"
            data-testid="about-swagger-link"
            className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all group"
          >
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Interactive Swagger UI
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Live OpenAPI 3.0 testing console with schema definitions
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
          </a>

          <a
            href="https://github.com/itfreesource-academy/itfreesource-academy-book-store"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="about-github-repo-link"
            className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all group"
          >
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                GitHub Source Repository
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Explore full-stack source code, tests, and CI/CD pipelines
              </div>
            </div>
            <Github className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
          </a>
        </div>
      </div>
    </div>
  );
};
