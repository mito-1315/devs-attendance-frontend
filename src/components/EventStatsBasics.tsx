import { useState, useEffect } from 'react';
import { Search, Users, UserCheck, UserX, UserPlus, Download, Copy, Check, Filter } from 'lucide-react';
import API_BASE_URL from '../config/api';

interface EventStatsBasicsProps {
  isDark: boolean;
  onBackToHistory: () => void;
  eventName: string;
}

interface Student {
  id: number;
  rollNumber: string;
  name: string;
  department: string;
  isPresent: boolean;
}

export function EventStatsBasics({ isDark, onBackToHistory, eventName }: EventStatsBasicsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'present' | 'absent'>('all');
  const [students, setStudents] = useState<Student[]>([]);
  const [registered, setRegistered] = useState(0);
  const [presentCount, setPresentCount] = useState(0);
  const [onSpotCount, setOnSpotCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Fetch event data on component mount
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        setError('');

        // Get sheet_link from localStorage
        const sheetLink = localStorage.getItem('historyEventSheetLink');

        if (!sheetLink) {
          setError('No sheet link found. Please select an event from history.');
          setLoading(false);
          return;
        }

        // Extract spreadsheet ID from link
        const idMatch = sheetLink.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (!idMatch) {
          setError('Invalid sheet link format');
          setLoading(false);
          return;
        }

        const extractedSpreadsheetId = idMatch[1];
        setSpreadsheetId(extractedSpreadsheetId);

        // Call /history/event endpoint to fetch and cache event data
        console.log('Fetching event data from history...');
        const response = await fetch(
          `${API_BASE_URL}/history/event?sheet_link=${encodeURIComponent(sheetLink)}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch event data');
        }

        const data = await response.json();
        console.log('Event data received:', data);

        if (data.success) {
          setRegistered(data.data.registered);
          setPresentCount(data.data.presentCount);
          setOnSpotCount(data.data.onSpotCount);
          setAbsentCount(data.data.absentCount);
          setStudents(data.data.students);
          console.log('Event data loaded successfully');
        } else {
          throw new Error('Failed to parse event data');
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching event data:', err);
        setError(err.message || 'Failed to load event data');
        setLoading(false);
      }
    };

    fetchEventData();
  }, []);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(sessionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy session code:', err);
    }
  };

  const handleExport = async () => {
    try {
      if (!spreadsheetId) {
        alert('No spreadsheet ID found. Please ensure data is loaded.');
        return;
      }

      // Call export endpoint
      const response = await fetch(
        `${API_BASE_URL}/history/event/export?spreadsheet_id=${spreadsheetId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to export attendance');
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance_export_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('Export successful');
    } catch (err: any) {
      console.error('Error exporting attendance:', err);
      alert(`Failed to export attendance: ${err.message}`);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAttendance =
      attendanceFilter === 'all' ? true :
        attendanceFilter === 'present' ? student.isPresent :
          !student.isPresent;

    return matchesSearch && matchesAttendance;
  });

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center" style={{ backgroundColor: "#0a1128" }}>
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: "#b91372",
              borderTopColor: "transparent",
            }}
          />
          <p style={{ color: "#f5f0ff", fontSize: "18px", fontWeight: "500" }}>
            Loading event data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center" style={{ backgroundColor: "#0a1128" }}>
        <div className="text-center max-w-md px-4">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: "rgba(248, 113, 113, 0.1)" }}
          >
            <span style={{ color: "#f87171", fontSize: "32px" }}>⚠</span>
          </div>
          <p style={{ color: "#f87171", fontSize: "18px", fontWeight: "500", marginBottom: "8px" }}>
            Error Loading Event
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
    <div className="h-screen w-full flex items-center justify-center px-4 py-20 md:py-8 overflow-hidden relative">
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

      <div
        className="w-full max-w-3xl relative mt-20 z-10 shadow-2xl px-4 py-3 md:px-6 md:py-2 backdrop-blur-sm flex flex-col gap-4 md:gap-5"
        style={{
          backgroundColor: isDark ? 'rgba(10, 17, 40, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          border: `1px solid ${isDark ? 'rgba(74, 26, 74, 0.3)' : 'rgba(185, 19, 114, 0.2)'}`,
          maxHeight: 'calc(100vh - 120px)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-xl md:text-2xl truncate max-w-full"
              style={{
                color: isDark ? '#f5f0ff' : '#0a1128',
                fontSize: eventName.length > 30 ? 'clamp(1rem, 4vw, 1.5rem)' : undefined
              }}
            >
              {eventName}
            </h1>
            <p
              className="text-sm md:text-base opacity-60 mt-1"
              style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
            >
              Attendees of the Event
            </p>
          </div>


        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <div
            className="p-2 md:p-3"
            style={{
              backgroundColor: isDark ? 'rgba(74, 26, 74, 0.2)' : 'rgba(185, 19, 114, 0.1)',
              border: `1px solid ${isDark ? 'rgba(74, 26, 74, 0.3)' : 'rgba(185, 19, 114, 0.3)'}`
            }}
          >
            <div className="flex items-center gap-1 md:gap-1.5 mb-1">
              <Users className="w-4 h-4 md:w-5 md:h-5" style={{ color: isDark ? '#b91372' : '#4a1a4a' }} />
              <p className="text-xs opacity-60" style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}>Registered</p>
            </div>
            <p className="text-xl md:text-2xl font-semibold" style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}>{registered}</p>
          </div>
          <div
            className="p-2 md:p-3"
            style={{
              backgroundColor: isDark ? 'rgba(74, 26, 74, 0.2)' : 'rgba(185, 19, 114, 0.1)',
              border: `1px solid ${isDark ? 'rgba(74, 26, 74, 0.3)' : 'rgba(185, 19, 114, 0.3)'}`
            }}
          >
            <div className="flex items-center gap-1 md:gap-1.5 mb-1">
              <UserPlus className="w-4 h-4 md:w-5 md:h-5" style={{ color: isDark ? '#fbbf24' : '#f59e0b' }} />
              <p className="text-xs opacity-60" style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}>On-Spot</p>
            </div>
            <p className="text-xl md:text-2xl font-semibold" style={{ color: isDark ? '#fbbf24' : '#f59e0b' }}>{onSpotCount}</p>
          </div>
          <div
            className="p-2 md:p-3"
            style={{
              backgroundColor: isDark ? 'rgba(74, 26, 74, 0.2)' : 'rgba(185, 19, 114, 0.1)',
              border: `1px solid ${isDark ? 'rgba(74, 26, 74, 0.3)' : 'rgba(185, 19, 114, 0.3)'}`
            }}
          >
            <div className="flex items-center gap-1 md:gap-1.5 mb-1">
              <UserCheck className="w-4 h-4 md:w-5 md:h-5" style={{ color: isDark ? '#4ade80' : '#22c55e' }} />
              <p className="text-xs opacity-60" style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}>Present</p>
            </div>
            <p className="text-xl md:text-2xl font-semibold" style={{ color: isDark ? '#4ade80' : '#22c55e' }}>{presentCount}</p>
          </div>
          <div
            className="p-2 md:p-3"
            style={{
              backgroundColor: isDark ? 'rgba(74, 26, 74, 0.2)' : 'rgba(185, 19, 114, 0.1)',
              border: `1px solid ${isDark ? 'rgba(74, 26, 74, 0.3)' : 'rgba(185, 19, 114, 0.3)'}`
            }}
          >
            <div className="flex items-center gap-1 md:gap-1.5 mb-1">
              <UserX className="w-4 h-4 md:w-5 md:h-5" style={{ color: isDark ? '#f87171' : '#ef4444' }} />
              <p className="text-xs opacity-60" style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}>Absent</p>
            </div>
            <p className="text-xl md:text-2xl font-semibold" style={{ color: isDark ? '#f87171' : '#ef4444' }}>{absentCount}</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="search"
              className="block mb-2 text-sm md:text-base opacity-75"
              style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
            >
              Search Student
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 opacity-50"
                style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
              />
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by roll number..."
                className="w-full pl-11 md:pl-14 pr-3 md:pr-4 py-2.5 md:py-3 transition-all focus:outline-none focus:ring-2 text-sm md:text-base"
                style={{
                  backgroundColor: isDark ? 'rgba(74, 26, 74, 0.2)' : 'rgba(185, 19, 114, 0.1)',
                  color: isDark ? '#f5f0ff' : '#0a1128',
                  border: isDark ? '1px solid rgba(74, 26, 74, 0.3)' : '1px solid rgba(185, 19, 114, 0.3)'
                }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="attendanceFilter"
              className="block mb-2 text-sm md:text-base opacity-75"
              style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
            >
              Filter by Attendance
            </label>
            <div className="relative">
              <Filter
                className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 opacity-50"
                style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
              />
              <select
                id="attendanceFilter"
                value={attendanceFilter}
                onChange={(e) => setAttendanceFilter(e.target.value as 'all' | 'present' | 'absent')}
                className="w-full pl-11 md:pl-14 pr-3 md:pr-4 py-2.5 md:py-3 transition-all focus:outline-none focus:ring-2 text-sm md:text-base cursor-pointer appearance-none"
                style={{
                  backgroundColor: isDark ? 'rgba(74, 26, 74, 0.2)' : 'rgba(185, 19, 114, 0.1)',
                  color: isDark ? '#f5f0ff' : '#0a1128',
                  border: isDark ? '1px solid rgba(74, 26, 74, 0.3)' : '1px solid rgba(185, 19, 114, 0.3)',
                }}
              >
                <option value="all">All Students</option>
                <option value="present">Present Only</option>
                <option value="absent">Absent Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div
          className="overflow-hidden flex flex-col flex-1"
          style={{
            backgroundColor: isDark ? 'rgba(26, 34, 56, 0.5)' : 'rgba(255, 255, 255, 0.5)',
            border: `2px solid ${isDark ? 'rgba(74, 26, 74, 0.4)' : 'rgba(185, 19, 114, 0.3)'}`
          }}
        >
          {/* Table Header */}
          <div
            className="grid grid-cols-2 p-3 md:p-4"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #4a1a4a 0%, #b91372 100%)'
                : 'linear-gradient(135deg, #b91372 0%, #4a1a4a 100%)',
              color: '#ffffff',
              borderBottom: `2px solid ${isDark ? 'rgba(74, 26, 74, 0.5)' : 'rgba(185, 19, 114, 0.4)'}`
            }}
          >
            <div className="text-sm md:text-base flex items-center justify-center border-r" style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}>Name</div>
            <div className="text-sm md:text-base flex items-center justify-center">Roll Number</div>
          </div>

          {/* Table Body */}
          <div
            className="overflow-y-auto flex-1 custom-scrollbar"
            style={{
              maxHeight: '250px'
            }}
          >
            <style>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: ${isDark ? 'rgba(10, 17, 40, 0.5)' : 'rgba(185, 19, 114, 0.1)'};
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: ${isDark ? 'rgba(185, 19, 114, 0.6)' : 'rgba(74, 26, 74, 0.5)'};
                border-radius: 0;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: ${isDark ? 'rgba(185, 19, 114, 0.8)' : 'rgba(74, 26, 74, 0.7)'};
              }
            `}</style>
            {filteredStudents.map((student, index) => (
              <div
                key={student.id}
                className="grid grid-cols-2"
                style={{
                  borderTop: index === 0 ? 'none' : `1px solid ${isDark ? 'rgba(74, 26, 74, 0.4)' : 'rgba(185, 19, 114, 0.2)'}`,
                  color: isDark ? '#f5f0ff' : '#0a1128',
                  backgroundColor: student.isPresent
                    ? (isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)')
                    : (isDark ? 'rgba(10, 17, 40, 0.3)' : 'rgba(255, 255, 255, 0.3)'),
                  minHeight: '60px'
                }}
              >
                <div className="flex items-center justify-center text-sm md:text-base border-r px-2 py-3 md:py-4" style={{ borderColor: isDark ? 'rgba(74, 26, 74, 0.3)' : 'rgba(185, 19, 114, 0.2)' }}>
                  {student.name}
                </div>
                <div className="flex items-center justify-center text-sm md:text-base px-2 py-3 md:py-4">
                  {student.rollNumber}
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={handleExport}
          className="w-full py-2 transition-all hover:scale-105 hover:shadow-lg text-white"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #4a1a4a 0%, #b91372 100%)'
              : 'linear-gradient(135deg, #b91372 0%, #4a1a4a 100%)'
          }}
        >
          <div className="flex items-center justify-center gap-2">
            <Download className="w-5 h-5" />
            <span>Export</span>
          </div>
        </button>
      </div>
    </div>
  );
}