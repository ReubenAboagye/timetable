import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { 
  Session, 
  Department, 
  Course, 
  Lecturer, 
  Room, 
  SessionRoomAssignment, 
  TimetableEntry, 
  AcademicYear,
  Class,
  ClassCourseAssignment
} from '../types';
import { storage } from '../lib/utils';
import { 
  sampleSessions, 
  sampleDepartments, 
  sampleCourses, 
  sampleLecturers, 
  sampleRooms, 
  sampleAcademicYears,
  sampleTimetableEntries,
  sampleClasses,
  sampleClassCourseAssignments
} from '../lib/sampleData';

// Initial state
interface AppState {
  sessions: Session[];
  departments: Department[];
  courses: Course[];
  lecturers: Lecturer[];
  rooms: Room[];
  sessionRoomAssignments: SessionRoomAssignment[];
  timetableEntries: TimetableEntry[];
  academicYears: AcademicYear[];
  classes: Class[];
  classCourseAssignments: ClassCourseAssignment[];
  currentSessionId: string | null;
  currentDepartmentId: string | null;
  currentAcademicYear: string | null;
}

const initialState: AppState = {
  sessions: storage.get('sessions', sampleSessions),
  departments: storage.get('departments', sampleDepartments),
  courses: storage.get('courses', sampleCourses),
  lecturers: storage.get('lecturers', sampleLecturers),
  rooms: storage.get('rooms', sampleRooms),
  sessionRoomAssignments: storage.get('sessionRoomAssignments', []),
  timetableEntries: storage.get('timetableEntries', sampleTimetableEntries),
  academicYears: storage.get('academicYears', sampleAcademicYears),
  classes: storage.get('classes', sampleClasses),
  classCourseAssignments: storage.get('classCourseAssignments', sampleClassCourseAssignments),
  currentSessionId: storage.get('currentSessionId', null),
  currentDepartmentId: storage.get('currentDepartmentId', null),
  currentAcademicYear: storage.get('currentAcademicYear', null),
};

// Add debugging for initial state
console.log('Initial state created:');
console.log('sampleAcademicYears:', sampleAcademicYears);
console.log('initialState.academicYears:', initialState.academicYears);
console.log('localStorage academicYears:', localStorage.getItem('academicYears'));

