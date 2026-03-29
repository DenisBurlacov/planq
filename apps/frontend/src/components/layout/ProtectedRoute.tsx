import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store/auth.store';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore(s => s.accessToken);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
