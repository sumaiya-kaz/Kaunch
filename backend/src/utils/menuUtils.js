export const FOOD_CHOICES = [
  'regular',
  'no_fish',
  'no_chicken',
  'no_mutton_beef',
  'always_fish',
];

export const FOOD_CHOICE_LABELS = {
  regular: 'Regular (follows daily menu)',
  no_fish: 'No Fish / Only Chicken',
  no_chicken: 'No Chicken / Only Fish',
  no_mutton_beef: 'No Mutton / No Beef',
  always_fish: 'Always Fish',
};

export function resolveRegularProtein(menuProtein, foodChoice) {
  if (foodChoice === 'no_fish') return 'chicken';
  if (foodChoice === 'no_chicken' || foodChoice === 'always_fish') return 'fish';
  return menuProtein;
}

export function buildMenuDescription(menu) {
  if (!menu) return '';

  if (menu.menu_type === 'friday') {
    if (menu.extra_items) {
      return `Friday: ${menu.extra_items}`;
    }
    if (menu.friday_option === 'roast_polaw') {
      return 'Friday Special: Roast + Polaw + Beef + Egg';
    }
    const meat = menu.friday_meat === 'mutton' ? 'Mutton' : 'Beef';
    return `Friday Special: Khichuri + ${meat}`;
  }

  const parts = [menu.protein_dish, menu.dal_item, menu.side_item].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(' + ');
  }

  const protein = menu.main_protein === 'chicken' ? 'Chicken' : 'Fish';
  const side = menu.side_dish === 'vorta' ? 'Vorta' : 'Vaji';
  return `${protein} + Dal + ${side}`;
}

const ALTERNATE_FOOD_CHOICES = ['no_fish', 'no_chicken', 'always_fish', 'no_mutton_beef'];

export function buildFoodPreferenceBreakdown(menu, foodChoices) {
  const counts = { regular: 0 };

  for (const foodChoice of foodChoices) {
    if (!menu || !hasFoodChoiceOverride(menu, foodChoice)) {
      counts.regular += 1;
    } else {
      counts[foodChoice] = (counts[foodChoice] || 0) + 1;
    }
  }

  const breakdown = [];

  if (counts.regular > 0) {
    breakdown.push({
      food_preference: 'regular',
      label: menu
        ? `Regular (${buildMenuDescription(menu)})`
        : FOOD_CHOICE_LABELS.regular,
      count: counts.regular,
    });
  }

  for (const preference of ALTERNATE_FOOD_CHOICES) {
    if (counts[preference] > 0) {
      breakdown.push({
        food_preference: preference,
        label: FOOD_CHOICE_LABELS[preference],
        count: counts[preference],
      });
    }
  }

  return breakdown;
}

export function hasFoodChoiceOverride(menu, foodChoice = 'regular') {
  if (!menu || foodChoice === 'regular') return false;

  if (menu.menu_type === 'friday') {
    const employeeDefault = getDefaultMenuChoice(menu, foodChoice);
    const officeDefault = getDefaultMenuChoice(menu, 'regular');
    return employeeDefault !== officeDefault;
  }

  if (foodChoice === 'no_fish') return menu.main_protein === 'fish';
  if (foodChoice === 'no_chicken' || foodChoice === 'always_fish') {
    return menu.main_protein === 'chicken';
  }

  return false;
}

export function buildEmployeeMenuDescription(menu, foodChoice = 'regular') {
  if (!menu) return '';

  const options = getEmployeeMenuOptions(menu, foodChoice);
  if (options.length === 0) return buildMenuDescription(menu);

  const defaultChoice = getDefaultMenuChoice(menu, foodChoice);
  const selected = options.find((option) => option.value === defaultChoice);

  if (menu.menu_type === 'friday') {
    return selected ? `Friday Special: ${selected.label}` : buildMenuDescription(menu);
  }

  return selected?.label || buildMenuDescription(menu);
}

export function getEmployeeMenuOptions(menu, foodChoice = 'regular') {
  if (!menu) return [];

  if (menu.menu_type === 'friday') {
    const options = [];

    if (menu.friday_option === 'roast_polaw') {
      if (foodChoice !== 'no_mutton_beef') {
        options.push({
          value: 'roast_polaw_beef_egg',
          label: 'Roast + Polaw + Beef + Egg',
        });
      }
      options.push({
        value: 'roast_polaw_egg',
        label: 'Roast + Polaw + Egg (no beef)',
      });
      return options;
    }

    if (foodChoice !== 'no_mutton_beef') {
      const meat = menu.friday_meat === 'mutton' ? 'Mutton' : 'Beef';
      options.push({
        value: `khichuri_${menu.friday_meat}`,
        label: `Khichuri + ${meat}`,
      });
    } else {
      options.push({
        value: 'khichuri_veg',
        label: 'Khichuri (no mutton/beef)',
      });
    }
    return options;
  }

  const protein = resolveRegularProtein(menu.main_protein, foodChoice);
  const detailed = buildMenuDescription(menu);
  const genericSide = menu.side_dish === 'vorta' ? 'Vorta' : 'Vaji';
  const proteinLabel = protein === 'chicken' ? 'Chicken' : 'Fish';
  const genericLabel = `${proteinLabel} + Dal + ${genericSide}`;
  const label = detailed && detailed !== genericLabel ? detailed : genericLabel;

  return [
    {
      value: protein,
      label,
    },
  ];
}

export function getDefaultMenuChoice(menu, foodChoice = 'regular') {
  const options = getEmployeeMenuOptions(menu, foodChoice);
  return options[0]?.value || null;
}

export function isValidMenuChoice(menu, choice, foodChoice = 'regular') {
  if (!menu || !choice) return false;
  return getEmployeeMenuOptions(menu, foodChoice).some((option) => option.value === choice);
}

function formatDateLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getMonday(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return formatDateLocal(d);
}

/** Mon–Fri only, exactly 5 dates. */
export function getWeekdayDates(weekStartDate) {
  const start = new Date(`${getMonday(weekStartDate)}T00:00:00`);
  const dates = [];

  for (let i = 0; i < 5; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(formatDateLocal(date));
  }

  return dates;
}

export function buildWeeklyMenus({ weekStartDate, startProtein, fridayOption, fridayMeat }) {
  const dates = getWeekdayDates(weekStartDate);
  const menus = [];

  dates.forEach((date, index) => {
    if (index === 4) {
      menus.push({
        date,
        menu_type: 'friday',
        main_protein: null,
        side_dish: null,
        friday_option: fridayOption,
        friday_meat: fridayOption === 'khichuri' ? fridayMeat : 'beef',
        description:
          fridayOption === 'roast_polaw'
            ? 'Friday Special: Roast + Polaw + Beef + Egg'
            : `Friday Special: Khichuri + ${fridayMeat === 'mutton' ? 'Mutton' : 'Beef'}`,
      });
      return;
    }

    const mainProtein =
      (startProtein === 'chicken' && index % 2 === 0) ||
      (startProtein === 'fish' && index % 2 === 1)
        ? 'chicken'
        : 'fish';
    const sideDish = index % 2 === 0 ? 'vorta' : 'vaji';

    menus.push({
      date,
      menu_type: 'regular',
      main_protein: mainProtein,
      side_dish: sideDish,
      friday_option: null,
      friday_meat: null,
      description: buildMenuDescription({
        menu_type: 'regular',
        main_protein: mainProtein,
        side_dish: sideDish,
      }),
    });
  });

  return menus;
}
