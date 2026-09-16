"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  CommunityStory,
  HouseholdProfile,
  LocationResolution,
  SimulationAssumptionsByScenario,
  SimulationScenarioId,
  UserData,
} from "@/lib/types";
import { DEFAULT_ASSUMPTIONS, DEFAULT_PROFILE } from "@/lib/constants";
import {
  clearUserData,
  createInitialUserData,
  readUserData,
  writeUserData,
} from "@/lib/storage";
import { normaliseAssumptions } from "@/lib/simulation";

/* -------------------------------------------------------------------------- */
/* Store shape                                                                 */
/* -------------------------------------------------------------------------- */

export type StorageStatus = "ok" | "unavailable" | "quota";

export interface AppStoreValue {
  /** False until localStorage has been read. Gates any UI that needs real data. */
  hydrated: boolean;
  location: LocationResolution;
  profile: HouseholdProfile;
  assumptions: SimulationAssumptionsByScenario;
  bookmarks: string[];
  checklist: Record<string, boolean>;
  stories: CommunityStory[];
  storageStatus: StorageStatus;
  /** True once the visitor has personalised anything at all. */
  hasAnyData: boolean;

  setLocation: (location: LocationResolution) => void;
  clearLocation: () => void;

  updateProfile: (patch: Partial<HouseholdProfile>) => void;
  resetProfile: () => void;

  updateAssumptions: <S extends SimulationScenarioId>(
    scenario: S,
    patch: Partial<SimulationAssumptionsByScenario[S]>,
  ) => void;
  resetAssumptions: (scenario: SimulationScenarioId) => void;
  resetAllAssumptions: () => void;

  toggleBookmark: (policyId: string) => void;
  toggleChecklistItem: (key: string) => void;
  setChecklistItem: (key: string, done: boolean) => void;
  clearChecklist: () => void;

  addStory: (story: CommunityStory) => void;
  removeStory: (id: string) => void;

  resetEverything: () => void;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

/* -------------------------------------------------------------------------- */
/* Provider                                                                    */
/* -------------------------------------------------------------------------- */

export function AppStoreProvider({ children }: { children: ReactNode }) {
  // First render always uses the deterministic defaults so the server-rendered
  // HTML matches the client's first paint. Storage is read in an effect.
  const [data, setData] = useState<UserData>(() => createInitialUserData());
  const [hydrated, setHydrated] = useState(false);
  const [storageStatus, setStorageStatus] = useState<StorageStatus>("ok");
  const hydratedRef = useRef(false);

  useEffect(() => {
    const stored = readUserData();
    if (stored) setData(stored);
    hydratedRef.current = true;
    setHydrated(true);
  }, []);

  // Persist after hydration only — never write defaults over real stored data.
  useEffect(() => {
    if (!hydratedRef.current) return;
    const result = writeUserData(data);
    if (!result.ok) setStorageStatus(result.reason);
    else setStorageStatus((prev) => (prev === "ok" ? prev : "ok"));
  }, [data]);

  const setLocation = useCallback((location: LocationResolution) => {
    setData((prev) => ({ ...prev, location }));
  }, []);

  const clearLocation = useCallback(() => {
    setData((prev) => ({ ...prev, location: { status: "unset" } }));
  }, []);

  const updateProfile = useCallback((patch: Partial<HouseholdProfile>) => {
    setData((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }));
  }, []);

  const resetProfile = useCallback(() => {
    setData((prev) => ({ ...prev, profile: { ...DEFAULT_PROFILE } }));
  }, []);

  const updateAssumptions = useCallback(
    <S extends SimulationScenarioId>(
      scenario: S,
      patch: Partial<SimulationAssumptionsByScenario[S]>,
    ) => {
      setData((prev) => ({
        ...prev,
        assumptions: {
          ...prev.assumptions,
          [scenario]: { ...prev.assumptions[scenario], ...patch },
        } as SimulationAssumptionsByScenario,
      }));
    },
    [],
  );

  const resetAssumptions = useCallback((scenario: SimulationScenarioId) => {
    setData((prev) => ({
      ...prev,
      assumptions: {
        ...prev.assumptions,
        [scenario]: { ...DEFAULT_ASSUMPTIONS[scenario] },
      } as SimulationAssumptionsByScenario,
    }));
  }, []);

  const resetAllAssumptions = useCallback(() => {
    setData((prev) => ({ ...prev, assumptions: normaliseAssumptions(null) }));
  }, []);

  const toggleBookmark = useCallback((policyId: string) => {
    setData((prev) => ({
      ...prev,
      bookmarks: prev.bookmarks.includes(policyId)
        ? prev.bookmarks.filter((id) => id !== policyId)
        : [...prev.bookmarks, policyId],
    }));
  }, []);

  const setChecklistItem = useCallback((key: string, done: boolean) => {
    setData((prev) => ({ ...prev, checklist: { ...prev.checklist, [key]: done } }));
  }, []);

  const toggleChecklistItem = useCallback((key: string) => {
    setData((prev) => ({
      ...prev,
      checklist: { ...prev.checklist, [key]: !prev.checklist[key] },
    }));
  }, []);

  const clearChecklist = useCallback(() => {
    setData((prev) => ({ ...prev, checklist: {} }));
  }, []);

  const addStory = useCallback((story: CommunityStory) => {
    setData((prev) => ({ ...prev, stories: [story, ...prev.stories] }));
  }, []);

  const removeStory = useCallback((id: string) => {
    setData((prev) => ({ ...prev, stories: prev.stories.filter((s) => s.id !== id) }));
  }, []);

  const resetEverything = useCallback(() => {
    clearUserData();
    setData(createInitialUserData());
    setStorageStatus("ok");
  }, []);

  const value = useMemo<AppStoreValue>(() => {
    const hasAnyData =
      data.location.status !== "unset" ||
      data.bookmarks.length > 0 ||
      data.stories.length > 0 ||
      Object.keys(data.checklist).length > 0 ||
      JSON.stringify(data.profile) !== JSON.stringify(DEFAULT_PROFILE);

    return {
      hydrated,
      location: data.location,
      profile: data.profile,
      assumptions: data.assumptions,
      bookmarks: data.bookmarks,
      checklist: data.checklist,
      stories: data.stories,
      storageStatus,
      hasAnyData,
      setLocation,
      clearLocation,
      updateProfile,
      resetProfile,
      updateAssumptions,
      resetAssumptions,
      resetAllAssumptions,
      toggleBookmark,
      toggleChecklistItem,
      setChecklistItem,
      clearChecklist,
      addStory,
      removeStory,
      resetEverything,
    };
  }, [
    hydrated,
    data,
    storageStatus,
    setLocation,
    clearLocation,
    updateProfile,
    resetProfile,
    updateAssumptions,
    resetAssumptions,
    resetAllAssumptions,
    toggleBookmark,
    toggleChecklistItem,
    setChecklistItem,
    clearChecklist,
    addStory,
    removeStory,
    resetEverything,
  ]);

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

/* -------------------------------------------------------------------------- */
/* Hooks                                                                       */
/* -------------------------------------------------------------------------- */

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) {
    throw new Error("useAppStore must be used inside <AppStoreProvider>.");
  }
  return ctx;
}

/** Convenience: is a policy bookmarked? */
export function useIsBookmarked(policyId: string): boolean {
  const { bookmarks } = useAppStore();
  return bookmarks.includes(policyId);
}
