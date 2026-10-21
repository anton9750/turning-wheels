import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

/** useState backed by localStorage (fails soft in private mode / blocked storage). */
export function usePersistentState<T>(
  key: string,
  initial: () => T,
  parse: (raw: unknown) => T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) return parse(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    return initial();
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);

  return [value, setValue];
}
