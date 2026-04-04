import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Breadcrumb } from '@components/ui/Breadcrumb';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Modal } from '@components/ui/Modal';
import { DataTable, type Column } from '@components/ui/DataTable';
import { useToast } from '@components/ui/Toast';
import { adminApi, type AdminProductInput } from '@api/admin';
import { productsApi } from '@api/products';
import type { Product } from '@appTypes/api';

export function AdminProductsPage() {
  const { t } = useTranslation('admin');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortKey, setSortKey] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formSalePrice, setFormSalePrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formImages, setFormImages] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', page, search],
    queryFn: () => adminApi.listProducts({ page, limit: 20, search }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: productsApi.getCategories,
  });

  const createMut = useMutation({
    mutationFn: (input: AdminProductInput) => adminApi.createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast('success', 'Product created');
      closeForm();
    },
    onError: () => toast('error', 'Failed to create product'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<AdminProductInput> }) =>
      adminApi.updateProduct(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast('success', 'Product updated');
      closeForm();
    },
    onError: () => toast('error', 'Failed to update product'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast('success', 'Product deleted');
      setDeleteTarget(null);
    },
    onError: () => toast('error', 'Failed to delete product'),
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
    const input: AdminProductInput = {
      name: formName,
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
    setPage(1);
  };

  const columns: Column<Product>[] = [
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
      render: row => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'price',
      header: t('products.price'),
      sortable: true,
      render: row => `€${row.price.toFixed(2)}`,
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
      render: row => row.category?.name ?? '—',
    },
    {
      key: 'actions',
      header: t('products.actions'),
      render: row => (
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
            onClick={() => setDeleteTarget(row)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[{ label: t('sidebar.dashboard'), to: '/admin' }, { label: t('products.title') }]}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('products.title')}</h1>
        <Button data-testid="add-product-button" onClick={openCreate}>
          <Plus className="h-4 w-4" /> {t('products.addProduct')}
        </Button>
      </div>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
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
                  <option value="">—</option>
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
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" size="sm" onClick={closeForm}>
                {t('products.actions') === 'Actions' ? 'Cancel' : t('products.actions')}
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
        open={!!deleteTarget}
        title={t('products.deleteProduct')}
        danger
        onConfirm={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      >
        {t('products.deleteConfirm')}
      </Modal>
    </div>
  );
}
