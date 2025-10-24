import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, IndianRupee, Users, Clock, BookOpen, FileText, Heart, Share2, AlertCircle, CheckCircle, User, Building } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import apiService from '../services/api';

const ScholarshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    console.log('ScholarshipDetail component mounted with ID:', id);
    fetchScholarshipDetail();
  }, [id]);

  const fetchScholarshipDetail = async () => {
    console.log('Fetching scholarship details for ID:', id);
    try {
      setLoading(true);
      const response = await apiService.getScholarshipById(id);
      console.log('API Response:', response);
      console.log('Response structure:', {
        hasSuccess: 'success' in response,
        successValue: response.success,
        hasData: 'data' in response,
        responseKeys: Object.keys(response)
      });
      
      // Handle both response formats
      let scholarshipData = null;
      if (response.success && response.data) {
        // Standard API response format
        scholarshipData = response.data;
      } else if (response._id) {
        // Direct scholarship object format
        scholarshipData = response;
      }
      
      if (scholarshipData) {
        console.log('Setting scholarship data:', scholarshipData);
        setScholarship(scholarshipData);
        // Check if user has saved this scholarship
        if (isAuthenticated) {
          checkIfSaved();
          checkIfApplied();
        }
      } else {
        console.log('No scholarship data found in response');
        setError('Scholarship not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to load scholarship details');
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      const response = await apiService.getSavedScholarships();
      if (response.success) {
        const savedScholarships = response.data;
        setIsSaved(savedScholarships.some(saved => saved._id === id));
      }
    } catch (err) {
      console.error('Error checking saved status:', err);
    }
  };

  const checkIfApplied = async () => {
    try {
      const response = await apiService.getMyApplications();
      if (response.success) {
        const applications = response.data;
        setHasApplied(applications.some(app => app.scholarship._id === id));
      }
    } catch (err) {
      console.error('Error checking application status:', err);
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isSaved) {
        await apiService.unsaveScholarship(id);
        setIsSaved(false);
      } else {
        await apiService.saveScholarship(id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error saving scholarship:', err);
    }
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate(`/scholarships/${id}/apply`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: scholarship.title,
          text: scholarship.shortDescription || scholarship.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: amount.currency || 'INR'
    });
    return formatter.format(amount.value);
  };

  const getTimeRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate - now;
    
    if (timeDiff <= 0) return 'Expired';
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    if (days > 30) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? 's' : ''} remaining`;
    }
    return `${days} day${days > 1 ? 's' : ''} remaining`;
  };

  if (loading) {
    console.log('Component state: loading');
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
              <div className="bg-white rounded-lg p-8">
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('Component state: error -', error);
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-8 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => navigate('/scholarships')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Back to Scholarships
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!scholarship) {
    console.log('Component state: no scholarship data yet');
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
              <div className="bg-white rounded-lg p-8">
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('Component state: rendering scholarship -', scholarship.title);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-white">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{scholarship.title}</h1>
                  <div className="flex items-center text-blue-100 mb-4">
                    <Building className="h-5 w-5 mr-2" />
                    <span className="text-lg">{scholarship.organization?.name}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className={`p-3 rounded-full transition-colors ${
                      isSaved 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <Heart className={`h-6 w-6 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    <Share2 className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold">{formatAmount(scholarship.amount)}</div>
                  <div className="text-sm text-blue-100">Award Amount</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <Calendar className="h-6 w-6 mb-2" />
                  <div className="text-lg font-semibold">{formatDate(scholarship.deadlines.application)}</div>
                  <div className="text-sm text-blue-100">Application Deadline</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <Clock className="h-6 w-6 mb-2" />
                  <div className="text-lg font-semibold">{getTimeRemaining(scholarship.deadlines.application)}</div>
                  <div className="text-sm text-blue-100">Time Remaining</div>
                </div>
              </div>

              <div className="flex gap-4">
                {hasApplied ? (
                  <button
                    disabled
                    className="bg-green-500 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 cursor-not-allowed"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Applied
                  </button>
                ) : scholarship.maxApplications && scholarship.applicationCount >= scholarship.maxApplications ? (
                  <button
                    disabled
                    className="bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 cursor-not-allowed"
                  >
                    <AlertCircle className="h-5 w-5" />
                    Applications Full
                  </button>
                ) : (
                  <button
                    onClick={handleApply}
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Apply Now
                  </button>
                )}
                <button
                  onClick={() => navigate('/scholarships')}
                  className="border border-white/30 text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Back to Search
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Scholarship</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">{scholarship.description}</p>
                </div>
              </div>

              {/* Eligibility Requirements */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  Eligibility Requirements
                </h2>
                <div className="space-y-4">
                  {scholarship.eligibility?.education?.levels?.length > 0 ? (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Education Level</h3>
                      <div className="flex flex-wrap gap-2">
                        {scholarship.eligibility.education.levels.map((level, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm capitalize">
                            {level.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  
                  {scholarship.eligibility?.education?.minGPA && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Minimum GPA</h3>
                      <p className="text-gray-700">{scholarship.eligibility.education.minGPA}</p>
                    </div>
                  )}
                  
                  {scholarship.eligibility?.education?.fieldsOfStudy?.length > 0 ? (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Fields of Study</h3>
                      <div className="flex flex-wrap gap-2">
                        {scholarship.eligibility.education.fieldsOfStudy.map((field, index) => (
                          <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {scholarship.eligibility?.demographics?.nationality?.length > 0 ? (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Nationality Requirements</h3>
                      <div className="flex flex-wrap gap-2">
                        {scholarship.eligibility.demographics.nationality.map((country, index) => (
                          <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                            {country}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {scholarship.eligibility?.other?.length > 0 ? (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Additional Requirements</h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {scholarship.eligibility.other.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  
                  {/* Show message if no eligibility criteria */}
                  {!scholarship.eligibility?.education?.levels?.length &&
                   !scholarship.eligibility?.education?.minGPA &&
                   !scholarship.eligibility?.education?.fieldsOfStudy?.length &&
                   !scholarship.eligibility?.demographics?.nationality?.length &&
                   !scholarship.eligibility?.other?.length && (
                    <p className="text-gray-500 italic">No specific eligibility requirements specified. Please check with the organization for details.</p>
                  )}
                </div>
              </div>

              {/* Application Requirements */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-orange-500" />
                  Application Requirements
                </h2>
                <div className="space-y-4">
                  {scholarship.requirements?.documents?.length > 0 ? (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Required Documents</h3>
                      <div className="space-y-2">
                        {scholarship.requirements.documents.map((doc, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <div className="font-medium text-gray-900">{doc.name}</div>
                              {doc.description && (
                                <div className="text-sm text-gray-600 mt-1">{doc.description}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {scholarship.requirements?.essays?.length > 0 ? (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Essay Requirements</h3>
                      <div className="space-y-2">
                        {scholarship.requirements.essays.map((essay, index) => (
                          <div key={index} className="p-3 bg-blue-50 rounded-lg">
                            <div className="font-medium text-gray-900">{essay.topic}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              Word limit: {essay.wordLimit || 'Not specified'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {scholarship.requirements?.recommendations?.count > 0 ? (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Letters of Recommendation</h3>
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <div className="font-medium text-gray-900">
                          {scholarship.requirements.recommendations.count} letter(s) required
                        </div>
                        {scholarship.requirements.recommendations.types?.length > 0 && (
                          <div className="text-sm text-gray-600 mt-1">
                            Types: {scholarship.requirements.recommendations.types.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                  
                  {/* Show message if no requirements */}
                  {!scholarship.requirements?.documents?.length &&
                   !scholarship.requirements?.essays?.length &&
                   (!scholarship.requirements?.recommendations?.count || scholarship.requirements.recommendations.count === 0) && (
                    <p className="text-gray-500 italic">No specific application requirements listed. Please check with the organization for details.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">{formatAmount(scholarship.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold capitalize">
                      {scholarship.amount.type?.replace('-', ' ') || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Renewable:</span>
                    <span className="font-semibold">{scholarship.isRecurring ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Applications:</span>
                    <span className={`font-semibold ${
                      scholarship.maxApplications && scholarship.applicationCount >= scholarship.maxApplications 
                        ? 'text-red-600' 
                        : scholarship.applicationCount / (scholarship.maxApplications || 999) > 0.8 
                        ? 'text-orange-600' 
                        : 'text-green-600'
                    }`}>
                      {scholarship.applicationCount || 0} / {scholarship.maxApplications || 'Unlimited'}
                      {scholarship.maxApplications && scholarship.applicationCount >= scholarship.maxApplications && ' (Full)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Categories & Tags */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories & Tags</h3>
                <div className="space-y-3">
                  {scholarship.categories?.length > 0 ? (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Categories</h4>
                      <div className="flex flex-wrap gap-2">
                        {scholarship.categories.map((category, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm capitalize">
                            {category.replace('-', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Categories</h4>
                      <p className="text-sm text-gray-500">No categories specified</p>
                    </div>
                  )}
                  
                  {scholarship.tags?.length > 0 ? (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {scholarship.tags.map((tag, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Tags</h4>
                      <p className="text-sm text-gray-500">No tags specified</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Organization Info */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization</h3>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <Building className="h-8 w-8 text-gray-500" />
                  </div>
                  <h4 className="font-semibold text-gray-900">{scholarship.organization?.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{scholarship.organization?.type}</p>
                  {scholarship.organization?.website && (
                    <a
                      href={scholarship.organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDetail;