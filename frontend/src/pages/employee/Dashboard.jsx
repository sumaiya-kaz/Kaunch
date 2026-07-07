import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { lunchService } from '../../services/lunchService';
import { subscriptionService } from '../../services/subscriptionService';
import { menuService } from '../../services/menuService';
import { settingsService } from '../../services/settingsService';
import StatusBadge from '../../components/StatusBadge';
import FoodPreferenceChip from '../../components/FoodPreferenceChip';

const formatCutoffDisplay = (time) => {
  const [hour, minute] = time.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
};

const isCutoffPassed = (cutoffTime) => {
  const now = new Date();
  const cutoff = new Date();
  const [hour, minute] = cutoffTime.split(':').map(Number);
  cutoff.setHours(hour, minute, 0, 0);
  return now >= cutoff;
};

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [todayConfirmation, setTodayConfirmation] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [menuData, setMenuData] = useState(null);
  const [selectedChoice, setSelectedChoice] = useState('');
  const [history, setHistory] = useState([]);
  const [cutoffTime, setCutoffTime] = useState('14:00');
  const [cutoffPassed, setCutoffPassed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [skipping, setSkipping] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    const cutoffResult = await settingsService.getCutoff();
    const activeCutoff = cutoffResult.success ? cutoffResult.cutoffTime : '14:00';
    setCutoffTime(activeCutoff);
    const passed = isCutoffPassed(activeCutoff);
    setCutoffPassed(passed);

    const currentDate = new Date();
    const today = currentDate.toISOString().split('T')[0];

    const confirmResult = await lunchService.getTodayConfirmation();
    let confirmation = confirmResult.success ? confirmResult.confirmation : null;

    const subResult = await subscriptionService.getMySubscription(
      currentDate.getMonth() + 1,
      currentDate.getFullYear()
    );
    const sub = subResult.success ? subResult.subscription : null;
    setSubscription(sub);

    const menuResult = await menuService.getTodayOptions();
    const menu = menuResult.success ? menuResult : null;
    setMenuData(menu);

    const hasSubscription = sub && ['full', 'half'].includes(sub.subscription_type);
    const choice = menu?.defaultChoice || '';
    setSelectedChoice(choice);

    if (
      !passed &&
      hasSubscription &&
      menu?.menu &&
      menu?.defaultChoice &&
      confirmation?.status !== 'skipped' &&
      confirmation?.status !== 'confirmed'
    ) {
      const autoResult = await lunchService.confirmLunch(
        today,
        'confirmed',
        '',
        menu.defaultChoice
      );
      if (autoResult.success) {
        confirmation = autoResult.confirmation;
      }
    }

    setTodayConfirmation(confirmation);

    const historyResult = await lunchService.getHistory(
      currentDate.getMonth() + 1,
      currentDate.getFullYear()
    );
    if (historyResult.success) {
      setHistory(historyResult.history);
    }

    setLoading(false);
  };

  const handleSkip = async () => {
    setSkipping(true);
    const today = new Date().toISOString().split('T')[0];
    const result = await lunchService.confirmLunch(today, 'skipped');

    if (result.success) {
      setTodayConfirmation({ ...result.confirmation, status: 'skipped' });
      setShowSkipModal(false);

      const currentDate = new Date();
      const historyResult = await lunchService.getHistory(
        currentDate.getMonth() + 1,
        currentDate.getFullYear()
      );
      if (historyResult.success) {
        setHistory(historyResult.history);
      }
    } else {
      alert(result.message);
    }

    setSkipping(false);
  };

  const handleUndo = async () => {
    const today = new Date().toISOString().split('T')[0];
    const defaultChoice = menuData?.defaultChoice || selectedChoice;
    const result = await lunchService.confirmLunch(today, 'confirmed', '', defaultChoice);

    if (result.success) {
      setTodayConfirmation(result.confirmation);
      setSelectedChoice(defaultChoice);

      const currentDate = new Date();
      const historyResult = await lunchService.getHistory(
        currentDate.getMonth() + 1,
        currentDate.getFullYear()
      );
      if (historyResult.success) {
        setHistory(historyResult.history);
      }
    } else {
      alert(result.message);
    }
  };

  const handleChoiceChange = async (value) => {
    setSelectedChoice(value);

    if (todayConfirmation?.status !== 'confirmed' || cutoffPassed) return;

    const today = new Date().toISOString().split('T')[0];
    const result = await lunchService.confirmLunch(today, 'confirmed', '', value);

    if (result.success) {
      setTodayConfirmation(result.confirmation);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const hasSubscription = subscription && ['full', 'half'].includes(subscription.subscription_type);
  const isSkipped = todayConfirmation?.status === 'skipped';
  const isConfirmed = todayConfirmation?.status === 'confirmed' || (!isSkipped && hasSubscription && menuData?.menu);

  return (
    <div className="space-y-sp-6">
      <div>
        <h1>Welcome, {user.name}!</h1>
        <p className="text-neutral-700 mt-2">
          Lunch is confirmed by default. Skip only if you are not eating today.
        </p>
      </div>

      <div className="card">
        <h2 className="mb-4">Today&apos;s Lunch</h2>

        {menuData?.menu ? (
          <div className="bg-primary-light p-5 rounded-xl mb-4 border border-primary/20">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
              {menuData.menu.menu_type === 'friday' ? 'Friday Special' : 'Today\'s Menu'}
            </p>
            <p className="font-bold text-xl text-neutral-900 leading-relaxed">
              {menuData.description}
            </p>
            {(menuData.menu.protein_dish ||
              menuData.menu.dal_item ||
              menuData.menu.side_item ||
              menuData.menu.extra_items) && (
              <div className="flex flex-wrap gap-2 mt-3">
                {menuData.menu.protein_dish && (
                  <span className="px-3 py-1 rounded-lg bg-white text-sm font-medium text-neutral-800">
                    {menuData.menu.protein_dish}
                  </span>
                )}
                {menuData.menu.dal_item && (
                  <span className="px-3 py-1 rounded-lg bg-white text-sm font-medium text-neutral-800">
                    {menuData.menu.dal_item}
                  </span>
                )}
                {menuData.menu.side_item && (
                  <span className="px-3 py-1 rounded-lg bg-white text-sm font-medium text-neutral-800">
                    {menuData.menu.side_item}
                  </span>
                )}
                {menuData.menu.extra_items &&
                  menuData.menu.extra_items.split(',').map((item) => {
                    const name = item.trim();
                    if (!name) return null;
                    return (
                      <span
                        key={name}
                        className="px-3 py-1 rounded-lg bg-white text-sm font-medium text-neutral-800"
                      >
                        {name}
                      </span>
                    );
                  })}
              </div>
            )}
            {menuData.officeDescription && (
              <p className="text-sm text-neutral-600 mt-3 pt-3 border-t border-primary/20">
                Your choice: <FoodPreferenceChip preference={menuData.monthlyFoodChoice} />
                {' · '}Office menu: {menuData.officeDescription}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-neutral-100 p-4 rounded-lg mb-4 text-neutral-600">
            No menu has been set for today yet.
          </div>
        )}

        <div className="bg-neutral-100 p-4 rounded-lg mb-4 flex justify-between items-center">
          <div>
            <p className="font-semibold">
              {isSkipped
                ? 'You skipped lunch today'
                : isConfirmed
                  ? 'Lunch confirmed for today'
                  : 'No lunch confirmation yet'}
            </p>
            {!cutoffPassed && !isSkipped && (
              <p className="text-sm text-neutral-600 mt-1">
                Auto-confirmed
                {menuData?.options?.length > 1 ? ' · change menu below or' : ' ·'} skip before{' '}
                {formatCutoffDisplay(cutoffTime)}
              </p>
            )}
            {cutoffPassed && (
              <p className="text-sm text-neutral-600 mt-1">
                Cutoff ({formatCutoffDisplay(cutoffTime)}) has passed
              </p>
            )}
            {!cutoffPassed && isSkipped && (
              <p className="text-sm text-neutral-600 mt-1">
                Changed your mind? Undo before {formatCutoffDisplay(cutoffTime)}.
              </p>
            )}
          </div>
          <StatusBadge status={isSkipped ? 'skipped' : isConfirmed ? 'confirmed' : 'pending'} />
        </div>

        {hasSubscription && menuData?.options?.length > 1 && !isSkipped && (
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Your Menu Choice</label>
            <p className="text-sm text-neutral-600 mb-3">
              Based on your monthly food choice (
              <FoodPreferenceChip preference={menuData.monthlyFoodChoice} />
              ). Change below if needed.
            </p>
            <div className="space-y-2">
              {menuData.options.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                    selectedChoice === option.value ? 'border-primary bg-primary-light' : 'border-neutral-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="menuChoice"
                    value={option.value}
                    checked={selectedChoice === option.value}
                    onChange={(e) => handleChoiceChange(e.target.value)}
                    disabled={cutoffPassed}
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {!hasSubscription && (
          <div className="bg-neutral-100 p-4 rounded-lg mb-4 text-neutral-700">
            Subscribe (full or half month) to get lunch by default.
          </div>
        )}

        {!cutoffPassed && hasSubscription && menuData?.menu && !isSkipped && (
          <button
            onClick={() => setShowSkipModal(true)}
            className="w-full p-4 rounded-lg border-2 border-danger text-danger hover:bg-danger-light transition font-semibold"
          >
            Skip lunch today
          </button>
        )}

        {!cutoffPassed && hasSubscription && menuData?.menu && isSkipped && (
          <button
            onClick={handleUndo}
            className="w-full p-4 rounded-lg border-2 border-primary bg-primary text-white hover:bg-primary-dark transition font-semibold"
          >
            Undo skip
          </button>
        )}
      </div>

      {showSkipModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => !skipping && setShowSkipModal(false)}
        >
          <div
            className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2">Skip lunch today?</h2>
            <p className="text-neutral-600 mb-6">
              You are currently confirmed for today&apos;s lunch
              {menuData?.description ? ` (${menuData.description})` : ''}. Are you sure you want to
              skip?
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowSkipModal(false)}
                disabled={skipping}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSkip}
                disabled={skipping}
                className="flex-1 p-3 rounded-lg border-2 border-danger bg-danger text-white hover:bg-danger/90 transition font-semibold disabled:opacity-50"
              >
                {skipping ? 'Skipping...' : 'Yes, skip lunch'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="text-sm text-neutral-700 mb-2">Subscription</h3>
          {subscription ? (
            <span className="badge-subscribed capitalize">{subscription.subscription_type} Month</span>
          ) : (
            <div className="text-neutral-400">No active subscription</div>
          )}
        </div>

        <div className="card">
          <h3 className="text-sm text-neutral-700 mb-2">Monthly Food Choice</h3>
          <FoodPreferenceChip
            preference={subscription?.monthly_food_choice || user.foodPreference}
          />
        </div>

        <div className="card">
          <h3 className="text-sm text-neutral-700 mb-2">Fine Balance</h3>
          <div className="text-2xl font-bold text-danger">৳{user.fineBalance || '0.00'}</div>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-4">This Month&apos;s History</h2>
        {history.length > 0 ? (
          <div className="grid grid-cols-7 gap-2">
            {history.map((day) => (
              <div
                key={day.id}
                className={`p-3 rounded text-center ${
                  day.status === 'confirmed'
                    ? 'bg-primary-light text-primary'
                    : day.status === 'skipped'
                      ? 'bg-danger-light text-danger'
                      : 'bg-neutral-100 text-neutral-400'
                }`}
              >
                <div className="text-xs">{new Date(day.date).getDate()}</div>
                <div className="text-2xl">
                  {day.status === 'confirmed' ? '✓' : day.status === 'skipped' ? '✗' : '·'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-neutral-400 py-8">No history for this month</div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
