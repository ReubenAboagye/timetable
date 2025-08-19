import React, { useState, useMemo } from 'react';
import { Plus, X, BookOpen, Users, Building2, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Session, Department, Course, Class, CreateBulkCourseAssignmentForm, BulkAssignmentPreview } from '../types';
import type { BulkCourseAssignment } from '../types';
import { sampleClasses, sampleCourses } from '../lib/sampleData';
import { getAffectedClasses, getAvailableCourses, validateBulkAssignment } from '../lib/bulkAssignmentUtils';

interface BulkCourseAssignmentProps {
  sessions: Session[];
  departments: Department[];
  onAssignmentCreated: (assignment: BulkCourseAssignment) => void;
  onClose: () => void;
}

const BulkCourseAssignment: React.FC<BulkCourseAssignmentProps> = ({
  sessions,
  departments,
  onAssignmentCreated,
  onClose
}) => {
  const [formData, setFormData] = useState<CreateBulkCourseAssignmentForm>({
    sessionId: '',
    departmentId: '',
    yearLevel: 1,
    semester: 1,
    courseIds: []
  });

  const [showPreview, setShowPreview] = useState(false);

  // Get available courses for the selected criteria
  const availableCourses = useMemo(() => {
    if (!formData.sessionId || !formData.departmentId) return [];
    
    return getAvailableCourses(formData, sampleCourses);
  }, [formData.sessionId, formData.departmentId, formData.yearLevel, formData.semester]);

  // Get affected classes for the selected criteria
  const affectedClasses = useMemo(() => {
    if (!formData.sessionId || !formData.departmentId) return [];
    
    return getAffectedClasses(formData, sampleClasses);
  }, [formData.sessionId, formData.departmentId, formData.yearLevel, formData.semester]);

  // Generate preview data
  const previewData: BulkAssignmentPreview | null = useMemo(() => {
    if (!formData.sessionId || !formData.departmentId || formData.courseIds.length === 0) return null;
    
    const selectedCourses = sampleCourses.filter(course => formData.courseIds.includes(course.id));
    const totalStudents = affectedClasses.reduce((sum, cls) => sum + cls.studentCount, 0);
    
    return {
      sessionId: formData.sessionId,
      departmentId: formData.departmentId,
      yearLevel: formData.yearLevel,
      semester: formData.semester,
      affectedClasses,
      assignedCourses: selectedCourses,
      totalStudents
    };
  }, [formData, affectedClasses]);

  const handleInputChange = (field: keyof CreateBulkCourseAssignmentForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset course selection when criteria changes
    if (field === 'sessionId' || field === 'departmentId' || field === 'yearLevel' || field === 'semester') {
      setFormData(prev => ({ ...prev, courseIds: [] }));
    }
  };

  const handleCourseToggle = (courseId: string) => {
    setFormData(prev => ({
      ...prev,
      courseIds: prev.courseIds.includes(courseId)
        ? prev.courseIds.filter(id => id !== courseId)
        : [...prev.courseIds, courseId]
    }));
  };

  const handlePreview = () => {
    if (formData.courseIds.length > 0 && previewData) {
      // Validate the assignment before showing preview
      const validation = validateBulkAssignment(formData, sampleClasses, sampleCourses);
      if (!validation.isValid) {
        alert(`Validation errors:\n${validation.errors.join('\n')}`);
        return;
      }
      setShowPreview(true);
    }
  };

  const handleConfirm = () => {
    if (!previewData) return;
    
    const newAssignment: BulkCourseAssignment = {
      id: `bca_${Date.now()}`,
      sessionId: formData.sessionId,
      departmentId: formData.departmentId,
      yearLevel: formData.yearLevel,
      semester: formData.semester,
      courseIds: formData.courseIds,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    onAssignmentCreated(newAssignment);
    onClose();
  };

  const getSessionName = (sessionId: string) => {
    return sessions.find(s => s.id === sessionId)?.name || 'Unknown';
  };

  const getDepartmentName = (departmentId: string) => {
    return departments.find(d => d.id === departmentId)?.name || 'Unknown';
  };

  const getDepartmentCode = (departmentId: string) => {
    return departments.find(d => d.id === departmentId)?.code || 'Unknown';
  };

  const isFormValid = formData.sessionId && formData.departmentId && formData.courseIds.length > 0;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Bulk Course Assignment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Selection Criteria */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Assignment Criteria</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session</label>
                <select
                  value={formData.sessionId}
                  onChange={(e) => handleInputChange('sessionId', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Session</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => handleInputChange('departmentId', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year Level</label>
                <select
                  value={formData.yearLevel}
                  onChange={(e) => handleInputChange('yearLevel', parseInt(e.target.value))}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {[1, 2, 3, 4, 5].map((level) => (
                    <option key={level} value={level}>
                      Year {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                <select
                  value={formData.semester}
                  onChange={(e) => handleInputChange('semester', parseInt(e.target.value))}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {[1, 2].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Available Courses */}
          {availableCourses.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Available Courses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableCourses.map((course) => (
                  <label key={course.id} className="flex items-center p-3 bg-white rounded-lg border cursor-pointer hover:bg-blue-50">
                    <input
                      type="checkbox"
                      checked={formData.courseIds.includes(course.id)}
                      onChange={() => handleCourseToggle(course.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{course.name}</div>
                      <div className="text-sm text-gray-500">{course.code} • {course.creditHours} credits</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Affected Classes Preview */}
          {affectedClasses.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Affected Classes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {affectedClasses.map((cls) => (
                  <div key={cls.id} className="p-3 bg-white rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getDepartmentCode(cls.departmentId)}{cls.yearLevel}00{cls.name}
                        </div>
                        <div className="text-sm text-gray-500">{cls.studentCount} students</div>
                      </div>
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-gray-600">
                Total: {affectedClasses.length} classes • {affectedClasses.reduce((sum, cls) => sum + cls.studentCount, 0)} students
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePreview}
              disabled={!isFormValid}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Preview Assignment
            </button>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && previewData && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-6 border w-full max-w-3xl shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Assignment Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Summary */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">
                      This will assign {previewData.assignedCourses.length} course(s) to {previewData.affectedClasses.length} class(es)
                    </span>
                  </div>
                </div>

                {/* Assignment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Assignment Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Session:</span>
                        <span className="text-sm font-medium">{getSessionName(previewData.sessionId)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Department:</span>
                        <span className="text-sm font-medium">{getDepartmentName(previewData.departmentId)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Year Level:</span>
                        <span className="text-sm font-medium">Year {previewData.yearLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Semester:</span>
                        <span className="text-sm font-medium">Semester {previewData.semester}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Impact Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Classes Affected:</span>
                        <span className="text-sm font-medium">{previewData.affectedClasses.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Students:</span>
                        <span className="text-sm font-medium">{previewData.totalStudents}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Courses Assigned:</span>
                        <span className="text-sm font-medium">{previewData.assignedCourses.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Courses */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Courses to be Assigned</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {previewData.assignedCourses.map((course) => (
                      <div key={course.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-900">{course.name}</div>
                        <div className="text-sm text-gray-500">{course.code} • {course.creditHours} credits</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Back to Edit
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                  >
                    Confirm Assignment
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

export default BulkCourseAssignment;
