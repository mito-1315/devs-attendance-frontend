import { useEffect, useState } from 'react';
import { getCachedUser } from '../services/auth';
import API_BASE_URL from '../config/api';


interface ProfilePageProps {
  isDark: boolean;
  onBackToUpload?: () => void;
  onNavigateToAttendance: (sessionName: string) => void;
  onNavigateToEventStats: (sessionName: string) => void;
}

interface UserData {
  username: string;
  name: string;
  roll_number: string;
  department: string;
  team: string;
  role: string;
}

interface Session {
  id: string;
  name: string;
  status: 'active' | 'complete';
  sheet_name: string;
  sheet_link: string;
  uploaded_at: string;
  closed_at: string;
}

export function ProfilePage({ isDark, onBackToUpload, onNavigateToAttendance, onNavigateToEventStats }: ProfilePageProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [sessionToClose, setSessionToClose] = useState<Session | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    fetchProfileData();
    fetchSessions();
  }, []);

  const fetchProfileData = async () => {
    try {
      const cachedUser = getCachedUser();
      const username = cachedUser?.username;

      console.log('Cached user from localStorage:', cachedUser);
      console.log('Username extracted:', username);

      if (!username) {
        console.error('No username found in cache');
        setLoading(false);
        return;
      }

      console.log('Request body to send:', { username });

      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();

      console.log('Response from backend:', data);

      if (data.success) {
        setUserData(data.user);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const cachedUser = getCachedUser();
      const username = cachedUser?.username;

      if (!username) {
        console.error('No username found in cache');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/profile/getsession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();

      console.log('Sessions response from backend:', data);

      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const handleCloseSession = (e: React.MouseEvent, session: Session) => {
    e.stopPropagation();
    setSessionToClose(session);
    setShowCloseConfirm(true);
  };

  const handleConfirmClose = async () => {
    if (!sessionToClose) return;
    const cachedUser = getCachedUser();
    const username = cachedUser?.username;
    if (!username) return;

    try {
      setClosing(true);
      const response = await fetch(`${API_BASE_URL}/profile/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, sheet_id: sessionToClose.id }),
      });
      const data = await response.json();

      if (data.success) {
        // Update local state so UI reflects the change immediately
        setSessions(prev =>
          prev.map(s =>
            s.id === sessionToClose.id
              ? { ...s, status: 'complete', closed_at: data.closed_at || '' }
              : s
          )
        );
      } else {
        alert(data.message || 'Failed to close session');
      }
    } catch (error) {
      console.error('Error closing session:', error);
      alert('Failed to close session');
    } finally {
      setClosing(false);
      setShowCloseConfirm(false);
      setSessionToClose(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full p-4 flex items-center justify-center">
        <p style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen w-full p-4 relative overflow-hidden">
        {/* Decorative Background Blobs */}
        <div
          className="absolute top-0 right-0 w-96 h-96 blur-3xl opacity-20"
          style={{
            background: isDark
              ? 'radial-gradient(circle, #4a1a4a 0%, transparent 70%)'
              : 'radial-gradient(circle, #b91372 0%, transparent 70%)'
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 blur-3xl opacity-15"
          style={{
            background: isDark
              ? 'radial-gradient(circle, #b91372 0%, transparent 70%)'
              : 'radial-gradient(circle, #4a1a4a 0%, transparent 70%)'
          }}
        />

        {/* Main Content */}
        <div className="max-w-4xl mx-auto relative z-1 pt-20">
          <div
            className="shadow-2xl p-6 mt-10 md:p-10 backdrop-blur-sm"
            style={{
              backgroundColor: isDark ? 'rgba(10, 17, 40, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              border: `1px solid ${isDark ? 'rgba(74, 26, 74, 0.3)' : 'rgba(185, 19, 114, 0.2)'}`
            }}
          >
            {/* Header */}
            <h1
              className="text-3xl md:text-4xl mb-8"
              style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
            >
              Profile
            </h1>

            {/* User Info Section */}
            <div
              className="p-6 mb-6"
              style={{
                backgroundColor: isDark ? 'rgba(74, 26, 74, 0.2)' : 'rgba(185, 19, 114, 0.1)',
                border: `1px solid ${isDark ? 'rgba(74, 26, 74, 0.3)' : 'rgba(185, 19, 114, 0.2)'}`
              }}
            >{/* First Row: Username, Name, Roll Number */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p
                    className="text-sm opacity-60 mb-1"
                    style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
                  >
                    Username
                  </p>
                  <p
                    className="text-lg"
                    style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
                  >
                    {userData?.username || 'N/A'}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm opacity-60 mb-1"
                    style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
                  >
                    Name
                  </p>
                  <p
                    className="text-lg"
                    style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
                  >
                    {userData?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm opacity-60 mb-1"
                    style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
                  >
                    Roll Number
                  </p>
                  <p
                    className="text-lg"
                    style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
                  >
                    {userData?.roll_number || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Second Row: Department, Role, Team */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p
                    className="text-sm opacity-60 mb-1"
                    style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
                  >
                    Department
                  </p>
                  <p
                    className="text-lg"
                    style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
                  >
                    {userData?.department || 'N/A'}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm opacity-60 mb-1"
                    style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
                  >
                    Role
                  </p>
                  <p
                    className="text-lg"
                    style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
                  >
                    {userData?.role || 'N/A'}
                  </p>
                </div>
                <div>
                  <p
                    className="text-sm opacity-60 mb-1"
                    style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
                  >
                    Team
                  </p>
                  <p
                    className="text-lg"
                    style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
                  >
                    {userData?.team || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Sessions Section */}
            <div>
              <h2
                className="text-xl md:text-2xl mb-4"
                style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
              >
                Sessions Created
              </h2>

              {/* Scrollable Sessions List */}
              <div
                className="overflow-y-auto"
                style={{
                  maxHeight: '400px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: isDark
                    ? '#b91372 rgba(74, 26, 74, 0.2)'
                    : '#4a1a4a rgba(185, 19, 114, 0.1)',
                }}
              >
                <style>
                  {`
                  div::-webkit-scrollbar {
                    width: 8px;
                  }
                  div::-webkit-scrollbar-track {
                    background: ${isDark ? 'rgba(74, 26, 74, 0.2)' : 'rgba(185, 19, 114, 0.1)'};
                  }
                  div::-webkit-scrollbar-thumb {
                    background: ${isDark ? '#b91372' : '#4a1a4a'};
                  }
                  div::-webkit-scrollbar-thumb:hover {
                    background: ${isDark ? '#d01582' : '#5a2a5a'};
                  }
                `}
                </style>

                <div className="space-y-3">
                  {sessions.length === 0 ? (
                    <div
                      className="p-6 text-center"
                      style={{
                        backgroundColor: isDark ? 'rgba(74, 26, 74, 0.15)' : 'rgba(185, 19, 114, 0.08)',
                        border: `1px solid ${isDark ? 'rgba(74, 26, 74, 0.3)' : 'rgba(185, 19, 114, 0.2)'}`,
                      }}
                    >
                      <p
                        className="text-base opacity-60"
                        style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
                      >
                        No sessions created yet
                      </p>
                    </div>
                  ) : (
                    sessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-4 cursor-pointer transition-transform duration-200"
                        onClick={() => {
                          if (session.status === 'active') {
                            onNavigateToAttendance(session.name);
                          } else {
                            onNavigateToEventStats(session.name);
                          }
                        }}
                        style={{
                          backgroundColor: isDark ? 'rgba(74, 26, 74, 0.15)' : 'rgba(185, 19, 114, 0.08)',
                          border: `1px solid ${isDark ? 'rgba(74, 26, 74, 0.3)' : 'rgba(185, 19, 114, 0.2)'}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = isDark ? 'rgba(74, 26, 74, 0.25)' : 'rgba(185, 19, 114, 0.15)';
                          e.currentTarget.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = isDark ? 'rgba(74, 26, 74, 0.15)' : 'rgba(185, 19, 114, 0.08)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-3">
                            <h3
                              className="text-base md:text-lg"
                              style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
                            >
                              {session.name}
                            </h3>
                            <span
                              className="text-xs px-2 py-1"
                              style={{
                                backgroundColor: session.status === 'active'
                                  ? isDark ? 'rgba(74, 185, 27, 0.2)' : 'rgba(74, 185, 27, 0.15)'
                                  : isDark ? 'rgba(74, 26, 74, 0.3)' : 'rgba(185, 19, 114, 0.15)',
                                color: session.status === 'active'
                                  ? isDark ? '#6fd147' : '#4a9c2e'
                                  : isDark ? '#f5f0ff' : '#0a1128'
                              }}
                            >
                              {session.status}
                            </span>
                          </div>
                          <button
                            onClick={(e) => handleCloseSession(e, session)}
                            disabled={session.status === 'complete'}
                            className="px-4 py-2 text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            style={{
                              background: session.status === 'active'
                                ? 'linear-gradient(135deg, #4a1a4a 0%, #b91372 100%)'
                                : isDark ? 'rgba(74, 26, 74, 0.3)' : 'rgba(185, 19, 114, 0.2)',
                              color: '#ffffff',
                              border: 'none',
                              cursor: session.status === 'complete' ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Close
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <p
                            className="text-sm opacity-60"
                            style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
                          >
                            Session ID:
                          </p>
                          <p
                            className="text-sm select-none"
                            style={{
                              color: isDark ? '#b91372' : '#4a1a4a',
                              userSelect: 'none',
                              WebkitUserSelect: 'none',
                              MozUserSelect: 'none',
                              msUserSelect: 'none'
                            }}
                          >
                            {session.id}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Close Session Confirmation Dialog */}
      {showCloseConfirm && sessionToClose && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[100]"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="shadow-2xl p-6 md:p-8 max-w-md mx-4"
            style={{
              backgroundColor: isDark ? 'rgba(10, 17, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              border: `2px solid ${isDark ? 'rgba(74, 26, 74, 0.5)' : 'rgba(185, 19, 114, 0.3)'}`
            }}
          >
            <h2
              className="text-xl md:text-2xl mb-3"
              style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
            >
              Close Session
            </h2>
            <p
              className="text-sm md:text-base opacity-75 mb-6"
              style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
            >
              Are you sure you wanna close the session? If the session is closed once, you can't edit it anymore
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowCloseConfirm(false); setSessionToClose(null); }}
                disabled={closing}
                className="px-4 py-2 md:px-6 md:py-2.5 transition-all hover:scale-105 hover:shadow-lg text-sm md:text-base"
                style={{
                  backgroundColor: isDark ? 'rgba(74, 26, 74, 0.3)' : 'rgba(185, 19, 114, 0.15)',
                  color: isDark ? '#f5f0ff' : '#0a1128',
                  border: `1px solid ${isDark ? 'rgba(74, 26, 74, 0.5)' : 'rgba(185, 19, 114, 0.3)'}`
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClose}
                disabled={closing}
                className="px-4 py-2 md:px-6 md:py-2.5 transition-all hover:scale-105 hover:shadow-lg text-sm md:text-base disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #4a1a4a 0%, #b91372 100%)',
                  color: '#ffffff',
                  border: 'none'
                }}
              >
                {closing ? 'Closing...' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
