import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DriverHomePage from './pages/driver/DriverHomePage.jsx';
import DriverHistoryPage from './pages/driver/DriverHistoryPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminDriverProfilePage from './pages/admin/AdminDriverProfilePage.jsx';
import AdminCreateDriverPage from './pages/admin/AdminCreateDriverPage.jsx';
import AppLayout from './components/AppLayout.jsx';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Загрузка...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'administrator' ? '/admin' : '/driver'} replace />;
  }
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'administrator' ? '/admin' : '/driver'} /> : <LoginPage />} />
      <Route
        path="/driver"
        element={
          <ProtectedRoute role="driver">
            <AppLayout variant="driver">
              <DriverHomePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver/history"
        element={
          <ProtectedRoute role="driver">
            <AppLayout variant="driver">
              <DriverHistoryPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="administrator">
            <AppLayout variant="admin">
              <AdminDashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/drivers/new"
        element={
          <ProtectedRoute role="administrator">
            <AppLayout variant="admin">
              <AdminCreateDriverPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/drivers/:id"
        element={
          <ProtectedRoute role="administrator">
            <AppLayout variant="admin">
              <AdminDriverProfilePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
