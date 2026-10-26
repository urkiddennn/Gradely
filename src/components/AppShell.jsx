import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  BookOpen,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  RefreshCw,
  SlidersHorizontal,
  Sun,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { cn, displayName } from "../lib/utils";
import { Avatar, Button, Logo } from "./ui";
import { SetupScreen } from "./SetupScreen";

const NAV_ITEMS = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/subjects", label: "Courses", icon: BookOpen },
  { to: "/app/schemes", label: "Grade setups", icon: SlidersHorizontal },
];

function ThemeButton({ compact = false }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "flex items-center gap-2.5 rounded-xl text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink",
        compact ? "h-9 w-9 justify-center" : "w-full px-3 py-2.5",
      )}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      {!compact ? <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span> : null}
    </button>
  );
}

function SidebarNav({ subjectsCount, schemesCount, onNavigate }) {
  return (
    <nav className="flex-1 space-y-1 px-3" onClick={onNavigate}>
      <p className="px-3 pb-2 pt-4 text-[0.63rem] font-bold uppercase tracking-[0.16em] text-faint">
        Menu
      </p>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              isActive
                ? "bg-accent-soft text-accent-ink"
                : "text-muted hover:bg-surface-2 hover:text-ink",
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon
                size={17}
                className={cn(
                  "shrink-0 transition",
                  isActive ? "text-accent" : "text-faint group-hover:text-muted",
                )}
              />
              <span className="flex-1">{item.label}</span>
              {item.to === "/app/subjects" && subjectsCount > 0 ? (
                <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[0.63rem] font-semibold text-faint">
                  {subjectsCount}
                </span>
              ) : null}
              {item.to === "/app/schemes" && schemesCount > 0 ? (
                <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[0.63rem] font-semibold text-faint">
                  {schemesCount}
                </span>
              ) : null}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function UserCard({ onSignOut }) {
  const { user } = useAuth();
  const name = displayName(user);
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-2.5 py-2">
      <Avatar name={name} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-ink">{name}</p>
        <p className="truncate text-[0.68rem] text-faint">{user?.email}</p>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="rounded-lg p-1.5 text-faint transition hover:bg-surface-2 hover:text-danger"
        aria-label="Sign out"
        title="Sign out"
      >
        <LogOut size={15} />
      </button>
    </div>
  );
}

export function AppShell() {
  const { user, signOut } = useAuth();
  const { subjects, schemes, schemaMissing, error, refresh, loading } = useData();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const mainRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      navigate("/", { replace: true });
    } catch {
      toast.error("Could not sign out. Please try again.");
      setSigningOut(false);
    }
  };

  const isHardError = error && !schemaMissing && schemes.length === 0;

  return (
    <div className="min-h-dvh bg-canvas">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink focus:shadow-card"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-line bg-surface/70 backdrop-blur-xl lg:flex">
        <div className="flex h-20 items-center px-6">
          <Link to="/app" aria-label="Gradely dashboard">
            <Logo />
          </Link>
        </div>

        <SidebarNav
          subjectsCount={subjects.length}
          schemesCount={schemes.length}
          onNavigate={() => {}}
        />

        <div className="space-y-2 border-t border-line p-3">
          {schemaMissing ? (
            <div className="flex items-center gap-2 rounded-xl border border-warning/25 bg-warning-soft px-3 py-2 text-[0.7rem] font-semibold text-warning">
              <AlertCircle size={14} />
              Finish setup
            </div>
          ) : null}
          <ThemeButton />
          <UserCard onSignOut={handleSignOut} />
          <p className="px-1 pt-1 text-center text-[0.62rem] text-faint">
            Gradely · Built for students
          </p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-canvas/85 px-4 backdrop-blur-xl lg:hidden">
        <Link to="/app" aria-label="Gradely dashboard">
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-1">
          <ThemeButton compact />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-xl text-ink transition hover:bg-surface-2"
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-black/45 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex h-full w-[86%] max-w-[300px] animate-slide-in flex-col border-r border-line bg-surface shadow-card">
            <div className="flex h-16 items-center justify-between px-5">
              <Logo size="sm" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-ink"
                aria-label="Close navigation"
              >
                <X size={19} />
              </button>
            </div>
            <SidebarNav
              subjectsCount={subjects.length}
              schemesCount={schemes.length}
              onNavigate={() => setMobileOpen(false)}
            />
            <div className="space-y-2 border-t border-line p-3">
              <UserCard onSignOut={handleSignOut} />
              <p className="pb-1 text-center text-[0.62rem] text-faint">
                Gradely · Built for students
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="lg:pl-[248px]">
        <main
          ref={mainRef}
          id="main-content"
          className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10"
        >
          {schemaMissing ? (
            <SetupScreen />
          ) : isHardError ? (
            <div className="card mx-auto mt-12 max-w-lg p-7 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-danger-soft text-danger">
                <AlertCircle size={22} />
              </span>
              <h1 className="mt-4 text-xl font-semibold text-ink">We couldn't load your data</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {error?.message || "Something interrupted the connection to Supabase."}
              </p>
              <div className="mt-5 flex justify-center gap-2">
                <Button icon={RefreshCw} onClick={() => refresh()} loading={loading}>
                  Try again
                </Button>
                <Button variant="secondary" onClick={handleSignOut} loading={signingOut}>
                  Sign out
                </Button>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      {signingOut ? (
        <div className="fixed inset-0 z-[130] grid place-items-center bg-canvas/70 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-muted shadow-card">
            <ChevronRight size={15} className="text-accent" />
            Signing out…
          </div>
        </div>
      ) : null}
    </div>
  );
}
