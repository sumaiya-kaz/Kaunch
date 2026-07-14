import { useState, useEffect, useMemo } from 'react';
import { menuService } from '@kaunch/shared-api';
import {
  formatDateLocal,
  parseLocalDate,
  getMonday,
  getFriday,
  isWeekday,
  toDateKey,
  formatWeekRange,
  buildWeeklyMenuStructure,
} from '@kaunch/shared-utils';

const collectDishNames = (menu) => {
  const names = [];
  if (menu?.protein_dish) names.push(menu.protein_dish);
  if (menu?.side_item) names.push(menu.side_item);
  if (menu?.dal_item) names.push(menu.dal_item);
  if (menu?.extra_items) {
    menu.extra_items.split(',').forEach((item) => {
      const trimmed = item.trim();
      if (trimmed) names.push(trimmed);
    });
  }
  return names;
};

const formatCategoryLabel = (menu) => {
  if (!menu) return '-';
  if (menu.menu_type === 'friday') {
    return menu.friday_option === 'roast_polaw'
      ? 'Friday: Roast + Polaw + Beef + Egg'
      : `Friday: Khichuri + ${menu.friday_meat === 'mutton' ? 'Mutton' : 'Beef'}`;
  }
  const protein = menu.main_protein === 'chicken' ? 'Chicken' : 'Fish';
  const side = menu.side_dish === 'vorta' ? 'Vorta' : 'Vaji';
  return `${protein} + Dal + ${side}`;
};

const formatCost = (value) => {
  if (value == null || value === '') return '—';
  return `৳${Number(value).toFixed(0)}`;
};

const buildFullMenuName = (menu) => {
  if (!menu) return '';

  if (menu.menu_type === 'friday') {
    if (menu.extra_items) {
      return menu.extra_items
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .join(' + ');
    }
    if (menu.description) return menu.description;
    return formatCategoryLabel(menu);
  }

  const parts = [menu.protein_dish, menu.dal_item, menu.side_item].filter(Boolean);
  if (parts.length > 0) return parts.join(' + ');
  if (menu.description) return menu.description;
  return '';
};

const formatMenuLabel = (menu) => {
  if (!menu) return '-';
  const full = buildFullMenuName(menu);
  if (full) return full;
  return formatCategoryLabel(menu);
};

const MenuDishTags = ({ menu }) => {
  if (menu.menu_type === 'friday') {
    if (!menu.extra_items) return null;
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {menu.extra_items.split(',').map((item) => {
          const name = item.trim();
          if (!name) return null;
          return (
            <span
              key={name}
              className="inline-block px-2.5 py-1 rounded-md bg-primary-light text-primary-dark text-sm font-medium"
            >
              {name}
            </span>
          );
        })}
      </div>
    );
  }

  const tags = [
    { label: 'Protein', value: menu.protein_dish },
    { label: 'Dal', value: menu.dal_item },
    { label: 'Side', value: menu.side_item },
  ].filter((tag) => tag.value);

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {tags.map((tag) => (
        <span
          key={tag.label}
          className="inline-block px-2.5 py-1 rounded-md bg-primary-light text-primary-dark text-sm font-medium"
          title={tag.label}
        >
          {tag.value}
        </span>
      ))}
    </div>
  );
};

const todayMonday = () => getMonday(formatDateLocal(new Date()));

const defaultWeekForm = () => ({
  weekStartDate: todayMonday(),
  startProtein: 'chicken',
  fridayOption: 'roast_polaw',
  fridayMeat: 'beef',
});

