import { clamp, sum, toNumber } from "./utils";

export const TERMS = [
  { key: "prelim", label: "Prelim", short: "Prelim" },
  { key: "midterm", label: "Midterm", short: "Midterm" },
  { key: "prefinal", label: "Pre-Final", short: "Pre-Final" },
  { key: "final_exam", label: "Final Exam", short: "Finals" },
];

export const TERM_KEYS = TERMS.map((term) => term.key);

export const DEFAULT_TERM_WEIGHTS = {
  prelim: 25,
  midterm: 25,
  prefinal: 25,
  final_exam: 25,
};

export const DEFAULT_LECTURE_COMPONENTS = [
  { id: "lec_quiz", name: "Quizzes", weight: 20 },
  { id: "lec_assignment", name: "Assignments", weight: 20 },
  { id: "lec_project", name: "Projects", weight: 20 },
  { id: "lec_exam", name: "Exams", weight: 40 },
];

export const DEFAULT_LAB_COMPONENTS = [
  { id: "lab_attendance", name: "Attendance", weight: 10 },
  { id: "lab_report", name: "Lab Reports", weight: 40 },
  { id: "lab_practical", name: "Practical Exam", weight: 50 },
];

export const DEFAULT_SCALE = [
  { min_percentage: 97, max_percentage: 100, grade_point: 1.0, remarks: "Excellent" },
  { min_percentage: 94, max_percentage: 96.99, grade_point: 1.25, remarks: "Excellent" },
  { min_percentage: 91, max_percentage: 93.99, grade_point: 1.5, remarks: "Very Good" },
  { min_percentage: 88, max_percentage: 90.99, grade_point: 1.75, remarks: "Very Good" },
  { min_percentage: 85, max_percentage: 87.99, grade_point: 2.0, remarks: "Good" },
  { min_percentage: 82, max_percentage: 84.99, grade_point: 2.25, remarks: "Good" },
  { min_percentage: 79, max_percentage: 81.99, grade_point: 2.5, remarks: "Satisfactory" },
  { min_percentage: 76, max_percentage: 78.99, grade_point: 2.75, remarks: "Fair" },
  { min_percentage: 75, max_percentage: 75.99, grade_point: 3.0, remarks: "Pass" },
  { min_percentage: 0, max_percentage: 74.99, grade_point: 5.0, remarks: "Failed" },
];

export function parseJson(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === "object") return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export function normalizeComponents(value, fallback) {
  const source = parseJson(value, null);
  const list = Array.isArray(source) && source.length > 0 ? source : fallback;
  return list
    .map((component, index) => ({
      id: String(component?.id || `component_${index + 1}`),
      name: String(component?.name || "Untitled component"),
      weight: toNumber(component?.weight, 0),
    }))
    .filter((component) => component.weight >= 0);
}

export function normalizeScheme(scheme) {
  if (!scheme) return null;
  const termWeights = {
    ...DEFAULT_TERM_WEIGHTS,
    ...parseJson(scheme.term_weights, {}),
  };
  return {
    ...scheme,
    lecture_weight: toNumber(scheme.lecture_weight, 60),
    lab_weight: toNumber(scheme.lab_weight, 40),
    term_weights: termWeights,
    lecture_components: normalizeComponents(
      scheme.lecture_components,
      DEFAULT_LECTURE_COMPONENTS,
    ),
    lab_components: normalizeComponents(scheme.lab_components, DEFAULT_LAB_COMPONENTS),
    scale_mappings: Array.isArray(scheme.scale_mappings)
      ? [...scheme.scale_mappings].sort(
          (a, b) => toNumber(b.min_percentage) - toNumber(a.min_percentage),
        )
      : [],
  };
}

export function sortedScaleMappings(scheme) {
  const list = Array.isArray(scheme?.scale_mappings) ? scheme.scale_mappings : [];
  return [...list]
    .filter((mapping) => mapping)
    .sort(
      (a, b) =>
        toNumber(b.min_percentage) - toNumber(a.min_percentage) ||
        toNumber(b.max_percentage) - toNumber(a.max_percentage),
    );
}

export function gradeFromScale(scheme, percentage) {
  if (percentage == null || Number.isNaN(Number(percentage))) {
    return { mapping: null, gradePoint: null, remarks: null };
  }
  const mapping = sortedScaleMappings(scheme).find(
    (row) =>
      Number(percentage) >= toNumber(row.min_percentage) - 0.0001 &&
      Number(percentage) <= toNumber(row.max_percentage) + 0.0001,
  );
  return {
    mapping: mapping || null,
    gradePoint: mapping ? toNumber(mapping.grade_point, 0) : null,
    remarks: mapping?.remarks || null,
  };
}

export function statusFor(percentage) {
  if (percentage == null || Number.isNaN(Number(percentage))) {
    return { label: "No data", tone: "neutral" };
  }
  if (Number(percentage) >= 80) return { label: "Pass", tone: "positive" };
  if (Number(percentage) >= 75) return { label: "Fair", tone: "warning" };
  return { label: "Needs improvement", tone: "danger" };
}

