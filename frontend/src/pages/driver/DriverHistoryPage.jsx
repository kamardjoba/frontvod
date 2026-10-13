import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { formatLong } from '../../utils/time.js';

export default function DriverHistoryPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.driverHistory().then(setItems).catch(() => {});
  }, []);

  return (
    <div>
      <Link to="/driver" className="btn btn-secondary" style={{ marginBottom: 12, display: 'inline-block' }}>
        ← На главную
      </Link>
      <div className="card">
        <h2>История отдыха</h2>
        {items.length === 0 && <p className="meta-line">Записей пока нет.</p>}
        {items.map((item) => (
          <div key={item.id} style={{ borderTop: '1px solid #e2e8f0', padding: '12px 0' }}>
            <strong>{formatLong(item.startedAt)}</strong>
            <div className="meta-line">Тип: {item.restType}</div>
            <div className="meta-line">Первоначальное окончание: {formatLong(item.initialPlannedEndAt)}</div>
            <div className="meta-line">Последнее планируемое окончание: {formatLong(item.currentPlannedEndAt)}</div>
            <div className="meta-line">
              Фактическая доступность: {item.actualAvailabilityAt ? formatLong(item.actualAvailabilityAt) : '—'}
            </div>
            <div className="meta-line">Источник изменений: {item.lastUpdatedBy}</div>
            {item.driverComment && <div className="meta-line">Комментарий: {item.driverComment}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
