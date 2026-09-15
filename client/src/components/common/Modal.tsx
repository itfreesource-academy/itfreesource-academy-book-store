import React, { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  testId?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'lg',
  testId = 'modal'
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

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      data-testid={`${testId}-backdrop`}
      onClick={onClose}
    >
      <div
        className={`bg-slate-900 rounded-3xl shadow-2xl w-full ${maxWidthClasses[maxWidth]} border border-slate-800 overflow-hidden my-8 text-slate-100`}
        data-testid={testId}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${testId}-title`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3
            id={`${testId}-title`}
            data-testid={`${testId}-title`}
            className="text-lg font-bold text-white"
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            data-testid={`${testId}-close-btn`}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto" data-testid={`${testId}-body`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3"
            data-testid={`${testId}-footer`}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
