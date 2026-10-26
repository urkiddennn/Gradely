import { useEffect, useId, useMemo, useState } from "react";
import {
  Calculator,
  FlaskConical,
  Info,
  Plus,
  BookOpen,
} from "lucide-react";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { normalizeScheme, termLabel } from "../lib/grading";
import { cn, formatPercent, toNumber } from "../lib/utils";
import { Button, Field, Input, Select } from "./ui";

export function AddEntryForm({ subject, scheme, term }) {
  const { createEntry } = useData();
  const toast = useToast();
  const id = useId();
  const [mode, setMode] = useState("score");
  const [component, setComponent] = useState("");
  const [label, setLabel] = useState("");
  const [score, setScore] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [percentage, setPercentage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const normalized = useMemo(() => normalizeScheme(scheme), [scheme]);

  const groups = useMemo(() => {
    const lecture = (normalized?.lecture_components || []).map((item) => ({
      ...item,
      group: "lecture",
    }));
    const lab = subject?.has_lab
      ? (normalized?.lab_components || []).map((item) => ({ ...item, group: "lab" }))
      : [];
    return { lecture, lab, all: [...lecture, ...lab] };
  }, [normalized, subject?.has_lab]);

  useEffect(() => {
    if (!groups.all.some((item) => item.id === component)) {
      setComponent(groups.all[0]?.id || "");
    }
  }, [groups.all, component]);

  const selected = groups.all.find((item) => item.id === component);
  const preview =
    mode === "percentage"
      ? percentage === ""
        ? null
        : Math.max(0, Math.min(100, toNumber(percentage)))
      : score !== "" && toNumber(maxScore) > 0
        ? Math.max(0, Math.min(100, (toNumber(score) / toNumber(maxScore)) * 100))
        : null;

  const resetValues = () => {
    setLabel("");
    setScore("");
    setPercentage("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!selected) {
      setError("Choose an assessment component first.");
      return;
    }

    let entryScore;
    let entryMax;
    if (mode === "percentage") {
      if (percentage === "" || Number.isNaN(Number(percentage))) {
        setError("Enter a percentage.");
        return;
      }
      entryScore = toNumber(percentage);
      entryMax = 100;
      if (entryScore < 0 || entryScore > 100) {
        setError("Percentage must be between 0 and 100.");
        return;
      }
    } else {
      if (score === "" || Number.isNaN(Number(score))) {
        setError("Enter the score you received.");
        return;
      }
      entryScore = toNumber(score);
      entryMax = toNumber(maxScore);
      if (entryMax <= 0) {
        setError("The total score must be greater than 0.");
        return;
      }
      if (entryScore < 0) {
        setError("Score cannot be negative.");
        return;
      }
      if (entryScore > entryMax) {
        setError("Score cannot be higher than the total.");
        return;
      }
    }

    setSaving(true);
    try {
      await createEntry({
        subject_id: subject.id,
        term,
        category: selected.id,
        label,
        score: entryScore,
        max_score: entryMax,
      });
      toast.success(`Score added to ${termLabel(term)}.`);
      resetValues();
    } catch (createError) {
      setError(createError?.message || "Could not save this score.");
    } finally {
      setSaving(false);
    }
  };

  if (!normalized || groups.all.length === 0) {
    return (
      <div className="card p-5">
        <div className="flex items-start gap-2.5 rounded-xl border border-warning/25 bg-warning-soft px-3.5 py-3">
          <Info size={15} className="mt-0.5 shrink-0 text-warning" />
          <div>
            <p className="text-sm font-semibold text-warning">No components available</p>
            <p className="mt-1 text-xs leading-relaxed text-warning/85">
              Add assessment components to this subject's grading scheme before recording
              scores.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Calculator size={15} className="text-accent" />
            Add a score
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            Recording for <span className="font-medium text-ink-soft">{termLabel(term)}</span>
          </p>
        </div>
        <span className="chip !py-1 !text-[0.62rem]">{subject.code}</span>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
        <Field label="Assessment component" htmlFor={`${id}-component`}>
          <Select
            id={`${id}-component`}
            value={component}
            onChange={(event) => setComponent(event.target.value)}
          >
            {groups.lecture.length > 0 ? (
              <optgroup label="Lecture">
                {groups.lecture.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.weight}%
                  </option>
                ))}
              </optgroup>
            ) : null}
            {groups.lab.length > 0 ? (
              <optgroup label="Laboratory">
                {groups.lab.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.weight}%
                  </option>
                ))}
              </optgroup>
            ) : null}
          </Select>
        </Field>

        <Field
          label="Label"
          htmlFor={`${id}-label`}
          hint="Optional — e.g. “Quiz 1” or “Chapter 3 exam”."
        >
          <Input
            id={`${id}-label`}
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Quiz 1"
            maxLength={60}
          />
        </Field>

        <div>
          <p className="label">Enter as</p>
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface-2 p-1">
            {[
              { value: "score", label: "Raw score" },
              { value: "percentage", label: "Percentage" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setMode(option.value);
                  setError("");
                }}
                className={cn(
                  "rounded-lg px-2 py-1.5 text-xs font-semibold transition",
                  mode === option.value
                    ? "bg-surface text-ink shadow-sm"
                    : "text-muted hover:text-ink",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {mode === "score" ? (
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Score" htmlFor={`${id}-score`}>
              <Input
                id={`${id}-score`}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={score}
                onChange={(event) => setScore(event.target.value)}
                placeholder="18"
              />
            </Field>
            <Field label="Out of" htmlFor={`${id}-max`}>
              <Input
                id={`${id}-max`}
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={maxScore}
                onChange={(event) => setMaxScore(event.target.value)}
                placeholder="20"
              />
            </Field>
          </div>
        ) : (
          <Field label="Percentage" htmlFor={`${id}-percentage`}>
            <div className="relative">
              <Input
                id={`${id}-percentage`}
                type="number"
                min="0"
                max="100"
                step="0.01"
                inputMode="decimal"
                value={percentage}
                onChange={(event) => setPercentage(event.target.value)}
                placeholder="92"
                className="pr-8"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-faint">
                %
              </span>
            </div>
          </Field>
        )}

        {selected ? (
          <div className="rounded-xl border border-line bg-surface-2/45 px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[0.68rem] font-medium text-muted">
                {selected.group === "lab" ? (
                  <FlaskConical size={12} className="text-accent" />
                ) : (
                  <BookOpen size={12} className="text-accent" />
                )}
                {selected.name} · {selected.weight}% of{" "}
                {selected.group === "lab" ? "lab" : "lecture"}
              </span>
              <span className="text-xs font-bold text-ink">
                {preview == null ? "—" : formatPercent(preview)}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-accent transition-[width] duration-300"
                style={{ width: `${preview ?? 0}%` }}
              />
            </div>
          </div>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-xs font-medium text-danger"
          >
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" icon={Plus} loading={saving}>
          Add score
        </Button>
      </form>
    </div>
  );
}
