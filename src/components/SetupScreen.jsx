import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardCopy,
  Database,
  Download,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import setupSql from "../../supabase/migrations/0001_init.sql?raw";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { Button, Logo } from "./ui";

function getProjectRef() {
  try {
    return new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split(".")[0];
  } catch {
    return "";
  }
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function SetupScreen() {
  const { refresh, error } = useData();
  const toast = useToast();
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const projectRef = useMemo(getProjectRef, []);
  const sqlEditorUrl = projectRef
    ? `https://supabase.com/dashboard/project/${projectRef}/sql/new`
    : "https://supabase.com/dashboard";

  const lineCount = useMemo(() => setupSql.split("\n").length, []);

  const handleCopy = async () => {
    try {
      await copyText(setupSql);
      setCopied(true);
      toast.success("SQL copied. Paste it into the Supabase SQL Editor.");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Couldn't copy automatically. Select the SQL and copy it manually.");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([setupSql], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "gradely-schema.sql";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    toast.success("Schema file downloaded.");
  };

  const handleCheck = async () => {
    setChecking(true);
    try {
      await refresh();
      toast.info("Checked again. If you still see this screen, run the SQL first.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <div className="mb-6 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-faint">
        <Logo size="sm" wordmark={false} />
        One-time setup
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-line bg-surface-2/40 px-6 py-7 sm:px-8">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent-ink">
            <Database size={22} />
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-ink sm:text-3xl">
            Connect your database
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Your Gradely account is ready. Run the Gradely schema once in Supabase to
            create the tables for grade setups, courses, and scores — then everything
            works instantly.
          </p>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <ol className="space-y-5">
            <li className="flex gap-3.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-bold text-accent-ink">
                1
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-ink">Open the SQL Editor</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Open your Supabase project, then go to the SQL Editor. Use the button
                  below to jump straight there.
                </p>
                <a
                  href={sqlEditorUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-hover"
                >
                  Open Supabase SQL Editor
                  <ExternalLink size={14} />
                </a>
              </div>
            </li>

            <li className="flex gap-3.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-bold text-accent-ink">
                2
              </span>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold text-ink">Run the Gradely schema</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Copy or download the SQL below, paste it into a new query, and press{" "}
                  <span className="font-semibold text-ink">Run</span>. It is safe to run
                  more than once.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    icon={copied ? CheckCircle2 : ClipboardCopy}
                    onClick={handleCopy}
                  >
                    {copied ? "Copied" : "Copy SQL"}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={Download}
                    onClick={handleDownload}
                  >
                    Download .sql
                  </Button>
                </div>
              </div>
            </li>

            <li className="flex gap-3.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-bold text-accent-ink">
                3
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-ink">Come back and check</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Once the query succeeds, check the connection again. Your dashboard
                  appears as soon as the tables are visible.
                </p>
                <Button
                  className="mt-3"
                  size="sm"
                  variant="secondary"
                  icon={RefreshCw}
                  loading={checking}
                  onClick={handleCheck}
                >
                  Check again
                </Button>
              </div>
            </li>
          </ol>

          <details className="group mt-6 rounded-xl border border-line bg-surface-2/40">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-xs font-semibold text-ink-soft">
              <span className="inline-flex items-center gap-2">
                <Terminal size={15} className="text-accent" />
                View the schema ({lineCount} lines)
              </span>
              <span className="text-faint transition group-open:rotate-180">⌄</span>
            </summary>
            <div className="border-t border-line p-3">
              <pre className="max-h-64 overflow-auto rounded-lg bg-[#101210] p-4 text-[0.68rem] leading-relaxed text-[#c9e7dc]">
                <code>{setupSql}</code>
              </pre>
            </div>
          </details>

          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-positive/20 bg-positive-soft px-4 py-3">
            <ShieldCheck size={17} className="mt-0.5 shrink-0 text-positive" />
            <p className="text-xs leading-relaxed text-positive">
              Your data stays private. Each student can only see their own courses,
              scores, and grade setups.
            </p>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl border border-line bg-surface-2 px-4 py-3 font-mono text-[0.68rem] leading-relaxed text-faint">
              {error.code ? `${error.code}: ` : ""}
              {error.message}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
