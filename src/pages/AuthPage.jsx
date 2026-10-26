import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
  UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { friendlyAuthError } from "../lib/supabase";
import { isEmail, cn } from "../lib/utils";
import { pageTitle, useSeo } from "../lib/seo";
import { Button, Logo, Spinner } from "../components/ui";

const MODE_COPY = {
  signin: {
    title: "Welcome back",
    subtitle: "Sign in to pick up where your semester left off.",
    submit: "Sign in",
  },
  signup: {
    title: "Create your account",
    subtitle: "Set up a free Gradely account in under a minute.",
    submit: "Create account",
  },
  forgot: {
    title: "Reset your password",
    subtitle: "Enter your email and we'll send you a secure reset link.",
    submit: "Send reset link",
  },
  recovery: {
    title: "Set a new password",
    subtitle: "Choose a new password for your Gradely account.",
    submit: "Update password",
  },
};

function safeRedirect(value) {
  if (!value) return "/app";
  if (!value.startsWith("/") || value.startsWith("//")) return "/app";
  return value;
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-muted transition hover:text-ink"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function AuthInput({ icon: Icon, id, label, error, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="relative">
        <Icon
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
        />
        <input
          id={id}
          className={cn("field pl-9", props.className)}
          aria-invalid={Boolean(error)}
          {...props}
        />
      </div>
      {error ? <p className="mt-1.5 text-xs font-medium text-danger">{error}</p> : null}
    </div>
  );
}

function PasswordField({ id, label, value, onChange, error, autoComplete, placeholder }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="relative">
        <LockKeyhole
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
        />
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={cn("field pl-9 pr-10", error && "border-danger")}
          aria-invalid={Boolean(error)}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-faint transition hover:bg-surface-2 hover:text-ink"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error ? <p className="mt-1.5 text-xs font-medium text-danger">{error}</p> : null}
    </div>
  );
}

function AuthSidePanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-[#0d2720] p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
      <div
        className="absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #f2f7f4 1px, transparent 1px), linear-gradient(to bottom, #f2f7f4 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute -right-28 top-10 h-80 w-80 rounded-full bg-[#55c2a2]/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[#e8c98f]/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <Logo wordmark={false} />
          <span className="text-lg font-semibold tracking-[-0.045em] text-[#f2f7f4]">
            Gradely
          </span>
        </Link>
      </div>

      <div className="relative mt-14 max-w-md">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.14em] text-[#9fd8c6]">
          A simpler semester
        </span>
        <h2 className="mt-5 text-[2.4rem] font-semibold leading-[1.04] tracking-[-0.045em] text-[#f2f7f4]">
          Every score in one place.
          <br />
          <span className="font-display font-normal italic text-[#9fd8c6]">
            So you're never left guessing.
          </span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-[#bcd4cc]">
          Keep your scores together and see how each course is going at any point in the
          semester.
        </p>

        <ul className="mt-7 space-y-3">
          {[
            "Quizzes, projects, exams, and lab work in one place",
            "Term and semester grades update as you go",
            "Your overall average stays up to date",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-[#d9e8e3]">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#55c2a2]/15 text-[#9fd8c6]">
                <Check size={12} strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-9 rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[#7fae9f]">
                Overall average
              </p>
              <p className="mt-1 font-display text-3xl leading-none text-[#f2f7f4]">1.63</p>
            </div>
            <span className="rounded-full border border-[#55c2a2]/25 bg-[#55c2a2]/10 px-2.5 py-1 text-[0.62rem] font-semibold text-[#9fd8c6]">
              Excellent
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {[
              ["Data Structures", "1.50"],
              ["Discrete Mathematics", "1.75"],
              ["Technical Writing", "1.25"],
            ].map(([name, grade]) => (
              <div key={name} className="flex items-center justify-between text-[0.7rem]">
                <span className="text-[#bcd4cc]">{name}</span>
                <span className="font-semibold text-[#f2f7f4]">{grade}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mt-10 flex items-center gap-2 text-[0.68rem] text-[#7fae9f]">
        <ShieldCheck size={14} />
        Private by default. Only you can see your grades.
      </div>
    </aside>
  );
}

export default function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const {
    session,
    loading,
    passwordRecovery,
    signIn,
    signUp,
    resetPassword,
    updatePassword,
    setPasswordRecovery,
  } = useAuth();

  const queryMode = searchParams.get("mode") || "signin";
  const recoveryMode =
    passwordRecovery ||
    queryMode === "recovery" ||
    (typeof window !== "undefined" && window.location.hash.includes("type=recovery"));
  const mode = recoveryMode ? "recovery" : MODE_COPY[queryMode] ? queryMode : "signin";
  const copy = MODE_COPY[mode];
  const redirectTo = useMemo(() => safeRedirect(searchParams.get("redirect")), [searchParams]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  useSeo({
    title: pageTitle(mode === "signup" ? "Create account" : mode === "forgot" ? "Reset password" : "Sign in"),
    description:
      "Sign in to Gradely to keep your scores, courses, and grades together in one simple place.",
    path: "/auth",
    noindex: true,
  });

  useEffect(() => {
    setError("");
    setSuccess(null);
  }, [mode]);

  const updateMode = (nextMode) => {
    const params = new URLSearchParams();
    params.set("mode", nextMode);
    if (searchParams.get("redirect")) params.set("redirect", searchParams.get("redirect"));
    setSearchParams(params, { replace: true });
    setPassword("");
    setConfirmPassword("");
  };

  const validate = () => {
    if (mode === "signup" && fullName.trim().length < 2) {
      return "Enter your full name so we can personalize your dashboard.";
    }
    if (!isEmail(email)) return "Enter a valid email address.";
    if (mode !== "forgot") {
      if (password.length < 8) return "Use a password with at least 8 characters.";
      if (mode !== "signin" && password !== confirmPassword) {
        return "The two passwords don't match.";
      }
    }
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signin") {
        const { error: authError } = await signIn(email.trim(), password);
        if (authError) throw authError;
        toast.success("Welcome back to Gradely.");
        navigate(redirectTo, { replace: true });
        return;
      }

      if (mode === "signup") {
        const { data, error: authError } = await signUp(
          email.trim(),
          password,
          fullName.trim(),
        );
        if (authError) throw authError;
        if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          setError("An account with this email may already exist. Try signing in instead.");
          return;
        }
        if (data?.session) {
          toast.success("Your Gradely account is ready.");
          navigate("/app", { replace: true });
          return;
        }
        setSuccess({
          title: "Check your inbox",
          message: `We sent a confirmation link to ${email.trim()}. Open it to activate your account, then sign in.`,
        });
        return;
      }

      if (mode === "forgot") {
        const { error: authError } = await resetPassword(email.trim());
        if (authError) throw authError;
        setSuccess({
          title: "Reset link sent",
          message: `If an account exists for ${email.trim()}, a password reset link is on its way. Check your spam folder too.`,
        });
        return;
      }

      if (mode === "recovery") {
        if (!session) {
          setError("Your reset link is invalid or has expired. Request a new one below.");
          return;
        }
        const { error: authError } = await updatePassword(password);
        if (authError) throw authError;
        toast.success("Password updated. You're signed in.");
        setPasswordRecovery(false);
        navigate("/app", { replace: true });
      }
    } catch (authError) {
      setError(friendlyAuthError(authError));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center bg-canvas">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" />
          <Spinner />
        </div>
      </div>
    );
  }

  const isSuccessOnly = Boolean(success);
  const recoveryWithoutSession = mode === "recovery" && !session;

  return (
    <div className="grid min-h-dvh bg-canvas lg:grid-cols-[1.02fr_0.98fr]">
      <AuthSidePanel />

      <main className="flex min-h-dvh flex-col">
        <div className="flex items-center justify-between px-4 py-4 sm:px-8 lg:px-10">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-ink"
          >
            <ArrowLeft size={15} />
            Back home
          </Link>
          <div className="flex items-center gap-2">
            <span className="lg:hidden">
              <Link to="/" aria-label="Gradely home">
                <Logo size="sm" />
              </Link>
            </span>
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-12 pt-4 sm:px-8">
          <div className="w-full max-w-[400px] animate-fade-up">
            <div className="mb-7">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-soft text-accent-ink">
                {mode === "signup" ? (
                  <GraduationCap size={20} />
                ) : mode === "forgot" || mode === "recovery" ? (
                  <LockKeyhole size={19} />
                ) : (
                  <BookOpen size={19} />
                )}
              </span>
              <h1 className="mt-4 text-[1.8rem] font-semibold tracking-[-0.045em] text-ink">
                {copy.title}
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{copy.subtitle}</p>
            </div>

            {error ? (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-danger/25 bg-danger-soft px-4 py-3 text-sm leading-relaxed text-danger"
              >
                {error}
              </div>
            ) : null}

            {isSuccessOnly ? (
              <div className="rounded-2xl border border-positive/25 bg-positive-soft p-5">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-surface/60 text-positive">
                  <Check size={19} strokeWidth={3} />
                </span>
                <h2 className="mt-3 text-base font-semibold text-positive">{success.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-positive/85">
                  {success.message}
                </p>
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => {
                    setSuccess(null);
                    updateMode("signin");
                  }}
                >
                  Go to sign in
                  <ArrowRight size={15} />
                </Button>
              </div>
            ) : recoveryWithoutSession ? (
              <div className="rounded-2xl border border-warning/25 bg-warning-soft p-5">
                <h2 className="text-base font-semibold text-warning">
                  This reset link has expired
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-warning/85">
                  Request a fresh password reset email and open the newest link in your
                  inbox.
                </p>
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => updateMode("forgot")}
                >
                  Request a new link
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {mode === "signup" ? (
                  <div>
                    <label htmlFor="full-name" className="label">
                      Full name
                    </label>
                    <div className="relative">
                      <UserRound
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
                      />
                      <input
                        id="full-name"
                        className="field pl-9"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        autoComplete="name"
                        placeholder="Alex Santos"
                        autoFocus
                      />
                    </div>
                  </div>
                ) : (
                  <AuthInput
                    icon={Mail}
                    id="email"
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    placeholder="you@university.edu"
                    autoFocus
                  />
                )}

                {mode === "signup" ? (
                  <AuthInput
                    icon={Mail}
                    id="email"
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    placeholder="you@university.edu"
                  />
                ) : null}

                {mode !== "forgot" ? (
                  <PasswordField
                    id="password"
                    label={mode === "recovery" ? "New password" : "Password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    placeholder={mode === "signin" ? "Your password" : "At least 8 characters"}
                  />
                ) : null}

                {mode === "signup" || mode === "recovery" ? (
                  <PasswordField
                    id="confirm-password"
                    label="Confirm password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                  />
                ) : null}

                {mode === "signin" ? (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => updateMode("forgot")}
                      className="text-xs font-semibold text-muted transition hover:text-accent"
                    >
                      Forgot password?
                    </button>
                  </div>
                ) : null}

                {mode === "forgot" ? (
                  <button
                    type="button"
                    onClick={() => updateMode("signin")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition hover:text-accent"
                  >
                    <ArrowLeft size={13} />
                    Back to sign in
                  </button>
                ) : null}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={submitting}
                  iconRight={mode === "signup" ? ArrowRight : undefined}
                >
                  {copy.submit}
                </Button>

                {mode === "signup" ? (
                  <p className="text-center text-[0.7rem] leading-relaxed text-faint">
                    By creating an account, you agree to keep your login details private.
                    Gradely stores only the academic data you enter.
                  </p>
                ) : null}
              </form>
            )}

            {!isSuccessOnly ? (
              <div className="mt-7 border-t border-line pt-5 text-center text-sm text-muted">
                {mode === "signin" ? (
                  <>
                    New to Gradely?{" "}
                    <button
                      type="button"
                      onClick={() => updateMode("signup")}
                      className="font-semibold text-accent transition hover:text-accent-hover"
                    >
                      Create an account
                    </button>
                  </>
                ) : mode === "signup" ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => updateMode("signin")}
                      className="font-semibold text-accent transition hover:text-accent-hover"
                    >
                      Sign in
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => updateMode("signin")}
                    className="font-semibold text-accent transition hover:text-accent-hover"
                  >
                    Back to sign in
                  </button>
                )}
              </div>
            ) : null}

            <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[0.68rem] text-faint">
              <ShieldCheck size={13} />
              Private by default · Only you can see your grades
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
