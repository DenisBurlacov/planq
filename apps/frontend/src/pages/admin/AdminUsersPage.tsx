import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Ban, CheckCircle } from 'lucide-react';
import { Breadcrumb } from '@components/ui/Breadcrumb';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Modal } from '@components/ui/Modal';
import { DataTable, type Column } from '@components/ui/DataTable';
import { useToast } from '@components/ui/Toast';
import { adminApi } from '@api/admin';
import { useAuthStore } from '@store/auth.store';
import type { AdminUser } from '@appTypes/api';

export function AdminUsersPage() {
  const { t } = useTranslation('admin');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore(s => s.user);
  const isManager = currentUser?.role === 'MANAGER';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Block/unblock modal
  const [blockTarget, setBlockTarget] = useState<AdminUser | null>(null);
  const [blockAction, setBlockAction] = useState<'block' | 'unblock'>('block');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, search],
    queryFn: () => adminApi.listUsers({ page, limit: 20, search: search || undefined }),
  });

  const toggleBlockMut = useMutation({
    mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) =>
      adminApi.toggleBlockUser(id, blocked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast('success', blockAction === 'block' ? t('users.blocked') : t('users.active'));
      setBlockTarget(null);
    },
    onError: () => toast('error', t('common:errors.generic', { ns: 'common' })),
  });

  const openBlockModal = (user: AdminUser, action: 'block' | 'unblock') => {
    setBlockTarget(user);
    setBlockAction(action);
  };

  const columns: Column<AdminUser>[] = [
    {
      key: 'name',
      header: t('users.name'),
      sortable: true,
      render: row => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'email',
      header: t('users.email'),
      render: row => row.email,
    },
    {
      key: 'role',
      header: t('users.role'),
      render: row => (
        <Badge
          variant={row.role === 'ADMIN' ? 'info' : 'default'}
          data-testid={`user-role-${row.id}`}
        >
          {row.role}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: t('users.status'),
      render: row => (
        <Badge variant={row.isBlocked ? 'error' : 'success'} data-testid={`user-status-${row.id}`}>
          {row.isBlocked ? t('users.blocked') : t('users.active')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: t('users.actions'),
      render: row => {
        // MANAGER cannot manage users, Admins cannot block other admins
        if (isManager || row.role === 'ADMIN')
          return <span className="text-[var(--text-secondary)]">{'\u2014'}</span>;

        return row.isBlocked ? (
          <Button
            variant="ghost"
            size="sm"
            data-testid={`unblock-user-${row.id}`}
            onClick={() => openBlockModal(row, 'unblock')}
          >
            <CheckCircle className="h-4 w-4 text-green-500" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            data-testid={`block-user-${row.id}`}
            onClick={() => openBlockModal(row, 'block')}
          >
            <Ban className="h-4 w-4 text-red-500" />
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <Breadcrumb
        items={[{ label: t('sidebar.dashboard'), to: '/admin' }, { label: t('users.title') }]}
      />
      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">{t('users.title')}</h1>

      <div className="mb-6">
        <input
          data-testid="user-search-input"
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder={t('users.search')}
          className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label={t('users.search')}
        />
      </div>

      <DataTable
        data-testid="users-table"
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

      {/* Block/Unblock Confirmation Modal */}
      <Modal
        open={!!blockTarget}
        title={blockAction === 'block' ? t('users.blockUser') : t('users.unblockUser')}
        danger={blockAction === 'block'}
        onConfirm={() =>
          blockTarget &&
          toggleBlockMut.mutate({
            id: blockTarget.id,
            blocked: blockAction === 'block',
          })
        }
        onCancel={() => setBlockTarget(null)}
      >
        {blockAction === 'block' ? t('users.blockConfirm') : t('users.unblockConfirm')}
      </Modal>
    </div>
  );
}
