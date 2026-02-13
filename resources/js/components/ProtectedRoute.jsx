import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { LoadingOverlay } from '@mantine/core';

const ProtectedRoute = () => {
  const { isAuthenticated, status } = useSelector((state) => state.auth);

  if (status === 'loading' || status === 'idle') {
    return <LoadingOverlay visible={true} />;
  }

  if (isAuthenticated) {
    return <Outlet />;
  }

  // If not authenticated, redirect to login
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;