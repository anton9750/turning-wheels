import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0%, 100% { opacity: 0.3; transform: scaleX(0.6); }
  50% { opacity: 1; transform: scaleX(1); }
`;

const Veil = styled.div<{ $hidden: boolean }>`
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: #000;
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
  pointer-events: ${({ $hidden }) => ($hidden ? 'none' : 'auto')};
  transition: opacity 1.6s ease;
  z-index: 20;
`;

const Bar = styled.div`
  width: 120px;
  height: 2px;
  background: linear-gradient(90deg, transparent, ${({ theme }) => theme.colors.gold}, transparent);
  animation: ${pulse} 1.4s ease-in-out infinite;
`;

export function LoadingVeil({ hidden }: { hidden: boolean }) {
  return (
    <Veil $hidden={hidden} aria-hidden={hidden}>
      <Bar />
    </Veil>
  );
}
