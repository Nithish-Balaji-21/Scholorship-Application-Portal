const mongoose = require('mongoose');

const ScholarshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide scholarship title'],
    trim: true,
    maxlength: [300, 'Title cannot exceed 300 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Please provide scholarship description'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Please specify the organization']
  },
  amount: {
    value: {
      type: Number,
      required: [true, 'Please provide scholarship amount']
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
    },
    type: {
      type: String,
      enum: ['fixed', 'variable', 'partial-tuition', 'full-tuition'],
      default: 'fixed'
    }
  },
  eligibility: {
    education: {
      levels: [{
        type: String,
        enum: ['high-school', 'undergraduate', 'graduate', 'postgraduate', 'other']
      }],
      minGPA: {
        type: Number,
        min: 0,
        max: 4.0
      },
      fieldsOfStudy: [String]
    },
    demographics: {
      ageRange: {
        min: Number,
        max: Number
      },
      gender: {
        type: String,
        enum: ['any', 'male', 'female', 'non-binary', 'other']
      },
      nationality: [String],
      residency: [String]
    },
    financial: {
      maxFamilyIncome: Number,
      requiresFinancialNeed: {
        type: Boolean,
        default: false
      }
    },
    other: [String]
  },
  requirements: {
    documents: [{
      name: String,
      required: Boolean,
      description: String
    }],
    essays: [{
      topic: String,
      wordLimit: Number,
      required: Boolean
    }],
    recommendations: {
      count: {
        type: Number,
        default: 0
      },
      types: [String] // 'academic', 'professional', 'personal'
    },
    other: [String]
  },
  deadlines: {
    application: {
      type: Date,
      required: [true, 'Please provide application deadline']
    },
    notification: Date,
    acceptance: Date
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  categories: [{
    type: String,
    enum: [
      'merit-based',
      'need-based',
      'athletic',
      'artistic',
      'academic-excellence',
      'community-service',
      'leadership',
      'minority',
      'women',
      'international',
      'stem',
      'business',
      'healthcare',
      'education',
      'other'
    ]
  }],
  attachments: [{
    name: String,
    url: String, // File path or S3 URL
    type: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  applicationCount: {
    type: Number,
    default: 0
  },
  maxApplications: Number,
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringInfo: {
    frequency: {
      type: String,
      enum: ['yearly', 'semester', 'quarterly']
    },
    nextCycle: Date
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'closed', 'expired', 'cancelled'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  savedCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ScholarshipSchema.index({ title: 'text', description: 'text', shortDescription: 'text' });
ScholarshipSchema.index({ organization: 1 });
ScholarshipSchema.index({ 'deadlines.application': 1 });
ScholarshipSchema.index({ tags: 1 });
ScholarshipSchema.index({ categories: 1 });
ScholarshipSchema.index({ status: 1 });
ScholarshipSchema.index({ featured: 1 });
ScholarshipSchema.index({ 'amount.value': 1 });
ScholarshipSchema.index({ 'eligibility.education.levels': 1 });

// Generate slug before saving
ScholarshipSchema.pre('save', function(next) {
  if (!this.slug || this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }
  next();
});

// Virtual for days until deadline
ScholarshipSchema.virtual('daysUntilDeadline').get(function() {
  const now = new Date();
  const deadline = new Date(this.deadlines.application);
  const diffTime = deadline - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Check if scholarship is expired
ScholarshipSchema.virtual('isExpired').get(function() {
  return new Date() > new Date(this.deadlines.application);
});

// Static method to find active scholarships
ScholarshipSchema.statics.findActive = function() {
  return this.find({
    status: 'active',
    'deadlines.application': { $gt: new Date() }
  });
};

module.exports = mongoose.model('Scholarship', ScholarshipSchema);