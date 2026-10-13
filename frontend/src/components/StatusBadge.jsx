export default function StatusBadge({ status }) {
  if (!status) return null;
  const colorClass = `status-${status.color || 'gray'}`;
  return (
    <span className={`status-badge ${colorClass}`}>
      <span className="status-dot" />
      {status.label}
    </span>
  );
}
