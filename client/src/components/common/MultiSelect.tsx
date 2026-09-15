import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

interface MultiSelectProps {
  label?: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  testId?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selected,
  onChange,
  placeholder = 'Select multiple tags...',
  testId = 'multi-select'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((item) => item !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  const removeOption = (opt: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== opt));
  };

  return (
    <div className="relative w-full" ref={containerRef} data-testid={testId}>
      {label && (
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}

      <div
        data-testid={`${testId}-trigger`}
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[42px] flex items-center justify-between p-1.5 bg-slate-950 border border-slate-700 rounded-lg cursor-pointer hover:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500 transition-all text-sm"
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selected.length === 0 ? (
            <span className="text-slate-500 px-2 text-xs">{placeholder}</span>
          ) : (
            selected.map((item) => (
              <span
                key={item}
                data-testid={`${testId}-chip-${item}`}
                className="inline-flex items-center gap-1 bg-indigo-950 text-indigo-200 border border-indigo-700/60 text-xs px-2 py-0.5 rounded-md font-medium"
              >
                {item}
                <button
                  type="button"
                  onClick={(e) => removeOption(item, e)}
                  className="hover:text-white rounded p-0.5"
                  data-testid={`${testId}-remove-${item}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 mr-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div
          data-testid={`${testId}-dropdown`}
          className="absolute left-0 right-0 mt-1 z-40 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-h-52 overflow-y-auto py-1 animate-fade-in"
        >
          {options.map((opt) => {
            const isSelected = selected.includes(opt);
            return (
              <div
                key={opt}
                data-testid={`${testId}-option-${opt}`}
                onClick={() => toggleOption(opt)}
                className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer transition-colors ${
                  isSelected ? 'bg-indigo-950/80 text-indigo-300 font-semibold' : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    data-testid={`${testId}-checkbox-${opt}`}
                    className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                  />
                  <span>{opt}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
