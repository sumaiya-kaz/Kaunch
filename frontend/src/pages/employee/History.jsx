import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { lunchService } from '../../services/lunchService';
import { fineService } from '../../services/fineService';
import StatusBadge from '../../components/StatusBadge';
import {
  formatDateLocal,
  parseLocalDate,
  getMonday,
  getFriday,
  getWeekdayDates,
  formatWeekRange,
  toDateKey,
} from '../../utils/weekMenuUtils';

const todayMonday = () => getMonday(formatDateLocal(new Date()));
const todayStr = () => new Date().toISOString().split('T')[0];

const History = () => {
  const { user } = useAuth();
  const [weekStartDate, setWeekStartDate] = useState(todayMonday);
  const [historyByDate, setHistoryByDate] = useState({});
  const [fines, setFines] = useState([]);
  const [dailyFines, setDailyFines] = useState([]);
  const [dailyFinesDate, setDailyFinesDate] = useState(todayStr);
  const [dailyFinesGenerated, setDailyFinesGenerated] = useState(false);
  const [loading, setLoading] = useState(true);

  const weekdayDates = useMemo(() => getWeekdayDates(weekStartDate), [weekStartDate]);
  const weekRange = useMemo(
    () => formatWeekRange(weekStartDate, weekStartDate),
    [weekStartDate]
  );

  useEffect(() => {
    loadHistory();
    loadFines();
    loadDailyFines();
  }, [weekStartDate]);

  useEffect(() => {
    loadDailyFines();
  }, [dailyFinesDate]);

  const loadHistory = async () => {
    setLoading(true);

    const monday = parseLocalDate(getMonday(weekStartDate));
    const friday = parseLocalDate(getFriday(weekStartDate));

    const monthsToFetch = new Set([
      `${monday.getMonth() + 1}-${monday.getFullYear()}`,
      `${friday.getMonth() + 1}-${friday.getFullYear()}`,
    ]);

    const allHistory = [];
    for (const key of monthsToFetch) {
      const [month, year] = key.split('-').map(Number);
      const result = await lunchService.getHistory(month, year);
      if (result.success) {
        allHistory.push(...result.history);
      }
    }

    const weekdaySet = new Set(weekdayDates);
    const byDate = {};
    allHistory.forEach((item) => {
      const dateKey = toDateKey(item.date);
      if (weekdaySet.has(dateKey)) {
        byDate[dateKey] = item;
      }
    });

    setHistoryByDate(byDate);
    setLoading(false);
  };

  const loadFines = async () => {
    const result = await fineService.getMyFines();
    if (result.success) {
      setFines(result.fines);
    }
  };

  const loadDailyFines = async () => {
    const result = await fineService.getDailyFines(dailyFinesDate);
    if (result.success) {
      setDailyFines(result.fines);
      setDailyFinesGenerated(result.generated);
    }
  };

  const goToPrevWeek = () => {
    const d = parseLocalDate(weekStartDate);
    d.setDate(d.getDate() - 7);
    setWeekStartDate(formatDateLocal(d));
  };

  const goToNextWeek = () => {
    const d = parseLocalDate(weekStartDate);
    d.setDate(d.getDate() + 7);
    setWeekStartDate(formatDateLocal(d));
  };

  const goToThisWeek = () => {
    setWeekStartDate(todayMonday());
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const hasAnyHistory = weekdayDates.some((date) => historyByDate[date]);

  return (
    <div>
      <h1 className="mb-sp-6">Lunch History & Fines</h1>

      {/* Week Selector */}
      <div className="card mb-sp-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-neutral-700 mb-1">Selected week</p>
            <p className="text-lg font-semibold">{weekRange}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={goToPrevWeek} className="btn-secondary">
              ← Prev
            </button>
            <button type="button" onClick={goToThisWeek} className="btn-secondary">
              This week
            </button>
            <button type="button" onClick={goToNextWeek} className="btn-secondary">
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* History Table — Mon–Fri only */}
      <div className="card mb-sp-6">
        <h2 className="mb-4">Lunch Confirmations</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-dark text-white">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Day</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {weekdayDates.map((date, index) => {
                const item = historyByDate[date];
                return (
                  <tr
                    key={date}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-neutral-100'}
                  >
                    <td className="px-4 py-3 font-mono">
                      {parseLocalDate(date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {parseLocalDate(date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </td>
                    <td className="px-4 py-3">
                      {item ? (
                        <StatusBadge status={item.status} />
                      ) : (
                        <span className="text-sm text-neutral-400">No data</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {item?.notes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!hasAnyHistory && (
          <p className="text-center text-neutral-400 text-sm mt-4">
            No confirmations recorded for this week
          </p>
        )}
      </div>

      {/* Daily Fine List (published by admin) */}
      <div className="card mb-sp-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="mb-1">Daily Fine List</h2>
            <p className="text-sm text-neutral-600">
              {dailyFinesGenerated
                ? 'Fines published by admin for the selected date'
                : 'No fines have been published for this date yet'}
            </p>
          </div>
          <div className="min-w-[160px]">
            <label className="block text-sm font-semibold mb-2 text-neutral-700">Date</label>
            <input
              type="date"
              className="input-field"
              value={dailyFinesDate}
              onChange={(e) => setDailyFinesDate(e.target.value)}
            />
          </div>
        </div>

        {dailyFinesGenerated ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-danger text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Employee ID</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Reason</th>
                </tr>
              </thead>
              <tbody>
                {dailyFines.map((fine, index) => {
                  const isMe = fine.employee_id === user?.id;
                  return (
                    <tr
                      key={fine.id}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-neutral-100'} ${
                        isMe ? 'ring-2 ring-inset ring-danger/30' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono">{fine.emp_id}</td>
                      <td className="px-4 py-3 font-semibold">
                        {fine.employee_name}
                        {isMe && (
                          <span className="ml-2 text-xs font-bold text-danger">(You)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-danger">৳{fine.amount}</td>
                      <td className="px-4 py-3 text-sm">{fine.reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-neutral-400 py-8">
            Admin has not generated fines for this date yet
          </div>
        )}
      </div>

      {/* Fines */}
      <div className="card">
        <h2 className="mb-4">Fines</h2>
        {fines.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-danger text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Reason</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {fines.map((fine, index) => (
                  <tr
                    key={fine.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-neutral-100'}
                  >
                    <td className="px-4 py-3 font-mono">
                      {new Date(fine.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-bold text-danger">
                      ৳{fine.amount}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {fine.reason}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${
                        fine.status === 'paid' ? 'badge-confirmed' : 'badge-pending'
                      }`}>
                        {fine.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-neutral-400 py-8">
            No fines 🎉
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
