import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, FileText, User, GraduationCap, Mail, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import FileUpload from './FileUpload';
import { applicationService } from '../services/applicationService';
import { fileService } from '../services/fileService';

const ApplicationForm = ({ scholarship, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const handleFileSelect = async (files) => {
    try {
      setLoading(true);
      const fileArray = Array.isArray(files) ? files : [files];
      
      for (const file of fileArray) {
        const uploadedFile = await fileService.uploadFile(file, 'documents');
        setUploadedDocuments(prev => [...prev, uploadedFile.file]);
      }
      
      toast.success(`${fileArray.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error(error.message || 'File upload failed');
    } finally {
      setLoading(false);
    }
  };

  const removeDocument = async (document) => {
    try {
      await fileService.deleteFile(document.id);
      setUploadedDocuments(prev => prev.filter(doc => doc.id !== document.id));
      toast.success('Document removed');
    } catch (error) {
      toast.error('Failed to remove document');
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const applicationData = {
        ...data,
        scholarshipId: scholarship._id,
        documents: uploadedDocuments.map(doc => ({
          name: doc.originalName,
          url: doc.url,
          type: doc.type,
          size: doc.size
        }))
      };

      await applicationService.createApplication(applicationData);
      
      toast.success('Application submitted successfully!');
      reset();
      setUploadedDocuments([]);
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Apply for Scholarship
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {scholarship.title}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="flex items-center text-sm font-medium text-gray-900 mb-4">
                  <User className="h-4 w-4 mr-2" />
                  Personal Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      {...register('firstName', { required: 'First name is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      {...register('lastName', { required: 'Last name is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      {...register('phone', { required: 'Phone number is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      {...register('dateOfBirth', { required: 'Date of birth is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.dateOfBirth && (
                      <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      {...register('gender')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="flex items-center text-sm font-medium text-gray-900 mb-4">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Academic Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Education Level *
                    </label>
                    <select
                      {...register('educationLevel', { required: 'Education level is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Level</option>
                      <option value="high_school">High School</option>
                      <option value="undergraduate">Undergraduate</option>
                      <option value="graduate">Graduate</option>
                      <option value="postgraduate">Postgraduate</option>
                      <option value="doctoral">Doctoral</option>
                    </select>
                    {errors.educationLevel && (
                      <p className="text-red-500 text-xs mt-1">{errors.educationLevel.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Field of Study *
                    </label>
                    <input
                      {...register('fieldOfStudy', { required: 'Field of study is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Computer Science, Medicine"
                    />
                    {errors.fieldOfStudy && (
                      <p className="text-red-500 text-xs mt-1">{errors.fieldOfStudy.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Institution Name *
                    </label>
                    <input
                      {...register('institutionName', { required: 'Institution name is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.institutionName && (
                      <p className="text-red-500 text-xs mt-1">{errors.institutionName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GPA / Percentage *
                    </label>
                    <input
                      {...register('gpa', { required: 'GPA/Percentage is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 3.8 or 85%"
                    />
                    {errors.gpa && (
                      <p className="text-red-500 text-xs mt-1">{errors.gpa.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Essay/Statement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Statement *
                </label>
                <textarea
                  {...register('personalStatement', { 
                    required: 'Personal statement is required',
                    minLength: {
                      value: 100,
                      message: 'Personal statement must be at least 100 characters'
                    }
                  })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us why you deserve this scholarship and how it will help achieve your goals..."
                />
                {errors.personalStatement && (
                  <p className="text-red-500 text-xs mt-1">{errors.personalStatement.message}</p>
                )}
              </div>

              {/* Document Upload */}
              <div>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  acceptedTypes={['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']}
                  multiple={true}
                  label="Required Documents *"
                  description="Upload transcripts, certificates, recommendation letters, etc."
                />
                
                {uploadedDocuments.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">
                      Uploaded Documents ({uploadedDocuments.length})
                    </h5>
                    <div className="space-y-2">
                      {uploadedDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="text-sm text-gray-700">{doc.originalName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument(doc)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  {...register('agreeToTerms', { required: 'You must agree to the terms and conditions' })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    terms and conditions
                  </a>{' '}
                  and certify that all information provided is accurate.
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-red-500 text-xs">{errors.agreeToTerms.message}</p>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || uploadedDocuments.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading && (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  )}
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;