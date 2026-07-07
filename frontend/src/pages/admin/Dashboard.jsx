import { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { lunchService } from '../../services/lunchService';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import FoodPreferenceChip from '../../components/FoodPreferenceChip';

const FOOD_ICONS = {
  regular: '🍽',
  no_fish: '🍗',
  no_chicken: '🐟',
  no_mutton_beef: '🥗',
  always_fish: '🐟',
};

const todayLabel = () =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [todayConfirmations, setTodayConfirmations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    const statsResult = await reportService.getDashboardStats();
    if (statsResult.success) {
      setStats(statsResult);
    }

    const today = new Date().toISOString().split('T')[0];
    const confirmationsResult = await lunchService.getAllTodayConfirmations(today);
    if (confirmationsResult.success) {
      setTodayConfirmations(confirmationsResult.confirmations);
    }

    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-12 text-neutral-400">Loading dashboard…</div>;
  }

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle={todayLabel()} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-sp-6">
        <StatCard
          label="Today Confirmed"
          value={stats?.today?.today_confirmed || 0}
          variant="primary"
          icon="✓"
        />
        <StatCard
          label="Today Skipped"
          value={stats?.today?.today_skipped || 0}
          variant="danger"
          icon="✗"
        />
        <StatCard
          label="Month Fines"
          value={`৳${stats?.monthly?.month_fines || 0}`}
          variant="subscription"
          icon="💰"
        />
      </div>

      {stats?.foodBreakdown && stats.foodBreakdown.length > 0 && (
        <div className="card mb-sp-6">
          <h2 className="card-section-title">Today&apos;s Food Preferences</h2>
          <div className="grid grid-cols-2 gap-3">
            {stats.foodBreakdown.map((item) => (
              <div key={item.food_preference} className="mini-stat">
                <div className="text-2xl mb-2">{FOOD_ICONS[item.food_preference] || '🍽'}</div>
                <p className="text-xs font-semibold text-neutral-700 leading-snug">
                  {item.label || item.food_preference?.replace(/_/g, ' ')}
                </p>
                <div className="text-2xl font-bold text-primary-dark mt-2">{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="card-section-title">Today&apos;s Confirmations</h2>
        {todayConfirmations.length > 0 ? (
          <div className="overflow-x-auto -mx-sp-5 px-sp-5">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Food Preference</th>
                </tr>
              </thead>
              <tbody>
                {todayConfirmations.map((item) => (
                  <tr key={item.id}>
                    <td className="font-mono text-neutral-700">{item.emp_id}</td>
                    <td className="font-semibold">{item.name}</td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>
                      <FoodPreferenceChip preference={item.food_preference} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon="🍽" message="No confirmations yet today" />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
