import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  FlaskConical,
  Info,
  Pencil,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import {
  TERMS,
  componentName,
  gradeFromScale,
  statusFor,
  subjectSummary,
  termLabel,
} from "../lib/grading";
import { pageTitle, useSeo } from "../lib/seo";
import {
  cn,
  formatGradePoint,
  formatPercent,
  formatShortDate,
  toNumber,
} from "../lib/utils";
import {
  Button,
  ConfirmDialog,
  LoadingScreen,
  ProgressBar,
  ProgressRing,
  Select,
  StatusBadge,
} from "../components/ui";
import { AddEntryForm } from "../components/AddEntryForm";
import { SubjectForm } from "../components/SubjectForm";

function formatScore(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return Number.isInteger(number) ? String(number) : number.toFixed(2);
}

function TermSummary({ term, current, scheme, status }) {
  const termWeight = toNumber(scheme?.term_weights?.[term.key]);
  const grade = gradeFromScale(scheme, current.percentage);
  const assessments = current.entries.length;
  const componentCount =
    current.lecture.total + (current.lab ? current.lab.total : 0);
  const gradedComponents =
    current.lecture.completed + (current.lab ? current.lab.completed : 0);

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <ProgressRing
            value={current.percentage}
            size={88}
            stroke={7}
            tone={status.tone === "neutral" ? "neutral" : status.tone}
          >
            <div className="text-center">
              <span className="block text-[1.05rem] font-bold leading-none text-ink">
                {formatPercent(current.percentage, 0)}
              </span>
              <span className="mt-0.5 block text-[0.5rem] font-bold uppercase tracking-wider text-faint">
                grade
              </span>
            </div>
          </ProgressRing>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.13em] text-faint">
                {term.label} grade
              </p>
              <span className="chip !py-0.5 !text-[0.58rem]">{termWeight}% of semester</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-[-0.04em] text-ink">
                {formatGradePoint(grade.gradePoint)}
              </span>
              <span className="text-xs font-medium text-muted">
                {grade.remarks || "No grade yet"}
              </span>
            </div>
            <div className="mt-2">
              <StatusBadge percentage={current.percentage} status={status} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-line pt-4 sm:min-w-[310px] sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <div>
            <p className="text-[0.56rem] font-bold uppercase tracking-[0.1em] text-faint">
              Class
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {formatPercent(current.lecture.percentage, 0)}
            </p>
          </div>
          <div>
            <p className="text-[0.56rem] font-bold uppercase tracking-[0.1em] text-faint">
              Lab
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {current.lab && current.lab.total > 0 ? formatPercent(current.lab.percentage, 0) : "—"}
            </p>
          </div>
          <div>
            <p className="text-[0.56rem] font-bold uppercase tracking-[0.1em] text-faint">
              Scores
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">{assessments}</p>
            <p className="mt-0.5 text-[0.56rem] text-faint">
              {gradedComponents}/{componentCount} activities
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-line bg-surface-2/35 px-5 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="text-[0.62rem] font-medium text-faint">Term progress</span>
          <div className="flex-1">
            <ProgressBar
              value={current.percentage}
              height="h-1.5"
              tone={status.tone === "neutral" ? "neutral" : status.tone}
            />
          </div>
          <span className="text-[0.62rem] font-semibold text-muted">
            {gradedComponents} of {componentCount} activities graded
          </span>
        </div>
      </div>
    </div>
  );
}

