import React from 'react';
import { Paperclip, Upload, Check, AlertCircle } from 'lucide-react';

// Documents Upload Step Component
export const DocumentsStep = ({ data, onFileUpload, uploadProgress }) => {
  const documentTypes = [
    {
      key: 'idProof',
      name: 'Identity Proof',
      description: 'Aadhaar Card, Passport, Voter ID, or PAN Card',
      required: true,
      acceptedTypes: '.pdf,.jpg,.jpeg,.png',
      isArray: false
    },
    {
      key: 'photograph',
      name: 'Passport Size Photograph',
      description: 'Recent passport-size photograph (JPG/PNG)',
      required: true,
      acceptedTypes: '.jpg,.jpeg,.png',
      isArray: false
    },
    {
      key: 'marksheets',
      name: '10th & 12th Standard Marksheets',
      description: 'Upload 10th and 12th class marksheets/certificates (can upload multiple)',
      required: true,
      acceptedTypes: '.pdf,.jpg,.jpeg,.png',
      isArray: true,
      arrayIndex: 0  // For first marksheet
    },
    {
      key: 'marksheets',
      name: '12th Standard Marksheet (Additional)',
      description: 'Second marksheet if needed',
      required: false,
      acceptedTypes: '.pdf,.jpg,.jpeg,.png',
      isArray: true,
      arrayIndex: 1  // For second marksheet
    },
    {
      key: 'incomeCertificate',
      name: 'Income Certificate',
      description: 'Income certificate, salary slip, or IT return',
      required: true,
      acceptedTypes: '.pdf,.jpg,.jpeg,.png',
      isArray: false
    },
    {
      key: 'casteCertificate',
      name: 'Caste/Community Certificate',
      description: 'SC/ST/OBC/EWS certificate (if applicable)',
      required: false,
      acceptedTypes: '.pdf,.jpg,.jpeg,.png',
      isArray: false
    },
    {
      key: 'recommendationLetters',
      name: 'Recommendation Letter',
      description: 'Letter of recommendation (if applicable)',
      required: false,
      acceptedTypes: '.pdf,.jpg,.jpeg,.png',
      isArray: true,
      arrayIndex: 0
    },
    {
      key: 'additionalDocuments',
      name: 'Additional Documents',
      description: 'Any other supporting documents',
      required: false,
      acceptedTypes: '.pdf,.jpg,.jpeg,.png',
      isArray: true,
      arrayIndex: 0
    }
  ];

  const handleFileChange = (documentType, event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      onFileUpload(documentType, file);
    }
  };

  const getFileStatus = (documentType) => {
    const progressKey = `${documentType.key}-${documentType.arrayIndex || 0}`;
    
    if (uploadProgress[progressKey] !== null && uploadProgress[progressKey] !== undefined) {
      return 'uploading';
    }
    
    if (documentType.isArray) {
      const docs = data[documentType.key] || [];
      if (docs[documentType.arrayIndex]) {
        return 'uploaded';
      }
    } else {
      if (data[documentType.key]) {
        return 'uploaded';
      }
    }
    
    return 'pending';
  };

  const renderFileUpload = (docType) => {
    const status = getFileStatus(docType);
    const progressKey = `${docType.key}-${docType.arrayIndex || 0}`;
    const progress = uploadProgress[progressKey];
    
    let document = null;
    if (docType.isArray) {
      const docs = data[docType.key] || [];
      document = docs[docType.arrayIndex];
    } else {
      document = data[docType.key];
    }

    return (
      <div key={docType.key} className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-medium text-gray-900 flex items-center">
              {docType.name}
              {docType.required && <span className="text-red-500 ml-1">*</span>}
            </h4>
            <p className="text-sm text-gray-600">{docType.description}</p>
            <p className="text-xs text-gray-500 mt-1">
              Accepted formats: {docType.acceptedTypes} | Max size: 5MB
            </p>
          </div>
          
          <div className="flex items-center">
            {status === 'uploaded' && (
              <div className="flex items-center text-green-600">
                <Check className="h-5 w-5 mr-1" />
                <span className="text-sm">Uploaded</span>
              </div>
            )}
            {status === 'uploading' && (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm">{progress}%</span>
              </div>
            )}
            {status === 'pending' && docType.required && (
              <div className="flex items-center text-orange-600">
                <AlertCircle className="h-5 w-5 mr-1" />
                <span className="text-sm">Required</span>
              </div>
            )}
          </div>
        </div>

        {status === 'uploaded' && document && (
          <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">
                  {document.filename || 'File uploaded successfully'}
                </p>
                <p className="text-xs text-green-600">
                  Uploaded on {new Date(document.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              {document.url && (
                <a
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  View
                </a>
              )}
            </div>
          </div>
        )}

        <div className="relative">
          <input
            type="file"
            accept={docType.acceptedTypes}
            onChange={(e) => handleFileChange(docType, e)}
            disabled={status === 'uploading'}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id={`file-${docType.key}-${docType.arrayIndex || 0}`}
          />
          <label
            htmlFor={`file-${docType.key}-${docType.arrayIndex || 0}`}
            className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              status === 'uploading'
                ? 'border-blue-300 bg-blue-50 cursor-not-allowed'
                : status === 'uploaded'
                ? 'border-green-300 bg-green-50 hover:bg-green-100'
                : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <div className="text-center">
              <Upload className={`h-8 w-8 mx-auto mb-2 ${
                status === 'uploaded' ? 'text-green-500' : 'text-gray-400'
              }`} />
              <p className="text-sm font-medium text-gray-700">
                {status === 'uploaded' 
                  ? 'Click to replace file' 
                  : 'Click to upload or drag and drop'
                }
              </p>
              <p className="text-xs text-gray-500">
                {docType.acceptedTypes} up to 5MB
              </p>
            </div>
          </label>
        </div>

        {status === 'uploading' && (
          <div className="mt-3">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Paperclip className="h-6 w-6 mr-2 text-blue-600" />
        Document Upload
      </h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <h4 className="font-medium mb-1">Important Guidelines:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>All documents should be clear and readable</li>
              <li>File size should not exceed 5MB per document</li>
              <li>Accepted formats: PDF, JPG, JPEG, PNG</li>
              <li>Documents marked with * are mandatory</li>
              <li>Bank account must be in applicant's name only</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
          <div className="space-y-4">
            {documentTypes.filter(doc => doc.required).map(renderFileUpload)}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Optional Documents</h3>
          <div className="space-y-4">
            {documentTypes.filter(doc => !doc.required).map(renderFileUpload)}
          </div>
        </div>
      </div>
    </div>
  );
};