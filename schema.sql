-- MySQL Database Schema for University Timetable Management System
--
-- This script contains the complete database schema, including all tables,
-- relationships, constraints, and indexes.
--
-- The schema is designed to be normalized and efficient, supporting the
-- generation of timetables using a genetic algorithm and allowing for
-- manual edits with a full audit history.
--
-- Database: timetable_db (Example name)
-- Character Set: utf8mb4
-- Collation: utf8mb4_unicode_ci

-- -----------------------------------------------------
-- Section 1: Core Academic Entities
-- -----------------------------------------------------

-- Table: departments
-- Stores information about academic departments.
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: academic_years
-- Stores information about academic years.
CREATE TABLE academic_years (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: programs
-- Stores information about academic programs offered by departments.
CREATE TABLE programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    department_id INT NOT NULL,
    degree_type ENUM('BSc', 'MSc', 'PhD', 'Diploma', 'Certificate') NOT NULL,
    duration_years INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- Table: courses
-- Stores information about courses offered in programs.
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    credit_hours INT NOT NULL,
    program_id INT NOT NULL,
    year_level INT NOT NULL,
    semester INT NOT NULL,
    is_core BOOLEAN DEFAULT TRUE,
    prerequisites TEXT, -- As per user feedback, a simple text field for now.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

-- Table: lecturers
-- Stores information about lecturers.
CREATE TABLE lecturers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    department_id INT, -- A lecturer can be associated with a primary department, but can teach other courses.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);


-- -----------------------------------------------------
-- Section 2: Session and Timetable Structure
-- -----------------------------------------------------

-- Table: sessions
-- Defines different academic sessions (e.g., Regular, Weekend).
-- Each session has its own set of working days, time slots, and breaks.
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    -- The academic year this session belongs to.
    academic_year_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
);

-- Table: working_days
-- Defines the working days for a specific session.
CREATE TABLE working_days (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    day ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (session_id, day),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Table: time_slots
-- Defines the discrete time slots for lectures within a session.
CREATE TABLE time_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    -- A descriptive name for the slot, e.g., "Period 1", "Lunch Break"
    slot_name VARCHAR(100),
    is_break BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (session_id, start_time, end_time),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);


-- -----------------------------------------------------
-- Section 3: Physical Resources
-- -----------------------------------------------------

-- Table: facilities
-- Stores a list of all available facilities (e.g., Projector, Whiteboard).
CREATE TABLE facilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: rooms
-- Stores information about physical rooms where lectures can take place.
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    building VARCHAR(255),
    floor VARCHAR(50),
    capacity INT NOT NULL,
    room_type ENUM('lecture_hall', 'laboratory', 'computer_lab', 'seminar_room', 'auditorium', 'tutorial_room') NOT NULL,
    -- For accessibility constraints, as discussed.
    is_accessible BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (name, building)
);


-- -----------------------------------------------------
-- Section 4: Class and Enrollment
-- -----------------------------------------------------

-- Table: classes
-- Represents a group of students taking a specific set of courses in a program.
CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL, -- e.g., "Class A", "Group 1"
    program_id INT NOT NULL,
    year_level INT NOT NULL,
    semester INT NOT NULL,
    student_count INT NOT NULL,
    max_capacity INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
    UNIQUE KEY (name, program_id, year_level, semester)
);


-- -----------------------------------------------------
-- Section 5: Users and Roles
-- -----------------------------------------------------

-- Table: users
-- Stores user accounts for accessing the system.
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords only
    email VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: roles
-- Defines the roles that can be assigned to users (e.g., Admin, Read-Only).
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- Table: user_roles
-- Assigns roles to users (many-to-many relationship).
CREATE TABLE user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);


-- -----------------------------------------------------
-- Section 6: Junction (Many-to-Many) Tables
-- -----------------------------------------------------

