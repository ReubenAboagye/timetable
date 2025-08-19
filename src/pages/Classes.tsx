import React, { useState, useMemo, useRef } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Users, Calendar, Building2, GraduationCap, Upload, BookOpen, List } from 'lucide-react';
import { Class, Session, Department, Course } from '../types';
import type { BulkCourseAssignment } from '../types';
import { sampleClasses, sampleSessions, sampleDepartments, samplePrograms, sampleBulkCourseAssignments, sampleCourses } from '../lib/sampleData';
import BulkCourseAssignmentComponent from '../components/BulkCourseAssignment';
import BulkAssignmentViewer from '../components/BulkAssignmentViewer';
import { getClassBulkCourses, getBulkAssignmentStats } from '../lib/bulkAssignmentUtils';

const Classes: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<number | ''>('');
  const [showImportForm, setShowImportForm] = useState(false);
  const [showBulkAssignment, setShowBulkAssignment] = useState(false);
  const [showBulkAssignmentViewer, setShowBulkAssignmentViewer] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);
  const [classes, setClasses] = useState<Class[]>(sampleClasses);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter classes based on search and filters
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const matchesSearch = cls.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSession = !selectedSession || cls.sessionId === selectedSession;
      const matchesDepartment = !selectedDepartment || cls.departmentId === selectedDepartment;
      const matchesProgram = !selectedProgram || cls.programId === selectedProgram;
      const matchesLevel = !selectedLevel || cls.yearLevel === selectedLevel;

      return matchesSearch && matchesSession && matchesDepartment && matchesProgram && matchesLevel;
    });
  }, [searchQuery, selectedSession, selectedDepartment, selectedProgram, selectedLevel, classes]);

  // Get session and department names for display
  const getSessionName = (sessionId: string) => {
    return sampleSessions.find(s => s.id === sessionId)?.name || 'Unknown';
  };

  const getDepartmentName = (departmentId: string) => {
    return sampleDepartments.find(d => d.id === departmentId)?.name || 'Unknown';
  };

  const getDepartmentCode = (departmentId: string) => {
    return sampleDepartments.find(d => d.id === departmentId)?.code || 'Unknown';
  };

  // Get courses assigned to a class based on bulk assignments
  const getAssignedCourses = (cls: Class): Course[] => {
    return getClassBulkCourses(cls, sampleBulkCourseAssignments, sampleCourses);
  };

  const handleCreateClass = () => {
    setShowCreateModal(true);
  };

  const handleEditClass = (classId: string) => {
    const classToEdit = classes.find(cls => cls.id === classId);
    if (classToEdit) {
      setEditingClass(classToEdit);
      setShowEditModal(true);
    }
  };

  const handleDeleteClass = (classId: string) => {
    const classToDelete = classes.find(cls => cls.id === classId);
    if (classToDelete) {
      setDeletingClass(classToDelete);
      setShowDeleteModal(true);
    }
  };

  const handleCreateSubmit = (formData: {
    name: string;
    sessionId: string;
    departmentId: string;
    programId: string;
    yearLevel: number;
    semester: number;
    studentCount: number;
    maxCapacity: number;
  }) => {
    const newClass: Class = {
      id: `class_${Date.now()}`,
      ...formData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setClasses(prev => [...prev, newClass]);
    setShowCreateModal(false);
  };

  const handleEditSubmit = (formData: {
    name: string;
    sessionId: string;
    departmentId: string;
    programId: string;
    yearLevel: number;
    semester: number;
    studentCount: number;
    maxCapacity: number;
  }) => {
    if (!editingClass) return;
    
    const updatedClass: Class = {
      ...editingClass,
      ...formData,
      updatedAt: new Date()
    };
    
    setClasses(prev => prev.map(cls => cls.id === editingClass.id ? updatedClass : cls));
    setShowEditModal(false);
    setEditingClass(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingClass) return;
    
    setClasses(prev => prev.filter(cls => cls.id !== deletingClass.id));
    setShowDeleteModal(false);
    setDeletingClass(null);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const classes = JSON.parse(content);
        
        if (Array.isArray(classes)) {
          // TODO: Implement actual import logic using the store
          console.log(`Successfully parsed ${classes.length} classes for import`);
          alert(`Successfully parsed ${classes.length} classes for import`);
        } else {
          alert('Invalid file format. Please upload a JSON file with an array of classes.');
        }
      } catch (error) {
        alert('Error parsing file. Please ensure it\'s a valid JSON file.');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowImportForm(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleBulkAssignmentCreated = (assignment: BulkCourseAssignment) => {
    // TODO: Implement actual bulk assignment logic using the store
    console.log('Bulk assignment created:', assignment);
    alert(`Successfully assigned ${assignment.courseIds.length} course(s) to classes in ${getDepartmentName(assignment.departmentId)} Year ${assignment.yearLevel} Semester ${assignment.semester}`);
  };

  const handleBulkAssignmentDeleted = (assignmentId: string) => {
    // TODO: Implement actual deletion logic using the store
    console.log('Bulk assignment deleted:', assignmentId);
    alert('Bulk assignment deleted successfully');
  };

  const handleBulkAssignmentEdit = (assignment: BulkCourseAssignment) => {
    // TODO: Implement actual edit logic using the store
    console.log('Bulk assignment edit:', assignment);
    alert('Edit functionality will be implemented soon');
  };

  const clearFilters = () => {
    setSelectedSession('');
    setSelectedDepartment('');
    setSelectedProgram('');
    setSelectedLevel('');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage student classes and their course assignments
          </p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <button
            onClick={() => setShowBulkAssignmentViewer(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <List className="h-4 w-4 mr-2" />
            View Assignments
          </button>
          <button
            onClick={() => setShowBulkAssignment(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Bulk Course Assignment
          </button>
          <button
            onClick={handleImportClick}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Classes
          </button>
          <button
            onClick={handleCreateClass}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Class
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Session Filter */}
          <div className="w-full lg:w-48">
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Sessions</option>
              {sampleSessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="w-full lg:w-48">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Departments</option>
              {sampleDepartments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Program Filter */}
          <div className="w-full lg:w-48">
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Programs</option>
              {samplePrograms
                .filter(prog => !selectedDepartment || prog.departmentId === selectedDepartment)
                .map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Level Filter */}
          <div className="w-full lg:w-32">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value ? parseInt(e.target.value) : '')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Levels</option>
              {[1, 2, 3, 4].map((level) => (
                <option key={level} value={level}>
                  Level {level}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="w-full lg:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Classes Table */}
      {filteredClasses.length > 0 ? (
        <div className="bg-white shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Courses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClasses.map((cls) => {
                  const assignedCourses = getAssignedCourses(cls);
                  return (
                    <tr key={cls.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getDepartmentCode(cls.departmentId)}{cls.yearLevel}00{cls.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{getSessionName(cls.sessionId)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getDepartmentCode(cls.departmentId)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {samplePrograms.find(p => p.id === cls.programId)?.name || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Level {cls.yearLevel}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {assignedCourses.length > 0 ? (
                            <div className="space-y-1">
                              {assignedCourses.slice(0, 3).map((course: Course) => (
                                <div key={course.id} className="text-xs">
                                  <span className="truncate max-w-32" title={course.name}>
                                    {course.code}
                                  </span>
                                </div>
                              ))}
                              {assignedCourses.length > 3 && (
                                <div className="relative group">
                                  <button className="text-xs text-blue-600 hover:text-blue-800 underline">
                                    +{assignedCourses.length - 3} more courses
                                  </button>
                                  <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-48">
                                    <div className="py-2">
                                      {assignedCourses.slice(3).map((course: Course) => (
                                        <div key={course.id} className="px-3 py-1 hover:bg-gray-50 text-xs">
                                          <div className="flex items-center justify-between">
                                            <span className="font-medium">{course.code}</span>
                                            <span className="text-gray-500 text-xs">{course.name}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500 text-xs">No courses assigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditClass(cls.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClass(cls.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No classes found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || selectedSession || selectedDepartment || selectedLevel
              ? 'Try adjusting your filters or search query.'
              : 'Get started by creating a new class.'}
          </p>
        </div>
      )}

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />

      {/* Bulk Course Assignment Modal */}
      {showBulkAssignment && (
        <BulkCourseAssignmentComponent
          sessions={sampleSessions}
          departments={sampleDepartments}
          onAssignmentCreated={handleBulkAssignmentCreated}
          onClose={() => setShowBulkAssignment(false)}
        />
      )}

      {/* Bulk Assignment Viewer Modal */}
      {showBulkAssignmentViewer && (
        <BulkAssignmentViewer
          assignments={sampleBulkCourseAssignments}
          onDelete={handleBulkAssignmentDeleted}
          onEdit={handleBulkAssignmentEdit}
          onClose={() => setShowBulkAssignmentViewer(false)}
        />
      )}

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative p-6 w-full max-w-2xl">
            <div className="bg-white rounded-lg shadow-xl">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Create New Class
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowCreateModal(false)}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="px-6 py-4">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const formData = {
                    name: (form.querySelector('[name="name"]') as HTMLInputElement).value,
                    sessionId: (form.querySelector('[name="sessionId"]') as HTMLSelectElement).value,
                    departmentId: (form.querySelector('[name="departmentId"]') as HTMLSelectElement).value,
                    programId: (form.querySelector('[name="programId"]') as HTMLSelectElement).value,
                    yearLevel: parseInt((form.querySelector('[name="yearLevel"]') as HTMLSelectElement).value, 10),
                    semester: parseInt((form.querySelector('[name="semester"]') as HTMLSelectElement).value, 10),
                    studentCount: parseInt((form.querySelector('[name="studentCount"]') as HTMLInputElement).value, 10),
                    maxCapacity: parseInt((form.querySelector('[name="maxCapacity"]') as HTMLInputElement).value, 10),
                  };
                  handleCreateSubmit(formData);
                }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Class Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter class name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="sessionId" className="block text-sm font-medium text-gray-700 mb-1">
                        Session
                      </label>
                      <select
                        name="sessionId"
                        id="sessionId"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a session</option>
                        {sampleSessions.map((session) => (
                          <option key={session.id} value={session.id}>
                            {session.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <select
                        name="departmentId"
                        id="departmentId"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a department</option>
                        {sampleDepartments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="programId" className="block text-sm font-medium text-gray-700 mb-1">
                        Program
                      </label>
                      <select
                        name="programId"
                        id="programId"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a program</option>
                        {samplePrograms.map((prog) => (
                          <option key={prog.id} value={prog.id}>
                            {prog.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="yearLevel" className="block text-sm font-medium text-gray-700 mb-1">
                        Year Level
                      </label>
                      <select
                        name="yearLevel"
                        id="yearLevel"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select year level</option>
                        {[1, 2, 3, 4].map((level) => (
                          <option key={level} value={level}>
                            Level {level}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                        Semester
                      </label>
                      <select
                        name="semester"
                        id="semester"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select semester</option>
                        {[1, 2].map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="studentCount" className="block text-sm font-medium text-gray-700 mb-1">
                        Student Count
                      </label>
                      <input
                        type="number"
                        name="studentCount"
                        id="studentCount"
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="maxCapacity" className="block text-sm font-medium text-gray-700 mb-1">
                        Max Capacity
                      </label>
                      <input
                        type="number"
                        name="maxCapacity"
                        id="maxCapacity"
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Create Class
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {showEditModal && editingClass && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative p-6 w-full max-w-2xl">
            <div className="bg-white rounded-lg shadow-xl">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Edit Class: {editingClass.name}
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowEditModal(false)}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="px-6 py-4">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const formData = {
                    name: (form.querySelector('[name="editName"]') as HTMLInputElement).value,
                    sessionId: (form.querySelector('[name="editSessionId"]') as HTMLSelectElement).value,
                    departmentId: (form.querySelector('[name="editDepartmentId"]') as HTMLSelectElement).value,
                    programId: (form.querySelector('[name="editProgramId"]') as HTMLSelectElement).value,
                    yearLevel: parseInt((form.querySelector('[name="editYearLevel"]') as HTMLSelectElement).value, 10),
                    semester: parseInt((form.querySelector('[name="editSemester"]') as HTMLSelectElement).value, 10),
                    studentCount: parseInt((form.querySelector('[name="editStudentCount"]') as HTMLInputElement).value, 10),
                    maxCapacity: parseInt((form.querySelector('[name="editMaxCapacity"]') as HTMLInputElement).value, 10),
                  };
                  handleEditSubmit(formData);
                }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-1">
                        Class Name
                      </label>
                      <input
                        type="text"
                        name="editName"
                        id="editName"
                        defaultValue={editingClass.name}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter class name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="editSessionId" className="block text-sm font-medium text-gray-700 mb-1">
                        Session
                      </label>
                      <select
                        name="editSessionId"
                        id="editSessionId"
                        defaultValue={editingClass.sessionId}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a session</option>
                        {sampleSessions.map((session) => (
                          <option key={session.id} value={session.id}>
                            {session.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="editDepartmentId" className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <select
                        name="editDepartmentId"
                        id="editDepartmentId"
                        defaultValue={editingClass.departmentId}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a department</option>
                        {sampleDepartments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="editProgramId" className="block text-sm font-medium text-gray-700 mb-1">
                        Program
                      </label>
                      <select
                        name="editProgramId"
                        id="editProgramId"
                        defaultValue={editingClass.programId}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a program</option>
                        {samplePrograms.map((prog) => (
                          <option key={prog.id} value={prog.id}>
                            {prog.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="editYearLevel" className="block text-sm font-medium text-gray-700 mb-1">
                        Year Level
                      </label>
                      <select
                        name="editYearLevel"
                        id="editYearLevel"
                        defaultValue={editingClass.yearLevel}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select year level</option>
                        {[1, 2, 3, 4].map((level) => (
                          <option key={level} value={level}>
                            Level {level}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="editSemester" className="block text-sm font-medium text-gray-700 mb-1">
                        Semester
                      </label>
                      <select
                        name="editSemester"
                        id="editSemester"
                        defaultValue={editingClass.semester}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select semester</option>
                        {[1, 2].map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="editStudentCount" className="block text-sm font-medium text-gray-700 mb-1">
                        Student Count
                      </label>
                      <input
                        type="number"
                        name="editStudentCount"
                        id="editStudentCount"
                        defaultValue={editingClass.studentCount}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="editMaxCapacity" className="block text-sm font-medium text-gray-700 mb-1">
                        Max Capacity
                      </label>
                      <input
                        type="number"
                        name="editMaxCapacity"
                        id="editMaxCapacity"
                        defaultValue={editingClass.maxCapacity}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Class Modal */}
      {showDeleteModal && deletingClass && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative p-6 w-full max-w-md">
            <div className="bg-white rounded-lg shadow-xl">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Confirm Deletion
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="px-6 py-4">
                <p className="text-sm text-gray-900 mb-6">
                  Are you sure you want to delete the class "{deletingClass.name}"? This action cannot be undone.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    onClick={handleDeleteConfirm}
                  >
                    Delete Class
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;
