import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Eye, 
  Search,
  BarChart3,
  BookOpen,
  Building,
  TrendingUp,
  Plus,
  Download,
  Edit,
  Trash2,
  Mail,
  Phone
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import apiService from '../services/api';
import ApplicationDetailModal from '../components/admin/ApplicationDetailModal';
import ScholarshipViewModal from '../components/admin/ScholarshipViewModal';
import ScholarshipEditModal from '../components/admin/ScholarshipEditModal';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalScholarships: 0,
    totalApplications: 0,
    totalOrganizations: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    activeScholarships: 0,
  });
  
  const [applications, setApplications] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  
  // Modal state
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Scholarship modal states
  const [selectedScholarship, setSelectedScholarship] = useState(null);
  const [isScholarshipViewOpen, setIsScholarshipViewOpen] = useState(false);
  const [isScholarshipEditOpen, setIsScholarshipEditOpen] = useState(false);
  const [scholarshipUpdateKey, setScholarshipUpdateKey] = useState(0); // Force re-render key
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    fetchAdminData();

    // Set up auto-refresh for real-time data (every 30 seconds)
    const refreshInterval = setInterval(() => {
      fetchAdminData();
    }, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval);
  }, [user, navigate]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch all admin data in parallel using proper admin endpoints
      const [
        dashboardStatsRes,
        applicationsRes,
        usersRes,
        scholarshipsRes,
        organizationsRes
      ] = await Promise.all([
        apiService.getAdminDashboardStats(),          // Admin-specific stats endpoint
        apiService.getAllApplicationsAdmin(),         // Get all applications (admin view)
        apiService.getAllUsers(),                     // Get all users
        apiService.getAllScholarshipsAdmin(),         // Get all scholarships (admin view)
        apiService.getAllOrganizationsAdmin()         // Get all organizations (admin view)
      ]);

      // Set dashboard stats from backend
      if (dashboardStatsRes && dashboardStatsRes.success) {
        setDashboardStats(dashboardStatsRes.data);
      }

      // Set applications data
      if (applicationsRes && applicationsRes.success) {
        const applicationsData = applicationsRes.data?.data || applicationsRes.data || [];
        setApplications(Array.isArray(applicationsData) ? applicationsData : []);
      }

      // Set users data
      if (usersRes && usersRes.success) {
        const usersData = usersRes.data?.data || usersRes.data || [];
        setUsers(Array.isArray(usersData) ? usersData : []);
      }

      // Set scholarships data
      if (scholarshipsRes && scholarshipsRes.success) {
        const scholarshipsData = scholarshipsRes.data?.data || scholarshipsRes.data || [];
        setScholarships(Array.isArray(scholarshipsData) ? scholarshipsData : []);
      }

      // Set organizations data
      if (organizationsRes && organizationsRes.success) {
        const organizationsData = organizationsRes.data?.data || organizationsRes.data || [];
        setOrganizations(Array.isArray(organizationsData) ? organizationsData : []);
      }

    } catch (error) {
      console.error('Error fetching admin data:', error);
      // Set empty arrays to prevent crashes
      setApplications([]);
      setUsers([]);
      setScholarships([]);
      setOrganizations([]);
      setDashboardStats({
        totalUsers: 0,
        totalScholarships: 0,
        totalApplications: 0,
        totalOrganizations: 0,
        pendingApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        activeScholarships: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDashboardStats = (scholarships, applications, users, organizations) => {
    setDashboardStats({
      totalUsers: users.length,
      totalScholarships: scholarships.length,
      totalApplications: applications.length,
      totalOrganizations: organizations.length,
      pendingApplications: applications.filter(app => app.status === 'pending' || app.status === 'submitted').length,
      approvedApplications: applications.filter(app => app.status === 'approved').length,
      rejectedApplications: applications.filter(app => app.status === 'rejected').length,
      activeScholarships: scholarships.filter(s => s.status === 'active' && new Date(s.deadlines.application) > new Date()).length
    });
  };

  const handleStatusUpdate = async (applicationId, newStatus, adminNotes = '') => {
    try {
      setLoading(true);
      
      const response = await apiService.updateApplicationStatus(applicationId, newStatus, adminNotes);

      if (response.success) {
        // Update the applications list
        setApplications(apps => 
          apps.map(app => 
            app._id === applicationId 
              ? { ...app, status: newStatus, adminNotes, updatedAt: new Date().toISOString() }
              : app
          )
        );
        
        // Recalculate stats
        const updatedApplications = applications.map(app => 
          app._id === applicationId ? { ...app, status: newStatus } : app
        );
        
        // Update dashboard stats
        const newStats = {
          ...dashboardStats,
          pendingApplications: updatedApplications.filter(app => 
            app.status === 'pending' || app.status === 'submitted'
          ).length,
          approvedApplications: updatedApplications.filter(app => 
            app.status === 'approved'
          ).length,
          rejectedApplications: updatedApplications.filter(app => 
            app.status === 'rejected'
          ).length
        };
        setDashboardStats(newStats);

        // Show success message
        alert(`Application ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully! Student will receive email notification.`);
        
        // Refresh data to get latest
        fetchAdminData();
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Error updating application status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScholarship = async (scholarshipId) => {
    if (!window.confirm('Are you sure you want to delete this scholarship? This action cannot be undone.')) {
      return;
    }

    const loadingToast = toast.loading('Deleting scholarship...');
    
    try {
      const response = await apiService.deleteScholarship(scholarshipId);
      
      if (response.success) {
        setScholarships(schols => schols.filter(s => s._id !== scholarshipId));
        // Recalculate stats
        const updatedScholarships = scholarships.filter(s => s._id !== scholarshipId);
        calculateDashboardStats(updatedScholarships, applications, users, organizations);
        toast.success('Scholarship deleted successfully!', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error deleting scholarship:', error);
      toast.error('Failed to delete scholarship. Please try again.', { id: loadingToast });
    }
  };

  const handleViewApplication = async (application) => {
    try {
      // Fetch full application details with all populated fields
      const response = await apiService.getApplicationByIdAdmin(application._id);
      setSelectedApplication(response.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching application details:', error);
      toast.error('Failed to load application details');
      // Fallback to the basic application data
      setSelectedApplication(application);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  const handleApplicationStatusUpdate = async () => {
    // Refresh all admin data after status update
    await fetchAdminData();
  };

  // Scholarship modal handlers
  const handleViewScholarship = (scholarship) => {
    setSelectedScholarship(scholarship);
    setIsScholarshipViewOpen(true);
  };

  const handleEditScholarship = (scholarship) => {
    setSelectedScholarship(scholarship);
    setIsScholarshipEditOpen(true);
  };

  const handleSaveScholarship = async (scholarshipId, updatedData) => {
    try {
      console.log('🔵 Starting save:', scholarshipId);
      console.log('🔵 Current scholarships count:', scholarships.length);
      
      const response = await apiService.updateScholarship(scholarshipId, updatedData);
      
      console.log('🟢 Response received:', response.success);
      console.log('🟢 Updated scholarship:', response.data);
      
      if (response.success) {
        // Use the updated scholarship from the response (has all fields from backend)
        const updatedScholarship = response.data;
        
        console.log('🟡 Updating scholarships array...');
        
        // Update local state immediately for instant UI update
        setScholarships(prevScholarships => {
          const updated = prevScholarships.map(s => {
            if (s._id === scholarshipId) {
              console.log('✅ Found and updating scholarship:', s.title, '→', updatedScholarship.title);
              return updatedScholarship;
            }
            return s;
          });
          console.log('🟡 Updated array length:', updated.length);
          return updated;
        });
        
        // Update selected scholarship so view modal shows new data if reopened
        setSelectedScholarship(updatedScholarship);
        console.log('✅ Selected scholarship updated');
        
        // Force modal re-render with updated data
        setScholarshipUpdateKey(prev => prev + 1);
        
        // Recalculate stats with updated data
        const updatedScholarshipsList = scholarships.map(s => 
          s._id === scholarshipId ? updatedScholarship : s
        );
        calculateDashboardStats(updatedScholarshipsList, applications, users, organizations);
        console.log('✅ Stats recalculated');
        
        return response;
      }
    } catch (error) {
      console.error('❌ Error updating scholarship:', error);
      throw error;
    }
  };

  const handleCloseScholarshipModals = () => {
    setIsScholarshipViewOpen(false);
    setIsScholarshipEditOpen(false);
    setSelectedScholarship(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    if (!amount || typeof amount !== 'object') {
      return '₹0';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: amount.currency || 'INR'
    }).format(amount.value || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter functions
  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchTerm === '' || 
      app.scholarship?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredScholarships = scholarships.filter(scholarship => {
    const matchesSearch = searchTerm === '' || 
      scholarship.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scholarship.organization?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || scholarship.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage scholarships, applications, users, and organizations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Scholarships</h3>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalScholarships}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Applications</h3>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Organizations</h3>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalOrganizations}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Pending Applications</h3>
                <p className="text-2xl font-bold text-yellow-600">{dashboardStats.pendingApplications}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Approved Applications</h3>
                <p className="text-2xl font-bold text-green-600">{dashboardStats.approvedApplications}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Active Scholarships</h3>
                <p className="text-2xl font-bold text-blue-600">{dashboardStats.activeScholarships}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'applications', name: 'Applications', icon: FileText },
                { id: 'scholarships', name: 'Scholarships', icon: BookOpen },
                { id: 'users', name: 'Users', icon: Users },
                { id: 'organizations', name: 'Organizations', icon: Building }
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
          {/* Search and Filters */}
          {(activeTab === 'applications' || activeTab === 'scholarships' || activeTab === 'users') && (
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {(activeTab === 'applications' || activeTab === 'scholarships') && (
                <div className="flex gap-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    {activeTab === 'applications' && (
                      <>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="submitted">Submitted</option>
                      </>
                    )}
                    {activeTab === 'scholarships' && (
                      <>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Draft</option>
                      </>
                    )}
                  </select>
                </div>
              )}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Platform Overview</h2>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate('/admin/scholarships/create')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <Plus className="h-6 w-6 text-blue-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Create Scholarship</h3>
                  <p className="text-sm text-gray-600">Add a new scholarship opportunity</p>
                </button>

                <button
                  onClick={() => setActiveTab('applications')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <FileText className="h-6 w-6 text-green-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Review Applications</h3>
                  <p className="text-sm text-gray-600">Process pending applications</p>
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <Users className="h-6 w-6 text-purple-600 mb-2" />
                  <h3 className="font-medium text-gray-900">Manage Users</h3>
                  <p className="text-sm text-gray-600">View and manage user accounts</p>
                </button>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Applications</h3>
                  <div className="space-y-3">
                    {applications.slice(0, 5).map((application) => (
                      <div key={application._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{application.scholarship?.title}</h4>
                          <p className="text-sm text-gray-600">{application.applicant?.name}</p>
                          <p className="text-xs text-gray-500">Applied {formatDate(application.createdAt)}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Scholarships</h3>
                  <div className="space-y-3">
                    {scholarships.slice(0, 5).map((scholarship) => (
                      <div key={scholarship._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{scholarship.title}</h4>
                          <p className="text-sm text-gray-600">{scholarship.organization?.name}</p>
                          <p className="text-xs text-gray-500">Deadline: {formatDate(scholarship.deadlines.application)}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(scholarship.status)}`}>
                            {scholarship.status}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{formatAmount(scholarship.amount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Application Management</h2>
                <div className="flex gap-2">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    <Download className="h-4 w-4 inline mr-2" />
                    Export
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scholarship</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredApplications.map((application) => (
                      <tr key={application._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{application.applicant?.name}</div>
                            <div className="text-sm text-gray-500">{application.applicant?.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{application.scholarship?.title}</div>
                          <div className="text-sm text-gray-500">{formatAmount(application.scholarship?.amount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(application.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {application.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewApplication(application)}
                              className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="text-xs">Details</span>
                            </button>
                            {(application.status === 'pending' || application.status === 'submitted') && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(application._id, 'approved')}
                                  className="text-green-600 hover:text-green-900"
                                  title="Approve"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(application._id, 'rejected')}
                                  className="text-red-600 hover:text-red-900"
                                  title="Reject"
                                >
                                  <AlertCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredApplications.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                  <p className="text-gray-600">No applications match your current filters</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'scholarships' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Scholarship Management</h2>
                <button
                  onClick={() => navigate('/admin/scholarships/create')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Add Scholarship
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredScholarships.map((scholarship) => (
                  <div key={scholarship._id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{scholarship.title}</h3>
                        <p className="text-sm text-gray-600">{scholarship.organization?.name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(scholarship.status)}`}>
                        {scholarship.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">{formatAmount(scholarship.amount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Deadline:</span>
                        <span className="font-medium">{formatDate(scholarship.deadlines.application)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Applications:</span>
                        <span className="font-medium">
                          {applications.filter(app => app.scholarship?._id === scholarship._id).length}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewScholarship(scholarship)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
                      >
                        <Eye className="h-4 w-4 inline mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleEditScholarship(scholarship)}
                        className="flex-1 border border-blue-600 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 text-sm"
                      >
                        <Edit className="h-4 w-4 inline mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteScholarship(scholarship._id)}
                        className="px-3 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredScholarships.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No scholarships found</h3>
                  <p className="text-gray-600 mb-6">No scholarships match your current filters</p>
                  <button
                    onClick={() => navigate('/admin/scholarships/create')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  >
                    Create First Scholarship
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {applications.filter(app => app.applicant?._id === user._id).length}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {users.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-600">No users match your search criteria</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'organizations' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Organization Management</h2>
                <button
                  onClick={() => navigate('/admin/organizations/create')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Add Organization
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organizations.map((organization) => (
                  <div key={organization._id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{organization.name}</h3>
                        <p className="text-sm text-gray-600 capitalize">{organization.type}</p>
                      </div>
                      {organization.logo && (
                        <img 
                          src={organization.logo} 
                          alt={organization.name}
                          className="w-12 h-12 object-contain rounded"
                        />
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      {organization.website && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Building className="h-4 w-4 mr-2" />
                          <a href={organization.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                            Website
                          </a>
                        </div>
                      )}
                      {organization.contact?.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>{organization.contact.email}</span>
                        </div>
                      )}
                      {organization.contact?.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{organization.contact.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Scholarships:</span>
                      <span className="font-medium">
                        {scholarships.filter(s => s.organization?._id === organization._id).length}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => navigate(`/admin/organizations/${organization._id}/edit`)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
                      >
                        <Edit className="h-4 w-4 inline mr-1" />
                        Edit
                      </button>
                      <button className="flex-1 border border-blue-600 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 text-sm">
                        <Eye className="h-4 w-4 inline mr-1" />
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {organizations.length === 0 && (
                <div className="text-center py-12">
                  <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
                  <p className="text-gray-600 mb-6">Create your first organization to get started</p>
                  <button
                    onClick={() => navigate('/admin/organizations/create')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  >
                    Create First Organization
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Application Detail Modal */}
        <ApplicationDetailModal
          application={selectedApplication}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onStatusUpdate={handleApplicationStatusUpdate}
        />

        {/* Scholarship View Modal */}
        <ScholarshipViewModal
          key={`view-${scholarshipUpdateKey}`}
          scholarship={selectedScholarship}
          isOpen={isScholarshipViewOpen}
          onClose={handleCloseScholarshipModals}
          onEdit={handleEditScholarship}
        />

        {/* Scholarship Edit Modal */}
        <ScholarshipEditModal
          key={`edit-${scholarshipUpdateKey}`}
          scholarship={selectedScholarship}
          isOpen={isScholarshipEditOpen}
          onClose={handleCloseScholarshipModals}
          onSave={handleSaveScholarship}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;