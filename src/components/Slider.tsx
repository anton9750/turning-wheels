import styled from 'styled-components';

const Row = styled.label`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 10px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`;

const Value = styled.span`
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  grid-column: 1 / -1;
  width: 100%;
  appearance: none;
  height: 3px;
  border-radius: 2px;
  background: rgba(212, 166, 64, 0.25);
  outline: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.gold};
    box-shadow: 0 0 0 3px rgba(212, 166, 64, 0.2);
    cursor: pointer;
  }
  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border: none;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.gold};
    cursor: pointer;
  }
  &:focus-visible::-webkit-slider-thumb {
    box-shadow: 0 0 0 4px rgba(243, 215, 138, 0.5);
  }
`;

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}

export function Slider({ label, value, min, max, step, onChange }: Props) {
  const decimals = step >= 1 ? 0 : step >= 0.01 ? 2 : 3;
  return (
    <Row>
      {label}
      <Value>{value.toFixed(decimals)}</Value>
      <Input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Row>
  );
}
