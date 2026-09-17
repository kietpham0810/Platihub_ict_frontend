import { Navigate } from 'react-router-dom';
import { ADMIN_SESSION_KEY } from '../../constants/config';

export default function RequireAdminAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
