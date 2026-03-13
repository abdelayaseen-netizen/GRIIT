import { useState, useEffect } from "react";

/**
 * Returns a debounced value that updates after `delay` ms of the value not changing.
 * Use for search inputs to avoid firing API calls or heavy filters on every keystroke.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