export function componentStats(components = [], entries = []) {
  const rows = components.map((component) => {
    const matched = entries.filter((entry) => entry.category === component.id);
    const score = sum(matched.map((entry) => entry.score));
    const max = sum(matched.map((entry) => entry.max_score));
    const percentage = max > 0 ? clamp((score / max) * 100) : null;
    return {
      ...component,
      weight: toNumber(component.weight),
      entries: matched,
      entryCount: matched.length,
      score,
      max,
      percentage,
    };
  });

  const active = rows.filter((row) => row.percentage != null && row.weight > 0);
  const activeWeight = sum(active.map((row) => row.weight));
  const percentage =
    activeWeight > 0
      ? active.reduce((total, row) => total + row.percentage * row.weight, 0) / activeWeight
      : null;

  return {
    rows,
    percentage,
    activeWeight,
    totalWeight: sum(rows.map((row) => row.weight)),
    completed: active.length,
    total: rows.length,
  };
}

export function termBreakdown(subject, scheme, entries = [], termKey) {
  const normalized = normalizeScheme(scheme);
  const termEntries = entries.filter((entry) => entry.term === termKey);
  const lecture = componentStats(normalized?.lecture_components || [], termEntries);
  const lab = componentStats(normalized?.lab_components || [], termEntries);

  let percentage = null;
  let lectureContribution = null;
  let labContribution = null;
  let basisWeight = 0;

  if (subject?.has_lab) {
    const parts = [];
    if (lecture.percentage != null) {
      parts.push({
        percentage: lecture.percentage,
        weight: toNumber(normalized?.lecture_weight, 60),
      });
    }
    if (lab.percentage != null) {
      parts.push({
        percentage: lab.percentage,
        weight: toNumber(normalized?.lab_weight, 40),
      });
    }
    basisWeight = sum(parts.map((part) => part.weight));
    if (basisWeight > 0) {
      percentage =
        parts.reduce((total, part) => total + part.percentage * part.weight, 0) /
        basisWeight;
      lectureContribution =
        lecture.percentage != null
          ? (lecture.percentage * toNumber(normalized?.lecture_weight, 60)) / basisWeight
          : null;
      labContribution =
        lab.percentage != null
          ? (lab.percentage * toNumber(normalized?.lab_weight, 40)) / basisWeight
          : null;
    }
  } else {
    percentage = lecture.percentage;
    lectureContribution = lecture.percentage;
    basisWeight = lecture.percentage != null ? toNumber(normalized?.lecture_weight, 100) : 0;
  }

  return {
    key: termKey,
    entries: termEntries,
    lecture,
    lab,
    percentage: percentage == null ? null : clamp(percentage),
    lectureContribution,
    labContribution,
    basisWeight,
  };
}

export function semesterBreakdown(subject, scheme, entries = []) {
  const normalized = normalizeScheme(scheme);
  const terms = TERMS.map((term) => ({
    ...term,
    weight: toNumber(normalized?.term_weights?.[term.key], 0),
    ...termBreakdown(subject, normalized, entries, term.key),
  }));
  const active = terms.filter((term) => term.percentage != null);
  const activeWeight = sum(active.map((term) => term.weight));
  const percentage =
    activeWeight > 0
      ? active.reduce(
          (total, term) => total + term.percentage * term.weight,
          0,
        ) / activeWeight
      : null;
  const latest = [...terms].reverse().find((term) => term.percentage != null) || null;

  return {
    terms,
    percentage: percentage == null ? null : clamp(percentage),
    activeWeight,
    completedTerms: active.length,
    latestTerm: latest,
  };
}

export function subjectSummary(subject, scheme, entries = []) {
  const normalized = normalizeScheme(scheme);
  const semester = semesterBreakdown(subject, normalized, entries);
  const grade = gradeFromScale(normalized, semester.percentage);
  return {
    semester,
    percentage: semester.percentage,
    gradePoint: grade.gradePoint,
    remarks: grade.remarks,
    mapping: grade.mapping,
    status: statusFor(semester.percentage),
    latestTerm: semester.latestTerm,
    completedTerms: semester.completedTerms,
    lectureWeight: toNumber(normalized?.lecture_weight, 60),
    labWeight: toNumber(normalized?.lab_weight, 40),
  };
}

