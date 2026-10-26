import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  Check,
  FileText,
  Loader2,
  X,
} from "lucide-react";
import { cn, getInitialsColor, initials } from "../lib/utils";
import { statusFor } from "../lib/grading";

/* ------------------------------------------------------------------ */
/* Brand                                                               */
/* ------------------------------------------------------------------ */

export function Logo({ className, markClassName, wordmark = true, size = "md" }) {
  const markSize = {
    sm: "h-8 w-8 rounded-[9px]",
    md: "h-9 w-9 rounded-[11px]",
    lg: "h-11 w-11 rounded-[13px]",
  }[size];
  const iconSize = {
    sm: "h-4 w-4",
    md: "h-[18px] w-[18px]",
    lg: "h-5 w-5",
  }[size];
  const textSize = {
    sm: "text-[0.98rem]",
    md: "text-[1.08rem]",
    lg: "text-xl",
  }[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid shrink-0 place-items-center bg-accent text-on-accent shadow-sm",
          markSize,
          markClassName,
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className={iconSize}>
          <rect x="2.5" y="11" width="3.6" height="6.4" rx="1.8" opacity="0.62" />
          <rect x="8.2" y="7.2" width="3.6" height="10.2" rx="1.8" opacity="0.82" />
          <rect x="13.9" y="2.6" width="3.6" height="14.8" rx="1.8" />
        </svg>
      </span>
      {wordmark ? (
        <span className={cn("font-semibold tracking-[-0.045em] text-ink", textSize)}>
          Gradely
        </span>
      ) : null}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

const BUTTON_VARIANTS = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

const BUTTON_SIZES = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
  icon: "btn-icon",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  children,
  disabled,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={cn("btn", BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
      ) : Icon ? (
        <Icon size={16} aria-hidden="true" />
      ) : null}
      {children}
      {IconRight && !loading ? <IconRight size={16} aria-hidden="true" /> : null}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Form primitives                                                     */
/* ------------------------------------------------------------------ */

export function Field({ label, htmlFor, hint, error, children, className }) {
  return (
    <div className={className}>
      {label ? (
        <label htmlFor={htmlFor} className="label">
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs leading-relaxed text-faint">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ className, ...props }) {
  return <input className={cn("field", className)} {...props} />;
}

export function Select({ className, children, ...props }) {
  return (
    <select className={cn("field pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }) {
  return <textarea className={cn("field min-h-24 resize-y", className)} {...props} />;
}

export function Switch({ checked, onChange, label, description, id }) {
  const generatedId = useId();
  const switchId = id || generatedId;
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-line bg-surface-2/50 px-3.5 py-3">
      <div className="min-w-0">
        <label htmlFor={switchId} className="block cursor-pointer text-sm font-semibold text-ink">
          {label}
        </label>
        {description ? (
          <p className="mt-0.5 text-xs leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        id={switchId}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors",
          checked ? "border-accent bg-accent" : "border-line-strong bg-surface-3",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 grid h-[18px] w-[18px] place-items-center rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        >
          {checked ? <Check size={11} className="text-accent-ink" strokeWidth={3} /> : null}
        </span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Feedback                                                            */
/* ------------------------------------------------------------------ */

const TONE_CLASSES = {
  positive: "border-positive/25 bg-positive-soft text-positive",
  warning: "border-warning/25 bg-warning-soft text-warning",
  danger: "border-danger/25 bg-danger-soft text-danger",
  accent: "border-accent/25 bg-accent-soft text-accent-ink",
  neutral: "border-line bg-surface-2 text-muted",
};

export function Badge({ tone = "neutral", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold leading-none",
        TONE_CLASSES[tone] || TONE_CLASSES.neutral,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ percentage, status, className }) {
  const resolved = status || statusFor(percentage);
  const dot = {
    positive: "bg-positive",
    warning: "bg-warning",
    danger: "bg-danger",
    neutral: "bg-faint",
  }[resolved.tone];
  return (
    <Badge tone={resolved.tone} className={className}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} aria-hidden="true" />
      {resolved.label}
    </Badge>
  );
}

export function ProgressBar({ value, tone = "accent", className, height = "h-1.5" }) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  const colors = {
    accent: "bg-accent",
    positive: "bg-positive",
    warning: "bg-warning",
    danger: "bg-danger",
    neutral: "bg-faint",
  };
  return (
    <div
      className={cn("w-full overflow-hidden rounded-full bg-surface-3", height, className)}
      role="progressbar"
      aria-valuenow={Math.round(safe)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", colors[tone])}
        style={{ width: `${safe}%` }}
      />
    </div>
  );
}

export function ProgressRing({
  value,
  size = 72,
  stroke = 6,
  children,
  className,
  tone = "accent",
}) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safe / 100) * circumference;
  const tones = {
    accent: "text-accent",
    positive: "text-positive",
    warning: "text-warning",
    danger: "text-danger",
    neutral: "text-faint",
  };
  return (
    <div
      className={cn("relative shrink-0", tones[tone], className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--line)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        {children ?? (
          <span className="text-xs font-bold text-ink">
            {value == null ? "—" : `${Math.round(safe)}%`}
          </span>
        )}
      </div>
    </div>
  );
}

export function Spinner({ className, size = 18 }) {
  return <Loader2 size={size} className={cn("animate-spin text-accent", className)} />;
}

export function LoadingScreen({ label = "Loading your dashboard…" }) {
  return (
    <div className="grid min-h-[60vh] place-items-center px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <Logo size="lg" />
        <div className="flex items-center gap-2 text-sm text-muted">
          <Spinner size={16} />
          {label}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon = FileText, title, description, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-surface-2/35 px-6 py-12 text-center",
        className,
      )}
    >
      <span className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-accent-soft text-accent-ink">
        <Icon size={20} />
      </span>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Avatar({ name, size = "md", className }) {
  const sizes = {
    sm: "h-8 w-8 text-[0.65rem]",
    md: "h-9 w-9 text-xs",
    lg: "h-11 w-11 text-sm",
  }[size];
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-bold",
        sizes,
        getInitialsColor(name),
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

export function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-faint">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-[-0.04em] text-ink sm:text-[1.75rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

const MODAL_SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  "2xl": "max-w-3xl",
  "4xl": "max-w-4xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "lg",
  closeOnBackdrop = true,
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 animate-fade-in bg-black/45 backdrop-blur-[2px]"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative flex max-h-[92dvh] w-full animate-scale-in flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-card sm:max-h-[88dvh] sm:rounded-3xl",
          MODAL_SIZES[size] || MODAL_SIZES.lg,
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold tracking-[-0.03em] text-ink">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-0.5 rounded-full p-1.5 text-muted transition hover:bg-surface-2 hover:text-ink"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer ? (
          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-line bg-surface-2/40 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Delete",
  loading = false,
  tone = "danger",
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3.5">
        <span
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-full",
            tone === "danger" ? "bg-danger-soft text-danger" : "bg-accent-soft text-accent",
          )}
        >
          <AlertTriangle size={18} />
        </span>
        <p className="pt-1 text-sm leading-relaxed text-muted">{description}</p>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Decorative                                                          */
/* ------------------------------------------------------------------ */

export function MiniSparkline({ values = [], className }) {
  if (!values.length) return null;
  const width = 120;
  const height = 32;
  const max = Math.max(...values, 100);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  });
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("text-accent", className)}
      fill="none"
      aria-hidden="true"
    >
      <polyline
        points={points.join(" ")}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
