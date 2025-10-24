const Scholarship = require('../models/Scholarship');
const Organization = require('../models/Organization');
const User = require('../models/User');
const paginate = require('../utils/paginate');

// @desc    Get all scholarships (public)
// @route   GET /api/scholarships
// @access  Public
exports.getScholarships = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { status: 'active' };
    
    // Search by title or description
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Filter by categories
    if (req.query.categories) {
      const categories = Array.isArray(req.query.categories) 
        ? req.query.categories 
        : req.query.categories.split(',');
      filter.categories = { $in: categories };
    }

    // Filter by tags
    if (req.query.tags) {
      const tags = Array.isArray(req.query.tags) 
        ? req.query.tags 
        : req.query.tags.split(',');
      filter.tags = { $in: tags };
    }

    // Filter by organization
    if (req.query.organization) {
      filter.organization = req.query.organization;
    }

    // Filter by amount range
    if (req.query.minAmount || req.query.maxAmount) {
      filter['amount.value'] = {};
      if (req.query.minAmount) {
        filter['amount.value'].$gte = parseInt(req.query.minAmount);
      }
      if (req.query.maxAmount) {
        filter['amount.value'].$lte = parseInt(req.query.maxAmount);
      }
    }

    // Filter by education level
    if (req.query.educationLevel) {
      const levels = Array.isArray(req.query.educationLevel) 
        ? req.query.educationLevel 
        : req.query.educationLevel.split(',');
      filter['eligibility.education.levels'] = { $in: levels };
    }

    // Filter by deadline (scholarships still accepting applications)
    if (req.query.deadlineFrom) {
      filter['deadlines.application'] = { $gte: new Date(req.query.deadlineFrom) };
    } else {
      // By default, only show scholarships with future deadlines
      filter['deadlines.application'] = { $gte: new Date() };
    }

    // Sort options
    let sort = {};
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'deadline':
          sort = { 'deadlines.application': 1 };
          break;
        case 'amount-high':
          sort = { 'amount.value': -1 };
          break;
        case 'amount-low':
          sort = { 'amount.value': 1 };
          break;
        case 'popular':
          sort = { views: -1, savedCount: -1 };
          break;
        case 'newest':
          sort = { createdAt: -1 };
          break;
        default:
          sort = { featured: -1, createdAt: -1 };
      }
    } else {
      sort = { featured: -1, createdAt: -1 };
    }

    // Execute query
    const scholarships = await Scholarship.find(filter)
      .populate('organization', 'name logo type website')
      .select('-attachments -requirements.essays -requirements.other')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Scholarship.countDocuments(filter);

    // Increment view count for searched/filtered scholarships
    if (req.query.search || req.query.categories || req.query.tags) {
      await Scholarship.updateMany(
        { _id: { $in: scholarships.map(s => s._id) } },
        { $inc: { views: 1 } }
      );
    }

    // Pagination info
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      limit,
      hasNextPage: skip + limit < total,
      hasPrevPage: page > 1
    };

    res.status(200).json({
      success: true,
      pagination,
      data: scholarships
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get single scholarship
// @route   GET /api/scholarships/:id
// @access  Public
exports.getScholarship = async (req, res, next) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id)
      .populate('organization', 'name logo description website contact type')
      .populate('createdBy', 'name');

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }

    // Increment view count
    scholarship.views += 1;
    await scholarship.save();

    res.status(200).json({
      success: true,
      data: scholarship
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Create scholarship
// @route   POST /api/scholarships
// @access  Private (Admin only)
exports.createScholarship = async (req, res, next) => {
  try {
    // Verify organization exists
    if (req.body.organization) {
      const organization = await Organization.findById(req.body.organization);
      if (!organization) {
        return res.status(400).json({
          success: false,
          message: 'Organization not found'
        });
      }
    }

    // Add user as creator
    req.body.createdBy = req.user.id;
    req.body.lastUpdatedBy = req.user.id;

    const scholarship = await Scholarship.create(req.body);

    // Add scholarship to organization
    if (scholarship.organization) {
      await Organization.findByIdAndUpdate(
        scholarship.organization,
        { $push: { scholarships: scholarship._id } }
      );
    }

    // Populate before returning
    await scholarship.populate('organization', 'name logo type');

    res.status(201).json({
      success: true,
      message: 'Scholarship created successfully',
      data: scholarship
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update scholarship
// @route   PUT /api/scholarships/:id
// @access  Private (Admin only)
exports.updateScholarship = async (req, res, next) => {
  try {
    let scholarship = await Scholarship.findById(req.params.id);

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }

    // Add user as last updater
    req.body.lastUpdatedBy = req.user.id;

    scholarship = await Scholarship.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('organization', 'name logo type');

    res.status(200).json({
      success: true,
      message: 'Scholarship updated successfully',
      data: scholarship
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete scholarship
// @route   DELETE /api/scholarships/:id
// @access  Private (Admin only)
exports.deleteScholarship = async (req, res, next) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }

    // Remove from organization
    if (scholarship.organization) {
      await Organization.findByIdAndUpdate(
        scholarship.organization,
        { $pull: { scholarships: scholarship._id } }
      );
    }

    // Remove from users' saved scholarships
    await User.updateMany(
      { savedScholarships: scholarship._id },
      { $pull: { savedScholarships: scholarship._id } }
    );

    await scholarship.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Scholarship deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Save scholarship to user's saved list
// @route   POST /api/scholarships/:id/save
// @access  Private (Students only)
exports.saveScholarship = async (req, res, next) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }

    const user = await User.findById(req.user.id);

    // Check if already saved
    if (user.savedScholarships.includes(scholarship._id)) {
      return res.status(400).json({
        success: false,
        message: 'Scholarship already saved'
      });
    }

    // Add to saved scholarships
    user.savedScholarships.push(scholarship._id);
    await user.save();

    // Increment saved count
    scholarship.savedCount += 1;
    await scholarship.save();

    res.status(200).json({
      success: true,
      message: 'Scholarship saved successfully'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Remove scholarship from saved list
// @route   DELETE /api/scholarships/:id/save
// @access  Private (Students only)
exports.unsaveScholarship = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    // Remove from saved scholarships
    user.savedScholarships = user.savedScholarships.filter(
      id => id.toString() !== req.params.id
    );
    await user.save();

    // Decrement saved count
    await Scholarship.findByIdAndUpdate(
      req.params.id,
      { $inc: { savedCount: -1 } }
    );

    res.status(200).json({
      success: true,
      message: 'Scholarship removed from saved list'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get scholarship categories and tags (for filters)
// @route   GET /api/scholarships/filters
// @access  Public
exports.getFilters = async (req, res, next) => {
  try {
    const categories = await Scholarship.distinct('categories', { status: 'active' });
    const tags = await Scholarship.distinct('tags', { status: 'active' });
    const organizations = await Organization.find(
      { isActive: true },
      'name _id'
    ).sort('name');

    res.status(200).json({
      success: true,
      data: {
        categories: categories.sort(),
        tags: tags.sort(),
        organizations
      }
    });

  } catch (error) {
    next(error);
  }
};