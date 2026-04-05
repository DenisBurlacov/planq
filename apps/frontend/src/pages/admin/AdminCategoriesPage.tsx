import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Modal } from '@components/ui/Modal';
import { useToast } from '@components/ui/Toast';
import { productsApi } from '@api/products';
import { apiFetch } from '@api/client';
import { useConfirmModal } from '@hooks/useConfirmModal';
import type { Category } from '@appTypes/api';

interface CategoryInput {
  name: string;
  slug: string;
  description: string;
}

export function AdminCategoriesPage() {
  const { t } = useTranslation('admin');
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryInput>({ name: '', slug: '', description: '' });
  const deleteConfirm = useConfirmModal<Category>();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: productsApi.getCategories,
  });

  const filtered = (categories ?? []).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const handleNameChange = (name: string) => {
    setForm(prev => ({
      ...prev,
      name,
      slug: editingId ? prev.slug : slugify(name),
    }));
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await apiFetch(`/api/v1/admin/categories/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
      } else {
        await apiFetch('/api/v1/admin/categories', { method: 'POST', body: JSON.stringify(form) });
      }
      await qc.invalidateQueries({ queryKey: ['categories'] });
      setModalOpen(false);
      setEditingId(null);
      setForm({ name: '', slug: '', description: '' });
    } catch {
      toast('error', t('table.empty'));
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.target) return;
    try {
      await apiFetch(`/api/v1/admin/categories/${deleteConfirm.target.id}`, { method: 'DELETE' });
      await qc.invalidateQueries({ queryKey: ['categories'] });
    } catch {
      // ignore
    }
    deleteConfirm.close();
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, description: '' });
    setModalOpen(true);
  };

  const inputCls =
    'w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-accent';

  return (
    <div data-testid="admin-categories-page">
      <div className="flex items-center justify-between mb-6">
        <h1
          data-testid="admin-categories-title"
          className="text-xl font-bold text-[var(--text-primary)]"
        >
          {t('categories.title')}
        </h1>
        <Button
          data-testid="admin-categories-add-button"
          onClick={() => {
            setEditingId(null);
            setForm({ name: '', slug: '', description: '' });
            setModalOpen(true);
          }}
          size="sm"
        >
          <Plus className="h-4 w-4" /> {t('categories.addCategory')}
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('categories.search')}
          className={`${inputCls} pl-10`}
        />
      </div>

      <div
        data-testid="admin-categories-table"
        className="rounded-xl border border-[var(--border)] overflow-x-auto"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--bg-sidebar)] text-[var(--text-secondary)]">
              <th className="px-4 py-3 text-left font-medium">{t('categories.name')}</th>
              <th className="px-4 py-3 text-left font-medium w-[150px]">{t('categories.slug')}</th>
              <th className="px-4 py-3 text-left font-medium w-[120px]">
                {t('categories.productCount')}
              </th>
              <th className="px-4 py-3 text-left font-medium w-[100px]">{t('products.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--text-secondary)]">
                  {t('table.loading')}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--text-secondary)]">
                  {t('table.empty')}
                </td>
              </tr>
            ) : (
              filtered.map(cat => (
                <tr
                  key={cat.id}
                  data-testid={`admin-category-row-${cat.id}`}
                  className="hover:bg-[var(--bg-sidebar)]/50"
                >
                  <td className="px-4 py-3 text-[var(--text-primary)] font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)] font-mono text-xs">
                    {cat.slug}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">—</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        data-testid={`admin-category-edit-${cat.id}`}
                        onClick={() => openEdit(cat)}
                        className="p-1.5 rounded hover:bg-[var(--bg-sidebar)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        data-testid={`admin-category-delete-${cat.id}`}
                        onClick={() => deleteConfirm.open(cat)}
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
          data-testid="admin-category-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
              {editingId ? t('categories.editCategory') : t('categories.addCategory')}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                  {t('categories.name')}
                </label>
                <input
                  data-testid="admin-category-name-input"
                  value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                  {t('categories.slug')}
                </label>
                <input
                  data-testid="admin-category-slug-input"
                  value={form.slug}
                  onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
                  {t('categories.description')}
                </label>
                <textarea
                  data-testid="admin-category-desc-input"
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className={`${inputCls} resize-none h-20`}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                {t('categories.name', { defaultValue: 'Cancel' })}
              </Button>
              <Button data-testid="admin-category-save-button" size="sm" onClick={handleSave}>
                {editingId ? t('categories.editCategory') : t('categories.addCategory')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={deleteConfirm.isOpen}
        title={t('categories.deleteCategory')}
        onConfirm={handleDelete}
        onCancel={deleteConfirm.close}
        confirmLabel={t('categories.deleteCategory')}
        cancelLabel=""
      >
        <p
          data-testid="admin-category-delete-confirm"
          className="text-sm text-[var(--text-secondary)]"
        >
          {t('categories.deleteConfirm', { name: deleteConfirm.target?.name ?? '' })}
        </p>
      </Modal>
    </div>
  );
}
