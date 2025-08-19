import { BulkCourseAssignment, Class, Course, Session, Department } from '../types';

/**
 * Get all classes that would be affected by a bulk course assignment
 */
export const getAffectedClasses = (
  assignment: Pick<BulkCourseAssignment, 'sessionId' | 'departmentId' | 'yearLevel' | 'semester'>,
  allClasses: Class[]
): Class[] => {
  return allClasses.filter(cls => 
    cls.sessionId === assignment.sessionId &&
    cls.departmentId === assignment.departmentId &&
    cls.yearLevel === assignment.yearLevel &&
    cls.semester === assignment.semester
  );
};

/**
 * Get all courses that match the criteria for a bulk assignment
 */
export const getAvailableCourses = (
  assignment: Pick<BulkCourseAssignment, 'sessionId' | 'departmentId' | 'yearLevel' | 'semester'>,
  allCourses: Course[]
): Course[] => {
  return allCourses.filter(course => 
    course.sessionId === assignment.sessionId &&
    course.departmentId === assignment.departmentId &&
    course.yearLevel === assignment.yearLevel &&
    course.semester === assignment.semester
  );
};

/**
 * Check if a class has courses assigned through bulk assignments
 */
export const hasBulkCourseAssignment = (
  cls: Class,
  bulkAssignments: BulkCourseAssignment[]
): boolean => {
  return bulkAssignments.some(assignment => 
    assignment.sessionId === cls.sessionId &&
    assignment.departmentId === cls.departmentId &&
    assignment.yearLevel === cls.yearLevel &&
    assignment.semester === cls.semester &&
    assignment.isActive
  );
};

/**
 * Get all courses assigned to a class through bulk assignments
 */
export const getClassBulkCourses = (
  cls: Class,
  bulkAssignments: BulkCourseAssignment[],
  allCourses: Course[]
): Course[] => {
  const assignment = bulkAssignments.find(assignment => 
    assignment.sessionId === cls.sessionId &&
    assignment.departmentId === cls.departmentId &&
    assignment.yearLevel === cls.yearLevel &&
    assignment.semester === cls.semester &&
    assignment.isActive
  );
  
  if (!assignment) return [];
  
  return allCourses.filter(course => assignment.courseIds.includes(course.id));
};

/**
 * Get summary statistics for bulk assignments
 */
export const getBulkAssignmentStats = (
  bulkAssignments: BulkCourseAssignment[],
  allClasses: Class[]
) => {
  const activeAssignments = bulkAssignments.filter(a => a.isActive);
  const totalCoursesAssigned = activeAssignments.reduce((sum, a) => sum + a.courseIds.length, 0);
  
  const classesWithCourses = allClasses.filter(cls => hasBulkCourseAssignment(cls, activeAssignments));
  const totalStudentsImpacted = classesWithCourses.reduce((sum, cls) => sum + cls.studentCount, 0);
  
  return {
    totalAssignments: activeAssignments.length,
    totalCoursesAssigned,
    classesAffected: classesWithCourses.length,
    totalStudentsImpacted
  };
};

/**
 * Validate if a bulk assignment can be created
 */
export const validateBulkAssignment = (
  assignment: Pick<BulkCourseAssignment, 'sessionId' | 'departmentId' | 'yearLevel' | 'semester' | 'courseIds'>,
  allClasses: Class[],
  allCourses: Course[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!assignment.sessionId) {
    errors.push('Session is required');
  }
  
  if (!assignment.departmentId) {
    errors.push('Department is required');
  }
  
  if (assignment.yearLevel < 1) {
    errors.push('Year level must be at least 1');
  }
  
  if (assignment.semester < 1 || assignment.semester > 2) {
    errors.push('Semester must be 1 or 2');
  }
  
  if (assignment.courseIds.length === 0) {
    errors.push('At least one course must be selected');
  }
  
  // Check if there are classes that would be affected
  const affectedClasses = getAffectedClasses(assignment, allClasses);
  if (affectedClasses.length === 0) {
    errors.push('No classes found for the selected criteria');
  }
  
  // Check if selected courses exist and match criteria
  const availableCourses = getAvailableCourses(assignment, allCourses);
  const selectedCourses = allCourses.filter(course => assignment.courseIds.includes(course.id));
  
  if (selectedCourses.length !== assignment.courseIds.length) {
    errors.push('Some selected courses do not exist');
  }
  
  const invalidCourses = selectedCourses.filter(course => 
    course.sessionId !== assignment.sessionId ||
    course.departmentId !== assignment.departmentId ||
    course.yearLevel !== assignment.yearLevel ||
    course.semester !== assignment.semester
  );
  
  if (invalidCourses.length > 0) {
    errors.push('Some selected courses do not match the assignment criteria');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Create individual class-course assignments from a bulk assignment
 */
export const createIndividualAssignments = (
  bulkAssignment: BulkCourseAssignment,
  allClasses: Class[]
) => {
  const affectedClasses = getAffectedClasses(bulkAssignment, allClasses);
  
  return affectedClasses.flatMap(cls => 
    bulkAssignment.courseIds.map(courseId => ({
      classId: cls.id,
      courseId,
      sessionId: bulkAssignment.sessionId,
      departmentId: bulkAssignment.departmentId,
      yearLevel: bulkAssignment.yearLevel,
      semester: bulkAssignment.semester,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  );
};
