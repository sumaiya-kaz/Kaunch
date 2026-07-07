import { useState, useEffect } from 'react';
import { lunchService } from '../../services/lunchService';
import { fineService } from '../../services/fineService';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';

const todayStr = () => new Date().toISOString().split('T')[0];

const formatDateLabel = (dateStr) =>
  new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
const DailySheet = () => {
  const [date, setDate] = useState(todayStr);
  const [sheet, setSheet] = useState([]);
  const [summary, setSummary] = useState(null);
  const [dailyFines, setDailyFines] = useState([]);
  const [viewMode, setViewMode] = useState('sheet');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState(null);
  const [generateModal, setGenerateModal] = useState(null);
  const [confirmGenerate, setConfirmGenerate] = useState(null);

  useEffect(() => {
    setViewMode('sheet');
    loadData();
  }, [date]);

  const loadData = async () => {
    setLoading(true);
    setMessage(null);

    const sheetResult = await lunchService.getDailySheet(date);
    if (sheetResult.success) {
      setSheet(sheetResult.sheet);
      setSummary(sheetResult.summary);
    }

    const finesResult = await fineService.getDailyFines(date);
    if (finesResult.success) {
      setDailyFines(finesResult.fines);
    }

    setLoading(false);
  };

  const toggleEnjoyed = (employeeId) => {
    setSheet((prev) =>
      prev.map((row) =>
        row.employee_id === employeeId ? { ...row, enjoyed: !row.enjoyed } : row
      )
    );
  };

  const markAllEnjoyed = () => {
    setSheet((prev) => prev.map((row) => ({ ...row, enjoyed: true })));
  };

  const clearAll = () => {
    setSheet((prev) => prev.map((row) => ({ ...row, enjoyed: false })));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const entries = sheet.map((row) => ({
      employee_id: row.employee_id,
      enjoyed: row.enjoyed,
    }));

    const result = await lunchService.saveDailySheet(date, entries);
    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      const sheetResult = await lunchService.getDailySheet(date);
      if (sheetResult.success) {
        setSheet(sheetResult.sheet);
        setSummary(sheetResult.summary);
      }
      const finesResult = await fineService.getDailyFines(date);
      if (finesResult.success) {
        setDailyFines(finesResult.fines);
      }
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    setSaving(false);
  };

  const runGenerateFines = async () => {
    setGenerating(true);
    setMessage(null);

    const saveResult = await lunchService.saveDailySheet(
      date,
      sheet.map((row) => ({ employee_id: row.employee_id, enjoyed: row.enjoyed }))
    );

    if (!saveResult.success) {
      setGenerating(false);
      setGenerateModal({
        type: 'error',
        message: saveResult.message,
        fines: [],
        dateLabel: formatDateLabel(date),
      });
      return;
    }

    const result = await fineService.generateFinesFromSheet(date);
    setGenerating(false);

    if (result.success) {
      const activeFines = result.activeFines || [];
      setDailyFines(activeFines);

      const sheetResult = await lunchService.getDailySheet(date);
      if (sheetResult.success) {
        setSheet(sheetResult.sheet);
        setSummary(sheetResult.summary);
      }

      setGenerateModal({
        type: 'success',
        message: result.message,
        fines: activeFines,
        created: result.created ?? activeFines.length,
        revoked: result.revoked ?? 0,
        dateLabel: formatDateLabel(date),
      });
    } else {
      setGenerateModal({
        type: 'error',
        message: result.message || 'Failed to generate fines',
        fines: [],
        dateLabel: formatDateLabel(date),
      });
    }
  };

  const handleGenerateFines = () => {
    const notSigned = sheet.filter((row) => !row.enjoyed);

    if (notSigned.length > 0) {
      setConfirmGenerate({ count: notSigned.length });
      return;
    }

    runGenerateFines();
  };

  const handleConfirmGenerate = () => {
    setConfirmGenerate(null);
    runGenerateFines();
  };
  const closeGenerateModal = (viewFines = false) => {
    if (viewFines && generateModal?.fines?.length > 0) {
      setViewMode('fines');
    }
    setGenerateModal(null);
  };

  const dateLabel = formatDateLabel(date);
  if (loading) {
    return <div className="text-center py-12 text-neutral-400">Loading daily sheet…</div>;
  }

  const showingFines = viewMode === 'fines';

  return (
    <div>
      <PageHeader
        title="Daily Food Sheet"
        subtitle={
          showingFines
            ? 'Fines generated — employees can view this list on their History page'
            : "Enter who signed today's food enjoyment sheet, then generate fines"
        }
      />

      <div className="filter-bar mb-sp-6">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-sm font-semibold mb-2 text-neutral-700">Date</label>
          <input
            type="date"
            className="input-field"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        {!showingFines && (
          <div className="flex items-end gap-2">
            <button type="button" onClick={markAllEnjoyed} className="btn-secondary">
              Mark all signed
            </button>
            <button type="button" onClick={clearAll} className="btn-secondary">
              Clear all
            </button>
          </div>
        )}
      </div>

      {message && (
        <div
          className={`mb-sp-6 p-4 rounded-lg text-sm font-medium ${
            message.type === 'success'
              ? 'bg-primary/10 text-primary-dark'
              : message.type === 'error'
                ? 'bg-danger/10 text-danger'
                : 'bg-accent/10 text-neutral-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-sp-6">
          <StatCard label="Subscribed" value={summary.total} variant="primary" icon="👥" />
          <StatCard label="Signed sheet" value={summary.enjoyed} variant="primary" icon="✓" />
          <StatCard
            label="Not signed"
            value={summary.not_enjoyed + summary.pending}
            variant="danger"
            icon="✗"
          />
          <StatCard
            label="Fines generated"
            value={dailyFines.length}
            variant="subscription"
            icon="💰"
          />
        </div>
      )}

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="card-section-title mb-1">
              {showingFines ? `Generated fine list — ${dateLabel}` : `Sheet entry — ${dateLabel}`}
            </h2>
            <p className="text-sm text-neutral-600">
              {showingFines
                ? 'Employees can see this list on their History page.'
                : 'Check employees who signed that they enjoyed today\'s food'}
            </p>
          </div>
          <div className="flex gap-2">
            {showingFines ? (
              <button
                type="button"
                onClick={() => setViewMode('sheet')}
                className="btn-secondary"
              >
                ← Back to sheet entry
              </button>
            ) : (
              <>
                {dailyFines.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setViewMode('fines')}
                    className="btn-secondary"
                  >
                    View fine list ({dailyFines.length})
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || sheet.length === 0}
                  className="btn-secondary"
                >
                  {saving ? 'Saving…' : 'Save sheet'}
                </button>
                <button
                  type="button"
                  onClick={handleGenerateFines}
                  disabled={generating || sheet.length === 0}
                  className="btn-primary"
                >
                  {generating ? 'Generating…' : 'Generate fines'}
                </button>
              </>
            )}
          </div>
        </div>

        {showingFines ? (
          dailyFines.length > 0 ? (
            <div className="overflow-x-auto -mx-sp-5 px-sp-5">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Amount</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyFines.map((fine) => (
                    <tr key={fine.id}>
                      <td className="font-mono text-neutral-700">{fine.emp_id}</td>
                      <td className="font-semibold">{fine.employee_name}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon="🎉" message="No fines for this date yet" />
          )
        ) : sheet.length > 0 ? (
          <div className="overflow-x-auto -mx-sp-5 px-sp-5">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-12">Signed</th>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Subscription</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sheet.map((row) => (
                  <tr
                    key={row.employee_id}
                    className={!row.enjoyed ? 'bg-danger/5' : ''}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={row.enjoyed}
                        onChange={() => toggleEnjoyed(row.employee_id)}
                        className="w-5 h-5 accent-primary cursor-pointer"
                        aria-label={`${row.name} signed sheet`}
                      />
                    </td>
                    <td className="font-mono text-neutral-700">{row.emp_id}</td>
                    <td className="font-semibold">{row.name}</td>
                    <td className="capitalize">{row.subscription_type}</td>
                    <td>
                      <span
                        className={`badge ${
                          row.enjoyed ? 'badge-confirmed' : 'badge-pending'
                        }`}
                      >
                        {row.enjoyed ? 'Signed' : 'Not signed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon="📋"
            message="No subscribed employees for this date. Check subscriptions are set for this month."
          />
        )}
      </div>

      {generateModal && (
        <Modal open onClose={() => closeGenerateModal(false)}>
          <div className="bg-white rounded-lg p-6 sm:p-8 shadow-xl">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">
                {generateModal.type === 'error'
                  ? '⚠️'
                  : generateModal.fines.length > 0
                    ? '💰'
                    : '🎉'}
              </div>
              <h2 className="text-xl font-bold text-neutral-900 mb-2">
                {generateModal.type === 'error'
                  ? 'Generation Failed'
                  : generateModal.fines.length > 0
                    ? 'Fines Generated'
                    : 'No Fines Applied'}
              </h2>
              <p className="text-sm text-neutral-600">{generateModal.dateLabel}</p>
            </div>

            <p
              className={`text-center mb-6 ${
                generateModal.type === 'error' ? 'text-danger' : 'text-neutral-700'
              }`}
            >
              {generateModal.message}
            </p>

            {generateModal.type === 'success' && generateModal.fines.length > 0 ? (
              <div className="mb-6">
                <p className="text-sm font-semibold text-neutral-700 mb-3">
                  {generateModal.fines.length} employee(s) fined:
                </p>
                <div className="border border-neutral-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-100">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Name</th>
                        <th className="px-3 py-2 text-right font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generateModal.fines.map((fine) => (
                        <tr key={fine.id} className="border-t border-neutral-100">
                          <td className="px-3 py-2">{fine.employee_name}</td>
                          <td className="px-3 py-2 text-right font-bold text-danger">
                            ৳{fine.amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-neutral-500 mt-3 text-center">
                  Employees can view this list on their History page.
                </p>
              </div>
            ) : generateModal.type === 'success' ? (
              <div className="bg-primary/10 rounded-lg p-4 mb-6 text-center text-sm text-primary-dark">
                Everyone signed the sheet — no fines for this date.
              </div>
            ) : null}

            <div className="flex gap-3 justify-center">
              {generateModal.type === 'success' && generateModal.fines.length > 0 && (
                <button
                  type="button"
                  onClick={() => closeGenerateModal(true)}
                  className="btn-primary"
                >
                  View fine list
                </button>
              )}
              <button
                type="button"
                onClick={() => closeGenerateModal(false)}
                className={
                  generateModal.type === 'success' && generateModal.fines.length > 0
                    ? 'btn-secondary'
                    : 'btn-primary'
                }
              >
                {generateModal.type === 'error' ? 'Close' : generateModal.fines.length > 0 ? 'Close' : 'OK'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {confirmGenerate && (
        <Modal open onClose={() => setConfirmGenerate(null)}>
          <div className="bg-white rounded-lg p-6 sm:p-8 shadow-xl">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">⚠️</div>
              <h2 className="text-xl font-bold text-neutral-900 mb-2">Confirm fine generation</h2>
              <p className="text-sm text-neutral-600">{dateLabel}</p>
            </div>
            <p className="text-center text-neutral-700 mb-6">
              Generate fines for{' '}
              <strong>{confirmGenerate.count}</strong> employee(s) who did not sign the sheet?
            </p>
            <div className="flex gap-3 justify-center">
              <button type="button" onClick={() => setConfirmGenerate(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmGenerate}
                disabled={generating}
                className="btn-primary"
              >
                {generating ? 'Generating…' : 'Yes, generate fines'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>  );
};

export default DailySheet;
