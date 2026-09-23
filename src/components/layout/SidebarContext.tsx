'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

/**
 * Shared sidebar state (collapse / expand + mobile drawer).
 *
 * Both `Sidebar` and `DashboardLayout` need to know whether the sidebar is
 * collapsed (the sidebar changes its width, the layout changes its content
 * margin), so the state lives in a context and is restored from localStorage
 * so the user's preference survives reloads.
 */

interface SidebarContextValue {
  collapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (value: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
}

const STORAGE_KEY = 'dakdin-sidebar-collapsed';

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [restored, setRestored] = useState(false);

  // Restore the persisted preference once on mount (client-only).
  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === 'true') {
        setCollapsedState(true);
      }
    } catch {
      // Storage can be unavailable (private mode / disabled) — fall back to default.
    }
    setRestored(true);
  }, []);

  // Persist the preference whenever it changes (after the initial restore).
  useEffect(() => {
    if (!restored) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // Ignore write failures.
    }
  }, [collapsed, restored]);

  const setCollapsed = useCallback((value: boolean) => setCollapsedState(value), []);
  const toggleCollapsed = useCallback(() => setCollapsedState((prev) => !prev), []);

  return (
    <SidebarContext.Provider
      value={{ collapsed, toggleCollapsed, setCollapsed, mobileOpen, setMobileOpen }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
