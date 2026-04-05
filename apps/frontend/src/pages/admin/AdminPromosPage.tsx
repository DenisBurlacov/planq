import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Modal } from '@components/ui/Modal';
import { Toggle } from '@components/ui/Toggle';
import { useToast } from '@components/ui/Toast';
import { apiFetch } from '@api/client';
import type { PromoCode, PaginatedResponse } from '@appTypes/api';

interface PromoInput {
  code: string;
  discountPercent: number;
  minOrderAmount: number;
  maxUses: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

const defaultInput: PromoInput = {
  code: '',
  discountPercent: 10,
  minOrderAmount: 0,
  maxUses: 0,
  validFrom: new Date().toISOString().split('T')[0],
  validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  isActive: true,
};

export function AdminPromosPage() {
  const { t } = useTranslation('admin');
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PromoInput>(defaultInput);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteCode, setDeleteCode] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-promos'],
    queryFn: () =>
      apiFetch<PaginatedResponse<PromoCode & { maxUses?: number; usedCount?: number }>>(
        '/api/v1/admin/promotions'
      ),
  });

  const promos = (data?.items ?? []).filter(p =>
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    try {
      const body = { ...form, code: form.code.toUpperCase() };
      if (editingId) {
        await apiFetch(`/api/v1/admin/promotions/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch('/api/v1/admin/promotions', { method: 'POST', body: JSON.stringify(body) });
      }
      await qc.invalidateQueries({ queryKey: ['admin-promos'] });
      setModalOpen(false);
      setEditingId(null);
      setForm(defaultInput);
    } catch {
      toast('error', t('table.empty'));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await apiFetch(`/api/v1/admin/promotions/${deleteId}`, { method: 'DELETE' });
      await qc.invalidateQueries({ queryKey: ['admin-promos'] });
    } catch {
      // ignore
    }
    setDeleteId(null);
  };

  const openEdit = (promo: PromoCode & { maxUses?: number }) => {
    setEditingId(promo.id);
    setForm({
      code: promo.code,
      discountPercent: promo.discountPercent,
      minOrderAmount: promo.minOrderAmount ?? 0,
      maxUses: promo.maxUses ?? 0,
      validFrom: promo.validFrom.split('T')[0],
      validUntil: promo.validUntil.split('T')[0],
      isActive: promo.isActive,
    });
    setModalOpen(true);
  };

  const inputCls =
    'w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-accent';

  return (
    <div data-testid="admin-promos-page">
      <div className="flex items-center justify-between mb-6">
        <h1
          data-testid="admin-promos-title"
          className="text-xl font-bold text-[var(--text-primary)]"
        >
          {t('promos.title')}
        </h1>
        <Button
          data-testid="admin-promos-add-button"
          onClick={() => {
            setEditingId(null);
            setForm(defaultInput);
            setModalOpen(true);
          }}
          size="sm"
        >
          <Plus className="h-4 w-4" /> {t('promos.addPromo')}
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('promos.search')}
          className={`${inputCls} pl-10`}
        />
      </div>

      <div
        data-testid="admin-promos-table"
        className="rounded-xl border border-[var(--border)] overflow-x-auto"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--bg-sidebar)] text-[var(--text-secondary)]">
              <th className="px-4 py-3 text-left font-medium">{t('promos.code')}</th>
              <th className="px-4 py-3 text-left font-medium w-[100px]">{t('promos.discount')}</th>
              <th className="px-4 py-3 text-left font-medium w-[120px]">{t('promos.minOrder')}</th>
              <th className="px-4 py-3 text-left font-medium w-[100px]">{t('promos.maxUses')}</th>
              <th className="px-4 py-3 text-left font-medium w-[80px]">{t('promos.usedCount')}</th>
              <th className="px-4 py-3 text-left font-medium w-[120px]">{t('promos.validFrom')}</th>
              <th className="px-4 py-3 text-left font-medium w-[120px]">
                {t('promos.validUntil')}
              </th>
              <th className="px-4 py-3 text-left font-medium w-[80px]">{t('promos.active')}</th>
              <th className="px-4 py-3 text-left font-medium w-[100px]">{t('products.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-[var(--text-secondary)]">
                  {t('table.loading')}
                </td>
              </tr>
            ) : promos.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-[var(--text-secondary)]">
                  {t('table.empty')}
                </td>
              </tr>
            ) : (
              promos.map(promo => (
                <tr
                  key={promo.id}
                  data-testid={`admin-promo-row-${promo.id}`}
                  className="hover:bg-[var(--bg-sidebar)]/50"
                >
                  <td className="px-4 py-3 font-mono text-[var(--text-primary)]">{promo.code}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {promo.discountPercent}%
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {promo.minOrderAmount ? `€${promo.minOrderAmount}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {promo.maxUses || t('promos.unlimited')}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{promo.usedCount ?? 0}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {promo.validFrom.split('T')[0]}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {promo.validUntil.split('T')[0]}
                    {new Date(promo.validUntil) < new Date() && (
                      <span className="ml-1 text-xs text-red-500">{t('promos.expired')}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded ${promo.isActive ? 'text-green-600 bg-green-100' : 'text-red-500 bg-red-100'}`}
                    >
                      {promo.isActive ? '✓' : '✗'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        data-testid={`admin-promo-edit-${promo.id}`}
                        onClick={() => openEdit(promo)}
                        className="p-1.5 rounded hover:bg-[var(--bg-sidebar)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        data-testid={`admin-promo-delete-${promo.id}`}
                        onClick={() => {
                          setDeleteId(promo.id);
                          setDeleteCode(promo.code);
                        }}
                        className="p-1.5 rounded hover:bg-[var(--bg-sidebar)] text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div
          data-testid="admin-promo-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
              {editingId ? t('promos.editPromo') : t('promos.addPromo')}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                  {t('promos.code')}
                </label>
                <input
                  data-testid="admin-promo-code-input"
                  value={form.code}
                  onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                  {t('promos.discount')}
                </label>
                <input
                  data-testid="admin-promo-discount-input"
                  type="number"
                  min={1}
                  max={100}
                  value={form.discountPercent}
                  onChange={e => setForm(p => ({ ...p, discountPercent: +e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                  {t('promos.minOrder')}
                </label>
                <input
                  data-testid="admin-promo-minorder-input"
                  type="number"
                  min={0}
                  value={form.minOrderAmount}
                  onChange={e => setForm(p => ({ ...p, minOrderAmount: +e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                  {t('promos.maxUses')}
                </label>
                <input
                  data-testid="admin-promo-maxuses-input"
                  type="number"
                  min={0}
                  value={form.maxUses}
                  onChange={e => setForm(p => ({ ...p, maxUses: +e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                    {t('promos.validFrom')}
                  </label>
                  <input
                    data-testid="admin-promo-from-input"
                    type="date"
                    value={form.validFrom}
                    onChange={e => setForm(p => ({ ...p, validFrom: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                    {t('promos.validUntil')}
                  </label>
                  <input
                    data-testid="admin-promo-until-input"
                    type="date"
                    value={form.validUntil}
                    onChange={e => setForm(p => ({ ...p, validUntil: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>
              <Toggle
                data-testid="admin-promo-active-toggle"
                checked={form.isActive}
                onChange={v => setForm(p => ({ ...p, isActive: v }))}
                label={t('promos.active')}
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                {t('table.empty', { defaultValue: '' }) || 'Cancel'}
              </Button>
              <Button data-testid="admin-promo-save-button" size="sm" onClick={handleSave}>
                {t('promos.addPromo').split(' ')[0]}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <Modal
        open={!!deleteId}
        title={t('promos.deletePromo')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        confirmLabel={t('promos.deletePromo')}
        cancelLabel=""
      >
        <p
          data-testid="admin-promo-delete-confirm"
          className="text-sm text-[var(--text-secondary)]"
        >
          {t('promos.deleteConfirm', { code: deleteCode })}
        </p>
      </Modal>
    </div>
  );
}
