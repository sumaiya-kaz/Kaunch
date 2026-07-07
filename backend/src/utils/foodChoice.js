export const FOOD_CHOICES = [
  'regular',
  'no_fish',
  'no_chicken',
  'no_mutton_beef',
  'always_fish',
];

const LEGACY_FOOD_MAP = {
  any: 'regular',
  vegetarian: 'regular',
  chicken: 'no_fish',
  fish: 'no_chicken',
  beef: 'no_mutton_beef',
};

export function normalizeFoodChoice(value) {
  if (!value) return 'regular';
  if (FOOD_CHOICES.includes(value)) return value;
  return LEGACY_FOOD_MAP[value] || 'regular';
}
