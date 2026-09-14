import React, { useState, useEffect } from 'react';
import { BorrowRecord, Currency } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useCurrency, SUPPORTED_CURRENCIES, SUPPORTED_TIMEZONES } from '../context/CurrencyContext.js';
import { useToast } from '../context/ToastContext.js';
import { apiClient } from '../api/client.js';
import { Link } from 'react-router-dom';

export const BorrowedBooksPage: React.FC = () => {
  const { user, isAuthenticated, hasRole } = useAuth();
  const {
    currency,
    timezone,
    setCurrency,
    setTimezone,
    formatPrice,
    formatDateTime,
    formatDateOnly
  } = useCurrency();
  const { addToast } = useToast();

  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'returned' | 'lost'>('all');

  // Interactive Return Simulator Modal / State
  const [simulatingRecord, setSimulatingRecord] = useState<BorrowRecord | null>(null);
  const [simulatedReturnDate, setSimulatedReturnDate] = useState<string>('');
  const [simulatedPreview, setSimulatedPreview] = useState<{
    daysLate: number;
    standardFee: number;
    penaltyFee: number;
    lostFee: number;
    totalFee: number;
    isOverdue: boolean;
  } | null>(null);
  const [isReturning, setIsReturning] = useState(false);

  // Lost Book Confirmation State
  const [lostTargetRecord, setLostTargetRecord] = useState<BorrowRecord | null>(null);
  const [isMarkingLost, setIsMarkingLost] = useState(false);

  const fetchBorrows = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/borrow');
      setBorrows(res.data.data || []);
    } catch (err: any) {
      addToast(err.message || 'Failed to load borrow records.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBorrows();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Handle open return simulator
  const handleOpenReturnModal = (record: BorrowRecord) => {
    setSimulatingRecord(record);
    // Default simulated return date to today's date YYYY-MM-DD
    const todayStr = new Date().toISOString().split('T')[0];
    setSimulatedReturnDate(todayStr);
    fetchPreview(record.id, todayStr);
  };

  // Preview fee API call
  const fetchPreview = async (borrowId: string, returnDate: string) => {
    try {
      const res = await apiClient.get(`/borrow/${borrowId}/preview-fee?returnDate=${returnDate}`);
      setSimulatedPreview(res.data.feeSummary);
    } catch (err: any) {
      // Fallback calculation on client if error
      if (simulatingRecord) {
        const due = new Date(simulatingRecord.dueDate).getTime();
        const ret = new Date(returnDate).getTime();
        const diffDays = Math.ceil((ret - due) / (1000 * 60 * 60 * 24));
        const daysLate = Math.max(0, diffDays);
        const standardFee = 2.0;
        const penaltyFee = Number((daysLate * 0.1).toFixed(2));
        setSimulatedPreview({
          daysLate,
          standardFee,
          penaltyFee,
          lostFee: 0,
          totalFee: Number((standardFee + penaltyFee).toFixed(2)),
          isOverdue: daysLate > 0
        });
      }
    }
  };

  const handleReturnDateChange = (newDate: string) => {
    setSimulatedReturnDate(newDate);
    if (simulatingRecord) {
      fetchPreview(simulatingRecord.id, newDate);
    }
  };

  const handleConfirmReturn = async () => {
    if (!simulatingRecord) return;
    setIsReturning(true);
    try {
      await apiClient.post(`/borrow/${simulatingRecord.id}/return`, {
        returnDate: simulatedReturnDate
      });
      addToast(`Book "${simulatingRecord.bookTitle}" returned successfully!`, 'success');
      setSimulatingRecord(null);
      setSimulatedPreview(null);
      fetchBorrows();
    } catch (err: any) {
      addToast(err.message || 'Failed to process return.', 'error');
    } finally {
      setIsReturning(false);
    }
  };

  const handleConfirmLost = async () => {
    if (!lostTargetRecord) return;
    setIsMarkingLost(true);
    try {
      const res = await apiClient.post(`/borrow/${lostTargetRecord.id}/lost`);
      addToast(
        `Book marked as lost. Replacement penalty fee: ${formatPrice(res.data.data?.lostFee || 0)} applied.`,
        'warning'
      );
      setLostTargetRecord(null);
      fetchBorrows();
    } catch (err: any) {
      addToast(err.message || 'Failed to mark book as lost.', 'error');
    } finally {
      setIsMarkingLost(false);
    }
  };

  const filteredBorrows = borrows.filter((b) => {
    if (filterStatus === 'all') return true;
    return b.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/" className="inline-flex items-center hover:text-blue-600">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Home
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-slate-400">/</span>
              <span className="text-slate-700 font-medium">Borrowed Books & Timezone Rental Hub</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md mb-3">
              <span>⏱️ Regional Timezones & Automated Rates</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Book Borrowing & Return Hub</h1>
            <p className="text-blue-100 text-sm mt-2 max-w-2xl leading-relaxed">
              Standard <strong>10-day loan</strong> for <strong>{formatPrice(2.00)}</strong>. Overdue books incur 
              a <strong>{formatPrice(0.10)} / day</strong> late penalty fee. Lost books incur 
              a <strong>2x Book Price</strong> replacement penalty. Dates and fees dynamically recalculate across 
              5 global timezones and currencies.
            </p>
          </div>

          {/* Controls: Active Currency & Timezone Selectors */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex flex-col space-y-3 min-w-[260px]">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Live Regional Settings
            </div>
            <div>
              <label className="text-xs text-blue-100 block mb-1 font-medium">Active Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full bg-white text-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} - {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-blue-100 block mb-1 font-medium">User Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value as any)}
                className="w-full bg-white text-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                {Object.values(SUPPORTED_TIMEZONES).map((tz) => (
                  <option key={tz.id} value={tz.id}>
                    {tz.region}: {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & QA Rule Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="text-2xl mb-1">📅</div>
          <h3 className="font-bold text-blue-900 text-sm">10-Day Loan Period</h3>
          <p className="text-xs text-blue-700 mt-1">
            Flat fee of <strong>{formatPrice(2.00)}</strong> covers full 10 calendar days based on regional timezone.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="text-2xl mb-1">⏳</div>
          <h3 className="font-bold text-amber-900 text-sm">Overdue Penalty</h3>
          <p className="text-xs text-amber-700 mt-1">
            <strong>{formatPrice(0.10)} / day</strong> accrued daily for every day returned beyond due date.
          </p>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
          <div className="text-2xl mb-1">⚠️</div>
          <h3 className="font-bold text-rose-900 text-sm">Lost Book Penalty</h3>
          <p className="text-xs text-rose-700 mt-1">
            <strong>2x Book Retail Price</strong> charged automatically if book is declared lost or damaged.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <div className="text-2xl mb-1">🌍</div>
          <h3 className="font-bold text-emerald-900 text-sm">5 Global Currencies</h3>
          <p className="text-xs text-emerald-700 mt-1">
            Seamless conversions: USD ($), AED (AED), INR (₹), JPY (¥), and AUD (A$).
          </p>
        </div>
      </div>

      {/* Main Borrow Records Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All ({borrows.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterStatus === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Active ({borrows.filter((b) => b.status === 'active').length})
            </button>
            <button
              onClick={() => setFilterStatus('returned')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterStatus === 'returned'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Returned ({borrows.filter((b) => b.status === 'returned').length})
            </button>
            <button
              onClick={() => setFilterStatus('lost')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                filterStatus === 'lost'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Lost ({borrows.filter((b) => b.status === 'lost').length})
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchBorrows}
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center space-x-1.5 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
            >
              <span>🔄</span>
              <span>Refresh Records</span>
            </button>
            <Link
              to="/books"
              className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-lg transition shadow-xs"
            >
              + Borrow Another Book
            </Link>
          </div>
        </div>

        {/* Content Table / List */}
        {!isAuthenticated ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">🔒</div>
            <h3 className="text-base font-bold text-slate-800">Login to View Borrowed Books</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Please sign in with one of the 10 personas to track your borrowed books and calculate return fees.
            </p>
            <Link
              to="/login"
              className="inline-block mt-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
            >
              Sign In
            </Link>
          </div>
        ) : isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-sm">Loading borrow records...</span>
          </div>
        ) : filteredBorrows.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-base font-bold text-slate-700">No Borrow Records Found</h3>
            <p className="text-xs text-slate-400 mt-1">
              {filterStatus === 'all'
                ? "You haven't borrowed any books yet. Browse the catalog to borrow one!"
                : `No books with status "${filterStatus}".`}
            </p>
            <Link
              to="/books"
              className="inline-block mt-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Book</th>
                  <th className="py-3.5 px-4">Borrower</th>
                  <th className="py-3.5 px-4">Borrowed Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Fee Breakdown</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBorrows.map((record) => {
                  const isLate = record.status === 'active' && new Date(record.dueDate) < new Date();
                  return (
                    <tr key={record.id} className="hover:bg-slate-50/75 transition">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={record.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300'}
                            alt={record.bookTitle}
                            className="w-10 h-14 object-cover rounded shadow-xs flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300';
                            }}
                          />
                          <div>
                            <Link
                              to={`/books/${record.bookId}`}
                              className="font-bold text-slate-900 hover:text-blue-600 line-clamp-1 text-sm"
                            >
                              {record.bookTitle}
                            </Link>
                            <span className="text-[11px] text-slate-400 font-mono">
                              ID: {record.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs">
                        <span className="font-semibold text-slate-800">{record.username}</span>
                        <span className="block text-[11px] text-slate-400">{record.timezone}</span>
                      </td>

                      <td className="py-4 px-4 text-xs">
                        <span className="font-medium text-slate-700">
                          {formatDateOnly(record.borrowDate)}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          {formatDateTime(record.borrowDate)}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-xs">
                        <span className={`font-medium ${isLate ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                          {formatDateOnly(record.dueDate)}
                        </span>
                        {isLate && (
                          <span className="inline-block text-[10px] px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold mt-0.5">
                            Overdue!
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {record.status === 'active' && !isLate && (
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Active Loan
                          </span>
                        )}
                        {record.status === 'active' && isLate && (
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 animate-pulse">
                            Overdue
                          </span>
                        )}
                        {record.status === 'returned' && (
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                            Returned
                          </span>
                        )}
                        {record.status === 'lost' && (
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-200 text-slate-800">
                            Lost (2x Fee)
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-xs">
                        <div className="font-bold text-slate-900 text-sm">
                          {formatPrice(record.totalFee)}
                        </div>
                        <div className="text-[11px] text-slate-500 space-y-0.5">
                          <div>Base: {formatPrice(record.standardFee)}</div>
                          {record.penaltyFee > 0 && (
                            <div className="text-amber-600">Late: +{formatPrice(record.penaltyFee)}</div>
                          )}
                          {record.lostFee > 0 && (
                            <div className="text-rose-600">Lost Fee: +{formatPrice(record.lostFee)}</div>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        {record.status === 'active' ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleOpenReturnModal(record)}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs"
                            >
                              Return Book
                            </button>
                            <button
                              onClick={() => setLostTargetRecord(record)}
                              className="px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
                              title="Mark book as lost (applies 2x price penalty)"
                            >
                              Lost
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Closed on {formatDateOnly(record.returnedDate || record.dueDate)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive Time-Travel Return Simulator Modal */}
      {simulatingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">⏳</span>
                  <h3 className="text-lg font-bold">Return Book & Fee Simulator</h3>
                </div>
                <button
                  onClick={() => setSimulatingRecord(null)}
                  className="text-white/80 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition"
                >
                  ✕
                </button>
              </div>
              <p className="text-blue-100 text-xs mt-1">
                Simulate returning at any date to test on-time and overdue fee calculations.
              </p>
            </div>

            <div className="p-6 space-y-5">
              {/* Record Summary */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-900 text-sm">{simulatingRecord.bookTitle}</div>
                <div className="text-slate-500">
                  Borrowed: <strong>{formatDateOnly(simulatingRecord.borrowDate)}</strong> | Due: <strong>{formatDateOnly(simulatingRecord.dueDate)}</strong>
                </div>
              </div>

              {/* Date Input for Time-Travel Testing */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Simulate / Actual Return Date:
                </label>
                <input
                  type="date"
                  value={simulatedReturnDate}
                  onChange={(e) => handleReturnDateChange(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Adjust this date to simulate early, on-time, or late returns to test penalty calculation.
                </span>
              </div>

              {/* Dynamic Live Calculation Card */}
              {simulatedPreview && (
                <div className="border border-indigo-100 bg-indigo-50/50 rounded-xl p-4 space-y-3">
                  <h4 className="font-bold text-indigo-950 text-xs uppercase tracking-wider flex items-center justify-between">
                    <span>Calculation Breakdown</span>
                    {simulatedPreview.isOverdue ? (
                      <span className="text-rose-600 font-bold normal-case text-xs">
                        ⚠️ {simulatedPreview.daysLate} Day(s) Overdue
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-bold normal-case text-xs">
                        ✅ On Time
                      </span>
                    )}
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Standard 10-Day Rental Fee:</span>
                      <span className="font-semibold">{formatPrice(simulatedPreview.standardFee)}</span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>
                        Overdue Penalty ({simulatedPreview.daysLate} days × {formatPrice(0.10)}/day):
                      </span>
                      <span className={`font-semibold ${simulatedPreview.penaltyFee > 0 ? 'text-amber-600' : ''}`}>
                        +{formatPrice(simulatedPreview.penaltyFee)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-indigo-200/60 flex justify-between items-center text-sm font-bold text-indigo-950">
                      <span>Total Amount Payable:</span>
                      <span className="text-lg text-blue-700 font-extrabold">
                        {formatPrice(simulatedPreview.totalFee)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSimulatingRecord(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isReturning}
                onClick={handleConfirmReturn}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-50 flex items-center space-x-2"
              >
                {isReturning ? 'Processing Return...' : `Confirm Return & Pay ${formatPrice(simulatedPreview?.totalFee || 2.00)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark As Lost Confirmation Modal */}
      {lostTargetRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100">
            <div className="text-3xl mb-2">⚠️</div>
            <h3 className="text-lg font-bold text-slate-900">Mark Book as Lost?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Per bookstore policy, declaring &ldquo;<strong>{lostTargetRecord.bookTitle}</strong>&rdquo; as lost 
              charges a replacement penalty of <strong>2x Book Retail Price</strong>.
            </p>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 my-4 text-xs text-rose-800">
              <div className="flex justify-between">
                <span>Standard Rental Fee:</span>
                <span className="font-semibold">{formatPrice(lostTargetRecord.standardFee)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Replacement Penalty (2x):</span>
                <span className="font-bold text-rose-700">Applied upon confirmation</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setLostTargetRecord(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                disabled={isMarkingLost}
                onClick={handleConfirmLost}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition shadow-sm disabled:opacity-50"
              >
                {isMarkingLost ? 'Processing...' : 'Confirm Lost & Charge Penalty'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
