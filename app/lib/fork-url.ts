"use client";

import { useState, useEffect } from "react";

const FORK_URL_STORAGE_KEY = "ccf-deadlines-fork-url";
const DEFAULT_FORK_URL = "limoiie/ccf-deadlines";

export function useForkUrl() {
  const [forkUrl, setForkUrl] = useState<string>(DEFAULT_FORK_URL);

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(FORK_URL_STORAGE_KEY);
    if (stored) {
      setForkUrl(stored);
    }
  }, []);

  const updateForkUrl = (newUrl: string) => {
    // Remove any existing https://github.com/ prefix
    const cleanUrl = newUrl.replace(/^https?:\/\/github\.com\//, "");
    setForkUrl(cleanUrl);
    localStorage.setItem(FORK_URL_STORAGE_KEY, cleanUrl);
  };

  const getFullUrl = (subpath: string) => {
    return `https://github.com/${forkUrl}/edit/main/conference/${subpath}`;
  };

  return {
    forkUrl,
    updateForkUrl,
    getFullUrl,
  };
}
