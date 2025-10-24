const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide organization name'],
    trim: true,
    maxlength: [200, 'Organization name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Please provide organization description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: ['government', 'private', 'non-profit', 'educational', 'foundation', 'corporate'],
    required: true
  },
  logo: {
    type: String // File path or S3 URL
  },
  website: {
    type: String,
    match: [
      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      'Please provide a valid website URL'
    ]
  },
  contact: {
    email: {
      type: String,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  establishedYear: {
    type: Number,
    min: 1800,
    max: new Date().getFullYear()
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  socialMedia: {
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String
  },
  scholarships: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
OrganizationSchema.index({ name: 'text', description: 'text' });
OrganizationSchema.index({ type: 1 });
OrganizationSchema.index({ tags: 1 });
OrganizationSchema.index({ isActive: 1, isVerified: 1 });

// Generate slug before saving
OrganizationSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }
  next();
});

// Virtual for scholarship count
OrganizationSchema.virtual('scholarshipCount', {
  ref: 'Scholarship',
  localField: '_id',
  foreignField: 'organization',
  count: true
});

module.exports = mongoose.model('Organization', OrganizationSchema);