import styled from 'styled-components';

export const Button = styled.button<{ $active?: boolean }>`
  appearance: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ $active }) => ($active ? 'rgba(212, 166, 64, 0.22)' : 'rgba(255, 255, 255, 0.03)')};
  color: ${({ theme, $active }) => ($active ? theme.colors.goldBright : theme.colors.text)};
  padding: 7px 10px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.gold};
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.goldBright};
    outline-offset: 2px;
  }
`;
