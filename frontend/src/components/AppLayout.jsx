import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import NotificationsBell from './NotificationsBell.jsx';

export default function AppLayout({ children, variant }) {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to={variant === 'admin' ? '/admin' : '/driver'} className="topbar-brand">
          <div className="topbar-brand-icon">🚛</div>
          <span className="topbar-brand-text">DriverRest</span>
        </Link>

        <div className="topbar-actions">
          {variant === 'driver' && (
            <Link to="/driver/history" className="btn btn-ghost topbar-nav-btn">
              <span aria-hidden>📋</span>
              <span className="topbar-nav-label">Історія</span>
            </Link>
          )}
          {variant === 'admin' && (
            <Link to="/admin/drivers/new" className="btn btn-ghost topbar-nav-btn">
              <span aria-hidden>+</span>
              <span className="topbar-nav-label">Водій</span>
            </Link>
          )}
          <NotificationsBell />
          <span className="topbar-user">
            <span className="topbar-user-first">{user?.firstName}</span>
            <span className="topbar-user-last"> {user?.lastName}</span>
          </span>
          <button type="button" className="btn btn-ghost topbar-logout" onClick={logout}>
            <span className="topbar-nav-label">Вийти</span>
            <span className="topbar-logout-short">Вихід</span>
          </button>
        </div>
      </header>

      <main className="container">{children}</main>
    </div>
  );
}