-- Table: course_lecturers
-- Links courses to the lecturers who teach them (many-to-many).
-- This allows for team-teaching.
CREATE TABLE course_lecturers (
    course_id INT NOT NULL,
    lecturer_id INT NOT NULL,
    PRIMARY KEY (course_id, lecturer_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (lecturer_id) REFERENCES lecturers(id) ON DELETE CASCADE
);

-- Table: room_facilities
-- Links rooms to the facilities they have (many-to-many).
CREATE TABLE room_facilities (
    room_id INT NOT NULL,
    facility_id INT NOT NULL,
    PRIMARY KEY (room_id, facility_id),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
);

-- Table: class_course_assignments
-- Links classes to the courses they are taking for a given semester.
CREATE TABLE class_course_assignments (
    class_id INT NOT NULL,
    course_id INT NOT NULL,
    PRIMARY KEY (class_id, course_id),
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);


-- -----------------------------------------------------
-- Section 7: Timetable, Constraints, and History
-- -----------------------------------------------------

-- Table: timetables
-- Represents a complete timetable for a specific context (e.g., a program for a semester).
-- This allows for versioning and managing different timetable states (e.g., draft, published).
CREATE TABLE timetables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    session_id INT NOT NULL,
    academic_year_id INT NOT NULL,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
    UNIQUE KEY (name, session_id, academic_year_id)
);

-- Table: timetable_entries
-- Stores the individual entries (scheduled classes) of a timetable.
CREATE TABLE timetable_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timetable_id INT NOT NULL,
    course_id INT NOT NULL,
    class_id INT NOT NULL,
    room_id INT NOT NULL,
    time_slot_id INT NOT NULL,
    day ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
    is_manual_override BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (timetable_id) REFERENCES timetables(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (time_slot_id) REFERENCES time_slots(id) ON DELETE CASCADE,
    -- Hard constraints to prevent double booking of a class or a room at the same time.
    UNIQUE KEY uq_class_time (class_id, time_slot_id, day, timetable_id),
    UNIQUE KEY uq_room_time (room_id, time_slot_id, day, timetable_id)
);

-- A single lecturer can teach multiple classes at the same time in the same room (combined classes).
-- But a lecturer cannot be in two different rooms at the same time.
CREATE TABLE timetable_lecturer_assignments (
    entry_id INT NOT NULL,
    lecturer_id INT NOT NULL,
    PRIMARY KEY (entry_id, lecturer_id),
    FOREIGN KEY (entry_id) REFERENCES timetable_entries(id) ON DELETE CASCADE,
    FOREIGN KEY (lecturer_id) REFERENCES lecturers(id) ON DELETE CASCADE
);

-- Index to quickly find all lecturers for a given time slot to check for conflicts.
CREATE INDEX idx_lecturer_time ON timetable_lecturer_assignments(lecturer_id);


-- Table: timetable_entry_history
-- Logs all changes to timetable_entries for auditing and restoration purposes.
CREATE TABLE timetable_entry_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entry_id INT, -- Can be NULL if the entry was deleted
    timetable_id INT NOT NULL,
    details JSON, -- Store a JSON blob of the entry's state
    change_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    changed_by_user_id INT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table: lecturer_time_preferences
-- Stores soft constraints for lecturer preferences (e.g., preferred day/time).
CREATE TABLE lecturer_time_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lecturer_id INT NOT NULL,
    time_slot_id INT,
    day ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
    -- e.g., -1 for "unavailable", 0 for "neutral", 1 for "preferred"
    preference_score INT NOT NULL DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (lecturer_id) REFERENCES lecturers(id) ON DELETE CASCADE,
    FOREIGN KEY (time_slot_id) REFERENCES time_slots(id) ON DELETE CASCADE,
    UNIQUE KEY (lecturer_id, time_slot_id, day)
);

-- Table: course_facility_requirements
-- Stores soft constraints for courses that require specific facilities.
CREATE TABLE course_facility_requirements (
    course_id INT NOT NULL,
    facility_id INT NOT NULL,
    PRIMARY KEY (course_id, facility_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE
);


-- -----------------------------------------------------
-- End of Schema
-- -----------------------------------------------------
-- The schema is now complete. You can populate the `roles` table
-- with initial data, e.g., 'Admin' and 'Read-Only'.
-- Example:
-- INSERT INTO roles (name, description) VALUES ('Admin', 'Full access to all system features.');
-- INSERT INTO roles (name, description) VALUES ('Read-Only', 'Can view timetables and reports but cannot make changes.');
-- -----------------------------------------------------
