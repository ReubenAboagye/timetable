# University Timetable Management System

A comprehensive web application for managing university academic timetables, built with React, TypeScript, and Tailwind CSS.

## Features

### 🎓 Academic Management
- **Sessions Management**: Create and manage different academic sessions (Regular, Weekend, Masters, etc.)
- **Department Management**: Organize courses by departments with custom codes and descriptions
- **Course Management**: Comprehensive course creation with credit hours, year levels, and semesters
- **Lecturer Management**: Manage faculty members with contact information and specializations
- **Room Management**: Track teaching facilities with capacity, type, and available equipment

### 📅 Timetable Features
- **Dynamic Timetable Generation**: Create conflict-free timetables based on available resources
- **Flexible Scheduling**: Support for different working days and time slots per session
- **Room Assignment**: Intelligent room allocation with session-specific preferences
- **Conflict Detection**: Automatic detection of scheduling conflicts

### 🏫 Academic Year Management
- **Year Progression**: Automated promotion of students to next year levels
- **Graduation Handling**: Remove final-year classes at year end
- **New Intake Management**: Add new first-year classes automatically

### 📊 Reporting & Export
- **Comprehensive Reports**: Generate reports by lecturer, department, session, and school-wide
- **Export Options**: PDF and Excel export functionality
- **Print Support**: Print-friendly timetable views

### 🎨 User Experience
- **Modern UI**: Clean, responsive interface built with Tailwind CSS
- **Form Validation**: Robust form validation using Zod schemas
- **State Management**: Centralized state management with React Context
- **Data Persistence**: Local storage for data persistence

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + useReducer
- **Form Handling**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd timetable_B
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage Guide

### 1. Initial Setup

The application comes with sample data to get you started:

- **Sessions**: Regular (Mon-Fri) and Weekend (Sat-Sun) sessions
- **Departments**: Computer Science, Electrical Engineering, Business Administration
- **Courses**: Sample courses with credit hours and descriptions
- **Lecturers**: Faculty members with contact information
- **Rooms**: Various room types with facilities
- **Academic Years**: Current and upcoming academic years

### 2. Creating Your First Timetable

1. **Review Sessions**: Navigate to Sessions page to see available academic sessions
2. **Check Departments**: Ensure departments are properly configured
3. **Add Courses**: Create courses and assign them to departments and lecturers
4. **Configure Rooms**: Set up room assignments for different sessions
5. **Generate Timetable**: Use the Timetable page to create schedule entries

### 3. Managing Academic Years

1. **Set Active Year**: Mark the current academic year as active
2. **Year End Process**: Use the Academic Years page to handle year transitions
3. **Student Promotion**: Automatically promote students to next year levels
4. **New Intake**: Add new first-year classes

### 4. Generating Reports

1. **Navigate to Reports**: Access the Reports page
2. **Select Report Type**: Choose from available report types
3. **Apply Filters**: Filter data by session, department, or academic year
4. **Export**: Download reports in PDF or Excel format

## Project Structure

```
src/
├── components/          # Reusable UI components
├── lib/                # Utility functions and validation schemas
├── pages/              # Main application pages
├── store/              # State management and context
├── types/              # TypeScript type definitions
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## Key Components

### Store (`src/store/index.tsx`)
- Centralized state management using React Context
- Actions for CRUD operations on all entities
- Local storage persistence
- Sample data initialization

### Validation (`src/lib/validations.ts`)
- Zod schemas for all form inputs
- Type-safe validation rules
- Comprehensive error messages

### Pages
- **Dashboard**: Overview of system statistics
- **Sessions**: Academic session management
- **Departments**: Department configuration
- **Courses**: Course creation and management
- **Lecturers**: Faculty member management
- **Rooms**: Facility and room management
- **Timetable**: Schedule creation and viewing
- **Academic Years**: Year progression management
- **Reports**: Data export and reporting


## Data Models

### Core Entities
- **Session**: Academic sessions with working days and time slots
- **Department**: Academic departments within sessions
- **Course**: Individual courses with credit hours and prerequisites
- **Lecturer**: Faculty members with specializations
- **Room**: Teaching facilities with capacity and equipment
- **TimetableEntry**: Individual schedule entries
- **AcademicYear**: Academic year periods with active status

### Relationships
- Sessions contain multiple departments
- Departments offer multiple courses
- Courses are taught by lecturers
- Rooms are assigned to sessions
- Timetable entries link all entities together

## Customization

### Adding New Session Types
1. Navigate to Sessions page
2. Click "New Session"
3. Configure working days and time slots
4. Set number of years for the program

### Room Type Configuration
The system supports these room types:
- Lecture Hall
- Laboratory
- Computer Lab
- Seminar Room
- Auditorium
- Tutorial Room

### Academic Structure
- Flexible year levels (1-10)
- Semester support (1-4)
- Core vs. elective course designation
- Prerequisite course relationships

## Future Enhancements

- **Backend Integration**: Database persistence and API endpoints
- **User Authentication**: Multi-user support with role-based access
- **Advanced Scheduling**: AI-powered conflict resolution
- **Mobile App**: React Native mobile application
- **Real-time Updates**: WebSocket integration for live updates
- **Advanced Analytics**: Detailed usage and performance metrics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ for educational institutions**
