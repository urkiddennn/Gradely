import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  FlaskConical,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useData } from "../context/DataContext";
import { yearSummary } from "../lib/grading";
import { pageTitle, useSeo } from "../lib/seo";
import {
  Button,
  EmptyState,
  LoadingScreen,
  PageHeader,
} from "../components/ui";
import { SubjectCard } from "../components/SubjectCard";
import { SubjectForm } from "../components/SubjectForm";

const FILTERS = [
  { key: "all", label: "All courses" },
  { key: "lab", label: "With lab" },
  { key: "lecture", label: "Without lab" },
];

export default function Subjects() {
  const { loading, subjects, schemes, schemesById, entriesBySubject } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  useSeo({
    title: pageTitle("Courses"),
    description:
      "Every course you're tracking in Gradely, with term grades, semester grades, and an at-a-glance final grade.",
    path: "/app/subjects",
    noindex: true,
  });

  useEffect(() => {
    if (loading || searchParams.get("new") !== "1") return;
    if (schemes.length > 0) setFormOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete("new");
    setSearchParams(next, { replace: true });
  }, [loading, searchParams, setSearchParams, schemes.length]);

  const year = useMemo(
    () => yearSummary(subjects, schemesById, entriesBySubject),
    [subjects, schemesById, entriesBySubject],
  );

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return year.rows.filter((row) => {
      const matchesQuery =
        !needle ||
        row.subject.name.toLowerCase().includes(needle) ||
        row.subject.code.toLowerCase().includes(needle) ||
        (row.scheme?.title || "").toLowerCase().includes(needle);
      const matchesFilter =
        filter === "all" ||
        (filter === "lab" && row.subject.has_lab) ||
        (filter === "lecture" && !row.subject.has_lab);
      return matchesQuery && matchesFilter;
    });
  }, [year.rows, query, filter]);

  if (loading) return <LoadingScreen label="Loading your courses…" />;

  const hasSchemes = schemes.length > 0;

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="This semester"
        title="Courses"
        description="Every course on your board. Open one to add scores and watch its term and semester grades update."
        actions={
          <>
            <Link to="/app/schemes" className="btn btn-secondary btn-sm">
              <SlidersHorizontal size={14} />
              Setups
            </Link>
            {hasSchemes ? (
              <Button size="sm" icon={Plus} onClick={() => setFormOpen(true)}>
                Add course
              </Button>
            ) : (
              <Link to="/app/schemes?new=1" className="btn btn-primary btn-sm">
                <Plus size={14} />
                Create setup
              </Link>
            )}
          </>
        }
      />

      {subjects.length > 0 ? (
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by code, name, or setup…"
              className="field pl-9 pr-8"
              aria-label="Search courses"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-faint transition hover:bg-surface-2 hover:text-ink"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            ) : null}
          </div>

          <div className="flex w-full gap-1 overflow-x-auto rounded-xl border border-line bg-surface-2/50 p-1 no-scrollbar sm:w-auto">
            {FILTERS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setFilter(option.key)}
                className={
                  filter === option.key
                    ? "shrink-0 rounded-lg bg-surface px-3 py-1.5 text-xs font-semibold text-ink shadow-sm"
                    : "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-muted transition hover:text-ink"
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description={
            hasSchemes
              ? "Add the courses you're taking this semester, choose a grade setup for each, and start adding scores."
              : "Create a grade setup first — it decides how each course's quizzes, projects, exams, and lab work count."
          }
          action={
            hasSchemes ? (
              <Button icon={Plus} onClick={() => setFormOpen(true)}>
                Add your first course
              </Button>
            ) : (
              <Link to="/app/schemes?new=1" className="btn btn-primary">
                Create a grade setup
              </Link>
            )
          }
        />
      ) : filteredRows.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching courses"
          description="Try a different search term or clear the filter to see all of your courses."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.7rem] text-faint">
            <span>
              {filteredRows.length} course{filteredRows.length === 1 ? "" : "s"} ·{" "}
              {filteredRows.reduce(
                (total, row) => total + Number(row.subject.units || 0),
                0,
              )}{" "}
              units
            </span>
            {filter === "lab" ? (
              <span className="inline-flex items-center gap-1">
                <FlaskConical size={11} className="text-accent" />
                Showing courses with a lab
              </span>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredRows.map((row) => (
              <SubjectCard key={row.subject.id} row={row} />
            ))}
          </div>
        </>
      )}

      <SubjectForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        schemes={schemes}
      />
    </div>
  );
}
