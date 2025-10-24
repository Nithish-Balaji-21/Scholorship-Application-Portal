import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  X, 
  User, 
  GraduationCap,
  DollarSign,
  Paperclip,
  Edit3,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Building2,
  TestTube
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import apiService from '../services/api';
import { AcademicInfoStep } from '../components/application/AcademicInfoStep';
import { FamilyFinancialStep } from '../components/application/FamilyFinancialStep';
import { DocumentsStep } from '../components/application/DocumentsStep';
import { EssaysStep } from '../components/application/EssaysStep';
import { ReviewStep } from '../components/application/ReviewStep';
import { demoApplicationData } from '../utils/testData';

const ComprehensiveScholarshipApplication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Application form data with comprehensive fields
  const [applicationData, setApplicationData] = useState({
    personalInfo: {
      fullName: user?.firstName + ' ' + user?.lastName || '',
      email: user?.email || '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      nationality: 'Indian',
      aadhaarNumber: '',
      address: {
        street: '',
        city: '',
        state: '',
        country: 'India',
        zipCode: ''
      }
    },
    academicInfo: {
      currentEducationLevel: '',
      currentCourse: '',
      institution: {
        name: '',
        address: '',
        website: ''
      },
      enrollmentNumber: '',
      fieldOfStudy: '',
      currentGPA: {
        value: '',
        scale: '10.0'
      },
      currentSemester: '',
      expectedGraduation: '',
      previousEducation: []
    },
    familyFinancialInfo: {
      father: {
        name: '',
        occupation: '',
        income: '',
        employer: '',
        phoneNumber: ''
      },
      mother: {
        name: '',
        occupation: '',
        income: '',
        employer: '',
        phoneNumber: ''
      },
      totalFamilyIncome: '',
      householdSize: '',
      incomeCategory: '',
      bankDetails: {
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: ''
      }
    },
    essays: {
      statementOfPurpose: '',
      whyDeserveScholarship: '',
      careerGoals: '',
      challenges: ''
    },
    documents: {
      // Match backend Application model field names
      idProof: null,                    // Identity proof
      photograph: null,                 // Passport size photo
      marksheets: [],                   // Array: 10th, 12th marksheets
      incomeCertificate: null,          // Income certificate
      casteCertificate: null,           // Caste certificate
      recommendationLetters: [],        // Array of recommendation letters
      additionalDocuments: []           // Array of additional documents
    }
  });

  const [uploadProgress, setUploadProgress] = useState({});

  // Function to fill form with demo data for testing
  const fillWithDemoData = () => {
    if (!window.confirm('Fill form with demo data? This will overwrite any existing data.')) {
      return;
    }

    setApplicationData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        ...demoApplicationData.personalInfo
      },
      academicInfo: {
        ...prev.academicInfo,
        ...demoApplicationData.academicInfo
      },
      familyFinancialInfo: {
        ...prev.familyFinancialInfo,
        ...demoApplicationData.familyFinancialInfo
      },
      essays: {
        ...prev.essays,
        ...demoApplicationData.essays
      }
      // Note: documents still need manual upload
    }));

    alert('✅ Form filled with demo data! Note: You still need to upload documents manually in Step 4.');
    console.log('Demo data applied:', demoApplicationData);
  };


  const steps = [
    { 
      id: 1, 
      name: 'Personal Information', 
      icon: User,
      description: 'Basic personal details and contact information'
    },
    { 
      id: 2, 
      name: 'Academic Details', 
      icon: GraduationCap,
      description: 'Educational background and current studies'
    },
    { 
      id: 3, 
      name: 'Family & Financial', 
      icon: DollarSign,
      description: 'Family details and financial information'
    },
    { 
      id: 4, 
      name: 'Documents Upload', 
      icon: Paperclip,
      description: 'Required documents and certificates'
    },
    { 
      id: 5, 
      name: 'Essays & SOP', 
      icon: Edit3,
      description: 'Statement of purpose and essays'
    },
    { 
      id: 6, 
      name: 'Review & Submit', 
      icon: Eye,
      description: 'Review your application before submission'
    }
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
        scholarshipData = response;
      }
      
      if (scholarshipData) {
        setScholarship(scholarshipData);
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

  const handleInputChange = (section, field, value, subfield = null) => {
    setApplicationData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: subfield 
          ? { ...prev[section][field], [subfield]: value }
          : value
      }
    }));
  };

  const handleFileUpload = async (documentType, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'application-document');

    // Create a unique progress key for array documents
    const progressKey = `${documentType.key}-${documentType.arrayIndex || 0}`;

    try {
      setUploadProgress(prev => ({ ...prev, [progressKey]: 0 }));
      
      const response = await apiService.uploadFile(formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, [progressKey]: percentCompleted }));
        }
      });

      // Handle response format
      const responseData = response?.data || response;
      let uploadData = null;
      
      if (responseData?.file) {
        uploadData = responseData.file;
      } else if (responseData?.url) {
        uploadData = responseData;
      }

      if (uploadData && (uploadData.url || uploadData.filename || uploadData.id)) {
        const documentInfo = {
          filename: uploadData.filename || uploadData.originalName,
          url: uploadData.url || uploadData.path,
          uploadedAt: new Date()
        };

        setApplicationData(prev => {
          const newDocs = { ...prev.documents };
          
          if (documentType.isArray) {
            // Handle array documents
            const existingArray = Array.isArray(newDocs[documentType.key]) 
              ? [...newDocs[documentType.key]] 
              : [];
            
            // Set at specific index or push
            if (documentType.arrayIndex !== undefined) {
              existingArray[documentType.arrayIndex] = documentInfo;
            } else {
              existingArray.push(documentInfo);
            }
            
            newDocs[documentType.key] = existingArray;
          } else {
            // Handle single document
            newDocs[documentType.key] = documentInfo;
          }
          
          return {
            ...prev,
            documents: newDocs
          };
        });
        
        console.log(`Document uploaded successfully: ${documentType.key}`, documentInfo);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert(`Failed to upload ${documentType.name}. Please try again.`);
    } finally {
      setUploadProgress(prev => ({ ...prev, [progressKey]: null }));
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        const { personalInfo } = applicationData;
        return personalInfo.fullName && personalInfo.email && personalInfo.phone && 
               personalInfo.dateOfBirth && personalInfo.gender && personalInfo.aadhaarNumber;
      case 2:
        const { academicInfo } = applicationData;
        return academicInfo.currentEducationLevel && academicInfo.currentCourse && 
               academicInfo.institution.name && academicInfo.enrollmentNumber;
      case 3:
        const { familyFinancialInfo } = applicationData;
        return familyFinancialInfo.father.name && familyFinancialInfo.totalFamilyIncome && 
               familyFinancialInfo.bankDetails.accountNumber;
      case 4:
        const { documents } = applicationData;
        // Check required documents with new field names
        const hasIdProof = documents.idProof && documents.idProof.url;
        const hasPhotograph = documents.photograph && documents.photograph.url;
        const hasMarksheets = documents.marksheets && documents.marksheets.length > 0 && documents.marksheets[0]?.url;
        const hasIncomeCertificate = documents.incomeCertificate && documents.incomeCertificate.url;
        
        console.log('Document validation:', {
          idProof: hasIdProof,
          photograph: hasPhotograph,
          marksheets: hasMarksheets,
          incomeCertificate: hasIncomeCertificate,
          allDocuments: documents
        });
        
        return hasIdProof && hasPhotograph && hasMarksheets && hasIncomeCertificate;
      case 5:
        const { essays } = applicationData;
        return essays.statementOfPurpose && essays.whyDeserveScholarship && essays.careerGoals;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    } else {
      // Provide specific error message for documents step
      if (currentStep === 4) {
        const { documents } = applicationData;
        const missing = [];
        
        if (!documents.idProof || !documents.idProof.url) missing.push('Identity Proof');
        if (!documents.photograph || !documents.photograph.url) missing.push('Passport Photograph');
        if (!documents.marksheets || documents.marksheets.length === 0 || !documents.marksheets[0]?.url) missing.push('10th Marksheet');
        if (!documents.incomeCertificate || !documents.incomeCertificate.url) missing.push('Income Certificate');
        
        alert(`Please upload the following required documents:\n- ${missing.join('\n- ')}`);
      } else {
        alert('Please fill all required fields in this step.');
      }
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const submitData = {
        scholarshipId: id,
        ...applicationData,
        status: 'draft'
      };

      console.log('Submitting application:', submitData);
      const response = await apiService.createApplication(submitData);

      if (response.success) {
        await apiService.submitApplication(response.data._id);
        alert('Application submitted successfully! You will receive a confirmation email shortly.');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert(`Failed to submit application: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application form...</p>
        </div>
      </div>
    );
  }

  if (error || !scholarship) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Scholarship not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{scholarship.title}</h1>
              <p className="text-gray-600">{scholarship.organization?.name}</p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <DollarSign className="h-4 w-4 mr-1" />
                <span>Amount: ₹{scholarship.amount?.value?.toLocaleString()}</span>
              </div>
            </div>
            
            {/* Demo Data Button - Only show in development */}
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={fillWithDemoData}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mx-4"
                title="Fill form with demo data for testing"
              >
                <TestTube className="h-4 w-4" />
                <span className="text-sm font-medium">Fill Demo Data</span>
              </button>
            )}
            
            <div className="text-right">
              <div className="text-sm text-gray-500">Application Deadline</div>
              <div className="text-lg font-semibold text-red-600">
                {new Date(scholarship.deadlines?.application).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                        currentStep >= step.id
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-300 text-gray-400 bg-white'
                      }`}
                    >
                      <step.icon className="h-6 w-6" />
                    </div>
                    <div className="text-center mt-2">
                      <div className={`text-sm font-medium ${
                        currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {step.name}
                      </div>
                      <div className="text-xs text-gray-500 max-w-24">
                        {step.description}
                      </div>
                    </div>
                  </div>
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

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {currentStep === 1 && (
            <PersonalInfoStep 
              data={applicationData.personalInfo} 
              onChange={(field, value, subfield) => handleInputChange('personalInfo', field, value, subfield)}
            />
          )}
          
          {currentStep === 2 && (
            <AcademicInfoStep 
              data={applicationData.academicInfo} 
              onChange={(field, value, subfield) => handleInputChange('academicInfo', field, value, subfield)}
            />
          )}
          
          {currentStep === 3 && (
            <FamilyFinancialStep 
              data={applicationData.familyFinancialInfo} 
              onChange={(field, value, subfield) => handleInputChange('familyFinancialInfo', field, value, subfield)}
            />
          )}
          
          {currentStep === 4 && (
            <DocumentsStep 
              data={applicationData.documents} 
              onFileUpload={handleFileUpload}
              uploadProgress={uploadProgress}
            />
          )}
          
          {currentStep === 5 && (
            <EssaysStep 
              data={applicationData.essays} 
              onChange={(field, value) => handleInputChange('essays', field, value)}
            />
          )}
          
          {currentStep === 6 && (
            <ReviewStep 
              data={applicationData}
              scholarship={scholarship}
            />
          )}

          {/* Navigation */}
          <div className="flex justify-between p-6 border-t">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                currentStep === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={handleNextStep}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
                  submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Application
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Personal Information Step Component
const PersonalInfoStep = ({ data, onChange }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-6 flex items-center">
      <User className="h-6 w-6 mr-2 text-blue-600" />
      Personal Information
    </h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name (as per official records) *
        </label>
        <input
          type="text"
          value={data.fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your full name"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => onChange('email', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="your.email@example.com"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number *
        </label>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="+91 XXXXX XXXXX"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date of Birth *
        </label>
        <input
          type="date"
          value={data.dateOfBirth}
          onChange={(e) => onChange('dateOfBirth', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gender *
        </label>
        <select
          value={data.gender}
          onChange={(e) => onChange('gender', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Aadhaar Number *
        </label>
        <input
          type="text"
          value={data.aadhaarNumber}
          onChange={(e) => onChange('aadhaarNumber', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="XXXX XXXX XXXX"
          maxLength="12"
        />
      </div>
    </div>
    
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Address Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address *
          </label>
          <input
            type="text"
            value={data.address.street}
            onChange={(e) => onChange('address', e.target.value, 'street')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="House/Flat No, Street Name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <input
            type="text"
            value={data.address.city}
            onChange={(e) => onChange('address', e.target.value, 'city')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State *
          </label>
          <input
            type="text"
            value={data.address.state}
            onChange={(e) => onChange('address', e.target.value, 'state')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ZIP Code *
          </label>
          <input
            type="text"
            value={data.address.zipCode}
            onChange={(e) => onChange('address', e.target.value, 'zipCode')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  </div>
);

// Continue with other step components...

export default ComprehensiveScholarshipApplication;