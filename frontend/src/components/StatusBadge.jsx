const StatusBadge = ({ status }) => {
  const badges = {
    confirmed: {
      label: '✓ Confirmed',
      className: 'badge-confirmed',
    },
    skipped: {
      label: '✗ Skipped',
      className: 'badge-skipped',
    },
    pending: {
      label: '⏱ Pending',
      className: 'badge-pending',
    },
  };

  const badge = badges[status] || badges.pending;

  return (
    <span className={badge.className}>
      {badge.label}
    </span>
  );
};

export default StatusBadge;
