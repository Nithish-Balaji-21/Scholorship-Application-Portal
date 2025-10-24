import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Upload, AlertCircle, CheckCircle, X, Plus, Trash2, TestTube } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import apiService from '../services/api';
import { prefillFormWithDemoData, demoApplicationData } from '../utils/testData';

const ScholarshipApplication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Application form data
  const [applicationData, setApplicationData] = useState({
    personalStatement: '',
    essays: {},
    documents: {},
    recommendations: [],
    additionalInfo: ''
  });

  // File upload states
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});

  // Function to fill form with demo data for testing
  const fillWithDemoData = () => {
    if (!window.confirm('Fill form with demo data? This will overwrite any existing data.')) {
      return;
    }

    setApplicationData(prev => ({
      ...prev,
      personalStatement: demoApplicationData.essays.personalStatement,
      additionalInfo: demoApplicationData.essays.additionalInfo,
      // Map essays from demo data
      essays: Object.keys(prev.essays).reduce((acc, key, index) => {
        const essayContent = Object.values(demoApplicationData.essays)[index] || 
                            demoApplicationData.essays.personalStatement;
        acc[key] = {
          ...prev.essays[key],
          content: essayContent,
          wordCount: essayContent.split(/\s+/).filter(w => w.length > 0).length
        };
        return acc;
      }, {}),
    }));

    alert('✅ Form filled with demo data! Note: You still need to upload documents manually.');
    console.log('Demo data applied:', demoApplicationData);
  };


  const steps = [
    { id: 1, name: 'Personal Information', icon: FileText },
    { id: 2, name: 'Essays & Documents', icon: Upload },
    { id: 3, name: 'Review & Submit', icon: CheckCircle }
  ];

  useEffect(() => {
    fetchScholarshipDetails();
  }, [id]);

  const fetchScholarshipDetails = async () => {
    try {
      const response = await apiService.getScholarshipById(id);
      console.log('API Response:', response);
      
      let scholarshipData = null;
      
      // Handle different response formats
      if (response.success && response.data) {
        scholarshipData = response.data;
      } else if (response._id) {
        // Direct object format
        scholarshipData = response.data;
      }
      
      if (scholarshipData) {
        setScholarship(scholarshipData);
        initializeFormData(scholarshipData);
      } else {
        setError('Scholarship data not found');
      }
    } catch (err) {
      console.error('Error fetching scholarship:', err);
      setError('Failed to load scholarship details');
    } finally {
      setLoading(false);
    }
  };

  const initializeFormData = (scholarshipData) => {
    const initialEssays = {};
    scholarshipData.requirements.essays?.forEach((essay, index) => {
      initialEssays[`essay_${index}`] = {
        topic: essay.topic,
        content: '',
        wordLimit: essay.wordLimit,
        wordCount: 0
      };
    });

    const initialDocs = {};
    scholarshipData.requirements.documents?.forEach((doc, index) => {
      initialDocs[`doc_${index}`] = {
        name: doc.name,
        description: doc.description,
        required: doc.required,
        file: null,
        uploaded: false
      };
    });

    setApplicationData(prev => ({
      ...prev,
      essays: initialEssays,
      documents: initialDocs,
      recommendations: new Array(scholarshipData.requirements.recommendations?.count || 0).fill({
        email: '',
        name: '',
        relationship: '',
        sent: false
      })
    }));
  };

  const handleEssayChange = (essayKey, content) => {
    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    setApplicationData(prev => ({
      ...prev,
      essays: {
        ...prev.essays,
        [essayKey]: {
          ...prev.essays[essayKey],
          content,
          wordCount
        }
      }
    }));
  };

  const handleFileUpload = async (docKey, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'application-document');

    try {
      setUploadProgress(prev => ({ ...prev, [docKey]: 0 }));
      
      const response = await apiService.uploadFile(formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, [docKey]: percentCompleted }));
        }
      });

      console.log('Upload response:', response);
      console.log('Upload response data:', response?.data);
      
      let uploadData = null;
      
      // The response itself contains the data, not response.data
      const responseData = response?.data || response;
      
      // Handle different response formats
      if (responseData?.success && responseData.data) {
        console.log('Using success/data format');
        uploadData = responseData.data;
      } else if (responseData?.file) {
        console.log('Using file format');
        uploadData = responseData.file;
      } else if (responseData?.url) {
        console.log('Using direct URL format');
        uploadData = responseData;
      } else if (responseData) {
        console.log('Using fallback data format');
        uploadData = responseData;
      }

      console.log('Extracted upload data:', uploadData);
      console.log('Upload data properties:', uploadData ? Object.keys(uploadData) : 'null');

      // More flexible validation - check for any of these properties
      const hasValidData = uploadData && (
        uploadData.url || 
        uploadData.filename || 
        uploadData.id || 
        uploadData.originalName ||
        uploadData.path
      );

      if (hasValidData) {
        setApplicationData(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [docKey]: {
              ...prev.documents[docKey],
              file: uploadData,
              uploaded: true
            }
          }
        }));
        
        setUploadedFiles(prev => ({
          ...prev,
          [docKey]: uploadData
        }));
        
        console.log('File uploaded successfully:', uploadData);
      } else {
        console.log('Upload validation failed. Upload data:', uploadData);
        console.log('Available properties:', uploadData ? Object.keys(uploadData) : 'null');
        throw new Error(`Upload response does not contain valid file data. Available properties: ${uploadData ? Object.keys(uploadData).join(', ') : 'none'}`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      console.error('Error response:', err.response);
      alert(`Failed to upload file: ${err.message}. Please try again.`);
    } finally {
      setUploadProgress(prev => ({ ...prev, [docKey]: null }));
    }
  };

  const handleRecommendationChange = (index, field, value) => {
    setApplicationData(prev => ({
      ...prev,
      recommendations: prev.recommendations.map((rec, i) => 
        i === index ? { ...rec, [field]: value } : rec
      )
    }));
  };

  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return applicationData.personalStatement.trim().length > 0;
      case 2:
        // Check required documents are uploaded
        const requiredDocsUploaded = Object.values(applicationData.documents).every(doc => 
          !doc.required || doc.uploaded
        );
        // Check essays are completed
        const essaysCompleted = Object.values(applicationData.essays).every(essay => 
          essay.content.trim().length > 0 && essay.wordCount <= essay.wordLimit
        );
        return requiredDocsUploaded && essaysCompleted;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      console.log('Submitting application for scholarship ID:', id);
      console.log('Scholarship data:', scholarship);

      const submitData = {
        scholarshipId: id,  // Backend expects 'scholarshipId', not 'scholarship'
        personalStatement: applicationData.personalStatement,
        essays: Object.entries(applicationData.essays).map(([key, essay]) => ({
          topic: essay.topic,
          content: essay.content,
          wordCount: essay.wordCount
        })),
        documents: Object.entries(applicationData.documents)
          .filter(([key, doc]) => doc.uploaded)
          .map(([key, doc]) => ({
            name: doc.name,
            fileId: doc.file?.id || doc.file?._id,
            url: doc.file?.url || doc.file?.path
          })),
        recommendations: applicationData.recommendations.filter(rec => rec.email && rec.name),
        additionalInfo: applicationData.additionalInfo,
        // Add required academic info
        academicInfo: {
          currentEducationLevel: 'undergraduate' // Default value, could be made dynamic
        },
        status: 'draft'
      };

      console.log('Submit data:', submitData);

      const response = await apiService.createApplication(submitData);

      if (response.success) {
        // Submit the application
        await apiService.submitApplication(response.data._id);
        
        alert('Application submitted successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading application form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(`/scholarships/${id}`)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Back to Scholarship
          </button>
        </div>
      </div>
    );
  }

  // Add null check for scholarship data
  if (!scholarship) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Scholarship Not Found</h1>
          <p className="text-gray-600 mb-6">The scholarship you're looking for could not be found.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Application for {scholarship.title}</h1>
              <p className="text-gray-600">{scholarship.organization?.name}</p>
            </div>
            
            {/* Demo Data Button - Only show in development */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={fillWithDemoData}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                title="Fill form with demo data for testing"
              >
                <TestTube className="h-4 w-4" />
                <span className="text-sm font-medium">Fill Demo Data</span>
              </button>
            )}
          </div>
          
          {/* Progress Steps */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      currentStep >= step.id
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300 text-gray-400'
                    }`}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {step.name}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personal Statement *
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    Tell us about yourself, your goals, and why you deserve this scholarship.
                  </p>
                  <textarea
                    rows={8}
                    value={applicationData.personalStatement}
                    onChange={(e) => setApplicationData(prev => ({
                      ...prev,
                      personalStatement: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Write your personal statement here..."
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    {applicationData.personalStatement.trim().split(/\s+/).filter(word => word.length > 0).length} words
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Essays & Documents</h2>
              
              {/* Essays */}
              {Object.entries(applicationData.essays).length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Essay Requirements</h3>
                  <div className="space-y-6">
                    {Object.entries(applicationData.essays).map(([key, essay]) => (
                      <div key={key} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{essay.topic}</h4>
                        <textarea
                          rows={6}
                          value={essay.content}
                          onChange={(e) => handleEssayChange(key, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Write your essay here..."
                        />
                        <div className="flex justify-between text-sm mt-2">
                          <span className={`${essay.wordCount > essay.wordLimit ? 'text-red-500' : 'text-gray-500'}`}>
                            {essay.wordCount} / {essay.wordLimit} words
                          </span>
                          {essay.wordCount > essay.wordLimit && (
                            <span className="text-red-500">Word limit exceeded</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {Object.entries(applicationData.documents).length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Required Documents</h3>
                  <div className="space-y-4">
                    {Object.entries(applicationData.documents).map(([key, doc]) => (
                      <div key={key} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {doc.name}
                            {doc.required && <span className="text-red-500 ml-1">*</span>}
                          </h4>
                          <div className="text-sm text-gray-600">
                            {doc.uploaded ? (
                              <span className="text-green-600 flex items-center">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Uploaded
                              </span>
                            ) : (
                              <span className="text-gray-500">Not uploaded</span>
                            )}
                          </div>
                        </div>
                        {doc.description && (
                          <p className="text-sm text-gray-600 mb-3">{doc.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4">
                          <input
                            type="file"
                            id={`file-${key}`}
                            onChange={(e) => handleFileUpload(key, e.target.files[0])}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                          <label
                            htmlFor={`file-${key}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer flex items-center gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            {doc.uploaded ? 'Replace File' : 'Upload File'}
                          </label>
                          
                          {uploadProgress[key] !== null && uploadProgress[key] !== undefined && (
                            <div className="flex-1">
                              <div className="bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress[key]}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {doc.uploaded && uploadedFiles[key] && (
                          <div className="mt-2 text-sm text-gray-600">
                            File: {uploadedFiles[key].originalName}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {applicationData.recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Letters of Recommendation</h3>
                  <div className="space-y-4">
                    {applicationData.recommendations.map((rec, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Recommendation #{index + 1}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Name *
                            </label>
                            <input
                              type="text"
                              value={rec.name}
                              onChange={(e) => handleRecommendationChange(index, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Recommender's full name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email *
                            </label>
                            <input
                              type="email"
                              value={rec.email}
                              onChange={(e) => handleRecommendationChange(index, 'email', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="recommender@email.com"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Relationship *
                          </label>
                          <input
                            type="text"
                            value={rec.relationship}
                            onChange={(e) => handleRecommendationChange(index, 'relationship', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Professor, Supervisor, Mentor"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Review & Submit</h2>
              
              <div className="space-y-6">
                {/* Personal Statement Preview */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Personal Statement</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{applicationData.personalStatement}</p>
                </div>

                {/* Essays Preview */}
                {Object.entries(applicationData.essays).map(([key, essay]) => (
                  <div key={key} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{essay.topic}</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{essay.content}</p>
                    <div className="text-sm text-gray-500 mt-2">{essay.wordCount} words</div>
                  </div>
                ))}

                {/* Documents Summary */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Uploaded Documents</h3>
                  <div className="space-y-2">
                    {Object.entries(applicationData.documents)
                      .filter(([key, doc]) => doc.uploaded)
                      .map(([key, doc]) => (
                        <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                          <span className="text-gray-700">{doc.name}</span>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      ))
                    }
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Information (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={applicationData.additionalInfo}
                    onChange={(e) => setApplicationData(prev => ({
                      ...prev,
                      additionalInfo: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any additional information you'd like to share..."
                  />
                </div>

                {/* Submission Agreement */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">Before you submit</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please review all information carefully. Once submitted, you cannot make changes to this application.
                        Make sure all required documents are uploaded and all information is accurate.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={handlePrevStep}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
                >
                  Previous
                </button>
              )}
            </div>

            <div>
              {currentStep < steps.length ? (
                <button
                  onClick={handleNextStep}
                  disabled={!validateStep(currentStep)}
                  className={`px-6 py-3 rounded-lg font-semibold ${
                    validateStep(currentStep)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`px-8 py-3 rounded-lg font-semibold ${
                    submitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipApplication;