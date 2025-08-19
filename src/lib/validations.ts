import { z } from 'zod';

// Session Validation Schemas
export const createSessionSchema = z.object({
  name: z.string().min(1, 'Session name is required').max(100, 'Session name must be less than 100 characters'),
  numberOfYears: z.number().min(1, 'Must have at least 1 year').max(10, 'Cannot exceed 10 years'),
  workingDays: z.array(z.object({
    day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    isActive: z.boolean(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):00$/, 'Invalid time format (HH:00)'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):00$/, 'Invalid time format (HH:00)'),
    breakStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):00$/, 'Invalid time format (HH:00)').optional().or(z.literal('')),
    breakEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):00$/, 'Invalid time format (HH:00)').optional().or(z.literal('')),
  })).refine((days) => {
    // At least one working day must be active
    const hasActiveDay = days.some(day => day.isActive);
    if (!hasActiveDay) return false;
    
    // All active days must have valid start and end times
    const activeDays = days.filter(day => day.isActive);
    return activeDays.every(day => day.startTime && day.endTime);
  }, 'At least one working day must be active with valid start and end times'),
});

export const updateSessionSchema = createSessionSchema.partial();

// Department Validation Schemas
export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required').max(100, 'Department name must be less than 100 characters'),
  code: z.string().min(2, 'Department code must be at least 2 characters').max(10, 'Department code must be less than 10 characters'),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

// Program Validation Schemas
export const createProgramSchema = z.object({
  name: z.string().min(1, 'Program name is required').max(100, 'Program name must be less than 100 characters'),
  code: z.string().min(2, 'Program code must be at least 2 characters').max(10, 'Program code must be less than 10 characters'),
  departmentId: z.string().min(1, 'Department is required'),
  sessionId: z.string().min(1, 'Session is required'),
  degreeType: z.enum(['BSc', 'MSc', 'PhD', 'Diploma', 'Certificate']),
  duration: z.number().min(1, 'Duration must be at least 1 year').max(10, 'Duration cannot exceed 10 years'),
});

export const updateProgramSchema = createProgramSchema.partial();

// Course Validation Schemas
export const createCourseSchema = z.object({
  name: z.string().min(1, 'Course name is required').max(200, 'Course name must be less than 200 characters'),
  code: z.string()
    .min(3, 'Course code must be at least 3 characters')
    .max(15, 'Course code must be less than 15 characters')
    .refine((code) => {
      // Extract numbers from course code and ensure they don't contain any zeros
      const numbers = code.replace(/\D/g, '');
      if (numbers.length === 0) return true; // No numbers in code is valid
      
      // Check if any of the three numbers contain zeros
      // Course code format: letters followed by exactly 3 numbers (e.g., "ITC356")
      if (numbers.length !== 3) return true; // Allow other formats for now
      
      // Ensure none of the three numbers contain zeros
      return !numbers.includes('0');
    }, 'Course code must have exactly 3 numbers and none of them can be 0'),
  creditHours: z.number().min(1, 'Credit hours must be at least 1').max(30, 'Credit hours cannot exceed 30'),
  departmentId: z.string().min(1, 'Department is required'),
  programId: z.string().min(1, 'Program is required'),
  sessionId: z.string().min(1, 'Session is required'),
  yearLevel: z.number().min(1, 'Year level must be at least 1').max(10, 'Year level cannot exceed 10'),
  semester: z.number().min(1, 'Semester must be at least 1').max(4, 'Semester cannot exceed 4'),
  isCore: z.boolean(),
  prerequisites: z.array(z.string()).optional(),
  lecturerId: z.string().optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

// Lecturer Validation Schemas
export const createLecturerSchema = z.object({
  name: z.string().min(1, 'Lecturer name is required').max(100, 'Lecturer name must be less than 100 characters'),
  departmentId: z.string().min(1, 'Department is required'),
  programs: z.array(z.string()).optional(),
  courses: z.array(z.string()).optional(),
});

export const updateLecturerSchema = createLecturerSchema.partial();

// Room Validation Schemas
export const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required').max(100, 'Room name must be less than 100 characters'),
  building: z.string().min(1, 'Building is required').max(100, 'Building name must be less than 100 characters'),
  floor: z.string().min(1, 'Floor is required').max(20, 'Floor must be less than 20 characters'),
  capacity: z.number().min(1, 'Capacity must be at least 1').max(1000, 'Capacity cannot exceed 1000'),
  roomType: z.enum(['lecture_hall', 'laboratory', 'computer_lab', 'seminar_room', 'auditorium', 'tutorial_room']),
  facilities: z.array(z.string()).min(1, 'At least one facility is required'),
});

export const updateRoomSchema = createRoomSchema.partial();

