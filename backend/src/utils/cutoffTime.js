import { Settings } from '../models/settingsModel.js';

const CUTOFF_SETTING_KEY = 'cutoff_time';
let cachedCutoffTime = process.env.CUTOFF_TIME || '14:00';

export function getCutoffTime() {
  return cachedCutoffTime;
}

export async function loadCutoffTime() {
  try {
    const stored = await Settings.get(CUTOFF_SETTING_KEY);
    if (stored && isValidCutoffTime(stored)) {
      cachedCutoffTime = stored;
    } else if (!stored) {
      await Settings.set(CUTOFF_SETTING_KEY, cachedCutoffTime);
    }
  } catch (error) {
    console.warn('Could not load cutoff time from database, using default:', cachedCutoffTime);
  }
  return cachedCutoffTime;
}

export async function setCutoffTime(value, updatedBy = null) {
  if (!isValidCutoffTime(value)) {
    throw new Error('Invalid cutoff time');
  }
  await Settings.set(CUTOFF_SETTING_KEY, value, updatedBy);
  cachedCutoffTime = value;
  return cachedCutoffTime;
}

export function isValidCutoffTime(value) {
  if (!value || typeof value !== 'string') return false;
  const match = value.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  return Boolean(match);
}

export function parseCutoffTime(cutoffTime = getCutoffTime()) {
  const [hour, minute] = cutoffTime.split(':').map(Number);
  return { hour, minute };
}

export function formatCutoffDisplay(cutoffTime = getCutoffTime()) {
  const { hour, minute } = parseCutoffTime(cutoffTime);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}

function shiftMinutes(offset) {
  const { hour, minute } = parseCutoffTime();
  let total = hour * 60 + minute + offset;
  if (total < 0) total += 24 * 60;
  if (total >= 24 * 60) total -= 24 * 60;
  return { hour: Math.floor(total / 60), minute: total % 60 };
}

export function getWarningCronTime() {
  return shiftMinutes(-15);
}

export function getFineCronTime() {
  return shiftMinutes(5);
}

export function toCronExpression({ hour, minute }) {
  return `${minute} ${hour} * * *`;
}
