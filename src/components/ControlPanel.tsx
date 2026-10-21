import { useState } from 'react';
import styled from 'styled-components';
import { PRESETS, SLIDER_GROUPS, type SceneSettings } from '../config/sceneConfig';
import { Button } from './Button';
import { Slider } from './Slider';

const Panel = styled.aside<{ $visible: boolean }>`
  position: fixed;
  top: 16px;
  right: 16px;
  bottom: 16px;
  width: min(300px, calc(100vw - 32px));
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.panel};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius};
  backdrop-filter: blur(14px);
  transform: translateX(${({ $visible }) => ($visible ? '0' : 'calc(100% + 24px)')});
  transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
  z-index: 10;
  overflow: hidden;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h1`
  margin: 0;
  font-size: 13px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.gold};
`;

const Fps = styled.span`
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.muted};
`;

const Body = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 6px 16px 16px;
  scrollbar-width: thin;
  scrollbar-color: rgba(212, 166, 64, 0.3) transparent;
`;

const Section = styled.section`
  padding: 12px 0;
  border-bottom: 1px solid rgba(212, 166, 64, 0.1);
  &:last-child { border-bottom: none; }
`;

const SectionTitle = styled.button`
  all: unset;
  display: flex;
  justify-content: space-between;
  width: 100%;
  cursor: pointer;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: 10px;
  &:focus-visible { outline: 1px solid ${({ theme }) => theme.colors.gold}; }
`;

const Stack = styled.div`
  display: grid;
  gap: 14px;
`;

const Wrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Footer = styled.footer`
  padding: 10px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 11px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.muted};
  kbd {
    font-family: inherit;
    padding: 0 5px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    color: ${({ theme }) => theme.colors.text};
  }
`;

interface Props {
  visible: boolean;
  settings: SceneSettings;
  fps: number;
  onChange: (patch: Partial<SceneSettings>) => void;
  onReset: () => void;
  onRandomize: () => void;
  onScreenshot: () => void;
  onFullscreen: () => void;
  onHide: () => void;
}

export function ControlPanel(p: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({ Motion: true, Look: true, Scene: false });
  const { settings: s } = p;

  return (
    <Panel $visible={p.visible} aria-hidden={!p.visible}>
      <Header>
        <Title>Gold Ribbons</Title>
        <Fps>{p.fps ? `${Math.round(p.fps)} fps` : ''}</Fps>
      </Header>
      <Body>
        <Section>
          <Wrap>
            <Button $active={s.paused} onClick={() => p.onChange({ paused: !s.paused })}>
              {s.paused ? 'Play' : 'Pause'}
            </Button>
            <Button onClick={p.onRandomize}>New layout</Button>
            <Button onClick={p.onScreenshot}>Screenshot</Button>
            <Button onClick={p.onFullscreen}>Fullscreen</Button>
            <Button onClick={p.onHide}>Hide</Button>
          </Wrap>
        </Section>
        <Section>
          <SectionTitle as="div">Presets</SectionTitle>
          <Wrap>
            {Object.keys(PRESETS).map((name) => (
              <Button key={name} onClick={() => p.onChange(PRESETS[name])}>
                {name}
              </Button>
            ))}
            <Button onClick={p.onReset}>Reset</Button>
          </Wrap>
        </Section>
        {SLIDER_GROUPS.map((g) => (
          <Section key={g.title}>
            <SectionTitle
              onClick={() => setOpen((o) => ({ ...o, [g.title]: !o[g.title] }))}
              aria-expanded={!!open[g.title]}
            >
              {g.title}
              <span>{open[g.title] ? '−' : '+'}</span>
            </SectionTitle>
            {open[g.title] && (
              <Stack>
                {g.sliders.map((m) => (
                  <Slider
                    key={m.key}
                    label={m.label}
                    min={m.min}
                    max={m.max}
                    step={m.step}
                    value={s[m.key]}
                    onChange={(v) => p.onChange({ [m.key]: v } as Partial<SceneSettings>)}
                  />
                ))}
                {g.title === 'Scene' && <Slider label="Seed" min={1} max={9999} step={1} value={s.seed} onChange={(v) => p.onChange({ seed: v })} />}
              </Stack>
            )}
          </Section>
        ))}
      </Body>
      <Footer>
        <kbd>Space</kbd> pause · <kbd>H</kbd> hide · <kbd>F</kbd> fullscreen · <kbd>S</kbd> screenshot · <kbd>R</kbd> new layout
      </Footer>
    </Panel>
  );
}
