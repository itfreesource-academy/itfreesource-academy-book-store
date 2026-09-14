import React from 'react';
import { DatePicker } from './DatePicker.js';
import { CalendarRange } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onRangeChange: (start: string, end: string) => void;
  label?: string;
  testId?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onRangeChange,
  label = 'Date Filter Range',
  testId = 'date-range-picker'
}) => {
  const setPreset = (preset: 'today' | '7days' | '30days' | 'all') => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'today') {
      onRangeChange(todayStr, todayStr);
    } else if (preset === '7days') {
      const past = new Date(Date.now() - 7 * 86400000);
      onRangeChange(past.toISOString().split('T')[0], todayStr);
    } else if (preset === '30days') {
      const past = new Date(Date.now() - 30 * 86400000);
      onRangeChange(past.toISOString().split('T')[0], todayStr);
    } else if (preset === 'all') {
      onRangeChange('', '');
    }
  };

  return (
    <div className="w-full" data-testid={testId}>
      {label && (
        <div className="flex items-center gap-1.5 mb-2">
          <CalendarRange className="w-4 h-4 text-brand-600" />
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</span>
        </div>
      )}

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-1.5 mb-3" data-testid={`${testId}-presets`}>
        <button
          type="button"
          onClick={() => setPreset('today')}
          data-testid={`${testId}-preset-today`}
          className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-600 transition-colors"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => setPreset('7days')}
          data-testid={`${testId}-preset-7days`}
          className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-600 transition-colors"
        >
          Last 7 Days
        </button>
        <button
          type="button"
          onClick={() => setPreset('30days')}
          data-testid={`${testId}-preset-30days`}
          className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-600 transition-colors"
        >
          Last 30 Days
        </button>
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={() => setPreset('all')}
            data-testid={`${testId}-preset-clear`}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
          >
            Clear Dates
          </button>
        )}
      </div>

      {/* Date Pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={(val) => onRangeChange(val, endDate)}
          placeholder="Start date"
          testId={`${testId}-start`}
        />
        <DatePicker
          label="End Date"
          value={endDate}
          minDate={startDate}
          onChange={(val) => onRangeChange(startDate, val)}
          placeholder="End date"
          testId={`${testId}-end`}
        />
      </div>
    </div>
  );
};
