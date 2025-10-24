const Organization = require('../models/Organization');

// @desc    Get all organizations
// @route   GET /api/organizations
// @access  Public
exports.getOrganizations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    if (req.query.type) {
      filter.type = req.query.type;
    }

    if (req.query.verified !== undefined) {
      filter.isVerified = req.query.verified === 'true';
    }

    const organizations = await Organization.find(filter)
      .select('-scholarships -createdBy')
      .sort({ isVerified: -1, name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Organization.countDocuments(filter);

    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCount: total,
      limit
    };

    res.status(200).json({
      success: true,
      pagination,
      data: organizations
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get single organization
// @route   GET /api/organizations/:id
// @access  Public
exports.getOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .populate('scholarships', 'title amount deadlines status categories');

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.status(200).json({
      success: true,
      data: organization
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Create organization
// @route   POST /api/organizations
// @access  Private (Admin only)
exports.createOrganization = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    
    const organization = await Organization.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: organization
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private (Admin only)
exports.updateOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Organization updated successfully',
      data: organization
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Private (Admin only)
exports.deleteOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    await organization.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Organization deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};