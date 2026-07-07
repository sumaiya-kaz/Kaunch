import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'hr';

  const linkClass = (path) => {
    const active = location.pathname === path;
    return `px-3 py-1.5 rounded-lg text-sm font-medium transition ${
      active
        ? 'bg-white/15 text-accent-light'
        : 'text-white/90 hover:bg-white/10 hover:text-white'
    }`;
  };

  return (
    <nav className="bg-primary-dark text-white shadow-md border-b border-primary">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6 lg:gap-8">
            <Link
              to={isAdmin ? '/admin' : '/dashboard'}
              className="text-xl font-bold tracking-tight hover:text-accent-light transition"
            >
              🍽 Kaunch
            </Link>

            {isAdmin ? (
              <div className="hidden md:flex gap-1">
                <Link to="/admin" className={linkClass('/admin')}>Dashboard</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin/employees" className={linkClass('/admin/employees')}>Employees</Link>
                )}
                <Link to="/admin/fines" className={linkClass('/admin/fines')}>Fines</Link>
                <Link to="/admin/daily-sheet" className={linkClass('/admin/daily-sheet')}>Daily Sheet</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin/menu" className={linkClass('/admin/menu')}>Meal Plan</Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin/settings" className={linkClass('/admin/settings')}>Settings</Link>
                )}
                <Link to="/admin/reports" className={linkClass('/admin/reports')}>Reports</Link>
              </div>
            ) : (
              <div className="hidden md:flex gap-1">
                <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
                <Link to="/subscription" className={linkClass('/subscription')}>Subscription</Link>
                <Link to="/history" className={linkClass('/history')}>History</Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="font-semibold text-sm">{user?.name}</div>
              <div className="text-xs text-accent-light capitalize">{user?.role}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="bg-danger/90 hover:bg-danger text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
