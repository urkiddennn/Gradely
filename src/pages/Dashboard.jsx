import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  ChevronRight,
  FlaskConical,
  Layers,
  Plus,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import {
  componentName,
  createStarterScheme,
  normalizeScheme,
  termLabel,
  yearSummary,
} from "../lib/grading";
import { pageTitle, useSeo } from "../lib/seo";
import {
  displayName,
  firstName,
  formatGradePoint,
  formatPercent,
  getGreeting,
  timeAgo,
  cn,
} from "../lib/utils";
import { Button, EmptyState } from "../components/ui";
import { SubjectCard } from "../components/SubjectCard";
import { SubjectForm } from "../components/SubjectForm";

const SUMMARY_TONES = {
  accent: "bg-accent-soft text-accent-ink",
  positive: "bg-positive-soft text-positive",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

function SummaryCard({ label, value, sub, icon: Icon, tone = "accent" }) {
  return (
    <div className="card flex items-start justify-between gap-3 p-4 sm:p-5">
      <div className="min-w-0">
        <p className="text-[0.66rem] font-bold uppercase tracking-[0.12em] text-faint">
          {label}
        </p>
        <p className="mt-2 truncate text-[1.7rem] font-semibold leading-none tracking-[-0.045em] text-ink sm:text-[1.95rem]">
          {value}
        </p>
        <p className="mt-2 text-[0.68rem] leading-snug text-muted">{sub}</p>
      </div>
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
          SUMMARY_TONES[tone] || SUMMARY_TONES.accent,
        )}
      >
        <Icon size={17} />
      </span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="skeleton h-3 w-28" />
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-3.5 w-80" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="card p-5">
            <div className="skeleton h-2.5 w-20" />
            <div className="skeleton mt-3 h-7 w-16" />
            <div className="skeleton mt-3 h-2.5 w-24" />
          </div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="card p-5">
            <div className="flex items-center gap-3">
              <div className="skeleton h-10 w-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-2.5 w-16" />
                <div className="skeleton h-3.5 w-32" />
              </div>
            </div>
            <div className="skeleton mt-5 h-16 w-full" />
            <div className="skeleton mt-4 h-2.5 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Onboarding({ onCreateStarter, creating }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-accent/20 bg-accent-soft/70 p-6 sm:p-8">
      <div
        className="pointer-events-none absolute inset-0 bg-grid opacity-40"
        aria-hidden="true"
      />
      <div className="relative max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-surface/70 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-accent-ink">
          <Sparkles size={11} />
          Quick start
        </span>
        <h2 className="mt-3 text-xl font-semibold tracking-[-0.035em] text-ink sm:text-2xl">
          Let's set up your grading system.
        </h2>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-soft/80">
          Start with a reusable scheme — lecture and lab weights, term splits, components,
          and your grade scale. Then add your subjects and scores.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button icon={Sparkles} loading={creating} onClick={onCreateStarter}>
            Use the starter scheme
          </Button>
          <Link to="/app/schemes?new=1" className="btn btn-secondary">
            Build from scratch
            <ArrowRight size={15} />
          </Link>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[0.68rem] font-medium text-ink-soft/70">
          <span className="inline-flex items-center gap-1.5">
            <Layers size={12} /> 60 / 40 lecture-lab
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BookOpen size={12} /> 25% per term
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Award size={12} /> 1.00–5.00 scale
          </span>
        </div>
      </div>
    </section>
  );
}

