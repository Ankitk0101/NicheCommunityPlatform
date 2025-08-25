import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CommunityProvider } from './contexts/CommunityContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { WebSocketProvider } from './hooks/useWebSocket';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import Communities from './pages/Communities';
import CommunityDetail from './pages/CommunityDetail';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
// import ForgotPassword from './pages/ForgotPassword';
// import ResetPassword from './pages/ResetPassword';

import './styles/globals.css';

// Guards
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return currentUser ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  return !currentUser ? children : <Navigate to="/" replace />;
};

function AppContent() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="min-h-screen">
          <Routes>
            {/* Public (always accessible) */}
            <Route path="/" element={<Home />} />

            {/* Auth pages (public-only) */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            {/* <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password/:token"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            /> */}

            {/* Protected */}
            <Route
              path="/communities"
              element={
                <ProtectedRoute>
                  <Communities />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feed"
              element={
                <ProtectedRoute>
                  <Feed />
                </ProtectedRoute>
              }
            />
            <Route
              path="/c/:communityId"
              element={
                <ProtectedRoute>
                  <CommunityDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/post/:postId"
              element={
                <ProtectedRoute>
                  <PostDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CommunityProvider>
        <WebSocketProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </WebSocketProvider>
      </CommunityProvider>
    </AuthProvider>
  );
}