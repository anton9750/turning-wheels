import { forwardRef } from 'react';
import styled from 'styled-components';

const Root = styled.div`
  position: fixed;
  inset: 0;
  background: #000;
  touch-action: none;

  canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
  }
`;

export const Stage = forwardRef<HTMLDivElement>(function Stage(_, ref) {
  return <Root ref={ref} aria-label="Animated gold ribbons" role="img" />;
});
