import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CalendarRange,
  Check,
  ChevronDown,
  GraduationCap,
  Layers,
  Moon,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  TrendingUp,
} from "lucide-react";
import { useSeo } from "../lib/seo";
import { useTheme } from "../context/ThemeContext";
import { Logo } from "../components/ui";

const FEATURES = [
  {
    icon: SlidersHorizontal,
    title: "Custom grading schemes",
    description:
      "Match the exact system your college uses. Set lecture vs. lab weights, term splits, and every sub-component weight.",
    points: ["Lecture & lab split", "Unlimited components", "Reusable per subject"],
    visual: "weights",
  },
  {
    icon: CalendarRange,
    title: "Term & semester computations",
    description:
      "Prelim, midterm, pre-final, and finals each carry their own weight. Gradely rolls them up into a semester grade automatically.",
    points: ["4 weighted terms", "Semester roll-up", "Progress at a glance"],
    visual: "terms",
  },
  {
    icon: TrendingUp,
    title: "Real-time GPA / GWA",
    description:
      "Every score updates your standing immediately. Map percentages to your school's grade scale and track GWA across subjects.",
    points: ["Custom scale mapping", "Unit-weighted GWA", "Instant status tags"],
    visual: "scale",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Create your grading scheme",
    description:
      "Start from a standard lecture + lab template, then adjust the weights until it mirrors your syllabus.",
  },
  {
    number: "02",
    title: "Add your subjects",
    description:
      "Pick a scheme for each course, set its units, and mark whether it has a laboratory component.",
  },
  {
    number: "03",
    title: "Log scores and watch it compute",
    description:
      "Enter a raw score or a percentage. Term grades, semester grades, and your GWA update on the spot.",
  },
];

const FAQS = [
  {
    question: "Is Gradely free to use?",
    answer:
      "Yes. Gradely is free for students, with no credit card required. Create an account and start tracking your grades in minutes.",
  },
  {
    question: "Can I customize my grading weights?",
    answer:
      "Yes. You can set lecture and laboratory splits, term weights, and sub-component weights such as quizzes, group discussions, chapter exams, lab manuals, and practical exams.",
  },
  {
    question: "Does Gradely compute my GWA or GPA?",
    answer:
      "Gradely converts every percentage through the grading scale attached to your scheme, then combines subjects by unit to estimate your GWA. You can define your own scale ranges, grade points, and remarks.",
  },
  {
    question: "Is my grade data private?",
    answer:
      "Yes. Student accounts are protected with Supabase Authentication, and Row Level Security ensures you can only read and write your own schemes, subjects, and grade entries.",
  },
  {
    question: "Does Gradely work on mobile?",
    answer:
      "Yes. The dashboard, grade entry forms, and scheme editor are fully responsive, so you can record a score right after class on your phone.",
  },
];

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="grid h-9 w-9 place-items-center rounded-full border border-transparent text-muted transition hover:border-line hover:bg-surface hover:text-ink"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-canvas/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link to="/" aria-label="Gradely home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted md:flex">
          <a href="#features" className="transition hover:text-ink">
            Features
          </a>
          <a href="#how-it-works" className="transition hover:text-ink">
            How it works
          </a>
          <a href="#grading" className="transition hover:text-ink">
            Grading system
          </a>
          <a href="#faq" className="transition hover:text-ink">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Link
            to="/auth?mode=signin"
            className="btn btn-ghost btn-sm hidden sm:inline-flex"
          >
            Sign in
          </Link>
          <Link to="/auth?mode=signup" className="btn btn-primary btn-sm">
            Get started
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </header>
  );
}

