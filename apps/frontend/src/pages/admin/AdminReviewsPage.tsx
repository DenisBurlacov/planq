import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Search, Check, X, Trash2 } from 'lucide-react';
import { StarRating } from '@components/ui/StarRating';
import { Modal } from '@components/ui/Modal';
import { apiFetch } from '@api/client';
import type { PaginatedResponse } from '@appTypes/api';

interface AdminReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  status?: 'approved' | 'pending' | 'rejected';
  user: { id: string; name: string; avatar: string | null };
  product?: { id: string; name: string };
}

export function AdminReviewsPage() {
  const { t } = useTranslation('admin');
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => apiFetch<PaginatedResponse<AdminReview>>('/api/v1/admin/reviews?limit=100'),
  });

  const reviews = useMemo(() => {
    let items = data?.items ?? [];
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        r =>
          (r.product?.name ?? '').toLowerCase().includes(q) || r.user.name.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      items = items.filter(r => (r.status ?? 'approved') === statusFilter);
    }
    if (ratingFilter !== 'all') {
      items = items.filter(r => r.rating === +ratingFilter);
    }
    return items;
  }, [data, search, statusFilter, ratingFilter]);

  const handleApprove = async (id: string) => {
    try {
      await apiFetch(`/api/v1/admin/reviews/${id}/approve`, { method: 'PUT' });
      await qc.invalidateQueries({ queryKey: ['admin-reviews'] });
    } catch {
      /* ignore */
    }
  };

  const handleReject = async (id: string) => {
    try {
      await apiFetch(`/api/v1/admin/reviews/${id}/reject`, { method: 'PUT' });
      await qc.invalidateQueries({ queryKey: ['admin-reviews'] });
    } catch {
      /* ignore */
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await apiFetch(`/api/v1/reviews/${deleteId}`, { method: 'DELETE' });
      await qc.invalidateQueries({ queryKey: ['admin-reviews'] });
    } catch {
      /* ignore */
    }
    setDeleteId(null);
  };

  const inputCls =
    'rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-accent';

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      approved: 'text-green-600 bg-green-100',
      pending: 'text-yellow-600 bg-yellow-100',
      rejected: 'text-red-600 bg-red-100',
    };
    const label: Record<string, string> = {
      approved: t('reviews.approved'),
      pending: t('reviews.pending'),
      rejected: t('reviews.rejected'),
    };
    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded ${map[status] || map.approved}`}>
        {label[status] || label.approved}
      </span>
    );
  };

  return (
    <div data-testid="admin-reviews-page">
      <h1
        data-testid="admin-reviews-title"
        className="text-xl font-bold text-[var(--text-primary)] mb-6"
      >
        {t('reviews.title')}
      </h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
          <input
            data-testid="admin-reviews-search"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('reviews.search')}
            className={`${inputCls} pl-10 w-full`}
          />
        </div>
        <select
          data-testid="admin-reviews-filter-status"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className={inputCls}
        >
          <option value="all">{t('reviews.allStatuses')}</option>
          <option value="approved">{t('reviews.approved')}</option>
          <option value="pending">{t('reviews.pending')}</option>
          <option value="rejected">{t('reviews.rejected')}</option>
        </select>
        <select
          data-testid="admin-reviews-filter-rating"
          value={ratingFilter}
          onChange={e => setRatingFilter(e.target.value)}
          className={inputCls}
        >
          <option value="all">{t('reviews.allRatings')}</option>
          {[5, 4, 3, 2, 1].map(r => (
            <option key={r} value={r}>
              {t('reviews.stars', { count: r })} ({r})
            </option>
          ))}
        </select>
      </div>

      <div
        data-testid="admin-reviews-table"
        className="rounded-xl border border-[var(--border)] overflow-x-auto"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--bg-sidebar)] text-[var(--text-secondary)]">
              <th className="px-4 py-3 text-left font-medium w-[200px]">{t('reviews.product')}</th>
              <th className="px-4 py-3 text-left font-medium w-[150px]">{t('reviews.customer')}</th>
              <th className="px-4 py-3 text-left font-medium w-[80px]">{t('reviews.rating')}</th>
              <th className="px-4 py-3 text-left font-medium">{t('reviews.comment')}</th>
              <th className="px-4 py-3 text-left font-medium w-[120px]">{t('reviews.date')}</th>
              <th className="px-4 py-3 text-left font-medium w-[100px]">{t('reviews.status')}</th>
              <th className="px-4 py-3 text-left font-medium w-[120px]">{t('products.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--text-secondary)]">
                  {t('table.loading')}
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--text-secondary)]">
                  {t('table.empty')}
                </td>
              </tr>
            ) : (
              reviews.map(review => {
                const status = review.status ?? 'approved';
                return (
                  <tr
                    key={review.id}
                    data-testid={`admin-review-row-${review.id}`}
                    className="hover:bg-[var(--bg-sidebar)]/50"
                  >
                    <td className="px-4 py-3 text-[var(--text-primary)]">
                      {review.product?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{review.user.name}</td>
                    <td className="px-4 py-3">
                      <StarRating value={review.rating} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)] truncate max-w-xs">
                      {review.comment ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{statusBadge(status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {status !== 'approved' && (
                          <button
                            data-testid={`admin-review-approve-${review.id}`}
                            onClick={() => handleApprove(review.id)}
                            className="p-1.5 rounded hover:bg-green-50 text-green-600"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        {status !== 'rejected' && (
                          <button
                            data-testid={`admin-review-reject-${review.id}`}
                            onClick={() => handleReject(review.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          data-testid={`admin-review-delete-${review.id}`}
                          onClick={() => setDeleteId(review.id)}
                          className="p-1.5 rounded hover:bg-[var(--bg-sidebar)] text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!deleteId}
        title={t('reviews.delete')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmLabel={t('reviews.delete')}
        cancelLabel=""
      >
        <p
          data-testid="admin-review-delete-confirm"
          className="text-sm text-[var(--text-secondary)]"
        >
          {t('reviews.deleteConfirm')}
        </p>
      </Modal>
    </div>
  );
}
