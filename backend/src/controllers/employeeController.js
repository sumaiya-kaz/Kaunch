import bcrypt from 'bcrypt';
import { Employee } from '../models/employeeModel.js';

export const employeeController = {
  async getAllEmployees(req, res) {
    try {
      const employees = await Employee.findAll();
      res.json({
        success: true,
        employees
      });
    } catch (error) {
      console.error('Get all employees error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getEmployeeById(req, res) {
    try {
      const employee = await Employee.findById(req.params.id);
      
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.json({
        success: true,
        employee
      });
    } catch (error) {
      console.error('Get employee error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async createEmployee(req, res) {
    try {
      const { employee_id, name, email, password, role, food_preference } = req.body;

      const existingEmployee = await Employee.findByEmail(email);
      if (existingEmployee) {
        return res.status(409).json({ message: 'Employee already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const employee = await Employee.create({
        employee_id,
        name,
        email,
        password: hashedPassword,
        role: role || 'employee',
        food_preference: food_preference || 'regular'
      });

      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        employee
      });
    } catch (error) {
      console.error('Create employee error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async updateEmployee(req, res) {
    try {
      const { name, role, food_preference, is_active } = req.body;
      const updateData = {};

      if (name !== undefined) updateData.name = name;
      if (role !== undefined) updateData.role = role;
      if (food_preference !== undefined) updateData.food_preference = food_preference;
      if (is_active !== undefined) updateData.is_active = is_active;

      const employee = await Employee.update(req.params.id, updateData);

      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.json({
        success: true,
        message: 'Employee updated successfully',
        employee
      });
    } catch (error) {
      console.error('Update employee error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async deleteEmployee(req, res) {
    try {
      await Employee.delete(req.params.id);
      res.json({
        success: true,
        message: 'Employee deleted successfully'
      });
    } catch (error) {
      console.error('Delete employee error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};
