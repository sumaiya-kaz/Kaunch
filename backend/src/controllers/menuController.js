import { Menu } from '../models/menuModel.js';
import { Employee } from '../models/employeeModel.js';
import { Subscription } from '../models/subscriptionModel.js';
import {
  buildWeeklyMenus,
  getMonday,
  buildMenuDescription,
  buildEmployeeMenuDescription,
  hasFoodChoiceOverride,
  getEmployeeMenuOptions,
  getDefaultMenuChoice,
} from '../utils/menuUtils.js';
import { suggestWeeklyMenu, suggestDayMenu } from '../utils/menuSuggestionEngine.js';
import { DISH_CATALOG } from '../data/dishCatalog.js';

export const menuController = {
  async createMenu(req, res) {
    try {
      const {
        date,
        menu_type,
        main_protein,
        side_dish,
        friday_option,
        friday_meat,
        description,
      } = req.body;

      if (!date || !menu_type) {
        return res.status(400).json({ message: 'Date and menu type are required' });
      }

      if (menu_type === 'regular' && (!main_protein || !side_dish)) {
        return res.status(400).json({ message: 'Regular menus need main protein and side dish' });
      }

      if (menu_type === 'friday' && !friday_option) {
        return res.status(400).json({ message: 'Friday menus need a Friday option' });
      }

      const menu = await Menu.create({
        date,
        menu_type,
        main_protein,
        side_dish,
        friday_option,
        friday_meat,
        description,
        created_by: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: 'Menu created successfully',
        menu,
      });
    } catch (error) {
      console.error('Create menu error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async suggestWeeklyMenu(req, res) {
    try {
      const { weekStartDate: rawWeekStart, startProtein, fridayOption, fridayMeat } = req.body;

      if (!rawWeekStart || !startProtein || !fridayOption) {
        return res.status(400).json({
          message: 'Week start date, starting protein, and Friday option are required',
        });
      }

      const weekStartDate = getMonday(rawWeekStart);
      const result = suggestWeeklyMenu({
        weekStartDate,
        startProtein,
        fridayOption,
        fridayMeat: fridayMeat || 'beef',
      });

      res.json({
        success: true,
        ...result,
        dishCatalog: DISH_CATALOG,
      });
    } catch (error) {
      console.error('Suggest weekly menu error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async suggestDayMenu(req, res) {
    try {
      const {
        weekStartDate: rawWeekStart,
        startProtein,
        fridayOption,
        fridayMeat,
        date,
        excludeNames = [],
        variation,
      } = req.body;

      if (!rawWeekStart || !startProtein || !fridayOption || !date) {
        return res.status(400).json({
          message: 'Week settings and date are required',
        });
      }

      const weekStartDate = getMonday(rawWeekStart);
      const weeklyMenus = buildWeeklyMenus({
        weekStartDate,
        startProtein,
        fridayOption,
        fridayMeat: fridayMeat || 'beef',
      });

      const menuDay = weeklyMenus.find((menu) => menu.date === date);
      if (!menuDay) {
        return res.status(400).json({
          message: 'Date must be a weekday (Mon–Fri) in the selected week',
        });
      }

      const menu = suggestDayMenu(menuDay, {
        excludeNames,
        variation: variation ?? Date.now(),
      });

      res.json({
        success: true,
        menu,
      });
    } catch (error) {
      console.error('Suggest day menu error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async createWeeklyMenuPlan(req, res) {
    try {
      const {
        weekStartDate: rawWeekStart,
        startProtein,
        fridayOption,
        fridayMeat,
        menus: customMenus,
      } = req.body;

      if (!rawWeekStart || !startProtein || !fridayOption) {
        return res.status(400).json({
          message: 'Week start date, starting protein, and Friday option are required',
        });
      }

      const weekStartDate = getMonday(rawWeekStart);

      let weeklyMenus = customMenus;
      if (!Array.isArray(weeklyMenus) || weeklyMenus.length === 0) {
        weeklyMenus = suggestWeeklyMenu({
          weekStartDate,
          startProtein,
          fridayOption,
          fridayMeat: fridayMeat || 'beef',
        }).menus;
      }

      const createdMenus = [];
      for (const menu of weeklyMenus) {
        const description = buildMenuDescription(menu);
        const created = await Menu.create({
          ...menu,
          description,
          created_by: req.user.id,
        });
        createdMenus.push(created);
      }

      const totalCost = createdMenus.reduce((sum, m) => sum + Number(m.food_cost || 0), 0);

      res.status(201).json({
        success: true,
        message: 'Full weekly menu plan saved successfully',
        menus: createdMenus,
        summary: {
          totalCost,
          avgCostPerDay: createdMenus.length ? Math.round(totalCost / createdMenus.length) : 0,
          days: createdMenus.length,
        },
      });
    } catch (error) {
      console.error('Create weekly menu plan error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async createWeeklyMenu(req, res) {
    try {
      const { weekStartDate: rawWeekStart, startProtein, fridayOption, fridayMeat } = req.body;

      if (!rawWeekStart || !startProtein || !fridayOption) {
        return res.status(400).json({
          message: 'Week start date, starting protein, and Friday option are required',
        });
      }

      const weekStartDate = getMonday(rawWeekStart);

      const weeklyMenus = buildWeeklyMenus({
        weekStartDate,
        startProtein,
        fridayOption,
        fridayMeat: fridayMeat || 'beef',
      });

      const createdMenus = [];
      for (const menu of weeklyMenus) {
        const created = await Menu.create({
          ...menu,
          created_by: req.user.id,
        });
        createdMenus.push(created);
      }

      res.status(201).json({
        success: true,
        message: 'Weekly menu created successfully',
        menus: createdMenus,
      });
    } catch (error) {
      console.error('Create weekly menu error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getTodayMenu(req, res) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const menu = await Menu.findByDate(today);

      res.json({
        success: true,
        menu: menu || null,
        description: menu ? buildMenuDescription(menu) : null,
      });
    } catch (error) {
      console.error('Get today menu error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getTodayMenuOptions(req, res) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const menu = await Menu.findByDate(today);
      const employee = await Employee.findById(req.user.id);
      const currentDate = new Date();
      const subscription = await Subscription.findByEmployeeAndMonth(
        req.user.id,
        currentDate.getMonth() + 1,
        currentDate.getFullYear()
      );

      const monthlyFoodChoice =
        subscription?.monthly_food_choice || employee.food_preference || 'regular';
      const options = getEmployeeMenuOptions(menu, monthlyFoodChoice);
      const defaultChoice = getDefaultMenuChoice(menu, monthlyFoodChoice);
      const choiceOverridesMenu = menu ? hasFoodChoiceOverride(menu, monthlyFoodChoice) : false;

      res.json({
        success: true,
        menu,
        description: menu ? buildEmployeeMenuDescription(menu, monthlyFoodChoice) : null,
        officeDescription:
          menu && choiceOverridesMenu ? buildMenuDescription(menu) : null,
        monthlyFoodChoice,
        choiceOverridesMenu,
        options,
        defaultChoice,
        hasSubscription: Boolean(
          subscription && ['full', 'half'].includes(subscription.subscription_type)
        ),
      });
    } catch (error) {
      console.error('Get today menu options error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getMenuByDate(req, res) {
    try {
      const { date } = req.params;
      const menu = await Menu.findByDate(date);

      res.json({
        success: true,
        menu: menu || null,
        description: menu ? buildMenuDescription(menu) : null,
      });
    } catch (error) {
      console.error('Get menu error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async getMenuByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
      }

      const menus = await Menu.getByDateRange(startDate, endDate);

      res.json({
        success: true,
        menus,
      });
    } catch (error) {
      console.error('Get menu range error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async updateMenu(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      const menu = await Menu.update(id, updateData);

      if (!menu) {
        return res.status(404).json({ message: 'Menu not found' });
      }

      res.json({
        success: true,
        message: 'Menu updated successfully',
        menu,
      });
    } catch (error) {
      console.error('Update menu error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  async deleteMenu(req, res) {
    try {
      const { id } = req.params;
      await Menu.delete(id);

      res.json({
        success: true,
        message: 'Menu deleted successfully',
      });
    } catch (error) {
      console.error('Delete menu error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
};
