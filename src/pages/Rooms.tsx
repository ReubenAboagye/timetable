import React, { useState, useRef } from 'react';
import { Plus, Edit, Trash2, MapPin, Building2, Users, X, Search, Plus as PlusIcon, Upload } from 'lucide-react';
import { useRooms } from '../store';
import { Room, CreateRoomForm } from '../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRoomSchema, updateRoomSchema } from '../lib/validations';
import { getRoomTypesArray, getRoomTypeName, getRoomTypeColor } from '../lib/utils';
import type { z } from 'zod';

type CreateRoomSchema = z.infer<typeof createRoomSchema>;
type UpdateRoomSchema = z.infer<typeof updateRoomSchema>;

const Rooms: React.FC = () => {
  const { rooms, dispatch } = useRooms();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportForm, setShowImportForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createForm = useForm<CreateRoomSchema>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: '', building: '', floor: '', capacity: 30, roomType: 'lecture_hall', facilities: ['']
    }
  });

  const updateForm = useForm<UpdateRoomSchema>({
    resolver: zodResolver(updateRoomSchema),
    defaultValues: {
      name: '', building: '', floor: '', capacity: 30, roomType: 'lecture_hall', facilities: ['']
    }
  });

  const handleCreateSubmit = (data: CreateRoomSchema) => {
    const roomData: Room = {
      ...data,
      id: `room_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    dispatch({ type: 'ADD_ROOM', payload: roomData });
    createForm.reset();
    setShowCreateForm(false);
  };

  const handleUpdateSubmit = (data: UpdateRoomSchema) => {
    if (!editingRoom) return;
    dispatch({
      type: 'UPDATE_ROOM',
      payload: {
        id: editingRoom.id,
        name: data.name || editingRoom.name,
        building: data.building || editingRoom.building,
        floor: data.floor || editingRoom.floor,
        capacity: data.capacity || editingRoom.capacity,
        roomType: data.roomType || editingRoom.roomType,
        facilities: data.facilities || editingRoom.facilities,
        createdAt: editingRoom.createdAt,
        updatedAt: new Date()
      }
    });
    updateForm.reset();
    setEditingRoom(null);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    updateForm.reset({
      name: room.name, building: room.building, floor: room.floor, capacity: room.capacity, roomType: room.roomType, facilities: room.facilities
    });
  };

  const handleDelete = (roomId: string) => {
    dispatch({ type: 'DELETE_ROOM', payload: roomId });
    setShowDeleteConfirm(null);
  };

  const addFacility = (form: any) => {
    const currentFacilities = form.getValues('facilities');
    form.setValue('facilities', [...currentFacilities, '']);
  };

  const removeFacility = (form: any, index: number) => {
    const currentFacilities = form.getValues('facilities');
    if (currentFacilities.length > 1) {
      form.setValue('facilities', currentFacilities.filter((_: string, i: number) => i !== index));
    }
  };

  // Filter rooms based on search term
  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.floor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getRoomTypeName(room.roomType).toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.facilities.some(facility => facility.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const rooms = JSON.parse(content);
        
        if (Array.isArray(rooms)) {
          rooms.forEach(room => {
            const roomData: Room = {
              ...room,
              id: `room_${Date.now()}_${Math.random()}`,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            dispatch({ type: 'ADD_ROOM', payload: roomData });
          });
          alert(`Successfully imported ${rooms.length} rooms`);
        } else {
          alert('Invalid file format. Please upload a JSON file with an array of rooms.');
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
          <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
          <p className="text-gray-600">Manage university teaching rooms and facilities</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleImportClick}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Rooms
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Room
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
          placeholder="Search rooms by name, building, floor, type, or facilities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Create Room Form (Modal) */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Room</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room Name</label>
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
                  <label className="block text-sm font-medium text-gray-700">Building</label>
                  <input
                    type="text"
                    {...createForm.register('building')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {createForm.formState.errors.building && (
                    <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.building.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Floor</label>
                  <input
                    type="text"
                    {...createForm.register('floor')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {createForm.formState.errors.floor && (
                    <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.floor.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacity</label>
                  <input
                    type="number"
                    {...createForm.register('capacity', { valueAsNumber: true })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {createForm.formState.errors.capacity && (
                    <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.capacity.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room Type</label>
                  <select
                    {...createForm.register('roomType')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {getRoomTypesArray().map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {createForm.formState.errors.roomType && (
                    <p className="mt-1 text-sm text-red-600">{createForm.formState.errors.roomType.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Facilities</label>
                  {createForm.watch('facilities')?.map((facility: string, index: number) => (
                    <div key={index} className="flex space-x-2 mt-2">
                      <input
                        type="text"
                        {...createForm.register(`facilities.${index}`)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                      {createForm.watch('facilities')?.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFacility(createForm, index)}
                          className="px-2 py-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addFacility(createForm)}
                    className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Facility
                  </button>
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
                    Create Room
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

            {/* Edit Room Form (Modal) */}
      {editingRoom && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Room</h3>
                <button
                  onClick={() => setEditingRoom(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={updateForm.handleSubmit(handleUpdateSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room Name</label>
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
                  <label className="block text-sm font-medium text-gray-700">Building</label>
                  <input
                    type="text"
                    {...updateForm.register('building')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {updateForm.formState.errors.building && (
                    <p className="mt-1 text-sm text-red-600">{updateForm.formState.errors.building.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Floor</label>
                  <input
                    type="text"
                    {...updateForm.register('floor')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {updateForm.formState.errors.floor && (
                    <p className="mt-1 text-sm text-red-600">{updateForm.formState.errors.floor.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacity</label>
                  <input
                    type="number"
                    {...updateForm.register('capacity', { valueAsNumber: true })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  {updateForm.formState.errors.capacity && (
                    <p className="mt-1 text-sm text-red-600">{updateForm.formState.errors.capacity.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room Type</label>
                  <select
                    {...updateForm.register('roomType')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {getRoomTypesArray().map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {updateForm.formState.errors.roomType && (
                    <p className="mt-1 text-sm text-red-600">{updateForm.formState.errors.roomType.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Facilities</label>
                  {updateForm.watch('facilities')?.map((facility: string, index: number) => (
                    <div key={index} className="flex space-x-2 mt-2">
                      <input
                        type="text"
                        {...updateForm.register(`facilities.${index}`)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                      {updateForm.watch('facilities')?.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFacility(updateForm, index)}
                          className="px-2 py-2 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addFacility(updateForm)}
                    className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Facility
                  </button>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingRoom(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Update Room
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Rooms Table */}
      {filteredRooms.length > 0 ? (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Building
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Floor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facilities
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRooms.map((room) => (
                  <tr key={room.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{room.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{room.building}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{room.floor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm text-gray-900">{room.capacity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoomTypeColor(room.roomType)}`}>
                        {getRoomTypeName(room.roomType)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="flex flex-wrap gap-1">
                          {room.facilities.map((facility, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {facility}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(room)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(room.id)}
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
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No rooms found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'No rooms match your search criteria.' : 'Get started by creating a new room.'}
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Room
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
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Room</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to delete this room? This action cannot be undone.
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

export default Rooms;
