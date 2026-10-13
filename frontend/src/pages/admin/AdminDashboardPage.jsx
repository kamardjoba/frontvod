import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { formatShort, remainingLabel } from '../../utils/time.js';

const FILTERS = [
  { key: 'all',                  label: 'Всі водії',        icon: '👥' },
  { key: 'resting',              label: 'На стоянці',       icon: '🅿️' },
  { key: 'soon_available',       label: 'Скоро доступні',   icon: '⏰' },
  { key: 'availability_passed',  label: 'Час вийшов',       icon: '🔴' },
  { key: 'working',              label: 'Доступні',         icon: '🟢' },
];

function LiveRemaining({ endAt }) {
  const [label, setLabel] = useState(() => remainingLabel(endAt));
  useEffect(() => {
    setLabel(remainingLabel(endAt));
    const id = setInterval(() => setLabel(remainingLabel(endAt)), 1000);
    return () => clearInterval(id);
  }, [endAt]);

  const passed = label === 'Запланированное время доступности наступило';
  const soon = !passed && label !== '—';
  const className = passed
    ? 'countdown-cell countdown-passed'
    : soon
    ? 'countdown-cell countdown-soon'
    : 'countdown-cell countdown-ok';

  return <span className={className}>{passed ? '‼️ Час вийшов' : label}</span>;
}

export default function AdminDashboardPage() {
  const { socket } = useSocket();
  const [stats, setStats] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('planned_exit');

  const load = useCallback(async () => {
    const data = await api.adminDashboard({ search, status: statusFilter, sortBy });
    setStats(data.stats);
    setDrivers(data.drivers);
  }, [search, statusFilter, sortBy]);

  useEffect(() => { load().catch(() => {}); }, [load]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => load().catch(() => {});
    socket.on('admin:dashboard', refresh);
    socket.on('drivers:updated', refresh);
    return () => {
      socket.off('admin:dashboard', refresh);
      socket.off('drivers:updated', refresh);
    };
  }, [socket, load]);

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <h1>Панель адміністратора</h1>
        <p>Статус водіїв в реальному часі</p>
      </div>

      {/* Stats */}
      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-label">Всього водіїв</div>
          <div className="stat-value">{stats?.totalDrivers ?? '—'}</div>
        </div>
        <div className="stat-card stat-blue">
          <div className="stat-icon">🅿️</div>
          <div className="stat-label">Зараз на стоянці</div>
          <div className="stat-value">{stats?.restingNow ?? '—'}</div>
        </div>
        <div className="stat-card stat-orange">
          <div className="stat-icon">⏰</div>
          <div className="stat-label">Скоро доступні</div>
          <div className="stat-value">{stats?.soonAvailable ?? '—'}</div>
        </div>
        <div className="stat-card stat-red">
          <div className="stat-icon">🔴</div>
          <div className="stat-label">Час вийшов</div>
          <div className="stat-value">{stats?.availabilityPassed ?? '—'}</div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="filters-bar">
        {/* Search */}
        <input
          className="input"
          style={{ maxWidth: 240, marginRight: 4 }}
          placeholder="🔍 Пошук водія..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Status filter buttons */}
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`btn ${statusFilter === f.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter(f.key)}
          >
            {f.icon} {f.label}
          </button>
        ))}

        {/* Sort */}
        <select
          className="select"
          style={{ maxWidth: 220, marginLeft: 'auto' }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="planned_exit">↑ За часом виходу</option>
          <option value="last_update">↑ За останнім оновленням</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrap">
        {drivers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-text">Водіїв не знайдено</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Водій</th>
                <th>Статус</th>
                <th>📍 Місто</th>
                <th>Початок стоянки</th>
                <th>Планований вихід</th>
                <th>До виходу</th>
                <th>Тривалість</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id}>
                  {/* Driver name */}
                  <td>
                    <div className="driver-name-cell">
                      {d.firstName} {d.lastName}
                    </div>
                    <div className="driver-email-cell">{d.phone || d.email || ''}</div>
                  </td>

                  {/* Status */}
                  <td>
                    <StatusBadge status={d.displayStatus} />
                  </td>

                  {/* City */}
                  <td>
                    {d.activeRest?.city ? (
                      <span className="city-badge">📍 {d.activeRest.city}</span>
                    ) : (
                      <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>—</span>
                    )}
                  </td>

                  {/* Start of parking */}
                  <td>
                    {d.activeRest ? (
                      <div className="date-cell">
                        <span className="date-main">{formatShort(d.activeRest.startedAt)}</span>
                      </div>
                    ) : '—'}
                  </td>

                  {/* Planned exit */}
                  <td>
                    {d.activeRest ? (
                      <div className="date-cell">
                        <span className="date-main">{formatShort(d.activeRest.currentPlannedEndAt)}</span>
                        <span className="date-sub">планований вихід</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: '0.85rem' }}>
                        Доступний
                      </span>
                    )}
                  </td>

                  {/* Countdown */}
                  <td>
                    {d.activeRest ? (
                      <LiveRemaining endAt={d.activeRest.currentPlannedEndAt} />
                    ) : '—'}
                  </td>

                  {/* Duration */}
                  <td style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    {d.activeRest?.plannedDurationLabel || '—'}
                  </td>

                  {/* Action */}
                  <td>
                    <Link
                      to={`/admin/drivers/${d.id}`}
                      className="btn btn-secondary"
                    >
                      Профіль →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
