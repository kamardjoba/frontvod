import { useEffect, useState } from 'react';
import { nowDisplay } from '../utils/time.js';

export default function LiveClock() {
  const [now, setNow] = useState(nowDisplay());

  useEffect(() => {
    const id = setInterval(() => setNow(nowDisplay()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ marginTop: 12 }}>
      <div className="driver-clock">{now.toFormat('HH:mm:ss')}</div>
      <div className="driver-clock-sub">
        {now.setLocale('uk').toFormat('cccc, d LLLL yyyy')}
      </div>
    </div>
  );
}
