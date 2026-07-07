import { Fine } from '../models/fineModel.js';
import { Employee } from '../models/employeeModel.js';
import { LunchConfirmation } from '../models/lunchModel.js';

export const fineController = {
  async createFine(req, res) {
    try {
      const { employee_id, date, amount, reason } = req.body;
      const appliedBy = req.user.id;

      if (!employee_id || !date || !amount) {
        return res.status(400).json({ 
          message: 'Employee ID, date, and amount are required' 
        });
      }

      const fine = await Fine.create({
        employee_id,
        date,
        amount: amount || parseFloat(process.env.DEFAULT_FINE_AMOUNT || 50),
        reason: reason || 'Missed lunch confirmation',
        applied_by: appliedBy
      });

      // Update employee fine balance
      await Employee.updateFineBalance(employee_id, amount);

      res.status(201).json({
        success: true,
        message: 'Fine applied successfully',
        fine
      });
    } catch (error) {
      console.error('Create fine error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getAllFines(req, res) {
    try {
      const { month, year } = req.query;

      let fines;
      if (month && year) {
        fines = await Fine.getByMonth(parseInt(month), parseInt(year));
      } else {
        fines = await Fine.getAll();
      }

      res.json({
        success: true,
        fines
      });
    } catch (error) {
      console.error('Get all fines error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getMyFines(req, res) {
    try {
      const employeeId = req.user.id;
      const fines = await Fine.getByEmployee(employeeId);
      const totalPending = await Fine.getTotalByEmployee(employeeId);

      res.json({
        success: true,
        fines,
        totalPending
      });
    } catch (error) {
      console.error('Get my fines error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getFineById(req, res) {
    try {
      const fine = await Fine.findById(req.params.id);

      if (!fine) {
        return res.status(404).json({ message: 'Fine not found' });
      }

      res.json({
        success: true,
        fine
      });
    } catch (error) {
      console.error('Get fine error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async updateFineStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const resolvedBy = req.user.id;

      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }

      if (!['pending', 'paid'].includes(status)) {
        return res.status(400).json({ message: 'Fine status must be pending or paid' });
      }

      const fine = await Fine.findById(id);
      if (!fine) {
        return res.status(404).json({ message: 'Fine not found' });
      }

      const updatedFine = await Fine.updateStatus(id, status, resolvedBy, notes);

      // Update employee fine balance when marked paid
      if (status === 'paid') {
        await Employee.updateFineBalance(fine.employee_id, -fine.amount);
      }

      res.json({
        success: true,
        message: `Fine ${status} successfully`,
        fine: updatedFine
      });
    } catch (error) {
      console.error('Update fine status error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getMonthlyStats(req, res) {
    try {
      const { month, year } = req.query;
      const currentDate = new Date();
      
      const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
      const targetYear = year ? parseInt(year) : currentDate.getFullYear();

      const stats = await Fine.getMonthlyStats(targetMonth, targetYear);

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('Get fine stats error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getFinesByDate(req, res) {
    try {
      const date = req.query.date || new Date().toISOString().split('T')[0];
      const fines = await Fine.getByDate(date);

      res.json({
        success: true,
        date,
        fines,
        generated: fines.length > 0,
      });
    } catch (error) {
      console.error('Get fines by date error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async generateFromSheet(req, res) {
    try {
      const { date, amount } = req.body;
      const appliedBy = req.user.id;

      if (!date) {
        return res.status(400).json({ message: 'Date is required' });
      }

      const sheetDate = new Date(date);
      const month = sheetDate.getMonth() + 1;
      const year = sheetDate.getFullYear();
      const fineAmount = amount || parseFloat(process.env.DEFAULT_FINE_AMOUNT || 50);

      const sheet = await LunchConfirmation.getSheetForDate(date, month, year);
      const createdFines = [];
      let revoked = 0;

      for (const employee of sheet) {
        const existing = await Fine.findByEmployeeAndDate(employee.employee_id, date);
        const signed = employee.status === 'confirmed';

        if (signed) {
          if (existing?.status === 'pending') {
            await Fine.deletePendingByEmployeeAndDate(employee.employee_id, date);
            await Employee.updateFineBalance(employee.employee_id, -existing.amount);
            revoked++;
          }
          continue;
        }

        if (existing) {
          continue;
        }

        const fine = await Fine.create({
          employee_id: employee.employee_id,
          date,
          amount: fineAmount,
          reason: 'Did not sign daily food enjoyment sheet',
          applied_by: appliedBy,
        });

        await Employee.updateFineBalance(employee.employee_id, fineAmount);
        createdFines.push(fine);
      }

      const activeFines = await Fine.getByDate(date);

      let message;
      if (createdFines.length > 0) {
        message = `Generated ${createdFines.length} fine(s) for ${date}`;
      } else if (revoked > 0) {
        message = `No fines — removed ${revoked} incorrect fine(s). Everyone signed the sheet.`;
      } else {
        message = 'No fines to generate — everyone signed the sheet';
      }

      res.json({
        success: true,
        message,
        fines: createdFines,
        activeFines,
        created: createdFines.length,
        revoked,
      });
    } catch (error) {
      console.error('Generate fines from sheet error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
};