function RecentScores({ entries, subjectById, schemesById }) {
  return (
    <div className="card flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">Recent scores</h2>
          <p className="mt-0.5 text-xs text-muted">Your latest recorded assessments.</p>
        </div>
        <Link
          to="/app/subjects"
          className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover"
        >
          All subjects
          <ChevronRight size={13} />
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-faint">
            <TrendingUp size={18} />
          </span>
          <p className="mt-3 text-sm font-semibold text-ink">No scores yet</p>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted">
            Open a subject and add your first quiz, exam, or lab score to see your grades
            come to life.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-line">
          {entries.map((entry) => {
            const subject = subjectById[entry.subject_id];
            if (!subject) return null;
            const scheme = schemesById[subject.scheme_id];
            const percentage =
              Number(entry.max_score) > 0
                ? (Number(entry.score) / Number(entry.max_score)) * 100
                : 0;
            return (
              <Link
                key={entry.id}
                to={`/app/subjects/${subject.id}`}
                className="group flex items-center gap-3 px-5 py-3 transition hover:bg-surface-2/50"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-[0.55rem] font-bold text-accent">
                  {subject.code.split(" ")[0].slice(0, 3)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ink">
                    {entry.label || componentName(scheme, entry.category)}
                  </p>
                  <p className="truncate text-[0.66rem] text-faint">
                    {subject.code} · {termLabel(entry.term)} ·{" "}
                    {componentName(scheme, entry.category)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold text-ink">
                    {Number(entry.score)} / {Number(entry.max_score)}
                  </p>
                  <p className="text-[0.64rem] text-faint">
                    {formatPercent(percentage, 0)} · {timeAgo(entry.created_at)}
                  </p>
                </div>
                <ChevronRight
                  size={14}
                  className="shrink-0 text-line-strong transition group-hover:text-accent"
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SchemeSnapshot({ scheme }) {
  const normalized = normalizeScheme(scheme);
  return (
    <div className="card flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">Grading scheme</h2>
          <p className="mt-0.5 text-xs text-muted">{normalized?.title || "No scheme yet"}</p>
        </div>
        <Link
          to="/app/schemes"
          className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover"
        >
          Manage
          <ChevronRight size={13} />
        </Link>
      </div>

      {normalized ? (
        <div className="flex-1 px-5 py-4">
          <div className="flex items-center justify-between text-[0.68rem] font-semibold">
            <span className="inline-flex items-center gap-1.5 text-ink">
              <BookOpen size={12} className="text-accent" />
              Lecture {normalized.lecture_weight}%
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted">
              <FlaskConical size={12} className="text-faint" />
              Lab {normalized.lab_weight}%
            </span>
          </div>
          <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full bg-accent"
              style={{ width: `${normalized.lecture_weight}%` }}
            />
            <div
              className="h-full bg-accent/35"
              style={{ width: `${normalized.lab_weight}%` }}
            />
          </div>

          <p className="mt-4 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-faint">
            Term weights
          </p>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {["prelim", "midterm", "prefinal", "final_exam"].map((key) => (
              <div
                key={key}
                className="rounded-lg border border-line bg-surface-2/40 px-1 py-1.5 text-center"
              >
                <p className="truncate text-[0.54rem] font-semibold text-faint">
                  {termLabel(key)}
                </p>
                <p className="mt-0.5 text-[0.68rem] font-bold text-ink">
                  {normalized.term_weights[key]}%
                </p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-faint">
            Grade scale
          </p>
          <div className="mt-1.5 space-y-0.5">
            {normalized.scale_mappings.slice(0, 4).map((mapping) => (
              <div
                key={mapping.id}
                className="flex items-center justify-between rounded-md px-1 py-1 text-[0.65rem]"
              >
                <span className="font-mono text-faint">
                  {Number(mapping.min_percentage)}–{Number(mapping.max_percentage)}
                </span>
                <span className="font-semibold text-ink">
                  {formatGradePoint(mapping.grade_point)}
                </span>
                <span className="w-20 truncate text-right text-muted">
                  {mapping.remarks || "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 text-center">
          <SlidersHorizontal size={22} className="text-faint" />
          <p className="mt-2 text-xs text-muted">Create a scheme to get started.</p>
          <Link to="/app/schemes?new=1" className="btn btn-secondary btn-sm mt-3">
            New scheme
          </Link>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { loading, subjects, schemes, schemesById, subjectById, entries, entriesBySubject, createScheme } =
    useData();
  const toast = useToast();
  const [subjectFormOpen, setSubjectFormOpen] = useState(false);
  const [creatingStarter, setCreatingStarter] = useState(false);

  const name = displayName(user);
  const year = useMemo(
    () => yearSummary(subjects, schemesById, entriesBySubject),
    [subjects, schemesById, entriesBySubject],
  );

  const recent = useMemo(
    () =>
      entries
        .map((entry) => ({
          ...entry,
          subject: subjectById[entry.subject_id],
        }))
        .filter((entry) => entry.subject)
        .slice(0, 6),
    [entries, subjectById],
  );

  useSeo({
    title: pageTitle("Dashboard"),
    description:
      "Your Gradely dashboard — track term grades, semester grades, and your GWA in real time.",
    path: "/app",
    noindex: true,
  });

  const handleStarter = async () => {
    setCreatingStarter(true);
    try {
      await createScheme(createStarterScheme("Standard Lecture + Lab"));
      toast.success("Starter scheme created. Add your first subject next.");
    } catch (error) {
      toast.error(error?.message || "Could not create the starter scheme.");
    } finally {
      setCreatingStarter(false);
    }
  };

  if (loading) return <DashboardSkeleton />;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-7 animate-fade-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-faint">
            {today}
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.045em] text-ink sm:text-[2rem]">
            {getGreeting()}, {firstName(name)}.
          </h1>
          <p className="mt-1 text-sm text-muted">
            {subjects.length > 0
              ? "Here's where your semester stands today."
              : "Let's get your first subject onto the board."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/app/schemes" className="btn btn-secondary btn-sm">
            <SlidersHorizontal size={14} />
            Schemes
          </Link>
          {schemes.length > 0 ? (
            <Button
              size="sm"
              icon={Plus}
              onClick={() => setSubjectFormOpen(true)}
            >
              Add subject
            </Button>
          ) : (
            <Link to="/app/schemes?new=1" className="btn btn-primary btn-sm">
              <Plus size={14} />
              Create scheme
            </Link>
          )}
        </div>
      </div>

      {schemes.length === 0 ? (
        <Onboarding onCreateStarter={handleStarter} creating={creatingStarter} />
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          label="Final year GWA"
          value={formatGradePoint(year.gwa)}
          sub={
            year.gwa == null
              ? "Add scores to estimate your GWA"
              : `Unit-weighted across ${year.gradedCount} subject${year.gradedCount === 1 ? "" : "s"}`
          }
          icon={Award}
          tone="accent"
        />
        <SummaryCard
          label="Semester average"
          value={formatPercent(year.averagePercentage)}
          sub={
            year.gradedCount > 0
              ? `Across ${year.gradedCount} graded subject${year.gradedCount === 1 ? "" : "s"}`
              : "No graded subjects yet"
          }
          icon={TrendingUp}
          tone="positive"
        />
        <SummaryCard
          label="Subjects"
          value={String(year.totalSubjects)}
          sub={`${schemes.length} scheme${schemes.length === 1 ? "" : "s"} · ${year.units || 0} total units`}
          icon={BookOpen}
          tone="accent"
        />
        <SummaryCard
          label="Needs attention"
          value={String(year.needsAttention)}
          sub={
            year.needsAttention > 0
              ? "Falling below the 75% passing line"
              : "Everything is on track"
          }
          icon={AlertCircle}
          tone={year.needsAttention > 0 ? "danger" : "positive"}
        />
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-[-0.02em] text-ink">
              Your subjects
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              Term, semester, and projected final grade for each course.
            </p>
          </div>
          {subjects.length > 0 ? (
            <Link
              to="/app/subjects"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover"
            >
              View all
              <ChevronRight size={13} />
            </Link>
          ) : null}
        </div>

        {subjects.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={schemes.length > 0 ? "Add your first subject" : "Your subjects will live here"}
            description={
              schemes.length > 0
                ? "Pick the grading scheme that fits this course, set its units, and start logging scores."
                : "Create a grading scheme first, then add the subjects you're taking this semester."
            }
            action={
              schemes.length > 0 ? (
                <Button icon={Plus} onClick={() => setSubjectFormOpen(true)}>
                  Add a subject
                </Button>
              ) : (
                <Link to="/app/schemes?new=1" className="btn btn-primary">
                  Create a scheme
                  <ArrowRight size={15} />
                </Link>
              )
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {year.rows.map((row) => (
              <SubjectCard key={row.subject.id} row={row} />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentScores
            entries={recent}
            subjectById={subjectById}
            schemesById={schemesById}
          />
        </div>
        <SchemeSnapshot scheme={schemes[0]} />
      </div>

      <SubjectForm
        open={subjectFormOpen}
        onClose={() => setSubjectFormOpen(false)}
        schemes={schemes}
      />
    </div>
  );
}
