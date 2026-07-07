import cron from 'node-cron';
import { sendWarningReminders, calculateDailyFines } from './notificationService.js';
import {
  getWarningCronTime,
  getFineCronTime,
  toCronExpression,
} from '../utils/cutoffTime.js';

const timezone = process.env.TIMEZONE || 'Asia/Dhaka';

let warningTask = null;
let fineTask = null;

export function scheduleCutoffJobs() {
  if (warningTask) {
    warningTask.stop();
    warningTask = null;
  }
  if (fineTask) {
    fineTask.stop();
    fineTask = null;
  }

  const warningCron = getWarningCronTime();
  warningTask = cron.schedule(
    toCronExpression(warningCron),
    async () => {
      console.log(
        `Running warning reminder job at ${warningCron.hour}:${String(warningCron.minute).padStart(2, '0')}`
      );
      await sendWarningReminders();
    },
    { timezone }
  );

  const fineCron = getFineCronTime();
  fineTask = cron.schedule(
    toCronExpression(fineCron),
    async () => {
      console.log(
        `Running fine calculation job at ${fineCron.hour}:${String(fineCron.minute).padStart(2, '0')}`
      );
      await calculateDailyFines();
    },
    { timezone }
  );
}
