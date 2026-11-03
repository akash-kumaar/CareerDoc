// StatusBadge — coloured pill showing opportunity status

const STATUS_LABELS = {
  saved:     'Saved',
  applied:   'Applied',
  interview: 'Interview',
  offer:     'Offer',
  rejected:  'Rejected',
  closed:    'Closed',
};

export default function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status;
  return (
    <span className={`status-badge ${status}`}>
      <span className={`status-dot ${status}`} />
      {label}
    </span>
  );
}
