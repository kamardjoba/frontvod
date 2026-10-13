import { DateTime } from 'luxon';

export const DEFAULT_TZ = 'Europe/Warsaw';

export function nowDisplay(timezone = DEFAULT_TZ) {
  return DateTime.now().setZone(timezone).setLocale('ru');
}

export function toDatetimeLocalValue(isoUtc, timezone = DEFAULT_TZ) {
  if (!isoUtc) return '';
  return DateTime.fromISO(isoUtc, { zone: 'utc' }).setZone(timezone).toFormat("yyyy-MM-dd'T'HH:mm");
}

export function fromDatetimeLocalValue(value, timezone = DEFAULT_TZ) {
  const dt = DateTime.fromISO(value, { zone: timezone });
  if (!dt.isValid) return null;
  return dt.toUTC().toISO();
}

export function formatLong(isoUtc, timezone = DEFAULT_TZ) {
  if (!isoUtc) return '—';
  return DateTime.fromISO(isoUtc, { zone: 'utc' }).setZone(timezone).setLocale('ru').toFormat('d LLLL, HH:mm');
}

export function formatShort(isoUtc, timezone = DEFAULT_TZ) {
  if (!isoUtc) return '—';
  return DateTime.fromISO(isoUtc, { zone: 'utc' }).setZone(timezone).toFormat('dd.MM, HH:mm');
}

export function calcEndFromStartAndMinutes(startLocalValue, minutes, timezone = DEFAULT_TZ) {
  const start = DateTime.fromISO(startLocalValue, { zone: timezone });
  if (!start.isValid) return '';
  return start.plus({ minutes }).toFormat("yyyy-MM-dd'T'HH:mm");
}

export function remainingLabel(endIsoUtc) {
  if (!endIsoUtc) return '—';
  const end = DateTime.fromISO(endIsoUtc, { zone: 'utc' });
  const diff = end.diff(DateTime.utc()).as('milliseconds');
  if (diff <= 0) return 'Запланированное время доступности наступило';
  const totalMinutes = Math.floor(diff / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours} ч ${minutes} мин`;
  return `${minutes} мин`;
}

export function durationPresetMinutes(restType) {
  switch (restType) {
    case 'daily':
      return 11 * 60;
    case 'weekly_reduced_24h':
      return 24 * 60;
    case 'weekly_full_45h':
      return 45 * 60;
    default:
      return null;
  }
}
