import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginPage from '../features/auth/pages/LoginPage';
import SignupPage from '../features/auth/pages/SignupPage';
import DashboardPage from '../features/auth/pages/DashboardPage';
import MainLayout from '../components/layout/MainLayout';
import PrivateRoute from './PrivateRoute';

const PlaceholderPage = ({ title }) => (
  <div className="dashboard-shell">
    <div className="dashboard-card">
      <h1>{title}</h1>
      <p>Coming soon.</p>
    </div>
  </div>
);

const AppRoutes = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage />}
      />

      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/my-courses" element={<PlaceholderPage title="My Courses" />} />
        <Route path="/wishlist" element={<PlaceholderPage title="Wishlist" />} />
        <Route path="/certificates" element={<PlaceholderPage title="Certificates" />} />
        <Route path="/my-content" element={<PlaceholderPage title="My Content" />} />
        <Route path="/upload-video" element={<PlaceholderPage title="Upload Video" />} />
        <Route path="/live-sessions" element={<PlaceholderPage title="Live Sessions" />} />
        <Route path="/earnings" element={<PlaceholderPage title="Earnings" />} />
        <Route path="/teachers" element={<PlaceholderPage title="Teachers" />} />
        <Route path="/contracts" element={<PlaceholderPage title="Contracts" />} />
        <Route path="/content-approval" element={<PlaceholderPage title="Content Approval" />} />
        <Route path="/analytics" element={<PlaceholderPage title="Analytics" />} />
        <Route path="/revenue" element={<PlaceholderPage title="Revenue" />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