function DashboardPreview() {
  const subjects = [
    { code: "CS 201", name: "Data Structures", point: "1.50", value: 91 },
    { code: "CS 202", name: "Discrete Mathematics", point: "1.75", value: 88 },
    { code: "PHY 201", name: "Physics for CS", point: "2.00", value: 85 },
    { code: "ENG 203", name: "Technical Writing", point: "1.25", value: 94 },
  ];
  const terms = [
    { label: "P", value: 88 },
    { label: "M", value: 91 },
    { label: "PF", value: 86 },
    { label: "F", value: 0, muted: true },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[470px] lg:max-w-none">
      <div
        className="absolute -inset-6 rounded-[2.5rem] bg-accent/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="card relative overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-faint">
              1st Semester · 2026–2027
            </p>
            <p className="mt-0.5 text-sm font-semibold text-ink">BS Computer Science</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-positive/25 bg-positive-soft px-2.5 py-1 text-[0.65rem] font-semibold text-positive">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-positive" />
            Live
          </span>
        </div>

        <div className="p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-muted">Estimated GWA</p>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="font-display text-[2.6rem] leading-none text-ink">1.63</span>
                <span className="pb-1 text-xs font-semibold text-positive">Excellent</span>
              </div>
              <p className="mt-2 flex items-center gap-1 text-[0.68rem] font-medium text-positive">
                <TrendingUp size={12} />
                Up 0.12 from prelim
              </p>
            </div>
            <div className="text-right">
              <p className="text-[0.65rem] font-medium text-faint">Semester</p>
              <p className="text-lg font-semibold text-ink">89.5%</p>
              <div className="mt-1.5 h-1.5 w-20 overflow-hidden rounded-full bg-surface-3">
                <div className="h-full w-[89.5%] rounded-full bg-accent" />
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {subjects.map((subject) => (
              <div
                key={subject.code}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/35 px-3 py-2.5"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-[0.58rem] font-bold text-accent">
                  {subject.code.split(" ")[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[0.72rem] font-semibold text-ink">
                      {subject.name}
                    </p>
                    <span className="shrink-0 text-[0.68rem] font-bold text-ink">
                      {subject.point}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-3">
                      <div
                        className="h-full rounded-full bg-accent/75"
                        style={{ width: `${subject.value}%` }}
                      />
                    </div>
                    <span className="w-7 text-right text-[0.58rem] text-faint">
                      {subject.value}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-4 gap-1.5">
            {terms.map((term) => (
              <div
                key={term.label}
                className="rounded-lg border border-line bg-surface px-2 py-2 text-center"
              >
                <p className="text-[0.55rem] font-bold uppercase tracking-wider text-faint">
                  {term.label}
                </p>
                <p className="mt-0.5 text-[0.7rem] font-semibold text-ink">
                  {term.muted ? "—" : `${term.value}%`}
                </p>
                <div className="mx-auto mt-1 h-1 w-full overflow-hidden rounded-full bg-surface-3">
                  <div
                    className={
                      term.muted
                        ? "h-full w-0 bg-faint"
                        : "h-full rounded-full bg-accent/60"
                    }
                    style={{ width: term.muted ? "0%" : `${term.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute -bottom-7 left-2 hidden animate-fade-up items-center gap-2.5 rounded-2xl border border-line bg-surface px-3.5 py-2.5 shadow-card [animation-delay:500ms] sm:flex">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-positive-soft text-positive">
          <Check size={15} strokeWidth={3} />
        </span>
        <div>
          <p className="text-[0.68rem] font-semibold text-ink">Chapter Exam graded</p>
          <p className="text-[0.6rem] text-muted">CS 201 · 92 / 100</p>
        </div>
      </div>

      <div className="absolute -right-3 -top-4 hidden animate-fade-up items-center gap-2 rounded-full border border-line bg-surface px-3 py-2 shadow-card [animation-delay:700ms] sm:flex">
        <Sparkles size={13} className="text-accent" />
        <span className="text-[0.65rem] font-semibold text-ink">60 / 40 lab split</span>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-grid opacity-70 [mask-image:radial-gradient(ellipse_65%_60%_at_50%_35%,black,transparent)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl dark:bg-accent/5"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12 lg:px-8 lg:pb-24 lg:pt-24">
        <div className="max-w-2xl">
          <div className="eyebrow animate-fade-up">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Built for students, not spreadsheets
          </div>

          <h1 className="mt-5 animate-fade-up text-[2.55rem] font-semibold leading-[0.98] tracking-[-0.055em] text-ink [animation-delay:80ms] sm:text-[3.6rem] lg:text-[4.2rem]">
            Take Control of Your{" "}
            <span className="font-display font-normal italic text-accent">
              Academic Performance
            </span>{" "}
            with Gradely
          </h1>

          <p className="mt-5 max-w-xl animate-fade-up text-base leading-relaxed text-muted [animation-delay:160ms] sm:text-[1.0625rem]">
            One calm place for every quiz, lab report, and exam. Build the grading scheme
            your school actually uses, log your scores, and see your term grade and GWA
            update in real time.
          </p>

          <div className="mt-7 flex animate-fade-up flex-col gap-2.5 [animation-delay:240ms] sm:flex-row sm:items-center">
            <Link to="/auth?mode=signup" className="btn btn-primary btn-lg">
              Get started free
              <ArrowRight size={17} />
            </Link>
            <Link to="/auth?mode=signin" className="btn btn-secondary btn-lg">
              Sign in
            </Link>
          </div>

          <div className="mt-6 flex animate-fade-up flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-faint [animation-delay:320ms]">
            <span className="inline-flex items-center gap-1.5">
              <Check size={14} className="text-accent" /> Free for students
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={14} className="text-accent" /> No credit card
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-accent" /> Private by default
            </span>
          </div>
        </div>

        <div className="animate-fade-up [animation-delay:200ms]">
          <DashboardPreview />
        </div>
      </div>

      <div className="border-y border-line bg-surface/45">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-line px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { value: "4", label: "Term weights, fully configurable" },
            { value: "100%", label: "Custom lecture & lab splits" },
            { value: "Live", label: "GWA after every score" },
            { value: "0", label: "Spreadsheets to maintain" },
          ].map((stat) => (
            <div key={stat.label} className="px-4 py-5 first:pl-0 sm:px-6 lg:py-6">
              <p className="font-display text-2xl leading-none text-ink sm:text-[1.75rem]">
                {stat.value}
              </p>
              <p className="mt-1.5 text-[0.7rem] leading-snug text-faint">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WeightVisual() {
  return (
    <div className="mt-5 rounded-xl border border-line bg-surface-2/50 p-3.5">
      <div className="flex items-center justify-between text-[0.65rem] font-semibold">
        <span className="text-ink">Lecture · 60%</span>
        <span className="text-muted">Lab · 40%</span>
      </div>
      <div className="mt-2 flex h-2 overflow-hidden rounded-full">
        <div className="w-[60%] bg-accent" />
        <div className="w-[40%] bg-accent/35" />
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1">
        {["Quizzes 10%", "SGD 30%", "Exam 60%"].map((item) => (
          <span key={item} className="chip !py-1 !text-[0.6rem]">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function TermsVisual() {
  return (
    <div className="mt-5 grid grid-cols-4 gap-1.5 rounded-xl border border-line bg-surface-2/50 p-3">
      {[
        ["Prelim", "25%"],
        ["Midterm", "25%"],
        ["Pre-final", "25%"],
        ["Finals", "25%"],
      ].map(([term, weight]) => (
        <div key={term} className="rounded-lg bg-surface px-1.5 py-2 text-center">
          <p className="text-[0.56rem] font-semibold text-faint">{term}</p>
          <p className="mt-0.5 text-[0.7rem] font-bold text-ink">{weight}</p>
        </div>
      ))}
      <div className="col-span-4 mt-0.5 flex items-center justify-between rounded-lg bg-accent-soft px-2.5 py-2">
        <span className="text-[0.62rem] font-semibold text-accent-ink">Semester grade</span>
        <span className="text-[0.72rem] font-bold text-accent-ink">89.5%</span>
      </div>
    </div>
  );
}

function ScaleVisual() {
  return (
    <div className="mt-5 space-y-1 rounded-xl border border-line bg-surface-2/50 p-2">
      {[
        ["97–100", "1.00", "Excellent"],
        ["88–90.99", "1.75", "Very Good"],
        ["75–75.99", "3.00", "Pass"],
        ["Below 75", "5.00", "Failed"],
      ].map(([range, point, remark]) => (
        <div
          key={range}
          className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[0.62rem] odd:bg-surface"
        >
          <span className="w-16 font-mono text-faint">{range}</span>
          <span className="font-bold text-ink">{point}</span>
          <span className="text-muted">{remark}</span>
        </div>
      ))}
    </div>
  );
}

const VISUALS = {
  weights: WeightVisual,
  terms: TermsVisual,
  scale: ScaleVisual,
};

function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow">Everything in one place</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-ink sm:text-[2.5rem] sm:leading-[1.05]">
            Built around the way your school actually grades.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Most grade trackers assume one formula. Your syllabus doesn't. Gradely lets
            you model the real structure — then does the math quietly in the background.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Visual = VISUALS[feature.visual];
            return (
              <article
                key={feature.title}
                className="card group flex flex-col p-6 transition duration-300 hover:-translate-y-1 hover:shadow-card"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent-ink">
                  <feature.icon size={19} />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.025em] text-ink">
                  {feature.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5">
                  {feature.points.map((point) => (
                    <span
                      key={point}
                      className="inline-flex items-center gap-1 text-[0.68rem] font-medium text-faint"
                    >
                      <Check size={11} className="text-accent" />
                      {point}
                    </span>
                  ))}
                </div>
                <Visual />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function GradingSection() {
  return (
    <section
      id="grading"
      className="scroll-mt-24 border-y border-line bg-surface/45 py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="eyebrow">Your rules, not ours</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-ink sm:text-[2.5rem] sm:leading-[1.05]">
              A grading scheme that mirrors your syllabus.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Lecture and laboratory carrying different weights? A final exam worth more
              than the midterm? Set every split once and reuse it across every subject
              that follows the same structure.
            </p>
            <ul className="mt-6 space-y-3.5">
              {[
                {
                  icon: Layers,
                  title: "Multi-tier components",
                  text: "Group quizzes, discussions, chapter exams, and term exams under lecture or lab.",
                },
                {
                  icon: BarChart3,
                  title: "Your grade scale",
                  text: "Map percentage ranges to grade points and remarks — 1.00 to 5.00 or a 4.0 GPA scale.",
                },
                {
                  icon: BookOpen,
                  title: "Reusable across courses",
                  text: "Apply one scheme to every subject that shares the same department rules.",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-surface text-accent">
                    <item.icon size={15} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-faint">
                  Scheme editor
                </p>
                <p className="mt-0.5 text-sm font-semibold text-ink">
                  BS Computer Science · Default
                </p>
              </div>
              <span className="chip">Lecture + Lab</span>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-ink">Lecture / Lab split</span>
                  <span className="text-muted">60% · 40%</span>
                </div>
                <div className="mt-2 flex h-2.5 overflow-hidden rounded-full">
                  <div className="w-[60%] bg-accent" />
                  <div className="w-[40%] bg-accent/35" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-line bg-surface-2/50 p-3">
                  <p className="text-[0.6rem] font-bold uppercase tracking-wider text-faint">
                    Lecture components
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {[
                      ["Short quizzes", "10%"],
                      ["Group discussion", "30%"],
                      ["Chapter exam", "20%"],
                      ["Term exam", "40%"],
                    ].map(([name, weight]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between text-[0.65rem]"
                      >
                        <span className="text-muted">{name}</span>
                        <span className="font-semibold text-ink">{weight}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-line bg-surface-2/50 p-3">
                  <p className="text-[0.6rem] font-bold uppercase tracking-wider text-faint">
                    Lab components
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {[
                      ["Pre-conference", "10%"],
                      ["Post-conference", "10%"],
                      ["Lab manual", "30%"],
                      ["Practical exam", "50%"],
                    ].map(([name, weight]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between text-[0.65rem]"
                      >
                        <span className="text-muted">{name}</span>
                        <span className="font-semibold text-ink">{weight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-line">
                <div className="flex items-center justify-between border-b border-line px-3 py-2">
                  <p className="text-[0.62rem] font-bold uppercase tracking-wider text-faint">
                    Scale mapping
                  </p>
                  <p className="text-[0.6rem] text-faint">Editable</p>
                </div>
                <div className="divide-y divide-line">
                  {[
                    ["97–100", "1.00", "Excellent"],
                    ["85–87.99", "2.00", "Good"],
                    ["75–75.99", "3.00", "Pass"],
                    ["0–74.99", "5.00", "Failed"],
                  ].map(([range, point, remark]) => (
                    <div
                      key={range}
                      className="flex items-center justify-between px-3 py-1.5 text-[0.65rem]"
                    >
                      <span className="w-20 font-mono text-faint">{range}</span>
                      <span className="font-bold text-ink">{point}</span>
                      <span className="text-muted">{remark}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Three steps</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-ink sm:text-[2.5rem] sm:leading-[1.05]">
            Set it up once. Stay current all semester.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            No formulas to memorize, no spreadsheet tabs to maintain. Just your syllabus
            structure and the scores you already have.
          </p>
        </div>

        <div className="relative mt-12 grid gap-4 md:grid-cols-3">
          <div
            className="absolute left-[16.6%] right-[16.6%] top-7 hidden border-t border-dashed border-line-strong md:block"
            aria-hidden="true"
          />
          {STEPS.map((step) => (
            <div key={step.number} className="relative">
              <div className="relative z-10 mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-line bg-surface font-display text-xl text-accent shadow-sm">
                {step.number}
              </div>
              <div className="mt-5 text-center">
                <h3 className="text-base font-semibold text-ink">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
          <Link to="/auth?mode=signup" className="btn btn-primary">
            Create your free account
            <ArrowRight size={15} />
          </Link>
          <Link to="/auth?mode=signin" className="btn btn-secondary">
            I already have one
          </Link>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section
      id="faq"
      className="scroll-mt-24 border-t border-line bg-surface/45 py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-8">
        <div>
          <p className="eyebrow">Questions</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-ink sm:text-[2.5rem] sm:leading-[1.05]">
            Quick answers before you start.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Still curious? Sign up and explore the dashboard — it takes less than two
            minutes to set up your first subject.
          </p>
          <Link
            to="/auth?mode=signup"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-hover"
          >
            Get started free
            <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="space-y-2.5">
          {FAQS.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-line bg-surface px-5 py-4 transition open:shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink">
                {faq.question}
                <ChevronDown
                  size={16}
                  className="shrink-0 text-faint transition group-open:rotate-180"
                />
              </summary>
              <p className="mt-2.5 pr-6 text-sm leading-relaxed text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#0e2a22] px-6 py-12 text-[#f2f7f4] sm:px-12 sm:py-16 lg:px-16">
          <div
            className="absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #f2f7f4 1px, transparent 1px), linear-gradient(to bottom, #f2f7f4 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#55c2a2]/25 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#9fd8c6]">
                <GraduationCap size={13} />
                Your semester, in focus
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-[2.75rem] sm:leading-[1.03]">
                Your grades are already complicated. Your tracker shouldn't be.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#c5d9d2] sm:text-base">
                Build your first grading scheme, add a subject, and log one score. Gradely
                handles the rest — quietly and accurately.
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-2.5 sm:w-auto sm:flex-row">
              <Link
                to="/auth?mode=signup"
                className="btn btn-lg bg-[#f2f7f4] text-[#0e2a22] hover:bg-white"
              >
                Get started free
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/auth?mode=signin"
                className="btn btn-lg border-white/20 bg-transparent text-[#f2f7f4] hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line bg-surface/45">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-sm leading-relaxed text-muted">
              A calm grade tracker for students who'd rather understand their standing
              than wrestle with spreadsheets.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-faint">
                Product
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li>
                  <a href="#features" className="transition hover:text-ink">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="transition hover:text-ink">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#grading" className="transition hover:text-ink">
                    Grading system
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-faint">
                Account
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li>
                  <Link to="/auth?mode=signup" className="transition hover:text-ink">
                    Create account
                  </Link>
                </li>
                <li>
                  <Link to="/auth?mode=signin" className="transition hover:text-ink">
                    Sign in
                  </Link>
                </li>
                <li>
                  <a href="#faq" className="transition hover:text-ink">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-5 text-[0.7rem] text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Gradely. Made for students.</p>
          <p className="inline-flex items-center gap-1.5">
            <ShieldCheck size={13} />
            Secure authentication & private grade data
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  useSeo({
    title: "Gradely — Student Grade Tracker & GWA Calculator",
    description:
      "Take control of your academic performance. Build custom grading schemes with lecture and lab weights, track term grades, and compute your GWA in real time.",
    path: "/",
  });

  return (
    <div className="min-h-dvh bg-canvas">
      <Header />
      <main>
        <Hero />
        <Features />
        <GradingSection />
        <HowItWorks />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
