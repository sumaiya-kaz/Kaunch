/**
 * Bengali office-lunch dish catalog with estimated per-person cost (BDT).
 * Used by the menu suggestion engine to propose specific dishes per day.
 */

export const DISH_CATALOG = {
  chicken: [
    { name: 'Murgir Mangsho (Chicken Curry)', cost: 45 },
    { name: 'Chicken Rezala', cost: 50 },
    { name: 'Chicken Bhuna', cost: 48 },
    { name: 'Chicken Korma', cost: 52 },
    { name: 'Murgir Jhol', cost: 42 },
    { name: 'Chicken Do Pyaza', cost: 46 },
  ],
  fish: [
    { name: 'Rui Mach er Jhol', cost: 40 },
    { name: 'Katla Mach er Kalia', cost: 45 },
    { name: 'Pabda Mach er Jhol', cost: 42 },
    { name: 'Telapia Fry', cost: 38 },
    { name: 'Chingri Malai Curry', cost: 55 },
    { name: 'Macher Tok', cost: 35 },
    { name: 'Ilish Bhaja', cost: 60 },
  ],
  vorta: [
    { name: 'Alur Vorta', cost: 8 },
    { name: 'Begun Vorta', cost: 10 },
    { name: 'Potol Vorta', cost: 10 },
    { name: 'Dhonepata Vorta', cost: 8 },
    { name: 'Macher Dim Vorta', cost: 12 },
    { name: 'Shutki Vorta', cost: 10 },
    { name: 'Kacha Morich Vorta', cost: 6 },
  ],
  vaji: [
    { name: 'Potol Bhaji', cost: 10 },
    { name: 'Alu Bhaji', cost: 8 },
    { name: 'Mix Sabji', cost: 12 },
    { name: 'Korola Bhaji', cost: 10 },
    { name: 'Jhinga Bhaji', cost: 10 },
    { name: 'Labra', cost: 12 },
    { name: 'Chichinga Bhaji', cost: 10 },
  ],
  dal: [
    { name: 'Moshur Dal', cost: 12 },
    { name: 'Moong Dal', cost: 12 },
    { name: 'Masoor Dal', cost: 12 },
    { name: 'Dal Tadka', cost: 14 },
    { name: 'Muger Dal', cost: 11 },
  ],
  friday_roast_polaw: [
    { name: 'Chicken Roast', cost: 55 },
    { name: 'Morog Polaw', cost: 35 },
    { name: 'Beef Curry', cost: 50 },
    { name: 'Dim Bhuna', cost: 15 },
  ],
  friday_khichuri_beef: [
    { name: 'Khichuri', cost: 30 },
    { name: 'Beef Rezala', cost: 55 },
    { name: 'Dim Bhuna', cost: 15 },
    { name: 'Salad', cost: 8 },
  ],
  friday_khichuri_mutton: [
    { name: 'Khichuri', cost: 30 },
    { name: 'Mutton Rezala', cost: 65 },
    { name: 'Dim Bhuna', cost: 15 },
    { name: 'Salad', cost: 8 },
  ],
};

export function getDishesByCategory(category) {
  return DISH_CATALOG[category] || [];
}
