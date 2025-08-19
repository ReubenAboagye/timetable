import React, { useState } from 'react';
import { FileText, Download, Users, Building2, Clock, GraduationCap, Printer } from 'lucide-react';
import { useApp } from '../store';
import { formatDate, getDayName, formatTime } from '../lib/utils';

const Reports: React.FC = () => {
  const { state } = useApp();
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');

  const { sessions, departments, courses, lecturers, rooms, timetableEntries, academicYears } = state;

  const reportTypes = [
    { id: 'lecturer', name: 'Lecturer Report', icon: Users, description: 'Individual lecturer workload and schedules' },
    { id: 'department', name: 'Department Report', icon: Building2, description: 'Complete department timetables and course distribution' },
    { id: 'session', name: 'Session Report', icon: Clock, description: 'All departments and courses under a specific session' },
    { id: 'school', name: 'School-wide Report', icon: GraduationCap, description: 'Complete academic overview and statistics' },
    { id: 'room', name: 'Room Utilization Report', icon: Building2, description: 'Room usage statistics and efficiency analysis' },
  ];

  const generateLecturerReport = () => {
    if (!selectedLecturer) return null;

    const lecturer = lecturers.find(l => l.id === selectedLecturer);
    if (!lecturer) return null;

    const department = departments.find(d => d.id === lecturer.departmentId);
    const lecturerCourses = courses.filter(c => 
      timetableEntries.some(te => 
        te.lecturerId === lecturer.id && te.courseId === c.id
      )
    );

    const totalCreditHours = lecturerCourses.reduce((sum, course) => sum + course.creditHours, 0);

    return {
      lecturer,
      department,
      courses: lecturerCourses,
      totalCreditHours,
      timetableEntries: timetableEntries.filter(te => te.lecturerId === lecturer.id)
    };
  };

  const generateDepartmentReport = () => {
    if (!selectedDepartment) return null;

    const department = departments.find(d => d.id === selectedDepartment);
    if (!department) return null;

    const departmentCourses = courses.filter(c => c.departmentId === department.id);
    const departmentLecturers = lecturers.filter(l => l.departmentId === department.id);

    return {
      department,
      courses: departmentCourses,
      lecturers: departmentLecturers,
      timetableEntries: timetableEntries.filter(te => te.departmentId === department.id)
    };
  };

  const generateSessionReport = () => {
    if (!selectedSession) return null;

    const session = sessions.find(s => s.id === selectedSession);
    if (!session) return null;

    // Since departments no longer have sessionId, show all departments
    // This could be enhanced later with a different relationship model
    const allDepartments = departments;
    const allCourses = courses;

    return {
      session,
      departments: allDepartments,
      courses: allCourses,
      totalDepartments: allDepartments.length,
      totalCourses: allCourses.length
    };
  };

  const generateSchoolReport = () => {
    const totalSessions = sessions.length;
    const totalDepartments = departments.length;
    const totalCourses = courses.length;
    const totalLecturers = lecturers.length;
    const totalRooms = rooms.length;

    const activeAcademicYear = academicYears.find(ay => ay.isActive);
    const currentTimetableEntries = timetableEntries.filter(te => 
      te.academicYear === activeAcademicYear?.id
    );

    return {
      totalSessions,
      totalDepartments,
      totalCourses,
      totalLecturers,
      totalRooms,
      activeAcademicYear,
      currentTimetableEntries
    };
  };

  const generateRoomUtilizationReport = () => {
    const roomStats = rooms.map(room => {
      const roomEntries = timetableEntries.filter(te => te.roomId === room.id);
      const totalHours = roomEntries.length * 1; // Assuming 1 hour per entry
      const utilizationPercentage = (totalHours / 40) * 100; // Assuming 40 hours per week as full capacity

      return {
        room,
        totalEntries: roomEntries.length,
        totalHours,
        utilizationPercentage: Math.min(utilizationPercentage, 100)
      };
    });

    return roomStats;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    // Placeholder for export functionality
    console.log(`Exporting ${selectedReport} report in ${format} format`);
    alert(`Export functionality for ${format} will be implemented here`);
  };

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'lecturer':
        const lecturerReport = generateLecturerReport();
        if (!lecturerReport) return <div>Please select a lecturer</div>;
        
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Lecturer Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Name:</strong> {lecturerReport.lecturer.name}</p>
                  <p><strong>Email:</strong> {lecturerReport.lecturer.email}</p>
                  <p><strong>Department:</strong> {lecturerReport.department?.name}</p>
                  <p><strong>Specialization:</strong> {lecturerReport.lecturer.specialization || 'N/A'}</p>
                </div>
                <div>
                  <p><strong>Total Courses:</strong> {lecturerReport.courses.length}</p>
                  <p><strong>Total Credit Hours:</strong> {lecturerReport.totalCreditHours}</p>
                  <p><strong>Total Teaching Hours:</strong> {lecturerReport.timetableEntries.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Courses Taught</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit Hours</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year Level</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {lecturerReport.courses.map((course) => (
                      <tr key={course.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.creditHours}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Year {course.yearLevel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'department':
        const departmentReport = generateDepartmentReport();
        if (!departmentReport) return <div>Please select a department</div>;
        
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Department Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Department:</strong> {departmentReport.department.name}</p>
                  <p><strong>Code:</strong> {departmentReport.department.code}</p>
                  <p><strong>Session:</strong> {departmentReport.session?.name}</p>
                </div>
                <div>
                  <p><strong>Total Courses:</strong> {departmentReport.courses.length}</p>
                  <p><strong>Total Lecturers:</strong> {departmentReport.lecturers.length}</p>
                  <p><strong>Total Timetable Entries:</strong> {departmentReport.timetableEntries.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Department Lecturers</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {departmentReport.lecturers.map((lecturer) => (
                      <tr key={lecturer.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lecturer.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lecturer.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lecturer.specialization || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'session':
        const sessionReport = generateSessionReport();
        if (!sessionReport) return <div>Please select a session</div>;
        
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Session Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Session:</strong> {sessionReport.session.name}</p>
                  <p><strong>Duration:</strong> {sessionReport.session.numberOfYears} years</p>
                  <p><strong>Working Days:</strong> {sessionReport.session.workingDays.filter(d => d.isActive).length} days</p>
                </div>
                <div>
                  <p><strong>Total Departments:</strong> {sessionReport.totalDepartments}</p>
                  <p><strong>Total Courses:</strong> {sessionReport.totalCourses}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Session Departments</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sessionReport.departments.map((department) => (
                      <tr key={department.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{department.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{department.code}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'school':
        const schoolReport = generateSchoolReport();
        
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">School Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{schoolReport.totalSessions}</p>
                  <p className="text-sm text-gray-600">Academic Sessions</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{schoolReport.totalDepartments}</p>
                  <p className="text-sm text-gray-600">Departments</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{schoolReport.totalCourses}</p>
                  <p className="text-sm text-gray-600">Courses</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{schoolReport.totalLecturers}</p>
                  <p className="text-sm text-gray-600">Lecturers</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{schoolReport.totalRooms}</p>
                  <p className="text-sm text-gray-600">Rooms</p>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <p className="text-2xl font-bold text-indigo-600">{schoolReport.currentTimetableEntries.length}</p>
                  <p className="text-sm text-gray-600">Current Entries</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Active Academic Year</h3>
              {schoolReport.activeAcademicYear ? (
                <div>
                  <p><strong>Year:</strong> {schoolReport.activeAcademicYear.name}</p>
                  <p><strong>Start Date:</strong> {formatDate(schoolReport.activeAcademicYear.startDate)}</p>
                  <p><strong>End Date:</strong> {formatDate(schoolReport.activeAcademicYear.endDate)}</p>
                </div>
              ) : (
                <p className="text-gray-500">No active academic year set</p>
              )}
            </div>
          </div>
        );

      case 'room':
        const roomReport = generateRoomUtilizationReport();
        
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Room Utilization Report</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Entries</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization %</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {roomReport.map((roomStat) => (
                      <tr key={roomStat.room.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{roomStat.room.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{roomStat.room.roomType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{roomStat.room.capacity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{roomStat.totalEntries}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            roomStat.utilizationPercentage > 80 ? 'bg-green-100 text-green-800' :
                            roomStat.utilizationPercentage > 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {roomStat.utilizationPercentage.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Select a report type</h3>
            <p className="mt-1 text-sm text-gray-500">Choose a report type from the options above to generate detailed information.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Generate comprehensive reports and analytics</p>
        </div>
        {selectedReport && (
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </button>
          </div>
        )}
      </div>

      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((reportType) => {
          const Icon = reportType.icon;
          return (
            <button
              key={reportType.id}
              onClick={() => setSelectedReport(reportType.id)}
              className={`p-6 text-left rounded-lg border-2 transition-all ${
                selectedReport === reportType.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <Icon className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{reportType.name}</h3>
              <p className="text-sm text-gray-600">{reportType.description}</p>
            </button>
          );
        })}
      </div>

      {/* Report Filters */}
      {selectedReport && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Report Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedReport === 'lecturer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Lecturer</label>
                <select
                  value={selectedLecturer}
                  onChange={(e) => setSelectedLecturer(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Choose a lecturer</option>
                  {lecturers.map((lecturer) => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.name} - {departments.find(d => d.id === lecturer.departmentId)?.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedReport === 'department' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Choose a department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name} ({department.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedReport === 'session' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Session</label>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Choose a session</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.name} ({session.numberOfYears} years)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(selectedReport === 'lecturer' || selectedReport === 'department') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                <select
                  value={selectedAcademicYear}
                  onChange={(e) => setSelectedAcademicYear(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">All years</option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report Content */}
      {selectedReport && (
        <div className="space-y-6">
          {renderReportContent()}
        </div>
      )}
    </div>
  );
};

export default Reports;
