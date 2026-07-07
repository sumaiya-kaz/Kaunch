const VARIANTS = {
  primary: {
    bg: 'bg-primary-light',
    border: 'border-primary-dark',
    label: 'text-primary',
    value: 'text-primary-dark',
  },
  danger: {
    bg: 'bg-danger-light',
    border: 'border-danger',
    label: 'text-danger',
    value: 'text-danger',
  },
  subscription: {
    bg: 'bg-subscription/10',
    border: 'border-subscription',
    label: 'text-subscription',
    value: 'text-subscription',
  },
  accent: {
    bg: 'bg-accent-light',
    border: 'border-accent',
    label: 'text-accent',
    value: 'text-accent',
  },
};

const StatCard = ({ label, value, variant = 'primary', icon }) => {
  const styles = VARIANTS[variant] || VARIANTS.primary;

  return (
    <div className={`stat-card ${styles.bg} ${styles.border}`}>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold mb-1 ${styles.label}`}>{label}</p>
        <p className={`text-3xl sm:text-4xl font-bold tracking-tight ${styles.value}`}>{value}</p>
      </div>
      {icon && <span className="text-3xl shrink-0 opacity-90" aria-hidden="true">{icon}</span>}
    </div>
  );
};

export default StatCard;