// Action types
type AppAction =
  | { type: 'SET_SESSIONS'; payload: Session[] }
  | { type: 'ADD_SESSION'; payload: Session }
  | { type: 'UPDATE_SESSION'; payload: Session }
  | { type: 'DELETE_SESSION'; payload: string }
  | { type: 'SET_DEPARTMENTS'; payload: Department[] }
  | { type: 'ADD_DEPARTMENT'; payload: Department }
  | { type: 'UPDATE_DEPARTMENT'; payload: Department }
  | { type: 'DELETE_DEPARTMENT'; payload: string }
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'ADD_COURSE'; payload: Course }
  | { type: 'UPDATE_COURSE'; payload: Course }
  | { type: 'DELETE_COURSE'; payload: string }
  | { type: 'SET_LECTURERS'; payload: Lecturer[] }
  | { type: 'ADD_LECTURER'; payload: Lecturer }
  | { type: 'UPDATE_LECTURER'; payload: Lecturer }
  | { type: 'DELETE_LECTURER'; payload: string }
  | { type: 'ASSIGN_COURSES_TO_LECTURER'; payload: { lecturerId: string; courseIds: string[] } }
  | { type: 'SET_ROOMS'; payload: Room[] }
  | { type: 'ADD_ROOM'; payload: Room }
  | { type: 'UPDATE_ROOM'; payload: Room }
  | { type: 'DELETE_ROOM'; payload: string }
  | { type: 'SET_SESSION_ROOM_ASSIGNMENTS'; payload: SessionRoomAssignment[] }
  | { type: 'ADD_SESSION_ROOM_ASSIGNMENT'; payload: SessionRoomAssignment }
  | { type: 'UPDATE_SESSION_ROOM_ASSIGNMENT'; payload: SessionRoomAssignment }
  | { type: 'DELETE_SESSION_ROOM_ASSIGNMENT'; payload: string }
  | { type: 'SET_TIMETABLE_ENTRIES'; payload: TimetableEntry[] }
  | { type: 'ADD_TIMETABLE_ENTRY'; payload: TimetableEntry }
  | { type: 'UPDATE_TIMETABLE_ENTRY'; payload: TimetableEntry }
  | { type: 'DELETE_TIMETABLE_ENTRY'; payload: string }
  | { type: 'SET_ACADEMIC_YEARS'; payload: AcademicYear[] }
  | { type: 'ADD_ACADEMIC_YEAR'; payload: AcademicYear }
  | { type: 'UPDATE_ACADEMIC_YEAR'; payload: AcademicYear }
  | { type: 'DELETE_ACADEMIC_YEAR'; payload: string }
  | { type: 'SET_CLASSES'; payload: Class[] }
  | { type: 'ADD_CLASS'; payload: Class }
  | { type: 'UPDATE_CLASS'; payload: Class }
  | { type: 'DELETE_CLASS'; payload: string }
  | { type: 'SET_CLASS_COURSE_ASSIGNMENTS'; payload: ClassCourseAssignment[] }
  | { type: 'ADD_CLASS_COURSE_ASSIGNMENT'; payload: ClassCourseAssignment }
  | { type: 'UPDATE_CLASS_COURSE_ASSIGNMENT'; payload: ClassCourseAssignment }
  | { type: 'DELETE_CLASS_COURSE_ASSIGNMENT'; payload: string }

  | { type: 'SET_CURRENT_SESSION'; payload: string | null }
  | { type: 'SET_CURRENT_DEPARTMENT'; payload: string | null }
  | { type: 'SET_CURRENT_ACADEMIC_YEAR'; payload: string | null }
  | { type: 'RESET_STATE' };

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SESSIONS':
      storage.set('sessions', action.payload);
      return { ...state, sessions: action.payload };
    
    case 'ADD_SESSION':
      const newSessions = [...state.sessions, action.payload];
      storage.set('sessions', newSessions);
      return { ...state, sessions: newSessions };
    
    case 'UPDATE_SESSION':
      const updatedSessions = state.sessions.map(session =>
        session.id === action.payload.id ? action.payload : session
      );
      storage.set('sessions', updatedSessions);
      return { ...state, sessions: updatedSessions };
    
    case 'DELETE_SESSION':
      const filteredSessions = state.sessions.filter(session => session.id !== action.payload);
      storage.set('sessions', filteredSessions);
      return { ...state, sessions: filteredSessions };
    
    case 'SET_DEPARTMENTS':
      storage.set('departments', action.payload);
      return { ...state, departments: action.payload };
    
    case 'ADD_DEPARTMENT':
      const newDepartments = [...state.departments, action.payload];
      storage.set('departments', newDepartments);
      return { ...state, departments: newDepartments };
    
    case 'UPDATE_DEPARTMENT':
      const updatedDepartments = state.departments.map(department =>
        department.id === action.payload.id ? action.payload : department
      );
      storage.set('departments', updatedDepartments);
      return { ...state, departments: updatedDepartments };
    
    case 'DELETE_DEPARTMENT':
      const filteredDepartments = state.departments.filter(department => department.id !== action.payload);
      storage.set('departments', filteredDepartments);
      return { ...state, departments: filteredDepartments };
    
    case 'SET_COURSES':
      storage.set('courses', action.payload);
      return { ...state, courses: action.payload };
    
    case 'ADD_COURSE':
      const newCourses = [...state.courses, action.payload];
      storage.set('courses', newCourses);
      return { ...state, courses: newCourses };
    
    case 'UPDATE_COURSE':
      const updatedCourses = state.courses.map(course =>
        course.id === action.payload.id ? action.payload : course
      );
      storage.set('courses', updatedCourses);
      return { ...state, courses: updatedCourses };
    
    case 'DELETE_COURSE':
      const filteredCourses = state.courses.filter(course => course.id !== action.payload);
      storage.set('courses', filteredCourses);
      return { ...state, courses: filteredCourses };
    
    case 'SET_LECTURERS':
      storage.set('lecturers', action.payload);
      return { ...state, lecturers: action.payload };
    
    case 'ADD_LECTURER':
      const newLecturers = [...state.lecturers, action.payload];
      storage.set('lecturers', newLecturers);
      return { ...state, lecturers: newLecturers };
    
    case 'UPDATE_LECTURER':
      const updatedLecturers = state.lecturers.map(lecturer =>
        lecturer.id === action.payload.id ? action.payload : lecturer
      );
      storage.set('lecturers', updatedLecturers);
      return { ...state, lecturers: updatedLecturers };
    
    case 'DELETE_LECTURER':
      const filteredLecturers = state.lecturers.filter(lecturer => lecturer.id !== action.payload);
      storage.set('lecturers', filteredLecturers);
      return { ...state, lecturers: filteredLecturers };
    
    case 'ASSIGN_COURSES_TO_LECTURER':
      const updatedLecturersWithCourses = state.lecturers.map(lecturer =>
        lecturer.id === action.payload.lecturerId
          ? { ...lecturer, courses: [...lecturer.courses, ...action.payload.courseIds] }
          : lecturer
      );
      storage.set('lecturers', updatedLecturersWithCourses);
      return { ...state, lecturers: updatedLecturersWithCourses };
    
    case 'SET_ROOMS':
      storage.set('rooms', action.payload);
      return { ...state, rooms: action.payload };
    
    case 'ADD_ROOM':
      const newRooms = [...state.rooms, action.payload];
      storage.set('rooms', newRooms);
      return { ...state, rooms: newRooms };
    
    case 'UPDATE_ROOM':
      const updatedRooms = state.rooms.map(room =>
        room.id === action.payload.id ? action.payload : room
      );
      storage.set('rooms', updatedRooms);
      return { ...state, rooms: updatedRooms };
    
    case 'DELETE_ROOM':
      const filteredRooms = state.rooms.filter(room => room.id !== action.payload);
      storage.set('rooms', filteredRooms);
      return { ...state, rooms: filteredRooms };
    
    case 'SET_SESSION_ROOM_ASSIGNMENTS':
      storage.set('sessionRoomAssignments', action.payload);
      return { ...state, sessionRoomAssignments: action.payload };
    
    case 'ADD_SESSION_ROOM_ASSIGNMENT':
      const newAssignments = [...state.sessionRoomAssignments, action.payload];
      storage.set('sessionRoomAssignments', newAssignments);
      return { ...state, sessionRoomAssignments: newAssignments };
    
    case 'UPDATE_SESSION_ROOM_ASSIGNMENT':
      const updatedAssignments = state.sessionRoomAssignments.map(assignment =>
        assignment.id === action.payload.id ? action.payload : assignment
      );
      storage.set('sessionRoomAssignments', updatedAssignments);
      return { ...state, sessionRoomAssignments: updatedAssignments };
    
    case 'DELETE_SESSION_ROOM_ASSIGNMENT':
      const filteredAssignments = state.sessionRoomAssignments.filter(assignment => assignment.id !== action.payload);
      storage.set('sessionRoomAssignments', filteredAssignments);
      return { ...state, sessionRoomAssignments: filteredAssignments };
    
    case 'SET_TIMETABLE_ENTRIES':
      storage.set('timetableEntries', action.payload);
      return { ...state, timetableEntries: action.payload };
    
    case 'ADD_TIMETABLE_ENTRY':
      const newEntries = [...state.timetableEntries, action.payload];
      storage.set('timetableEntries', newEntries);
      return { ...state, timetableEntries: newEntries };
    
    case 'UPDATE_TIMETABLE_ENTRY':
      const updatedEntries = state.timetableEntries.map(entry =>
        entry.id === action.payload.id ? action.payload : entry
      );
      storage.set('timetableEntries', updatedEntries);
      return { ...state, timetableEntries: updatedEntries };
    
    case 'DELETE_TIMETABLE_ENTRY':
      const filteredEntries = state.timetableEntries.filter(entry => entry.id !== action.payload);
      storage.set('timetableEntries', filteredEntries);
      return { ...state, timetableEntries: filteredEntries };
    
    case 'SET_ACADEMIC_YEARS':
      storage.set('academicYears', action.payload);
      return { ...state, academicYears: action.payload };
    
    case 'ADD_ACADEMIC_YEAR':
      const newYears = [...state.academicYears, action.payload];
      storage.set('academicYears', newYears);
      return { ...state, academicYears: newYears };
    
    case 'UPDATE_ACADEMIC_YEAR':
      const updatedYears = state.academicYears.map(year =>
        year.id === action.payload.id ? action.payload : year
      );
      storage.set('academicYears', updatedYears);
      return { ...state, academicYears: updatedYears };
    
    case 'DELETE_ACADEMIC_YEAR':
      const filteredYears = state.academicYears.filter(year => year.id !== action.payload);
      storage.set('academicYears', filteredYears);
      return { ...state, academicYears: filteredYears };
    
    case 'SET_CLASSES':
      storage.set('classes', action.payload);
      return { ...state, classes: action.payload };
    
    case 'ADD_CLASS':
      const newClasses = [...state.classes, action.payload];
      storage.set('classes', newClasses);
      return { ...state, classes: newClasses };
    
    case 'UPDATE_CLASS':
      const updatedClasses = state.classes.map(cls =>
        cls.id === action.payload.id ? action.payload : cls
      );
      storage.set('classes', updatedClasses);
      return { ...state, classes: updatedClasses };
    
    case 'DELETE_CLASS':
      const filteredClasses = state.classes.filter(cls => cls.id !== action.payload);
      storage.set('classes', filteredClasses);
      return { ...state, classes: filteredClasses };
    
    case 'SET_CLASS_COURSE_ASSIGNMENTS':
      storage.set('classCourseAssignments', action.payload);
      return { ...state, classCourseAssignments: action.payload };
    
    case 'ADD_CLASS_COURSE_ASSIGNMENT':
      const newClassCourseAssignments = [...state.classCourseAssignments, action.payload];
      storage.set('classCourseAssignments', newClassCourseAssignments);
      return { ...state, classCourseAssignments: newClassCourseAssignments };
    
    case 'UPDATE_CLASS_COURSE_ASSIGNMENT':
      const updatedClassCourseAssignments = state.classCourseAssignments.map(assignment =>
        assignment.id === action.payload.id ? action.payload : assignment
      );
      storage.set('classCourseAssignments', updatedClassCourseAssignments);
      return { ...state, classCourseAssignments: updatedClassCourseAssignments };
    
    case 'DELETE_CLASS_COURSE_ASSIGNMENT':
      const filteredClassCourseAssignments = state.classCourseAssignments.filter(assignment => assignment.id !== action.payload);
      storage.set('classCourseAssignments', filteredClassCourseAssignments);
      return { ...state, classCourseAssignments: filteredClassCourseAssignments };
    

    
    case 'SET_CURRENT_SESSION':
      storage.set('currentSessionId', action.payload);
      return { ...state, currentSessionId: action.payload };
    
    case 'SET_CURRENT_DEPARTMENT':
      storage.set('currentDepartmentId', action.payload);
      return { ...state, currentDepartmentId: action.payload };
    
    case 'SET_CURRENT_ACADEMIC_YEAR':
      storage.set('currentAcademicYear', action.payload);
      return { ...state, currentAcademicYear: action.payload };
    
    case 'RESET_STATE':
      storage.remove('sessions');
      storage.remove('departments');
      storage.remove('courses');
      storage.remove('lecturers');
      storage.remove('rooms');
      storage.remove('sessionRoomAssignments');
      storage.remove('timetableEntries');
      storage.remove('academicYears');
      storage.remove('classes');
      storage.remove('classCourseAssignments');
      return initialState;
    
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the app context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Selector hooks for specific data
export function useSessions() {
  const { state, dispatch } = useApp();
  return {
    sessions: state.sessions,
    dispatch,
  };
}

