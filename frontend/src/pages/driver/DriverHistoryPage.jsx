import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client.js';
import { formatLong } from '../../utils/time.js';

function restTypeLabel(type) {
  const map = {
    daily: 'Щоденний відпочинок',
    weekly_reduced_24h: 'Скорочений тижневий — 24 год',
    weekly_full_45h: 'Повний тижневий — 45 год',
    custom: 'Інший період',
  };
  return map[type] || type;
}

export default function DriverHistoryPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.driverHistory().then(setItems).catch(() => {});
  }, []);

  return (
    <div className="driver-page">
      <Link to="/driver" className="back-link">
        ← На головну
      </Link>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Історія стоянок</h1>
          <span className="meta-line">{items.length} записів</span>
        </div>
        {items.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">Записів поки немає</div>
          </div>
        )}
        {items.map((item) => (
          <div key={item.id} className="history-item">
            <div className="history-item-header">
              <strong>{formatLong(item.startedAt)}</strong>
            </div>
            <div className="history-meta">
              <div><span>Тип</span><strong>{restTypeLabel(item.restType)}</strong></div>
              <div><span>Плановий вихід</span><strong>{formatLong(item.currentPlannedEndAt)}</strong></div>
              <div>
                <span>Факт</span>
                <strong>{item.actualAvailabilityAt ? formatLong(item.actualAvailabilityAt) : '—'}</strong>
              </div>
              {item.driverComment && (
                <div><span>Коментар</span><strong>{item.driverComment}</strong></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
