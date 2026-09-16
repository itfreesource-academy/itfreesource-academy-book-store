import React from 'react';
import { Breadcrumbs } from '../components/common/Breadcrumbs.js';
import { TEST_PERSONAS, PERSONA_PASSWORDS, useAuth } from '../context/AuthContext.js';
import {
  BookOpen,
  Linkedin,
  Github,
  Award,
  Layers,
  ShieldCheck,
  Zap,
  GitBranch,
  CheckCircle2,
  ExternalLink,
  Users,
  Code2,
  Lock,
  ArrowRightLeft,
  KeyRound,
  Radio,
  BellRing,
  Compass
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { quickLogin } = useAuth();

  return (
    <div className="space-y-10 pb-20" data-testid="about-page">
      <Breadcrumbs items={[{ label: 'About Project & QE Academy' }]} />

      {/* Hero Showcase */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
            <Award className="w-3.5 h-3.5" />
            <span>Open Source QE & Automation Playground</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight" data-testid="about-hero-title">
            ITFreeSource Academy Book Store
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            An enterprise-grade, fullstack TypeScript learning platform and playground created as an open-source contribution by{' '}
            <a
              href="https://www.linkedin.com/in/vishalprajapati2k25/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 font-extrabold hover:underline inline-flex items-center gap-1"
              data-testid="creator-linkedin-link"
            >
              <span>Vishal Prajapati</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            . Designed specifically for the <strong>Practical Quality Engineering E2E Course</strong> to simulate realistic enterprise software architectures with manual and AI agent pair programming.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="https://www.linkedin.com/in/vishalprajapati2k25/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
            >
              <Linkedin className="w-4 h-4" />
              <span>Connect on LinkedIn (Vishal Prajapati)</span>
            </a>

            <a
              href="https://github.com/itfreesource-academy/itfreesource-academy-book-store"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
            >
              <Github className="w-4 h-4" />
              <span>GitHub Repository</span>
            </a>
          </div>
        </div>

        {/* Decorative Grid Glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none hidden lg:block" />
      </div>

      {/* Course & Quality Engineering Pillars */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">
            What You Can Learn & Test Here
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Everything required to become an elite SDET and Quality Engineering Lead.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-3 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 border border-blue-800/60 flex items-center justify-center font-bold">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">E2E UI & API Test Automation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automate full user journeys using <strong>Playwright, Cypress, Selenium</strong>, and <strong>REST Assured</strong>. Features robust deterministic selectors (`data-testid`), shadow DOM elements, and interactive Swagger OpenAPI 3.0 documentation.
            </p>
          </div>

          <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-3 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 border border-purple-800/60 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">RBAC Security & 11 Personas</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Test role-based access control across 11 distinct personas—ranging from Super Admins and Store Managers to Lead Reviewers, Marketplace Sellers, and Regular Customers with permanent protection for baseline test personas.
            </p>
          </div>

          <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-3 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/60 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Microservices Chaos & Latency</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Practice real-world resilience engineering. Inject artificial 100ms–3000ms latency, simulate 500/503 service outages in the QA Sandbox, and verify graceful UI degradation without crashing the application.
            </p>
          </div>

          <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-3 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Multi-Tier Pricing & Marketplaces</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Validate e-commerce pricing engines: struck-through List Price (MSRP), active Selling Prices, markdown discount percentages, and Marketplace Seller commission fees (10% sales, 15% rentals) with live QA calculation tooltips.
            </p>
          </div>

          <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-3 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/60 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Dual-Mode Buy vs. Rent Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Practice state machine testing: permanent shopping cart checkout versus 10-day academic book loans with return countdown timers, overdue calculations, and verified purchaser reviews.
            </p>
          </div>

          <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-3 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-rose-950 text-rose-400 border border-rose-800/60 flex items-center justify-center font-bold">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">CI/CD & Live Edge Previews</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated GitHub Actions running unit test suites with code coverage summaries. Cloudflare edge deployment providing instant preview environments for every Git branch.
            </p>
          </div>
        </div>
      </div>

      {/* Practical Branching Simulation Guide */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-8 shadow-2xl space-y-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-950 text-indigo-400 border border-indigo-800/60 flex items-center justify-center font-bold">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              How Feature Branching Works at ITFreeSource Academy
            </h3>
            <p className="text-xs text-slate-400">
              Develop, test, and automate in your own personal isolated cloud environment.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 text-xs text-slate-300 space-y-3">
          <p className="leading-relaxed">
            As taught in our <strong>Practical QE E2E Course</strong>, you don’t just run tests against a static local server. You practice how real engineering teams collaborate:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-300 font-medium">
            <li>
              <strong>The Production URL</strong>: <code className="bg-slate-900 px-1.5 py-0.5 rounded font-mono font-bold text-indigo-400 border border-slate-800">https://bookstore.itfreesource.workers.dev</code> is the canonical live production system.
            </li>
            <li>
              <strong>Your Isolated Feature Environment</strong>: When you create a branch (e.g. <code className="bg-slate-900 px-1.5 py-0.5 rounded font-mono border border-slate-800">newFeature</code>) and push to the repository, Cloudflare automatically deploys your branch to:
              <div className="my-1.5 p-2 bg-indigo-950/80 border border-indigo-800/80 rounded-lg font-mono font-bold text-indigo-300">
                https://newFeature-bookstore.itfreesource.workers.dev
              </div>
            </li>
            <li>
              <strong>Coding with Manual & AI Agents</strong>: You can develop tests manually or collaborate with our companion AI agents repository. Conduct real peer code reviews among students or with AI reviewers before merging!
            </li>
          </ol>
        </div>
      </div>

      {/* Practical QE Testing Guide: What & Where to Test */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-8 shadow-2xl space-y-6 backdrop-blur-xl" data-testid="practical-testing-guide">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-950 text-indigo-400 border border-indigo-800/60 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              🎯 Practical QE Testing Guide: What to Test &amp; Where to Test It
            </h3>
            <p className="text-xs text-slate-400">
              Essential QA workflows for distributed event streams, webhooks, currency conversion, and microservices resilience.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kafka Topic Lag Guide */}
          <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-indigo-400" />
              <h4 className="text-sm font-bold text-white">1. Checking Kafka Topics: Up-to-Date vs. Pending</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Where to go:</strong> Navigate to <a href="/playground" className="text-indigo-400 underline font-bold">Playground &rarr; Kafka Event Streams</a>.
            </p>
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="font-bold text-indigo-300 font-mono text-[11px] uppercase">
                How Consumer Lag Works:
              </div>
              <div className="font-mono text-[11px] bg-slate-950 p-2 rounded text-slate-300 border border-slate-850">
                Lag = (Latest Partition Offset) - (Committed Consumer Offset)
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-slate-400 text-[11px]">
                <li><strong className="text-emerald-400">Lag = 0 (UP TO DATE)</strong>: All produced messages have been processed and committed by downstream consumers.</li>
                <li><strong className="text-amber-400">Lag &gt; 0 (PENDING)</strong>: Unprocessed records waiting in the partition buffer.</li>
              </ul>
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <strong className="text-slate-200">How to Test Practically:</strong>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                <li>Place an order in <a href="/cart" className="text-indigo-400 underline">Cart</a> &rarr; Note Latest Offset advances to <strong>N+1</strong>.</li>
                <li>Check <a href="/playground" className="text-indigo-400 underline">Kafka Console</a> &rarr; Status turns to <strong>PENDING (Lag: 1)</strong>.</li>
                <li>Click <strong>&quot;Commit Offset&quot;</strong> &rarr; Lag resets to <strong>0</strong> and turns green <strong>UP TO DATE</strong>!</li>
                <li>Test Dead-Letter Queue: Click <strong>&quot;Inject Corrupted Payload&quot;</strong> &rarr; Observe poison pill routing to DLQ.</li>
              </ol>
            </div>
          </div>

          {/* Webhook HMAC & Retries Guide */}
          <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <BellRing className="w-5 h-5 text-purple-400" />
              <h4 className="text-sm font-bold text-white">2. Testing Webhooks, Signatures &amp; Retries</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Where to go:</strong> Navigate to <a href="/playground" className="text-purple-400 underline font-bold">Playground &rarr; Enterprise Webhooks</a>.
            </p>
            <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="font-bold text-purple-300 font-mono text-[11px] uppercase">
                Built-in Zero-Config Sandbox Receiver:
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Use the in-app mock receiver <code className="bg-slate-950 px-1 py-0.5 rounded text-purple-300 font-mono text-[10px]">/api/v1/webhooks/mock-receiver</code>. No external tunnels or public ports needed!
              </p>
              <div className="font-mono text-[11px] bg-slate-950 p-2 rounded text-slate-300 border border-slate-850 truncate">
                Header: x-bookstore-signature: sha256=&lt;hex&gt;
              </div>
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <strong className="text-slate-200">How to Test Practically:</strong>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                <li>Register a subscription with secret <code className="text-purple-300 font-mono">whsec_test_123</code>.</li>
                <li>Click <strong>&quot;Send Test Ping&quot;</strong> &rarr; Inspect delivery log with <strong>200 OK</strong> and latency in ms.</li>
                <li>Verify payload cryptographic HMAC signature matches the calculated SHA256 digest.</li>
                <li>Test Outage Resilience: Click <strong>&quot;Simulate 503 Outage&quot;</strong> &rarr; Trigger webhook &rarr; Assert delivery failure and click <strong>&quot;Redeliver / Retry&quot;</strong> to test backoff.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Master Platform Testing Blueprint Table */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            🗺️ Platform-Wide Practical Testing Matrix
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Module / Page</th>
                  <th className="py-2.5 px-3">Target URL</th>
                  <th className="py-2.5 px-3">Key Features to Test</th>
                  <th className="py-2.5 px-3">Persona Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-[11px]">
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-bold text-white">Books Catalog</td>
                  <td className="py-2 px-3 font-mono text-indigo-400">/books</td>
                  <td className="py-2 px-3">Live currency switcher (7 currencies), inline quantity stepper <code className="text-slate-200">[-] 1 [+]</code>, stock bounds</td>
                  <td className="py-2 px-3 font-mono text-slate-400">standard_customer</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-bold text-white">Academic Lending</td>
                  <td className="py-2 px-3 font-mono text-indigo-400">/borrowed</td>
                  <td className="py-2 px-3">Borrow fee ($2.00), VIP 20% discount ($1.60), overdue penalties ($0.10/day formula), lost book charges</td>
                  <td className="py-2 px-3 font-mono text-slate-400">student_reader / vip_customer</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-bold text-white">Cart &amp; Checkout</td>
                  <td className="py-2 px-3 font-mono text-indigo-400">/cart</td>
                  <td className="py-2 px-3">Idempotency key duplicate debit prevention, coupon validation (<code className="text-slate-200">ITFREE10</code>)</td>
                  <td className="py-2 px-3 font-mono text-slate-400">standard_customer</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-bold text-white">Warehouse Inventory</td>
                  <td className="py-2 px-3 font-mono text-indigo-400">/inventory</td>
                  <td className="py-2 px-3">Stock management, low-stock threshold alerts, inline price updates in active currency</td>
                  <td className="py-2 px-3 font-mono text-slate-400">store_manager / admin</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-bold text-white">Code Coverage</td>
                  <td className="py-2 px-3 font-mono text-indigo-400">/coverage</td>
                  <td className="py-2 px-3">Real-time in-app Istanbul / v8 code coverage breakdown across all 56 backend tests</td>
                  <td className="py-2 px-3 font-mono text-slate-400">auditor / admin</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-bold text-white">Swagger API Docs</td>
                  <td className="py-2 px-3 font-mono text-indigo-400">/swagger</td>
                  <td className="py-2 px-3">Interactive OpenAPI 3.0 documentation with &quot;Try it out&quot; request console</td>
                  <td className="py-2 px-3 font-mono text-slate-400">All Personas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 11 QA Personas Matrix */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-8 shadow-2xl space-y-6 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>11 Core QA Test Personas & Access Credentials</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Permanently protected against deletion. Use these preset accounts in your automated test scripts or click &quot;Switch&quot; to test.
            </p>
          </div>
          <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Protected Baseline Accounts</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300" data-testid="about-personas-table">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Persona / Label</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Preset Password</th>
                <th className="py-3 px-4">Key Responsibilities</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {TEST_PERSONAS.map((p) => {
                const pwd = PERSONA_PASSWORDS[p.username] || 'Admin@Pass123';
                return (
                  <tr key={p.username} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${p.badgeColor}`}>
                        {p.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      @{p.username}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono bg-slate-950 px-2 py-1 rounded text-slate-300 flex items-center gap-1 max-w-fit border border-slate-800">
                        <KeyRound className="w-3 h-3 text-slate-500" />
                        <span>{pwd}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs text-[11px]">
                      {p.description}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => quickLogin(p.username)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-bold border border-slate-700 transition-colors"
                        title={`Switch active session to @${p.username}`}
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>Switch</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
