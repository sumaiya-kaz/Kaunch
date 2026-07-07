import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Employee } from '../models/employeeModel.js';

export const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const employee = await Employee.findByEmail(email);
      
      if (!employee) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (!employee.is_active) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }

      const isValidPassword = await bcrypt.compare(password, employee.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { 
          id: employee.id, 
          email: employee.email, 
          role: employee.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: employee.id,
          employeeId: employee.employee_id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
          foodPreference: employee.food_preference,
          fineBalance: employee.fine_balance
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async register(req, res) {
    try {
      const { employee_id, name, email, password, role, food_preference } = req.body;

      // Check if employee already exists
      const existingEmployee = await Employee.findByEmail(email);
      if (existingEmployee) {
        return res.status(409).json({ message: 'Employee already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create employee
      const employee = await Employee.create({
        employee_id,
        name,
        email,
        password: hashedPassword,
        role,
        food_preference
      });

      res.status(201).json({
        success: true,
        message: 'Employee registered successfully',
        employee: {
          id: employee.id,
          employeeId: employee.employee_id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
          foodPreference: employee.food_preference
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getProfile(req, res) {
    try {
      const employee = await Employee.findById(req.user.id);
      
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.json({
        success: true,
        user: {
          id: employee.id,
          employeeId: employee.employee_id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
          foodPreference: employee.food_preference,
          fineBalance: employee.fine_balance,
          isActive: employee.is_active
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async updateProfile(req, res) {
    try {
      const { name, food_preference } = req.body;
      const updateData = {};

      if (name) updateData.name = name;
      if (food_preference) updateData.food_preference = food_preference;

      const employee = await Employee.update(req.user.id, updateData);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: employee
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new passwords are required' });
      }

      const employee = await Employee.findByEmail(req.user.email);
      const isValid = await bcrypt.compare(currentPassword, employee.password);

      if (!isValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await Employee.update(req.user.id, { password: hashedPassword });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};
