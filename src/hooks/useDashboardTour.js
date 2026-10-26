import { useCallback, useEffect, useRef } from "react";
import { driver } from "driver.js";
import { useSearchParams } from "react-router-dom";

const TOUR_STORAGE_KEY = "gradely-dashboard-tour-v1";

function visibleElement(selector) {
  if (typeof document === "undefined") return null;
  return (
    [...document.querySelectorAll(selector)].find((element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden";
    }) || null
  );
}

function pushStep(steps, element, title, description, side = "bottom", align = "start") {
  if (!element) return;
  steps.push({
    element,
    popover: { title, description, side, align },
  });
}

function buildTourSteps() {
  const steps = [];
  const isGettingStarted = Boolean(visibleElement('[data-tour="onboarding"]'));

  pushStep(
    steps,
    visibleElement('[data-tour="welcome"]'),
    "Welcome to Gradely",
    "Here's a quick look around. It takes less than a minute, and you can close the tour at any time.",
    "bottom",
    "start",
  );

  pushStep(
    steps,
    visibleElement('[data-tour="onboarding"]'),
    "Start with a grade setup",
    "A grade setup decides how quizzes, projects, exams, and lab work count. Use the ready-made setup or build your own.",
    "bottom",
    "start",
  );

  pushStep(
    steps,
    visibleElement('[data-tour="summary"]'),
    "Your semester at a glance",
    "These cards show your overall average, semester average, course count, and anything that needs attention.",
    "bottom",
    "start",
  );

  pushStep(
    steps,
    visibleElement('[data-tour="courses"]'),
    "Your courses",
    isGettingStarted
      ? "Your courses will appear here. After you choose a grade setup, add the classes you're taking this semester."
      : "Each course gets its own card with its term, semester, and final grade. Open one to add scores or see the details.",
    "top",
    "start",
  );

  pushStep(
    steps,
    visibleElement('[data-tour="actions"]'),
    "Add and manage",
    isGettingStarted
      ? "Create a grade setup here, then add your first course when you're ready."
      : "Add a course, update your grade setup, or jump into your grading rules from here.",
    "bottom",
    "end",
  );

  pushStep(
    steps,
    visibleElement('[data-tour="recent"]'),
    "Recent scores",
    "Your latest scores show up here, so you can check what you've entered without opening every course.",
    "top",
    "start",
  );

  pushStep(
    steps,
    visibleElement('[data-tour="setup"]'),
    "Your grade setup",
    isGettingStarted
      ? "After you create a grade setup, this card shows the rules in use. You can change how activities and terms count at any time."
      : "This is the grading setup currently in use. You can change how activities and terms count at any time.",
    "top",
    "start",
  );

  const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

  if (isDesktop) {
    pushStep(
      steps,
      visibleElement('[data-tour="sidebar-nav"]'),
      "Find your way",
      "Switch between Dashboard, Courses, and Grade setups here. You can take this tour again from the menu.",
      "right",
      "center",
    );
  } else {
    pushStep(
      steps,
      visibleElement('[data-tour="mobile-menu"]'),
      "Find your way",
      "Open the menu to move between Dashboard, Courses, and Grade setups. You can take this tour again from there.",
      "bottom",
      "end",
    );
  }

  steps.push({
    popover: {
      title: "You're all set",
      description: isGettingStarted
        ? "Create a grade setup first, then add your courses and scores. You can restart this tour from the menu whenever you need it."
        : "Add a course or a score, and Gradely will handle the rest. You can restart this tour from the menu whenever you need it.",
    },
  });

  return steps;
}

export function useDashboardTour(ready) {
  const [searchParams, setSearchParams] = useSearchParams();
  const driverRef = useRef(null);
  const requested = searchParams.get("tour") === "1";

  const clearTourParam = useCallback(() => {
    if (!searchParams.has("tour")) return;
    const next = new URLSearchParams(searchParams);
    next.delete("tour");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const startTour = useCallback(() => {
    if (!ready) return;
    if (driverRef.current?.isActive()) return;

    const steps = buildTourSteps();
    if (steps.length === 0) return;

    const isDark = document.documentElement.classList.contains("dark");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rememberTour = () => {
      try {
        window.localStorage.setItem(TOUR_STORAGE_KEY, "1");
      } catch {
        /* localStorage can be unavailable in private browsing */
      }
    };

    const tour = driver({
      animate: !reduceMotion,
      duration: 280,
      overlayColor: isDark ? "rgba(0, 0, 0, 0.72)" : "rgba(12, 13, 11, 0.48)",
      stagePadding: 8,
      stageRadius: 16,
      popoverOffset: 12,
      popoverClass: "gradely-tour",
      showProgress: true,
      progressText: "{{current}} of {{total}}",
      showButtons: ["next", "previous", "close"],
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Got it",
      closeBtnLabel: "Close tour",
      overlayClickBehavior: "none",
      disableActiveInteraction: true,
      skipMissingElement: true,
      smoothScroll: true,
      allowClose: true,
      allowKeyboardControl: true,
      steps,
      onCloseClick: () => {
        rememberTour();
        clearTourParam();
        driverRef.current?.destroy();
      },
      onDestroyed: (element, step, options) => {
        driverRef.current = null;
        if (options?.reason === "api") return;
        rememberTour();
        clearTourParam();
      },
    });

    driverRef.current = tour;
    tour.drive();
  }, [clearTourParam, ready]);

  useEffect(() => {
    if (!ready) return undefined;

    let hasSeenTour = false;
    try {
      hasSeenTour = window.localStorage.getItem(TOUR_STORAGE_KEY) === "1";
    } catch {
      /* no-op */
    }

    if (!requested && hasSeenTour) return undefined;

    const timer = window.setTimeout(() => startTour(), requested ? 500 : 900);
    return () => window.clearTimeout(timer);
  }, [ready, requested, startTour]);

  useEffect(
    () => () => {
      if (driverRef.current?.isActive()) driverRef.current.destroy();
    },
    [],
  );

  return startTour;
}
