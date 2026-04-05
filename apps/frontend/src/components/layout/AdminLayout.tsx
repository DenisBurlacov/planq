import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  ArrowLeft,
  FileText,
  Tag,
  FolderTree,
  MessageSquare,
  BarChart3,
  Settings,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@store/auth.store';

interface NavItem {
  icon: typeof LayoutDashboard;
  labelKey: string;
  to: string;
  end: boolean;
  testId: string;
  adminOnly?: boolean;
  managerAllowed?: boolean;
}

const navItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    labelKey: 'sidebar.dashboard',
    to: '/admin',
    end: true,
    testId: 'admin-nav-dashboard',
  },
  {
    icon: Package,
    labelKey: 'sidebar.products',
    to: '/admin/products',
    end: false,
    testId: 'admin-nav-products',
  },
  {
    icon: ShoppingCart,
    labelKey: 'sidebar.orders',
    to: '/admin/orders',
    end: false,
    testId: 'admin-nav-orders',
  },
  {
    icon: Users,
    labelKey: 'sidebar.users',
    to: '/admin/users',
    end: false,
    testId: 'admin-nav-users',
    adminOnly: true,
  },
  {
    icon: FileText,
    labelKey: 'sidebar.audit',
    to: '/admin/audit',
    end: false,
    testId: 'admin-nav-audit',
    adminOnly: true,
  },
  {
    icon: Tag,
    labelKey: 'sidebar.promos',
    to: '/admin/promos',
    end: false,
    testId: 'admin-nav-promos',
    adminOnly: true,
  },
  {
    icon: FolderTree,
    labelKey: 'sidebar.categories',
    to: '/admin/categories',
    end: false,
    testId: 'admin-nav-categories',
    adminOnly: true,
  },
  {
    icon: MessageSquare,
    labelKey: 'sidebar.reviews',
    to: '/admin/reviews',
    end: false,
    testId: 'admin-nav-reviews',
    managerAllowed: true,
  },
  {
    icon: BarChart3,
    labelKey: 'sidebar.stats',
    to: '/admin/stats',
    end: false,
    testId: 'admin-nav-stats',
    adminOnly: true,
  },
  {
    icon: Settings,
    labelKey: 'sidebar.settings',
    to: '/admin/settings',
    end: false,
    testId: 'admin-nav-settings',
    adminOnly: true,
  },
];

export function AdminLayout() {
  const { t } = useTranslation('admin');
  const user = useAuthStore(s => s.user);
  const isManager = user?.role === 'MANAGER';
  const isAdmin = user?.role === 'ADMIN';

  const visibleItems = navItems.filter(item => {
    if (isManager) {
      return !item.adminOnly || item.managerAllowed;
    }
    return true;
  });

  return (
    <div className="flex min-h-[calc(100vh-12rem)]">
      {/* Sidebar */}
      <aside
        data-testid="admin-sidebar"
        className="w-16 md:w-admin-sidebar shrink-0 bg-admin-sidebar border-r border-[var(--border)] flex flex-col sticky top-0 h-screen"
      >
        <div className="hidden md:block px-5 py-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            {t('sidebar.title')}
          </span>
        </div>

        <nav className="flex-1 py-2 space-y-1 px-2">
          {visibleItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              data-testid={item.testId}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-admin-sidebar-active text-accent font-medium border-l-[3px] border-accent'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-admin-sidebar-active'
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="hidden md:block">{t(item.labelKey)}</span>
              {/* Tooltip on small screens */}
              <span className="md:hidden pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {t(item.labelKey)}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Separator & back link — only for MANAGER (admin stays in admin) */}
        {!isAdmin && (
          <div className="border-t border-[var(--border)] px-2 py-2">
            <NavLink
              to="/"
              data-testid="admin-nav-back"
              className="group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-admin-sidebar-active transition-colors"
            >
              <ArrowLeft className="h-5 w-5 shrink-0" />
              <span className="hidden md:block">{t('sidebar.backToStore')}</span>
              <span className="md:hidden pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {t('sidebar.backToStore')}
              </span>
            </NavLink>
          </div>
        )}
      </aside>

      {/* Content */}
      <main data-testid="admin-content" className="flex-1 p-6 lg:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
