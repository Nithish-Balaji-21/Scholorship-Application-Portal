import React from 'react';
import { Eye, CheckCircle, AlertCircle, User, GraduationCap, IndianRupee, Paperclip, Edit3 } from 'lucide-react';

// Review & Submit Step Component
export const ReviewStep = ({ data, scholarship }) => {
  const sections = [
    {
      title: 'Personal Information',
      icon: User,
      data: data.personalInfo,
      fields: [
        { label: 'Full Name', key: 'fullName' },
        { label: 'Email', key: 'email' },
        { label: 'Phone', key: 'phone' },
        { label: 'Date of Birth', key: 'dateOfBirth', format: 'date' },
        { label: 'Gender', key: 'gender' },
        { label: 'Aadhaar Number', key: 'aadhaarNumber' },
        { label: 'Address', key: 'address', format: 'address' }
      ]
    },
    {
      title: 'Academic Information',
      icon: GraduationCap,
      data: data.academicInfo,
      fields: [
        { label: 'Education Level', key: 'currentEducationLevel' },
        { label: 'Current Course', key: 'currentCourse' },
        { label: 'Institution', key: 'institution.name' },
        { label: 'Enrollment Number', key: 'enrollmentNumber' },
        { label: 'Field of Study', key: 'fieldOfStudy' },
        { label: 'Current GPA', key: 'currentGPA', format: 'gpa' },
        { label: 'Expected Graduation', key: 'expectedGraduation', format: 'date' }
      ]
    },
    {
      title: 'Family & Financial Information',
      icon: IndianRupee,
      data: data.familyFinancialInfo,
      fields: [
        { label: 'Father\'s Name', key: 'father.name' },
        { label: 'Father\'s Occupation', key: 'father.occupation' },
        { label: 'Father\'s Income', key: 'father.income', format: 'currency' },
        { label: 'Mother\'s Name', key: 'mother.name' },
        { label: 'Total Family Income', key: 'totalFamilyIncome', format: 'currency' },
        { label: 'Household Size', key: 'householdSize' },
        { label: 'Income Category', key: 'incomeCategory' },
        { label: 'Bank Account Number', key: 'bankDetails.accountNumber' },
        { label: 'IFSC Code', key: 'bankDetails.ifscCode' },
        { label: 'Bank Name', key: 'bankDetails.bankName' }
      ]
    }
  ];

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const formatValue = (value, format) => {
    if (!value) return 'Not provided';
    
    switch (format) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'currency':
        return `₹${Number(value).toLocaleString()}`;
      case 'gpa':
        return `${value.value}/${value.scale}`;
      case 'address':
        return `${value.street}, ${value.city}, ${value.state}, ${value.zipCode}`;
      default:
        return value;
    }
  };

  const getDocumentCount = () => {
    const uploaded = Object.values(data.documents).filter(doc => doc && doc.filename).length;
    const total = Object.keys(data.documents).length;
    return { uploaded, total };
  };

  const getEssayWordCount = () => {
    const essays = data.essays;
    return Object.values(essays).reduce((total, essay) => {
      if (typeof essay === 'string') {
        return total + (essay.trim() ? essay.trim().split(/\s+/).length : 0);
      }
      return total;
    }, 0);
  };

  const isApplicationComplete = () => {
    // Check required fields
    const requiredPersonal = ['fullName', 'email', 'phone', 'dateOfBirth', 'gender', 'aadhaarNumber'];
    const personalComplete = requiredPersonal.every(field => data.personalInfo[field]);
    
    const requiredAcademic = ['currentEducationLevel', 'currentCourse', 'enrollmentNumber'];
    const academicComplete = requiredAcademic.every(field => data.academicInfo[field]);
    
    const requiredFinancial = ['totalFamilyIncome'];
    const financialComplete = requiredFinancial.every(field => data.familyFinancialInfo[field]);
    
    const requiredDocs = ['identityProof', 'class10Marksheet', 'class12Marksheet', 'incomeProof'];
    const docsComplete = requiredDocs.every(doc => data.documents[doc]);
    
    const requiredEssays = ['statementOfPurpose', 'whyDeserveScholarship', 'careerGoals'];
    const essaysComplete = requiredEssays.every(essay => data.essays[essay] && data.essays[essay].trim());
    
    return personalComplete && academicComplete && financialComplete && docsComplete && essaysComplete;
  };

  const docCount = getDocumentCount();
  const totalWords = getEssayWordCount();
  const isComplete = isApplicationComplete();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Eye className="h-6 w-6 mr-2 text-blue-600" />
        Review Your Application
      </h2>

      {/* Scholarship Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Scholarship Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-blue-600">Scholarship Name</p>
            <p className="font-medium text-blue-900">{scholarship.title}</p>
          </div>
          <div>
            <p className="text-sm text-blue-600">Amount</p>
            <p className="font-medium text-blue-900">₹{scholarship.amount?.value?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-blue-600">Organization</p>
            <p className="font-medium text-blue-900">{scholarship.organization?.name}</p>
          </div>
        </div>
      </div>

      {/* Application Status */}
      <div className={`border rounded-lg p-4 mb-6 ${
        isComplete ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center">
          {isComplete ? (
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
          )}
          <div>
            <h4 className={`font-medium ${isComplete ? 'text-green-800' : 'text-yellow-800'}`}>
              {isComplete ? 'Application Complete' : 'Application Incomplete'}
            </h4>
            <p className={`text-sm ${isComplete ? 'text-green-700' : 'text-yellow-700'}`}>
              {isComplete 
                ? 'Your application is complete and ready for submission.'
                : 'Please complete all required sections before submitting.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <User className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">✓</div>
          <div className="text-sm text-gray-600">Personal Info</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <GraduationCap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">✓</div>
          <div className="text-sm text-gray-600">Academic Info</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <Paperclip className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{docCount.uploaded}</div>
          <div className="text-sm text-gray-600">Documents Uploaded</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <Edit3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{totalWords}</div>
          <div className="text-sm text-gray-600">Total Words</div>
        </div>
      </div>

      {/* Detailed Information Sections */}
      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold flex items-center">
                <section.icon className="h-5 w-5 mr-2 text-blue-600" />
                {section.title}
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <div className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {formatValue(getNestedValue(section.data, field.key), field.format)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Documents Section */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center">
              <Paperclip className="h-5 w-5 mr-2 text-blue-600" />
              Documents
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(data.documents).map(([key, doc]) => (
                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                    {doc && doc.filename && (
                      <p className="text-sm text-gray-600">{doc.filename}</p>
                    )}
                  </div>
                  <div>
                    {doc && doc.filename ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Essays Section */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center">
              <Edit3 className="h-5 w-5 mr-2 text-blue-600" />
              Essays & Statement of Purpose
            </h3>
          </div>
          <div className="p-6">
            {Object.entries(data.essays).map(([key, essay]) => (
              <div key={key} className="mb-6 last:mb-0">
                <h4 className="font-medium text-gray-900 mb-2 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {essay ? (essay.length > 200 ? `${essay.substring(0, 200)}...` : essay) : 'Not provided'}
                  </p>
                  {essay && (
                    <p className="text-xs text-gray-500 mt-2">
                      {essay.trim().split(/\s+/).length} words
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final Confirmation */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Before You Submit
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center">
            <input type="checkbox" className="mr-3" />
            <span>I confirm that all information provided is accurate and complete</span>
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="mr-3" />
            <span>I understand that providing false information may result in disqualification</span>
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="mr-3" />
            <span>I agree to the terms and conditions of this scholarship program</span>
          </div>
        </div>
      </div>
    </div>
  );
};