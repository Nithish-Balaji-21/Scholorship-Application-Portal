const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  scholarship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'waitlisted'],
    default: 'draft'
  },
  
  // Personal Information
  personalInfo: {
    fullName: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    dateOfBirth: Date,
    gender: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    nationality: String,
    profilePhoto: String
  },

  // Academic Information
  academicInfo: {
    currentEducationLevel: String, // 'high_school', 'undergraduate', 'graduate', 'postgraduate'
    institutionName: String,
    course: String,
    yearOfStudy: String,
    gpa: Number,
    expectedGraduationDate: Date,
    previousEducation: [{
      institutionName: String,
      degree: String,
      field: String,
      startDate: Date,
      endDate: Date,
      gpa: Number,
      percentage: Number
    }],
    achievements: [String],
    extracurricularActivities: [String]
  },

  // Family and Financial Information
  familyFinancialInfo: {
    fatherName: String,
    fatherOccupation: String,
    fatherIncome: Number,
    motherName: String,
    motherOccupation: String,
    motherIncome: Number,
    guardianName: String,
    guardianRelation: String,
    totalFamilyIncome: Number,
    numberOfDependents: Number,
    familySize: Number,
    financialNeed: String,
    incomeCategory: String // 'below_1_lakh', '1-3_lakhs', '3-5_lakhs', '5-10_lakhs', 'above_10_lakhs'
  },

  // Essays and Statements
  essays: {
    personalStatement: String,
    whyDeserveScholarship: String,
    careerGoals: String,
    challenges: String,
    additionalInfo: String
  },

  // Documents
  documents: {
    marksheets: [{ filename: String, url: String, uploadedAt: Date }],
    incomeCertificate: { filename: String, url: String, uploadedAt: Date },
    casteCertificate: { filename: String, url: String, uploadedAt: Date },
    idProof: { filename: String, url: String, uploadedAt: Date },
    photograph: { filename: String, url: String, uploadedAt: Date },
    recommendationLetters: [{ filename: String, url: String, uploadedAt: Date }],
    additionalDocuments: [{ filename: String, url: String, uploadedAt: Date }]
  },

  // Review Information (Admin only)
  reviewInfo: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewDate: Date,
    reviewNotes: String,
    internalRating: Number, // 1-10 scale
    awardAmount: Number
  },

  // Application Metadata
  completionPercentage: {
    type: Number,
    default: 0
  },
  submissionDate: Date,
  lastModified: {
    type: Date,
    default: Date.now
  },
  
  // Tracking
  viewedByAdmin: {
    type: Boolean,
    default: false
  },
  viewedAt: Date,
  
  // Additional fields
  applicationNotes: String,
  tags: [String]
}, {
  timestamps: true
});

// Method to check if application can be submitted
ApplicationSchema.methods.canBeSubmitted = function() {
  // Check minimum required fields for submission
  const hasPersonalInfo = this.personalInfo && 
                          this.personalInfo.fullName && 
                          this.personalInfo.email && 
                          this.personalInfo.phone;
  
  const hasBasicAcademicInfo = this.academicInfo && 
                               this.academicInfo.institutionName;
  
  // Must have at least 60% completion
  const hasMinimumCompletion = this.completionPercentage >= 60;
  
  return hasPersonalInfo && hasBasicAcademicInfo && hasMinimumCompletion;
};

// Method to submit application
ApplicationSchema.methods.submit = function() {
  if (!this.canBeSubmitted()) {
    return false;
  }
  
  this.status = 'submitted';
  this.submissionDate = new Date();
  return true;
};

// Method to calculate completion percentage
ApplicationSchema.methods.calculateCompletionPercentage = function() {
  let completed = 0;
  const total = 5; // 5 major sections
  
  // Personal Info (20%)
  if (this.personalInfo && this.personalInfo.fullName && 
      this.personalInfo.email && this.personalInfo.phone) {
    completed++;
  }
  
  // Academic Info (20%)
  if (this.academicInfo && this.academicInfo.institutionName && 
      this.academicInfo.course) {
    completed++;
  }
  
  // Family/Financial Info (20%)
  if (this.familyFinancialInfo && this.familyFinancialInfo.totalFamilyIncome) {
    completed++;
  }
  
  // Essays (20%)
  if (this.essays && (this.essays.personalStatement || this.essays.whyDeserveScholarship)) {
    completed++;
  }
  
  // Documents (20%)
  if (this.documents && (this.documents.marksheets?.length > 0 || this.documents.idProof)) {
    completed++;
  }
  
  this.completionPercentage = Math.round((completed / total) * 100);
  return this.completionPercentage;
};

// Pre-save hook to update completion percentage
ApplicationSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.calculateCompletionPercentage();
    this.lastModified = new Date();
  }
  next();
});

// Index for better query performance
ApplicationSchema.index({ applicant: 1, scholarship: 1 });
ApplicationSchema.index({ status: 1, submissionDate: -1 });
ApplicationSchema.index({ scholarship: 1, status: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);