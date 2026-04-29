import { useState, useEffect } from 'react';
import { Search, Users, UserCheck, UserX, Save, UserPlus, Download, Copy, Check } from 'lucide-react';
import { getCachedUser } from '../services/auth';
import API_BASE_URL from '../config/api';

interface AttendancePageProps {
  isDark: boolean;
  onBackToUpload: () => void;
  eventName: string;
}

interface Student {
  id: number;
  rollNumber: string;
  name?: string;
  department?: string;
  isPresent: boolean;
  status: string;
  isOnSpot?: boolean;
}

export function AttendancePage({ isDark, onBackToUpload, eventName }: AttendancePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCommitConfirm, setShowCommitConfirm] = useState(false);
  const [showAddNewModal, setShowAddNewModal] = useState(false);
  const [nextId, setNextId] = useState(1);
  const [copied, setCopied] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    rollNumber: '',
    department: '',
    emailId: ''
  });
  const [sessionCode] = useState(() => `#${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  const [students, setStudents] = useState<Student[]>([]);
  const [registered, setRegistered] = useState(0);
  const [presentCount, setPresentCount] = useState(0); // Present count from sheet
  const [absentCount, setAbsentCount] = useState(0); // Absent count from sheet
  const [onSpotCount, setOnSpotCount] = useState(0); // On-spot count from sheet
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [spreadsheetId, setSpreadsheetId] = useState('');

  // Fetch attendance data on component mount
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        setError('');

        // Get sheet_link from localStorage
        const sheetLink = localStorage.getItem('currentSheetLink');

        if (!sheetLink) {
          setError('No sheet link found. Please upload a sheet first.');
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

        // STEP 1: Call /attendance endpoint to fetch and cache sheet information
        console.log('Fetching and caching sheet information...');
        const infoResponse = await fetch(
          `${API_BASE_URL}/attendance?sheet_link=${encodeURIComponent(sheetLink)}`
        );

        if (!infoResponse.ok) {
          const errorData = await infoResponse.json();
          throw new Error(errorData.message || 'Failed to fetch sheet information');
        }

        const infoData = await infoResponse.json();
        console.log('Sheet information cached:', infoData.cached ? 'from cache' : 'freshly fetched');

        // STEP 2: Call /display endpoint to get formatted data
        console.log('Fetching display data...');
        const displayResponse = await fetch(
          `${API_BASE_URL}/attendance/display?spreadsheet_id=${extractedSpreadsheetId}`
        );

        if (!displayResponse.ok) {
          const errorData = await displayResponse.json();
          throw new Error(errorData.message || 'Failed to fetch display data');
        }

        const displayData = await displayResponse.json();
        console.log('Display data received:', displayData);

        if (displayData.success) {
          setRegistered(displayData.data.registered);
          setPresentCount(displayData.data.presentCount || 0);
          setOnSpotCount(displayData.data.onSpotCount || 0);
          // Transform backend data to match Student interface
          const transformedStudents = displayData.data.students.map((student: any) => ({
            id: student.id,
            rollNumber: student.rollNumber,
            status: student.status,
            isPresent: student.status.toLowerCase() === 'present',
            isOnSpot: false
          }));
          setStudents(transformedStudents);
          setNextId(transformedStudents.length + 1);
          console.log('Attendance data loaded successfully');
        } else {
          throw new Error('Failed to parse display data');
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching attendance data:', err);
        setError(err.message || 'Failed to load attendance data');
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  const handleCopyCode = () => {
    // Fallback method for copying text (compatible with all browsers)
    const textArea = document.createElement('textarea');
    textArea.value = sessionCode;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }

    document.body.removeChild(textArea);
  };

  const toggleAttendance = (id: number) => {
    setStudents(students.map(student => {
      if (student.id === id) {
        const newIsPresent = !student.isPresent;
        return {
          ...student,
          isPresent: newIsPresent,
          status: newIsPresent ? 'Present' : 'Absent'
        };
      }
      return student;
    }));
  };

  const handleCommit = () => {
    setShowCommitConfirm(true);
  };

  const handleConfirmCommit = async () => {
    try {
      // Get username from cached user
      const user = getCachedUser();
      if (!user || !user.username) {
        alert('User not authenticated. Please login again.');
        setShowCommitConfirm(false);
        return;
      }

      // Get all students marked as present
      const presentStudents = students.filter(student => student.isPresent);
      const rollNumbers = presentStudents.map(student => student.rollNumber);

      if (rollNumbers.length === 0) {
        setShowCommitConfirm(false);
        return;
      }

      // Call backend to commit attendance
      const response = await fetch(`${API_BASE_URL}/attendance/commit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spreadsheet_id: spreadsheetId,
          roll_numbers: rollNumbers,
          username: user.username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to commit attendance');
      }

      console.log('Commit successful:', data);

      // Refresh data from sheets
      const sheetLink = localStorage.getItem('currentSheetLink');
      if (sheetLink) {
        // Step 1: Refresh cache by calling /attendance
        console.log('Refreshing cache after commit...');
        const infoResponse = await fetch(
          `${API_BASE_URL}/attendance?sheet_link=${encodeURIComponent(sheetLink)}`
        );

        if (!infoResponse.ok) {
          throw new Error('Failed to refresh cache');
        }

        await infoResponse.json();

        // Step 2: Get fresh display data
        console.log('Fetching fresh display data...');
        const displayResponse = await fetch(
          `${API_BASE_URL}/attendance/display?spreadsheet_id=${spreadsheetId}`
        );

        if (!displayResponse.ok) {
          throw new Error('Failed to fetch fresh display data');
        }

        const displayData = await displayResponse.json();

        if (displayData.success) {
          setRegistered(displayData.data.registered);
          setPresentCount(displayData.data.presentCount || 0);
          setAbsentCount(displayData.data.absentCount || 0);
          setOnSpotCount(displayData.data.onSpotCount || 0);
          // Transform backend data to match Student interface
          const transformedStudents = displayData.data.students.map((student: any) => ({
            id: student.id,
            rollNumber: student.rollNumber,
            status: student.status,
            isPresent: student.status.toLowerCase() === 'present',
            isOnSpot: false
          }));
          setStudents(transformedStudents);
          setNextId(transformedStudents.length + 1);
          console.log('Data refreshed successfully after commit');
        }
      }

      setShowCommitConfirm(false);
    } catch (err: any) {
      console.error('Error committing attendance:', err);
      alert(`Failed to commit attendance: ${err.message}`);
      setShowCommitConfirm(false);
    }
  };

  const handleCancelCommit = () => {
    setShowCommitConfirm(false);
  };

  const handleExport = async () => {
    try {
      if (!spreadsheetId) {
        alert('No spreadsheet ID found. Please ensure data is loaded.');
        return;
      }

      // Call export endpoint
      const response = await fetch(
        `${API_BASE_URL}/attendance/export?spreadsheet_id=${spreadsheetId}`
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

  const filteredStudents = students.filter(student =>
    student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPresent = presentCount; // Present: attendance=TRUE
  const totalAbsent = registered + onSpotCount - presentCount; // Absent: Registered + On-Spot - Present
  const totalOnSpot = onSpotCount; // On-Spot: type=ON-SPOT

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
            Loading attendance data...
          </p>
          <p style={{ color: "#b91372", fontSize: "14px", marginTop: "8px" }}>
            Fetching sheet information from cache
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
            Error Loading Attendance
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
            <p className="text-xl md:text-2xl font-semibold" style={{ color: isDark ? '#fbbf24' : '#f59e0b' }}>{totalOnSpot}</p>
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
            <p className="text-xl md:text-2xl font-semibold" style={{ color: isDark ? '#4ade80' : '#22c55e' }}>{totalPresent}</p>
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
            <p className="text-xl md:text-2xl font-semibold" style={{ color: isDark ? '#f87171' : '#ef4444' }}>{totalAbsent}</p>
          </div>
        </div>

        {/* Search Bar */}
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
            className="grid grid-cols-3 p-3 md:p-4"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #4a1a4a 0%, #b91372 100%)'
                : 'linear-gradient(135deg, #b91372 0%, #4a1a4a 100%)',
              color: '#ffffff',
              borderBottom: `2px solid ${isDark ? 'rgba(74, 26, 74, 0.5)' : 'rgba(185, 19, 114, 0.4)'}`
            }}
          >
            <div className="text-sm md:text-base flex items-center justify-center border-r" style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}>Roll Number</div>
            <div className="text-sm md:text-base flex items-center justify-center border-r" style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}>Toggle</div>
            <div className="text-sm md:text-base flex items-center justify-center">Status</div>
          </div>

          {/* Table Body */}
          <div
            className="overflow-y-auto flex-1"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              maxHeight: '250px'
            }}
          >
            <style>{`
              .overflow-y-auto::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {filteredStudents.map((student, index) => (
              <div
                key={student.id}
                className="grid grid-cols-3"
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
                  {student.rollNumber}
                </div>
                <div className="flex items-center justify-center border-r px-2 py-3 md:py-4" style={{ borderColor: isDark ? 'rgba(74, 26, 74, 0.3)' : 'rgba(185, 19, 114, 0.2)' }}>
                  <button
                    onClick={() => toggleAttendance(student.id)}
                    className="px-3 py-1.5 md:px-4 md:py-2 transition-all hover:scale-105 hover:shadow-lg text-xs md:text-sm"
                    style={{
                      background: isDark
                        ? 'linear-gradient(135deg, #4a1a4a 0%, #b91372 100%)'
                        : 'linear-gradient(135deg, #b91372 0%, #4a1a4a 100%)',
                      color: '#ffffff',
                      border: 'none'
                    }}
                  >
                    Toggle
                  </button>
                </div>
                <div className="flex items-center justify-center text-sm md:text-base px-2 py-3 md:py-4">
                  <span
                    style={{
                      color: student.status.toLowerCase() === 'present'
                        ? (isDark ? '#4ade80' : '#22c55e')
                        : (isDark ? '#f87171' : '#ef4444')
                    }}
                  >
                    {student.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <button
            className="flex items-center justify-center gap-2 px-4 py-1.5 md:py-2 transition-all hover:scale-105 hover:shadow-lg text-sm md:text-base"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #4a1a4a 0%, #b91372 100%)'
                : 'linear-gradient(135deg, #b91372 0%, #4a1a4a 100%)',
              color: '#ffffff',
              border: 'none'
            }}
            onClick={handleCommit}
          >
            <Save className="w-4 h-4 md:w-5 md:h-5" />
            <span>Commit</span>
          </button>
          <button
            className="flex items-center justify-center gap-2 px-4 py-1.5 md:py-2 transition-all hover:scale-105 hover:shadow-lg text-sm md:text-base"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #4a1a4a 0%, #b91372 100%)'
                : 'linear-gradient(135deg, #b91372 0%, #4a1a4a 100%)',
              color: '#ffffff',
              border: 'none'
            }}
            onClick={() => setShowAddNewModal(true)}
          >
            <UserPlus className="w-4 h-4 md:w-5 md:h-5" />
            <span>Add</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-1.5 md:py-2 transition-all hover:scale-105 hover:shadow-lg text-sm md:text-base"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #4a1a4a 0%, #b91372 100%)'
                : 'linear-gradient(135deg, #b91372 0%, #4a1a4a 100%)',
              color: '#ffffff',
              border: 'none'
            }}
          >
            <Download className="w-4 h-4 md:w-5 md:h-5" />
            <span>Export</span>
          </button>
        </div>
      </div>
      {/* Commit Confirmation Modal */}
      {showCommitConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[100]"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)'
          }}
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
              Confirm Commit
            </h2>
            <p
              className="text-sm md:text-base opacity-75 mb-6"
              style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
            >
              Committing will permanently remove the roll numbers marked as Present from the attendance page. This action is irreversible.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelCommit}
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
                onClick={handleConfirmCommit}
                className="px-4 py-2 md:px-6 md:py-2.5 transition-all hover:scale-105 hover:shadow-lg text-sm md:text-base"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, #4a1a4a 0%, #b91372 100%)'
                    : 'linear-gradient(135deg, #b91372 0%, #4a1a4a 100%)',
                  color: '#ffffff',
                  border: 'none'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add New Student Modal */}
      {showAddNewModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[100]"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)'
          }}
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
              Add New Student
            </h2>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm md:text-base opacity-75"
                  style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="Enter student name..."
                  className="w-full pl-3 md:pl-4 pr-3 md:pr-4 py-2.5 md:py-3 transition-all focus:outline-none focus:ring-2 text-sm md:text-base"
                  style={{
                    backgroundColor: isDark ? 'rgba(74, 26, 74, 0.2)' : 'rgba(185, 19, 114, 0.1)',
                    color: isDark ? '#f5f0ff' : '#0a1128',
                    border: isDark ? '1px solid rgba(74, 26, 74, 0.3)' : '1px solid rgba(185, 19, 114, 0.3)'
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="rollNumber"
                  className="block mb-2 text-sm md:text-base opacity-75"
                  style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
                >
                  Roll Number
                </label>
                <input
                  id="rollNumber"
                  type="text"
                  value={newStudent.rollNumber}
                  onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value })}
                  placeholder="Enter roll number..."
                  className="w-full pl-3 md:pl-4 pr-3 md:pr-4 py-2.5 md:py-3 transition-all focus:outline-none focus:ring-2 text-sm md:text-base"
                  style={{
                    backgroundColor: isDark ? 'rgba(74, 26, 74, 0.2)' : 'rgba(185, 19, 114, 0.1)',
                    color: isDark ? '#f5f0ff' : '#0a1128',
                    border: isDark ? '1px solid rgba(74, 26, 74, 0.3)' : '1px solid rgba(185, 19, 114, 0.3)'
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="department"
                  className="block mb-2 text-sm md:text-base opacity-75"
                  style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
                >
                  Department
                </label>
                <input
                  id="department"
                  type="text"
                  value={newStudent.department}
                  onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                  placeholder="Enter department..."
                  className="w-full pl-3 md:pl-4 pr-3 md:pr-4 py-2.5 md:py-3 transition-all focus:outline-none focus:ring-2 text-sm md:text-base"
                  style={{
                    backgroundColor: isDark ? 'rgba(74, 26, 74, 0.2)' : 'rgba(185, 19, 114, 0.1)',
                    color: isDark ? '#f5f0ff' : '#0a1128',
                    border: isDark ? '1px solid rgba(74, 26, 74, 0.3)' : '1px solid rgba(185, 19, 114, 0.3)'
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="emailId"
                  className="block mb-2 text-sm md:text-base opacity-75"
                  style={{ color: isDark ? '#f5f0ff' : '#0a1128' }}
                >
                  Email ID
                </label>
                <input
                  id="emailId"
                  type="email"
                  value={newStudent.emailId}
                  onChange={(e) => setNewStudent({ ...newStudent, emailId: e.target.value })}
                  placeholder="Enter email ID..."
                  className="w-full pl-3 md:pl-4 pr-3 md:pr-4 py-2.5 md:py-3 transition-all focus:outline-none focus:ring-2 text-sm md:text-base"
                  style={{
                    backgroundColor: isDark ? 'rgba(74, 26, 74, 0.2)' : 'rgba(185, 19, 114, 0.1)',
                    color: isDark ? '#f5f0ff' : '#0a1128',
                    border: isDark ? '1px solid rgba(74, 26, 74, 0.3)' : '1px solid rgba(185, 19, 114, 0.3)'
                  }}
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => setShowAddNewModal(false)}
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
                onClick={async () => {
                  try {
                    // Get username from cached user
                    const user = getCachedUser();
                    if (!user || !user.username) {
                      alert('User not authenticated. Please login again.');
                      return;
                    }

                    if (!newStudent.name || !newStudent.rollNumber || !newStudent.emailId || !newStudent.department) {
                      alert('Please fill in all fields');
                      return;
                    }

                    // Call backend to add student to sheet
                    const response = await fetch(`${API_BASE_URL}/attendance/addonspot`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        spreadsheet_id: spreadsheetId,
                        name: newStudent.name,
                        roll_number: newStudent.rollNumber,
                        mail_id: newStudent.emailId,
                        department: newStudent.department,
                        username: user.username,
                      }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                      throw new Error(data.message || 'Failed to add student on-spot');
                    }

                    console.log('Student added on-spot:', data);

                    // Student is already committed (commit=TRUE) so won't appear in display
                    // Just close modal and reset form
                    setShowAddNewModal(false);
                    setNewStudent({ name: '', rollNumber: '', department: '', emailId: '' });

                    alert('Student added successfully! They are marked as present and committed.');
                  } catch (err: any) {
                    console.error('Error adding student on-spot:', err);
                    alert(`Failed to add student: ${err.message}`);
                  }
                }}
                className="px-4 py-2 md:px-6 md:py-2.5 transition-all hover:scale-105 hover:shadow-lg text-sm md:text-base"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, #4a1a4a 0%, #b91372 100%)'
                    : 'linear-gradient(135deg, #b91372 0%, #4a1a4a 100%)',
                  color: '#ffffff',
                  border: 'none'
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}