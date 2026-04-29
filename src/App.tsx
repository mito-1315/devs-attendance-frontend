import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LoginPage } from "./components/LoginPage";
import { UploadPage } from "./components/UploadPage";
import { AttendancePage } from "./components/AttendancePage";
import { HistoryPage } from "./components/HistoryPage";
import { EventStatsBasics } from "./components/EventStatsBasics";
import { ProfilePage } from "./components/ProfilePage";
import { CreateUserPage } from "./components/CreateUserPage";
import { getAuthState, getCachedUser, logout } from "./services/auth";
import API_BASE_URL from "./config/api";


// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const authState = getAuthState();

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Admin-only Route Component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const authState = getAuthState();

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const user = getCachedUser();
  if (!user?.isAdmin) {
    return <Navigate to="/upload" replace />;
  }

  return <>{children}</>;
}

// Layout Component with Back Button
function Layout({ children }: { children: React.ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const authState = getAuthState();
    setIsLoggedIn(authState.isAuthenticated);
    setIsInitializing(false);
  }, []);

  const isLoginPage = location.pathname === "/login";
  const isUploadPage = location.pathname === "/upload";
  const isAttendancePage = location.pathname === "/attendance";
  const isHistoryPage = location.pathname === "/history";
  const isSessionsPage = location.pathname === "/session";
  const isEventStatsPage = location.pathname === "/eventstats";
  const isProfilePage = location.pathname === "/profile";
  const isCreateUserPage = location.pathname === "/createuser";

  const showBackButton = !isLoginPage && !isUploadPage;

  const clearAttendanceCache = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/cache`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // Clear all cache
      });

      if (!response.ok) {
        console.error('Failed to clear cache');
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  const handleBackToUpload = async () => {
    // Clear cache when leaving attendance page
    if (isAttendancePage) {
      await clearAttendanceCache();
      // Check where the user came from via location state
      const state = location.state as { from?: string };
      const from = state?.from || "/upload";
      setShowBackConfirm(false);
      navigate(from);
    } else {
      setShowBackConfirm(false);
      navigate("/upload");
    }
  };

  const handleBackToHistory = () => {
    setShowBackConfirm(false);
    navigate("/history");
  };

  const handleBackClick = () => {
    if (isAttendancePage) {
      setShowBackConfirm(true);
      return;
    }

    if (isEventStatsPage) {
      // Check where the user came from via location state
      const state = location.state as { from?: string };
      const from = state?.from || "/history";
      navigate(from);
      return;
    }

    if (isHistoryPage || isProfilePage || isCreateUserPage) {
      handleBackToUpload();
    }
  };

  // Show loading screen while checking authentication
  if (isInitializing) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ backgroundColor: "#0a1128" }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: "#b91372",
              borderTopColor: "transparent",
            }}
          />
          <p style={{ color: "#f5f0ff" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full transition-colors"
      style={{ backgroundColor: "#0a1128" }}
    >
      {showBackButton && isLoggedIn && (
        <div className="fixed top-16 left-4 z-50">
          <button
            onClick={handleBackClick}
            className="flex items-center justify-center gap-2 w-12 h-12 md:w-auto md:h-auto md:px-4 md:py-2 transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #4a1a4a 0%, #b91372 100%)",
              color: "#ffffff",
            }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden md:inline">Back</span>
          </button>
        </div>
      )}

      {/* Render children (pages) */}
      {children}

      {showBackConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="p-6 rounded-lg shadow-lg"
            style={{ backgroundColor: "#1a1a2e" }}
          >
            <p style={{ color: "#f5f0ff" }} className="mb-4">
              Are you sure you want to go back?
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleBackToUpload}
                className="px-4 py-2 md:px-6 md:py-2.5 transition-all hover:scale-105 hover:shadow-lg text-sm md:text-base"
                style={{
                  background: "linear-gradient(135deg, #4a1a4a 0%, #b91372 100%)",
                  color: "#ffffff",
                  border: "none",
                }}
              >
                Confirm
              </button>
              <button
                onClick={() => setShowBackConfirm(false)}
                className="px-4 py-2 md:px-6 md:py-2.5 transition-all hover:scale-105 hover:shadow-lg text-sm md:text-base"
                style={{
                  backgroundColor: "#4a1a4a",
                  color: "#f5f0ff",
                  border: "none",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main App Component with Router
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// App Content with Router functionality
function AppContent() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/upload");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Routes>
      <Route path="/login" element={
        <Layout>
          <LoginPage isDark={true} onLogin={handleLogin} />
        </Layout>
      } />

      <Route path="/upload" element={
        <ProtectedRoute>
          <Layout>
            <UploadPageWrapper onLogout={handleLogout} />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/attendance" element={
        <ProtectedRoute>
          <Layout>
            <AttendancePageWrapper />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/history" element={
        <ProtectedRoute>
          <Layout>
            <HistoryPageWrapper />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/session" element={<Navigate to="/upload" replace />} />

      <Route path="/eventstats" element={
        <ProtectedRoute>
          <Layout>
            <EventStatsPageWrapper />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <ProfilePageWrapper />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/createuser" element={
        <AdminRoute>
          <Layout>
            <CreateUserPageWrapper />
          </Layout>
        </AdminRoute>
      } />

      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

// Wrapper components to handle navigation
function UploadPageWrapper({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();

  return (
    <UploadPage
      isDark={true}
      onLogout={onLogout}
    />
  );
}

function AttendancePageWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { eventName?: string; from?: string };
  const eventName = state?.eventName || "";
  const from = state?.from || "/upload";

  return (
    <AttendancePage
      isDark={true}
      onBackToUpload={() => navigate(from)}
      eventName={eventName}
    />
  );
}

function HistoryPageWrapper() {
  const navigate = useNavigate();

  return (
    <HistoryPage
      isDark={true}
      onBackToUpload={() => navigate("/upload")}
      onNavigateToEventStats={(eventName) => navigate("/eventstats", { state: { eventName, from: '/history' } })}
    />
  );
}

function EventStatsPageWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { eventName?: string; from?: string };
  const eventName = state?.eventName || "";
  const from = state?.from || "/history";

  return (
    <EventStatsBasics
      isDark={true}
      onBackToHistory={() => navigate(from)}
      eventName={eventName}
    />
  );
}

function ProfilePageWrapper() {
  const navigate = useNavigate();

  return (
    <ProfilePage
      isDark={true}
      onBackToUpload={() => navigate("/upload")}
      onNavigateToAttendance={(sessionName) => navigate("/attendance", { state: { eventName: sessionName, from: '/profile' } })}
      onNavigateToEventStats={(sessionName) => navigate("/eventstats", { state: { eventName: sessionName, from: '/profile' } })}
    />
  );
}

function CreateUserPageWrapper() {
  return <CreateUserPage isDark={true} />
}