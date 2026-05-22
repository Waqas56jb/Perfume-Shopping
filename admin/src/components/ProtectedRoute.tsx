import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { getStoredUser } from '../lib/auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = getStoredUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