export function useDepartments() {
  const { state, dispatch } = useApp();
  return {
    departments: state.departments,
    dispatch,
  };
}

export function useCourses() {
  const { state, dispatch } = useApp();
  return {
    courses: state.courses,
    dispatch,
  };
}

export function useLecturers() {
  const { state, dispatch } = useApp();
  return {
    lecturers: state.lecturers,
    dispatch,
  };
}

export function useRooms() {
  const { state, dispatch } = useApp();
  return {
    rooms: state.rooms,
    dispatch,
  };
}

export function useSessionRoomAssignments() {
  const { state, dispatch } = useApp();
  return {
    sessionRoomAssignments: state.sessionRoomAssignments,
    dispatch,
  };
}

export function useTimetableEntries() {
  const { state, dispatch } = useApp();
  return {
    timetableEntries: state.timetableEntries,
    dispatch,
  };
}

export function useAcademicYears() {
  const { state, dispatch } = useApp();
  
  // Add debugging
  console.log('useAcademicYears hook called');
  console.log('state.academicYears:', state.academicYears);
  console.log('state.academicYears type:', typeof state.academicYears);
  console.log('state.academicYears isArray:', Array.isArray(state.academicYears));
  
  return {
    academicYears: state.academicYears,
    dispatch,
  };
}

export function useClasses() {
  const { state, dispatch } = useApp();
  return {
    classes: state.classes,
    dispatch,
  };
}

export function useClassCourseAssignments() {
  const { state, dispatch } = useApp();
  return {
    classCourseAssignments: state.classCourseAssignments,
    dispatch,
  };
}



export function useCurrentSelection() {
  const { state, dispatch } = useApp();
  return {
    currentSessionId: state.currentSessionId,
    currentDepartmentId: state.currentDepartmentId,
    currentAcademicYear: state.currentAcademicYear,
    dispatch,
  };
}
