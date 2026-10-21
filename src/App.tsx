import { useCallback, useMemo, useRef, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { DEFAULT_SETTINGS, sanitizeSettings, type SceneSettings } from './config/sceneConfig';
import { ControlPanel } from './components/ControlPanel';
import { LoadingVeil } from './components/LoadingVeil';
import { ShowUiButton } from './components/ShowUiButton';
import { Stage } from './components/Stage';
import { useGoldEngine } from './hooks/useGoldEngine';
import { useHotkeys } from './hooks/useHotkeys';
import { usePersistentState } from './hooks/usePersistentState';
import { useReducedMotion } from './hooks/useReducedMotion';
import { GlobalStyle } from './styles/GlobalStyle';
import { theme } from './styles/theme';

export default function App() {
  // `?clean` hides all UI — handy when using the page as a live background.
  const clean = useMemo(() => new URLSearchParams(window.location.search).has('clean'), []);
  const reducedMotion = useReducedMotion();

  const [settings, setSettings] = usePersistentState<SceneSettings>(
    'gold-ribbons:settings:v2',
    () => ({ ...DEFAULT_SETTINGS, ...(reducedMotion ? { timeScale: 0.35 } : {}) }),
    sanitizeSettings,
  );
  const [uiVisible, setUiVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [fps, setFps] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);

  const engine = useGoldEngine(stageRef, settings, { onFps: setFps, onReady: () => setReady(true) });

  const patch = useCallback((p: Partial<SceneSettings>) => setSettings((s) => ({ ...s, ...p })), [setSettings]);
  const toggleUi = useCallback(() => !clean && setUiVisible((v) => !v), [clean]);
  const randomize = useCallback(() => patch({ seed: Math.floor(Math.random() * 9999) + 1 }), [patch]);
  const reset = useCallback(() => setSettings({ ...DEFAULT_SETTINGS }), [setSettings]);

  const fullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen?.();
    else void document.documentElement.requestFullscreen?.();
  }, []);

  const screenshot = useCallback(() => {
    const url = engine.current?.screenshot();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `gold-ribbons-${settings.seed}-${Date.now()}.png`;
    a.click();
  }, [engine, settings.seed]);

  useHotkeys({
    ' ': () => setSettings((s) => ({ ...s, paused: !s.paused })),
    h: toggleUi,
    f: fullscreen,
    s: screenshot,
    r: randomize,
  });

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Stage ref={stageRef} />
      <LoadingVeil hidden={ready} />
      {!clean && (
        <>
          <ShowUiButton visible={!uiVisible} onClick={() => setUiVisible(true)} />
          <ControlPanel
            visible={uiVisible}
            settings={settings}
            fps={fps}
            onChange={patch}
            onReset={reset}
            onRandomize={randomize}
            onScreenshot={screenshot}
            onFullscreen={fullscreen}
            onHide={() => setUiVisible(false)}
          />
        </>
      )}
    </ThemeProvider>
  );
}
