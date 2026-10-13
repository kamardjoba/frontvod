import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import NotificationsBell from './NotificationsBell.jsx';

export default function AppLayout({ children, variant }) {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        {/* Brand */}
        <div className="topbar-brand">
          <div className="topbar-brand-icon">🚛</div>
          DriverRest
        </div>

        {/* Actions */}
        <div className="topbar-actions">
          {variant === 'driver' && (
            <Link to="/driver/history" className="btn btn-ghost">
              📋 Історія
            </Link>
          )}
          {variant === 'admin' && (
            <Link to="/admin/drivers/new" className="btn btn-ghost">
              + Водій
            </Link>
          )}
          <NotificationsBell />
          <span className="topbar-user">{user?.firstName} {user?.lastName}</span>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Вийти
          </button>
        </div>
      </header>

      <main className="container">{children}</main>
    </div>
  );
}
