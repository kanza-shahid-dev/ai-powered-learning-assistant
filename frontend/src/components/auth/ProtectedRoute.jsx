import { Navigate, Outlet } from "react-router-dom";
import AppLayout from "../layout/AppLayout";

export default function ProtectedRoute() {
  const isAuthenticated = false;
  const loading = false;

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ) : (
    <Navigate to="/login" replace />
  );
}
