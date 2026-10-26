import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  FlaskConical,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import {
  TERMS,
  createStarterScheme,
  schemeDraftFrom,
  validateSchemeDraft,
} from "../lib/grading";
import { cn, formatWeight, randomId, sum, toNumber } from "../lib/utils";
import { Button, Field, Input, Modal } from "./ui";

function WeightInput({ value, onChange, label, disabled = false }) {
  return (
    <div className="relative">
      <input
        type="number"
        min="0"
        max="100"
        step="0.01"
        inputMode="decimal"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="field pr-7 text-right"
      />
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.68rem] font-medium text-faint">
        %
      </span>
    </div>
  );
}

function SumChip({ total }) {
  const ok = Math.abs(total - 100) < 0.01;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.64rem] font-semibold",
        ok
          ? "border-positive/25 bg-positive-soft text-positive"
          : "border-danger/25 bg-danger-soft text-danger",
      )}
    >
      {formatWeight(total)} / 100%
    </span>
  );
}

function SectionHeading({ title, description, right }) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {right}
    </div>
  );
}

function ComponentGroup({
  title,
  icon: Icon,
  components,
  weightTotal,
  onChange,
  onAdd,
  onRemove,
  error,
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface-2/35 p-3.5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink">
          <Icon size={14} className="text-accent" />
          {title}
        </span>
        <SumChip total={weightTotal} />
      </div>

      <div className="space-y-2">
        {components.map((component, index) => (
          <div key={component.id || index} className="flex items-center gap-2">
            <Input
              className="field field-sm min-w-0 flex-1"
              value={component.name}
              onChange={(event) => onChange(index, "name", event.target.value)}
              placeholder="Activity name"
              aria-label={`${title} activity ${index + 1} name`}
            />
            <div className="w-[76px] shrink-0">
              <WeightInput
                value={component.weight}
                onChange={(value) => onChange(index, "weight", value)}
                label={`${title} activity ${index + 1} percentage`}
              />
            </div>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-faint transition hover:bg-danger-soft hover:text-danger"
              aria-label={`Remove ${component.name || "activity"}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {error ? <p className="mt-2 text-xs font-medium text-danger">{error}</p> : null}

      <button
        type="button"
        onClick={onAdd}
        className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-accent transition hover:bg-accent-soft"
      >
        <Plus size={13} />
        Add activity
      </button>
    </div>
  );
}

export function SchemeEditor({ open, onClose, scheme, onSaved }) {
  const { createScheme, updateScheme } = useData();
  const toast = useToast();
  const [draft, setDraft] = useState(createStarterScheme(""));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDraft(scheme ? schemeDraftFrom(scheme) : createStarterScheme(""));
    setErrors({});
    setSaving(false);
  }, [open, scheme]);

  const lectureTotal = useMemo(
    () => sum(draft.lecture_components.map((component) => toNumber(component.weight))),
    [draft.lecture_components],
  );
  const labTotal = useMemo(
    () => sum(draft.lab_components.map((component) => toNumber(component.weight))),
    [draft.lab_components],
  );
  const termTotal = useMemo(
    () => sum(TERMS.map((term) => toNumber(draft.term_weights?.[term.key]))),
    [draft.term_weights],
  );
  const splitTotal = toNumber(draft.lecture_weight) + toNumber(draft.lab_weight);

  const patch = (values) => {
    setDraft((current) => ({ ...current, ...values }));
  };

  const patchTerm = (key, value) => {
    setDraft((current) => ({
      ...current,
      term_weights: { ...current.term_weights, [key]: value },
    }));
  };

  const patchComponent = (group, index, field, value) => {
    setDraft((current) => ({
      ...current,
      [group]: current[group].map((component, componentIndex) =>
        componentIndex === index ? { ...component, [field]: value } : component,
      ),
    }));
  };

  const addComponent = (group, prefix) => {
    setDraft((current) => ({
      ...current,
      [group]: [
        ...current[group],
        { id: randomId(prefix), name: "", weight: 0 },
      ],
    }));
  };

  const removeComponent = (group, index) => {
    setDraft((current) => ({
      ...current,
      [group]: current[group].filter((_, componentIndex) => componentIndex !== index),
    }));
  };

  const patchScale = (index, field, value) => {
    setDraft((current) => ({
      ...current,
      scale_mappings: current.scale_mappings.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row,
      ),
    }));
  };

  const addScaleRow = () => {
    setDraft((current) => ({
      ...current,
      scale_mappings: [
        ...current.scale_mappings,
        {
          min_percentage: 0,
          max_percentage: 0,
          grade_point: 5,
          remarks: "Failed",
        },
      ],
    }));
  };

  const removeScaleRow = (index) => {
    setDraft((current) => ({
      ...current,
      scale_mappings: current.scale_mappings.filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  const resetDefaults = () => {
    setDraft(createStarterScheme(draft.title || ""));
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateSchemeDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Check the highlighted fields before saving.");
      return;
    }

    setSaving(true);
    try {
      if (scheme) {
        await updateScheme(scheme.id, draft);
        toast.success("Grade setup updated.");
      } else {
        await createScheme(draft);
        toast.success("Grade setup created.");
      }
      onSaved?.();
      onClose?.();
    } catch (error) {
      toast.error(error?.message || "Could not save the grade setup.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      title={scheme ? "Edit grade setup" : "New grade setup"}
      description="Choose how much each part of your class counts. You can reuse this setup for other courses."
      size="4xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="scheme-form" icon={Save} loading={saving}>
            {scheme ? "Save changes" : "Create setup"}
          </Button>
        </>
      }
    >
      <form id="scheme-form" onSubmit={handleSubmit} className="space-y-7">
        <div>
          <Field
            label="Setup name"
            htmlFor="scheme-title"
            error={errors.title}
            hint="For example: “Standard Class + Lab” or “College grading”."
          >
            <Input
              id="scheme-title"
              value={draft.title}
              onChange={(event) => patch({ title: event.target.value })}
              placeholder="Standard Class + Lab"
              maxLength={80}
              autoFocus
            />
          </Field>
        </div>

        {/* Lecture / Lab split */}
        <section>
          <SectionHeading
            title="Class and lab"
            description="Choose how much class work and lab work count toward each term."
            right={<SumChip total={splitTotal} />}
          />
          <div className="rounded-2xl border border-line bg-surface-2/35 p-3.5">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Class portion" htmlFor="lecture-weight">
                <WeightInput
                  value={draft.lecture_weight}
                  onChange={(value) => patch({ lecture_weight: value })}
                  label="Class portion"
                />
              </Field>
              <Field label="Lab portion" htmlFor="lab-weight">
                <WeightInput
                  value={draft.lab_weight}
                  onChange={(value) => patch({ lab_weight: value })}
                  label="Lab portion"
                />
              </Field>
            </div>
            <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full bg-accent transition-[width]"
                style={{ width: `${Math.max(0, Math.min(100, toNumber(draft.lecture_weight)))}%` }}
              />
              <div
                className="h-full bg-accent/35 transition-[width]"
                style={{ width: `${Math.max(0, Math.min(100, toNumber(draft.lab_weight)))}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[0.64rem] text-faint">
              <span>Class</span>
              <span>Lab</span>
            </div>
            {errors.labSplit ? (
              <p className="mt-2 text-xs font-medium text-danger">{errors.labSplit}</p>
            ) : (
              <p className="mt-2 text-[0.68rem] leading-relaxed text-faint">
                Set lab to 0% if this course has no lab. The two portions should total 100%.
              </p>
            )}
          </div>
        </section>

        {/* Term weights */}
        <section>
          <SectionHeading
            title="How each term counts"
            description="Set how much each term adds to your semester grade."
            right={<SumChip total={termTotal} />}
          />
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {TERMS.map((term) => (
              <Field key={term.key} label={term.label} htmlFor={`term-${term.key}`}>
                <WeightInput
                  value={draft.term_weights?.[term.key] ?? 0}
                  onChange={(value) => patchTerm(term.key, value)}
                  label={`${term.label} percentage`}
                />
              </Field>
            ))}
          </div>
          {errors.termWeights ? (
            <p className="mt-2 text-xs font-medium text-danger">{errors.termWeights}</p>
          ) : null}
        </section>

        {/* Components */}
        <section>
          <SectionHeading
            title="How activities count"
            description="Add the activities your class uses and how much each one counts. Each group should total 100%."
          />
          <div
            className={cn(
              "grid gap-3.5",
              toNumber(draft.lecture_weight) > 0 && toNumber(draft.lab_weight) > 0
                ? "md:grid-cols-2"
                : "grid-cols-1",
            )}
          >
            {toNumber(draft.lecture_weight) > 0 ? (
              <ComponentGroup
                title="Class activities"
                icon={BookOpen}
                components={draft.lecture_components}
                weightTotal={lectureTotal}
                onChange={(index, field, value) =>
                  patchComponent("lecture_components", index, field, value)
                }
                onAdd={() => addComponent("lecture_components", "lec")}
                onRemove={(index) => removeComponent("lecture_components", index)}
                error={errors.lecture_components}
              />
            ) : null}

            {toNumber(draft.lab_weight) > 0 ? (
              <ComponentGroup
                title="Lab activities"
                icon={FlaskConical}
                components={draft.lab_components}
                weightTotal={labTotal}
                onChange={(index, field, value) =>
                  patchComponent("lab_components", index, field, value)
                }
                onAdd={() => addComponent("lab_components", "lab")}
                onRemove={(index) => removeComponent("lab_components", index)}
                error={errors.lab_components}
              />
            ) : null}
          </div>
        </section>

        {/* Scale */}
        <section>
          <SectionHeading
            title="Grade scale"
            description="Set the percentage ranges and the grade you see on your report card."
            right={
              <button
                type="button"
                onClick={addScaleRow}
                className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover"
              >
                <Plus size={13} />
                Add grade range
              </button>
            }
          />
          {errors.scale ? (
            <div className="mb-2.5 flex items-start gap-2 rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-xs text-danger">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              {errors.scale}
            </div>
          ) : null}

          <div className="overflow-x-auto rounded-2xl border border-line">
            <div className="min-w-[520px]">
              <div className="grid grid-cols-[90px_90px_90px_1fr_36px] gap-2 border-b border-line bg-surface-2/50 px-3 py-2 text-[0.62rem] font-bold uppercase tracking-wider text-faint">
                <span>Min %</span>
                <span>Max %</span>
                <span>Grade</span>
                <span>Remark</span>
                <span />
              </div>
              <div className="divide-y divide-line">
                {draft.scale_mappings.map((row, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[90px_90px_90px_1fr_36px] items-center gap-2 px-3 py-2"
                  >
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={row.min_percentage}
                      onChange={(event) =>
                        patchScale(index, "min_percentage", event.target.value)
                      }
                      className="field field-sm"
                      aria-label={`Range ${index + 1} minimum percentage`}
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={row.max_percentage}
                      onChange={(event) =>
                        patchScale(index, "max_percentage", event.target.value)
                      }
                      className="field field-sm"
                      aria-label={`Range ${index + 1} maximum percentage`}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.grade_point}
                      onChange={(event) =>
                        patchScale(index, "grade_point", event.target.value)
                      }
                      className="field field-sm"
                      aria-label={`Range ${index + 1} grade point`}
                    />
                    <input
                      type="text"
                      value={row.remarks || ""}
                      onChange={(event) => patchScale(index, "remarks", event.target.value)}
                      className="field field-sm"
                      placeholder="Excellent, Pass, Failed…"
                      aria-label={`Range ${index + 1} remarks`}
                    />
                    <button
                      type="button"
                      onClick={() => removeScaleRow(index)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-faint transition hover:bg-danger-soft hover:text-danger"
                      aria-label={`Remove grade range ${index + 1}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-2 text-[0.68rem] leading-relaxed text-faint">
            Ranges can include decimals. A 1.00–5.00 scale works just as well as a 4.0
            scale.
          </p>
        </section>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-line pt-4 sm:flex-row sm:items-center">
          <p className="text-[0.68rem] leading-relaxed text-faint">
            Tip: a simple starting point is 25% per term and 75% as the passing grade.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={resetDefaults}
          >
            Reset to defaults
          </Button>
        </div>
      </form>
    </Modal>
  );
}
