import { useState } from 'react';
import { Search, FileSpreadsheet, ChevronLeft, ChevronRight } from 'lucide-react';

interface SessionPageProps {
  isDark: boolean;
  onNavigateToAttendance: (eventName: string) => void;
}

interface SessionRecord {
  id: string;
  eventName: string;
  date: string;
  time: string;
}

const mockSessionData: SessionRecord[] = [
  {
    id: '1',
    eventName: 'Annual Conference 2026',
    date: 'Feb 1, 2026',
    time: '09:00 AM'
  },
  {
    id: '2',
    eventName: 'Team Building Workshop',
    date: 'Jan 28, 2026',
    time: '02:30 PM'
  },
  {
    id: '3',
    eventName: 'Product Launch Event',
    date: 'Jan 25, 2026',
    time: '11:00 AM'
  },
  {
    id: '4',
    eventName: 'Monthly All Hands Meeting',
    date: 'Jan 20, 2026',
    time: '10:00 AM'
  },
  {
    id: '5',
    eventName: 'Training Session - Q1',
    date: 'Jan 15, 2026',
    time: '03:00 PM'
  },
  {
    id: '6',
    eventName: 'Client Presentation',
    date: 'Jan 10, 2026',
    time: '01:00 PM'
  },
  {
    id: '7',
    eventName: 'Developer Meetup',
    date: 'Jan 5, 2026',
    time: '06:00 PM'
  },
  {
    id: '8',
    eventName: 'Sales Summit',
    date: 'Dec 28, 2025',
    time: '09:30 AM'
  },
  {
    id: '9',
    eventName: 'Holiday Party',
    date: 'Dec 20, 2025',
    time: '07:00 PM'
  },
  {
    id: '10',
    eventName: 'Board Meeting',
    date: 'Dec 15, 2025',
    time: '02:00 PM'
  }
];

export function SessionPage({ isDark, onNavigateToAttendance }: SessionPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);
  const [code, setCode] = useState('');
  const itemsPerPage = 5;

  const filteredSessions = mockSessionData.filter(record =>
    record.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.time.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredSessions.slice(startIndex, endIndex);

  // Reset to page 1 when search query changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleSessionClick = (session: SessionRecord) => {
    setSelectedSession(session);
    setShowCodeDialog(true);
  };

  const handleCodeSubmit = () => {
    if (selectedSession && code) {
      onNavigateToAttendance(selectedSession.eventName);
      setShowCodeDialog(false);
      setCode('');
    }
  };

  return (
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
      <div className="max-w-5xl mx-auto relative z-10 pt-24">
        <div 
          className="shadow-2xl p-8 mt-7 md:p-12 backdrop-blur-sm relative z-0"
          style={{
            backgroundColor: isDark ? 'rgba(10, 17, 40, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: `1px solid ${isDark ? 'rgba(74, 26, 74, 0.3)' : 'rgba(185, 19, 114, 0.2)'}`
          }}
        >
          

          <div className="text-center mb-4">
            <h1 
              className="text-3xl md:text-4xl mb-2"
              style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
            >
              Active Sessions
            </h1>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div 
              className="flex items-center gap-3 p-4 backdrop-blur-sm"
              style={{
                backgroundColor: isDark ? 'rgba(74, 26, 74, 0.1)' : 'rgba(185, 19, 114, 0.05)',
                border: `1px solid ${isDark ? 'rgba(74, 26, 74, 0.3)' : 'rgba(185, 19, 114, 0.2)'}`
              }}
            >
              <Search 
                className="w-5 h-5 opacity-50" 
                style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
              />
              <input
                type="text"
                placeholder="Search by event name, date, or time..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="flex-1 bg-transparent outline-none"
                style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
              />
            </div>
          </div>

          {/* Sessions List */}
          <div 
            className="space-y-3 overflow-y-auto overflow-x-hidden" 
            style={{ 
              minHeight: '400px', 
              maxHeight: '400px',
              scrollbarColor: isDark ? 'rgba(185, 19, 114, 0.2) transparent' : 'rgba(185, 19, 114, 0.1) transparent',
              scrollbarWidth: 'thin'
            }}
          >
            {currentItems.length > 0 ? (
              currentItems.map((record) => (
                <div
                  key={record.id}
                  className="p-4 md:p-5 transition-all hover:scale-[1.01] backdrop-blur-sm"
                  style={{
                    backgroundColor: isDark ? 'rgba(74, 26, 74, 0.15)' : 'rgba(185, 19, 114, 0.08)',
                    border: `1px solid ${isDark ? 'rgba(74, 26, 74, 0.3)' : 'rgba(185, 19, 114, 0.2)'}`
                  }}
                  onClick={() => handleSessionClick(record)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Event Name */}
                    <div className="flex-1">
                      <h3 
                        className="text-lg mb-1"
                        style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
                      >
                        {record.eventName}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm opacity-70">
                        <span style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}>
                          {record.date}
                        </span>
                        <span style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}>
                          {record.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div 
                className="text-center py-12 opacity-60"
                style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
              >
                <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>No events found matching your search</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 gap-4">
              <button
                onClick={handlePreviousPage}
                className="p-2 transition-all hover:scale-105"
                style={{
                  backgroundColor: isDark ? 'rgba(74, 26, 74, 0.2)' : 'rgba(185, 19, 114, 0.1)',
                  color: isDark ? '#f5f0ff' : '#0a1128'
                }}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                className="p-2 transition-all hover:scale-105"
                style={{
                  backgroundColor: isDark ? 'rgba(74, 26, 74, 0.2)' : 'rgba(185, 19, 114, 0.1)',
                  color: isDark ? '#f5f0ff' : '#0a1128'
                }}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Code Dialog */}
      {showCodeDialog && selectedSession && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-[100]"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setShowCodeDialog(false)}
        >
          <div 
            className="shadow-2xl p-6 md:p-8 max-w-md mx-4 w-full"
            style={{
              backgroundColor: isDark ? 'rgba(10, 17, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              border: `2px solid ${isDark ? 'rgba(74, 26, 74, 0.5)' : 'rgba(185, 19, 114, 0.3)'}`
            }}
            onClick={e => e.stopPropagation()}
          >
            <h2 
              className="text-xl md:text-2xl mb-3"
              style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
            >
              Enter Access Code
            </h2>
            <p 
              className="text-sm md:text-base opacity-75 mb-4"
              style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
            >
              Session: <strong>{selectedSession.eventName}</strong>
            </p>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full p-3 mb-4 bg-transparent outline-none text-sm md:text-base"
              placeholder="Enter code..."
              style={{
                color: isDark ? '#f5f0ff' : '#0a1128',
                backgroundColor: isDark ? 'rgba(74, 26, 74, 0.2)' : 'rgba(185, 19, 114, 0.1)',
                border: `1px solid ${isDark ? 'rgba(74, 26, 74, 0.3)' : 'rgba(185, 19, 114, 0.3)'}`
              }}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCodeDialog(false)}
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
                onClick={handleCodeSubmit}
                className="px-4 py-2 md:px-6 md:py-2.5 transition-all hover:scale-105 hover:shadow-lg text-sm md:text-base"
                style={{
                  background: isDark 
                    ? 'linear-gradient(135deg, #4a1a4a 0%, #b91372 100%)'
                    : 'linear-gradient(135deg, #b91372 0%, #4a1a4a 100%)',
                  color: '#ffffff',
                  border: 'none'
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}