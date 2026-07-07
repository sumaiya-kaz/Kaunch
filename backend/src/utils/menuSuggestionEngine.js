import { DISH_CATALOG } from '../data/dishCatalog.js';
import { buildWeeklyMenus } from './menuUtils.js';

function hashSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pickDish(category, usedNames, seed) {
  const pool = DISH_CATALOG[category] || [];
  if (pool.length === 0) return null;

  const available = pool.filter((d) => !usedNames.has(d.name));
  const candidates = available.length > 0 ? available : pool;
  const index = hashSeed(`${seed}:${category}`) % candidates.length;
  const dish = candidates[index];
  usedNames.add(dish.name);
  return dish;
}

function pickDishWithVariation(category, excludeNames, seed) {
  const pool = DISH_CATALOG[category] || [];
  if (pool.length === 0) return null;

  const blocked = new Set(excludeNames);
  const available = pool.filter((d) => !blocked.has(d.name));
  const candidates = available.length > 0 ? available : pool;
  const index = hashSeed(`${seed}:${category}`) % candidates.length;
  return candidates[index];
}

function pickFridayDishes(fridayOption, fridayMeat, date, usedNames) {
  let category = 'friday_roast_polaw';
  if (fridayOption === 'khichuri') {
    category = fridayMeat === 'mutton' ? 'friday_khichuri_mutton' : 'friday_khichuri_beef';
  }

  const pool = DISH_CATALOG[category] || [];
  const items = pool.map((dish) => {
    usedNames.add(dish.name);
    return { name: dish.name, cost: dish.cost };
  });

  const foodCost = items.reduce((sum, item) => sum + item.cost, 0);
  const extraItems = items.map((i) => i.name).join(', ');

  return { extraItems, foodCost, items };
}

function suggestRegularDay(menu, usedNames) {
  const proteinCategory = menu.main_protein;
  const sideCategory = menu.side_dish;

  const protein = pickDish(proteinCategory, usedNames, menu.date);
  const side = pickDish(sideCategory, usedNames, `${menu.date}:side`);
  const dal = pickDish('dal', usedNames, `${menu.date}:dal`);

  const foodCost = (protein?.cost || 0) + (side?.cost || 0) + (dal?.cost || 0);

  return {
    ...menu,
    protein_dish: protein?.name || null,
    side_item: side?.name || null,
    dal_item: dal?.name || null,
    extra_items: null,
    food_cost: foodCost,
    suggestion: {
      category: `${menu.main_protein} + ${menu.side_dish} + dal`,
      protein: protein?.name,
      side: side?.name,
      dal: dal?.name,
      costBreakdown: {
        protein: protein?.cost || 0,
        side: side?.cost || 0,
        dal: dal?.cost || 0,
      },
    },
  };
}

/**
 * Suggests specific Bengali dishes for each day of a weekly menu plan.
 * Avoids repeating the same dish name within the week when possible.
 */
export function suggestWeeklyMenu({
  weekStartDate,
  startProtein,
  fridayOption,
  fridayMeat,
}) {
  const baseMenus = buildWeeklyMenus({
    weekStartDate,
    startProtein,
    fridayOption,
    fridayMeat: fridayMeat || 'beef',
  });

  const usedNames = new Set();
  const suggestions = baseMenus.map((menu) => {
    if (menu.menu_type === 'friday') {
      const friday = pickFridayDishes(
        menu.friday_option,
        menu.friday_meat,
        menu.date,
        usedNames
      );
      return {
        ...menu,
        protein_dish: null,
        side_item: null,
        dal_item: null,
        extra_items: friday.extraItems,
        food_cost: friday.foodCost,
        suggestion: {
          category: menu.friday_option === 'roast_polaw' ? 'friday roast + polaw' : 'friday khichuri',
          items: friday.items,
          costBreakdown: friday.items.reduce((acc, item) => {
            acc[item.name] = item.cost;
            return acc;
          }, {}),
        },
      };
    }
    return suggestRegularDay(menu, usedNames);
  });

  const totalCost = suggestions.reduce((sum, day) => sum + Number(day.food_cost || 0), 0);
  const avgCost = suggestions.length ? Math.round(totalCost / suggestions.length) : 0;

  return {
    menus: suggestions,
    summary: {
      totalCost,
      avgCostPerDay: avgCost,
      days: suggestions.length,
    },
  };
}

