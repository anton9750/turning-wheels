export const theme = {
  colors: {
    bg: '#000000',
    panel: 'rgba(12, 9, 4, 0.72)',
    border: 'rgba(212, 166, 64, 0.22)',
    gold: '#d4a640',
    goldBright: '#f3d78a',
    text: '#efe4c8',
    muted: 'rgba(239, 228, 200, 0.55)',
  },
  font: `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`,
  radius: '12px',
} as const;

export type AppTheme = typeof theme;
