const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Scholarship = require('../models/Scholarship');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample data
const sampleAdmin = {
  name: 'Admin User',
  email: 'admin@buddy4study.com',
  password: 'Admin123!',
  role: 'admin',
  isEmailVerified: true,
  profile: {
    bio: 'System Administrator',
    dateOfBirth: new Date('1990-01-01'),
    phone: '+1-555-0000',
    address: {
      street: '123 Admin Street',
      city: 'Admin City',
      state: 'AC',
      zipCode: '00000',
      country: 'USA'
    }
  }
};

const sampleOrganizations = [
  {
    name: 'Tech Foundation',
    slug: 'tech-foundation',
    description: 'Supporting technology education and innovation',
    type: 'foundation',
    website: 'https://techfoundation.org',
    contact: {
      email: 'info@techfoundation.org',
      phone: '+1-555-0101',
      address: {
        street: '123 Tech Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA'
      }
    },
    establishedYear: 2010,
    tags: ['technology', 'education', 'innovation'],
    isVerified: true
  },
  {
    name: 'Education Excellence Fund',
    slug: 'education-excellence-fund',
    description: 'Promoting excellence in education through scholarships',
    type: 'non-profit',
    website: 'https://educationfund.org',
    contact: {
      email: 'scholarships@educationfund.org',
      phone: '+1-555-0102',
      address: {
        street: '456 Education Ave',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        country: 'USA'
      }
    },
    establishedYear: 2005,
    tags: ['education', 'excellence', 'scholarships'],
    isVerified: true
  },
  {
    name: 'STEM Scholars Initiative',
    slug: 'stem-scholars-initiative',
    description: 'Supporting STEM education for underrepresented students',
    type: 'foundation',
    website: 'https://stemscholars.org',
    contact: {
      email: 'apply@stemscholars.org',
      phone: '+1-555-0103',
      address: {
        street: '789 Science Blvd',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        country: 'USA'
      }
    },
    establishedYear: 2015,
    tags: ['stem', 'diversity', 'underrepresented'],
    isVerified: true
  }
];

