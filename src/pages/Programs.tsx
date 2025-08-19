import React, { useState } from 'react';
import { Plus, Edit, Trash2, GraduationCap, X, Search, Building2, Users, BookOpen } from 'lucide-react';
import { Program, CreateProgramForm, Department, Session } from '../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProgramSchema, updateProgramSchema } from '../lib/validations';
import type { z } from 'zod';
import { samplePrograms, sampleDepartments, sampleSessions, sampleLecturers, sampleCourses } from '../lib/sampleData';

type CreateProgramSchema = z.infer<typeof createProgramSchema>;
type UpdateProgramSchema = z.infer<typeof updateProgramSchema>;

const Programs: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>(samplePrograms);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const createForm = useForm<CreateProgramSchema>({
    resolver: zodResolver(createProgramSchema),
    defaultValues: {
      name: '',
      code: '',
      departmentId: '',
      sessionId: '',
      degreeType: 'BSc',
      duration: 4
    }
  });

  const updateForm = useForm<UpdateProgramSchema>({
    resolver: zodResolver(updateProgramSchema),
    defaultValues: {
      name: '',
      code: '',
      departmentId: '',
      sessionId: '',
      degreeType: 'BSc',
      duration: 4
    }
  });

  const handleCreateSubmit = (data: CreateProgramSchema) => {
    const programData: Program = {
      ...data,
      id: `prog_${Date.now()}`,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setPrograms(prev => [...prev, programData]);
    createForm.reset();
    setShowCreateForm(false);
  };

  const handleUpdateSubmit = (data: UpdateProgramSchema) => {
    if (!editingProgram) return;
    const updatedProgram: Program = {
      ...editingProgram,
      ...data,
      updatedAt: new Date()
    };
    setPrograms(prev => prev.map(prog => prog.id === editingProgram.id ? updatedProgram : prog));
    updateForm.reset();
    setEditingProgram(null);
  };

  const handleEdit = (program: Program) => {
    setEditingProgram(program);
    updateForm.reset({
      name: program.name,
      code: program.code,
      departmentId: program.departmentId,
      sessionId: program.sessionId,
      degreeType: program.degreeType,
      duration: program.duration
    });
  };

  const handleDelete = (programId: string) => {
    setPrograms(prev => prev.filter(prog => prog.id !== programId));
    setShowDeleteConfirm(null);
  };

  const getDepartmentName = (departmentId: string) => {
    return sampleDepartments.find(dept => dept.id === departmentId)?.name || 'Unknown';
  };

  const getDepartmentCode = (departmentId: string) => {
    return sampleDepartments.find(dept => dept.id === departmentId)?.code || 'Unknown';
  };

  const getSessionName = (sessionId: string) => {
    return sampleSessions.find(session => session.id === sessionId)?.name || 'Unknown';
  };

  const getLecturerCount = (programId: string) => {
    return sampleLecturers.filter(lecturer => lecturer.programs.includes(programId)).length;
  };

  const getCourseCount = (programId: string) => {
    return sampleCourses.filter(course => course.programId === programId).length;
  };

  // Filter programs based on search term
  const filteredPrograms = programs.filter(program =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getDepartmentName(program.departmentId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
          <p className="text-gray-600">Manage academic programs under departments</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Program
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search programs by name, code, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Create Program Form (Modal) */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Program</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Program Name</label>
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
                  <label className="block text-sm font-medium text-gray-700">Program Code</label>
                  <input
                    type="text"
                    {...createForm.register('code')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {createForm.formState.errors.code && (
                    <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.code.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select
                    {...createForm.register('departmentId')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a department</option>
                    {sampleDepartments.map((dept) => (
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
                  <label className="block text-sm font-medium text-gray-700">Session</label>
                  <select
                    {...createForm.register('sessionId')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a session</option>
                    {sampleSessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.name}
                      </option>
                    ))}
                  </select>
                  {createForm.formState.errors.sessionId && (
                    <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.sessionId.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Degree Type</label>
                  <select
                    {...createForm.register('degreeType')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="BSc">BSc</option>
                    <option value="MSc">MSc</option>
                    <option value="PhD">PhD</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Certificate">Certificate</option>
                  </select>
                  {createForm.formState.errors.degreeType && (
                    <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.degreeType.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (years)</label>
                  <input
                    type="number"
                    {...createForm.register('duration', { valueAsNumber: true })}
                    min="1"
                    max="10"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {createForm.formState.errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.duration.message}</p>
                  )}
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
                    Create Program
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Program Form (Modal) */}
      {editingProgram && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Program</h3>
                <button
                  onClick={() => setEditingProgram(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={updateForm.handleSubmit(handleUpdateSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Program Name</label>
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
                  <label className="block text-sm font-medium text-gray-700">Program Code</label>
                  <input
                    type="text"
                    {...updateForm.register('code')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {updateForm.formState.errors.code && (
                    <p className="mt-1 text-sm text-red-600">{updateForm.formState.errors.code.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select
                    {...updateForm.register('departmentId')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a department</option>
                    {sampleDepartments.map((dept) => (
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
                  <label className="block text-sm font-medium text-gray-700">Session</label>
                  <select
                    {...updateForm.register('sessionId')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a session</option>
                    {sampleSessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.name}
                      </option>
                    ))}
                  </select>
                  {updateForm.formState.errors.sessionId && (
                    <p className="mt-1 text-sm text-red-600">{updateForm.formState.errors.sessionId.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Degree Type</label>
                  <select
                    {...updateForm.register('degreeType')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="BSc">BSc</option>
                    <option value="MSc">MSc</option>
                    <option value="PhD">PhD</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Certificate">Certificate</option>
                  </select>
                  {updateForm.formState.errors.degreeType && (
                    <p className="mt-1 text-sm text-red-600">{updateForm.formState.errors.degreeType.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (years)</label>
                  <input
                    type="number"
                    {...updateForm.register('duration', { valueAsNumber: true })}
                    min="1"
                    max="10"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {updateForm.formState.errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{updateForm.formState.errors.duration.message}</p>
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingProgram(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Update Program
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Programs Table */}
      {filteredPrograms.length > 0 ? (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Degree Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lecturers
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
                {filteredPrograms.map((program) => (
                  <tr key={program.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{program.name}</div>
                        <div className="text-sm text-gray-500">{program.code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-900">{getDepartmentName(program.departmentId)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getSessionName(program.sessionId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {program.degreeType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{program.duration} years</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-900">{getLecturerCount(program.id)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-900">{getCourseCount(program.id)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(program)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(program.id)}
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
          <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No programs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'No programs match your search criteria.' : 'Get started by creating a new program.'}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Program
            </button>
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
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Program</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this program? This action cannot be undone.
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
    </div>
  );
};

export default Programs;
