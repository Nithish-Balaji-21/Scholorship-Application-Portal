const User = require('../models/User');
const Scholarship = require('../models/Scholarship');
const Application = require('../models/Application');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      profile: {
        phone,
        dateOfBirth,
        address,
        education,
        bio
      }
    } = req.body;

    const updateData = {
      name,
      profile: {
        phone,
        dateOfBirth,
        address,
        education,
        bio
      }
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user profile
// @route   DELETE /api/user/profile
// @access  Private
exports.deleteProfile = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get user's saved scholarships
// @route   GET /api/user/saved-scholarships
// @access  Private
exports.getSavedScholarships = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedScholarships',
        populate: {
          path: 'organization',
          select: 'name logo type'
        }
      });

    res.status(200).json({
      success: true,
      data: user.savedScholarships || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Get user's applications
// @route   GET /api/user/applications
// @access  Private
exports.getApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate('scholarship', 'title amount deadlines organization')
      .populate({
        path: 'scholarship',
        populate: {
          path: 'organization',
          select: 'name logo'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Upload user avatar
// @route   POST /api/user/upload-avatar
// @access  Private
exports.uploadAvatar = async (req, res, next) => {
  try {
    // This will be implemented when we add file upload functionality
    res.status(501).json({
      success: false,
      message: 'Avatar upload not implemented yet'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// @desc    Change user password
// @route   PUT /api/user/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isCurrentPasswordCorrect = await user.matchPassword(currentPassword);

    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};