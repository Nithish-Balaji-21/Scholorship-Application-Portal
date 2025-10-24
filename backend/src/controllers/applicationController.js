const Application = require('../models/Application');
const Scholarship = require('../models/Scholarship');
const User = require('../models/User');
const emailService = require('../../services/emailService');

// @desc    Get user's applications
// @route   GET /api/applications
// @access  Private
exports.getMyApplications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filter = { applicant: req.user.id };
    
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const applications = await Application.find(filter)
      .populate('scholarship', 'title organization amount deadlines')
      .populate({
        path: 'scholarship',
        populate: {
          path: 'organization',
          select: 'name logo'
        }
      })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(filter);

    res.status(200).json({
      success: true,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        limit
      },
      data: applications
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
exports.getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('scholarship')
      .populate('applicant', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns this application or is admin
    if (req.user.role !== 'admin' && application.applicant._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Create new application
// @route   POST /api/applications
// @access  Private (Students only)
exports.createApplication = async (req, res, next) => {
  try {
    const { scholarshipId, personalInfo, academicInfo, familyFinancialInfo, essays, documents } = req.body;

    // Check if scholarship exists and is active
    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship || scholarship.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Scholarship not found or not active'
      });
    }

    // Check if deadline has passed
    if (new Date() > new Date(scholarship.deadlines.application)) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed'
      });
    }

    // Check if maximum applications limit has been reached
    if (scholarship.maxApplications && scholarship.applicationCount >= scholarship.maxApplications) {
      return res.status(400).json({
        success: false,
        message: 'This scholarship has reached its maximum number of applications'
      });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      scholarship: scholarshipId,
      applicant: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this scholarship'
      });
    }

    // Create comprehensive application
    const application = await Application.create({
      scholarship: scholarshipId,
      applicant: req.user.id,
      personalInfo: {
        ...personalInfo,
        fullName: personalInfo.fullName || req.user.name,
        email: personalInfo.email || req.user.email
      },
      academicInfo,
      familyFinancialInfo,
      essays,
      documents,
      status: 'draft',
      submissionDate: new Date(),
      lastModified: new Date(),
      completionPercentage: calculateCompletionPercentage({
        personalInfo,
        academicInfo,
        familyFinancialInfo,
        essays,
        documents
      })
    });

    // Add to user's applications
    await User.findByIdAndUpdate(req.user.id, {
      $push: { applications: application._id }
    });

    // Increment scholarship application count
    await Scholarship.findByIdAndUpdate(scholarshipId, {
      $inc: { applicationCount: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: application
    });

  } catch (error) {
    console.error('Create application error:', error);
    next(error);
  }
};

// Helper function to calculate completion percentage
const calculateCompletionPercentage = (data) => {
  let totalFields = 0;
  let completedFields = 0;

  // Personal Info (weight: 25%)
  const personalRequired = ['fullName', 'email', 'phone', 'dateOfBirth', 'gender', 'aadhaarNumber'];
  totalFields += personalRequired.length * 0.25;
  completedFields += personalRequired.filter(field => data.personalInfo?.[field]).length * 0.25;

  // Academic Info (weight: 25%)
  const academicRequired = ['currentEducationLevel', 'currentCourse', 'enrollmentNumber', 'expectedGraduation'];
  totalFields += academicRequired.length * 0.25;
  completedFields += academicRequired.filter(field => data.academicInfo?.[field]).length * 0.25;

  // Family/Financial Info (weight: 20%)
  const financialRequired = ['totalFamilyIncome', 'householdSize'];
  totalFields += financialRequired.length * 0.2;
  completedFields += financialRequired.filter(field => data.familyFinancialInfo?.[field]).length * 0.2;

  // Essays (weight: 20%)
  const essaysRequired = ['statementOfPurpose', 'whyDeserveScholarship', 'careerGoals'];
  totalFields += essaysRequired.length * 0.2;
  completedFields += essaysRequired.filter(field => data.essays?.[field]).length * 0.2;

  // Documents (weight: 10%)
  const docsRequired = ['identityProof', 'class10Marksheet', 'class12Marksheet', 'incomeProof'];
  totalFields += docsRequired.length * 0.1;
  completedFields += docsRequired.filter(field => data.documents?.[field]).length * 0.1;

  return Math.round((completedFields / totalFields) * 100);
};

