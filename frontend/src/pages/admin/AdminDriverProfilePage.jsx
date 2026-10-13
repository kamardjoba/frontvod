import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api/client.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import { formatLong, formatShort, fromDatetimeLocalValue, toDatetimeLocalValue } from '../../utils/time.js';

export default function AdminDriverProfilePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [plannedEnd, setPlannedEnd] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const res = await api.adminDriver(id);
    setData(res);
    if (res.driver.activeRest?.currentPlannedEndAt) {
      setPlannedEnd(toDatetimeLocalValue(res.driver.activeRest.currentPlannedEndAt));
    }
  };

  useEffect(() => { load().catch(() => {}); }, [id]);

  if (!data) return <div className="page-loading"><div style={{ fontSize: '2rem' }}>⏳</div><div>Завантаження...</div></div>;

  const driver = data.driver;
  const active = driver.activeRest;

  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 5000); };

  const savePlannedEnd = async () => {
    try {
      await api.adminUpdateRest(id, { plannedEndAt: fromDatetimeLocalValue(plannedEnd) });
      showMsg('Планований час оновлено адміністратором.');
      await load();
    } catch (e) { setError(e.message); }
  };

  const setWorking = async () => {
    try {
      await api.adminUpdateRest(id, { manualStatus: 'working' });
      showMsg('Статус водія змінено на «Доступний».');
      await load();
    } catch (e) { setError(e.message); }
  };

  const deactivate = async () => {
    if (!confirm(`Деактивувати аккаунт ${driver.firstName} ${driver.lastName}?`)) return;
    try {
      await api.updateDriver(id, { isActive: false });
      showMsg('Аккаунт деактивовано.');
      await load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div>
      <Link to="/admin" className="back-link">← До панелі</Link>

      <div className="profile-grid">
        {/* Left column - driver info */}
        <div>
          <div className="card">
            {/* Header */}
            <div style={{
              background: 'var(--primary-gradient)',
              margin: '-24px -24px 20px',
              padding: '24px',
              borderRadius: 'var(--radius) var(--radius) 0 0',
              color: '#fff',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>👤</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {driver.firstName} {driver.lastName}
              </div>
              <div style={{ opacity: 0.75, fontSize: '0.85rem', marginTop: 4 }}>{driver.email}</div>
            </div>

            <StatusBadge status={driver.displayStatus} />

            {message && <div className="notice notice-success" style={{ marginTop: 14 }}>{message}</div>}
            {error && <div className="notice notice-error" style={{ marginTop: 14 }}>{error}</div>}

            {/* Info rows */}
            <div style={{ marginTop: 16 }}>
              <div className="info-row">
                <span className="info-key">Телефон</span>
                <span className="info-val">{driver.phone || '—'}</span>
              </div>
              <div className="info-row">
                <span className="info-key">Статус акаунту</span>
                <span className="info-val" style={{ color: driver.isActive ? 'var(--green)' : 'var(--red)' }}>
                  {driver.isActive ? 'Активний' : 'Деактивований'}
                </span>
              </div>
              <div className="info-row">
                <span className="info-key">Додано</span>
                <span className="info-val">{formatLong(driver.createdAt)}</span>
              </div>
            </div>

            {/* Active rest summary */}
            {active && (
              <>
                <div className="divider" />
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--muted)', marginBottom: 12 }}>
                  Поточна стоянка
                </div>

                {active.city && (
                  <div className="rest-city-display" style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: '1.2rem' }}>📍</div>
                    <div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 600, textTransform: 'uppercase' }}>Місто</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>{active.city}</div>
                    </div>
                  </div>
                )}

                <div className="info-row">
                  <span className="info-key">Початок</span>
                  <span className="info-val">{formatLong(active.startedAt)}</span>
                </div>
                <div className="info-row">
                  <span className="info-key">Тривалість</span>
                  <span className="info-val">{active.plannedDurationLabel}</span>
                </div>
                <div className="info-row">
                  <span className="info-key">Планований вихід</span>
                  <span className="info-val" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                    {formatLong(active.currentPlannedEndAt)}
                  </span>
                </div>
              </>
            )}

            <div className="divider" />

            {/* Admin controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {active && (
                <div className="field">
                  <label>Змінити планований вихід</label>
                  <input
                    className="input"
                    type="datetime-local"
                    value={plannedEnd}
                    onChange={(e) => setPlannedEnd(e.target.value)}
                  />
                  <button type="button" className="btn btn-accent" onClick={savePlannedEnd}>
                    Зберегти час
                  </button>
                </div>
              )}
              <button type="button" className="btn btn-success" onClick={setWorking}>
                Позначити як «Доступний»
              </button>
              {driver.isActive && (
                <button type="button" className="btn btn-danger" onClick={deactivate}>
                  Деактивувати аккаунт
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right column - history + audit */}
        <div>
          {/* Rest history */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title">📋 Історія стоянок</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{data.history.length} записів</span>
            </div>

            {data.history.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <div className="empty-state-text">Записів поки немає</div>
              </div>
            ) : (
              data.history.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-item-header">
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                        {formatShort(item.startedAt)}
                      </span>
                      {item.city && (
                        <span className="city-badge" style={{ marginLeft: 8 }}>
                          📍 {item.city}
                        </span>
                      )}
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '3px 8px',
                      borderRadius: '999px',
                      background: item.status === 'completed' ? 'var(--green-bg)' : 'var(--blue-bg)',
                      color: item.status === 'completed' ? 'var(--green-text)' : 'var(--blue-text)',
                      fontWeight: 700,
                    }}>
                      {item.status === 'completed' ? 'Завершено' : 'Активна'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 6 }}>
                    <span>Початок: {formatShort(item.startedAt)}</span>
                    <span style={{ margin: '0 8px' }}>→</span>
                    <span>Вихід: {formatShort(item.currentPlannedEndAt)}</span>
                    {item.actualAvailabilityAt && (
                      <>
                        <span style={{ margin: '0 8px' }}>•</span>
                        <span>Факт: {formatShort(item.actualAvailabilityAt)}</span>
                      </>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4 }}>
                    {restTypeLabel(item.restType)} · {item.plannedDurationLabel || ''}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Audit log */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🗒 Журнал дій</span>
            </div>
            {data.auditLogs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🗒</div>
                <div className="empty-state-text">Дій поки немає</div>
              </div>
            ) : (
              data.auditLogs.map((log) => (
                <div key={log.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{actionLabel(log.action)}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{formatShort(log.created_at)}</span>
                  </div>
                  {(log.first_name || log.last_name) && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 2 }}>
                      Автор: {log.first_name} {log.last_name}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function restTypeLabel(type) {
  const map = {
    daily: 'Щоденний відпочинок',
    weekly_reduced_24h: 'Скорочений тижневий — 24 год',
    weekly_full_45h: 'Повний тижневий — 45 год',
    custom: 'Інший',
  };
  return map[type] || type;
}

function actionLabel(action) {
  const map = {
    rest_started: '▶️ Водій почав стоянку',
    planned_end_updated: '⏰ Водій оновив час виходу',
    availability_confirmed: '✅ Водій підтвердив доступність',
    admin_planned_end_updated: '✏️ Адмін оновив час виходу',
    admin_set_working: '🟢 Адмін позначив як доступного',
    driver_created: '👤 Водій створений',
    driver_updated: '✏️ Профіль оновлено',
  };
  return map[action] || action;
}
