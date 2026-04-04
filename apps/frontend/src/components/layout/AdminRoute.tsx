import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store/auth.store';
import type { ReactNode } from 'react';

export function AdminRoute({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore(s => s.accessToken);
  const user = useAuthStore(s => s.user);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
