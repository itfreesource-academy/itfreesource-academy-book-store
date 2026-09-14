import React, { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  position?: 'left' | 'right';
  width?: string;
  testId?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  width = 'max-w-md',
  testId = 'drawer'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positionClasses = position === 'right' ? 'right-0' : 'left-0';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" data-testid={`${testId}-wrapper`}>
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        data-testid={`${testId}-backdrop`}
      />

      <div className={`fixed inset-y-0 ${positionClasses} flex max-w-full pl-10`}>
        <div
          className={`w-screen ${width} bg-white shadow-2xl flex flex-col`}
          data-testid={testId}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 data-testid={`${testId}-title`} className="text-lg font-bold text-slate-800">
              {title}
            </h3>
            <button
              onClick={onClose}
              data-testid={`${testId}-close-btn`}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6" data-testid={`${testId}-body`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
