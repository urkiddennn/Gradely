import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  FlaskConical,
  Layers,
  Pencil,
  Plus,
  SlidersHorizontal,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import {
  createStarterScheme,
  normalizeScheme,
  termLabel,
} from "../lib/grading";
import { pageTitle, useSeo } from "../lib/seo";
import { formatDate, formatWeight } from "../lib/utils";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  LoadingScreen,
  PageHeader,
} from "../components/ui";
import { SchemeEditor } from "../components/SchemeEditor";

function SchemeCard({ scheme, usage, onEdit, onDelete }) {
  const normalized = normalizeScheme(scheme);
  return (
    <article className="card flex flex-col p-5 transition hover:border-line-strong hover:shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-ink">
            <SlidersHorizontal size={18} />
          </span>
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-sm font-semibold leading-snug tracking-[-0.02em] text-ink">
              {normalized?.title}
            </h2>
            <p className="mt-0.5 text-[0.66rem] text-faint">
              Created {formatDate(scheme.created_at)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => onEdit(scheme)}
            className="grid h-8 w-8 place-items-center rounded-lg text-faint transition hover:bg-surface-2 hover:text-ink"
            aria-label={`Edit ${scheme.title}`}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(scheme)}
            className="grid h-8 w-8 place-items-center rounded-lg text-faint transition hover:bg-danger-soft hover:text-danger"
            aria-label={`Delete ${scheme.title}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[0.68rem] font-semibold">
          <span className="inline-flex items-center gap-1.5 text-ink">
            <BookOpen size={12} className="text-accent" />
            Lecture {normalized?.lecture_weight}%
          </span>
          <span className="inline-flex items-center gap-1.5 text-muted">
            <FlaskConical size={12} className="text-faint" />
            Lab {normalized?.lab_weight}%
          </span>
        </div>
        <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-surface-3">
          <div
            className="h-full bg-accent"
            style={{ width: `${normalized?.lecture_weight || 0}%` }}
          />
          <div
            className="h-full bg-accent/35"
            style={{ width: `${normalized?.lab_weight || 0}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          ["Lecture", `${normalized?.lecture_components.length || 0} components`],
          ["Lab", `${normalized?.lab_components.length || 0} components`],
          ["Scale", `${normalized?.scale_mappings.length || 0} ranges`],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-line bg-surface-2/40 px-2 py-2"
          >
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.1em] text-faint">
              {label}
            </p>
            <p className="mt-0.5 truncate text-[0.64rem] font-semibold text-ink">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-faint">
          Terms
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {["prelim", "midterm", "prefinal", "final_exam"].map((key) => (
            <span key={key} className="chip !py-1 !text-[0.6rem]">
              {termLabel(key)} {formatWeight(normalized?.term_weights?.[key])}%
            </span>
          ))}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3.5">
        <span className="inline-flex items-center gap-1.5 text-[0.66rem] text-faint">
          <Layers size={12} />
          {usage === 0
            ? "Not used by any subject"
            : `Used by ${usage} subject${usage === 1 ? "" : "s"}`}
        </span>
        <button
          type="button"
          onClick={() => onEdit(scheme)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover"
        >
          Edit scheme
          <Pencil size={11} />
        </button>
      </div>
    </article>
  );
}

export default function Schemes() {
  const { schemes, subjects, createScheme, removeScheme, loading } = useData();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [creatingStarter, setCreatingStarter] = useState(false);

  useSeo({
    title: pageTitle("Grading schemes"),
    description:
      "Build custom Gradely grading schemes with lecture and lab weights, term splits, sub-components, and grade scales.",
    path: "/app/schemes",
    noindex: true,
  });

  useEffect(() => {
    if (searchParams.get("new") !== "1") return;
    setEditing(null);
    setEditorOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete("new");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const usageFor = (schemeId) =>
    subjects.filter((subject) => subject.scheme_id === schemeId).length;

  const openNew = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (scheme) => {
    setEditing(scheme);
    setEditorOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeScheme(deleteTarget.id);
      toast.success("Grading scheme deleted.");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error?.message || "Could not delete the grading scheme.");
    } finally {
      setDeleting(false);
    }
  };

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

  if (loading) return <LoadingScreen label="Loading grading schemes…" />;

  const deleteUsage = deleteTarget ? usageFor(deleteTarget.id) : 0;

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Grading system"
        title="Grading schemes"
        description="Create the exact weight structures your courses use, then apply a scheme to any subject. Change it once and every subject updates instantly."
        actions={
          <>
            {schemes.length > 0 ? (
              <Button
                variant="secondary"
                size="sm"
                icon={Sparkles}
                loading={creatingStarter}
                onClick={handleStarter}
              >
                Starter template
              </Button>
            ) : null}
            <Button size="sm" icon={Plus} onClick={openNew}>
              New scheme
            </Button>
          </>
        }
      />

      {schemes.length === 0 ? (
        <div className="space-y-5">
          <section className="relative overflow-hidden rounded-2xl border border-accent/20 bg-accent-soft/65 p-6 sm:p-8">
            <div
              className="pointer-events-none absolute inset-0 bg-grid opacity-40"
              aria-hidden="true"
            />
            <div className="relative max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-surface/70 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-accent-ink">
                <Sparkles size={11} />
                Start here
              </span>
              <h2 className="mt-3 text-xl font-semibold tracking-[-0.035em] text-ink sm:text-2xl">
                Build a scheme once. Use it everywhere.
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft/80">
                A scheme holds your lecture / lab split, the four term weights, each
                assessment component, and your grade scale. Use the standard template or
                start from a blank canvas.
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Button
                  icon={Sparkles}
                  loading={creatingStarter}
                  onClick={handleStarter}
                >
                  Use the starter template
                </Button>
                <Button variant="secondary" icon={Plus} onClick={openNew}>
                  Build from scratch
                </Button>
              </div>
            </div>
          </section>

          <EmptyState
            icon={SlidersHorizontal}
            title="No grading schemes yet"
            description="Your schemes will appear here with their lecture / lab split, term weights, components, and grade scale."
            action={
              <Button icon={Plus} onClick={openNew}>
                Create a scheme
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {schemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              usage={usageFor(scheme.id)}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {schemes.length > 0 ? (
        <div className="card flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-accent">
              <BookOpen size={16} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                Want different rules per course?
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">
                Create as many schemes as you need — one per department, college, or
                syllabus.
              </p>
            </div>
          </div>
          <Link to="/app/subjects" className="btn btn-secondary btn-sm shrink-0">
            View subjects
          </Link>
        </div>
      ) : null}

      <SchemeEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        scheme={editing}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this grading scheme?"
        confirmLabel="Delete scheme"
        description={
          deleteUsage > 0
            ? `“${deleteTarget?.title}” is used by ${deleteUsage} subject${
                deleteUsage === 1 ? "" : "s"
              }. Deleting it will leave those subjects without a scheme until you assign a new one. This cannot be undone.`
            : `“${deleteTarget?.title}” and its grade scale will be permanently deleted. This cannot be undone.`
        }
      />
    </div>
  );
}
