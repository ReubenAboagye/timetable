import React, { useState, useRef } from 'react';
import { Plus, Edit, Trash2, BookOpen, Users, Building2, X, Search, Upload, Filter } from 'lucide-react';
import { useCourses, useDepartments, useLecturers, useSessions } from '../store';
import { Link } from 'react-router-dom';
import { Course, CreateCourseData, Class } from '../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCourseSchema, updateCourseSchema } from '../lib/validations';
import { sampleClasses, samplePrograms } from '../lib/sampleData';
import type { z } from 'zod';

type CreateCourseSchema = z.infer<typeof createCourseSchema>;
type UpdateCourseSchema = z.infer<typeof updateCourseSchema>;

const Courses: React.FC = () => {
  const { courses, dispatch } = useCourses();
  const { departments } = useDepartments();
  const { lecturers } = useLecturers();
  const { sessions } = useSessions();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportForm, setShowImportForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createForm = useForm<CreateCourseSchema>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      name: '', code: '', creditHours: 3, yearLevel: 1, semester: 1, isCore: true, departmentId: '', programId: '', sessionId: '', lecturerId: ''
    }
  });

  const updateForm = useForm<UpdateCourseSchema>({
    resolver: zodResolver(updateCourseSchema),
    defaultValues: {
      name: '', code: '', creditHours: 3, yearLevel: 1, semester: 1, isCore: true, departmentId: '', programId: '', sessionId: '', lecturerId: ''
    }
  });

  const handleCreateSubmit = (data: CreateCourseSchema) => {
    const courseData: CreateCourseData = {
      ...data,
      id: `course_${Date.now()}`,
      programId: data.programId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    dispatch({ type: 'ADD_COURSE', payload: courseData });
    createForm.reset();
    setShowCreateForm(false);
  };

  const handleUpdateSubmit = (data: UpdateCourseSchema) => {
    if (!editingCourse) return;
    dispatch({
      type: 'UPDATE_COURSE',
      payload: {
        id: editingCourse.id,
        name: data.name || editingCourse.name,
        code: data.code || editingCourse.code,
        creditHours: data.creditHours || editingCourse.creditHours,
        departmentId: data.departmentId || editingCourse.departmentId,
        programId: data.programId || editingCourse.programId,
        sessionId: data.sessionId || editingCourse.sessionId,
        yearLevel: data.yearLevel || editingCourse.yearLevel,
        semester: data.semester || editingCourse.semester,
        isCore: data.isCore !== undefined ? data.isCore : editingCourse.isCore,
        prerequisites: data.prerequisites || editingCourse.prerequisites,
        lecturerId: data.lecturerId || editingCourse.lecturerId,
        createdAt: editingCourse.createdAt,
        updatedAt: new Date()
      }
    });
    updateForm.reset();
    setEditingCourse(null);
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    updateForm.reset({
      name: course.name, code: course.code, creditHours: course.creditHours, yearLevel: course.yearLevel, semester: course.semester, isCore: course.isCore, departmentId: course.departmentId, programId: course.programId, sessionId: course.sessionId, lecturerId: course.lecturerId
    });
  };

  const handleDelete = (courseId: string) => {
    dispatch({ type: 'DELETE_COURSE', payload: courseId });
    setShowDeleteConfirm(null);
  };

  const getDepartmentName = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : 'Unknown Department';
  };

  const getDepartmentCode = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.code : 'N/A';
  };

  const getLecturerName = (lecturerId: string) => {
    const lecturer = lecturers.find(l => l.id === lecturerId);
    return lecturer ? lecturer.name : 'Unassigned';
  };

  const getSessionName = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    return session ? session.name : 'Unknown Session';
  };

  const getAssignedLecturers = (courseId: string) => {
    // Find all lecturers assigned to this course
    // For now, we'll check if the lecturer has any courses assigned
    // This is a simplified approach - in a real system, you'd have a many-to-many relationship
    const course = courses.find(c => c.id === courseId);
    if (!course?.lecturerId) return [];
    
    const lecturer = lecturers.find(l => l.id === course.lecturerId);
    return lecturer ? [lecturer] : [];
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const courses = JSON.parse(content);
        
        if (Array.isArray(courses)) {
          courses.forEach(course => {
            const courseData: CreateCourseData = {
              ...course,
              id: `course_${Date.now()}_${Math.random()}`,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            dispatch({ type: 'ADD_COURSE', payload: courseData });
          });
          alert(`Successfully imported ${courses.length} courses`);
        } else {
          alert('Invalid file format. Please upload a JSON file with an array of courses.');
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

  // Helper function to format course code and remove leading zeros
  const formatCourseCode = (code: string) => {
    // Remove leading zeros from numbers in the course code
    return code.replace(/\b0+(\d)/g, '$1');
  };

  const clearFilters = () => {
    setSelectedSession('');
    setSelectedDepartment('');
    setSelectedLevel('');
  };

    // Helper function to extract year level and semester from course code
  const getCourseCodeInfo = (courseCode: string) => {
    // Extract numbers from course code (e.g., "ITC356" -> "356")
    const numbers = courseCode.replace(/\D/g, '');
    
    if (numbers.length >= 2) {
      const firstDigit = parseInt(numbers[0]);
      const secondDigit = parseInt(numbers[1]);
      
      // First digit represents year level (1, 2, 3, 4, etc.) - cannot be 0
      if (firstDigit === 0) return null;
      
      const yearLevel = firstDigit;
      
      // Second digit represents semester count since Year 1
      // Year 1: semesters 1-2, Year 2: semesters 3-4, Year 3: semesters 5-6, etc.
      const semester = secondDigit;
      
      return { yearLevel, semester };
    }
    
    return null;
  };

  // Filter courses based on search term and filters
  const filteredCourses = courses.filter(course => {
    // Text search filter
    const matchesSearch = 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getDepartmentName(course.departmentId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getSessionName(course.sessionId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getLecturerName(course.lecturerId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      // Search by course code year level and semester
      (() => {
        const codeInfo = getCourseCodeInfo(course.code);
        if (codeInfo) {
          return `year ${codeInfo.yearLevel}`.includes(searchTerm.toLowerCase()) ||
                 `semester ${codeInfo.semester}`.includes(searchTerm.toLowerCase()) ||
                 `level ${codeInfo.yearLevel}00`.includes(searchTerm.toLowerCase());
        }
        return false;
      })();

    // Session filter
    const matchesSession = !selectedSession || course.sessionId === selectedSession;

    // Department filter
    const matchesDepartment = !selectedDepartment || course.departmentId === selectedDepartment;

    // Level filter - use course code logic instead of yearLevel field
    let matchesLevel = true;
    if (selectedLevel) {
      const courseCodeInfo = getCourseCodeInfo(course.code);
      if (courseCodeInfo) {
        // selectedLevel is the year (e.g., "3" for Year 3)
        matchesLevel = courseCodeInfo.yearLevel.toString() === selectedLevel;
      } else {
        // Fallback to the yearLevel field if course code parsing fails
        matchesLevel = course.yearLevel.toString() === selectedLevel;
      }
    }

    return matchesSearch && matchesSession && matchesDepartment && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600">Manage academic courses and their configurations</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          <button
            onClick={handleImportClick}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Courses
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Course
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search courses by name, code, department, session, or lecturer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

          {/* Filters */}
    {showFilters && (
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear All
          </button>
        </div>
        

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session</label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">All Sessions</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name}
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
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
                      <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Levels</option>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                <option key={level} value={level.toString()}>
                  Year {level} (Level {level}00)
                </option>
              ))}
            </select>
          </div>
          </div>
        </div>
      )}

      {/* Create Course Form (Modal) */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Course</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course Name</label>
                  <input
                    type="text"
                    {...createForm.register('name')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {createForm.formState.errors.name && (
                    <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course Code</label>
                  <input
                    type="text"
                    {...createForm.register('code')}
                    onChange={(e) => {
                      const formatted = formatCourseCode(e.target.value);
                      createForm.setValue('code', formatted);
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {createForm.formState.errors.code && (
                    <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.code.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Credit Hours</label>
                  <input
                    type="number"
                    {...createForm.register('creditHours', { valueAsNumber: true })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {createForm.formState.errors.creditHours && (
                    <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.creditHours.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select
                    {...createForm.register('departmentId')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                  {createForm.formState.errors.departmentId && (
                    <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.departmentId.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Program</label>
                  <select
                    {...createForm.register('programId')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Program</option>
                    {samplePrograms.map((prog) => (
                      <option key={prog.id} value={prog.id}>
                        {prog.name} ({prog.code})
                      </option>
                    ))}
                  </select>
                  {createForm.formState.errors.programId && (
                    <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.programId.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Session</label>
                  <select
                    {...createForm.register('sessionId')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Session</option>
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.name}
                      </option>
                    ))}
                  </select>
                  {createForm.formState.errors.sessionId && (
                    <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.sessionId.message}</p>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...createForm.register('isCore')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Core Course</label>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Form (Modal) */}
      {editingCourse && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Course</h3>
                <button
                  onClick={() => setEditingCourse(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={updateForm.handleSubmit(handleUpdateSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course Name</label>
                  <input
                    type="text"
                    {...updateForm.register('name')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {updateForm.formState.errors.name && (
                    <p className="mt-1 text-sm text-red-600">{updateForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Course Code</label>
                  <input
                    type="text"
                    {...updateForm.register('code')}
                    onChange={(e) => {
                      const formatted = formatCourseCode(e.target.value);
                      updateForm.setValue('code', formatted);
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {updateForm.formState.errors.code && (
                    <p className="mt-1 text-sm text-red-600">{updateForm.formState.errors.code.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Credit Hours</label>
                  <input
                    type="number"
                    {...updateForm.register('creditHours', { valueAsNumber: true })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {updateForm.formState.errors.creditHours && (
                    <p className="mt-1 text-sm text-red-600">{updateForm.formState.errors.creditHours.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select
                    {...updateForm.register('departmentId')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                  {updateForm.formState.errors.departmentId && (
                    <p className="mt-1 text-sm text-red-600">{updateForm.formState.errors.departmentId.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Program</label>
                  <select
                    {...updateForm.register('programId')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Program</option>
                    {samplePrograms.map((prog) => (
                      <option key={prog.id} value={prog.id}>
                        {prog.name} ({prog.code})
                      </option>
                    ))}
                  </select>
                  {updateForm.formState.errors.programId && (
                    <p className="mt-1 text-sm text-red-600">{updateForm.formState.errors.programId.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Session</label>
                  <select
                    {...updateForm.register('sessionId')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Session</option>
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.name}
                      </option>
                    ))}
                  </select>
                  {updateForm.formState.errors.sessionId && (
                    <p className="mt-1 text-sm text-red-600">{updateForm.formState.errors.sessionId.message}</p>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...updateForm.register('isCore')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Core Course</label>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingCourse(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Update Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Courses Table */}
      {filteredCourses.length > 0 ? (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
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
                    Credit Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lecturer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Classes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{course.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {course.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{getSessionName(course.sessionId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getDepartmentName(course.departmentId)}</div>
                      <div className="text-sm text-gray-500">{getDepartmentCode(course.departmentId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {samplePrograms.find(p => p.id === course.programId)?.name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.creditHours}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(() => {
                          const assignedLecturers = getAssignedLecturers(course.id);
                          if (assignedLecturers.length === 0) {
                            return <span className="text-gray-500">Unassigned</span>;
                          }
                          
                          return (
                            <div className="space-y-1">
                              {/* Show first lecturer */}
                              <div className="flex items-center text-xs">
                                <Users className="h-3 w-3 mr-1 text-blue-500" />
                                <span className="truncate max-w-32" title={assignedLecturers[0].name}>
                                  {assignedLecturers[0].name}
                                </span>
                              </div>
                              
                              {/* Show dropdown for remaining lecturers if more than 1 */}
                              {assignedLecturers.length > 1 && (
                                <div className="relative group">
                                  <button className="text-xs text-blue-600 hover:text-blue-800 underline">
                                    +{assignedLecturers.length - 1} more lecturers
                                  </button>
                                  <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-48">
                                    <div className="py-2">
                                      {assignedLecturers.slice(1).map(lecturer => (
                                        <div key={lecturer.id} className="px-3 py-1 hover:bg-gray-50 text-xs">
                                          <div className="flex items-center">
                                            <Users className="h-3 w-3 mr-2 text-blue-500" />
                                            <span className="truncate" title={lecturer.name}>
                                              {lecturer.name}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        course.isCore 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {course.isCore ? 'Core' : 'Elective'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {(() => {
                          // Find classes that are taking this course based on session, department, and level
                          const matchingClasses = sampleClasses.filter((cls: Class) => 
                            cls.sessionId === course.sessionId &&
                            cls.departmentId === course.departmentId &&
                            cls.yearLevel === course.yearLevel &&
                            cls.semester === course.semester
                          );
                          
                          if (matchingClasses.length === 0) {
                            return <span className="text-gray-500">No classes assigned</span>;
                          }
                          
                          return (
                            <div className="space-y-1">
                              {/* Show first class */}
                              <div className="flex items-center text-xs">
                                <Users className="h-3 w-3 mr-1 text-green-500" />
                                <span className="truncate max-w-32" title={`${matchingClasses[0].name} (${matchingClasses[0].studentCount} students)`}>
                                  {matchingClasses[0].name} ({matchingClasses[0].studentCount})
                                </span>
                              </div>
                              
                              {/* Show dropdown for remaining classes if more than 1 */}
                              {matchingClasses.length > 1 && (
                                <div className="relative group">
                                  <button className="text-xs text-green-600 hover:text-green-800 underline">
                                    +{matchingClasses.length - 1} more classes
                                  </button>
                                  <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-48">
                                    <div className="py-2">
                                      {matchingClasses.slice(1).map((cls: Class) => (
                                        <div key={cls.id} className="px-3 py-1 hover:bg-gray-50 text-xs">
                                          <div className="flex items-center">
                                            <Users className="h-3 w-3 mr-2 text-green-500" />
                                            <span className="truncate" title={`${cls.name} (${cls.studentCount} students)`}>
                                              {cls.name} ({cls.studentCount})
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(course)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(course.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedSession || selectedDepartment || selectedLevel ? 'No courses match your search criteria.' : 'Get started by creating a new course.'}
          </p>
          <div className="mt-6">
            {departments.length > 0 ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Course
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">You need to create a department first</p>
                <Link to="/departments" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Go to Departments
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Course</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this course? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
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
    </div>
  );
};

export default Courses;
