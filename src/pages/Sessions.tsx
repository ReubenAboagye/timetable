import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Clock, X, Search, Calendar, Users } from 'lucide-react';
import { useSessions } from '../store';
import { Session } from '../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSessionSchema, updateSessionSchema } from '../lib/validations';
import type { z } from 'zod';

type CreateSessionSchema = z.infer<typeof createSessionSchema>;
type UpdateSessionSchema = z.infer<typeof updateSessionSchema>;

const Sessions: React.FC = () => {
  const { sessions, dispatch } = useSessions();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const createForm = useForm<CreateSessionSchema>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      name: '',
      numberOfYears: 4,
      workingDays: [
        { day: 'monday', isActive: false, startTime: '08:00', endTime: '17:00' },
        { day: 'tuesday', isActive: false, startTime: '08:00', endTime: '17:00' },
        { day: 'wednesday', isActive: false, startTime: '08:00', endTime: '17:00' },
        { day: 'thursday', isActive: false, startTime: '08:00', endTime: '17:00' },
        { day: 'friday', isActive: false, startTime: '08:00', endTime: '17:00' },
        { day: 'saturday', isActive: false, startTime: '08:00', endTime: '17:00' },
        { day: 'sunday', isActive: false, startTime: '08:00', endTime: '17:00' }
      ]
    }
  });

  const updateForm = useForm<UpdateSessionSchema>({
    resolver: zodResolver(updateSessionSchema),
    defaultValues: {
      name: '',
      numberOfYears: 4,
      workingDays: [
        { day: 'monday', isActive: false, startTime: '08:00', endTime: '17:00' },
        { day: 'tuesday', isActive: false, startTime: '08:00', endTime: '17:00' },
        { day: 'wednesday', isActive: false, startTime: '08:00', endTime: '17:00' },
        { day: 'thursday', isActive: false, startTime: '08:00', endTime: '17:00' },
        { day: 'friday', isActive: false, startTime: '08:00', endTime: '17:00' },
        { day: 'saturday', isActive: false, startTime: '08:00', endTime: '17:00' },
        { day: 'sunday', isActive: false, startTime: '08:00', endTime: '17:00' }
      ]
    }
  });

  // Watch for changes in break start times and clear corresponding end times
  useEffect(() => {
    const subscription = createForm.watch((value, { name }) => {
      if (name && name.startsWith('workingDays.') && name.endsWith('.breakStartTime')) {
        const index = parseInt(name.split('.')[1]);
        const breakStartTime = value.workingDays?.[index]?.breakStartTime;
        
        if (!breakStartTime) {
          createForm.setValue(`workingDays.${index}.breakEndTime`, '');
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [createForm]);

  useEffect(() => {
    const subscription = updateForm.watch((value, { name }) => {
      if (name && name.startsWith('workingDays.') && name.endsWith('.breakStartTime')) {
        const index = parseInt(name.split('.')[1]);
        const breakStartTime = value.workingDays?.[index]?.breakStartTime;
        
        if (!breakStartTime) {
          updateForm.setValue(`workingDays.${index}.breakEndTime`, '');
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [updateForm]);

  const handleCreateSubmit = (data: CreateSessionSchema) => {
    console.log('Form submission started with data:', data);
    
    // Validate that break end time is provided when break start time is set
    const hasInvalidBreakTimes = data.workingDays.some(day => 
      day.isActive && day.breakStartTime && !day.breakEndTime
    );
    
    console.log('Has invalid break times:', hasInvalidBreakTimes);
    
    if (hasInvalidBreakTimes) {
      alert('Please set break end time for all days where break start time is specified.');
      return;
    }

    // Validate that break end time comes after break start time
    const hasInvalidBreakTimeOrder = data.workingDays.some(day => 
      day.isActive && day.breakStartTime && day.breakEndTime && 
      day.breakStartTime >= day.breakEndTime
    );
    
    console.log('Has invalid break time order:', hasInvalidBreakTimeOrder);
    
    if (hasInvalidBreakTimeOrder) {
      alert('Break end time must come after break start time.');
      return;
    }

    console.log('Validation passed, creating session...');

    const sessionData = {
      ...data,
      id: `session_${Date.now()}`,
      workingDays: data.workingDays.map((day, index) => ({
        ...day,
        id: `wd_${Date.now()}_${index}`,
        breakStartTime: day.breakStartTime || undefined,
        breakEndTime: day.breakEndTime || undefined
      })),
      timeSlots: [],
      breakTimes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Session data to be created:', sessionData);
    
    dispatch({ type: 'ADD_SESSION', payload: sessionData });
    console.log('Session dispatched to store');
    
    createForm.reset();
    setShowCreateForm(false);
    
    console.log('Form reset and modal closed');
  };

  const handleUpdateSubmit = (data: UpdateSessionSchema) => {
    if (!editingSession) return;
    
    // Validate that break end time is provided when break start time is set
    if (data.workingDays) {
      const hasInvalidBreakTimes = data.workingDays.some(day => 
        day.isActive && day.breakStartTime && !day.breakEndTime
      );
      
      if (hasInvalidBreakTimes) {
        alert('Please set break end time for all days where break start time is specified.');
        return;
      }

      // Validate that break end time comes after break start time
      const hasInvalidBreakTimeOrder = data.workingDays.some(day => 
        day.isActive && day.breakStartTime && day.breakEndTime && 
        day.breakStartTime >= day.breakEndTime
      );
      
      if (hasInvalidBreakTimeOrder) {
        alert('Break end time must come after break start time.');
        return;
      }
    }

    dispatch({
      type: 'UPDATE_SESSION',
      payload: {
        id: editingSession.id,
        name: data.name || editingSession.name,
        numberOfYears: data.numberOfYears || editingSession.numberOfYears,
        workingDays: data.workingDays ? data.workingDays.map((day, index) => ({
          ...day,
          id: `wd_${Date.now()}_${index}`,
          breakStartTime: day.breakStartTime || undefined,
          breakEndTime: day.breakEndTime || undefined
        })) : editingSession.workingDays,
        timeSlots: editingSession.timeSlots,
        breakTimes: editingSession.breakTimes,
        createdAt: editingSession.createdAt,
        updatedAt: new Date()
      }
    });
    updateForm.reset();
    setEditingSession(null);
  };

  const handleEdit = (session: Session) => {
    setEditingSession(session);
    updateForm.reset({
      name: session.name,
      numberOfYears: session.numberOfYears,
      workingDays: session.workingDays
    });
  };

  const handleDelete = (sessionId: string) => {
    dispatch({ type: 'DELETE_SESSION', payload: sessionId });
    setShowDeleteConfirm(null);
  };

  const getWorkingDaysString = (workingDays: any[]) => {
    const activeDays = workingDays.filter(day => day.isActive).map(day => day.day);
    return activeDays.length > 0 ? activeDays.join(', ') : 'No working days';
  };

  // Filter sessions based on search term
  const filteredSessions = sessions.filter(session =>
    session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.numberOfYears.toString().includes(searchTerm) ||
    getWorkingDaysString(session.workingDays).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Sessions</h1>
          <p className="text-gray-600">Manage academic sessions and their configurations</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Session
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search sessions by name, years, or working days..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Create Session Form (Modal) */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-5 border w-[600px] max-h-[90vh] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Session</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
                <form 
                  onSubmit={createForm.handleSubmit(
                    (data) => {
                      console.log('Form submitted successfully with data:', data);
                      handleCreateSubmit(data);
                    },
                    (errors) => {
                      console.log('Form validation failed with errors:', errors);
                      console.log('Form values:', createForm.getValues());
                      console.log('Form state:', createForm.formState);
                    }
                  )} 
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Session Name</label>
                    <input
                      type="text"
                      {...createForm.register('name', { required: 'Session name is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {createForm.formState.errors.name && (
                      <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Number of Years</label>
                    <input
                      type="number"
                      {...createForm.register('numberOfYears', { required: 'Number of years is required', valueAsNumber: true })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {createForm.formState.errors.numberOfYears && (
                      <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.numberOfYears.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Working Days</label>
                    <div className="mt-1 space-y-3">
                      {(createForm.watch('workingDays') || []).map((day, index) => {
                        const breakStart = createForm.watch(`workingDays.${index}.breakStartTime`);
                        const breakEnd = createForm.watch(`workingDays.${index}.breakEndTime`);
                        const isActive = createForm.watch(`workingDays.${index}.isActive`);
                        const labelClass = 'block text-xs mb-1 ' + (breakStart ? 'text-red-600' : 'text-gray-400');
                        const selectClass = 'w-full text-sm border rounded px-2 py-1 ' +
                          (breakStart && !breakEnd ? 'border-red-300 bg-red-50' : 'border-gray-300') +
                          (!breakStart ? ' bg-gray-100 text-gray-500' : '');
                        return (
                          <div key={index} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center space-x-3 mb-3">
                              <input
                                type="checkbox"
                                {...createForm.register(`workingDays.${index}.isActive`)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label className="text-sm font-medium text-gray-700 capitalize min-w-[80px]">{day.day}</label>
                            </div>
                            {isActive && (
                              <div className="grid grid-cols-2 gap-4 ml-7">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                                  <select
                                    {...createForm.register(`workingDays.${index}.startTime`)}
                                    className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                                  >
                                    {Array.from({ length: 24 }, (_, i) => (
                                      <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                        {i.toString().padStart(2, '0')}:00
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">End Time</label>
                                  <select
                                    {...createForm.register(`workingDays.${index}.endTime`)}
                                    className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                                  >
                                    {Array.from({ length: 24 }, (_, i) => (
                                      <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                        {i.toString().padStart(2, '0')}:00
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Break Start (Optional)</label>
                                  <select
                                    {...createForm.register(`workingDays.${index}.breakStartTime`)}
                                    className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                                    onChange={(e) => {
                                      createForm.setValue(`workingDays.${index}.breakStartTime`, e.target.value);
                                      if (!e.target.value) {
                                        createForm.setValue(`workingDays.${index}.breakEndTime`, '');
                                      }
                                      createForm.trigger(`workingDays.${index}.breakStartTime`);
                                      createForm.trigger(`workingDays.${index}.breakEndTime`);
                                    }}
                                  >
                                    <option value="">No break</option>
                                    {Array.from({ length: 24 }, (_, i) => (
                                      <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                        {i.toString().padStart(2, '0')}:00
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className={labelClass}>
                                    Break End {breakStart ? '(Required)' : '(Disabled)'}
                                  </label>
                                  <select
                                    {...createForm.register(`workingDays.${index}.breakEndTime`)}
                                    className={selectClass}
                                    required={!!breakStart}
                                    disabled={!breakStart}
                                    onChange={(e) => {
                                      createForm.setValue(`workingDays.${index}.breakEndTime`, e.target.value);
                                      createForm.trigger(`workingDays.${index}.breakEndTime`);
                                    }}
                                  >
                                    <option value="">No break</option>
                                    {Array.from({ length: 24 }, (_, i) => (
                                      <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                        {i.toString().padStart(2, '0')}:00
                                      </option>
                                    ))}
                                  </select>
                                  {breakStart && !breakEnd && (
                                    <p className="mt-1 text-xs text-red-600">Break end time is required when break start time is set</p>
                                  )}
                                  {breakStart && breakEnd && (breakStart || '') >= (breakEnd || '') && (
                                    <p className="mt-1 text-xs text-red-600">Break end time must come after break start time</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
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
                      onClick={() => {
                        console.log('Submit button clicked');
                        console.log('Form errors:', createForm.formState.errors);
                        console.log('Form values:', createForm.getValues());
                        console.log('Form is valid:', createForm.formState.isValid);
                        console.log('Form is dirty:', createForm.formState.isDirty);
                      }}
                    >
                      Create Session
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Session Form (Modal) */}
      {editingSession && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 mx-auto p-5 border w-[600px] max-h-[90vh] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Session</h3>
                <button
                  onClick={() => setEditingSession(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
                <form onSubmit={updateForm.handleSubmit(handleUpdateSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Session Name</label>
                    <input
                      type="text"
                      {...updateForm.register('name', { required: 'Session name is required' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {updateForm.formState.errors.name && (
                      <p className="mt-1 text-sm text-red-600">{updateForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Number of Years</label>
                    <input
                      type="number"
                      {...updateForm.register('numberOfYears', { required: 'Number of years is required', valueAsNumber: true })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {updateForm.formState.errors.numberOfYears && (
                      <p className="mt-1 text-sm text-red-600">{updateForm.formState.errors.numberOfYears.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Working Days</label>
                    <div className="mt-1 space-y-3">
                      {(updateForm.watch('workingDays') || []).map((day, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center space-x-3 mb-3">
                            <input
                              type="checkbox"
                              {...updateForm.register(`workingDays.${index}.isActive`)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="text-sm font-medium text-gray-700 capitalize min-w-[80px]">{day.day}</label>
                          </div>
                          {updateForm.watch(`workingDays.${index}.isActive`) && (
                            <div className="grid grid-cols-2 gap-4 ml-7">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                                <select
                                  {...updateForm.register(`workingDays.${index}.startTime`)}
                                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                                >
                                  {Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                      {i.toString().padStart(2, '0')}:00
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">End Time</label>
                                <select
                                  {...updateForm.register(`workingDays.${index}.endTime`)}
                                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                                >
                                  {Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                      {i.toString().padStart(2, '0')}:00
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">Break Start (Optional)</label>
                                <select
                                  {...updateForm.register(`workingDays.${index}.breakStartTime`)}
                                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                                  onChange={(e) => {
                                    // Update the form value
                                    updateForm.setValue(`workingDays.${index}.breakStartTime`, e.target.value);
                                    
                                    // If break start time is cleared, also clear break end time
                                    if (!e.target.value) {
                                      updateForm.setValue(`workingDays.${index}.breakEndTime`, '');
                                    }
                                    
                                    // Trigger validation for both fields
                                    updateForm.trigger(`workingDays.${index}.breakStartTime`);
                                    updateForm.trigger(`workingDays.${index}.breakEndTime`);
                                  }}
                                >
                                  <option value="">No break</option>
                                  {Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                      {i.toString().padStart(2, '0')}:00
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className={`block text-xs mb-1 ${updateForm.watch(`workingDays.${index}.breakStartTime`) ? 'text-red-600' : 'text-gray-400'}`}>
                                  Break End {updateForm.watch(`workingDays.${index}.breakStartTime`) ? '(Required)' : '(Disabled)'}
                                </label>
                                <select
                                  {...updateForm.register(`workingDays.${index}.breakEndTime`)}
                                  className={`w-full text-sm border rounded px-2 py-1 ${
                                    updateForm.watch(`workingDays.${index}.breakStartTime`) && !updateForm.watch(`workingDays.${index}.breakEndTime`) 
                                      ? 'border-red-300 bg-red-50' 
                                      : 'border-gray-300'
                                  } ${!updateForm.watch(`workingDays.${index}.breakStartTime`) ? 'bg-gray-100 text-gray-500' : ''}`}
                                  required={!!updateForm.watch(`workingDays.${index}.breakStartTime`)}
                                  disabled={!updateForm.watch(`workingDays.${index}.breakStartTime`)}
                                  onChange={(e) => {
                                    // Update the form value
                                    updateForm.setValue(`workingDays.${index}.breakEndTime`, e.target.value);
                                    // Trigger validation
                                    updateForm.trigger(`workingDays.${index}.breakEndTime`);
                                  }}
                                >
                                  <option value="">No break</option>
                                  {Array.from({ length: 24 }, (_, i) => (
                                    <option key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                      {i.toString().padStart(2, '0')}:00
                                    </option>
                                  ))}
                                </select>
                                {updateForm.watch(`workingDays.${index}.breakStartTime`) && !updateForm.watch(`workingDays.${index}.breakEndTime`) && (
                                  <p className="mt-1 text-xs text-red-600">Break end time is required when break start time is set</p>
                                )}
                                {updateForm.watch(`workingDays.${index}.breakStartTime`) && updateForm.watch(`workingDays.${index}.breakEndTime`) && 
                                 (updateForm.watch(`workingDays.${index}.breakStartTime`) || '') >= (updateForm.watch(`workingDays.${index}.breakEndTime`) || '') && (
                                  <p className="mt-1 text-xs text-red-600">Break end time must come after break start time</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setEditingSession(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Update Session
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sessions Table */}
      {filteredSessions.length > 0 ? (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Working Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{session.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getWorkingDaysString(session.workingDays)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(session)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(session.id)}
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
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'No sessions match your search criteria.' : 'Get started by creating a new session.'}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Session
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
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Session</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this session? This action cannot be undone.
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

export default Sessions;
