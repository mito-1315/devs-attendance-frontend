import { useState, useEffect } from 'react';
import { Search, FileSpreadsheet, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import API_BASE_URL from '../config/api';


interface HistoryPageProps {
  isDark: boolean;
  onBackToUpload: () => void;
  onNavigateToEventStats: (eventName: string) => void;
}

interface HistoryRecord {
  sheet_name: string;
  sheet_link: string;
  sheet_id: string;
  event_name: string;
  uploaded_by: string;
  uploaded_at: string;
  status: string;
  closed_at?: string;
}

export function HistoryPage({ isDark, onNavigateToEventStats }: HistoryPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const itemsPerPage = 5;

  // Fetch history data on component mount
  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${API_BASE_URL}/history`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch history');
        }

        const data = await response.json();

        if (data.success) {
          setHistoryData(data.data);
        } else {
          throw new Error('Failed to parse history data');
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching history:', err);
        setError(err.message || 'Failed to load history data');
        setLoading(false);
      }
    };

    fetchHistoryData();
  }, []);

  const filteredHistory = historyData.filter(record =>
    record.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.sheet_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.uploaded_by.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.uploaded_at.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredHistory.slice(startIndex, endIndex);

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

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: "#0a1128" }}>
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: "#b91372",
              borderTopColor: "transparent",
            }}
          />
          <p style={{ color: "#f5f0ff", fontSize: "18px", fontWeight: "500" }}>
            Loading history...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: "#0a1128" }}>
        <div className="text-center max-w-md px-4">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: "rgba(248, 113, 113, 0.1)" }}
          >
            <span style={{ color: "#f87171", fontSize: "32px" }}>⚠</span>
          </div>
          <p style={{ color: "#f87171", fontSize: "18px", fontWeight: "500", marginBottom: "8px" }}>
            Error Loading History
          </p>
          <p style={{ color: "#f5f0ff", fontSize: "14px", opacity: 0.8 }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "linear-gradient(135deg, #4a1a4a 0%, #b91372 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
              Event History
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
                placeholder="Search by event name, sheet name, uploader, or date..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="flex-1 bg-transparent outline-none"
                style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
              />
            </div>
          </div>

          {/* History List */}
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
              currentItems.map((record, index) => (
                <div
                  key={record.sheet_id || index}
                  onClick={() => {
                    // Store the sheet_link in localStorage for EventStatsBasics
                    localStorage.setItem('historyEventSheetLink', record.sheet_link);
                    localStorage.setItem('historyEventName', record.event_name);
                    onNavigateToEventStats(record.event_name);
                  }}
                  className="p-4 md:p-5 transition-all hover:scale-[1.01] backdrop-blur-sm cursor-pointer"
                  style={{
                    backgroundColor: isDark ? 'rgba(74, 26, 74, 0.15)' : 'rgba(185, 19, 114, 0.08)',
                    border: `1px solid ${isDark ? 'rgba(74, 26, 74, 0.3)' : 'rgba(185, 19, 114, 0.2)'}`
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Event Name */}
                    <div className="flex-1">
                      <h3
                        className="text-lg mb-1"
                        style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
                      >
                        {record.event_name}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm opacity-70">
                        <span style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}>
                          {formatDate(record.uploaded_at)}
                        </span>
                        <span style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}>
                          {formatTime(record.uploaded_at)}
                        </span>
                        <span style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}>
                          By: {record.uploaded_by}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      {record.status.toLowerCase() === 'active' ? (
                        <>
                          <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />
                          <span
                            className="text-sm px-3 py-1"
                            style={{
                              color: '#22c55e',
                              backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                              border: '1px solid rgba(34, 197, 94, 0.3)'
                            }}
                          >
                            Active
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-5 h-5" style={{ color: '#f59e0b' }} />
                          <span
                            className="text-sm px-3 py-1"
                            style={{
                              color: '#f59e0b',
                              backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                              border: '1px solid rgba(245, 158, 11, 0.3)'
                            }}
                          >
                            {record.status}
                          </span>
                        </>
                      )}
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
    </div>
  );
}