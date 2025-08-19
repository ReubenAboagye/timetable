// Core Types for University Timetable Management System

export interface Session {
  id: string;
  name: string;
  numberOfYears: number;
  workingDays: WorkingDay[];
  timeSlots: TimeSlot[];
  breakTimes: BreakTime[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkingDay {
  id: string;
  day: DayOfWeek;
  isActive: boolean;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface TimeSlot {
  id: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isBreak: boolean;
  breakType?: 'short' | 'long' | 'lunch';
}

export interface BreakTime {
  id: string;
  startTime: string;
  endTime: string;
  breakType: 'short' | 'long' | 'lunch';
}

export interface Department {
  id: string;
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Program {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  sessionId: string;
  degreeType: 'BSc' | 'MSc' | 'PhD' | 'Diploma' | 'Certificate';
  duration: number; // in years
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  creditHours: number;
  departmentId: string;
  programId: string; // Now linked to program instead of just department
  sessionId: string;
  yearLevel: number;
  semester: number;
  isCore: boolean;
  prerequisites?: string[];
  lecturerId?: string;
  classId?: string; // Link to specific class if needed
  createdAt: Date;
  updatedAt: Date;
}

export interface Lecturer {
  id: string;
  name: string;
  departmentId: string;
  programs: string[]; // Now linked to programs instead of just department
  courses: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  floor: string;
  capacity: number;
  roomType: RoomType;
  facilities: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type RoomType = 'lecture_hall' | 'laboratory' | 'computer_lab' | 'seminar_room' | 'auditorium' | 'tutorial_room';

export interface SessionRoomAssignment {
  id: string;
  sessionId: string;
  roomId: string;
  assignmentType: 'dedicated' | 'preferred' | 'restricted';
  priority: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimetableEntry {
  id: string;
  sessionId: string;
  departmentId: string;
  programId: string; // Add program reference
  courseId: string;
  lecturerId: string;
  roomId: string;
  dayOfWeek: number; // 1-7 for Monday-Sunday
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  academicYearId: string;
  semester: number;
  classId?: string; // Link to specific class
  createdAt: Date;
  updatedAt: Date;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}



// Form Types
export interface CreateSessionForm {
  name: string;
  numberOfYears: number;
  workingDays: {
    day: DayOfWeek;
    isActive: boolean;
    startTime: string;
    endTime: string;
  }[];
  timeSlots: {
    startTime: string;
    endTime: string;
    isBreak: boolean;
    breakType?: 'short' | 'long' | 'lunch';
  }[];
}

export interface CreateDepartmentForm {
  name: string;
  code: string;
}

export interface CreateProgramForm {
  name: string;
  code: string;
  departmentId: string;
  sessionId: string;
  degreeType: 'BSc' | 'MSc' | 'PhD' | 'Diploma' | 'Certificate';
  duration: number;
}

export interface CreateCourseForm {
  name: string;
  code: string;
  creditHours: number;
  departmentId: string;
  programId: string; // Add program selection
  sessionId: string;
  yearLevel: number;
  semester: number;
  isCore: boolean;
  prerequisites?: string[];
  classId?: string;
}

export interface CreateCourseData extends CreateCourseForm {
  id: string;
  programId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLecturerForm {
  name: string;
  departmentId: string;
  programs?: string[]; // Add program selection
  courses?: string[];
}

export interface CreateLecturerData extends CreateLecturerForm {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoomForm {
  name: string;
  building: string;
  floor: string;
  capacity: number;
  roomType: RoomType;
  facilities: string[];
}

// Utility Types
export interface SelectOption {
  value: string;
  label: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Class Management Types
export interface Class {
  id: string;
  name: string; // e.g., "Class A", "Class B"
  sessionId: string;
  departmentId: string;
  programId: string; // Now linked to program
  yearLevel: number;
  semester: number;
  studentCount: number;
  maxCapacity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClassCourseAssignment {
  id: string;
  classId: string;
  courseId: string;
  sessionId: string;
  departmentId: string;
  programId: string; // Add program reference
  yearLevel: number;
  semester: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClassForm {
  name: string;
  sessionId: string;
  departmentId: string;
  programId: string; // Add program selection
  yearLevel: number;
  semester: number;
  studentCount: number;
  maxCapacity: number;
}

export interface CreateClassCourseAssignmentForm {
  classId: string;
  courseId: string;
  sessionId: string;
  departmentId: string;
  programId: string; // Add program reference
  yearLevel: number;
  semester: number;
}

// Bulk Course Assignment Types
export interface BulkCourseAssignment {
  id: string;
  sessionId: string;
  departmentId: string;
  programId: string; // Add program reference
  yearLevel: number;
  semester: number;
  courseIds: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBulkCourseAssignmentForm {
  sessionId: string;
  departmentId: string;
  programId: string; // Add program selection
  yearLevel: number;
  semester: number;
  courseIds: string[];
}

export interface BulkAssignmentPreview {
  sessionId: string;
  departmentId: string;
  programId: string; // Add program reference
  yearLevel: number;
  semester: number;
  affectedClasses: Class[];
  assignedCourses: Course[];
  totalStudents: number;
}
