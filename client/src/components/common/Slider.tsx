import React from 'react';

interface SingleSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  testId?: string;
}

export const SingleSlider: React.FC<SingleSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  testId = 'single-slider'
}) => {
  return (
    <div className="w-full" data-testid={testId}>
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
        <span
          data-testid={`${testId}-value`}
          className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200"
        >
          {unit}{value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        data-testid={`${testId}-input`}
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
        <span>{unit}{min}</span>
        <span>{unit}{max}</span>
      </div>
    </div>
  );
};

interface DualRangeSliderProps {
  label: string;
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  step?: number;
  unit?: string;
  onChange: (minVal: number, maxVal: number) => void;
  testId?: string;
}

export const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  label,
  min,
  max,
  minValue,
  maxValue,
  step = 1,
  unit = '$',
  onChange,
  testId = 'dual-range-slider'
}) => {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(parseFloat(e.target.value), maxValue - step);
    onChange(value, maxValue);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(parseFloat(e.target.value), minValue + step);
    onChange(minValue, value);
  };

  return (
    <div className="w-full" data-testid={testId}>
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
        <span
          data-testid={`${testId}-value`}
          className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200"
        >
          {unit}{minValue} - {unit}{maxValue}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-[10px] text-slate-400 block mb-0.5">Min</label>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={minValue}
            onChange={handleMinChange}
            data-testid={`${testId}-min-input`}
            aria-label={`${label} minimum`}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-slate-400 block mb-0.5">Max</label>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={maxValue}
            onChange={handleMaxChange}
            data-testid={`${testId}-max-input`}
            aria-label={`${label} maximum`}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
          />
        </div>
      </div>
    </div>
  );
};
