import { useState, useEffect } from 'react';
import { settingsService } from '../../services/settingsService';

const Settings = () => {
  const [cutoffTime, setCutoffTime] = useState('14:00');
  const [cutoffDisplay, setCutoffDisplay] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const result = await settingsService.getCutoff();
    if (result.success) {
      setCutoffTime(result.cutoffTime);
      setCutoffDisplay(result.cutoffDisplay);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const result = await settingsService.updateCutoff(cutoffTime);

    if (result.success) {
      setCutoffDisplay(result.cutoffDisplay);
      setMessage({ type: 'success', text: result.message });
    } else {
      setMessage({ type: 'error', text: result.message });
    }

    setSaving(false);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-sp-6">Settings</h1>

      <div className="card">
        <h2 className="mb-6">Lunch Cutoff Time</h2>

        {message && (
          <div
            className={`px-4 py-3 rounded-lg mb-6 ${
              message.type === 'success'
                ? 'bg-primary-light text-primary'
                : 'bg-danger-light text-danger'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Cutoff Time</label>
            <input
              type="time"
              className="input-field max-w-xs"
              value={cutoffTime}
              onChange={(e) => setCutoffTime(e.target.value)}
              required
            />
            {cutoffDisplay && (
              <p className="text-sm text-neutral-600 mt-2">
                Current: <span className="font-semibold">{cutoffDisplay}</span>
              </p>
            )}
          </div>

          <div className="bg-neutral-100 p-4 rounded-lg text-sm text-neutral-700 space-y-1">
            <p>Warning reminder: 15 minutes before cutoff</p>
            <p>Fine calculation: 5 minutes after cutoff</p>
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Cutoff Time'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
