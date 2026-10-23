import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client.js';

export default function AdminCreateDriverPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.createDriver(form);
      navigate(`/admin/drivers/${res.driver.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <Link to="/admin" className="back-link">
        ← До панелі
      </Link>

      <div className="card">
        {/* Card header */}
        <div style={{
          background: 'var(--primary-gradient)',
          margin: '-24px -24px 24px',
          padding: '22px 24px',
          borderRadius: 'var(--radius) var(--radius) 0 0',
          color: '#fff',
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>👤</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>Додати водія</div>
          <div style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: 3 }}>
            Водій отримає доступ до особистого кабінету за цими даними
          </div>
        </div>

        <form onSubmit={onSubmit}>
          <div className="field-row">
            <div className="field">
              <label>Ім'я</label>
              <input
                className="input"
                placeholder="Іван"
                value={form.firstName}
                onChange={onChange('firstName')}
                required
              />
            </div>
            <div className="field">
              <label>Прізвище</label>
              <input
                className="input"
                placeholder="Коваленко"
                value={form.lastName}
                onChange={onChange('lastName')}
                required
              />
            </div>
          </div>

          <div className="field">
            <label>Email (логін водія)</label>
            <input
              className="input"
              type="email"
              placeholder="ivan@company.com"
              value={form.email}
              onChange={onChange('email')}
              required
            />
          </div>

          <div className="field">
            <label>Телефон</label>
            <input
              className="input"
              type="tel"
              placeholder="+380 67 000 00 00"
              value={form.phone}
              onChange={onChange('phone')}
            />
          </div>

          <div className="field">
            <label>Пароль (мінімум 8 символів)</label>
            <input
              className="input"
              type="password"
              placeholder="Введіть надійний пароль"
              minLength={8}
              value={form.password}
              onChange={onChange('password')}
              required
            />
          </div>

          {error && <div className="notice notice-error" style={{ marginBottom: 14 }}>{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
          >
            {loading ? 'Збереження...' : 'Створити водія'}
          </button>
        </form>
      </div>
    </div>
  );
}
