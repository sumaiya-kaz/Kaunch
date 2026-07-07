const FoodPreferenceChip = ({ preference }) => {
  const preferences = {
    regular: { label: '🍽 Regular', bg: 'bg-neutral-100', text: 'text-neutral-700' },
    no_fish: { label: '🍗 No Fish / Only Chicken', bg: 'bg-accent-light', text: 'text-accent' },
    no_chicken: { label: '🐟 No Chicken / Only Fish', bg: 'bg-blue-100', text: 'text-blue-700' },
    no_mutton_beef: { label: '🥗 No Mutton / No Beef', bg: 'bg-primary-light', text: 'text-primary' },
    always_fish: { label: '🐟 Always Fish', bg: 'bg-blue-100', text: 'text-blue-700' },
  };

  const chip = preferences[preference] || preferences.regular;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${chip.bg} ${chip.text}`}>
      {chip.label}
    </span>
  );
};

export const FOOD_CHOICE_OPTIONS = [
  { value: 'regular', label: 'Regular (follows daily menu)' },
  { value: 'no_fish', label: 'No Fish / Only Chicken' },
  { value: 'no_chicken', label: 'No Chicken / Only Fish' },
  { value: 'no_mutton_beef', label: 'No Mutton / No Beef' },
  { value: 'always_fish', label: 'Always Fish' },
];

export default FoodPreferenceChip;
