import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client.js';
import { Breadcrumbs } from '../components/common/Breadcrumbs.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { exportToCsv } from '../utils/csvHelper.js';
import { BulkImportModal } from '../components/common/BulkImportModal.js';
import { useCurrency } from '../context/CurrencyContext.js';
import {
  Layers,
  AlertTriangle,
  CheckCircle2,
  Search,
  Download,
  Upload
} from 'lucide-react';

interface InventoryItem {
  id: string;
  title: string;
  isbn: string;
  stock: number;
  price: number;
  categoryName: string;
}

export const InventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [totalStock, setTotalStock] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const { hasPermission } = useAuth();
  const { addToast } = useToast();
  const { formatPrice } = useCurrency();

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/inventory');
      setInventory(res.data.books || []);
      setTotalStock(res.data.totalStock || 0);
      setLowStockCount(res.data.lowStockCount || 0);
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch inventory data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleStockUpdate = async (id: string, newStock: number) => {
    try {
      await apiClient.patch(`/inventory/${id}/stock`, { stock: newStock });
      addToast('Inventory stock updated successfully.', 'success');
      setInventory((prev) =>
        prev.map((item) => (item.id === id ? { ...item, stock: newStock } : item))
      );
    } catch (err: any) {
      addToast(err.message || 'Failed to update stock.', 'error');
    }
  };

  const handleExportCsv = () => {
    const data = inventory.map((item) => ({
      id: item.id,
      title: item.title,
      isbn: item.isbn,
      stock: item.stock,
      price: item.price,
      categoryName: item.categoryName
    }));
    exportToCsv(data, 'itfreesource-bookstore-inventory.csv');
    addToast('Inventory exported to Excel CSV format!', 'success');
  };

  const handleBulkImport = async (rows: Record<string, string>[]) => {
    const updates = rows
      .map((r) => ({
        id: r.id || r.bookId || r.book_id || '',
        isbn: r.isbn,
        stock: parseInt(r.stock || '0', 10)
      }))
      .filter((u) => (u.id || u.isbn) && !isNaN(u.stock));

    if (updates.length === 0) {
      throw new Error('No valid stock updates found. Columns required: id (or isbn), stock');
    }

    const res = await apiClient.post('/inventory/bulk', { updates });
    addToast(`Updated stock for ${res.data.updated} books successfully!`, 'success');
    fetchInventory();
  };

  const filteredItems = inventory.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.isbn.includes(search) ||
      item.categoryName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16" data-testid="inventory-page">
      <Breadcrumbs items={[{ label: 'Inventory Management' }]} />

      {/* Header and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-950/60 border border-indigo-800/80 text-indigo-400 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-white" data-testid="inv-total-stock">
              {totalStock}
            </h4>
            <span className="text-xs text-slate-400 font-medium">Total Books in Stock</span>
          </div>
        </div>

        <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-400 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-white" data-testid="inv-low-stock-count">
              {lowStockCount}
            </h4>
            <span className="text-xs text-slate-400 font-medium">Low Stock Alerts (&lt; 15 units)</span>
          </div>
        </div>

        <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-white">{inventory.length}</h4>
            <span className="text-xs text-slate-400 font-medium">Catalog SKUs Managed</span>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search + Export/Import CSV */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto sm:flex-1">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter inventory by book title, ISBN, or genre..."
            data-testid="inv-search-input"
            className="w-full text-xs outline-none bg-transparent text-slate-100 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Export Inventory CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            data-testid="export-inventory-csv-btn"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            title="Export full inventory list to Excel CSV format with UTF-8 BOM"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          {/* Bulk Import Stock CSV */}
          {hasPermission('inventory:update') && (
            <button
              type="button"
              onClick={() => setIsBulkModalOpen(true)}
              data-testid="import-inventory-csv-btn"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700 transition-colors"
              title="Bulk update book stock counts from CSV"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Bulk Stock Import</span>
            </button>
          )}
        </div>
      </div>

      {/* Inventory Table with Interactive Sliders */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300" data-testid="inventory-table">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-4 px-4">Book Title & ISBN</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Unit Price</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 min-w-[220px]">Stock Slider Adjustment</th>
                <th className="py-4 px-4 text-right">Batch Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800" data-testid="inventory-table-body">
              {filteredItems.map((item) => {
                const isLow = item.stock < 15;
                return (
                  <tr key={item.id} data-testid={`inv-row-${item.id}`} className="hover:bg-slate-800/60 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-bold text-white block truncate">{item.title}</span>
                      <span className="text-[11px] text-slate-400">ISBN: {item.isbn}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {item.categoryName}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white" data-testid={`inv-price-${item.id}`}>{formatPrice(item.price)}</td>
                    <td className="py-3 px-4">
                      <span
                        data-testid={`stock-status-pill-${item.id}`}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isLow ? 'bg-amber-950/60 border border-amber-800/60 text-amber-300' : 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-300'
                        }`}
                      >
                        {isLow ? 'LOW STOCK' : 'HEALTHY'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {/* Stock Slider */}
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="150"
                          value={item.stock}
                          disabled={!hasPermission('inventory:update')}
                          onChange={(e) => handleStockUpdate(item.id, parseInt(e.target.value, 10))}
                          data-testid={`inv-stock-slider-${item.id}`}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-40"
                        />
                        <span
                          data-testid={`inv-stock-val-${item.id}`}
                          className="w-12 text-center font-black text-white bg-slate-800 border border-slate-700 px-2 py-1 rounded-md"
                        >
                          {item.stock}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {hasPermission('inventory:update') && (
                        <button
                          onClick={() => handleStockUpdate(item.id, item.stock + 50)}
                          data-testid={`inv-restock-btn-${item.id}`}
                          className="px-2.5 py-1 bg-indigo-950/60 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-800/80 text-xs font-semibold rounded-lg transition-colors"
                        >
                          +50 Units
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Stock Import Modal */}
      <BulkImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk Update Inventory Stock"
        sampleHeaders={['id', 'isbn', 'stock']}
        sampleRows={[
          { id: 'book_001', isbn: '978-0132350884', stock: '75' },
          { id: 'book_002', isbn: '978-0134757599', stock: '40' },
          { id: 'book_003', isbn: '978-0441172719', stock: '90' }
        ]}
        onImport={handleBulkImport}
      />
    </div>
  );
};

export default InventoryPage;
