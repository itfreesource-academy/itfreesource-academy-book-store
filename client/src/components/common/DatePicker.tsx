import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  label?: string;
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  testId?: string;
  required?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Select date',
  testId = 'date-picker',
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    return value ? new Date(value + 'T00:00:00') : new Date();
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDate = (day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateStr = `${year}-${mm}-${dd}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  return (
    <div className="relative w-full" ref={containerRef} data-testid={`${testId}-wrapper`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div
        onClick={() => setIsOpen(!isOpen)}
        data-testid={`${testId}-input`}
        className="flex items-center justify-between px-3 py-2 border border-slate-700 rounded-lg bg-slate-950/80 cursor-pointer hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
      >
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-indigo-400" />
          <span
            data-testid={`${testId}-display`}
            className={value ? 'text-slate-100 font-medium' : 'text-slate-500'}
          >
            {value || placeholder}
          </span>
        </div>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-slate-500 hover:text-slate-300 p-0.5 rounded"
            data-testid={`${testId}-clear-btn`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          data-testid={`${testId}-popover`}
          className="absolute left-0 mt-2 z-40 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 w-72 animate-fade-in text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white"
              data-testid={`${testId}-prev-month`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-200 text-sm">
              {monthNames[month]} {year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white"
              data-testid={`${testId}-next-month`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <span key={d} className="text-xs font-semibold text-slate-500">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, idx) => (
              <div key={`empty-${idx}`} />
            ))}
            {Array.from({ length: totalDays }).map((_, idx) => {
              const day = idx + 1;
              const mm = String(month + 1).padStart(2, '0');
              const dd = String(day).padStart(2, '0');
              const dateStr = `${year}-${mm}-${dd}`;
              const isSelected = value === dateStr;
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              const isDisabled = Boolean(
                (minDate && dateStr < minDate) || (maxDate && dateStr > maxDate)
              );

              return (
                <button
                  type="button"
                  key={day}
                  disabled={isDisabled}
                  onClick={() => handleSelectDate(day)}
                  data-testid={`${testId}-day-${day}`}
                  className={`h-8 w-8 text-xs font-medium rounded-lg flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold'
                      : isToday
                      ? 'bg-indigo-950/60 text-indigo-300 font-semibold border border-indigo-700'
                      : isDisabled
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick preset buttons */}
          <div className="mt-3 pt-3 border-t border-slate-800 flex justify-between">
            <button
              type="button"
              onClick={() => {
                const today = new Date().toISOString().split('T')[0];
                onChange(today);
                setIsOpen(false);
              }}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              data-testid={`${testId}-btn-today`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                onChange(tomorrow);
                setIsOpen(false);
              }}
              className="text-xs font-semibold text-slate-400 hover:text-slate-200"
              data-testid={`${testId}-btn-tomorrow`}
            >
              Tomorrow
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
