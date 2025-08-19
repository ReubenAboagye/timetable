import React, { useState, useRef } from 'react';
import { Calendar, Plus, Filter, Download, Printer, X, Edit, Trash2, Play, Eye } from 'lucide-react';
import { useApp } from '../store';
import { Link } from 'react-router-dom';
import { TimetableEntry, Session, Department, Course, Lecturer, Room } from '../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTimetableEntrySchema, updateTimetableEntrySchema } from '../lib/validations';
import type { CreateTimetableEntryFormData, UpdateTimetableEntryFormData } from '../lib/validations';

const Timetable: React.FC = () => {
  const { state, dispatch } = useApp();
  const { sessions, departments, courses, lecturers, rooms, timetableEntries, academicYears } = state;
  
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // New states for generate/view functionality
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [showViewForm, setShowViewForm] = useState(false);
  const [generateSession, setGenerateSession] = useState<string>('');
  const [generateSemester, setGenerateSemester] = useState<number>(1);
  const [viewSession, setViewSession] = useState<string>('');
  const [viewSemester, setViewSemester] = useState<number>(1);
  const [viewFilters, setViewFilters] = useState({
    department: '',
    lecturer: '',
    room: '',
    class: '',
    yearLevel: ''
  });

  const activeAcademicYear = academicYears.find(ay => ay.isActive);
  
  const timetableRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = () => {
    if (timetableRef.current) {
      window.print();
    }
  };

  // Generate timetable function
  const handleGenerateTimetable = () => {
    if (!generateSession || !generateSemester) {
      alert('Please select both session and semester');
      return;
    }
    
    // This would typically call an API to generate timetables
    // For now, we'll show a success message
    alert(`Timetable generation initiated for ${sessions.find(s => s.id === generateSession)?.name} - Semester ${generateSemester}`);
    setShowGenerateForm(false);
    setGenerateSession('');
    setGenerateSemester(1);
  };

  // View generated timetables function
  const handleViewTimetables = () => {
    if (!viewSession || !viewSemester) {
      alert('Please select both session and semester');
      return;
    }
    
    // This would typically fetch generated timetables
    // For now, we'll show a success message
    alert(`Viewing timetables for ${sessions.find(s => s.id === viewSession)?.name} - Semester ${viewSemester}`);
    setShowViewForm(false);
    setViewSession('');
    setViewSemester(1);
  };

  const createForm = useForm<CreateTimetableEntryFormData>({
    resolver: zodResolver(createTimetableEntrySchema),
    defaultValues: {
      sessionId: '',
      departmentId: '',
      courseId: '',
      lecturerId: '',
      roomId: '',
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '09:00',
      academicYearId: '',
      semester: 1
    }
  });

  const updateForm = useForm<UpdateTimetableEntryFormData>({
    resolver: zodResolver(updateTimetableEntrySchema),
    defaultValues: {
      sessionId: '',
      departmentId: '',
      courseId: '',
      lecturerId: '',
      roomId: '',
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '09:00',
      academicYearId: '',
      semester: 1
    }
  });

  const handleCreateSubmit = (data: CreateTimetableEntryFormData) => {
    const entryData = {
      ...data,
      id: `entry_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    dispatch({ type: 'ADD_TIMETABLE_ENTRY', payload: entryData });
    createForm.reset();
    setShowCreateForm(false);
  };

  const handleUpdateSubmit = (data: UpdateTimetableEntryFormData) => {
    if (!editingEntry) return;
    
    dispatch({
      type: 'UPDATE_TIMETABLE_ENTRY',
      payload: {
        id: editingEntry.id,
        sessionId: data.sessionId || editingEntry.sessionId,
        departmentId: data.departmentId || editingEntry.departmentId,
        courseId: data.courseId || editingEntry.courseId,
        lecturerId: data.lecturerId || editingEntry.lecturerId,
        roomId: data.roomId || editingEntry.roomId,
        dayOfWeek: data.dayOfWeek || editingEntry.dayOfWeek,
        startTime: data.startTime || editingEntry.startTime,
        endTime: data.endTime || editingEntry.endTime,
        academicYearId: data.academicYearId || editingEntry.academicYearId,
        semester: data.semester || editingEntry.semester,
        createdAt: editingEntry.createdAt,
        updatedAt: new Date()
      }
    });
    
    updateForm.reset();
    setEditingEntry(null);
  };

  const handleEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    updateForm.reset({
      sessionId: entry.sessionId,
      departmentId: entry.departmentId,
      courseId: entry.courseId,
      lecturerId: entry.lecturerId,
      roomId: entry.roomId,
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime,
      academicYearId: entry.academicYearId,
      semester: entry.semester
    });
  };

  const handleDelete = (entryId: string) => {
    dispatch({ type: 'DELETE_TIMETABLE_ENTRY', payload: entryId });
    setShowDeleteConfirm(null);
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    alert(`Export functionality for ${format} will be implemented in the next phase`);
  };

  const getDayName = (day: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  const getSessionName = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    return session ? session.name : 'Unknown Session';
  };

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : 'Unknown Department';
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.name : 'Unknown Course';
  };

  const getLecturerName = (lecturerId: string) => {
    const lecturer = lecturers.find(l => l.id === lecturerId);
    return lecturer ? lecturer.name : 'Unknown Lecturer';
  };

  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : 'Unknown Room';
  };

  const getAcademicYearName = (yearId: string) => {
    const year = academicYears.find(y => y.id === yearId);
    return year ? year.name : 'Unknown Year';
  };

  const filteredEntries = timetableEntries.filter(entry => {
    if (selectedSession && entry.sessionId !== selectedSession) return false;
    if (selectedDepartment && entry.departmentId !== selectedDepartment) return false;
    if (selectedAcademicYear && entry.academicYearId !== selectedAcademicYear) return false;
    return true;
  });

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const workingDays = [1, 2, 3, 4, 5]; // Monday to Friday
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
          <p className="text-gray-600">View and manage academic timetables</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowGenerateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Play className="h-4 w-4 mr-2" />
            Generate Timetable
          </button>
          <button
            onClick={() => setShowViewForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Generated Timetables
          </button>

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
      </div>

      {/* Generate Timetable Modal */}
      {showGenerateForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Generate Timetable</h3>
                  <button
                    onClick={() => setShowGenerateForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Academic Session</label>
                    <select
                      value={generateSession}
                      onChange={(e) => setGenerateSession(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select Session</option>
                      {sessions.map((session) => (
                        <option key={session.id} value={session.id}>
                          {session.name} ({session.numberOfYears} years)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                    <select
                      value={generateSemester}
                      onChange={(e) => setGenerateSemester(Number(e.target.value))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value={1}>Semester 1</option>
                      <option value={2}>Semester 2</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowGenerateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateTimetable}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Generate Timetable
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Generated Timetables Modal */}
      {showViewForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">View Generated Timetables</h3>
                  <button
                    onClick={() => setShowViewForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Academic Session</label>
                      <select
                        value={viewSession}
                        onChange={(e) => setViewSession(e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Select Session</option>
                        {sessions.map((session) => (
                          <option key={session.id} value={session.id}>
                            {session.name} ({session.numberOfYears} years)
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                      <select
                        value={viewSemester}
                        onChange={(e) => setViewSemester(Number(e.target.value))}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value={1}>Semester 1</option>
                        <option value={2}>Semester 2</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Filters</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                        <select
                          value={viewFilters.department}
                          onChange={(e) => setViewFilters({...viewFilters, department: e.target.value})}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="">All Departments</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name} ({dept.code})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Lecturer</label>
                        <select
                          value={viewFilters.lecturer}
                          onChange={(e) => setViewFilters({...viewFilters, lecturer: e.target.value})}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="">All Lecturers</option>
                          {lecturers.map((lecturer) => (
                            <option key={lecturer.id} value={lecturer.id}>
                              {lecturer.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                        <select
                          value={viewFilters.room}
                          onChange={(e) => setViewFilters({...viewFilters, room: e.target.value})}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="">All Rooms</option>
                          {rooms.map((room) => (
                            <option key={room.id} value={room.id}>
                              {room.name} ({room.building})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Class/Year Level</label>
                        <select
                          value={viewFilters.yearLevel}
                          onChange={(e) => setViewFilters({...viewFilters, yearLevel: e.target.value})}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="">All Levels</option>
                          <option value="1">Year 1</option>
                          <option value="2">Year 2</option>
                          <option value="3">Year 3</option>
                          <option value="4">Year 4</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowViewForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleViewTimetables}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    View Timetables
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Timetable Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Academic Session</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Sessions</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name} ({session.numberOfYears} years)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name} ({department.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Years</option>
              {academicYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timetable;
