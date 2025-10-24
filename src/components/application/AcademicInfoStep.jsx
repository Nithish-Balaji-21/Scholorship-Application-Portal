import React from 'react';
import { GraduationCap, Calendar, Building2, Plus, Trash2 } from 'lucide-react';

// Academic Information Step Component
export const AcademicInfoStep = ({ data, onChange }) => {
  const addPreviousEducation = () => {
    const newEducation = {
      level: '',
      board: '',
      institution: '',
      passingYear: '',
      percentage: '',
      grade: ''
    };
    onChange('previousEducation', [...data.previousEducation, newEducation]);
  };

  const updatePreviousEducation = (index, field, value) => {
    const updated = [...data.previousEducation];
    updated[index] = { ...updated[index], [field]: value };
    onChange('previousEducation', updated);
  };

  const removePreviousEducation = (index) => {
    const updated = data.previousEducation.filter((_, i) => i !== index);
    onChange('previousEducation', updated);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <GraduationCap className="h-6 w-6 mr-2 text-blue-600" />
        Academic Information
      </h2>
      
      {/* Current Education */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Current Education</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Education Level *
            </label>
            <select
              value={data.currentEducationLevel}
              onChange={(e) => onChange('currentEducationLevel', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Level</option>
              <option value="high-school">High School</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="graduate">Graduate</option>
              <option value="postgraduate">Postgraduate</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Course/Program *
            </label>
            <input
              type="text"
              value={data.currentCourse}
              onChange={(e) => onChange('currentCourse', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., B.Tech Computer Science, M.Sc Physics"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Institution Name *
            </label>
            <input
              type="text"
              value={data.institution.name}
              onChange={(e) => onChange('institution', e.target.value, 'name')}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your college/university name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enrollment/Roll Number *
            </label>
            <input
              type="text"
              value={data.enrollmentNumber}
              onChange={(e) => onChange('enrollmentNumber', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your student ID/roll number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Field of Study *
            </label>
            <input
              type="text"
              value={data.fieldOfStudy}
              onChange={(e) => onChange('fieldOfStudy', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Engineering, Medicine, Arts"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Semester
            </label>
            <input
              type="number"
              value={data.currentSemester}
              onChange={(e) => onChange('currentSemester', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
              max="12"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current GPA/CGPA
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                value={data.currentGPA.value}
                onChange={(e) => onChange('currentGPA', e.target.value, 'value')}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="8.5"
              />
              <select
                value={data.currentGPA.scale}
                onChange={(e) => onChange('currentGPA', e.target.value, 'scale')}
                className="w-20 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="4.0">4.0</option>
                <option value="10.0">10.0</option>
                <option value="100">%</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expected Graduation Date *
            </label>
            <input
              type="date"
              value={data.expectedGraduation}
              onChange={(e) => onChange('expectedGraduation', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      
      {/* Previous Education */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Previous Education</h3>
          <button
            type="button"
            onClick={addPreviousEducation}
            className="flex items-center px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Education
          </button>
        </div>
        
        {data.previousEducation.map((edu, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Education #{index + 1}</h4>
              <button
                type="button"
                onClick={() => removePreviousEducation(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level *
                </label>
                <select
                  value={edu.level}
                  onChange={(e) => updatePreviousEducation(index, 'level', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Level</option>
                  <option value="10th">10th Standard</option>
                  <option value="12th">12th Standard</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Board/University
                </label>
                <input
                  type="text"
                  value={edu.board}
                  onChange={(e) => updatePreviousEducation(index, 'board', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., CBSE, State Board"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institution Name *
                </label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => updatePreviousEducation(index, 'institution', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="School/College name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passing Year *
                </label>
                <input
                  type="number"
                  value={edu.passingYear}
                  onChange={(e) => updatePreviousEducation(index, 'passingYear', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1990"
                  max={new Date().getFullYear()}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Percentage/CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={edu.percentage}
                  onChange={(e) => updatePreviousEducation(index, 'percentage', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="85.5 or 8.5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade
                </label>
                <input
                  type="text"
                  value={edu.grade}
                  onChange={(e) => updatePreviousEducation(index, 'grade', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="A+, First Class, Distinction"
                />
              </div>
            </div>
          </div>
        ))}
        
        {data.previousEducation.length === 0 && (
          <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
            <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No previous education added yet.</p>
            <p className="text-sm">Click "Add Education" to add your previous qualifications.</p>
          </div>
        )}
      </div>
    </div>
  );
};