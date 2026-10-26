import { Link } from "react-router-dom";
import { ArrowUpRight, FlaskConical } from "lucide-react";
import { cn, formatGradePoint, formatPercent, getInitialsColor } from "../lib/utils";
import { StatusBadge } from "./ui";

export function SubjectCard({ row, className }) {
  const { subject, scheme, percentage, gradePoint, remarks, status, latestTerm } = row;

  return (
    <Link
      to={`/app/subjects/${subject.id}`}
      className={cn(
        "card group relative flex flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[0.62rem] font-bold",
              getInitialsColor(subject.id || subject.code),
            )}
          >
            {subject.code.split(" ")[0].slice(0, 3)}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[0.68rem] font-semibold uppercase tracking-wider text-faint">
                {subject.code}
              </span>
              {subject.has_lab ? (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-accent-soft px-1.5 py-0.5 text-[0.54rem] font-bold uppercase tracking-wide text-accent-ink">
                  <FlaskConical size={8} />
                  Lab
                </span>
              ) : null}
            </div>
            <h3 className="truncate text-sm font-semibold tracking-[-0.02em] text-ink">
              {subject.name}
            </h3>
          </div>
        </div>
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-faint transition group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent">
          <ArrowUpRight size={14} />
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x divide-line overflow-hidden rounded-xl border border-line bg-surface-2/35 py-2.5">
        <div className="min-w-0 px-2.5">
          <p className="text-[0.56rem] font-bold uppercase tracking-[0.1em] text-faint">
            Term
          </p>
          <p className="mt-0.5 truncate text-[0.95rem] font-semibold text-ink">
            {latestTerm ? formatPercent(latestTerm.percentage, 0) : "—"}
          </p>
          <p className="truncate text-[0.56rem] text-faint">
            {latestTerm?.short || "No scores"}
          </p>
        </div>
        <div className="min-w-0 px-2.5">
          <p className="text-[0.56rem] font-bold uppercase tracking-[0.1em] text-faint">
            Semester
          </p>
          <p className="mt-0.5 truncate text-[0.95rem] font-semibold text-ink">
            {formatPercent(percentage, 0)}
          </p>
          <p className="truncate text-[0.56rem] text-faint">
            {row.completedTerms}/4 terms
          </p>
        </div>
        <div className="min-w-0 px-2.5">
          <p className="text-[0.56rem] font-bold uppercase tracking-[0.1em] text-faint">
            Final
          </p>
          <p className="mt-0.5 truncate text-[0.95rem] font-semibold text-ink">
            {formatGradePoint(gradePoint)}
          </p>
          <p className="truncate text-[0.56rem] text-faint">{remarks || "No grade"}</p>
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-line pt-3">
        <span className="truncate text-[0.64rem] text-faint">
          {scheme ? scheme.title : "No scheme assigned"}
          <span className="mx-1.5 text-line-strong">·</span>
          {subject.units} units
        </span>
        {scheme ? (
          <StatusBadge percentage={percentage} status={status} />
        ) : (
          <span className="rounded-full border border-warning/25 bg-warning-soft px-2 py-0.5 text-[0.6rem] font-semibold text-warning">
            Needs scheme
          </span>
        )}
      </div>
    </Link>
  );
}
