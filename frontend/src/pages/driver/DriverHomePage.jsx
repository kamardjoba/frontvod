import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/client.js';
import LiveClock from '../../components/LiveClock.jsx';
import RestStartForm, { toDatetimeLocalValue } from '../../components/RestStartForm.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { formatLong, fromDatetimeLocalValue, remainingLabel } from '../../utils/time.js';

function restTypeLabel(type) {
  const map = {
    daily: 'Щоденний відпочинок',
    weekly_reduced_24h: 'Скорочений тижневий — 24 год',
    weekly_full_45h: 'Повний тижневий — 45 год',
    custom: 'Інший період',
  };
  return map[type] || type;
}

export default function DriverHomePage() {
  const { socket } = useSocket();
  const [profile, setProfile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState('—');
  const [editEnd, setEditEnd] = useState('');
  const [showEditEnd, setShowEditEnd] = useState(false);

  const load = useCallback(async () => {
    const data = await api.driverMe();
    setProfile(data);
    if (data.activeRest?.currentPlannedEndAt) {
      setEditEnd(toDatetimeLocalValue(data.activeRest.currentPlannedEndAt));
      setRemaining(remainingLabel(data.activeRest.currentPlannedEndAt));
    } else {
      setRemaining('—');
    }
  }, []);

  useEffect(() => { load().catch((e) => setError(e.message)); }, [load]);

  useEffect(() => {
    const id = setInterval(() => {
      if (profile?.activeRest?.currentPlannedEndAt) {
        setRemaining(remainingLabel(profile.activeRest.currentPlannedEndAt));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [profile?.activeRest?.currentPlannedEndAt]);

  useEffect(() => {
    if (!socket) return;
    const refresh = (payload) => {
      if (!payload?.driverId || payload.driverId === profile?.id) {
        if (payload?.payload) setProfile(payload.payload);
        else load().catch(() => {});
      }
    };
    socket.on('drivers:updated', refresh);
    return () => socket.off('drivers:updated', refresh);
  }, [socket, profile?.id, load]);

  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 5000); };

  const onStartRest = async (body) => {
    setLoading(true); setError('');
    try {
      const res = await api.startRest(body);
      showMsg(res.message);
      setShowForm(false);
      await load();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const onConfirmAvailable = async () => {
    try {
      await api.confirmAvailable();
      showMsg('Ви підтвердили готовність до роботи!');
      await load();
    } catch (e) { setError(e.message); }
  };

  const onContinueRest = async () => {
    if (!editEnd) return;
    try {
      await api.continueRest({ plannedEndAt: fromDatetimeLocalValue(editEnd) });
      showMsg('Новий час доступності збережено.');
      setShowEditEnd(false);
      await load();
    } catch (e) { setError(e.message); }
  };

  const onUpdateEnd = async () => {
    if (!editEnd) return;
    try {
      await api.updatePlannedEnd({ plannedEndAt: fromDatetimeLocalValue(editEnd) });
      showMsg('Планований час оновлено.');
      setShowEditEnd(false);
      await load();
    } catch (e) { setError(e.message); }
  };

  const onEndEarly = async () => {
    try {
      await api.endRestEarly();
      showMsg('Стоянку завершено достроково. Ви доступні!');
      await load();
    } catch (e) { setError(e.message); }
  };

  if (!profile) return (
    <div className="page-loading">
      <div style={{ fontSize: '2.5rem' }}>🚛</div>
      <div>Завантаження профілю...</div>
    </div>
  );

  const active = profile.activeRest;
  const passed = active && remaining === 'Запланированное время доступности наступило';

  return (
    <div className="driver-page">
      {/* Hero */}
      <div className="driver-hero">
        <div className="driver-hero-top">
          <div>
            <h2>{profile.firstName} {profile.lastName}</h2>
            <div className="driver-hero-sub">{profile.email}</div>
          </div>
          <StatusBadge status={profile.displayStatus} />
        </div>
        <LiveClock />
      </div>

      {/* Messages */}
      {message && <div className="notice notice-success" style={{ marginBottom: 16 }}>{message}</div>}
      {error && <div className="notice notice-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* === NOT RESTING === */}
      {!active && !showForm && (
        <div className="status-card">
          <div className="status-card-header">
            <span className="status-card-title">Поточний статус</span>
            <StatusBadge status={{ key: 'working', label: 'Працює', color: 'green' }} />
          </div>
          <div className="status-card-body" style={{ textAlign: 'center', padding: '32px 22px' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🟢</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: 8 }}>
              Ви доступні для роботи
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 28 }}>
              Натисніть кнопку нижче, щоб зафіксувати початок стоянки
            </div>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ maxWidth: 300, margin: '0 auto' }}
              onClick={() => setShowForm(true)}
            >
              🅿️ Стати на стоянку
            </button>
          </div>
        </div>
      )}

      {/* === FORM === */}
      {showForm && (
        <RestStartForm
          onSubmit={onStartRest}
          loading={loading}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* === ACTIVE REST === */}
      {active && (
        <div className="status-card">
          <div className="status-card-header">
            <span className="status-card-title">Зараз на стоянці</span>
            <StatusBadge status={profile.displayStatus} />
          </div>
          <div className="status-card-body">
            {/* City */}
            {active.city && (
              <div className="rest-city-display">
                <div className="rest-city-icon">📍</div>
                <div>
                  <div className="rest-city-label">Місто стоянки</div>
                  <div className="rest-city-name">{active.city}</div>
                </div>
              </div>
            )}

            {/* Countdown */}
            <div className={`countdown-display${passed ? ' passed' : ''}`}>
              <div className="countdown-label">
                {passed ? 'Час доступності настав!' : 'До кінця стоянки залишилось'}
              </div>
              <div className="countdown-value">
                {passed ? 'Час вийшов' : remaining}
              </div>
            </div>

            {/* Info grid */}
            <div className="rest-info-grid">
              <div className="rest-info-item">
                <div className="rest-info-label">Початок</div>
                <div className="rest-info-value">{formatLong(active.startedAt)}</div>
              </div>
              <div className="rest-info-item">
                <div className="rest-info-label">Планований вихід</div>
                <div className="rest-info-value">{formatLong(active.currentPlannedEndAt)}</div>
              </div>
              <div className="rest-info-item">
                <div className="rest-info-label">Тривалість</div>
                <div className="rest-info-value">{active.plannedDurationLabel}</div>
              </div>
              <div className="rest-info-item">
                <div className="rest-info-label">Тип</div>
                <div className="rest-info-value" style={{ fontSize: '0.82rem' }}>
                  {restTypeLabel(active.restType)}
                </div>
              </div>
            </div>

            {/* Availability passed — confirm */}
            {passed && (
              <div className="confirm-box" style={{ marginBottom: 16 }}>
                <div className="confirm-box-title">
                  Запланований час доступності настав. Ви готові до роботи?
                </div>
                <div className="confirm-box-actions">
                  <button type="button" className="btn btn-success" onClick={onConfirmAvailable}>
                    Так, я доступний
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditEnd(true)}
                  >
                    Продовжую стоянку
                  </button>
                </div>
              </div>
            )}

            {/* Edit planned end time */}
            <div style={{ marginTop: passed ? 0 : 4 }}>
              {(showEditEnd || !passed) && (
                <div className="field">
                  <label>Змінити планований час виходу</label>
                  <input
                    className="input"
                    type="datetime-local"
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                  />
                </div>
              )}
              <div className="action-row">
                {passed && showEditEnd ? (
                  <button type="button" className="btn btn-accent" onClick={onContinueRest}>
                    Зберегти новий час
                  </button>
                ) : !passed ? (
                  <button type="button" className="btn btn-secondary" onClick={onUpdateEnd}>
                    Оновити час виходу
                  </button>
                ) : null}
                <button type="button" className="btn btn-success" onClick={onEndEarly}>
                  Завершити стоянку достроково
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="disclaimer">
        Додаток фіксує заявлену водієм доступність і не підтверджує юридичну коректність
        відпочинку за регламентами ЄС.
      </p>
    </div>
  );
}
