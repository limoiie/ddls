"use client";

import { useState, useEffect, useCallback } from "react";
import { DateRange } from "react-day-picker";

// Storage keys for different settings
const STORAGE_KEYS = {
  // General settings
  NOTIFICATIONS_ENABLED: "app-notifications-enabled",
  THEME: "app-theme",
  // Conferences page settings
  DEFAULT_VIEW_MODE: "app-conferences-default-view-mode",
  LAB_PREFERED_MODE: "app-conferences-lab-preferred-mode",
  SELECTED_TYPES: "app-conferences-selected-types",
  SELECTED_CCFS: "app-conferences-selected-ccfs",
  DATE_RANGE: "app-conferences-date-range",
  PINNED_CONFERENCES: "app-conferences-pinned-conferences",
  VIEW_MODE: "app-conferences-view-mode",
  PAGE_INDEX: "app-conferences-page-index",
  PAGE_SIZE: "app-conferences-page-size",
  // Maintainance settings
  GITHUB_CCF_DEADLINES_REPO_FORK: "app-github-ccf-deadlines-repo-fork",
} as const;

// Default values
const DEFAULT_SETTINGS = {
  githubCcfDeadlinesRepoFork: "ccfddl/ccf-deadlines",
  notificationsEnabled: true,
  theme: "system" as "light" | "dark" | "system",
  defaultViewMode: "table" as "list" | "table",
  labPreferedMode: true,
  selectedTypes: [] as string[],
  selectedCCFs: [] as string[],
  dateRange: undefined as DateRange | undefined,
  pinnedConferences: [] as string[],
  viewMode: "table" as "list" | "table",
  pageIndex: 0,
  pageSize: 10,
} as const;

export interface AppSettings {
  githubCcfDeadlinesRepoFork: string;
  notificationsEnabled: boolean;
  theme: "light" | "dark" | "system";
  defaultViewMode: "list" | "table";
  labPreferedMode: boolean;
  selectedTypes: string[];
  selectedCCFs: string[];
  dateRange: DateRange | undefined;
  pinnedConferences: string[];
  viewMode: "list" | "table";
  pageIndex: number;
  pageSize: number;
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const storedSettings: Partial<AppSettings> = {};

      // Load GitHub repository setting
      const storedRepo = localStorage.getItem(
        STORAGE_KEYS.GITHUB_CCF_DEADLINES_REPO_FORK
      );
      if (storedRepo) {
        storedSettings.githubCcfDeadlinesRepoFork = storedRepo;
      }

      // Load notifications setting
      const storedNotifications = localStorage.getItem(
        STORAGE_KEYS.NOTIFICATIONS_ENABLED
      );
      if (storedNotifications !== null) {
        storedSettings.notificationsEnabled = JSON.parse(storedNotifications);
      }

      // Load theme setting
      const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (storedTheme && ["light", "dark", "system"].includes(storedTheme)) {
        storedSettings.theme = storedTheme as "light" | "dark" | "system";
      }

      // Load default view mode setting
      const storedViewMode = localStorage.getItem(
        STORAGE_KEYS.DEFAULT_VIEW_MODE
      );
      if (storedViewMode && ["list", "table"].includes(storedViewMode)) {
        storedSettings.defaultViewMode = storedViewMode as "list" | "table";
      }

      // Load custom type mode setting
      const storedCustomTypeMode = localStorage.getItem(
        STORAGE_KEYS.LAB_PREFERED_MODE
      );
      if (storedCustomTypeMode !== null) {
        storedSettings.labPreferedMode = JSON.parse(storedCustomTypeMode);
      }

      // Load selected types setting
      const storedSelectedTypes = localStorage.getItem(
        STORAGE_KEYS.SELECTED_TYPES
      );
      if (storedSelectedTypes) {
        storedSettings.selectedTypes = JSON.parse(storedSelectedTypes);
      }

      // Load selected CCFs setting
      const storedSelectedCCFs = localStorage.getItem(
        STORAGE_KEYS.SELECTED_CCFS
      );
      if (storedSelectedCCFs) {
        storedSettings.selectedCCFs = JSON.parse(storedSelectedCCFs);
      }

      // Load date range setting
      const storedDateRange = localStorage.getItem(STORAGE_KEYS.DATE_RANGE);
      if (storedDateRange) {
        const parsed = JSON.parse(storedDateRange);
        if (parsed) {
          storedSettings.dateRange = {
            from: parsed.from ? new Date(parsed.from) : undefined,
            to: parsed.to ? new Date(parsed.to) : undefined,
          };
        }
      }

