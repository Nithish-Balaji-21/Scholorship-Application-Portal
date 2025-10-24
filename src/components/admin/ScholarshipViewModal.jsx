import React from 'react';
import { X, IndianRupee, Calendar, Users, Building, FileText, CheckCircle, XCircle } from 'lucide-react';

const ScholarshipViewModal = ({ scholarship, isOpen, onClose, onEdit }) => {
  if (!isOpen || !scholarship) return null;

  const formatAmount = (amount) => {
    if (!amount || typeof amount !== 'object') {
      return '₹0';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: amount.currency || 'INR'
    }).format(amount.value || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{scholarship.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{scholarship.organization?.name || 'N/A'}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Status and Amount */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">Amount</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatAmount(scholarship.amount)}</p>
              <p className="text-xs text-gray-500 mt-1 capitalize">{scholarship.amount?.type || 'One-time'}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">Deadline</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{formatDate(scholarship.deadlines?.application)}</p>
              <p className="text-xs text-gray-500 mt-1">Application Deadline</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">Status</span>
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(scholarship.status)}`}>
                {scholarship.status}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Description
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{scholarship.description || 'No description provided.'}</p>
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Eligibility Criteria
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {scholarship.eligibility?.criteria && scholarship.eligibility.criteria.length > 0 ? (
                <ul className="space-y-2">
                  {scholarship.eligibility.criteria.map((criterion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{criterion}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No eligibility criteria specified.</p>
              )}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Required Documents
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {scholarship.requirements?.documents && scholarship.requirements.documents.length > 0 ? (
                <ul className="space-y-2">
                  {scholarship.requirements.documents.map((doc, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{doc}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No document requirements specified.</p>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Academic Requirements */}
            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Academic Requirements</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Min GPA:</span>
                  <span className="font-medium text-gray-900">
                    {scholarship.eligibility?.minimumGPA || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Education Level:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {scholarship.educationLevel?.join(', ') || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Deadlines */}
            <div className="border border-gray-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Important Dates</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Application:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(scholarship.deadlines?.application)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Decision:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(scholarship.deadlines?.decision)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Acceptance:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(scholarship.deadlines?.acceptance)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {scholarship.contactInfo && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Building className="h-5 w-5" />
                Contact Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {scholarship.contactInfo.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium text-gray-900 mt-1">
                      {scholarship.contactInfo.phone || 'N/A'}
                    </p>
                  </div>
                  {scholarship.contactInfo.website && (
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Website:</span>
                      <p className="font-medium text-blue-600 mt-1">
                        <a href={scholarship.contactInfo.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {scholarship.contactInfo.website}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(scholarship);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit Scholarship
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipViewModal;
