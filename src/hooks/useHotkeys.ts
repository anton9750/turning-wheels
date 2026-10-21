import { useEffect, useRef } from 'react';

/** Map of lower-case key → handler. Ignored while typing in form fields. */
export function useHotkeys(map: Record<string, () => void>): void {
  const ref = useRef(map);
  ref.current = map;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) {
        if (!(el instanceof HTMLInputElement && el.type === 'range')) return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const fn = ref.current[e.key.toLowerCase()];
      if (fn) {
        e.preventDefault();
        fn();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