      // Load pinned conferences setting
      const storedPinnedConferences = localStorage.getItem(
        STORAGE_KEYS.PINNED_CONFERENCES
      );
      if (storedPinnedConferences) {
        storedSettings.pinnedConferences = JSON.parse(storedPinnedConferences);
      }

      // Load view mode setting
      const storedViewModeValue = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
      if (
        storedViewModeValue &&
        ["list", "table"].includes(storedViewModeValue)
      ) {
        storedSettings.viewMode = storedViewModeValue as "list" | "table";
      }

      // Load page index setting
      const storedPageIndex = localStorage.getItem(STORAGE_KEYS.PAGE_INDEX);
      if (storedPageIndex) {
        storedSettings.pageIndex = JSON.parse(storedPageIndex);
      }

      // Load page size setting
      const storedPageSize = localStorage.getItem(STORAGE_KEYS.PAGE_SIZE);
      if (storedPageSize) {
        storedSettings.pageSize = JSON.parse(storedPageSize);
      }

      setSettings((prev) => ({ ...prev, ...storedSettings }));
    } catch (error) {
      console.error("Error loading settings from localStorage:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Update a specific setting
  const updateSetting = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));

      // Persist to localStorage
      try {
        switch (key) {
          case "githubCcfDeadlinesRepoFork":
            localStorage.setItem(
              STORAGE_KEYS.GITHUB_CCF_DEADLINES_REPO_FORK,
              value as string
            );
            break;
          case "notificationsEnabled":
            localStorage.setItem(
              STORAGE_KEYS.NOTIFICATIONS_ENABLED,
              JSON.stringify(value)
            );
            break;
          case "theme":
            localStorage.setItem(STORAGE_KEYS.THEME, value as string);
            break;
          case "defaultViewMode":
            localStorage.setItem(
              STORAGE_KEYS.DEFAULT_VIEW_MODE,
              value as string
            );
            break;
          case "labPreferedMode":
            localStorage.setItem(
              STORAGE_KEYS.LAB_PREFERED_MODE,
              JSON.stringify(value)
            );
            break;
          case "selectedTypes":
            localStorage.setItem(
              STORAGE_KEYS.SELECTED_TYPES,
              JSON.stringify(value)
            );
            break;
          case "selectedCCFs":
            localStorage.setItem(
              STORAGE_KEYS.SELECTED_CCFS,
              JSON.stringify(value)
            );
            break;
          case "dateRange":
            if (value) {
              localStorage.setItem(
                STORAGE_KEYS.DATE_RANGE,
                JSON.stringify(value)
              );
            } else {
              localStorage.removeItem(STORAGE_KEYS.DATE_RANGE);
            }
            break;
          case "pinnedConferences":
            localStorage.setItem(
              STORAGE_KEYS.PINNED_CONFERENCES,
              JSON.stringify(value)
            );
            break;
          case "viewMode":
            localStorage.setItem(STORAGE_KEYS.VIEW_MODE, value as string);
            break;
          case "pageIndex":
            localStorage.setItem(
              STORAGE_KEYS.PAGE_INDEX,
              JSON.stringify(value)
            );
            break;
          case "pageSize":
            localStorage.setItem(STORAGE_KEYS.PAGE_SIZE, JSON.stringify(value));
            break;
        }
      } catch (error) {
        console.error("Error saving setting to localStorage:", error);
      }
    },
    []
  );

  // Update multiple settings at once
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));

    // Persist to localStorage
    try {
      Object.entries(newSettings).forEach(([key, value]) => {
        switch (key) {
          case "githubCcfDeadlinesRepoFork":
            localStorage.setItem(
              STORAGE_KEYS.GITHUB_CCF_DEADLINES_REPO_FORK,
              value as string
            );
            break;
          case "notificationsEnabled":
            localStorage.setItem(
              STORAGE_KEYS.NOTIFICATIONS_ENABLED,
              JSON.stringify(value)
            );
            break;
          case "theme":
            localStorage.setItem(STORAGE_KEYS.THEME, value as string);
            break;
          case "defaultViewMode":
            localStorage.setItem(
              STORAGE_KEYS.DEFAULT_VIEW_MODE,
              value as string
            );
            break;
          case "labPreferedMode":
            localStorage.setItem(
              STORAGE_KEYS.LAB_PREFERED_MODE,
              JSON.stringify(value)
            );
            break;
          case "selectedTypes":
            localStorage.setItem(
              STORAGE_KEYS.SELECTED_TYPES,
              JSON.stringify(value)
            );
            break;
          case "selectedCCFs":
            localStorage.setItem(
              STORAGE_KEYS.SELECTED_CCFS,
              JSON.stringify(value)
            );
            break;
          case "dateRange":
            if (value) {
              localStorage.setItem(
                STORAGE_KEYS.DATE_RANGE,
                JSON.stringify(value)
              );
            } else {
              localStorage.removeItem(STORAGE_KEYS.DATE_RANGE);
            }
            break;
          case "pinnedConferences":
            localStorage.setItem(
              STORAGE_KEYS.PINNED_CONFERENCES,
              JSON.stringify(value)
            );
            break;
          case "viewMode":
            localStorage.setItem(STORAGE_KEYS.VIEW_MODE, value as string);
            break;
          case "pageIndex":
            localStorage.setItem(
              STORAGE_KEYS.PAGE_INDEX,
              JSON.stringify(value)
            );
            break;
          case "pageSize":
            localStorage.setItem(STORAGE_KEYS.PAGE_SIZE, JSON.stringify(value));
            break;
        }
      });
    } catch (error) {
      console.error("Error saving settings to localStorage:", error);
    }
  }, []);

  // Reset all settings to defaults
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error("Error resetting settings:", error);
    }
  }, []);

  // Helper functions for GitHub repository
  const updateGitHubRepository = useCallback(
    (repository: string) => {
      // Remove any existing https://github.com/ prefix
      const cleanRepository = repository.replace(
        /^https?:\/\/github\.com\//,
        ""
      );
      updateSetting("githubCcfDeadlinesRepoFork", cleanRepository);
    },
    [updateSetting]
  );

  const getEditLinkToForkedCcfddlRepo = useCallback(
    (subpath: string) => {
      return `https://github.com/${settings.githubCcfDeadlinesRepoFork}/edit/main/conference/${subpath}`;
    },
    [settings.githubCcfDeadlinesRepoFork]
  );

  const getEditLinkRelToOurRepo = useCallback((subpath: string) => {
    return `https://github.com/limoiie/ddls/edit/main/data/conferences/${subpath}`;
  }, []);

  // Helper functions for conference-specific settings
  const togglePin = useCallback(
    (title: string) => {
      const newPinnedConferences = settings.pinnedConferences.includes(title)
        ? settings.pinnedConferences.filter((id) => id !== title)
        : [...settings.pinnedConferences, title];
      updateSetting("pinnedConferences", newPinnedConferences);
    },
    [settings.pinnedConferences, updateSetting]
  );

  const toggleSelectedCCF = useCallback(
    (tag: string) => {
      const newSelectedCCFs = settings.selectedCCFs.includes(tag)
        ? settings.selectedCCFs.filter((t) => t !== tag)
        : [...settings.selectedCCFs, tag];
      updateSetting("selectedCCFs", newSelectedCCFs);
    },
    [settings.selectedCCFs, updateSetting]
  );

  const toggleSelectedType = useCallback(
    (type: string) => {
      const newSelectedTypes = settings.selectedTypes.includes(type)
        ? settings.selectedTypes.filter((t) => t !== type)
        : [...settings.selectedTypes, type];
      updateSetting("selectedTypes", newSelectedTypes);
    },
    [settings.selectedTypes, updateSetting]
  );

  const clearSelectedTypes = useCallback(() => {
    updateSetting("selectedTypes", []);
  }, [updateSetting]);

  const clearSelectedCCFs = useCallback(() => {
    updateSetting("selectedCCFs", []);
  }, [updateSetting]);

  const resetPageIndex = useCallback(() => {
    updateSetting("pageIndex", 0);
  }, [updateSetting]);

  return {
    settings,
    isLoaded,
    updateSetting,
    updateSettings,
    resetSettings,
    updateGitHubRepository,
    getEditLinkToForkedCcfddlRepo,
    getEditLinkRelToOurRepo,
    // Conference-specific helpers
    togglePin,
    toggleSelectedCCF,
    toggleSelectedType,
    clearSelectedTypes,
    clearSelectedCCFs,
    resetPageIndex,
  };
}
