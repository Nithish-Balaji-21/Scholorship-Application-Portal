import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  Heart, 
  Upload,
  User,
  Settings,
  TrendingUp,
  Bell,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import apiService from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [applications, setApplications] = useState([]);
  const [savedScholarships, setSavedScholarships] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    savedScholarships: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [applicationsRes, savedRes, scholarshipsRes] = await Promise.all([
        apiService.getMyApplications(),
        apiService.getSavedScholarships(),
        apiService.getScholarships({ limit: 100 }) // Get all for deadline tracking
      ]);

      if (applicationsRes.success) {
        setApplications(applicationsRes.data);
        
        // Calculate stats
        const apps = applicationsRes.data;
        setStats({
          totalApplications: apps.length,
          pendingApplications: apps.filter(app => app.status === 'pending' || app.status === 'submitted').length,
          approvedApplications: apps.filter(app => app.status === 'approved').length,
          savedScholarships: savedRes.success ? savedRes.data.length : 0
        });
      }

      if (savedRes.success) {
        setSavedScholarships(savedRes.data);
      }

      if (scholarshipsRes.success) {
        // Filter for upcoming deadlines (next 30 days)
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        const upcomingDeadlines = scholarshipsRes.data
          .filter(scholarship => {
            const deadline = new Date(scholarship.deadlines.application);
            return deadline > now && deadline <= thirtyDaysFromNow;
          })
          .map(scholarship => ({
            ...scholarship,
            daysUntilDeadline: Math.ceil((new Date(scholarship.deadlines.application) - now) / (1000 * 60 * 60 * 24))
          }))
          .sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline);
        
        setDeadlines(upcomingDeadlines);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: amount.currency || 'INR'
    }).format(amount.value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Track your scholarship applications and discover new opportunities
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Applications</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Approved</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.approvedApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Saved</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.savedScholarships}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Overview', icon: TrendingUp },
                { id: 'applications', name: 'My Applications', icon: FileText },
                { id: 'saved', name: 'Saved Scholarships', icon: Heart },
                { id: 'deadlines', name: 'Upcoming Deadlines', icon: Calendar },
                { id: 'profile', name: 'Profile', icon: User }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/scholarships')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <Search className="h-6 w-6 text-blue-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Find Scholarships</h3>
                  <p className="text-sm text-gray-600">Discover new scholarship opportunities</p>
                </button>

                <button
                  onClick={() => setActiveTab('applications')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <FileText className="h-6 w-6 text-green-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Track Applications</h3>
                  <p className="text-sm text-gray-600">Monitor your application status</p>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <Settings className="h-6 w-6 text-purple-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Update Profile</h3>
                  <p className="text-sm text-gray-600">Keep your information current</p>
                </button>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Applications */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Applications</h3>
                  <div className="space-y-3">
                    {applications.slice(0, 3).map((application) => (
                      <div key={application._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{application.scholarship.title}</h4>
                          <p className="text-sm text-gray-600">Applied {formatDate(application.createdAt)}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                      </div>
                    ))}
                    {applications.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No applications yet</p>
                    )}
                  </div>
                </div>

                {/* Upcoming Deadlines */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Deadlines</h3>
                  <div className="space-y-3">
                    {deadlines.slice(0, 3).map((scholarship) => (
                      <div key={scholarship._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{scholarship.title}</h4>
                          <p className="text-sm text-gray-600">{formatDate(scholarship.deadlines.application)}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-medium ${
                            scholarship.daysUntilDeadline <= 7 ? 'text-red-600' : 'text-orange-600'
                          }`}>
                            {scholarship.daysUntilDeadline} days
                          </span>
                        </div>
                      </div>
                    ))}
                    {deadlines.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">My Applications</h2>
                <button
                  onClick={() => navigate('/scholarships')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Apply to More
                </button>
              </div>

              <div className="space-y-4">
                {applications.map((application) => (
                  <div key={application._id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{application.scholarship.title}</h3>
                        <p className="text-gray-600">{application.scholarship.organization?.name}</p>
                        <p className="text-sm text-gray-500 mt-1">Applied on {formatDate(application.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                        <p className="text-sm text-gray-600 mt-2">
                          {formatAmount(application.scholarship.amount)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Deadline: {formatDate(application.scholarship.deadlines.application)}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/scholarships/${application.scholarship._id}`)}
                          className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                        {application.status === 'draft' && (
                          <button
                            onClick={() => navigate(`/scholarships/${application.scholarship._id}/apply`)}
                            className="text-green-600 hover:text-green-700 flex items-center gap-1"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {applications.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                    <p className="text-gray-600 mb-6">Start applying to scholarships to track your progress here</p>
                    <button
                      onClick={() => navigate('/scholarships')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                      Browse Scholarships
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Saved Scholarships</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedScholarships.map((scholarship) => (
                  <div key={scholarship._id} className="border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{scholarship.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{scholarship.organization?.name}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">{formatAmount(scholarship.amount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Deadline:</span>
                        <span className="font-medium">{formatDate(scholarship.deadlines.application)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/scholarships/${scholarship._id}`)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => navigate(`/scholarships/${scholarship._id}/apply`)}
                        className="flex-1 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 text-sm"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ))}

                {savedScholarships.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No saved scholarships</h3>
                    <p className="text-gray-600 mb-6">Save scholarships you're interested in to keep track of them</p>
                    <button
                      onClick={() => navigate('/scholarships')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                      Browse Scholarships
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'deadlines' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Deadlines</h2>
              <p className="text-gray-600">Scholarships with application deadlines in the next 30 days</p>

              <div className="space-y-4">
                {deadlines.map((scholarship) => (
                  <div key={scholarship._id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{scholarship.title}</h3>
                        <p className="text-gray-600">{scholarship.organization?.name}</p>
                        <p className="text-sm text-gray-500 mt-1">{formatAmount(scholarship.amount)}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          scholarship.daysUntilDeadline <= 7 ? 'text-red-600' : 'text-orange-600'
                        }`}>
                          {scholarship.daysUntilDeadline} days left
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatDate(scholarship.deadlines.application)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => navigate(`/scholarships/${scholarship._id}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => navigate(`/scholarships/${scholarship._id}/apply`)}
                        className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}

                {deadlines.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming deadlines</h3>
                    <p className="text-gray-600">Check back later for new scholarship opportunities</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <Bell className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Profile Management Coming Soon</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Full profile editing, document management, and notification preferences will be available soon.
                      For now, your basic profile information is displayed below.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Name</label>
                      <p className="text-gray-900">{user?.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Role</label>
                      <p className="text-gray-900 capitalize">{user?.role}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Statistics</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Member Since</label>
                      <p className="text-gray-900">{formatDate(user?.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Total Applications</label>
                      <p className="text-gray-900">{stats.totalApplications}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Saved Scholarships</label>
                      <p className="text-gray-900">{stats.savedScholarships}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;