import { useState } from 'react';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../auth/auth-provider.jsx';
import { dashboardPath } from '../constants/routes.js';

function GuestRoute() {
  const { user, loading } = useAuth();
  const [arrivedSignedIn, setArrivedSignedIn] = useState(null);

  if (!loading && arrivedSignedIn === null) {
    setArrivedSignedIn(Boolean(user));
  }

  if (loading || arrivedSignedIn === null) {
    return <p className="p-6">Checking your session…</p>;
  }

  if (arrivedSignedIn) {
    return <Navigate to={dashboardPath} replace />;
  }

  return <Outlet />;
}

export default GuestRoute;
