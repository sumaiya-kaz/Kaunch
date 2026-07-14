import { useState, useEffect } from 'react';
import { api } from '@kaunch/shared-api';
import { FOOD_CHOICE_OPTIONS } from '@kaunch/shared-ui';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    email: '',
    password: '',
    role: 'employee',
    food_preference: 'regular'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.employees);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/employees', formData);
      setShowModal(false);
      setFormData({
        employee_id: '',
        name: '',
        email: '',
        password: '',
        role: 'employee',
        food_preference: 'regular'
      });
      loadEmployees();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create employee');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-sp-6">
        <h1>Employee Management</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + Add Employee
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-dark text-white">
              <tr>
                <th className="px-4 py-3 text-left">Employee ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Food Preference</th>
                <th className="px-4 py-3 text-left">Fine Balance</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, index) => (
                <tr
                  key={emp.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-neutral-100'}
                >
                  <td className="px-4 py-3 font-mono">{emp.employee_id}</td>
                  <td className="px-4 py-3 font-semibold">{emp.name}</td>
                  <td className="px-4 py-3">{emp.email}</td>
                  <td className="px-4 py-3 capitalize">{emp.food_preference}</td>
                  <td className="px-4 py-3 font-bold text-danger">৳{emp.fine_balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="mb-6">Add New Employee</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Employee ID</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input
                  type="email"
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Password</label>
                <input
                  type="password"
                  className="input-field"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Role</label>
                <select
                  className="input-field"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                  <option value="hr">HR</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Food Preference</label>
                <select
                  className="input-field"
                  value={formData.food_preference}
                  onChange={(e) => setFormData({ ...formData, food_preference: e.target.value })}
                >
                  {FOOD_CHOICE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Create Employee
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
