import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Search,
  Filter,
  Download,
  MoreVertical
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    scholarship: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchApplications();
      fetchStats();
    }
  }, [user, filters, pagination.page]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await fetch(`/api/admin/applications?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.data);
        setPagination(prev => ({
          ...prev,
          total: data.total,
          pages: data.pages
        }));
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/applications/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleReview = async (applicationId, status, reviewNotes, awardAmount) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/applications/${applicationId}/review`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          reviewNotes,
          awardAmount: status === 'approved' ? awardAmount : undefined
        })
      });

      if (response.ok) {
        toast.success(`Application ${status} successfully`);
        fetchApplications();
        fetchStats();
        setShowReviewModal(false);
        setSelectedApplication(null);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Review failed');
      }
    } catch (error) {
      console.error('Error reviewing application:', error);
      toast.error('Failed to review application');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      submitted: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      under_review: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      waitlisted: { color: 'bg-purple-100 text-purple-800', icon: Clock }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', icon: FileText };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage scholarship applications and review submissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Submitted</p>
                <p className="text-2xl font-bold text-gray-900">{stats.submittedApplications || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(stats.completionRate || 0)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.statusBreakdown?.find(s => s._id === 'submitted')?.count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Applications</h2>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
              </div>
              
              <select
                className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="waitlisted">Waitlisted</option>
              </select>

              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          {/* Applications Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scholarship
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Loading applications...</span>
                      </div>
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  applications.map((application) => (
                    <tr key={application._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {application.personalInfo?.fullName?.[0] || application.applicant?.name?.[0] || 'A'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.personalInfo?.fullName || application.applicant?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.personalInfo?.email || application.applicant?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {application.scholarship?.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.scholarship?.organization}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(application.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {application.submissionDate 
                          ? new Date(application.submissionDate).toLocaleDateString()
                          : 'Not submitted'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${application.completionPercentage || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {application.completionPercentage || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedApplication(application);
                              setShowReviewModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} applications
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.pages}
                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedApplication && (
        <ReviewModal
          application={selectedApplication}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedApplication(null);
          }}
          onReview={handleReview}
        />
      )}
    </div>
  );
};

// Comprehensive Application Review Modal Component
const ReviewModal = ({ application, onClose, onReview }) => {
  const [reviewData, setReviewData] = useState({
    status: '',
    reviewNotes: '',
    awardAmount: ''
  });
  const [activeTab, setActiveTab] = useState('personal');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reviewData.status) {
      toast.error('Please select a status');
      return;
    }
    
    onReview(
      application._id,
      reviewData.status,
      reviewData.reviewNotes,
      reviewData.awardAmount ? parseFloat(reviewData.awardAmount) : undefined
    );
  };

  const renderDocumentViewer = (doc) => {
    if (!doc || !doc.url) return <p className="text-gray-500">No document uploaded</p>;
    
    const isImage = doc.url.match(/\.(jpg|jpeg|png|gif)$/i);
    const isPDF = doc.url.match(/\.pdf$/i);
    
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{doc.originalName || 'Document'}</span>
          <a 
            href={doc.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </a>
        </div>
        {isImage ? (
          <img src={doc.url} alt="Document" className="max-w-full h-48 object-contain border rounded" />
        ) : isPDF ? (
          <div className="flex items-center justify-center h-32 border rounded bg-white">
            <FileText className="w-8 h-8 text-red-500 mr-2" />
            <span className="text-gray-600">PDF Document</span>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 border rounded bg-white">
            <FileText className="w-8 h-8 text-gray-500 mr-2" />
            <span className="text-gray-600">Document File</span>
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: Users },
    { id: 'academic', label: 'Academic', icon: FileText },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'essay', label: 'Essay', icon: FileText },
    { id: 'review', label: 'Review', icon: CheckCircle }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Application Review</h2>
              <p className="text-sm text-gray-500 mt-1">
                {application.personalInfo?.fullName} - {application.scholarship?.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 flex-shrink-0">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                  <div className="space-y-3">
                    <div><strong>Full Name:</strong> {application.personalInfo?.fullName || 'N/A'}</div>
                    <div><strong>Email:</strong> {application.personalInfo?.email || 'N/A'}</div>
                    <div><strong>Phone:</strong> {application.personalInfo?.phone || 'N/A'}</div>
                    <div><strong>Date of Birth:</strong> {application.personalInfo?.dateOfBirth ? new Date(application.personalInfo.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
                    <div><strong>Gender:</strong> {application.personalInfo?.gender || 'N/A'}</div>
                    <div><strong>Nationality:</strong> {application.personalInfo?.nationality || 'N/A'}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
                  <div className="space-y-3">
                    <div><strong>Street:</strong> {application.personalInfo?.address?.street || 'N/A'}</div>
                    <div><strong>City:</strong> {application.personalInfo?.address?.city || 'N/A'}</div>
                    <div><strong>State:</strong> {application.personalInfo?.address?.state || 'N/A'}</div>
                    <div><strong>ZIP Code:</strong> {application.personalInfo?.address?.zipCode || 'N/A'}</div>
                    <div><strong>Country:</strong> {application.personalInfo?.address?.country || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Academic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div><strong>Institution:</strong> {application.academicInfo?.currentInstitution || 'N/A'}</div>
                  <div><strong>Program:</strong> {application.academicInfo?.program || 'N/A'}</div>
                  <div><strong>Year of Study:</strong> {application.academicInfo?.yearOfStudy || 'N/A'}</div>
                  <div><strong>GPA:</strong> {application.academicInfo?.gpa || 'N/A'}</div>
                  <div><strong>Expected Graduation:</strong> {application.academicInfo?.expectedGraduation || 'N/A'}</div>
                </div>
                <div className="space-y-3">
                  <div><strong>Previous Institution:</strong> {application.academicInfo?.previousInstitution || 'N/A'}</div>
                  <div><strong>Field of Study:</strong> {application.academicInfo?.fieldOfStudy || 'N/A'}</div>
                  <div><strong>Academic Achievements:</strong></div>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {application.academicInfo?.achievements || 'No achievements listed'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Uploaded Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Academic Transcript</h4>
                  {renderDocumentViewer(application.documents?.transcript)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Recommendation Letter</h4>
                  {renderDocumentViewer(application.documents?.recommendationLetter)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">ID Proof</h4>
                  {renderDocumentViewer(application.documents?.idProof)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Additional Documents</h4>
                  {application.documents?.additional && application.documents.additional.length > 0 ? (
                    <div className="space-y-2">
                      {application.documents.additional.map((doc, index) => (
                        <div key={index}>
                          {renderDocumentViewer(doc)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No additional documents</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'essay' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Essay Responses</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Personal Statement</h4>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm">
                    {application.essayResponses?.personalStatement || 'No personal statement provided'}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Career Goals</h4>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm">
                    {application.essayResponses?.careerGoals || 'No career goals provided'}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Why This Scholarship</h4>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm">
                    {application.essayResponses?.whyDeserve || 'No response provided'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'review' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Review & Decision</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Decision *
                    </label>
                    <select
                      value={reviewData.status}
                      onChange={(e) => setReviewData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                      <option value="waitlisted">Waitlist</option>
                    </select>
                  </div>

                  {reviewData.status === 'approved' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Award Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={reviewData.awardAmount}
                        onChange={(e) => setReviewData(prev => ({ ...prev, awardAmount: e.target.value }))}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter award amount"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Notes
                  </label>
                  <textarea
                    value={reviewData.reviewNotes}
                    onChange={(e) => setReviewData(prev => ({ ...prev, reviewNotes: e.target.value }))}
                    rows={6}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add detailed feedback for the applicant..."
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        This decision will be final and an email notification will be sent to the applicant automatically.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;