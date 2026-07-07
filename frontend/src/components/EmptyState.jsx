const EmptyState = ({ icon = '📭', message }) => (
  <div className="empty-state">
    <span className="text-4xl mb-3 block" aria-hidden="true">{icon}</span>
    <p>{message}</p>
  </div>
);

export default EmptyState;
