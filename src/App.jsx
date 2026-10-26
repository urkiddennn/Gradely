import { lazy, Suspense } from "react";
import { Link, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { ArrowLeft, Compass, LayoutDashboard } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { AppShell } from "./components/AppShell";
import { LoadingScreen, Logo } from "./components/ui";
import Landing from "./pages/Landing";
import { pageTitle, useSeo } from "./lib/seo";

const AuthPage = lazy(() => import("./pages/AuthPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Subjects = lazy(() => import("./pages/Subjects"));
const SubjectDetail = lazy(() => import("./pages/SubjectDetail"));
const Schemes = lazy(() => import("./pages/Schemes"));

function ProtectedRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen label="Loading your account…" />;
  if (!session) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/auth?mode=signin&redirect=${redirect}`} replace />;
  }
  return <Outlet />;
}

function PublicOnlyRoute() {
  const { session, loading, passwordRecovery } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen label="Loading Gradely…" />;

  const recoveryHint =
    new URLSearchParams(location.search).get("mode") === "recovery" ||
    (typeof window !== "undefined" && window.location.hash.includes("type=recovery"));

  if (session && !passwordRecovery && !recoveryHint) {
    return <Navigate to="/app" replace />;
  }
  return <Outlet />;
}

function NotFound() {
  const { session } = useAuth();
  useSeo({
    title: pageTitle("Page not found"),
    description: "The page you're looking for doesn't exist.",
    path: "/404",
    noindex: true,
  });

  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-4">
      <div className="w-full max-w-md text-center">
        <Link to="/" className="inline-flex" aria-label="Gradely home">
          <Logo size="lg" />
        </Link>
        <span className="mx-auto mt-8 grid h-12 w-12 place-items-center rounded-2xl bg-surface-2 text-faint">
          <Compass size={22} />
        </span>
        <p className="mt-4 font-display text-4xl text-accent">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-ink">
          This page took a different elective.
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          The link may be broken, or the page may have moved. Head back to somewhere
          useful.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Link to="/" className="btn btn-secondary">
            <ArrowLeft size={15} />
            Back home
          </Link>
          <Link to={session ? "/app" : "/auth?mode=signin"} className="btn btn-primary">
            <LayoutDashboard size={15} />
            {session ? "Go to dashboard" : "Sign in"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen label="Loading Gradely…" />}>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/auth" element={<AuthPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route
            path="/app"
            element={
              <DataProvider>
                <AppShell />
              </DataProvider>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="subjects/:subjectId" element={<SubjectDetail />} />
            <Route path="schemes" element={<Schemes />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
