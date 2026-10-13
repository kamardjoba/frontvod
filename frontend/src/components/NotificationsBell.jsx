import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { showLocalNotification } from '../utils/push.js';
import { useSocket } from '../context/SocketContext.jsx';

function timeAgo(isoDate) {
  if (!isoDate) return '';
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000);
  if (diff < 1) return 'щойно';
  if (diff < 60) return `${diff} хв тому`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h} год тому`;
  return `${Math.floor(h / 24)} дн тому`;
}

export default function NotificationsBell() {
  const { socket } = useSocket();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  const load = async () => {
    const data = await api.notifications();
    setItems(data);
  };

  useEffect(() => { load().catch(() => {}); }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = async () => {
      try {
        const data = await api.notifications();
        setItems(data);
        const latest = data[0];
        if (latest && !latest.is_read) showLocalNotification(latest.title, latest.body);
      } catch { /* ignore */ }
    };
    socket.on('notifications:updated', handler);
    socket.on('drivers:updated', handler);
    socket.on('admin:dashboard', handler);
    return () => {
      socket.off('notifications:updated', handler);
      socket.off('drivers:updated', handler);
      socket.off('admin:dashboard', handler);
    };
  }, [socket]);

  const unread = items.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    const ids = items.filter((n) => !n.is_read).map((n) => n.id);
    if (ids.length) await api.markNotificationsRead(ids);
    await load();
  };

  return (
    <div className="notifications-panel">
      <button
        type="button"
        className="notif-btn"
        onClick={() => setOpen((v) => !v)}
        title="Сповіщення"
      >
        🔔
        {unread > 0 && (
          <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 199 }}
            onClick={() => setOpen(false)}
          />
          <div className="notifications-dropdown">
            <div className="notifications-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>🔔 Сповіщення</span>
              {unread > 0 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                  onClick={markAllRead}
                >
                  Прочитати всі
                </button>
              )}
            </div>

            {items.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem' }}>
                Сповіщень немає
              </div>
            )}

            {items.map((n) => (
              <div key={n.id} className={`notification-item ${n.is_read ? '' : 'unread'}`}>
                <div className="notification-title">{n.title}</div>
                <div className="notification-body">{n.body}</div>
                <div className="notification-time">{timeAgo(n.created_at)}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
