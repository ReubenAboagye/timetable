import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  BookOpen, 
  Clock, 
  TrendingUp,
  Plus,
  CalendarDays,
  BookMarked,
  Users,
  Building2,
  MapPin,
  GraduationCap
} from 'lucide-react'
import { useApp } from '../store'

const Dashboard: React.FC = () => {
  const { state } = useApp();
  const { sessions, departments, courses, lecturers, rooms, academicYears, timetableEntries } = state;

  const activeAcademicYear = academicYears.find(ay => ay.isActive);
  const currentTimetableEntries = timetableEntries.filter(te => 
    te.academicYear === activeAcademicYear?.id
  );

  const stats = [
    { 
      name: 'Academic Sessions', 
      value: sessions.length.toString(), 
      icon: Clock, 
      change: `+${sessions.length > 0 ? sessions.length : 0}`, 
      changeType: 'positive',
      href: '/sessions'
    },
    { 
      name: 'Departments', 
      value: departments.length.toString(), 
      icon: Building2, 
      change: `+${departments.length > 0 ? departments.length : 0}`, 
      changeType: 'positive',
      href: '/departments'
    },
    { 
      name: 'Total Courses', 
      value: courses.length.toString(), 
      icon: BookOpen, 
      change: `+${courses.length > 0 ? courses.length : 0}`, 
      changeType: 'positive',
      href: '/courses'
    },
    { 
      name: 'Faculty Members', 
      value: lecturers.length.toString(), 
      icon: Users, 
      change: `+${lecturers.length > 0 ? lecturers.length : 0}`, 
      changeType: 'positive',
      href: '/lecturers'
    },
    { 
      name: 'Teaching Rooms', 
      value: rooms.length.toString(), 
      icon: MapPin, 
      change: `+${rooms.length > 0 ? rooms.length : 0}`, 
      changeType: 'positive',
      href: '/rooms'
    },
    { 
      name: 'Timetable Entries', 
      value: currentTimetableEntries.length.toString(), 
      icon: Calendar, 
      change: `+${currentTimetableEntries.length > 0 ? currentTimetableEntries.length : 0}`, 
      changeType: 'positive',
      href: '/timetable'
    },
  ]

  const quickActions = [
    { name: 'New Session', href: '/sessions', icon: Plus, description: 'Create a new academic session' },
    { name: 'Add Department', href: '/departments', icon: Building2, description: 'Create a new department' },
    { name: 'Add Course', href: '/courses', icon: BookOpen, description: 'Add a new course' },
    { name: 'Add Lecturer', href: '/lecturers', icon: Users, description: 'Add a new faculty member' },
    { name: 'Add Room', href: '/rooms', icon: MapPin, description: 'Add a new teaching room' },
    { name: 'View Timetable', href: '/timetable', icon: CalendarDays, description: 'Check the current timetable' },
    { name: 'Academic Years', href: '/academic-years', icon: GraduationCap, description: 'Manage academic years' },
    { name: 'Generate Reports', href: '/reports', icon: TrendingUp, description: 'View comprehensive reports' },
  ]

  const recentSessions = sessions.slice(0, 3);
  const recentDepartments = departments.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">University Timetable Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to the comprehensive university timetable management system. 
          {activeAcademicYear && ` Current academic year: ${activeAcademicYear.name}`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 group"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <action.icon className="h-8 w-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                    {action.name}
                  </h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Sessions and Departments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Academic Sessions</h3>
          </div>
          <div className="p-6">
            {recentSessions.length > 0 ? (
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{session.name}</h4>
                      <p className="text-sm text-gray-500">
                        {session.numberOfYears} years • {session.workingDays.filter(d => d.isActive).length} working days
                      </p>
                    </div>
                    <Link
                      to="/sessions"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No sessions created yet</p>
                <Link
                  to="/sessions"
                  className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create First Session
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Departments */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Departments</h3>
          </div>
          <div className="p-6">
            {recentDepartments.length > 0 ? (
              <div className="space-y-4">
                {recentDepartments.map((department) => (
                  <div key={department.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{department.name}</h4>
                      <p className="text-sm text-gray-500">
                        {department.code}
                      </p>
                    </div>
                    <Link
                      to="/departments"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No departments created yet</p>
                <Link
                  to="/departments"
                  className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create First Department
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">System Status</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${
                sessions.length > 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Clock className={`h-6 w-6 ${
                  sessions.length > 0 ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900">Sessions</p>
              <p className="text-sm text-gray-500">{sessions.length > 0 ? 'Configured' : 'Not Set'}</p>
            </div>
            
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${
                departments.length > 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Building2 className={`h-6 w-6 ${
                  departments.length > 0 ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900">Departments</p>
              <p className="text-sm text-gray-500">{departments.length > 0 ? 'Configured' : 'Not Set'}</p>
            </div>
            
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${
                courses.length > 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <BookOpen className={`h-6 w-6 ${
                  courses.length > 0 ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900">Courses</p>
              <p className="text-sm text-gray-500">{courses.length > 0 ? 'Configured' : 'Not Set'}</p>
            </div>
            
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${
                activeAcademicYear ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <GraduationCap className={`h-6 w-6 ${
                  activeAcademicYear ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900">Academic Year</p>
              <p className="text-sm text-gray-500">{activeAcademicYear ? 'Active' : 'Not Set'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
