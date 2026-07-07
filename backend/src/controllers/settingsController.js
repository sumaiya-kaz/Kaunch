import {
  getCutoffTime,
  setCutoffTime,
  formatCutoffDisplay,
  isValidCutoffTime,
} from '../utils/cutoffTime.js';
import { scheduleCutoffJobs } from '../services/cronScheduler.js';

export const settingsController = {
  async getCutoff(req, res) {
    try {
      const cutoffTime = getCutoffTime();

      res.json({
        success: true,
        cutoffTime,
        cutoffDisplay: formatCutoffDisplay(cutoffTime),
      });
    } catch (error) {
      console.error('Get cutoff error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async updateCutoff(req, res) {
    try {
      const { cutoffTime } = req.body;

      if (!cutoffTime || !isValidCutoffTime(cutoffTime)) {
        return res.status(400).json({
          message: 'Valid cutoff time is required (HH:MM format, e.g. 14:00)',
        });
      }

      await setCutoffTime(cutoffTime, req.user.id);
      scheduleCutoffJobs();

      res.json({
        success: true,
        message: 'Cutoff time updated successfully',
        cutoffTime: getCutoffTime(),
        cutoffDisplay: formatCutoffDisplay(),
      });
    } catch (error) {
      console.error('Update cutoff error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
};
