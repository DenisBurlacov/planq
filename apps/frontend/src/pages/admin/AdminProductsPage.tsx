import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, RotateCcw } from 'lucide-react';
import { Breadcrumb } from '@components/ui/Breadcrumb';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Modal } from '@components/ui/Modal';
import { Badge } from '@components/ui/Badge';
import { DataTable, type Column } from '@components/ui/DataTable';
import { FileUploadZone } from '@components/ui/FileUploadZone';
import { useToast } from '@components/ui/Toast';
import { adminApi, type AdminProductInput } from '@api/admin';
import { uploadApi } from '@api/upload';
import { productsApi } from '@api/products';
import { useAuthStore } from '@store/auth.store';
import { useConfirmModal } from '@hooks/useConfirmModal';
import { usePagination } from '@hooks/usePagination';
import type { Product } from '@appTypes/api';
import { hasDangerousContent } from '@utils/validation';

export function AdminProductsPage() {
  const { t } = useTranslation('admin');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);
  const isManager = user?.role === 'MANAGER';

  const { page, setPage, reset: resetPage } = usePagination();
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortKey, setSortKey] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showDeleted, setShowDeleted] = useState(false);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const deleteConfirm = useConfirmModal<Product>();

  // Form fields
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formSalePrice, setFormSalePrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formImages, setFormImages] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', page, search, showDeleted],
    queryFn: () => adminApi.listProducts({ page, limit: 20, search, includeDeleted: showDeleted }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: productsApi.getCategories,
  });

  const createMut = useMutation({
    mutationFn: (input: AdminProductInput) => adminApi.createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast('success', t('products.addProduct'));
      closeForm();
    },
    onError: () => toast('error', t('products.addProduct')),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<AdminProductInput> }) =>
      adminApi.updateProduct(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast('success', t('products.editProduct'));
      closeForm();
    },
    onError: () => toast('error', t('products.editProduct')),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast('success', t('products.deleteProduct'));
      deleteConfirm.close();
    },
    onError: () => toast('error', t('products.deleteProduct')),
  });

  const bulkDeleteMut = useMutation({
    mutationFn: (ids: string[]) => adminApi.bulkDeleteProducts(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast('success', t('products.bulkDelete'));
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
    },
    onError: () => toast('error', t('products.bulkDelete')),
  });

  const restoreMut = useMutation({
    mutationFn: (id: string) => adminApi.restoreProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast('success', t('products.restored'));
    },
    onError: () => toast('error', t('products.restore')),
  });

  const openCreate = () => {
    setEditingProduct(null);
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormDesc(p.description);
    setFormPrice(String(p.price));
    setFormSalePrice(p.salePrice !== null ? String(p.salePrice) : '');
    setFormStock(String(p.stock));
    setFormCategory(p.categoryId);
    setFormImages(p.images.join('\n'));
    setFormOpen(true);
  };

  const resetForm = () => {
    setFormName('');
    setFormDesc('');
    setFormPrice('');
    setFormSalePrice('');
    setFormStock('');
    setFormCategory('');
    setFormImages('');
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingProduct(null);
    resetForm();
  };

  const handleSubmit = () => {
    if ([formName, formDesc].some(hasDangerousContent)) {
      toast('error', t('common:errors.dangerousContent', { ns: 'common' }));
      return;
    }
    const slug = formName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const input: AdminProductInput = {
      name: formName,
      slug,
      description: formDesc,
      price: Number(formPrice),
      salePrice: formSalePrice ? Number(formSalePrice) : null,
      stock: Number(formStock),
      categoryId: formCategory,
      images: formImages
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean),
    };
    if (editingProduct) {
      updateMut.mutate({ id: editingProduct.id, input });
    } else {
      createMut.mutate(input);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    resetPage();
  };

  const handleImageUpload = async (files: File[]) => {
    if (!editingProduct) return;
    try {
      const result = await uploadApi.productImages(editingProduct.id, files);
      const currentImages = formImages.split('\n').filter(Boolean);
      setFormImages([...currentImages, ...result.urls].join('\n'));
      toast('success', t('products.uploadImages'));
    } catch {
      toast('error', t('products.uploadImages'));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!data) return;
    if (selectedIds.size === data.items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.items.map(p => p.id)));
    }
  };

  const isDeleted = (product: Product) => {
    return (product as Product & { deletedAt?: string | null }).deletedAt != null;
  };

  const columns: Column<Product>[] = [
    ...(!isManager
      ? [
          {
            key: 'select' as const,
            header: (
              <input
                type="checkbox"
                data-testid="select-all-products"
                checked={
                  data ? selectedIds.size === data.items.length && data.items.length > 0 : false
                }
                onChange={toggleSelectAll}
                className="rounded"
              />
            ) as unknown as string,
            width: 'w-8' as const,
            render: (row: Product) => (
              <input
                type="checkbox"
                data-testid={`select-product-${row.id}`}
                checked={selectedIds.has(row.id)}
                onChange={() => toggleSelect(row.id)}
                className="rounded"
              />
            ),
          } satisfies Column<Product>,
        ]
      : []),
    {
      key: 'image',
      header: '',
      width: 'w-12',
      render: row =>
        row.images[0] ? (
          <img src={row.images[0]} alt={row.name} className="h-10 w-10 rounded object-cover" />
        ) : (
          <div className="h-10 w-10 rounded bg-[var(--bg-sidebar)]" />
        ),
    },
    {
      key: 'name',
      header: t('products.name'),
      sortable: true,
      render: row => (
        <div className="flex items-center gap-2">
          <span
            className={`font-medium ${isDeleted(row) ? 'line-through text-[var(--text-secondary)]' : ''}`}
          >
            {row.name}
          </span>
          {isDeleted(row) && <Badge variant="error">{t('products.deleted')}</Badge>}
        </div>
      ),
    },
    {
      key: 'price',
      header: t('products.price'),
      sortable: true,
      render: row => `\u20AC${row.price.toFixed(2)}`,
    },
    {
      key: 'stock',
      header: t('products.stock'),
      sortable: true,
      render: row => row.stock,
    },
    {
      key: 'category',
      header: t('products.category'),
      render: row => row.category?.name ?? '\u2014',
    },
    {
      key: 'actions',
      header: t('products.actions'),
      render: row => {
        if (isManager) return <span className="text-[var(--text-secondary)]">{'\u2014'}</span>;

        if (isDeleted(row)) {
          return (
            <Button
              variant="ghost"
              size="sm"
              data-testid={`restore-product-${row.id}`}
              onClick={() => restoreMut.mutate(row.id)}
              loading={restoreMut.isPending}
            >
              <RotateCcw className="h-4 w-4 text-accent" />
            </Button>
          );
        }

        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              data-testid={`edit-product-${row.id}`}
              onClick={() => openEdit(row)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600"
              data-testid={`delete-product-${row.id}`}
              onClick={() => deleteConfirm.open(row)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[{ label: t('sidebar.dashboard'), to: '/admin' }, { label: t('products.title') }]}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('products.title')}</h1>
        <div className="flex items-center gap-3">
          {!isManager && selectedIds.size > 0 && (
            <Button
              data-testid="bulk-delete-button"
              variant="danger"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" /> {t('products.bulkDelete')} ({selectedIds.size})
            </Button>
          )}
          {!isManager && (
            <Button data-testid="add-product-button" onClick={openCreate}>
              <Plus className="h-4 w-4" /> {t('products.addProduct')}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <Input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder={t('products.search')}
            className="flex-1"
            aria-label={t('products.search')}
          />
          <Button type="submit" variant="secondary">
            {t('products.search').split('...')[0]}
          </Button>
        </form>
        <label
          data-testid="show-deleted-toggle"
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer"
        >
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={e => {
              setShowDeleted(e.target.checked);
              resetPage();
            }}
            className="rounded"
          />
          {t('products.showDeleted')}
        </label>
      </div>

      <DataTable
        data-testid="products-table"
        columns={columns}
        data={data?.items ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={20}
        totalPages={data?.pages ?? 1}
        sortKey={sortKey}
        sortDir={sortDir}
        loading={isLoading}
        onPageChange={setPage}
        onSort={(key, dir) => {
          setSortKey(key);
          setSortDir(dir);
        }}
        rowKey={row => row.id}
      />

      {/* Add/Edit Modal */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={closeForm}
        >
          <div
            data-testid="product-form"
            className="relative w-full max-w-lg rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-form-title"
          >
            <h2
              id="product-form-title"
              className="text-lg font-bold text-[var(--text-primary)] mb-4"
            >
              {editingProduct ? t('products.editProduct') : t('products.addProduct')}
            </h2>
            <div className="space-y-3">
              <Input
                id="pf-name"
                label={t('products.name')}
                value={formName}
                onChange={e => setFormName(e.target.value)}
              />
              <div className="flex flex-col gap-1">
                <label htmlFor="pf-desc" className="text-sm font-medium text-[var(--text-primary)]">
                  {t('products.description')}
                </label>
                <textarea
                  id="pf-desc"
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="pf-price"
                  label={t('products.price')}
                  type="number"
                  min="0"
                  step="0.01"
                  value={formPrice}
                  onChange={e => setFormPrice(e.target.value)}
                />
                <Input
                  id="pf-sale-price"
                  label={t('products.salePrice')}
                  type="number"
                  min="0"
                  step="0.01"
                  value={formSalePrice}
                  onChange={e => setFormSalePrice(e.target.value)}
                />
              </div>
              <Input
                id="pf-stock"
                label={t('products.stock')}
                type="number"
                min="0"
                value={formStock}
                onChange={e => setFormStock(e.target.value)}
              />
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="pf-category"
                  className="text-sm font-medium text-[var(--text-primary)]"
                >
                  {t('products.category')}
                </label>
                <select
                  id="pf-category"
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">{'\u2014'}</option>
                  {categories?.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="pf-images"
                  className="text-sm font-medium text-[var(--text-primary)]"
                >
                  {t('products.images')}
                </label>
                <textarea
                  id="pf-images"
                  value={formImages}
                  onChange={e => setFormImages(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              {editingProduct && (
                <div>
                  <label className="text-sm font-medium text-[var(--text-primary)] block mb-2">
                    {t('products.uploadImages')}
                  </label>
                  <FileUploadZone
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    maxSize={5 * 1024 * 1024}
                    maxSizeLabel="5MB"
                    multiple
                    onUpload={handleImageUpload}
                    data-testid="product-image-upload"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" size="sm" onClick={closeForm}>
                {t('common:actions.cancel', { ns: 'common' })}
              </Button>
              <Button
                size="sm"
                data-testid="product-form-submit"
                loading={createMut.isPending || updateMut.isPending}
                onClick={handleSubmit}
              >
                {editingProduct ? t('products.editProduct') : t('products.addProduct')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteConfirm.isOpen}
        title={t('products.deleteProduct')}
        danger
        confirmLabel={t('common:actions.delete', { ns: 'common' })}
        cancelLabel={t('common:actions.cancel', { ns: 'common' })}
        onConfirm={() => deleteConfirm.target && deleteMut.mutate(deleteConfirm.target.id)}
        onCancel={deleteConfirm.close}
      >
        {t('products.deleteConfirm')}
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        open={bulkDeleteOpen}
        title={t('products.bulkDelete')}
        danger
        confirmLabel={t('common:actions.delete', { ns: 'common' })}
        cancelLabel={t('common:actions.cancel', { ns: 'common' })}
        onConfirm={() => bulkDeleteMut.mutate(Array.from(selectedIds))}
        onCancel={() => setBulkDeleteOpen(false)}
      >
        {t('products.bulkDeleteConfirm', { count: selectedIds.size })}
      </Modal>
    </div>
  );
}