function BreakdownCard({ title, icon: Icon, trackWeight, stats, tone = "accent" }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-soft text-accent-ink">
            <Icon size={15} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-ink">{title}</h3>
            <p className="text-[0.64rem] text-faint">{trackWeight}% of this term's grade</p>
          </div>
        </div>
        <span className="text-base font-semibold text-ink">
          {formatPercent(stats.percentage, 1)}
        </span>
      </div>

      <div className="mt-3">
        <ProgressBar
          value={stats.percentage}
          height="h-1.5"
          tone={stats.percentage == null ? "neutral" : tone}
        />
      </div>

      <div className="mt-4 space-y-3.5">
        {stats.rows.map((component) => (
          <div key={component.id}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="truncate text-xs font-semibold text-ink">{component.name}</p>
              <p className="shrink-0 text-xs font-semibold text-ink">
                {formatPercent(component.percentage, 1)}
              </p>
            </div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="truncate text-[0.62rem] text-faint">
                Counts for {component.weight}%
                {component.entryCount > 0
                  ? ` · ${component.entryCount} score${component.entryCount === 1 ? "" : "s"}`
                  : " · no scores yet"}
              </p>
              <p className="shrink-0 text-[0.62rem] text-faint">
                {component.entryCount > 0
                  ? `${formatScore(component.score)} / ${formatScore(component.max)}`
                  : "—"}
              </p>
            </div>
            <ProgressBar
              value={component.percentage}
              height="h-1"
              className="mt-1.5"
              tone={component.percentage == null ? "neutral" : tone}
            />
          </div>
        ))}
      </div>

      <p className="mt-4 flex items-start gap-1.5 border-t border-line pt-3 text-[0.62rem] leading-relaxed text-faint">
        <Info size={11} className="mt-0.5 shrink-0" />
        Only the activities you've added scores for are counted for now. Add the rest
        anytime — your grade will update as you go.
      </p>
    </div>
  );
}

function SemesterCard({ subject, semester, scheme, term, onSelectTerm }) {
  const grade = gradeFromScale(scheme, semester.percentage);
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">Semester grade</h2>
          <p className="mt-0.5 text-[0.66rem] text-faint">
            Based on {semester.completedTerms} of 4 terms
          </p>
        </div>
        <StatusBadge percentage={semester.percentage} />
      </div>

      <div className="mt-4 flex items-end justify-between gap-3 rounded-xl border border-line bg-surface-2/40 px-3.5 py-3">
        <div>
          <p className="text-[0.56rem] font-bold uppercase tracking-[0.1em] text-faint">
            Semester grade
          </p>
          <p className="mt-0.5 text-2xl font-semibold tracking-[-0.04em] text-ink">
            {formatPercent(semester.percentage)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[0.56rem] font-bold uppercase tracking-[0.1em] text-faint">
            Final
          </p>
          <p className="mt-0.5 text-lg font-semibold text-ink">
            {formatGradePoint(grade.gradePoint)}
          </p>
          <p className="text-[0.6rem] text-faint">{grade.remarks || "—"}</p>
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        {semester.terms.map((item) => {
          const active = item.key === term;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectTerm(item.key)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition",
                active ? "bg-accent-soft" : "hover:bg-surface-2",
              )}
            >
              <span
                className={cn(
                  "w-14 shrink-0 text-[0.66rem] font-semibold",
                  active ? "text-accent-ink" : "text-muted",
                )}
              >
                {item.short}
              </span>
              <span className="w-8 shrink-0 text-[0.58rem] text-faint">
                {item.weight}%
              </span>
              <div className="flex-1">
                <ProgressBar
                  value={item.percentage}
                  height="h-1"
                  tone={item.percentage == null ? "neutral" : "accent"}
                />
              </div>
              <span
                className={cn(
                  "w-11 shrink-0 text-right text-[0.66rem] font-semibold",
                  item.percentage == null ? "text-faint" : "text-ink",
                )}
              >
                {item.percentage == null ? "—" : formatPercent(item.percentage, 0)}
              </span>
            </button>
          );
        })}
      </div>

      {semester.completedTerms < 4 ? (
        <p className="mt-3 border-t border-line pt-3 text-[0.62rem] leading-relaxed text-faint">
          This is an estimate. Only the terms with scores are counted for now, so your
          semester grade will shift as you add the rest.
        </p>
      ) : (
        <p className="mt-3 border-t border-line pt-3 text-[0.62rem] leading-relaxed text-faint">
          All four terms are recorded. This is your semester grade.
        </p>
      )}
      {subject.semester ? (
        <p className="mt-1 text-[0.6rem] text-faint">
          {subject.semester}
          {subject.school_year ? ` · ${subject.school_year}` : ""}
        </p>
      ) : null}
    </div>
  );
}