const sampleScholarships = [
  {
    title: 'Future Tech Leaders Scholarship',
    slug: 'future-tech-leaders-scholarship',
    description: 'This scholarship is designed to support students pursuing careers in technology and computer science. We believe in empowering the next generation of tech innovators and leaders.',
    amount: {
      value: 420000,
      currency: 'INR',
      type: 'fixed'
    },
    deadlines: {
      application: new Date('2025-11-30'),
      notification: new Date('2025-12-15')
    },
    eligibility: {
      education: {
        levels: ['undergraduate', 'graduate'],
        minGPA: 3.5,
        fieldsOfStudy: ['Computer Science', 'Software Engineering', 'Information Technology']
      }
    },
    requirements: {
      documents: [
        { name: 'Academic Transcripts', required: true, description: 'Official transcripts from current institution' },
        { name: 'Personal Statement', required: true, description: '500-word personal statement' }
      ],
      recommendations: {
        count: 2,
        types: ['academic', 'professional']
      }
    },
    categories: ['merit-based', 'stem'],
    tags: ['stem', 'innovation', 'leadership'],
    status: 'active',
    applicationCount: 0,
    maxApplications: 100,
    isRecurring: true
  },
  {
    title: 'Excellence in Education Award',
    slug: 'excellence-in-education-award',
    description: 'Supporting outstanding students who demonstrate academic excellence and commitment to making a positive impact in their communities.',
    amount: {
      value: 252000,
      currency: 'INR',
      type: 'fixed'
    },
    deadlines: {
      application: new Date('2025-09-30'),
      notification: new Date('2025-10-15')
    },
    eligibility: {
      education: {
        levels: ['undergraduate'],
        minGPA: 3.7,
        fieldsOfStudy: ['Any']
      },
      demographics: {
        nationality: ['US'],
        residency: ['US']
      }
    },
    requirements: {
      documents: [
        { name: 'Official Transcripts', required: true, description: 'Official academic transcripts' },
        { name: 'Community Service Documentation', required: true, description: 'Proof of community service' }
      ],
      essays: [
        { topic: 'Community Impact Essay', wordLimit: 750, required: true }
      ],
      recommendations: {
        count: 1,
        types: ['community']
      }
    },
    categories: ['merit-based', 'community-service'],
    tags: ['academic-excellence', 'community-impact'],
    status: 'active',
    applicationCount: 0,
    maxApplications: 50,
    isRecurring: false
  },
  {
    title: 'Women in STEM Scholarship',
    slug: 'women-in-stem-scholarship',
    description: 'Empowering women to pursue careers in Science, Technology, Engineering, and Mathematics through financial support and mentorship opportunities.',
    amount: {
      value: 336000,
      currency: 'INR',
      type: 'fixed'
    },
    deadlines: {
      application: new Date('2025-12-15'),
      notification: new Date('2026-01-15')
    },
    eligibility: {
      education: {
        levels: ['high-school', 'undergraduate', 'graduate'],
        minGPA: 3.0,
        fieldsOfStudy: ['Engineering', 'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology']
      },
      demographics: {
        gender: 'female'
      }
    },
    requirements: {
      documents: [
        { name: 'Academic Transcripts', required: true, description: 'Official academic transcripts' },
        { name: 'Resume', required: true, description: 'Resume highlighting STEM activities' }
      ],
      essays: [
        { topic: 'STEM Goals Personal Statement', wordLimit: 600, required: true }
      ],
      recommendations: {
        count: 1,
        types: ['academic']
      }
    },
    categories: ['stem', 'women'],
    tags: ['gender-diversity', 'stem', 'women'],
    status: 'active',
    applicationCount: 0,
    maxApplications: 75,
    isRecurring: true
  },
  {
    title: 'First-Generation College Student Grant',
    slug: 'first-generation-college-student-grant',
    description: 'Supporting first-generation college students in achieving their educational dreams and breaking barriers to higher education.',
    amount: {
      value: 210000,
      currency: 'INR',
      type: 'fixed'
    },
    deadlines: {
      application: new Date('2025-10-20'),
      notification: new Date('2025-11-20')
    },
    eligibility: {
      education: {
        levels: ['undergraduate'],
        minGPA: 2.5,
        fieldsOfStudy: ['Any']
      },
      financial: {
        requiresFinancialNeed: true
      },
      other: ['First person in family to attend college']
    },
    requirements: {
      documents: [
        { name: 'FAFSA Documentation', required: true, description: 'Financial aid documentation' },
        { name: 'Academic Transcripts', required: true, description: 'Official academic transcripts' },
        { name: 'Income Verification', required: true, description: 'Family income verification documents' }
      ],
      essays: [
        { topic: 'First-Generation Experience Essay', wordLimit: 500, required: true }
      ]
    },
    categories: ['need-based', 'minority'],
    tags: ['first-generation', 'financial-need', 'educational-access'],
    status: 'active',
    applicationCount: 0,
    maxApplications: 200,
    isRecurring: true
  },
  {
    title: 'Graduate Research Fellowship',
    slug: 'graduate-research-fellowship',
    description: 'Supporting graduate students conducting innovative research that addresses real-world challenges and contributes to their field of study.',
    amount: {
      value: 630000,
      currency: 'INR',
      type: 'fixed'
    },
    deadlines: {
      application: new Date('2026-01-31'),
      notification: new Date('2026-02-28')
    },
    eligibility: {
      education: {
        levels: ['graduate', 'postgraduate'],
        minGPA: 3.5,
        fieldsOfStudy: ['Any']
      }
    },
    requirements: {
      documents: [
        { name: 'Graduate Transcripts', required: true, description: 'Official graduate transcripts' },
        { name: 'CV/Resume', required: true, description: 'Current curriculum vitae' },
        { name: 'Research Timeline and Budget', required: true, description: 'Detailed research plan' }
      ],
      essays: [
        { topic: 'Research Proposal', wordLimit: 1000, required: true }
      ],
      recommendations: {
        count: 1,
        types: ['academic']
      }
    },
    categories: ['merit-based', 'academic-excellence'],
    tags: ['research', 'innovation', 'graduate'],
    status: 'active',
    applicationCount: 0,
    maxApplications: 30,
    isRecurring: false
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🔄 Clearing existing data...');
    await User.deleteMany({});
    await Organization.deleteMany({});
    await Scholarship.deleteMany({});

    console.log('👤 Creating admin user...');
    const admin = await User.create(sampleAdmin);
    console.log(`✅ Created admin user: ${admin.email}`);

    console.log('🏢 Creating organizations...');
    
    // Assign admin as createdBy for organizations
    const organizationsWithAdmin = sampleOrganizations.map(org => ({
      ...org,
      createdBy: admin._id
    }));
    
    const organizations = await Organization.insertMany(organizationsWithAdmin);
    console.log(`✅ Created ${organizations.length} organizations`);

    console.log('🎓 Creating scholarships...');
    
    // Assign organizations and admin as createdBy to scholarships
    const scholarshipsWithOrgs = sampleScholarships.map((scholarship, index) => ({
      ...scholarship,
      organization: organizations[index % organizations.length]._id,
      createdBy: admin._id
    }));

    const scholarships = await Scholarship.insertMany(scholarshipsWithOrgs);
    console.log(`✅ Created ${scholarships.length} scholarships`);

    console.log('🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Admin User: 1`);
    console.log(`   Organizations: ${organizations.length}`);
    console.log(`   Scholarships: ${scholarships.length}`);
    console.log('\n🔑 Admin Login Credentials:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: Admin123!`);
    console.log('\n🌐 You can now view the data at:');
    console.log('   Frontend: http://localhost:5173');
    console.log('   API: http://localhost:5001/api/scholarships');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;