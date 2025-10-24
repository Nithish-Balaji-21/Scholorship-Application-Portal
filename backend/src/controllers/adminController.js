const User = require('../models/User');
const Application = require('../models/Application');
const Scholarship = require('../models/Scholarship');
const Organization = require('../models/Organization');
const emailService = require('../../services/emailService');

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    // Search by name or email
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Filter by role
    if (req.query.role) {
      filter.role = req.query.role;
    }

    // Sort options
    let sort = { createdAt: -1 }; // Default: newest first
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'name':
          sort = { name: 1 };
          break;
        case 'email':
          sort = { email: 1 };
          break;
        case 'role':
          sort = { role: 1 };
          break;
        case 'oldest':
          sort = { createdAt: 1 };
          break;
        default:
          sort = { createdAt: -1 };
      }
    }

    // Execute query
    const users = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/users/stats
// @access  Private (Admin only)
exports.getUserStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      studentCount,
      adminCount,
      recentUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        studentCount,
        adminCount,
        recentUsers,
        userGrowth: {
          thisMonth: recentUsers
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    // Validate role
    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "student" or "admin"'
      });
    }

    // Prevent admin from changing their own role to student
    if (req.params.id === req.user.id && role === 'student') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role to student'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      data: user,
      message: `User role updated to ${role}`
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Also delete all applications by this user
    await Application.deleteMany({ applicant: req.params.id });

    // Remove user from saved scholarships
    await User.updateMany(
      { savedScholarships: req.params.id },
      { $pull: { savedScholarships: req.params.id } }
    );

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for admin review
// @route   GET /api/admin/applications
// @access  Private (Admin only)
exports.getAllApplications = async (req, res, next) => {
  try {
    const {
      status,
      scholarship,
      page = 1,
      limit = 10,
      sortBy = 'submissionDate',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (scholarship) query.scholarship = scholarship;

    // Only show submitted applications and above
    query.status = { $in: ['submitted', 'under_review', 'approved', 'rejected', 'waitlisted'] };

    const applications = await Application.find(query)
      .populate('applicant', 'name email personalInfo')
      .populate({
        path: 'scholarship',
        select: 'title organization amount deadlines',
        populate: {
          path: 'organization',
          select: 'name logo'
        }
      })
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: applications
    });

  } catch (error) {
    console.error('Get all applications error:', error);
    next(error);
  }
};

// @desc    Get single application for admin review
// @route   GET /api/admin/applications/:id
// @access  Private (Admin only)
exports.getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email personalInfo')
      .populate({
        path: 'scholarship',
        select: 'title organization amount description requirements eligibility deadlines',
        populate: {
          path: 'organization',
          select: 'name logo'
        }
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('Get application by ID error:', error);
    next(error);
  }
};

