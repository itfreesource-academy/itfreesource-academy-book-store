import React, { useState, useEffect, useCallback } from 'react';
import { Review } from '../types/index.js';
import { apiClient } from '../api/client.js';
import { Breadcrumbs } from '../components/common/Breadcrumbs.js';
import { StarRating } from '../components/common/StarRating.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { Check, X, MessageSquare, Clock, CheckCircle2, XCircle } from 'lucide-react';

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);

  const { hasPermission } = useAuth();
  const { addToast } = useToast();

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/reviews', { params: { status: statusFilter } });
      setReviews(res.data.reviews || []);
    } catch (err: any) {
      addToast(err.message || 'Failed to load reviews.', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, addToast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleModerate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await apiClient.patch(`/reviews/${id}/status`, { status });
      addToast(`Review has been marked as ${status}.`, 'success');
      fetchReviews();
    } catch (err: any) {
      addToast(err.message || 'Moderation action failed.', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-16" data-testid="reviews-page">
      <Breadcrumbs items={[{ label: 'Review Moderation' }]} />

      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white" data-testid="reviews-title">
            Review Moderation Queue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review, verify, and approve community critiques before publication
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              data-testid={`review-filter-${st}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-12 text-center shadow-2xl backdrop-blur-xl" data-testid="no-reviews-msg">
            <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-400">No reviews found in this status queue.</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              data-testid={`moderation-card-${rev.id}`}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white text-xs">@{rev.username}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(rev.createdAt).toLocaleString()}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      rev.status === 'approved'
                        ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                        : rev.status === 'rejected'
                        ? 'bg-rose-950/60 border-rose-800/60 text-rose-300'
                        : 'bg-amber-950/60 border-amber-800/60 text-amber-300'
                    }`}
                  >
                    {rev.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <StarRating rating={rev.rating} size="sm" />
                  <h4 className="font-bold text-white text-sm">{rev.title}</h4>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">{rev.comment}</p>
              </div>

              {/* Action Buttons */}
              {hasPermission('reviews:moderate') && (
                <div className="flex items-center md:flex-col justify-end gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleModerate(rev.id, 'approved')}
                    disabled={rev.status === 'approved'}
                    data-testid={`approve-btn-${rev.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-800/80 text-xs font-bold rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleModerate(rev.id, 'rejected')}
                    disabled={rev.status === 'rejected'}
                    data-testid={`reject-btn-${rev.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-800/80 text-xs font-bold rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
