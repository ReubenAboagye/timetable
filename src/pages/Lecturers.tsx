import React, { useState, useRef, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Building2, X, Search, BookOpen, Upload } from 'lucide-react';
import { useLecturers, useDepartments, useCourses } from '../store';
import { samplePrograms } from '../lib/sampleData';
import { Link } from 'react-router-dom';
import { Lecturer } from '../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLecturerSchema, updateLecturerSchema } from '../lib/validations';
import type { z } from 'zod';

type CreateLecturerSchema = z.infer<typeof createLecturerSchema>;
type UpdateLecturerSchema = z.infer<typeof updateLecturerSchema>;

const Lecturers: React.FC = () => {
  const { lecturers, dispatch } = useLecturers();
  const { departments } = useDepartments();
  const { courses } = useCourses();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState<Lecturer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportForm, setShowImportForm] = useState(false);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [editingCourseSearchTerm, setEditingCourseSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createForm = useForm<CreateLecturerSchema>({
    resolver: zodResolver(createLecturerSchema),
    defaultValues: {
      name: '', departmentId: '', programs: [], courses: []
    }
  });

  const updateForm = useForm<UpdateLecturerSchema>({
    resolver: zodResolver(updateLecturerSchema),
    defaultValues: {
      name: '', departmentId: '', programs: [], courses: []
    }
  });

  // Watch the courses field to trigger re-renders
  const watchedCreateCourses = createForm.watch('courses') || [];
  const watchedUpdateCourses = updateForm.watch('courses') || [];

  // Watch department changes to automatically assign programs
  const watchedCreateDepartment = createForm.watch('departmentId');
  const watchedUpdateDepartment = updateForm.watch('departmentId');

  // Auto-assign programs when department changes
  useEffect(() => {
    if (watchedCreateDepartment) {
      const departmentPrograms = getProgramsByDepartment(watchedCreateDepartment);
      const programIds = departmentPrograms.map(program => program.id);
      createForm.setValue('programs', programIds);
    }
  }, [watchedCreateDepartment, createForm]);

  useEffect(() => {
    if (watchedUpdateDepartment) {
      const departmentPrograms = getProgramsByDepartment(watchedUpdateDepartment);
      const programIds = departmentPrograms.map(program => program.id);
      updateForm.setValue('programs', programIds);
    }
  }, [watchedUpdateDepartment, updateForm]);

  const handleCreateSubmit = (data: CreateLecturerSchema) => {
    const lecturerData: Lecturer = {
      id: `lect_${Date.now()}`,
      name: data.name,
      departmentId: data.departmentId,
      programs: data.programs || [],
      courses: data.courses || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    dispatch({ type: 'ADD_LECTURER', payload: lecturerData });
    createForm.reset();
    setCourseSearchTerm('');
    setShowCreateForm(false);
  };

  const handleUpdateSubmit = (data: UpdateLecturerSchema) => {
    if (!editingLecturer) return;
    dispatch({
      type: 'UPDATE_LECTURER',
      payload: {
        id: editingLecturer.id,
        name: data.name || editingLecturer.name,
        departmentId: data.departmentId || editingLecturer.departmentId,
        programs: data.programs || editingLecturer.programs,
        courses: data.courses || editingLecturer.courses,
        createdAt: editingLecturer.createdAt,
        updatedAt: new Date()
      }
    });
    updateForm.reset();
    setEditingCourseSearchTerm('');
    setEditingLecturer(null);
  };

  const handleEdit = (lecturer: Lecturer) => {
    setEditingLecturer(lecturer);
    setEditingCourseSearchTerm('');
    updateForm.reset({
      name: lecturer.name, 
      departmentId: lecturer.departmentId, 
      programs: lecturer.programs,
      courses: lecturer.courses
    });
  };

  const handleAssignCourses = (lecturerId: string, courseIds: string[]) => {
    dispatch({ 
      type: 'ASSIGN_COURSES_TO_LECTURER', 
      payload: { lecturerId, courseIds } 
    });
  };

  const handleDelete = (lecturerId: string) => {
    dispatch({ type: 'DELETE_LECTURER', payload: lecturerId });
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

  const getAssignedCourses = (lecturerId: string) => {
    const lecturer = lecturers.find(l => l.id === lecturerId);
    if (!lecturer) return [];
    return courses.filter(course => lecturer.courses.includes(course.id));
  };

  const getProgramsByDepartment = (departmentId: string) => {
    return samplePrograms.filter(program => program.departmentId === departmentId);
  };

  // Filter lecturers based on search term
  const filteredLecturers = lecturers.filter(lecturer =>
    lecturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getDepartmentName(lecturer.departmentId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lecturers = JSON.parse(content);
        
        if (Array.isArray(lecturers)) {
          lecturers.forEach(lecturer => {
            const lecturerData: Lecturer = {
              ...lecturer,
              id: `lect_${Date.now()}_${Math.random()}`,
              courses: lecturer.courses || [],
              createdAt: new Date(),
              updatedAt: new Date()
            };
            dispatch({ type: 'ADD_LECTURER', payload: lecturerData });
          });
          alert(`Successfully imported ${lecturers.length} lecturers`);
        } else {
          alert('Invalid file format. Please upload a JSON file with an array of lecturers.');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lecturers</h1>
          <p className="text-gray-600">Manage faculty members and their course assignments</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleImportClick}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Lecturers
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Lecturer
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
          placeholder="Search lecturers by name or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Create Lecturer Form (Modal) */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Lecturer</h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setCourseSearchTerm('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
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
                  <label className="block text-sm font-medium text-gray-700">Programs</label>
                  <div className="text-sm text-gray-500 mb-2">
                    Programs will be automatically assigned based on the selected department
                  </div>
                  {watchedCreateDepartment && (
                    <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 bg-gray-50">
                      {getProgramsByDepartment(watchedCreateDepartment).map((program) => (
                        <div key={program.id} className="text-sm text-gray-700 py-1">
                          {program.code} - {program.name}
                        </div>
                      ))}
                      {getProgramsByDepartment(watchedCreateDepartment).length === 0 && (
                        <span className="text-gray-500 text-sm">No programs found for this department</span>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Courses</label>
                  <div className="space-y-2">
                    {/* Course search input */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Type course code to search..."
                        value={courseSearchTerm}
                        onChange={(e) => setCourseSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const matchingCourse = courses.find(course => 
                              course.code.toLowerCase().includes(courseSearchTerm.toLowerCase()) && 
                              courseSearchTerm.length > 0
                            );
                            if (matchingCourse) {
                              const currentCourses = watchedCreateCourses;
                              if (!currentCourses.includes(matchingCourse.id)) {
                                createForm.setValue('courses', [...currentCourses, matchingCourse.id]);
                                setCourseSearchTerm('');
                              }
                            }
                          }
                        }}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {/* Search suggestions */}
                      {courseSearchTerm.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-32 overflow-y-auto">
                          {courses
                            .filter(course => 
                              course.code.toLowerCase().includes(courseSearchTerm.toLowerCase()) &&
                              !watchedCreateCourses.includes(course.id)
                            )
                            .slice(0, 5)
                            .map(course => (
                              <div
                                key={course.id}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                onClick={() => {
                                  const currentCourses = watchedCreateCourses;
                                  createForm.setValue('courses', [...currentCourses, course.id]);
                                  setCourseSearchTerm('');
                                }}
                              >
                                {course.code} - {course.name}
                              </div>
                            ))}
                          {courses.filter(course => 
                            course.code.toLowerCase().includes(courseSearchTerm.toLowerCase()) &&
                            !watchedCreateCourses.includes(course.id)
                          ).length === 0 && (
                            <div className="px-3 py-2 text-gray-500 text-sm">
                              No courses found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Selected courses display */}
                    <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                      {watchedCreateCourses.map((courseId) => {
                        const course = courses.find(c => c.id === courseId);
                        if (!course) return null;
                        return (
                          <div key={course.id} className="flex items-center justify-between py-1 px-2 bg-blue-50 rounded mb-1">
                            <span className="text-sm text-gray-700">
                              {course.code} - {course.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const currentCourses = createForm.getValues('courses') || [];
                                createForm.setValue('courses', currentCourses.filter(id => id !== course.id));
                              }}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                      {watchedCreateCourses.length === 0 && (
                        <span className="text-gray-500 text-sm">No courses assigned</span>
                      )}
                    </div>
                  </div>
                  {createForm.formState.errors.courses && (
                    <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.courses.message}</p>
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setCourseSearchTerm('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create Lecturer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lecturer Form (Modal) */}
      {editingLecturer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Lecturer</h3>
                <button
                  onClick={() => {
                    setEditingLecturer(null);
                    setEditingCourseSearchTerm('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={updateForm.handleSubmit(handleUpdateSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
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
                  <label className="block text-sm font-medium text-gray-700">Programs</label>
                  <div className="text-sm text-gray-500 mb-2">
                    Programs will be automatically assigned based on the selected department
                  </div>
                  {watchedUpdateDepartment && (
                    <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 bg-gray-50">
                      {getProgramsByDepartment(watchedUpdateDepartment).map((program) => (
                        <div key={program.id} className="text-sm text-gray-700 py-1">
                          {program.code} - {program.name}
                        </div>
                      ))}
                      {getProgramsByDepartment(watchedUpdateDepartment).length === 0 && (
                        <span className="text-gray-500 text-sm">No programs found for this department</span>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Courses</label>
                  <div className="space-y-2">
                    {/* Course search input */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Type course code to search..."
                        value={editingCourseSearchTerm}
                        onChange={(e) => setEditingCourseSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const matchingCourse = courses.find(course => 
                              course.code.toLowerCase().includes(editingCourseSearchTerm.toLowerCase()) && 
                              editingCourseSearchTerm.length > 0
                            );
                            if (matchingCourse) {
                              const currentCourses = watchedUpdateCourses;
                              if (!currentCourses.includes(matchingCourse.id)) {
                                updateForm.setValue('courses', [...currentCourses, matchingCourse.id]);
                                setEditingCourseSearchTerm('');
                              }
                            }
                          }
                        }}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {/* Search suggestions */}
                      {editingCourseSearchTerm.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-32 overflow-y-auto">
                          {courses
                            .filter(course => 
                              course.code.toLowerCase().includes(editingCourseSearchTerm.toLowerCase()) &&
                              !watchedUpdateCourses.includes(course.id)
                            )
                            .slice(0, 5)
                            .map(course => (
                              <div
                                key={course.id}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                onClick={() => {
                                  const currentCourses = watchedUpdateCourses;
                                  updateForm.setValue('courses', [...currentCourses, course.id]);
                                  setEditingCourseSearchTerm('');
                                }}
                              >
                                {course.code} - {course.name}
                              </div>
                            ))}
                          {courses.filter(course => 
                            course.code.toLowerCase().includes(editingCourseSearchTerm.toLowerCase()) &&
                            !watchedUpdateCourses.includes(course.id)
                          ).length === 0 && (
                            <div className="px-3 py-2 text-gray-500 text-sm">
                              No courses found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Selected courses display */}
                    <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                      {watchedUpdateCourses.map((courseId) => {
                        const course = courses.find(c => c.id === courseId);
                        if (!course) return null;
                        return (
                          <div key={course.id} className="flex items-center justify-between py-1 px-2 bg-blue-50 rounded mb-1">
                            <span className="text-sm text-gray-700">
                              {course.code} - {course.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const currentCourses = updateForm.getValues('courses') || [];
                                updateForm.setValue('courses', currentCourses.filter(id => id !== course.id));
                              }}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                      {watchedUpdateCourses.length === 0 && (
                        <span className="text-gray-500 text-sm">No courses assigned</span>
                      )}
                    </div>
                  </div>
                  {updateForm.formState.errors.courses && (
                    <p className="mt-1 text-sm text-red-600">{updateForm.formState.errors.courses.message}</p>
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingLecturer(null);
                      setEditingCourseSearchTerm('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Update Lecturer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Lecturers Table */}
      {filteredLecturers.length > 0 ? (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lecturer
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Programs
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Courses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLecturers.map((lecturer) => (
                  <tr key={lecturer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lecturer.name}</div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getDepartmentName(lecturer.departmentId)}</div>
                      <div className="text-sm text-gray-500">{getDepartmentCode(lecturer.departmentId)}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {lecturer.programs.length > 0 ? (
                          <div className="flex items-center space-x-2">
                            {/* Show first program code */}
                            <span className="text-xs text-gray-700">
                              {samplePrograms.find(p => p.id === lecturer.programs[0])?.code}
                            </span>
                            
                            {/* Show second program code if exists */}
                            {lecturer.programs.length > 1 && (
                              <span className="text-xs text-gray-700">
                                {samplePrograms.find(p => p.id === lecturer.programs[1])?.code}
                              </span>
                            )}
                            
                            {/* Show dropdown arrow for remaining programs if more than 2 */}
                            {lecturer.programs.length > 2 && (
                              <div className="relative group">
                                <button className="text-gray-400 hover:text-gray-600">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-32">
                                  <div className="py-2">
                                    {lecturer.programs.slice(2).map(programId => {
                                      const program = samplePrograms.find(p => p.id === programId);
                                      return program ? (
                                        <div key={program.id} className="px-3 py-1 hover:bg-gray-50 text-xs">
                                          <span className="text-gray-700">
                                            {program.code}
                                          </span>
                                        </div>
                                      ) : null;
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs">No programs assigned</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {lecturer.courses.length > 0 ? (
                          <div className="flex items-center space-x-2">
                            {/* Show first course code */}
                            <span className="text-xs text-gray-700">
                              {getAssignedCourses(lecturer.id)[0]?.code}
                            </span>
                            
                            {/* Show second course code if exists */}
                            {lecturer.courses.length > 1 && (
                              <span className="text-xs text-gray-700">
                                {getAssignedCourses(lecturer.id)[1]?.code}
                              </span>
                            )}
                            
                            {/* Show dropdown arrow for remaining courses if more than 2 */}
                            {lecturer.courses.length > 2 && (
                              <div className="relative group">
                                <button className="text-gray-400 hover:text-gray-600">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-32">
                                  <div className="py-2">
                                    {getAssignedCourses(lecturer.id).slice(2).map(course => (
                                      <div key={course.id} className="px-3 py-1 hover:bg-gray-50 text-xs">
                                        <span className="text-gray-700">
                                          {course.code}
                                        </span>
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
                          onClick={() => handleEdit(lecturer)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(lecturer.id)}
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
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No lecturers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'No lecturers match your search criteria.' : 'Get started by creating a new lecturer.'}
          </p>
          <div className="mt-6">
            {departments.length > 0 ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Lecturer
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
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Lecturer</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this lecturer? This action cannot be undone.
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

export default Lecturers;