// @desc    Review application (approve/reject/waitlist)
// @route   PUT /api/admin/applications/:id/review
// @access  Private (Admin only)
exports.reviewApplication = async (req, res, next) => {
  try {
    const { status, reviewNotes, awardAmount, reviewedBy } = req.body;

    if (!['approved', 'rejected', 'waitlisted'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review status'
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email')
      .populate('scholarship', 'title organization amount');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (!['submitted', 'under_review'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'Application cannot be reviewed in current status'
      });
    }

    // Update application
    application.status = status;
    application.reviewNotes = reviewNotes;
    application.reviewDate = new Date();
    application.reviewedBy = reviewedBy || req.user.id;

    if (status === 'approved' && awardAmount) {
      application.awardAmount = awardAmount;
    }

    await application.save();

    // Update scholarship statistics
    await Scholarship.findByIdAndUpdate(application.scholarship._id, {
      $inc: {
        [`stats.${status}Count`]: 1,
        'stats.reviewedCount': 1
      }
    });

    // Send email notification
    try {
      await emailService.sendApplicationStatusEmail(
        application.applicant,
        application.scholarship,
        application,
        status,
        reviewNotes
      );
      console.log(`Application ${status} email sent successfully`);
    } catch (emailError) {
      console.error('Failed to send status email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      data: application
    });

  } catch (error) {
    console.error('Review application error:', error);
    next(error);
  }
};

// @desc    Get application statistics for dashboard
// @route   GET /api/admin/applications/stats
// @access  Private (Admin only)
exports.getApplicationStats = async (req, res, next) => {
  try {
    const { scholarshipId } = req.query;
    
    const matchStage = scholarshipId ? { scholarship: scholarshipId } : {};

    const stats = await Application.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgCompletionPercentage: { $avg: '$completionPercentage' }
        }
      }
    ]);

    const totalApplications = await Application.countDocuments(matchStage);
    
    const recentApplications = await Application.find(matchStage)
      .populate('applicant', 'name email')
      .populate('scholarship', 'title organization')
      .sort({ submissionDate: -1 })
      .limit(5);

    // Calculate completion rates
    const submittedApps = await Application.countDocuments({
      ...matchStage,
      status: { $in: ['submitted', 'under_review', 'approved', 'rejected', 'waitlisted'] }
    });

    res.status(200).json({
      success: true,
      data: {
        totalApplications,
        submittedApplications: submittedApps,
        completionRate: totalApplications > 0 ? (submittedApps / totalApplications) * 100 : 0,
        statusBreakdown: stats,
        recentApplications
      }
    });

  } catch (error) {
    console.error('Get application stats error:', error);
    next(error);
  }
};

// @desc    Get all scholarships (admin view)
// @route   GET /api/admin/scholarships
// @access  Private (Admin only)
exports.getAllScholarships = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const filter = {};
    
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const scholarships = await Scholarship.find(filter)
      .populate('organization', 'name type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Scholarship.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: scholarships,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all scholarships admin error:', error);
    next(error);
  }
};

// @desc    Get scholarship statistics
// @route   GET /api/admin/scholarships/stats
// @access  Private (Admin only)
exports.getScholarshipStats = async (req, res, next) => {
  try {
    const stats = await Scholarship.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalScholarships = await Scholarship.countDocuments();
    const activeScholarships = await Scholarship.countDocuments({
      status: 'active',
      'deadlines.application': { $gte: new Date() }
    });

    res.status(200).json({
      success: true,
      data: {
        totalScholarships,
        activeScholarships,
        statusBreakdown: stats
      }
    });

  } catch (error) {
    console.error('Get scholarship stats error:', error);
    next(error);
  }
};

// @desc    Get all organizations (admin view)
// @route   GET /api/admin/organizations
// @access  Private (Admin only)
exports.getAllOrganizations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const filter = {};
    
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { type: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const organizations = await Organization.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Organization.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: organizations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all organizations admin error:', error);
    next(error);
  }
};

// @desc    Get organization statistics
// @route   GET /api/admin/organizations/stats
// @access  Private (Admin only)
exports.getOrganizationStats = async (req, res, next) => {
  try {
    const totalOrganizations = await Organization.countDocuments();
    
    const typeStats = await Organization.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOrganizations,
        typeBreakdown: typeStats
      }
    });

  } catch (error) {
    console.error('Get organization stats error:', error);
    next(error);
  }
};

// @desc    Get comprehensive dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Get counts for all entities
    const [
      totalUsers,
      totalApplications,
      totalScholarships,
      totalOrganizations,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      activeScholarships
    ] = await Promise.all([
      User.countDocuments(),
      Application.countDocuments(),
      Scholarship.countDocuments(),
      Organization.countDocuments(),
      Application.countDocuments({ status: { $in: ['pending', 'submitted'] } }),
      Application.countDocuments({ status: 'approved' }),
      Application.countDocuments({ status: 'rejected' }),
      Scholarship.countDocuments({
        status: 'active',
        'deadlines.application': { $gte: new Date() }
      })
    ]);

    // Get recent activity
    const recentApplications = await Application.find()
      .populate('applicant', 'name email')
      .populate('scholarship', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalApplications,
        totalScholarships,
        totalOrganizations,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        activeScholarships,
        recentApplications,
        recentUsers
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    next(error);
  }
};
