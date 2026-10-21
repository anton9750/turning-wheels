import styled from 'styled-components';

const Btn = styled.button<{ $visible: boolean }>`
  position: fixed;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: rgba(0, 0, 0, 0.4);
  color: ${({ theme }) => theme.colors.gold};
  cursor: pointer;
  opacity: ${({ $visible }) => ($visible ? 0.35 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  transition: opacity 0.3s;
  z-index: 5;
  &:hover, &:focus-visible { opacity: 1; }
`;

export function ShowUiButton({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  return (
    <Btn $visible={visible} onClick={onClick} aria-label="Show controls" title="Show controls (H)">
      ⚙
    </Btn>
  );
}
