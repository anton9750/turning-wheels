import { useEffect, useRef, type RefObject } from 'react';
import type { SceneSettings } from '../config/sceneConfig';
import { GoldEngine, type EngineCallbacks } from '../engine/GoldEngine';

/** Mounts the engine into `containerRef` and keeps its settings in sync. */
export function useGoldEngine(
  containerRef: RefObject<HTMLElement>,
  settings: SceneSettings,
  callbacks: EngineCallbacks,
): RefObject<GoldEngine | null> {
  const engineRef = useRef<GoldEngine | null>(null);
  const settingsRef = useRef(settings);
  const cbRef = useRef(callbacks);
  settingsRef.current = settings;
  cbRef.current = callbacks;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const engine = new GoldEngine(el, settingsRef.current, {
      onFps: (f) => cbRef.current.onFps?.(f),
      onReady: () => cbRef.current.onReady?.(),
    });
    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [containerRef]);

  useEffect(() => {
    engineRef.current?.setSettings(settings);
  }, [settings]);

  return engineRef;
}