function ScaleLegend({ scheme, semester }) {
  const mappings = scheme?.scale_mappings || [];
  if (mappings.length === 0) return null;
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">Grade scale</h2>
          <p className="mt-0.5 text-[0.66rem] text-faint">{scheme.title}</p>
        </div>
        <Link
          to="/app/schemes"
          className="text-[0.66rem] font-semibold text-accent hover:text-accent-hover"
        >
          Edit
        </Link>
      </div>
      <div className="mt-3 max-h-64 space-y-0.5 overflow-y-auto pr-1">
        {mappings.map((mapping) => {
          const active =
            semester.percentage != null &&
            semester.percentage >= Number(mapping.min_percentage) - 0.0001 &&
            semester.percentage <= Number(mapping.max_percentage) + 0.0001;
          return (
            <div
              key={mapping.id}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[0.66rem]",
                active ? "bg-accent-soft" : "",
              )}
            >
              <span className="w-[72px] shrink-0 font-mono text-[0.6rem] text-faint">
                {Number(mapping.min_percentage)}–{Number(mapping.max_percentage)}
              </span>
              <span className="w-10 shrink-0 font-semibold text-ink">
                {formatGradePoint(mapping.grade_point)}
              </span>
              <span className="flex-1 truncate text-muted">{mapping.remarks || "—"}</span>
              {active ? (
                <span className="shrink-0 text-[0.52rem] font-bold uppercase tracking-wider text-accent">
                  Now
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AssignSchemePanel({ subject, schemes, onAssign, assigning }) {
  const [selected, setSelected] = useState(subject.scheme_id || schemes[0]?.id || "");

  useEffect(() => {
    setSelected(subject.scheme_id || schemes[0]?.id || "");
  }, [subject.scheme_id, schemes]);

  return (
    <div className="rounded-2xl border border-warning/30 bg-warning-soft/45 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-warning-soft text-warning">
          <AlertTriangle size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-warning">Choose a grade setup</h2>
          <p className="mt-1 text-xs leading-relaxed text-warning/85">
            This course doesn't have a grade setup right now, so scores can't be
            calculated. Pick one below to bring its grades back.
          </p>
          {schemes.length > 0 ? (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Select
                value={selected}
                onChange={(event) => setSelected(event.target.value)}
                aria-label="Grade setup"
                className="sm:max-w-xs"
              >
                {schemes.map((scheme) => (
                  <option key={scheme.id} value={scheme.id}>
                    {scheme.title}
                  </option>
                ))}
              </Select>
              <Button
                size="sm"
                loading={assigning}
                disabled={!selected}
                onClick={() => onAssign(selected)}
              >
                Save setup
              </Button>
            </div>
          ) : (
            <Link to="/app/schemes?new=1" className="btn btn-secondary btn-sm mt-3">
              Create a setup first
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SubjectDetail() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const {
    loading,
    subjectById,
    schemes,
    schemesById,
    entriesBySubject,
    removeSubject,
    removeEntry,
    updateSubject,
  } = useData();

  const subject = subjectById[subjectId];
  const scheme = subject ? schemesById[subject.scheme_id] : null;
  const entries = entriesBySubject[subjectId] || [];
  const summary = subject ? subjectSummary(subject, scheme, entries) : null;

  const [term, setTerm] = useState("prelim");
  const [initializedFor, setInitializedFor] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useSeo({
    title: subject
      ? pageTitle(`${subject.code} — ${subject.name}`)
      : pageTitle("Course"),
    description: subject
      ? `Scores, term grades, and semester grade for ${subject.code} ${subject.name} in Gradely.`
      : "Track scores and grades for this course in Gradely.",
    path: `/app/subjects/${subjectId || ""}`,
    noindex: true,
  });

  useEffect(() => {
    if (loading || !subject) return;
    if (initializedFor === subject.id) return;
    setInitializedFor(subject.id);
    const latest = [...TERMS]
      .reverse()
      .find((item) => entries.some((entry) => entry.term === item.key));
    setTerm(latest?.key || "prelim");
  }, [loading, subject, entries, initializedFor]);

  const current = useMemo(
    () => summary?.semester.terms.find((item) => item.key === term) || null,
    [summary, term],
  );

  const currentStatus = statusFor(current?.percentage);

  if (loading) return <LoadingScreen label="Loading course…" />;

  if (!subject) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-surface-2 text-faint">
          <BookOpen size={22} />
        </span>
        <h1 className="mt-4 text-xl font-semibold text-ink">Course not found</h1>
        <p className="mt-2 text-sm text-muted">
          This course may have been deleted, or the link is incorrect.
        </p>
        <Link to="/app/subjects" className="btn btn-primary mt-5">
          Back to courses
        </Link>
      </div>
    );
  }

  const hasLab = Boolean(subject.has_lab);
  const lectureWeight = hasLab ? scheme?.lecture_weight ?? 0 : 100;
  const labWeight = hasLab ? scheme?.lab_weight ?? 0 : 0;
  const termEntries = current?.entries ? [...current.entries] : [];

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await removeSubject(subject.id);
      toast.success("Course deleted.");
      navigate("/app/subjects", { replace: true });
    } catch (error) {
      toast.error(error?.message || "Could not delete the course.");
      setDeleting(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!entryToDelete) return;
    setDeletingEntry(true);
    try {
      await removeEntry(entryToDelete.id);
      toast.success("Score removed.");
      setEntryToDelete(null);
    } catch (error) {
      toast.error(error?.message || "Could not remove the score.");
    } finally {
      setDeletingEntry(false);
    }
  };

  const handleAssign = async (schemeId) => {
    setAssigning(true);
    try {
      await updateSubject(subject.id, {
        code: subject.code,
        name: subject.name,
        scheme_id: schemeId,
        has_lab: subject.has_lab,
        units: subject.units,
        semester: subject.semester,
        school_year: subject.school_year,
      });
      toast.success("Grade setup saved.");
    } catch (error) {
      toast.error(error?.message || "Could not save the grade setup.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <Link
          to="/app/subjects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition hover:text-ink"
        >
          <ArrowLeft size={14} />
          All courses
        </Link>

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-accent-soft px-2 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-accent-ink">
                {subject.code}
              </span>
              {hasLab ? (
                <span className="chip !py-1 !text-[0.6rem]">
                  <FlaskConical size={10} className="text-accent" />
                  Class + Lab
                </span>
              ) : (
                <span className="chip !py-1 !text-[0.6rem]">
                  <BookOpen size={10} className="text-accent" />
                  No lab
                </span>
              )}
              <span className="chip !py-1 !text-[0.6rem]">{subject.units} units</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-ink sm:text-[2rem]">
              {subject.name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] text-faint">
              {scheme ? (
                <Link
                  to="/app/schemes"
                  className="inline-flex items-center gap-1 font-medium text-muted transition hover:text-accent"
                >
                  <SlidersHorizontal size={11} />
                  {scheme.title}
                </Link>
              ) : (
                <span className="text-warning">No grade setup</span>
              )}
              <span className="inline-flex items-center gap-1">
                <CalendarDays size={11} />
                {subject.semester}
                {subject.school_year ? ` · ${subject.school_year}` : ""}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={Pencil}
              onClick={() => setEditOpen(true)}
            >
              Edit
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Trash2}
              onClick={() => setDeleteOpen(true)}
              className="text-danger hover:border-danger/30 hover:bg-danger-soft"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {!scheme ? (
        <AssignSchemePanel
          subject={subject}
          schemes={schemes}
          assigning={assigning}
          onAssign={handleAssign}
        />
      ) : null}

      <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface-2/55 p-1 sm:flex">
        {TERMS.map((item) => {
          const itemBreakdown = summary?.semester.terms.find((entry) => entry.key === item.key);
          const active = item.key === term;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setTerm(item.key)}
              className={cn(
                "flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold transition sm:min-w-[104px] sm:px-3",
                active
                  ? "bg-surface text-ink shadow-sm"
                  : "text-muted hover:bg-surface/60 hover:text-ink",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[0.54rem]",
                  active ? "bg-accent-soft text-accent-ink" : "bg-surface-3 text-faint",
                )}
              >
                {toNumber(scheme?.term_weights?.[item.key])}%
              </span>
              {itemBreakdown?.percentage != null ? (
                <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-label="Has scores" />
              ) : null}
            </button>
          );
        })}
      </div>

      {current ? (
        <TermSummary
          term={TERMS.find((item) => item.key === term)}
          current={current}
          scheme={scheme}
          status={currentStatus}
        />
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        <div className="order-2 space-y-5 lg:order-1">
          {current ? (
            <>
              <BreakdownCard
                title="Class activities"
                icon={BookOpen}
                trackWeight={lectureWeight}
                stats={current.lecture}
                tone="accent"
              />
              {hasLab ? (
                <BreakdownCard
                  title="Lab activities"
                  icon={FlaskConical}
                  trackWeight={labWeight}
                  stats={current.lab}
                  tone="positive"
                />
              ) : null}
            </>
          ) : null}

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-ink">
                  {termLabel(term)} scores
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  {termEntries.length} score{termEntries.length === 1 ? "" : "s"} recorded
                </p>
              </div>
              <span className="chip !py-1 !text-[0.6rem]">
                {formatPercent(current?.percentage)}
              </span>
            </div>

            {termEntries.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p className="text-sm font-semibold text-ink">No scores yet</p>
                <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-muted">
                  Add your first {termLabel(term).toLowerCase()} score using the form, and
                  your grade will update right away.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-line">
                {[...termEntries]
                  .sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
                  )
                  .map((entry) => {
                    const component = componentName(scheme, entry.category);
                    const percentage =
                      Number(entry.max_score) > 0
                        ? (Number(entry.score) / Number(entry.max_score)) * 100
                        : 0;
                    return (
                      <div
                        key={entry.id}
                        className="flex items-center gap-3 px-5 py-3 transition hover:bg-surface-2/40"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-ink">
                            {entry.label || component}
                          </p>
                          <p className="mt-0.5 truncate text-[0.64rem] text-faint">
                            {component} · {formatShortDate(entry.created_at)}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-semibold text-ink">
                            {formatScore(entry.score)} / {formatScore(entry.max_score)}
                          </p>
                          <p className="text-[0.62rem] text-faint">
                            {formatPercent(percentage, 1)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEntryToDelete(entry)}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-faint transition hover:bg-danger-soft hover:text-danger"
                          aria-label={`Delete ${entry.label || component} score`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        <div className="order-1 space-y-5 self-start lg:order-2 lg:sticky lg:top-6">
          <AddEntryForm subject={subject} scheme={scheme} term={term} />
          {summary ? (
            <SemesterCard
              subject={subject}
              semester={summary.semester}
              scheme={scheme}
              term={term}
              onSelectTerm={setTerm}
            />
          ) : null}
          {scheme ? <ScaleLegend scheme={scheme} semester={summary?.semester} /> : null}
        </div>
      </div>

      <SubjectForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        subject={subject}
        schemes={schemes}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this course?"
        confirmLabel="Delete course"
        description={`“${subject.code} — ${subject.name}” and all ${entries.length} recorded score${
          entries.length === 1 ? "" : "s"
        } will be permanently deleted. This cannot be undone.`}
      />

      <ConfirmDialog
        open={Boolean(entryToDelete)}
        onClose={() => setEntryToDelete(null)}
        onConfirm={handleDeleteEntry}
        loading={deletingEntry}
        title="Delete this score?"
        confirmLabel="Delete score"
        description={
          entryToDelete
            ? `Remove ${entryToDelete.label || componentName(scheme, entryToDelete.category)} (${formatScore(
                entryToDelete.score,
              )} / ${formatScore(entryToDelete.max_score)}) from ${termLabel(entryToDelete.term)}? Your grades will update right away.`
            : ""
        }
      />
    </div>
  );
}
