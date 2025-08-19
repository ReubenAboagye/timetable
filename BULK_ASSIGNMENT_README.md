# Bulk Course Assignment System

This system allows you to assign courses to multiple classes at once based on session, department, and level criteria, eliminating the need to manually assign courses to each individual class.

## Overview

The bulk course assignment system works by:
1. **Defining criteria**: Session, Department, Year Level, and Semester
2. **Selecting courses**: Choose which courses to assign to all classes matching the criteria
3. **Automatic assignment**: All classes that match the criteria automatically receive the selected courses
4. **Management**: View, edit, and delete bulk assignments as needed

## How It Works

### 1. Creating a Bulk Assignment

1. Navigate to the **Classes** page
2. Click **"Bulk Course Assignment"** button
3. Select the criteria:
   - **Session**: Choose the academic session (e.g., Regular, Weekend)
   - **Department**: Select the department (e.g., Computer Science, Electrical Engineering)
   - **Year Level**: Choose the year (1, 2, 3, 4, etc.)
   - **Semester**: Select semester 1 or 2
4. Choose the courses to assign from the available courses list
5. Preview the assignment to see which classes will be affected
6. Confirm the assignment

### 2. Example Scenario

**Scenario**: Assign "Introduction to Programming" to all Computer Science Year 1 Semester 1 classes

**Steps**:
1. Select Session: "Regular"
2. Select Department: "Computer Science"
3. Select Year Level: "1"
4. Select Semester: "1"
5. Select Course: "Introduction to Programming"
6. Preview shows all affected classes (Class A, B, C, D, E)
7. Confirm assignment

**Result**: All 5 classes in CS Year 1 Semester 1 now have "Introduction to Programming" assigned

### 3. Viewing Assignments

- Click **"View Assignments"** to see all bulk course assignments
- View summary statistics and impact
- See which classes are affected by each assignment
- View detailed information about each assignment

### 4. Managing Assignments

- **Edit**: Modify existing assignments (add/remove courses, change criteria)
- **Delete**: Remove assignments (classes will lose the assigned courses)
- **View Details**: See exactly which classes and students are affected

## Benefits

1. **Efficiency**: Assign courses to multiple classes in one operation
2. **Consistency**: Ensure all classes at the same level have the same courses
3. **Scalability**: Easy to manage large numbers of classes
4. **Flexibility**: Can assign multiple courses at once
5. **Visibility**: Clear overview of which classes have which courses

## Data Structure

### Bulk Course Assignment
```typescript
interface BulkCourseAssignment {
  id: string;
  sessionId: string;
  departmentId: string;
  yearLevel: number;
  semester: number;
  courseIds: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### How Classes Get Courses
Classes automatically receive courses when they match ALL criteria:
- `sessionId` matches
- `departmentId` matches  
- `yearLevel` matches
- `semester` matches
- Assignment is `isActive: true`

## Sample Data

The system includes sample data demonstrating:
- Multiple sessions (Regular, Weekend)
- Multiple departments (CS, EE, Business)
- Different year levels (1-4)
- Various course assignments

## Technical Implementation

### Components
- `BulkCourseAssignment`: Main assignment creation interface
- `BulkAssignmentViewer`: View and manage existing assignments
- Utility functions for validation and data processing

### Validation
- Ensures criteria are valid
- Checks that classes exist for the criteria
- Validates course selection
- Prevents invalid assignments

### Integration
- Works with existing class and course management
- Updates class-course relationships automatically
- Maintains data consistency

## Future Enhancements

1. **Batch Operations**: Create multiple assignments at once
2. **Templates**: Save common assignment patterns
3. **Scheduling**: Assign courses for specific time periods
4. **Conflict Detection**: Identify scheduling conflicts
5. **Reporting**: Generate reports on course assignments
6. **API Integration**: Connect with external systems

## Usage Tips

1. **Plan Ahead**: Consider the impact before creating assignments
2. **Use Preview**: Always preview assignments before confirming
3. **Regular Review**: Periodically review assignments for accuracy
4. **Documentation**: Keep track of assignment decisions
5. **Testing**: Test assignments on a small scale first

## Troubleshooting

### Common Issues
1. **No classes found**: Check that criteria match existing classes
2. **No courses available**: Ensure courses exist for the selected criteria
3. **Assignment not working**: Verify the assignment is active

### Best Practices
1. Use consistent naming conventions
2. Regularly clean up inactive assignments
3. Validate data before creating assignments
4. Keep assignments organized by department/level

---

This system provides a powerful way to manage course assignments across your university timetable, making it much easier to ensure all classes have the appropriate courses assigned.
