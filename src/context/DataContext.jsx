import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { isMissingTableError, supabase } from "../lib/supabase";
import { normalizeScheme } from "../lib/grading";
import { toNumber } from "../lib/utils";

const DataContext = createContext(null);

const initialState = {
  schemes: [],
  subjects: [],
  entries: [],
  loading: true,
  error: null,
  schemaMissing: false,
};

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [state, setState] = useState(initialState);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!supabase || !user) {
        setState((current) => ({
          ...current,
          loading: false,
        }));
        return;
      }

      if (!silent) {
        setState((current) => ({ ...current, loading: true, error: null }));
      }

      try {
        const [schemesResult, subjectsResult, entriesResult] = await Promise.all([
          supabase
            .from("grading_schemes")
            .select("*, scale_mappings(*)")
            .order("created_at", { ascending: false }),
          supabase
            .from("subjects")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("grade_entries")
            .select("*")
            .order("created_at", { ascending: false }),
        ]);

        const error =
          schemesResult.error || subjectsResult.error || entriesResult.error;
        if (error) throw error;

        setState({
          schemes: schemesResult.data || [],
          subjects: subjectsResult.data || [],
          entries: entriesResult.data || [],
          loading: false,
          error: null,
          schemaMissing: false,
        });
      } catch (error) {
        setState((current) => ({
          ...current,
          loading: false,
          error,
          schemaMissing: isMissingTableError(error),
        }));
      }
    },
    [user],
  );

  useEffect(() => {
    if (user) {
      load();
    } else {
      setState(initialState);
    }
  }, [user, load]);

  const requireUser = useCallback(() => {
    if (!user) throw new Error("You need to be signed in to do that.");
    return user;
  }, [user]);

  const createScheme = useCallback(
    async (draft) => {
      const currentUser = requireUser();
      const payload = {
        user_id: currentUser.id,
        title: draft.title.trim(),
        lecture_weight: toNumber(draft.lecture_weight, 60),
        lab_weight: toNumber(draft.lab_weight, 40),
        term_weights: draft.term_weights,
        lecture_components: draft.lecture_components,
        lab_components: draft.lab_components,
      };

      const { data, error } = await supabase
        .from("grading_schemes")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw error;

      if (draft.scale_mappings?.length) {
        const mappings = draft.scale_mappings.map((row) => ({
          scheme_id: data.id,
          min_percentage: toNumber(row.min_percentage),
          max_percentage: toNumber(row.max_percentage),
          grade_point: toNumber(row.grade_point),
          remarks: String(row.remarks || "").trim() || null,
        }));
        const { error: scaleError } = await supabase
          .from("scale_mappings")
          .insert(mappings);
        if (scaleError) throw scaleError;
      }

      await load({ silent: true });
      return data;
    },
    [load, requireUser],
  );

  const updateScheme = useCallback(
    async (schemeId, draft) => {
      requireUser();
      const payload = {
        title: draft.title.trim(),
        lecture_weight: toNumber(draft.lecture_weight, 60),
        lab_weight: toNumber(draft.lab_weight, 40),
        term_weights: draft.term_weights,
        lecture_components: draft.lecture_components,
        lab_components: draft.lab_components,
      };

      const { error } = await supabase
        .from("grading_schemes")
        .update(payload)
        .eq("id", schemeId);
      if (error) throw error;

      const { error: clearError } = await supabase
        .from("scale_mappings")
        .delete()
        .eq("scheme_id", schemeId);
      if (clearError) throw clearError;

      if (draft.scale_mappings?.length) {
        const mappings = draft.scale_mappings.map((row) => ({
          scheme_id: schemeId,
          min_percentage: toNumber(row.min_percentage),
          max_percentage: toNumber(row.max_percentage),
          grade_point: toNumber(row.grade_point),
          remarks: String(row.remarks || "").trim() || null,
        }));
        const { error: scaleError } = await supabase
          .from("scale_mappings")
          .insert(mappings);
        if (scaleError) throw scaleError;
      }

      await load({ silent: true });
    },
    [load, requireUser],
  );

  const removeScheme = useCallback(
    async (schemeId) => {
      requireUser();
      const { error } = await supabase
        .from("grading_schemes")
        .delete()
        .eq("id", schemeId);
      if (error) throw error;
      await load({ silent: true });
    },
    [load, requireUser],
  );

  const createSubject = useCallback(
    async (values) => {
      const currentUser = requireUser();
      const payload = {
        user_id: currentUser.id,
        scheme_id: values.scheme_id || null,
        code: values.code.trim().toUpperCase(),
        name: values.name.trim(),
        has_lab: Boolean(values.has_lab),
        semester: values.semester || "1st Semester",
        school_year: values.school_year?.trim() || null,
        units: toNumber(values.units, 3),
      };
      const { data, error } = await supabase
        .from("subjects")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw error;
      await load({ silent: true });
      return data;
    },
    [load, requireUser],
  );

  const updateSubject = useCallback(
    async (subjectId, values) => {
      requireUser();
      const payload = {
        scheme_id: values.scheme_id || null,
        code: values.code.trim().toUpperCase(),
        name: values.name.trim(),
        has_lab: Boolean(values.has_lab),
        semester: values.semester || "1st Semester",
        school_year: values.school_year?.trim() || null,
        units: toNumber(values.units, 3),
      };
      const { error } = await supabase
        .from("subjects")
        .update(payload)
        .eq("id", subjectId);
      if (error) throw error;
      await load({ silent: true });
    },
    [load, requireUser],
  );

  const removeSubject = useCallback(
    async (subjectId) => {
      requireUser();
      const { error } = await supabase.from("subjects").delete().eq("id", subjectId);
      if (error) throw error;
      await load({ silent: true });
    },
    [load, requireUser],
  );

  const createEntry = useCallback(
    async (values) => {
      requireUser();
      const payload = {
        subject_id: values.subject_id,
        term: values.term,
        category: values.category,
        label: values.label?.trim() || null,
        score: toNumber(values.score),
        max_score: toNumber(values.max_score, 100),
      };
      const { data, error } = await supabase
        .from("grade_entries")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw error;
      await load({ silent: true });
      return data;
    },
    [load, requireUser],
  );

  const removeEntry = useCallback(
    async (entryId) => {
      requireUser();
      const { error } = await supabase.from("grade_entries").delete().eq("id", entryId);
      if (error) throw error;
      await load({ silent: true });
    },
    [load, requireUser],
  );

  const entriesBySubject = useMemo(() => {
    const map = {};
    for (const entry of state.entries) {
      if (!map[entry.subject_id]) map[entry.subject_id] = [];
      map[entry.subject_id].push(entry);
    }
    return map;
  }, [state.entries]);

  const schemesById = useMemo(() => {
    const map = {};
    for (const scheme of state.schemes) {
      map[scheme.id] = normalizeScheme(scheme);
    }
    return map;
  }, [state.schemes]);

  const subjectById = useMemo(() => {
    const map = {};
    for (const subject of state.subjects) map[subject.id] = subject;
    return map;
  }, [state.subjects]);

  const value = useMemo(
    () => ({
      ...state,
      entriesBySubject,
      schemesById,
      subjectById,
      refresh: () => load(),
      createScheme,
      updateScheme,
      removeScheme,
      createSubject,
      updateSubject,
      removeSubject,
      createEntry,
      removeEntry,
    }),
    [
      state,
      entriesBySubject,
      schemesById,
      subjectById,
      load,
      createScheme,
      updateScheme,
      removeScheme,
      createSubject,
      updateSubject,
      removeSubject,
      createEntry,
      removeEntry,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used inside DataProvider");
  return context;
}
