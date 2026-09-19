"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AppMode } from "@/lib/config";

const RuntimeContext = createContext<AppMode>("demo");
export function RuntimeProvider({ mode, children }: { mode: AppMode; children: ReactNode }) {
  return <RuntimeContext.Provider value={mode}>{children}</RuntimeContext.Provider>;
}
export function useAppMode() { return useContext(RuntimeContext); }
