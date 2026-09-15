import React, { useState } from 'react';
import { Book } from '../../types/index.js';
import { Link } from 'react-router-dom';
import { Star, Edit, Trash2, Eye, ArrowUpDown, MoreVertical, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useCurrency } from '../../context/CurrencyContext.js';

interface BookTableProps {
  books: Book[];
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
}

export const BookTable: React.FC<BookTableProps> = ({
  books,
  onEdit,
  onDelete,
  sortColumn,
  sortDirection,
  onSort
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { hasPermission } = useAuth();
  const { formatPrice } = useCurrency();

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(books.map(b => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkExport = () => {
    const selectedBooks = books.filter(b => selectedIds.includes(b.id));
    const jsonStr = JSON.stringify(selectedBooks, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `itfreesource-books-export-${Date.now()}.json`;
    a.click();
  };

  const isAllSelected = books.length > 0 && selectedIds.length === books.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < books.length;

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl shadow-black/30" data-testid="book-data-table-wrapper">
      {/* Table Toolbar / Bulk Actions */}
      {selectedIds.length > 0 && (
        <div
          data-testid="bulk-actions-toolbar"
          className="bg-indigo-950/60 border-b border-indigo-900/50 px-6 py-3 flex items-center justify-between text-xs animate-fade-in"
        >
          <span className="font-bold text-indigo-300" data-testid="selected-count-label">
            {selectedIds.length} items selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkExport}
              data-testid="bulk-export-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-indigo-300 font-semibold rounded-lg border border-indigo-800 hover:bg-slate-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            {hasPermission('catalog:delete') && (
              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedIds.length} books?`)) {
                    selectedIds.forEach(id => onDelete(id));
                    setSelectedIds([]);
                  }
                }}
                data-testid="bulk-delete-btn"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bulk Delete</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300" data-testid="books-table">
          <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
            <tr>
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isIndeterminate;
                  }}
                  onChange={handleSelectAll}
                  data-testid="table-select-all-checkbox"
                  className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4 bg-slate-950 border-slate-700"
                  aria-label="Select all rows"
                />
              </th>
              <th className="py-4 px-3">Cover</th>
              <th
                className="py-4 px-3 cursor-pointer hover:text-indigo-400"
                onClick={() => onSort && onSort('title')}
                data-testid="sort-col-title"
              >
                <div className="flex items-center gap-1">
                  <span>Book Details</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-4 px-3">Category</th>
              <th
                className="py-4 px-3 cursor-pointer hover:text-indigo-400"
                onClick={() => onSort && onSort('price')}
                data-testid="sort-col-price"
              >
                <div className="flex items-center gap-1">
                  <span>Price</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                className="py-4 px-3 cursor-pointer hover:text-indigo-400"
                onClick={() => onSort && onSort('rating')}
                data-testid="sort-col-rating"
              >
                <div className="flex items-center gap-1">
                  <span>Rating</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                className="py-4 px-3 cursor-pointer hover:text-indigo-400"
                onClick={() => onSort && onSort('stock')}
                data-testid="sort-col-stock"
              >
                <div className="flex items-center gap-1">
                  <span>Stock</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800" data-testid="books-table-body">
            {books.map((book) => {
              const isSelected = selectedIds.includes(book.id);
              return (
                <tr
                  key={book.id}
                  data-testid={`table-row-${book.id}`}
                  className={`hover:bg-slate-800/60 transition-colors ${
                    isSelected ? 'bg-indigo-950/40' : ''
                  }`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleRow(book.id)}
                      data-testid={`row-checkbox-${book.id}`}
                      className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4 bg-slate-950 border-slate-700"
                      aria-label={`Select ${book.title}`}
                    />
                  </td>
                  <td className="py-3 px-3">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-10 h-14 object-cover rounded shadow-sm border border-slate-800"
                    />
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <Link
                      to={`/books/${book.id}`}
                      data-testid={`table-link-${book.id}`}
                      className="font-bold text-slate-100 hover:text-indigo-400 block line-clamp-1"
                    >
                      {book.title}
                    </Link>
                    <span className="text-[11px] text-slate-400 block">
                      {book.authorName} • ISBN: {book.isbn}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                      {book.categoryName}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-white" data-testid={`table-price-${book.id}`}>
                    {formatPrice(book.price)}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{book.rating}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      data-testid={`stock-badge-${book.id}`}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        book.stock > 20
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50'
                          : book.stock > 0
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800/50'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-800/50'
                      }`}
                    >
                      {book.stock} units
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/books/${book.id}`}
                        data-testid={`action-view-${book.id}`}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {hasPermission('catalog:update') && (
                        <button
                          onClick={() => onEdit(book)}
                          data-testid={`action-edit-${book.id}`}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Book"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}

                      {hasPermission('catalog:delete') && (
                        <button
                          onClick={() => onDelete(book.id)}
                          data-testid={`action-delete-${book.id}`}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete Book"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
