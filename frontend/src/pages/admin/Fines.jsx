import { useState, useEffect } from 'react';
import { fineService } from '../../services/fineService';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';

const MONTHS = [...Array(12)].map((_, i) => ({
  value: i + 1,
  label: new Date(2000, i).toLocaleString('default', { month: 'long' }),
}));

const YEARS = [2023, 2024, 2025, 2026];

const Fines = () => {
  const [fines, setFines] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFines();
    loadStats();
  }, [month, year]);

  const loadFines = async () => {
    setLoading(true);
    const result = await fineService.getAllFines(month, year);
    if (result.success) {
      setFines(result.fines);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    const result = await fineService.getMonthlyStats(month, year);
    if (result.success) {
      setStats(result.stats);
    }
  };

  const handleStatusUpdate = async (fineId, newStatus) => {
    const result = await fineService.updateFineStatus(fineId, newStatus, '');
    if (result.success) {
      loadFines();
      loadStats();
    } else {
      alert(result.message);
    }
  };

  const periodLabel = `${MONTHS.find((m) => m.value === month)?.label} ${year}`;

  if (loading) {
    return <div className="text-center py-12 text-neutral-400">Loading fines…</div>;
  }

  return (
    <div>
      <PageHeader title="Fine Management" subtitle={`Overview for ${periodLabel}`} />

      <div className="filter-bar mb-sp-6">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-sm font-semibold mb-2 text-neutral-700">Month</label>
          <select
            className="input-field"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[120px]">
          <label className="block text-sm font-semibold mb-2 text-neutral-700">Year</label>
          <select
            className="input-field"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value, 10))}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-sp-6">
          <StatCard
            label="Total Fines"
            value={stats.total_fines || 0}
            variant="danger"
            icon="📋"
          />
          <StatCard
            label="Total Amount"
            value={`৳${stats.total_amount || 0}`}
            variant="subscription"
            icon="💰"
          />
          <StatCard
            label="Pending"
            value={stats.pending_count || 0}
            variant="accent"
            icon="⏱"
          />
          <StatCard
            label="Paid"
            value={stats.paid_count || 0}
            variant="primary"
            icon="✓"
          />
        </div>
      )}

      <div className="card">
        <h2 className="card-section-title">Fines — {periodLabel}</h2>
        {fines.length > 0 ? (
          <div className="overflow-x-auto -mx-sp-5 px-sp-5">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {fines.map((fine) => (
                  <tr key={fine.id}>
                    <td className="font-mono text-neutral-700">{fine.emp_id}</td>
                    <td className="font-semibold">{fine.employee_name}</td>
                    <td className="font-mono text-neutral-700">
                      {new Date(fine.date).toLocaleDateString()}
                    </td>
                    <td className="font-bold text-danger">৳{fine.amount}</td>
                    <td className="text-neutral-700">{fine.reason}</td>
                    <td>
                      <span
                        className={`badge ${
                          fine.status === 'paid' ? 'badge-confirmed' : 'badge-pending'
                        }`}
                      >
                        {fine.status}
                      </span>
                    </td>
                    <td>
                      {fine.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleStatusUpdate(fine.id, 'paid')}
                          className="text-sm font-semibold text-primary hover:text-primary-dark hover:underline"
                        >
                          Mark paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon="🎉" message="No fines for this period" />
        )}
      </div>
    </div>
  );
};

export default Fines;