const MenuManagement = () => {
  const [menus, setMenus] = useState([]);
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [weekStartDate, setWeekStartDate] = useState(todayMonday);
  const [weekForm, setWeekForm] = useState(defaultWeekForm);
  const [planForm, setPlanForm] = useState(defaultWeekForm);
  const [planSuggestions, setPlanSuggestions] = useState([]);
  const [planSummary, setPlanSummary] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planSaving, setPlanSaving] = useState(false);
  const [regeneratingDay, setRegeneratingDay] = useState(null);

  const modalWeekEndDate = useMemo(() => getFriday(weekForm.weekStartDate), [weekForm.weekStartDate]);
  const planWeekEndDate = useMemo(() => getFriday(planForm.weekStartDate), [planForm.weekStartDate]);
  const weekStructure = useMemo(
    () =>
      buildWeeklyMenuStructure({
        ...planForm,
        weekStartDate: getMonday(planForm.weekStartDate),
      }),
    [planForm]
  );
  const planRows = planSuggestions.length > 0 ? planSuggestions : weekStructure;
  const displayWeekRange = useMemo(
    () => formatWeekRange(weekStartDate, getFriday(weekStartDate)),
    [weekStartDate]
  );
  const weekTotalCost = useMemo(
    () => menus.reduce((sum, menu) => sum + Number(menu.food_cost || 0), 0),
    [menus]
  );

  const normalizeMenus = (items) =>
    items
      .map((menu) => ({ ...menu, date: toDateKey(menu.date) }))
      .filter((menu) => isWeekday(menu.date))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);

  useEffect(() => {
    loadMenus(weekStartDate);
  }, [weekStartDate]);

  const loadMenus = async (monday = weekStartDate) => {
    const start = getMonday(monday);
    const friday = getFriday(start);
    const result = await menuService.getRange(start, friday);
    if (result.success) {
      setMenus(normalizeMenus(result.menus));
    }
  };

  const openWeekModal = () => {
    setWeekForm(defaultWeekForm());
    setShowWeekModal(true);
  };

  const openPlanModal = () => {
    setPlanForm(defaultWeekForm());
    setPlanSuggestions([]);
    setPlanSummary(null);
    setShowPlanModal(true);
  };

  const handleWeekStartChange = (value, formSetter) => {
    formSetter((prev) => ({ ...prev, weekStartDate: getMonday(value) }));
  };

  const handleWeekSubmit = async (e) => {
    e.preventDefault();
    const monday = getMonday(weekForm.weekStartDate);
    const result = await menuService.createWeeklyMenu({ ...weekForm, weekStartDate: monday });
    if (result.success) {
      const normalized = normalizeMenus(result.menus || []);
      setWeekStartDate(monday);
      setMenus(normalized);
      setShowWeekModal(false);
      if (!normalized.length) {
        await loadMenus(monday);
      }
    } else {
      alert(result.message);
    }
  };

  const generateSuggestions = async () => {
    setPlanLoading(true);
    const monday = getMonday(planForm.weekStartDate);
    const result = await menuService.suggestWeeklyMenu({ ...planForm, weekStartDate: monday });
    if (result.success) {
      setPlanSuggestions(
        (result.menus || []).map((menu) => ({
          ...menu,
          date: toDateKey(menu.date),
          food_cost: menu.food_cost ?? '',
        }))
      );
      setPlanSummary(result.summary || null);
    } else {
      alert(result.message);
    }
    setPlanLoading(false);
  };

  const suggestForDay = async (index) => {
    const row = planRows[index];
    if (!row) return;

    setRegeneratingDay(index);
    const monday = getMonday(planForm.weekStartDate);

    const basePlan =
      planSuggestions.length > 0
        ? [...planSuggestions]
        : weekStructure.map((menu) => ({ ...menu }));

    const excludeNames = basePlan
      .filter((_, dayIndex) => dayIndex !== index)
      .flatMap(collectDishNames);

    const result = await menuService.suggestDayMenu({
      ...planForm,
      weekStartDate: monday,
      date: toDateKey(row.date),
      excludeNames,
      variation: Date.now(),
    });

    if (result.success) {
      const next = [...basePlan];
      next[index] = {
        ...next[index],
        ...result.menu,
        date: toDateKey(result.menu.date),
        food_cost: result.menu.food_cost ?? '',
      };
      setPlanSuggestions(next);
      const totalCost = next.reduce((sum, menu) => sum + Number(menu.food_cost || 0), 0);
      setPlanSummary({
        totalCost,
        avgCostPerDay: next.length ? Math.round(totalCost / next.length) : 0,
        days: next.length,
      });
    } else {
      alert(result.message);
    }
    setRegeneratingDay(null);
  };

  const updateSuggestion = (index, field, value) => {
    setPlanSuggestions((prev) => {
      const base = prev.length > 0 ? prev : weekStructure.map((menu) => ({ ...menu }));
      const next = [...base];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSavePlan = async () => {
    const rowsToSave = planSuggestions.length > 0 ? planSuggestions : planRows;
    const hasAnyDish = rowsToSave.some(
      (menu) =>
        menu.protein_dish || menu.side_item || menu.dal_item || menu.extra_items
    );

    if (!hasAnyDish) {
      alert('Generate suggestions for at least one day before saving.');
      return;
    }

    setPlanSaving(true);
    const monday = getMonday(planForm.weekStartDate);
    const menusToSave = rowsToSave.map((menu) => {
      const { suggestion, ...rest } = menu;
      return {
        ...rest,
        food_cost: rest.food_cost === '' ? null : Number(rest.food_cost),
      };
    });

    const result = await menuService.saveWeeklyMenuPlan({
      ...planForm,
      weekStartDate: monday,
      menus: menusToSave,
    });

    if (result.success) {
      const normalized = normalizeMenus(result.menus || []);
      setWeekStartDate(monday);
      setMenus(normalized);
      setShowPlanModal(false);
      if (!normalized.length) {
        await loadMenus(monday);
      }
    } else {
      alert(result.message);
    }
    setPlanSaving(false);
  };

  const planPreviewTotal = useMemo(
    () => planRows.reduce((sum, menu) => sum + Number(menu.food_cost || 0), 0),
    [planRows]
  );

  const handleDelete = async () => {
    if (!menuToDelete) return;

    setDeleting(true);
    const result = await menuService.deleteMenu(menuToDelete.id);

    if (result.success) {
      setMenuToDelete(null);
      loadMenus();
    } else {
      alert(result.message);
    }

    setDeleting(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-sp-6">
        <div>
          <h1>Weekly Meal Plan</h1>
          <p className="text-neutral-700 mt-2">
            Generate a full week (Mon–Fri) with AI dish suggestions — specific items like Potol
            Bhaji, Alur Vorta, Rui Mach er Jhol — plus per-day food cost.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button type="button" onClick={openPlanModal} className="btn-primary btn-sm">
            AI Full Menu Plan
          </button>
          <button type="button" onClick={openWeekModal} className="btn-secondary btn-sm">
            Quick Generate Week
          </button>
        </div>
      </div>

      <div className="card mb-sp-6 bg-primary-light">
        <h3 className="font-semibold mb-2">Menu rules</h3>
        <ul className="text-sm text-neutral-700 space-y-1">
          <li>• Regular days: Chicken or Fish (alternating) + Dal (always) + Vorta or Vaji</li>
          <li>• AI suggests specific Bengali dishes for each slot (e.g. Potol Bhaji, Alur Vorta)</li>
          <li>• Friday option A: Roast + Polaw + Beef + Egg</li>
          <li>• Friday option B: Khichuri + Mutton or Beef</li>
          <li>• Food cost is estimated per person per day (BDT)</li>
        </ul>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h2 className={menus.length > 0 ? 'mb-1' : ''}>Scheduled Menus</h2>
            {menus.length > 0 && (
              <p className="text-sm text-neutral-600">{displayWeekRange}</p>
            )}
          </div>
          {menus.length > 0 && weekTotalCost > 0 && (
            <p className="text-sm font-semibold text-primary-dark">
              Week total: {formatCost(weekTotalCost)} · Avg/day:{' '}
              {formatCost(Math.round(weekTotalCost / menus.length))}
            </p>
          )}
        </div>

        {menus.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table min-w-[720px]">
              <thead>
                <tr>
                  <th className="w-28">Date</th>
                  <th className="w-24">Day</th>
                  <th className="min-w-[200px]">Full Menu</th>
                  <th className="w-20">Cost</th>
                  <th className="w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {menus.map((menu) => (
                  <tr key={menu.id}>
                    <td className="font-mono text-neutral-700 whitespace-nowrap">
                      {parseLocalDate(menu.date).toLocaleDateString()}
                    </td>
                    <td className="font-medium whitespace-nowrap">
                      {parseLocalDate(menu.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </td>
                    <td>
                      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">
                        {formatCategoryLabel(menu)}
                      </p>
                      <p className="text-base font-semibold text-neutral-900 leading-relaxed">
                        {formatMenuLabel(menu)}
                      </p>
                      <MenuDishTags menu={menu} />
                    </td>
                    <td className="font-semibold text-primary-dark whitespace-nowrap">
                      {formatCost(menu.food_cost)}
                    </td>
                    <td>
                      <button
                        onClick={() => setMenuToDelete(menu)}
                        className="text-sm text-danger hover:underline font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-neutral-400 py-8">
            No menus scheduled. Use &quot;AI Full Menu Plan&quot; to prepare a detailed weekly menu.
          </div>
        )}
      </div>

      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-5 sm:px-8 py-5">
              <h2 className="text-2xl mb-1">AI Full Menu Plan</h2>
              <p className="text-sm text-neutral-600">
                {formatWeekRange(planForm.weekStartDate, planWeekEndDate)} — suggest dishes per
                day or fill the whole week at once.
              </p>
            </div>

            <div className="px-5 sm:px-8 py-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Week Start (Monday)</label>
                  <input
                    type="date"
                    className="input-field"
                    value={planForm.weekStartDate}
                    onChange={(e) => handleWeekStartChange(e.target.value, setPlanForm)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Monday Starts With</label>
                  <select
                    className="input-field"
                    value={planForm.startProtein}
                    onChange={(e) => setPlanForm({ ...planForm, startProtein: e.target.value })}
                  >
                    <option value="chicken">Chicken</option>
                    <option value="fish">Fish</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Friday Menu</label>
                  <select
                    className="input-field"
                    value={planForm.fridayOption}
                    onChange={(e) => setPlanForm({ ...planForm, fridayOption: e.target.value })}
                  >
                    <option value="roast_polaw">Roast + Polaw + Beef + Egg</option>
                    <option value="khichuri">Khichuri + Meat</option>
                  </select>
                </div>
                {planForm.fridayOption === 'khichuri' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">Friday Meat</label>
                    <select
                      className="input-field"
                      value={planForm.fridayMeat}
                      onChange={(e) => setPlanForm({ ...planForm, fridayMeat: e.target.value })}
                    >
                      <option value="beef">Beef</option>
                      <option value="mutton">Mutton</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={generateSuggestions}
                  disabled={planLoading}
                  className="btn-primary btn-sm"
                >
                  {planLoading ? 'Generating...' : 'Suggest All Days'}
                </button>
                {planPreviewTotal > 0 && (
                  <p className="text-sm text-neutral-700">
                    Week preview:{' '}
                    <span className="font-bold text-primary-dark">{formatCost(planPreviewTotal)}</span>
                    {planRows.length > 0 && (
                      <> · {formatCost(Math.round(planPreviewTotal / planRows.length))}/day</>
                    )}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                {planRows.map((menu, index) => {
                  const fullMenuName = buildFullMenuName(menu);
                  const dayLabel = parseLocalDate(menu.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div
                      key={menu.date}
                      className="rounded-xl border-2 border-neutral-200 bg-neutral-50 overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 py-4 bg-white border-b border-neutral-200">
                        <div>
                          <p className="text-lg font-bold text-primary-dark">{dayLabel}</p>
                          <span className="inline-block mt-1 text-sm font-medium text-neutral-600">
                            {formatCategoryLabel(menu)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-base font-bold text-primary-dark">
                            {formatCost(menu.food_cost)}
                          </span>
                          <button
                            type="button"
                            onClick={() => suggestForDay(index)}
                            disabled={regeneratingDay === index || planLoading}
                            className="btn-secondary btn-sm disabled:opacity-50"
                          >
                            {regeneratingDay === index ? 'Suggesting...' : 'Suggest'}
                          </button>
                        </div>
                      </div>

                      <div className="px-4 sm:px-5 py-4">
                        <div className="mb-4 rounded-lg bg-white border-2 border-primary/25 px-4 py-3">
                          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                            Full menu name
                          </p>
                          <p
                            className={`text-lg font-semibold leading-relaxed ${
                              fullMenuName ? 'text-neutral-900' : 'text-neutral-400 italic'
                            }`}
                          >
                            {fullMenuName || 'Click Suggest to generate dishes for this day'}
                          </p>
                        </div>

                        {menu.menu_type === 'friday' ? (
                          <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                              Friday dishes
                            </label>
                            <input
                              className="menu-plan-input"
                              value={menu.extra_items || ''}
                              onChange={(e) =>
                                updateSuggestion(index, 'extra_items', e.target.value)
                              }
                              placeholder="Chicken Roast, Morog Polaw, Beef Curry, Dim Bhuna"
                            />
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                Protein
                              </label>
                              <input
                                className="menu-plan-input"
                                value={menu.protein_dish || ''}
                                onChange={(e) =>
                                  updateSuggestion(index, 'protein_dish', e.target.value)
                                }
                                placeholder="Rui Mach er Jhol"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                Dal
                              </label>
                              <input
                                className="menu-plan-input"
                                value={menu.dal_item || ''}
                                onChange={(e) => updateSuggestion(index, 'dal_item', e.target.value)}
                                placeholder="Moshur Dal"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                Side (Vorta / Vaji)
                              </label>
                              <input
                                className="menu-plan-input"
                                value={menu.side_item || ''}
                                onChange={(e) =>
                                  updateSuggestion(index, 'side_item', e.target.value)
                                }
                                placeholder="Alur Vorta"
                              />
                            </div>
                          </div>
                        )}

                        <div className="mt-4 max-w-xs">
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Cost per person (৳)
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="menu-plan-input"
                            value={menu.food_cost}
                            onChange={(e) => updateSuggestion(index, 'food_cost', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-neutral-200 px-5 sm:px-8 py-4 flex gap-3">
              <button
                type="button"
                onClick={handleSavePlan}
                disabled={planSaving}
                className="btn-primary btn-sm flex-1 disabled:opacity-50"
              >
                {planSaving ? 'Saving...' : 'Save Full Menu Plan'}
              </button>
              <button
                type="button"
                onClick={() => setShowPlanModal(false)}
                className="btn-secondary btn-sm flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showWeekModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="mb-2">Quick Generate Week</h2>
            <p className="text-sm text-neutral-600 mb-6">
              {formatWeekRange(weekForm.weekStartDate, modalWeekEndDate)} — category-only menu
              (no specific dish names).
            </p>
            <form onSubmit={handleWeekSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Week Start (Monday)</label>
                  <input
                    type="date"
                    className="input-field"
                    value={weekForm.weekStartDate}
                    onChange={(e) => handleWeekStartChange(e.target.value, setWeekForm)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Week End (Friday)</label>
                  <input
                    type="date"
                    className="input-field bg-neutral-100"
                    value={modalWeekEndDate}
                    readOnly
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Monday Starts With</label>
                <select
                  className="input-field"
                  value={weekForm.startProtein}
                  onChange={(e) => setWeekForm({ ...weekForm, startProtein: e.target.value })}
                >
                  <option value="chicken">Chicken</option>
                  <option value="fish">Fish</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Friday Menu</label>
                <select
                  className="input-field"
                  value={weekForm.fridayOption}
                  onChange={(e) => setWeekForm({ ...weekForm, fridayOption: e.target.value })}
                >
                  <option value="roast_polaw">Roast + Polaw + Beef + Egg</option>
                  <option value="khichuri">Khichuri + Meat</option>
                </select>
              </div>
              {weekForm.fridayOption === 'khichuri' && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Friday Meat</label>
                  <select
                    className="input-field"
                    value={weekForm.fridayMeat}
                    onChange={(e) => setWeekForm({ ...weekForm, fridayMeat: e.target.value })}
                  >
                    <option value="beef">Beef</option>
                    <option value="mutton">Mutton</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary btn-sm flex-1">
                  Generate Week
                </button>
                <button
                  type="button"
                  onClick={() => setShowWeekModal(false)}
                  className="btn-secondary btn-sm flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {menuToDelete && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => !deleting && setMenuToDelete(null)}
        >
          <div
            className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2">Delete menu day?</h2>
            <p className="text-neutral-600 mb-6">
              Remove the menu for{' '}
              <span className="font-semibold">
                {new Date(menuToDelete.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>{' '}
              ({formatMenuLabel(menuToDelete)})? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMenuToDelete(null)}
                disabled={deleting}
                className="btn-secondary btn-sm flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger btn-sm flex-1 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
