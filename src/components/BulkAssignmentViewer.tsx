import React, { useState } from 'react';
import { Eye, Trash2, Edit, X, BookOpen } from 'lucide-react';
import { BulkCourseAssignment, Session, Department, Course, Class } from '../types';
import { sampleSessions, sampleDepartments, sampleCourses, sampleClasses } from '../lib/sampleData';

interface BulkAssignmentViewerProps {
  assignments: BulkCourseAssignment[];
  onDelete: (assignmentId: string) => void;
  onEdit: (assignment: BulkCourseAssignment) => void;
  onClose: () => void;
}

const BulkAssignmentViewer: React.FC<BulkAssignmentViewerProps> = ({
  assignments,
  onDelete,
  onEdit,
  onClose
}) => {
  const [selectedAssignment, setSelectedAssignment] = useState<BulkCourseAssignment | null>(null);

  const getSessionName = (sessionId: string) => {
    return sampleSessions.find(s => s.id === sessionId)?.name || 'Unknown';
  };

  const getDepartmentName = (departmentId: string) => {
    return sampleDepartments.find(d => d.id === departmentId)?.name || 'Unknown';
  };

  const getDepartmentCode = (departmentId: string) => {
    return sampleDepartments.find(d => d.id === departmentId)?.code || 'Unknown';
  };

  const getCourseNames = (courseIds: string[]) => {
    return sampleCourses
      .filter(course => courseIds.includes(course.id))
      .map(course => course.name);
  };

  const getAffectedClasses = (assignment: BulkCourseAssignment) => {
    return sampleClasses.filter(cls => 
      cls.sessionId === assignment.sessionId &&
      cls.departmentId === assignment.departmentId &&
      cls.yearLevel === assignment.yearLevel &&
      cls.semester === assignment.semester
    );
  };

  const handleViewDetails = (assignment: BulkCourseAssignment) => {
    setSelectedAssignment(assignment);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-full max-w-6xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Bulk Course Assignments</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Assignments Table */}
          {assignments.length > 0 ? (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assignment Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Courses
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignments.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              {getDepartmentName(assignment.departmentId)} - Year {assignment.yearLevel}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getSessionName(assignment.sessionId)} • Semester {assignment.semester}
                            </div>
                            <div className="text-xs text-gray-400">
                              Created: {assignment.createdAt.toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {getCourseNames(assignment.courseIds).map((courseName, index) => (
                              <div key={index} className="text-sm text-gray-900">
                                {courseName}
                              </div>
                            ))}
                            <div className="text-xs text-gray-500">
                              {assignment.courseIds.length} course(s)
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            assignment.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {assignment.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDetails(assignment)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onEdit(assignment)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onDelete(assignment.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
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
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bulk assignments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new bulk course assignment.
              </p>
            </div>
          )}
        </div>

        {/* Assignment Details Modal */}
        {selectedAssignment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Assignment Details</h3>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Assignment Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Assignment Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Session</div>
                      <div className="text-sm font-medium">{getSessionName(selectedAssignment.sessionId)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Department</div>
                      <div className="text-sm font-medium">{getDepartmentName(selectedAssignment.departmentId)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Year Level</div>
                      <div className="text-sm font-medium">Year {selectedAssignment.yearLevel}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Semester</div>
                      <div className="text-sm font-medium">Semester {selectedAssignment.semester}</div>
                    </div>
                  </div>
                </div>

                {/* Assigned Courses */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Assigned Courses</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sampleCourses
                      .filter(course => selectedAssignment.courseIds.includes(course.id))
                      .map((course) => (
                        <div key={course.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-900">{course.name}</div>
                          <div className="text-sm text-gray-500">{course.code} • {course.creditHours} credits</div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Affected Classes */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Affected Classes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {getAffectedClasses(selectedAssignment).map((cls) => (
                      <div key={cls.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {getDepartmentCode(cls.departmentId)}{cls.yearLevel}00{cls.name}
                            </div>
                            <div className="text-sm text-gray-500">{cls.studentCount} students</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setSelectedAssignment(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => onEdit(selectedAssignment)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    Edit Assignment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkAssignmentViewer;
