const pad = (n) => String(n).padStart(2, '0');

export const formatDateLocal = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Normalize API/DB dates to YYYY-MM-DD (handles ISO timestamps from PostgreSQL). */
export const toDateKey = (dateValue) => {
  if (!dateValue) return '';
  const str = String(dateValue);
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return str.slice(0, 10);
  return formatDateLocal(d);
};

export const parseLocalDate = (dateStr) => new Date(`${toDateKey(dateStr)}T00:00:00`);

export const getMonday = (dateStr) => {
  const d = parseLocalDate(dateStr);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return formatDateLocal(d);
};

export const getFriday = (mondayStr) => {
  const d = parseLocalDate(getMonday(mondayStr));
  d.setDate(d.getDate() + 4);
  return formatDateLocal(d);
};

/** Mon–Fri only, exactly 5 dates. */
export const getWeekdayDates = (weekStartDate) => {
  const start = parseLocalDate(getMonday(weekStartDate));
  const dates = [];

  for (let i = 0; i < 5; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(formatDateLocal(date));
  }

  return dates;
};

export const isWeekday = (dateStr) => {
  const day = parseLocalDate(dateStr).getDay();
  return day >= 1 && day <= 5;
};

export const buildWeeklyMenuStructure = ({
  weekStartDate,
  startProtein,
  fridayOption,
  fridayMeat = 'beef',
}) => {
  const dates = getWeekdayDates(weekStartDate);

  return dates.map((date, index) => {
    if (index === 4) {
      return {
        date,
        menu_type: 'friday',
        main_protein: null,
        side_dish: null,
        friday_option: fridayOption,
        friday_meat: fridayOption === 'khichuri' ? fridayMeat : 'beef',
        protein_dish: '',
        side_item: '',
        dal_item: '',
        extra_items: '',
        food_cost: '',
      };
    }

    const main_protein =
      (startProtein === 'chicken' && index % 2 === 0) ||
      (startProtein === 'fish' && index % 2 === 1)
        ? 'chicken'
        : 'fish';
    const side_dish = index % 2 === 0 ? 'vorta' : 'vaji';

    return {
      date,
      menu_type: 'regular',
      main_protein,
      side_dish,
      friday_option: null,
      friday_meat: null,
      protein_dish: '',
      side_item: '',
      dal_item: '',
      extra_items: '',
      food_cost: '',
    };
  });
};

export const buildWeeklyMenuPreview = ({
  weekStartDate,
  startProtein,
  fridayOption,
  fridayMeat,
}) => {
  const dates = getWeekdayDates(weekStartDate);

  return dates.map((date, index) => {
    if (index === 4) {
      return {
        date,
        menu_type: 'friday',
        label:
          fridayOption === 'roast_polaw'
            ? 'Friday: Roast + Polaw + Beef + Egg'
            : `Friday: Khichuri + ${fridayMeat === 'mutton' ? 'Mutton' : 'Beef'}`,
      };
    }

    const mainProtein =
      (startProtein === 'chicken' && index % 2 === 0) ||
      (startProtein === 'fish' && index % 2 === 1)
        ? 'chicken'
        : 'fish';
    const sideDish = index % 2 === 0 ? 'vorta' : 'vaji';
    const protein = mainProtein === 'chicken' ? 'Chicken' : 'Fish';
    const side = sideDish === 'vorta' ? 'Vorta' : 'Vaji';

    return {
      date,
      menu_type: 'regular',
      label: `${protein} + Dal + ${side}`,
    };
  });
};

export const formatWeekRange = (weekStart, weekEnd) => {
  const start = parseLocalDate(getMonday(weekStart));
  const end = parseLocalDate(getFriday(weekEnd));
  const opts = { month: 'short', day: 'numeric' };
  const startStr = start.toLocaleDateString('en-US', opts);
  const endStr = end.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  return `${startStr} – ${endStr} (Mon–Fri)`;
};
