import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  IndianRupee, 
  FileText, 
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Send
} from 'lucide-react';
import apiService from '../../services/api';
import { toast } from 'react-hot-toast';

const ApplicationDetailModal = ({ application, isOpen, onClose, onStatusUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewAction, setReviewAction] = useState(''); // 'approve' or 'reject'

  useEffect(() => {
    if (application) {
      setReviewNotes(application.reviewNotes || '');
      setShowReviewForm(false);
      setReviewAction('');
    }
  }, [application]);

  const handleReview = async (status) => {
    if (!reviewNotes.trim() && status === 'rejected') {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    try {
      const reviewData = {
        status,
        reviewNotes: reviewNotes.trim(),
      };

      await apiService.reviewApplication(application._id, reviewData);
      
      toast.success(
        status === 'approved' 
          ? '✅ Application approved! Email sent to candidate.' 
          : '❌ Application rejected. Email sent to candidate.'
      );
      
      // Call parent callback to refresh data
      if (onStatusUpdate) {
        onStatusUpdate();
      }
      
      onClose();
    } catch (error) {
      console.error('Error reviewing application:', error);
      toast.error('Failed to review application');
    } finally {
      setLoading(false);
    }
  };

  const openReviewForm = (action) => {
    setReviewAction(action);
    setShowReviewForm(true);
  };

  const cancelReview = () => {
    setShowReviewForm(false);
    setReviewAction('');
    setReviewNotes(application?.reviewNotes || '');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'under_review':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'submitted':
        return <Send className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen || !application) return null;

  const canReview = ['submitted', 'under_review'].includes(application.status);
  const isReviewed = ['approved', 'rejected'].includes(application.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
            <p className="text-gray-600 mt-1">
              {application.scholarship?.title} - {application.applicant?.name || 'N/A'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Application Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Application Status</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(application.status)}`}>
                    {getStatusIcon(application.status)}
                    {application.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Submitted:</span>
                    <span className="ml-2 text-gray-900">
                      {application.submissionDate ? new Date(application.submissionDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Updated:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(application.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Full Name:</span>
                    <span className="ml-2 text-gray-900">{application.personalInfo?.fullName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-2 text-gray-900">{application.personalInfo?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Phone:</span>
                    <span className="ml-2 text-gray-900">{application.personalInfo?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500">Address:</span>
                    <span className="ml-2 text-gray-900">
                      {application.personalInfo?.address 
                        ? `${application.personalInfo.address.street || ''}, ${application.personalInfo.address.city || ''}, ${application.personalInfo.address.state || ''} ${application.personalInfo.address.zipCode || ''}, ${application.personalInfo.address.country || ''}`.replace(/,\s*,/g, ',').trim()
                        : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Date of Birth:</span>
                    <span className="ml-2 text-gray-900">
                      {application.personalInfo?.dateOfBirth ? new Date(application.personalInfo.dateOfBirth).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Citizenship:</span>
                    <span className="ml-2 text-gray-900">{application.personalInfo?.citizenship || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Current School:</span>
                    <span className="ml-2 text-gray-900">{application.academicInfo?.currentSchool || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">GPA:</span>
                    <span className="ml-2 text-gray-900">{application.academicInfo?.gpa || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Major:</span>
                    <span className="ml-2 text-gray-900">{application.academicInfo?.major || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Graduation Year:</span>
                    <span className="ml-2 text-gray-900">{application.academicInfo?.graduationYear || 'N/A'}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-500">Academic Achievements:</span>
                    <p className="mt-1 text-gray-900">{application.academicInfo?.achievements || 'None listed'}</p>
                  </div>
                </div>
              </div>

              {/* Family & Financial Information */}
              {application.familyFinancialInfo && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-yellow-600" />
                    Family & Financial Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Family Income:</span>
                      <span className="ml-2 text-gray-900">{application.familyFinancialInfo.annualIncome || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Household Size:</span>
                      <span className="ml-2 text-gray-900">{application.familyFinancialInfo.householdSize || 'N/A'}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-500">Financial Circumstances:</span>
                      <p className="mt-1 text-gray-900">{application.familyFinancialInfo.financialCircumstances || 'None listed'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents */}
              {application.documents && Object.keys(application.documents).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Documents
                  </h3>
                  <div className="space-y-3">
                    {(() => {
                      // Collect all valid documents
                      const allDocuments = [];
                      
                      Object.entries(application.documents).forEach(([key, doc]) => {
                        // Skip if the field is empty or undefined
                        if (!doc) return;
                        
                        // Handle both array and single document formats
                        if (Array.isArray(doc)) {
                          // It's an array of documents
                          doc.forEach((document, index) => {
                            if (document && document.url) {
                              allDocuments.push({ key, document, index, total: doc.length });
                            }
                          });
                        } else if (doc && typeof doc === 'object' && doc.url) {
                          // It's a single document object
                          allDocuments.push({ key, document: doc, index: 0, total: 1 });
                        }
                      });
                      
                      if (allDocuments.length === 0) {
                        return (
                          <div className="text-center py-8 text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p className="font-medium">No documents uploaded</p>
                            <p className="text-sm mt-1">This application has no attached documents</p>
                          </div>
                        );
                      }
                      
                      return allDocuments.map(({ key, document, index, total }) => {
                        // Construct proper URL
                        let fileUrl = document.url;
                        
                        // If URL doesn't start with http, construct it
                        if (!fileUrl.startsWith('http')) {
                          // Get base URL - VITE_API_URL includes /api, so we need to remove it
                          const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
                          const baseUrl = apiBaseUrl.replace(/\/api$/, ''); // Remove trailing /api
                          
                          // Normalize the file URL - convert /api/uploads to /uploads
                          if (fileUrl.startsWith('/api/uploads')) {
                            fileUrl = fileUrl.replace('/api/uploads', '/uploads');
                          } else if (!fileUrl.startsWith('/uploads')) {
                            // If it doesn't start with /uploads, add it
                            fileUrl = fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl;
                            if (!fileUrl.startsWith('/uploads')) {
                              fileUrl = '/uploads' + fileUrl;
                            }
                          }
                          
                          // Fix for old uploads: if URL points to application-document but file is in documents
                          // This handles the bug where files were stored in /documents but URL said /application-document
                          if (fileUrl.includes('/application-document/')) {
                            fileUrl = fileUrl.replace('/application-document/', '/documents/');
                          }
                          
                          // Construct full URL
                          fileUrl = `${baseUrl}${fileUrl}`;
                        }
                        
                        console.log('Document URL:', {
                          original: document.url,
                          constructed: fileUrl
                        });
                        
                        // Format the document label
                        const docLabel = key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, str => str.toUpperCase())
                          .trim();
                        
                        return (
                          <div key={`${key}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {docLabel}
                                  {total > 1 ? ` (${index + 1} of ${total})` : ''}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {document.filename || document.originalName || 'Document'}
                                </p>
                              </div>
                            </div>
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                            >
                              <Download className="h-4 w-4" />
                              View
                            </a>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* Essays */}
              {application.essays && application.essays.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Essays & Personal Statement</h3>
                  <div className="space-y-4">
                    {application.essays.map((essay, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{essay.question}</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{essay.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Actions */}
            <div className="space-y-6">
              {/* Scholarship Info */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Scholarship Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">Title:</span>
                    <p className="font-medium text-gray-900">{application.scholarship?.title || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <p className="font-medium text-gray-900">
                      {application.scholarship?.amount?.value 
                        ? `₹${application.scholarship.amount.value.toLocaleString()}` 
                        : application.scholarship?.amount 
                          ? `₹${application.scholarship.amount.toLocaleString()}` 
                          : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Organization:</span>
                    <p className="font-medium text-gray-900">{application.scholarship?.organization?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Deadline:</span>
                    <p className="font-medium text-gray-900">
                      {application.scholarship?.deadlines?.application 
                        ? new Date(application.scholarship.deadlines.application).toLocaleDateString()
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Section */}
              {!showReviewForm && canReview && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Application</h3>
                  <p className="text-gray-600 mb-4">
                    Review this application and take action. The candidate will receive an email notification about your decision.
                  </p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => openReviewForm('approve')}
                      className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <ThumbsUp className="h-5 w-5" />
                      Approve Application
                    </button>
                    <button
                      onClick={() => openReviewForm('reject')}
                      className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <ThumbsDown className="h-5 w-5" />
                      Reject Application
                    </button>
                  </div>
                </div>
              )}

              {/* Review Form (shown when approve/reject clicked) */}
              {showReviewForm && (
                <div className="bg-white border-2 border-blue-500 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {reviewAction === 'approve' ? '✅ Approve Application' : '❌ Reject Application'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {reviewAction === 'approve' 
                      ? 'Add any notes or comments for this approval. The candidate will receive a congratulatory email.'
                      : 'Please provide a reason for rejection. This will help the candidate understand the decision.'}
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {reviewAction === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason (Required) *'}
                      </label>
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder={reviewAction === 'approve' 
                          ? 'Add any congratulatory message or next steps...'
                          : 'Please provide a clear reason for rejection...'}
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required={reviewAction === 'reject'}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReview(reviewAction === 'approve' ? 'approved' : 'rejected')}
                        disabled={loading}
                        className={`flex-1 ${reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2`}
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Send className="h-5 w-5" />
                            Confirm {reviewAction === 'approve' ? 'Approval' : 'Rejection'} & Send Email
                          </>
                        )}
                      </button>
                      <button
                        onClick={cancelReview}
                        disabled={loading}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Already Reviewed Status */}
              {isReviewed && (
                <div className={`rounded-lg p-4 ${application.status === 'approved' ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                  <div className="flex items-start gap-3">
                    {application.status === 'approved' ? (
                      <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-2 ${application.status === 'approved' ? 'text-green-900' : 'text-red-900'}`}>
                        Application {application.status === 'approved' ? 'Approved' : 'Rejected'}
                      </h3>
                      <p className={`text-sm mb-2 ${application.status === 'approved' ? 'text-green-700' : 'text-red-700'}`}>
                        Reviewed on: {application.reviewDate ? new Date(application.reviewDate).toLocaleDateString() : 'N/A'}
                      </p>
                      {application.reviewNotes && (
                        <div className={`mt-3 p-3 rounded ${application.status === 'approved' ? 'bg-green-100' : 'bg-red-100'}`}>
                          <p className="text-sm font-medium mb-1">Review Notes:</p>
                          <p className="text-sm">{application.reviewNotes}</p>
                        </div>
                      )}
                      <p className="text-sm mt-3 italic opacity-75">
                        ✉️ Email notification has been sent to the candidate.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailModal;