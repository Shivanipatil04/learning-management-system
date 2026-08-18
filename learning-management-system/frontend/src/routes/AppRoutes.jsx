import { Navigate, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';

import LoginPage from '../features/auth/pages/LoginPage';
import SignupPage from '../features/auth/pages/SignupPage';
import DashboardPage from '../features/auth/pages/DashboardPage';

import MainLayout from '../components/layout/MainLayout';
import PrivateRoute from './PrivateRoute';

import CoursesPage from '../features/courses/pages/CoursesPage';
import CourseDetailsPage from '../features/courses/pages/CourseDetailsPage';
import UploadVideoPage from '../features/courses/pages/UploadVideoPage';

import BrowseCourses from '../features/student/pages/BrowseCourses';
import StudentCourseDetails from '../features/student/pages/CourseDetails';
import StudentEnrollmentsPage from '../features/student/pages/StudentEnrollmentsPage';
import Reviews from '../features/student/pages/Reviews';

import ContractsManager from '../features/coachingClassAdmin/pages/ContractsManager';
import MyContract from '../features/teacher/pages/MyContract';

import QuizzesRouter from '../features/quizzes/pages/QuizzesRouter';

const PlaceholderPage = ({ title }) => (
  <div className="dashboard-shell">
    <div className="dashboard-card">
      <h1>{title}</h1>
      <p>Coming soon.</p>
    </div>
  </div>
);

const CourseDetailsRoute = () => {
  const { user } = useSelector((state) => state.auth);

  return user?.userType === 'student'
    ? <StudentCourseDetails />
    : <CourseDetailsPage />;
};

const MyCoursesRoute = () => {
  const { user } = useSelector((state) => state.auth);
  return user?.userType === 'student' ? <StudentEnrollmentsPage /> : <CoursesPage />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? '/dashboard' : '/login'}
            replace
          />
        }
      />

      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage />
          )
        }
      />

      <Route
        path="/signup"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <SignupPage />
          )
        }
      />

      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />

        {/* Course Management */}
        <Route
          path="/my-courses"
          element={<MyCoursesRoute />}
        />

        <Route
          path="/my-content"
          element={<CoursesPage manage />}
        />

        <Route
          path="/courses"
          element={<CoursesPage />}
        />

        <Route
          path="/course-management"
          element={<CoursesPage manage />}
        />

        <Route
          path="/courses/:id"
          element={<CourseDetailsRoute />}
        />

        <Route
          path="/upload-video"
          element={<UploadVideoPage />}
        />

        {/* Student */}
        <Route
          path="/browse-courses"
          element={<BrowseCourses />}
        />

        <Route
          path="/quizzes"
          element={<QuizzesRouter />}
        />

        <Route
          path="/reviews"
          element={<Reviews />}
        />

        <Route
          path="/certificates"
          element={<PlaceholderPage title="My Certificates" />}
        />

        <Route
          path="/profile"
          element={<PlaceholderPage title="Profile" />}
        />

        <Route
          path="/my-progress"
          element={<PlaceholderPage title="My Progress" />}
        />

        <Route
          path="/wishlist"
          element={<PlaceholderPage title="Wishlist" />}
        />

        {/* Contract Management */}
        <Route
          path="/contracts"
          element={<ContractsManager />}
        />

        <Route
          path="/my-contract"
          element={<MyContract />}
        />

        {/* Other Modules */}
        <Route
          path="/live-sessions"
          element={<PlaceholderPage title="Live Sessions" />}
        />

        <Route
          path="/earnings"
          element={<PlaceholderPage title="Earnings" />}
        />

        <Route
          path="/teachers"
          element={<PlaceholderPage title="Teachers" />}
        />

        <Route
          path="/students"
          element={<PlaceholderPage title="Students" />}
        />

        <Route
          path="/users"
          element={<PlaceholderPage title="Users" />}
        />

        <Route
          path="/content-approval"
          element={<PlaceholderPage title="Content Approval" />}
        />

        <Route
          path="/analytics"
          element={<PlaceholderPage title="Analytics" />}
        />

        <Route
          path="/revenue"
          element={<PlaceholderPage title="Revenue" />}
        />

        <Route
          path="/settings"
          element={<PlaceholderPage title="Settings" />}
        />

        <Route
          path="/live-stream"
          element={<PlaceholderPage title="Live Stream" />}
        />

        <Route
          path="/live-class"
          element={<PlaceholderPage title="Live Class" />}
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