// @desc    Update application
// @route   PUT /api/applications/:id
// @access  Private
exports.updateApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user owns this application
    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    // Don't allow updates if application is submitted, under review, or decided
    if (['submitted', 'under_review', 'approved', 'rejected'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update application in current status'
      });
    }

    const { personalInfo, academicInfo, familyFinancialInfo, essays, documents, status } = req.body;

    // Update fields if provided
    const updateData = {
      lastModified: new Date()
    };

    if (personalInfo) updateData.personalInfo = { ...application.personalInfo, ...personalInfo };
    if (academicInfo) updateData.academicInfo = { ...application.academicInfo, ...academicInfo };
    if (familyFinancialInfo) updateData.familyFinancialInfo = { ...application.familyFinancialInfo, ...familyFinancialInfo };
    if (essays) updateData.essays = { ...application.essays, ...essays };
    if (documents) updateData.documents = { ...application.documents, ...documents };

    // Calculate completion percentage
    const updatedData = {
      personalInfo: updateData.personalInfo || application.personalInfo,
      academicInfo: updateData.academicInfo || application.academicInfo,
      familyFinancialInfo: updateData.familyFinancialInfo || application.familyFinancialInfo,
      essays: updateData.essays || application.essays,
      documents: updateData.documents || application.documents
    };

    updateData.completionPercentage = calculateCompletionPercentage(updatedData);

    // If status is being updated to submitted, validate completion
    if (status === 'submitted') {
      if (updateData.completionPercentage < 100) {
        return res.status(400).json({
          success: false,
          message: 'Application must be 100% complete before submission'
        });
      }
      updateData.status = 'submitted';
      updateData.submissionDate = new Date();
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('scholarship', 'title organization amount');

    res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: updatedApplication
    });

  } catch (error) {
    console.error('Update application error:', error);
    next(error);
  }
};

// @desc    Submit application
// @route   POST /api/applications/:id/submit
// @access  Private (Students only)
exports.submitApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check ownership
    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if can be submitted
    if (!application.canBeSubmitted()) {
      return res.status(400).json({
        success: false,
        message: 'Application is not complete enough to submit'
      });
    }

    const success = application.submit();
    if (success) {
      await application.save();
      
      // Send confirmation email
      try {
        // Populate the application with user and scholarship details
        await application.populate([
          { path: 'applicant', select: 'firstName lastName email' },
          { path: 'scholarship', select: 'title amount organization' }
        ]);
        
        await emailService.sendApplicationConfirmationEmail(
          application.applicant,
          application.scholarship,
          application
        );
        console.log('Application confirmation email sent successfully');
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Continue execution - don't fail the submission because of email issues
      }
      
      res.status(200).json({
        success: true,
        message: 'Application submitted successfully',
        data: application
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Unable to submit application'
      });
    }

  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications (Admin only)
// @route   GET /api/applications/admin/all
// @access  Private (Admin only)
exports.getAllApplications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.query.scholarship) {
      filter.scholarship = req.query.scholarship;
    }

    const applications = await Application.find(filter)
      .populate('scholarship', 'title organization')
      .populate('applicant', 'name email')
      .sort('-submissionDate')
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(filter);

    res.status(200).json({
      success: true,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        limit
      },
      data: applications
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (Admin only)
// @route   PUT /api/applications/:id/status
// @access  Private (Admin only)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, reviewNotes, awardAmount } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('applicant', 'name email')
      .populate('scholarship', 'title organization amount');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Store previous status for comparison
    const previousStatus = application.status;

    // Update status and related fields
    application.status = status;
    if (reviewNotes) application.reviewNotes = reviewNotes;
    if (awardAmount && status === 'approved') application.awardAmount = awardAmount;
    application.reviewDate = new Date();
    application.reviewedBy = req.user.id;

    // Add to status history
    application.statusHistory.push({
      status,
      changedBy: req.user.id,
      reason: reviewNotes,
      changedAt: new Date()
    });

    await application.save();

    // Send email notification only if status has changed
    if (previousStatus !== status) {
      try {
        const emailService = require('../../services/emailService');
        await emailService.sendApplicationStatusEmail(
          application.applicant,
          application.scholarship,
          application,
          status,
          reviewNotes
        );
        console.log(`Email notification sent for application ${application._id} status change to ${status}`);
      } catch (emailError) {
        console.error('Error sending status update email:', emailError);
        // Don't fail the status update if email fails
      }
    }

    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      data: application
    });

  } catch (error) {
    console.error('Update application status error:', error);
    next(error);
  }
};