export function yearSummary(subjects = [], schemesById = {}, entriesBySubject = {}) {
  const rows = subjects.map((subject) => {
    const scheme = schemesById[subject.scheme_id] || null;
    const entries = entriesBySubject[subject.id] || [];
    return {
      subject,
      scheme,
      ...subjectSummary(subject, scheme, entries),
    };
  });
  const graded = rows.filter((row) => row.percentage != null);
  const units = sum(graded.map((row) => toNumber(row.subject.units, 3)));
  const averagePercentage =
    units > 0
      ? graded.reduce(
          (total, row) => total + row.percentage * toNumber(row.subject.units, 3),
          0,
        ) / units
      : null;
  const pointRows = graded.filter((row) => row.gradePoint != null);
  const pointUnits = sum(pointRows.map((row) => toNumber(row.subject.units, 3)));
  const gwa =
    pointUnits > 0
      ? pointRows.reduce(
          (total, row) => total + row.gradePoint * toNumber(row.subject.units, 3),
          0,
        ) / pointUnits
      : null;

  return {
    rows,
    averagePercentage,
    gwa,
    units,
    gradedCount: graded.length,
    totalSubjects: subjects.length,
    needsAttention: rows.filter(
      (row) => row.percentage != null && row.percentage < 75,
    ).length,
  };
}

export function createStarterScheme(title = "Standard Class + Lab") {
  return {
    title,
    lecture_weight: 60,
    lab_weight: 40,
    term_weights: { ...DEFAULT_TERM_WEIGHTS },
    lecture_components: DEFAULT_LECTURE_COMPONENTS.map((component) => ({ ...component })),
    lab_components: DEFAULT_LAB_COMPONENTS.map((component) => ({ ...component })),
    scale_mappings: DEFAULT_SCALE.map((mapping) => ({ ...mapping })),
  };
}

export function schemeDraftFrom(scheme) {
  const normalized = normalizeScheme(scheme);
  if (!normalized) {
    return {
      ...createStarterScheme(""),
      title: "",
    };
  }
  return {
    title: normalized.title || "",
    lecture_weight: normalized.lecture_weight,
    lab_weight: normalized.lab_weight,
    term_weights: { ...normalized.term_weights },
    lecture_components: normalized.lecture_components.map((component) => ({ ...component })),
    lab_components: normalized.lab_components.map((component) => ({ ...component })),
    scale_mappings: (normalized.scale_mappings.length
      ? normalized.scale_mappings
      : DEFAULT_SCALE
    ).map((mapping) => ({ ...mapping })),
  };
}

export function validateSchemeDraft(draft) {
  const errors = {};
  if (!String(draft.title || "").trim()) {
    errors.title = "Give this scheme a name.";
  }

  const lectureWeight = toNumber(draft.lecture_weight);
  const labWeight = toNumber(draft.lab_weight);
  if (lectureWeight < 0 || labWeight < 0) {
    errors.labSplit = "Weights cannot be negative.";
  } else if (Math.abs(lectureWeight + labWeight - 100) > 0.01) {
    errors.labSplit = "Lecture and lab weights need to add up to 100%.";
  }

  const termTotal = sum(TERM_KEYS.map((key) => toNumber(draft.term_weights?.[key])));
  if (Math.abs(termTotal - 100) > 0.01) {
    errors.termWeights = "Term weights need to add up to 100%.";
  }

  const groups = [];
  if (lectureWeight > 0) groups.push("lecture_components");
  if (labWeight > 0) groups.push("lab_components");

  for (const key of groups) {
    const components = draft[key] || [];
    if (components.length === 0) {
      errors[key] = "Add at least one activity.";
      continue;
    }
    if (components.some((component) => !String(component.name || "").trim())) {
      errors[key] = "Every activity needs a name.";
      continue;
    }
    if (components.some((component) => toNumber(component.weight) < 0)) {
      errors[key] = "Activity percentages cannot be negative.";
      continue;
    }
    const total = sum(components.map((component) => toNumber(component.weight)));
    if (Math.abs(total - 100) > 0.01) {
      errors[key] = "Activity percentages need to add up to 100%.";
    }
  }

  const scale = draft.scale_mappings || [];
  if (scale.length === 0) {
    errors.scale = "Add at least one grade range.";
  } else {
    for (const row of scale) {
      const min = toNumber(row.min_percentage, -1);
      const max = toNumber(row.max_percentage, -1);
      if (min < 0 || max > 100 || min > max) {
        errors.scale = "Check your grade ranges: use 0–100 and a min lower than the max.";
        break;
      }
      if (row.grade_point === "" || row.grade_point == null || Number.isNaN(Number(row.grade_point))) {
        errors.scale = "Every range needs a numeric grade point.";
        break;
      }
    }
  }

  return errors;
}

export function termLabel(key) {
  return TERMS.find((term) => term.key === key)?.label || key;
}

export function componentName(scheme, category) {
  const normalized = normalizeScheme(scheme);
  const all = [
    ...(normalized?.lecture_components || []),
    ...(normalized?.lab_components || []),
  ];
  return all.find((component) => component.id === category)?.name || category;
}

export function findComponent(scheme, category) {
  const normalized = normalizeScheme(scheme);
  const lecture = (normalized?.lecture_components || []).find((c) => c.id === category);
  if (lecture) return { ...lecture, group: "lecture" };
  const lab = (normalized?.lab_components || []).find((c) => c.id === category);
  if (lab) return { ...lab, group: "lab" };
  return null;
}
