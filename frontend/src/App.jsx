import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { routerBasename } from './utils/basePath';

// Pages
import Login from './pages/Login';
import EmployeeDashboard from './pages/employee/Dashboard';
import Subscription from './pages/employee/Subscription';
import History from './pages/employee/History';
import AdminDashboard from './pages/admin/Dashboard';
import Employees from './pages/admin/Employees';
import Fines from './pages/admin/Fines';
import DailySheet from './pages/admin/DailySheet';
import MenuManagement from './pages/admin/MenuManagement';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';

// Layout
import Layout from './components/Layout';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router basename={routerBasename}>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />} />
        
        {/* Employee Routes */}
        <Route
          path="/dashboard"
          element={
            user && user.role === 'employee' ? (
              <Layout>
                <EmployeeDashboard />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/subscription"
          element={
            user && user.role === 'employee' ? (
              <Layout>
                <Subscription />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/history"
          element={
            user && user.role === 'employee' ? (
              <Layout>
                <History />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            user && (user.role === 'admin' || user.role === 'hr') ? (
              <Layout>
                <AdminDashboard />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin/employees"
          element={
            user && user.role === 'admin' ? (
              <Layout>
                <Employees />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin/fines"
          element={
            user && (user.role === 'admin' || user.role === 'hr') ? (
              <Layout>
                <Fines />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin/daily-sheet"
          element={
            user && (user.role === 'admin' || user.role === 'hr') ? (
              <Layout>
                <DailySheet />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin/menu"
          element={
            user && user.role === 'admin' ? (
              <Layout>
                <MenuManagement />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin/reports"
          element={
            user && (user.role === 'admin' || user.role === 'hr') ? (
              <Layout>
                <Reports />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/admin/settings"
          element={
            user && user.role === 'admin' ? (
              <Layout>
                <Settings />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
