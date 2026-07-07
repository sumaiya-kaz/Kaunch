/**
 * Lunch Subscription Sheet - June 2026
 * Source: Lunch Subscription Sheet - June 2026.md
 * Food preferences: Lunch Subscription Sheet - Food choice list.md
 */

export const SUBSCRIPTION_MONTH = 6;
export const SUBSCRIPTION_YEAR = 2026;

export const SUBSCRIPTION_DATES = [
  '2026-06-22',
  '2026-06-23',
  '2026-06-24',
  '2026-06-25',
  '2026-06-26',
  '2026-06-29',
  '2026-06-30',
];

// No Fish / Only chicken
const NO_FISH_ONLY_CHICKEN = new Set([
  'Moniruzzaman', 'Shanto', 'Nahian', 'Robin', 'Biplob', 'Sakil', 'Tanveer',
  'Omar', 'Mehedi', 'Anower Ullah', 'Roshid', 'Hannan', 'Fahimul', 'Efty',
]);

// No Chicken
const NO_CHICKEN = new Set([
  'Suborno', 'Rijvy', 'Akash', 'Tanzeel', 'Asif', 'Hridoy', 'Tamal', 'Mridha', 'Rifat',
]);

// Always Fish
const ALWAYS_FISH = new Set([
  'Abdul Kaium Khan', 'Anwar', 'Uttam', 'Soumit',
]);

// No Beef & Mutton (incl. no mutton)
const NO_BEEF_MUTTON = new Set([
  'Belal', 'Sumaiya', 'Ritu', 'Biplob',
]);

/**
 * Map sheet food categories to schema food_preference values.
 * Priority: always fish > no fish/only chicken > no chicken > no beef > any
 */
export function getFoodPreference(name) {
  if (ALWAYS_FISH.has(name)) return 'always_fish';
  if (NO_FISH_ONLY_CHICKEN.has(name)) return 'no_fish';
  if (NO_CHICKEN.has(name)) return 'no_chicken';
  if (NO_BEEF_MUTTON.has(name)) return 'no_mutton_beef';
  return 'regular';
}

/**
 * Each employee: { name, days: boolean[7] } — true = Yes (subscribed), false = No
 */
export const EMPLOYEES = [
  { name: 'Rijvy', days: [true, true, true, true, true, true, true] },
  { name: 'Abdur Rouf', days: [false, false, true, true, true, true, true] },
  { name: 'Sharif', days: [true, true, true, true, true, true, true] },
  { name: 'Moniruzzaman', days: [true, true, true, true, true, true, true] },
  { name: 'Hridoy', days: [true, true, true, true, true, true, true] },
  { name: 'Shanto', days: [true, true, true, true, true, true, true] },
  { name: 'Suborno', days: [true, true, true, true, true, true, true] },
  { name: 'Arunav', days: [true, true, true, true, true, true, true] },
  { name: 'Anower Ullah', days: [false, true, true, true, true, true, true] },
  { name: 'Abdul Kaium Khan', days: [true, true, true, true, true, true, true] },
  { name: 'Akash', days: [true, true, true, true, true, true, true] },
  { name: 'Mridha', days: [true, true, true, true, true, true, true] },
  { name: 'Omar', days: [true, true, true, true, true, true, true] },
  { name: 'Bayazid', days: [true, true, true, true, true, true, true] },
  { name: 'Fahimul', days: [true, true, true, true, true, true, true] },
  { name: 'Sumon', days: [true, true, true, true, true, true, true] },
  { name: 'Siam', days: [false, false, false, false, false, false, false] },
  { name: 'Biplob', days: [true, true, true, true, true, true, true] },
  { name: 'Azizul', days: [true, true, true, true, true, true, true] },
  { name: 'Belal', days: [false, true, true, true, true, true, true] },
  { name: 'Nahian', days: [false, true, true, true, true, true, true] },
  { name: 'Robin', days: [true, true, true, true, true, true, true] },
  { name: 'Mehedi', days: [true, true, true, true, true, true, true] },
  { name: 'Nasim', days: [true, true, true, true, true, true, true] },
  { name: 'Forhad', days: [true, false, true, false, true, true, false] },
  { name: 'Tanzeel', days: [true, true, true, true, true, true, true] },
  { name: 'Zakaria', days: [true, true, true, true, true, true, true] },
  { name: 'Upama', days: [true, true, true, true, true, true, true] },
  { name: 'Asif', days: [true, true, true, true, true, true, true] },
  { name: 'Tamal', days: [true, true, true, true, true, true, true] },
  { name: 'Soumit', days: [true, true, true, true, true, true, true] },
  { name: 'Rana', days: [false, false, false, false, false, false, true] },
  { name: 'Rasel', days: [true, true, true, true, true, true, true] },
  { name: 'Anwar', days: [true, true, true, true, true, true, true] },
  { name: 'Uttam', days: [false, false, true, true, true, true, true] },
  { name: 'Sumaiya', days: [true, true, true, true, true, true, true] },
  { name: 'Irfan', days: [true, true, true, true, true, true, true] },
  { name: 'Roshid', days: [true, true, true, true, false, false, true] },
  { name: 'Sakil', days: [false, true, true, true, true, true, true] },
  { name: 'Hannan', days: [true, true, true, true, true, true, true] },
  { name: 'Efty', days: [true, true, true, true, true, true, true] },
  { name: 'Mukit', days: [true, true, true, true, true, true, true] },
  { name: 'Tanveer', days: [true, true, true, true, true, true, true] },
  { name: 'Ritu', days: [true, true, true, true, true, true, true] },
  { name: 'Shuvo', days: [true, true, true, false, false, true, true] },
  { name: 'Rifat', days: [true, true, true, true, true, true, true] },
  { name: 'Sowmik', days: [true, true, true, true, true, true, true] },
  { name: 'Amit', days: [true, true, true, true, true, true, true] },
  { name: 'Lelin', days: [true, true, true, true, true, true, true] },
  { name: 'Maksud', days: [true, true, true, true, true, true, true] },
  { name: 'Adnan', days: [true, true, true, true, true, true, true] },
  { name: 'Rahat', days: [true, true, true, true, true, true, true] },
  { name: 'Saima', days: [false, true, false, false, false, true, true] },
];

export function nameToEmail(name) {
  return `${name.toLowerCase().replace(/\s+/g, '.')}@company.com`;
}

export function nameToEmployeeId(index) {
  return `EMP${String(index + 1).padStart(3, '0')}`;
}

export function getSubscriptionType(days) {
  const yesCount = days.filter(Boolean).length;
  if (yesCount === 0) return 'none';
  if (yesCount === days.length) return 'full';
  return 'half';
}
