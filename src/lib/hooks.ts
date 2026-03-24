"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Debounce hook for search inputs
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Local storage hook with SSR safety
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// Session storage hook
export function useSessionStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error("Error saving to sessionStorage:", error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// Dark mode hook with system preference
export function useDarkMode(): [boolean, (value: boolean) => void] {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("forkd-dark-mode");
    if (stored !== null) return stored === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("forkd-dark-mode", isDark.toString());
  }, [isDark]);

  return [isDark, setIsDark];
}

// Loading state hook
export function useLoading(initialState = false): {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  setLoading: (value: boolean) => void;
} {
  const [isLoading, setIsLoading] = useState(initialState);

  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);
  const setLoading = useCallback((value: boolean) => setIsLoading(value), []);

  return { isLoading, startLoading, stopLoading, setLoading };
}

// Async data fetching hook
export function useAsyncFetch<T>(
  _fetcher: () => Promise<T>,
  _deps: React.DependencyList = []
): {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
} {
  // This hook is not fully implemented - placeholder for future use
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setData(null);
    setIsLoading(false);
  }, []);

  return { data, error, isLoading, refetch };
}

// Click outside hook
export function useClickOutside<T extends HTMLElement>(
  callback: () => void
): React.RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [callback]);

  return ref;
}

// Media query hook - uses lazy initializer to avoid setState in effect
export function useMediaQuery(query: string): boolean {
  const getInitialValue = () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState<boolean>(getInitialValue);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);
    
    // Only update if different from current state to avoid unnecessary renders
    const handleChange = () => {
      setMatches(media.matches);
    };

    if (media.matches !== matches) {
      handleChange();
    }

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [query, matches]);

  return matches;
}

// Check if mobile device
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 768px)");
}

// Prevent body scroll hook
export function usePreventBodyScroll(prevent: boolean): void {
  useEffect(() => {
    if (prevent) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [prevent]);
}