function collectDishNamesFromMenu(menu) {
  const names = [];
  if (menu.protein_dish) names.push(menu.protein_dish);
  if (menu.side_item) names.push(menu.side_item);
  if (menu.dal_item) names.push(menu.dal_item);
  if (menu.extra_items) {
    menu.extra_items.split(',').forEach((item) => {
      const trimmed = item.trim();
      if (trimmed) names.push(trimmed);
    });
  }
  return names;
}

/**
 * Suggests dishes for a single day. Uses variation seed so each click can return
 * a different combination while avoiding dishes used on other days in the plan.
 */
export function suggestDayMenu(menuDay, { excludeNames = [], variation } = {}) {
  const seed = `${menuDay.date}:${variation ?? Date.now()}`;
  const blocked = [...excludeNames];

  if (menuDay.menu_type === 'friday') {
    const usedNames = new Set(blocked);
    const friday = pickFridayDishes(
      menuDay.friday_option,
      menuDay.friday_meat,
      seed,
      usedNames
    );
    return {
      ...menuDay,
      protein_dish: null,
      side_item: null,
      dal_item: null,
      extra_items: friday.extraItems,
      food_cost: friday.foodCost,
      suggestion: {
        category:
          menuDay.friday_option === 'roast_polaw' ? 'friday roast + polaw' : 'friday khichuri',
        items: friday.items,
        costBreakdown: friday.items.reduce((acc, item) => {
          acc[item.name] = item.cost;
          return acc;
        }, {}),
      },
    };
  }

  const protein = pickDishWithVariation(menuDay.main_protein, blocked, seed);
  if (protein) blocked.push(protein.name);

  const side = pickDishWithVariation(menuDay.side_dish, blocked, `${seed}:side`);
  if (side) blocked.push(side.name);

  const dal = pickDishWithVariation('dal', blocked, `${seed}:dal`);

  const foodCost = (protein?.cost || 0) + (side?.cost || 0) + (dal?.cost || 0);

  return {
    ...menuDay,
    protein_dish: protein?.name || null,
    side_item: side?.name || null,
    dal_item: dal?.name || null,
    extra_items: null,
    food_cost: foodCost,
    suggestion: {
      category: `${menuDay.main_protein} + ${menuDay.side_dish} + dal`,
      protein: protein?.name,
      side: side?.name,
      dal: dal?.name,
      costBreakdown: {
        protein: protein?.cost || 0,
        side: side?.cost || 0,
        dal: dal?.cost || 0,
      },
    },
  };
}

export { collectDishNamesFromMenu };

export function buildDetailedDescription(menu) {
  if (!menu) return '';

  if (menu.menu_type === 'friday') {
    if (menu.extra_items) return `Friday: ${menu.extra_items}`;
    if (menu.friday_option === 'roast_polaw') {
      return 'Friday Special: Roast + Polaw + Beef + Egg';
    }
    const meat = menu.friday_meat === 'mutton' ? 'Mutton' : 'Beef';
    return `Friday Special: Khichuri + ${meat}`;
  }

  const parts = [menu.protein_dish, menu.dal_item, menu.side_item].filter(Boolean);
  if (parts.length > 0) return parts.join(' + ');

  const protein = menu.main_protein === 'chicken' ? 'Chicken' : 'Fish';
  const side = menu.side_dish === 'vorta' ? 'Vorta' : 'Vaji';
  return `${protein} + Dal + ${side}`;
}
