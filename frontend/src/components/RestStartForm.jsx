import { useEffect, useMemo, useState } from 'react';
import {
  calcEndFromStartAndMinutes,
  fromDatetimeLocalValue,
  nowDisplay,
  toDatetimeLocalValue,
} from '../utils/time.js';

const PRESETS = [
  { label: '11 ч (суточный)', minutes: 11 * 60, type: 'daily' },
  { label: '24 ч', minutes: 24 * 60, type: 'weekly_reduced_24h' },
  { label: '45 ч', minutes: 45 * 60, type: 'weekly_full_45h' },
  { label: 'Свой период', minutes: null, type: 'custom' },
];

export default function RestStartForm({ onSubmit, loading, onCancel }) {
  const [city, setCity] = useState('');
  const [startedAt, setStartedAt] = useState(nowDisplay().toFormat("yyyy-MM-dd'T'HH:mm"));
  const [selectedPreset, setSelectedPreset] = useState(0); // index into PRESETS
  const [customHours, setCustomHours] = useState(9);
  const [customMinutes, setCustomMinutes] = useState(0);
  const [plannedEndAt, setPlannedEndAt] = useState('');

  const preset = PRESETS[selectedPreset];

  const durationMinutes = useMemo(() => {
    if (preset.minutes !== null) return preset.minutes;
    return customHours * 60 + customMinutes;
  }, [preset, customHours, customMinutes]);

  useEffect(() => {
    setPlannedEndAt(calcEndFromStartAndMinutes(startedAt, durationMinutes));
  }, [startedAt, durationMinutes]);

  const submit = (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    onSubmit({
      startedAt: fromDatetimeLocalValue(startedAt),
      restType: preset.type,
      durationMinutes,
      plannedEndAt: fromDatetimeLocalValue(plannedEndAt),
      city: city.trim(),
    });
  };

  return (
    <form onSubmit={submit} className="rest-form">
      <div className="rest-form-header">
        <div className="rest-form-title">🅿️ Стати на стоянку</div>
        <div className="rest-form-sub">Вкажіть місто, дату і час стоянки</div>
      </div>

      <div className="rest-form-body">
        {/* City */}
        <div className="field">
          <label>📍 Місто стоянки *</label>
          <div className="city-input-wrap">
            <input
              className="input"
              placeholder="Наприклад: Варшава, Берлін, Краків..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              autoFocus
            />
          </div>
        </div>

        {/* Start time */}
        <div className="field">
          <label>🕐 Початок стоянки</label>
          <input
            className="input"
            type="datetime-local"
            value={startedAt}
            onChange={(e) => setStartedAt(e.target.value)}
          />
        </div>

        {/* Duration presets */}
        <div className="field">
          <label>⏱ Тривалість відпочинку</label>
          <div className="duration-presets">
            {PRESETS.map((p, i) => (
              <button
                key={p.type}
                type="button"
                className={`preset-btn${selectedPreset === i ? ' active' : ''}`}
                onClick={() => setSelectedPreset(i)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {preset.type === 'custom' && (
            <div className="field-row" style={{ marginTop: 4 }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Годин</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  max="336"
                  value={customHours}
                  onChange={(e) => setCustomHours(Number(e.target.value))}
                />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Хвилин</label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  max="59"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Number(e.target.value))}
                />
              </div>
            </div>
          )}
        </div>

        {/* Planned end */}
        <div className="field">
          <label>🏁 Планований кінець стоянки (доступний для поїздки)</label>
          <input
            className="input"
            type="datetime-local"
            value={plannedEndAt}
            onChange={(e) => setPlannedEndAt(e.target.value)}
          />
        </div>

        <div className="action-row">
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading || !city.trim()}>
            {loading ? '⏳ Збереження...' : '✅ Підтвердити стоянку'}
          </button>
          {onCancel && (
            <button type="button" className="btn btn-secondary btn-lg" onClick={onCancel}>
              Скасувати
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

export { toDatetimeLocalValue };
