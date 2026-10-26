import { useEffect, useState } from "react";
import { BookOpen, FlaskConical, Save } from "lucide-react";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { normalizeScheme } from "../lib/grading";
import { SEMESTERS, toNumber } from "../lib/utils";
import { Button, Field, Input, Modal, Select, Switch } from "./ui";

const EMPTY = {
  code: "",
  name: "",
  scheme_id: "",
  has_lab: false,
  units: 3,
  semester: "1st Semester",
  school_year: "",
};

export function SubjectForm({ open, onClose, subject, schemes, onSaved }) {
  const { createSubject, updateSubject } = useData();
  const toast = useToast();
  const [draft, setDraft] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSaving(false);
    if (subject) {
      setDraft({
        code: subject.code || "",
        name: subject.name || "",
        scheme_id: subject.scheme_id || "",
        has_lab: Boolean(subject.has_lab),
        units: subject.units ?? 3,
        semester: subject.semester || "1st Semester",
        school_year: subject.school_year || "",
      });
    } else {
      setDraft({
        ...EMPTY,
        scheme_id: schemes[0]?.id || "",
      });
    }
  }, [open, subject, schemes]);

  const selectedScheme = schemes.find((scheme) => scheme.id === draft.scheme_id);
  const normalized = normalizeScheme(selectedScheme);

  const patch = (values) => setDraft((current) => ({ ...current, ...values }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!draft.code.trim()) nextErrors.code = "Enter the course code.";
    if (!draft.name.trim()) nextErrors.name = "Enter the course name.";
    if (!draft.scheme_id) nextErrors.scheme_id = "Choose a grading scheme.";
    if (toNumber(draft.units) <= 0) nextErrors.units = "Units must be greater than 0.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      if (subject) {
        await updateSubject(subject.id, draft);
        toast.success("Subject updated.");
      } else {
        await createSubject(draft);
        toast.success("Subject added.");
      }
      onSaved?.();
      onClose?.();
    } catch (error) {
      toast.error(error?.message || "Could not save the subject.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      title={subject ? "Edit subject" : "Add a subject"}
      description="Give this course its own scheme, units, and lab setting."
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="subject-form" icon={Save} loading={saving}>
            {subject ? "Save changes" : "Add subject"}
          </Button>
        </>
      }
    >
      <form id="subject-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-[1fr_1.6fr] gap-3">
          <Field label="Course code" htmlFor="subject-code" error={errors.code}>
            <Input
              id="subject-code"
              value={draft.code}
              onChange={(event) =>
                patch({ code: event.target.value.toUpperCase().slice(0, 16) })
              }
              placeholder="CS 201"
              autoFocus
            />
          </Field>
          <Field label="Course name" htmlFor="subject-name" error={errors.name}>
            <Input
              id="subject-name"
              value={draft.name}
              onChange={(event) => patch({ name: event.target.value })}
              placeholder="Data Structures"
              maxLength={80}
            />
          </Field>
        </div>

        <Field
          label="Grading scheme"
          htmlFor="subject-scheme"
          error={errors.scheme_id}
          hint={
            normalized
              ? `Lecture ${normalized.lecture_weight}% · Lab ${normalized.lab_weight}% · ${normalized.scale_mappings.length} grade ranges`
              : "Create a scheme first if the list is empty."
          }
        >
          <Select
            id="subject-scheme"
            value={draft.scheme_id}
            onChange={(event) => patch({ scheme_id: event.target.value })}
          >
            <option value="">Select a grading scheme</option>
            {schemes.map((scheme) => (
              <option key={scheme.id} value={scheme.id}>
                {scheme.title}
              </option>
            ))}
          </Select>
        </Field>

        <Switch
          checked={draft.has_lab}
          onChange={(value) => patch({ has_lab: value })}
          label="This subject has a laboratory component"
          description="Lab scores will be computed separately and blended using the scheme's lab weight."
        />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Units" htmlFor="subject-units" error={errors.units}>
            <Input
              id="subject-units"
              type="number"
              min="0"
              step="0.5"
              inputMode="decimal"
              value={draft.units}
              onChange={(event) => patch({ units: event.target.value })}
            />
          </Field>
          <Field label="Semester" htmlFor="subject-semester">
            <Select
              id="subject-semester"
              value={draft.semester}
              onChange={(event) => patch({ semester: event.target.value })}
            >
              {SEMESTERS.map((semester) => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field
          label="School year"
          htmlFor="subject-year"
          hint="Optional — useful when you track more than one year."
        >
          <Input
            id="subject-year"
            value={draft.school_year}
            onChange={(event) => patch({ school_year: event.target.value })}
            placeholder="2026–2027"
            maxLength={20}
          />
        </Field>

        {selectedScheme ? (
          <div className="rounded-xl border border-line bg-surface-2/45 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
                {draft.has_lab ? (
                  <FlaskConical size={14} className="text-accent" />
                ) : (
                  <BookOpen size={14} className="text-accent" />
                )}
                {draft.has_lab ? "Lecture + Laboratory" : "Lecture only"}
              </span>
              <span className="text-faint">{selectedScheme.title}</span>
            </div>
            <div className="mt-2.5 flex h-1.5 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full bg-accent"
                style={{
                  width: draft.has_lab ? `${normalized?.lecture_weight || 0}%` : "100%",
                }}
              />
              {draft.has_lab ? (
                <div
                  className="h-full bg-accent/35"
                  style={{ width: `${normalized?.lab_weight || 0}%` }}
                />
              ) : null}
            </div>
            <div className="mt-1.5 flex justify-between text-[0.64rem] text-faint">
              <span>Lecture {draft.has_lab ? `${normalized?.lecture_weight || 0}%` : "100%"}</span>
              {draft.has_lab ? <span>Lab {normalized?.lab_weight || 0}%</span> : null}
            </div>
          </div>
        ) : null}
      </form>
    </Modal>
  );
}
