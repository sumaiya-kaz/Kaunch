import nodemailer from 'nodemailer';
import { Employee } from '../models/employeeModel.js';
import { LunchConfirmation } from '../models/lunchModel.js';
import { Subscription } from '../models/subscriptionModel.js';
import { Fine } from '../models/fineModel.js';
import { formatCutoffDisplay } from '../utils/cutoffTime.js';

// Email transporter
let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

async function sendEmail(to, subject, html) {
  if (!transporter) {
    console.log('Email not configured. Would have sent:', { to, subject });
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
  }
}

export async function sendDailyReminders() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Get active subscribers
    const subscriptions = await Subscription.getActiveSubscriptions(currentMonth, currentYear);

    for (const sub of subscriptions) {
      // Check if already confirmed
      const confirmation = await LunchConfirmation.findByEmployeeAndDate(sub.employee_id, today);
      
      if (!confirmation || confirmation.status === 'pending') {
        const subject = '🍽 Time to confirm your lunch for today!';
        const html = `
          <h2>Kaunch - Daily Lunch Reminder</h2>
          <p>Hello ${sub.name},</p>
          <p>Please confirm your lunch preference for today before <strong>${formatCutoffDisplay()}</strong>.</p>
          <p>Cutoff is at ${formatCutoffDisplay()}. If you don't confirm, you'll be marked as skipped and a fine may be applied.</p>
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login">Log in to confirm</a></p>
          <p>Best regards,<br>Kaunch Team</p>
        `;
        
        await sendEmail(sub.email, subject, html);
      }
    }

    console.log(`📧 Daily reminders sent to ${subscriptions.length} employees`);
  } catch (error) {
    console.error('Error sending daily reminders:', error);
  }
}

export async function sendWarningReminders() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const subscriptions = await Subscription.getActiveSubscriptions(currentMonth, currentYear);

    for (const sub of subscriptions) {
      const confirmation = await LunchConfirmation.findByEmployeeAndDate(sub.employee_id, today);
      
      if (!confirmation || confirmation.status === 'pending') {
        const subject = '⏱ 15 minutes left! Confirm your lunch';
        const html = `
          <h2>Kaunch - Final Reminder</h2>
          <p>Hello ${sub.name},</p>
          <p><strong>Only 15 minutes left!</strong></p>
          <p>The cutoff is at ${formatCutoffDisplay()}. Please confirm your lunch immediately or you'll be marked as skipped.</p>
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login">Confirm now</a></p>
          <p>Best regards,<br>Kaunch Team</p>
        `;
        
        await sendEmail(sub.email, subject, html);
      }
    }

    console.log('⚠️  Warning reminders sent');
  } catch (error) {
    console.error('Error sending warning reminders:', error);
  }
}

export async function calculateDailyFines() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const subscriptions = await Subscription.getActiveSubscriptions(currentMonth, currentYear);

    let finesApplied = 0;

    for (const sub of subscriptions) {
      const confirmation = await LunchConfirmation.findByEmployeeAndDate(sub.employee_id, today);
      
      // If no confirmation or still pending after cutoff, apply fine
      if (!confirmation || confirmation.status === 'pending') {
        const fineAmount = parseFloat(process.env.DEFAULT_FINE_AMOUNT || 50);
        
        // Create fine record
        await Fine.create({
          employee_id: sub.employee_id,
          date: today,
          amount: fineAmount,
          reason: 'Missed lunch confirmation (subscribed but did not confirm)',
          applied_by: null // System-generated
        });

        // Update employee fine balance
        await Employee.updateFineBalance(sub.employee_id, fineAmount);

        // Mark as skipped
        await LunchConfirmation.create({
          employee_id: sub.employee_id,
          date: today,
          status: 'skipped',
          is_late: false,
          notes: 'Auto-skipped: No confirmation before cutoff'
        });

        // Send fine notification
        const subject = '⚠ A fine has been applied to your account';
        const html = `
          <h2>Kaunch - Fine Applied</h2>
          <p>Hello ${sub.name},</p>
          <p>A fine of <strong>৳${fineAmount}</strong> has been applied to your account for ${today}.</p>
          <p><strong>Reason:</strong> You were subscribed for lunch but did not confirm before the ${formatCutoffDisplay()} cutoff.</p>
          <p>If you believe this is an error, please contact the admin to dispute.</p>
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login">View your fines</a></p>
          <p>Best regards,<br>Kaunch Team</p>
        `;
        
        await sendEmail(sub.email, subject, html);
        finesApplied++;
      }
    }

    console.log(`💰 Fines calculated: ${finesApplied} fines applied`);
  } catch (error) {
    console.error('Error calculating fines:', error);
  }
}

export async function sendMonthlyReport(employeeId) {
  try {
    const employee = await Employee.findById(employeeId);
    if (!employee) return;

    const currentDate = new Date();
    const lastMonth = currentDate.getMonth(); // JavaScript months are 0-indexed
    const year = lastMonth === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
    const month = lastMonth === 0 ? 12 : lastMonth;

    const history = await LunchConfirmation.getMonthlyHistory(employeeId, month, year);
    const fines = await Fine.getByEmployee(employeeId);

    const confirmed = history.filter(h => h.status === 'confirmed').length;
    const skipped = history.filter(h => h.status === 'skipped').length;
    const totalFines = fines.reduce((sum, f) => sum + parseFloat(f.amount), 0);

    const subject = `📊 Your lunch report for ${month}/${year}`;
    const html = `
      <h2>Kaunch - Monthly Summary</h2>
      <p>Hello ${employee.name},</p>
      <p>Your lunch report for <strong>${month}/${year}</strong>:</p>
      <ul>
        <li><strong>${confirmed}</strong> confirmed</li>
        <li><strong>${skipped}</strong> skipped</li>
        <li><strong>৳${totalFines}</strong> in fines</li>
      </ul>
      <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/history">View full report</a></p>
      <p>Best regards,<br>Kaunch Team</p>
    `;
    
    await sendEmail(employee.email, subject, html);
  } catch (error) {
    console.error('Error sending monthly report:', error);
  }
}
