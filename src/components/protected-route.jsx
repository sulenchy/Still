
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../features/auth/useAuth.js';

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="p-6">Checking your session…</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  

  return <Outlet />;
}


export default ProtectedRoute;
