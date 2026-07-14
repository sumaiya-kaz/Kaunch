import { useState, useEffect } from 'react';
import { useAuth } from '@kaunch/shared-auth';
import { subscriptionService } from '@kaunch/shared-api';
import { FoodPreferenceChip, FOOD_CHOICE_OPTIONS } from '@kaunch/shared-ui';

const Subscription = () => {
  const { user } = useAuth();
  const [subscriptionType, setSubscriptionType] = useState('full');
  const [monthlyFoodChoice, setMonthlyFoodChoice] = useState(user?.foodPreference || 'regular');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCurrentSubscription();
  }, [month, year]);

  const loadCurrentSubscription = async () => {
    const result = await subscriptionService.getMySubscription(month, year);
    if (result.success) {
      setCurrentSubscription(result.subscription);
      if (result.subscription) {
        setSubscriptionType(result.subscription.subscription_type);
        setMonthlyFoodChoice(
          result.subscription.monthly_food_choice || result.defaultFoodChoice || 'regular'
        );
      } else {
        setMonthlyFoodChoice(result.defaultFoodChoice || user?.foodPreference || 'regular');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const result = await subscriptionService.createSubscription(
      subscriptionType,
      month,
      year,
      monthlyFoodChoice
    );

    setLoading(false);

    if (result.success) {
      setMessage({ type: 'success', text: 'Subscription updated successfully!' });
      loadCurrentSubscription();
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  const handleFoodChoiceUpdate = async () => {
    if (!currentSubscription) {
      setMessage({ type: 'error', text: 'Subscribe first before updating monthly food choice.' });
      return;
    }

    setLoading(true);
    const result = await subscriptionService.updateMonthlyFoodChoice(month, year, monthlyFoodChoice);
    setLoading(false);

    if (result.success) {
      setMessage({ type: 'success', text: 'Monthly food choice updated!' });
      loadCurrentSubscription();
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="mb-sp-6">Lunch Subscription</h1>

      <div className="card mb-sp-6">
        <h2 className="mb-4">Current Subscription</h2>
        {currentSubscription ? (
          <div className="bg-primary-light p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-neutral-700">Type</p>
                <p className="text-lg font-bold capitalize">{currentSubscription.subscription_type} Month</p>
              </div>
              <div>
                <p className="text-sm text-neutral-700">Period</p>
                <p className="text-lg font-bold">
                  {new Date(currentSubscription.start_date).toLocaleDateString()} -{' '}
                  {new Date(currentSubscription.end_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-neutral-700 mb-2">Monthly Food Choice</p>
              <FoodPreferenceChip preference={currentSubscription.monthly_food_choice} />
            </div>
          </div>
        ) : (
          <div className="bg-neutral-100 p-4 rounded-lg text-center text-neutral-700">
            No active subscription for {month}/{year}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="mb-4">Subscribe or Update</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div
              className={`px-4 py-3 rounded-lg ${
                message.type === 'success'
                  ? 'bg-primary-light text-primary'
                  : 'bg-danger-light text-danger'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Month</label>
              <select
                className="input-field"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Year</label>
              <select
                className="input-field"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
                <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Subscription Type</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition">
                <input
                  type="radio"
                  name="type"
                  value="full"
                  checked={subscriptionType === 'full'}
                  onChange={(e) => setSubscriptionType(e.target.value)}
                  className="w-5 h-5"
                />
                <span className="flex-1">
                  <span className="font-semibold">Full Month</span>
                  <span className="block text-sm text-neutral-700">All working days of the month</span>
                </span>
              </label>

              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary transition">
                <input
                  type="radio"
                  name="type"
                  value="half"
                  checked={subscriptionType === 'half'}
                  onChange={(e) => setSubscriptionType(e.target.value)}
                  className="w-5 h-5"
                />
                <span className="flex-1">
                  <span className="font-semibold">Half Month</span>
                  <span className="block text-sm text-neutral-700">First 15 days of the month</span>
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Monthly Food Choice</label>
            <p className="text-sm text-neutral-600 mb-3">
              Defaults to your profile preference. This controls which menu options you see each day.
            </p>
            <select
              className="input-field"
              value={monthlyFoodChoice}
              onChange={(e) => setMonthlyFoodChoice(e.target.value)}
            >
              {FOOD_CHOICE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {currentSubscription && (
              <button
                type="button"
                onClick={handleFoodChoiceUpdate}
                className="btn-secondary w-full mt-3"
                disabled={loading}
              >
                Update Food Choice Only
              </button>
            )}
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Updating...' : 'Subscribe'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Subscription;
