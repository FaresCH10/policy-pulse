import type { UserData } from "./types";
import { DEFAULT_ASSUMPTIONS, DEFAULT_PROFILE, STORAGE_KEY, USER_DATA_VERSION } from "./constants";
import { normaliseAssumptions } from "./simulation";
import { parseStoredAssumptions } from "./validation";

/**
 * localStorage persistence.
 *
 * Everything here is defensive: private browsing, disabled storage, a corrupted
 * value, or an older schema must all degrade to "start fresh" rather than throw
 * and take the page down.
 *
 * Nothing sensitive is ever stored — there is no account, no location history,
 * and no free text beyond what the user chooses to write as a demo story.
 */

export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** The state a brand-new visitor starts from. */
export function createInitialUserData(): UserData {
  return {
    version: USER_DATA_VERSION,
    location: { status: "unset" },
    profile: { ...DEFAULT_PROFILE },
    assumptions: normaliseAssumptions(null),
    bookmarks: [],
    checklist: {},
    stories: [],
  };
}

/**
 * Coerces anything read from storage into a complete, valid `UserData`.
 * Unknown or malformed sections fall back to defaults field by field.
 */
export function normaliseUserData(raw: unknown): UserData {
  const base = createInitialUserData();
  if (!raw || typeof raw !== "object") return base;

  const candidate = raw as Partial<UserData>;

  const profile = {
    ...DEFAULT_PROFILE,
    ...(candidate.profile && typeof candidate.profile === "object"
      ? candidate.profile
      : {}),
  };

  // Guard against out-of-range values that would break the formulas.
  profile.householdSize = clampInt(profile.householdSize, 1, 12, DEFAULT_PROFILE.householdSize);
  profile.groceryTripsPerWeek = clampNum(profile.groceryTripsPerWeek, 0, 21, DEFAULT_PROFILE.groceryTripsPerWeek);
  profile.bagsPerTrip = clampNum(profile.bagsPerTrip, 0, 10, DEFAULT_PROFILE.bagsPerTrip);
  profile.weeklyFoodWasteLb = clampNum(profile.weeklyFoodWasteLb, 0, 100, DEFAULT_PROFILE.weeklyFoodWasteLb);
  if (profile.tenure !== "renter" && profile.tenure !== "homeowner") {
    profile.tenure = DEFAULT_PROFILE.tenure;
  }
  if (!["yes", "no", "unsure"].includes(profile.compostingAvailable)) {
    profile.compostingAvailable = DEFAULT_PROFILE.compostingAvailable;
  }

  const validatedAssumptions = parseStoredAssumptions(candidate.assumptions);
  const assumptions = validatedAssumptions
    ? normaliseAssumptions(validatedAssumptions)
    : normaliseAssumptions(candidate.assumptions ?? null);

  const location =
    candidate.location && typeof candidate.location === "object" && "status" in candidate.location
      ? candidate.location
      : base.location;

  return {
    version: USER_DATA_VERSION,
    location,
    profile,
    assumptions,
    bookmarks: Array.isArray(candidate.bookmarks)
      ? candidate.bookmarks.filter((id): id is string => typeof id === "string")
      : [],
    checklist:
      candidate.checklist && typeof candidate.checklist === "object"
        ? Object.fromEntries(
            Object.entries(candidate.checklist).filter(([, v]) => typeof v === "boolean"),
          )
        : {},
    stories: Array.isArray(candidate.stories)
      ? candidate.stories.filter(
          (s) => s && typeof s === "object" && typeof (s as { id?: unknown }).id === "string",
        )
      : [],
  };
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.round(n), min), max);
}

function clampNum(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

/** Reads and normalises stored state. Returns `null` when nothing is stored. */
export function readUserData(): UserData | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normaliseUserData(JSON.parse(raw));
  } catch {
    return null;
  }
}

export type WriteResult = { ok: true } | { ok: false; reason: "unavailable" | "quota" };

export function writeUserData(data: UserData): WriteResult {
  if (!isBrowser()) return { ok: false, reason: "unavailable" };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return { ok: true };
  } catch (error) {
    const isQuota =
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED");
    return { ok: false, reason: isQuota ? "quota" : "unavailable" };
  }
}

export function clearUserData(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing useful to do — the UI already reflects the reset state.
  }
}

/** Approximate size of the stored payload, for the data & privacy panel. */
export function storedByteSize(): number {
  if (!isBrowser()) return 0;
  try {
    return new Blob([window.localStorage.getItem(STORAGE_KEY) ?? ""]).size;
  } catch {
    return 0;
  }
}

export { DEFAULT_ASSUMPTIONS };
