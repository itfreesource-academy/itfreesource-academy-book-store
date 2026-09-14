import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client.js';
import { Breadcrumbs } from '../components/common/Breadcrumbs.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { Layers, AlertTriangle, CheckCircle2, ArrowUpRight, Search, Sliders } from 'lucide-react';

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

  const { hasPermission } = useAuth();
  const { addToast } = useToast();

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
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-900" data-testid="inv-total-stock">
              {totalStock}
            </h4>
            <span className="text-xs text-slate-500 font-medium">Total Books in Stock</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-900" data-testid="inv-low-stock-count">
              {lowStockCount}
            </h4>
            <span className="text-xs text-slate-500 font-medium">Low Stock Alerts (&lt; 15 units)</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-900">{inventory.length}</h4>
            <span className="text-xs text-slate-500 font-medium">Catalog SKUs Managed</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter inventory by book title, ISBN, or genre..."
          data-testid="inv-search-input"
          className="w-full text-xs outline-none bg-transparent"
        />
      </div>

      {/* Inventory Table with Interactive Sliders */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600" data-testid="inventory-table">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-4 px-4">Book Title & ISBN</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Unit Price</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 min-w-[220px]">Stock Slider Adjustment</th>
                <th className="py-4 px-4 text-right">Batch Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100" data-testid="inventory-table-body">
              {filteredItems.map((item) => {
                const isLow = item.stock < 15;
                return (
                  <tr key={item.id} data-testid={`inv-row-${item.id}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-bold text-slate-900 block truncate">{item.title}</span>
                      <span className="text-[11px] text-slate-500">ISBN: {item.isbn}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {item.categoryName}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">${item.price.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span
                        data-testid={`stock-status-pill-${item.id}`}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isLow ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
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
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600 disabled:opacity-40"
                        />
                        <span
                          data-testid={`inv-stock-val-${item.id}`}
                          className="w-12 text-center font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md"
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
                          className="px-2.5 py-1 bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white border border-brand-200 text-xs font-semibold rounded-lg transition-colors"
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
    </div>
  );
};
