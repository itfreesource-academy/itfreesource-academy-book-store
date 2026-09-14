import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      data-testid="breadcrumbs-nav"
      className="flex items-center space-x-2 text-sm text-slate-500 py-3 overflow-x-auto"
    >
      <Link
        to="/"
        data-testid="breadcrumb-home"
        className="flex items-center hover:text-brand-600 transition-colors"
      >
        <Home className="w-4 h-4 mr-1" />
        <span>Home</span>
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            {isLast || !item.href ? (
              <span
                data-testid={`breadcrumb-item-${idx}`}
                className="font-medium text-slate-800 truncate"
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                data-testid={`breadcrumb-link-${idx}`}
                className="hover:text-brand-600 transition-colors truncate"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