// Session Room Assignment Validation Schemas
export const createSessionRoomAssignmentSchema = z.object({
  sessionId: z.string().min(1, 'Session is required'),
  roomId: z.string().min(1, 'Room is required'),
  assignmentType: z.enum(['dedicated', 'preferred', 'restricted']),
  priority: z.number().min(1, 'Priority must be at least 1').max(10, 'Priority cannot exceed 10'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

export const updateSessionRoomAssignmentSchema = createSessionRoomAssignmentSchema.partial();

// Academic Year Validation Schemas
export const createAcademicYearSchema = z.object({
  name: z.string().min(1, 'Academic year name is required').max(50, 'Academic year name must be less than 50 characters'),
  startDate: z.date(),
  endDate: z.date(),
  isActive: z.boolean(),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const updateAcademicYearSchema = createAcademicYearSchema.partial();

// Timetable Entry Validation Schemas
export const createTimetableEntrySchema = z.object({
  sessionId: z.string().min(1, 'Session is required'),
  departmentId: z.string().min(1, 'Department is required'),
  courseId: z.string().min(1, 'Course is required'),
  lecturerId: z.string().min(1, 'Lecturer is required'),
  roomId: z.string().min(1, 'Room is required'),
  dayOfWeek: z.number().min(1, 'Day of week must be at least 1').max(7, 'Day of week cannot exceed 7'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  academicYearId: z.string().min(1, 'Academic year is required'),
  semester: z.number().min(1, 'Semester must be at least 1').max(4, 'Semester cannot exceed 4'),
});

export const updateTimetableEntrySchema = createTimetableEntrySchema.partial();

// Class Validation Schemas
export const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(50, 'Class name must be less than 50 characters'),
  sessionId: z.string().min(1, 'Session is required'),
  departmentId: z.string().min(1, 'Department is required'),
  programId: z.string().min(1, 'Program is required'),
  yearLevel: z.number().min(1, 'Year level must be at least 1').max(10, 'Year level cannot exceed 10'),
  semester: z.number().min(1, 'Semester must be at least 1').max(4, 'Semester cannot exceed 4'),
  studentCount: z.number().min(1, 'Student count must be at least 1').max(1000, 'Student count cannot exceed 1000'),
  maxCapacity: z.number().min(1, 'Max capacity must be at least 1').max(1000, 'Max capacity cannot exceed 1000'),
}).refine((data) => data.studentCount <= data.maxCapacity, {
  message: 'Student count cannot exceed max capacity',
  path: ['studentCount'],
});

export const updateClassSchema = createClassSchema.partial();

// Class Course Assignment Validation Schemas
export const createClassCourseAssignmentSchema = z.object({
  classId: z.string().min(1, 'Class is required'),
  courseId: z.string().min(1, 'Course is required'),
  sessionId: z.string().min(1, 'Session is required'),
  departmentId: z.string().min(1, 'Department is required'),
  programId: z.string().min(1, 'Program is required'),
  yearLevel: z.number().min(1, 'Year level must be at least 1').max(10, 'Year level cannot exceed 10'),
  semester: z.number().min(1, 'Semester must be at least 1').max(4, 'Semester cannot exceed 4'),
});

export const updateClassCourseAssignmentSchema = createClassCourseAssignmentSchema.partial();



// Search and Filter Schemas
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  type: z.enum(['sessions', 'departments', 'courses', 'lecturers', 'rooms']).optional(),
});

export const filterSchema = z.object({
  sessionId: z.string().optional(),
  departmentId: z.string().optional(),
  yearLevel: z.number().optional(),
  semester: z.number().optional(),
  academicYear: z.string().optional(),
  roomType: z.enum(['lecture_hall', 'laboratory', 'computer_lab', 'seminar_room', 'auditorium', 'tutorial_room']).optional(),
});

// Export types
export type CreateSessionFormData = z.infer<typeof createSessionSchema>;
export type UpdateSessionFormData = z.infer<typeof updateSessionSchema>;
export type CreateDepartmentFormData = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentFormData = z.infer<typeof updateDepartmentSchema>;
export type CreateProgramFormData = z.infer<typeof createProgramSchema>;
export type UpdateProgramFormData = z.infer<typeof updateProgramSchema>;
export type CreateCourseFormData = z.infer<typeof createCourseSchema>;
export type UpdateCourseFormData = z.infer<typeof updateCourseSchema>;
export type CreateLecturerFormData = z.infer<typeof createLecturerSchema>;
export type UpdateLecturerFormData = z.infer<typeof updateLecturerSchema>;
export type CreateRoomFormData = z.infer<typeof createRoomSchema>;
export type UpdateRoomFormData = z.infer<typeof updateRoomSchema>;
export type CreateSessionRoomAssignmentFormData = z.infer<typeof createSessionRoomAssignmentSchema>;
export type UpdateSessionRoomAssignmentFormData = z.infer<typeof updateSessionRoomAssignmentSchema>;
export type CreateAcademicYearFormData = z.infer<typeof createAcademicYearSchema>;
export type UpdateAcademicYearFormData = z.infer<typeof updateAcademicYearSchema>;
export type CreateTimetableEntryFormData = z.infer<typeof createTimetableEntrySchema>;
export type UpdateTimetableEntryFormData = z.infer<typeof updateTimetableEntrySchema>;

export type SearchFormData = z.infer<typeof searchSchema>;
export type FilterFormData = z.infer<typeof filterSchema>;
export type CreateClassFormData = z.infer<typeof createClassSchema>;
export type UpdateClassFormData = z.infer<typeof updateClassSchema>;
export type CreateClassCourseAssignmentFormData = z.infer<typeof createClassCourseAssignmentSchema>;
export type UpdateClassCourseAssignmentFormData = z.infer<typeof updateClassCourseAssignmentSchema>;
