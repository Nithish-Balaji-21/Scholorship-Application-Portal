const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import models
const Scholarship = require('../models/Scholarship');
const User = require('../models/User');
const Organization = require('../models/Organization');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Indian Scholarship Data (Amount in Rupees ₹)
const indianScholarships = [
  {
    title: 'Post Matric Scholarship for SC/ST Students',
    description: 'Government of India scholarship for SC/ST students pursuing post-matric or post-secondary studies. Covers tuition fees, maintenance allowance, and other expenses.',
    amount: 50000,
    type: 'merit_based',
    category: 'undergraduate',
    eligibilityDetails: {
      minimumAge: 16,
      maximumAge: 35,
      minimumGPA: 6.0,
      educationLevel: ['undergraduate', 'postgraduate'],
      fieldOfStudy: ['Any'],
      nationality: ['Indian'],
      caste: ['SC', 'ST'],
      familyIncomeLimit: 250000
    },
    deadlines: {
      application: new Date('2025-12-31'),
      decision: new Date('2026-02-28'),
      award: new Date('2026-03-31')
    },
    requirements: [
      'Aadhaar Card',
      'Income Certificate (Family income below ₹2.5 Lakhs)',
      'Caste Certificate (SC/ST)',
      'Previous year marksheet',
      'Admission proof from current institution',
      'Bank account details'
    ],
    benefits: [
      'Full tuition fee coverage',
      'Maintenance allowance of ₹1,000-2,000 per month',
      'Book allowance',
      'Study tour expenses'
    ],
    applicationProcess: 'Apply online through National Scholarship Portal (NSP). Upload required documents and submit application before deadline.',
    contactInfo: {
      email: 'scholarship@socialjustice.gov.in',
      phone: '+91-11-2338-1200',
      website: 'https://scholarships.gov.in'
    },
    numberOfAwards: 100000,
    isRecurring: true,
    status: 'active'
  },
  {
    title: 'National Means cum Merit Scholarship (NMMSS)',
    description: 'Scholarship scheme for meritorious students from economically weaker sections studying in Class IX to XII. Awarded by the Ministry of Education, Government of India.',
    amount: 12000,
    type: 'merit_based',
    category: 'high_school',
    eligibilityDetails: {
      minimumAge: 14,
      maximumAge: 18,
      minimumGPA: 6.0,
      educationLevel: ['high_school'],
      fieldOfStudy: ['Any'],
      nationality: ['Indian'],
      familyIncomeLimit: 150000
    },
    deadlines: {
      application: new Date('2025-11-30'),
      decision: new Date('2026-01-31'),
      award: new Date('2026-02-28')
    },
    requirements: [
      'Aadhaar Card',
      'Income Certificate (Family income below ₹1.5 Lakhs)',
      'Class 8 marksheet with minimum 55% marks (50% for SC/ST)',
      'School enrollment certificate',
      'Bank account details'
    ],
    benefits: [
      '₹12,000 per year (₹1,000 per month for 10 months)',
      'Renewable up to Class XII',
      'Direct bank transfer'
    ],
    applicationProcess: 'Students must pass NMMS exam and apply through state scholarship portal. Selected candidates receive scholarship throughout secondary education.',
    contactInfo: {
      email: 'nmmss@education.gov.in',
      phone: '+91-11-2396-5611',
      website: 'https://scholarships.gov.in'
    },
    numberOfAwards: 100000,
    isRecurring: true,
    status: 'active'
  },
  {
    title: 'AICTE Pragati Scholarship for Girls',
    description: 'Scholarship for girl students pursuing technical education (Diploma/Degree) in AICTE approved institutions. Encourages girls to take up technical education.',
    amount: 50000,
    type: 'need_based',
    category: 'undergraduate',
    eligibilityDetails: {
      minimumAge: 17,
      maximumAge: 30,
      minimumGPA: 6.5,
      educationLevel: ['diploma', 'undergraduate'],
      fieldOfStudy: ['Engineering', 'Technology', 'Architecture', 'Pharmacy'],
      nationality: ['Indian'],
      gender: 'female',
      familyIncomeLimit: 800000
    },
    deadlines: {
      application: new Date('2025-10-31'),
      decision: new Date('2025-12-31'),
      award: new Date('2026-01-31')
    },
    requirements: [
      'Aadhaar Card',
      'Income Certificate (Family income below ₹8 Lakhs)',
      'Admission proof in AICTE approved institution',
      'Previous semester marksheet',
      'College ID card',
      'Bank account details'
    ],
    benefits: [
      'Tuition fee: ₹30,000 per year',
      'Incidental charges: ₹20,000 per year',
      'Total: ₹50,000 per year',
      'Scholarship for entire duration of course'
    ],
    applicationProcess: 'Apply online through AICTE scholarship portal. Only one girl child per family from 2 children is eligible.',
    contactInfo: {
      email: 'pragati@aicte-india.org',
      phone: '+91-11-2958-1000',
      website: 'https://www.aicte-india.org/schemes/students-development-schemes'
    },
    numberOfAwards: 5000,
    isRecurring: true,
    status: 'active'
  },
  {
    title: 'Dr. Ambedkar Central Sector Scholarship',
    description: 'Merit-based scholarship for SC students who have passed Class 12 from recognized board and pursuing higher education including technical and professional courses.',
    amount: 30000,
    type: 'merit_based',
    category: 'undergraduate',
    eligibilityDetails: {
      minimumAge: 17,
      maximumAge: 35,
      minimumGPA: 6.0,
      educationLevel: ['undergraduate', 'postgraduate'],
      fieldOfStudy: ['Any'],
      nationality: ['Indian'],
      caste: ['SC'],
      familyIncomeLimit: 800000
    },
    deadlines: {
      application: new Date('2025-12-31'),
      decision: new Date('2026-02-15'),
      award: new Date('2026-03-15')
    },
    requirements: [
      'Aadhaar Card',
      'Income Certificate (Family income below ₹8 Lakhs)',
      'Caste Certificate (SC)',
      'Class 12 marksheet with minimum 60% marks',
      'Admission proof from college/university',
      'Bank account details'
    ],
    benefits: [
      'Course fee: ₹20,000 per year or actual (whichever is less)',
      'Maintenance allowance: ₹10,000 per year',
      'Book grant and study material',
      'Scholarship for full course duration'
    ],
    applicationProcess: 'Apply through National Scholarship Portal. Top ranking students based on Class 12 marks are selected. Fresh application each year not required if already selected.',
    contactInfo: {
      email: 'ambedkar-scholarship@socialjustice.gov.in',
      phone: '+91-11-2338-1000',
      website: 'https://scholarships.gov.in'
    },
    numberOfAwards: 3000,
    isRecurring: true,
    status: 'active'
  },
  {
    title: 'Prime Minister\'s Scholarship Scheme (PMSS)',
    description: 'Scholarship for wards/widows of Ex-Servicemen, Ex-Coast Guard personnel and personnel of Para Military Forces. Encourages higher education among children of defence personnel.',
    amount: 30000,
    type: 'merit_based',
    category: 'undergraduate',
    eligibilityDetails: {
      minimumAge: 17,
      maximumAge: 25,
      minimumGPA: 6.0,
      educationLevel: ['undergraduate'],
      fieldOfStudy: ['Any'],
      nationality: ['Indian'],
      specialCategory: 'Defence Personnel Children'
    },
    deadlines: {
      application: new Date('2025-10-31'),
      decision: new Date('2025-12-31'),
      award: new Date('2026-01-31')
    },
    requirements: [
      'Aadhaar Card',
      'Ex-Servicemen/Defence Personnel certificate',
      'Class 12 marksheet with minimum 60% marks',
      'Admission proof from recognized institution',
      'Identity certificate from Record Office',
      'Bank account details'
    ],
    benefits: [
      'Boys: ₹25,000 per year (₹2,500 per month for 10 months)',
      'Girls: ₹30,000 per year (₹3,000 per month for 10 months)',
      'Professional courses get higher amount',
      'Scholarship for entire course duration'
    ],
    applicationProcess: 'Apply online through Kendriya Sainik Board (KSB) portal during application window. Selection based on percentage in Class 12.',
    contactInfo: {
      email: 'ksb@nic.in',
      phone: '+91-11-2671-8154',
      website: 'https://www.ksb.gov.in'
    },
    numberOfAwards: 82000,
    isRecurring: true,
    status: 'active'
  },
  {
    title: 'INSPIRE Scholarship for Higher Education',
    description: 'Innovation in Science Pursuit for Inspired Research (INSPIRE) scholarship for students pursuing Natural and Basic Sciences at Bachelor and Master level.',
    amount: 80000,
    type: 'merit_based',
    category: 'undergraduate',
    eligibilityDetails: {
      minimumAge: 17,
      maximumAge: 27,
      minimumGPA: 6.0,
      educationLevel: ['undergraduate', 'postgraduate'],
      fieldOfStudy: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Natural Sciences'],
      nationality: ['Indian']
    },
    deadlines: {
      application: new Date('2025-09-30'),
      decision: new Date('2025-11-30'),
      award: new Date('2025-12-31')
    },
    requirements: [
      'Aadhaar Card',
      'Class 12 marksheet (Top 1% in Board or state-level exam)',
      'Admission proof in BSc/MSc natural sciences',
      'Declaration for not receiving other scholarship',
      'Bank account details'
    ],
    benefits: [
      'BSc: ₹80,000 per year (₹5,000 per month + ₹20,000 annual grant)',
      'MSc: ₹80,000 per year',
      'Summer research fellowship opportunity',
      'Mentorship from scientists',
      'Research project funding'
    ],
    applicationProcess: 'Students in top 1% in Class 12 board exams or KVPY selected students automatically eligible. Apply through INSPIRE portal.',
    contactInfo: {
      email: 'inspire@online-inspire.gov.in',
      phone: '+91-11-2696-2821',
      website: 'https://www.online-inspire.gov.in'
    },
    numberOfAwards: 10000,
    isRecurring: true,
    status: 'active'
  },
  {
    title: 'Begum Hazrat Mahal National Scholarship',
    description: 'Scholarship for meritorious girl students from minority communities (Muslim, Christian, Sikh, Buddhist, Jain, Parsi) from Class 9 to Post Graduation.',
    amount: 12000,
    type: 'merit_based',
    category: 'high_school',
    eligibilityDetails: {
      minimumAge: 14,
      maximumAge: 30,
      minimumGPA: 5.0,
      educationLevel: ['high_school', 'undergraduate', 'postgraduate'],
      fieldOfStudy: ['Any'],
      nationality: ['Indian'],
      gender: 'female',
      religion: ['Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Parsi'],
      familyIncomeLimit: 200000
    },
    deadlines: {
      application: new Date('2025-11-30'),
      decision: new Date('2026-01-31'),
      award: new Date('2026-02-28')
    },
    requirements: [
      'Aadhaar Card',
      'Income Certificate (Family income below ₹2 Lakhs)',
      'Minority community certificate',
      'Previous year marksheet with minimum 50% marks',
      'School/College admission proof',
      'Bank account details'
    ],
    benefits: [
      'Class 9-10: ₹5,000 per year',
      'Class 11-12: ₹6,000 per year',
      'Graduation: ₹10,000 per year',
      'Post Graduation: ₹12,000 per year'
    ],
    applicationProcess: 'Apply through Ministry of Minority Affairs scholarship portal or state minority welfare department. Merit-based selection.',
    contactInfo: {
      email: 'scholarships@minority.gov.in',
      phone: '+91-11-2338-3891',
      website: 'https://scholarships.gov.in'
    },
    numberOfAwards: 5000,
    isRecurring: true,
    status: 'active'
  },
  {
    title: 'UGC NET JRF Scholarship',
    description: 'Junior Research Fellowship for students who qualify UGC NET exam. Awarded to pursue research in Indian universities and eligible institutions.',
    amount: 372000,
    type: 'merit_based',
    category: 'research',
    eligibilityDetails: {
      minimumAge: 21,
      maximumAge: 32,
      minimumGPA: 6.5,
      educationLevel: ['postgraduate', 'research'],
      fieldOfStudy: ['Any'],
      nationality: ['Indian']
    },
    deadlines: {
      application: new Date('2025-12-31'),
      decision: new Date('2026-03-31'),
      award: new Date('2026-06-01')
    },
    requirements: [
      'UGC NET qualified certificate',
      'Master\'s degree with minimum 55% marks (50% for SC/ST/OBC)',
      'Research proposal',
      'Admission to PhD program in recognized university',
      'No age relaxation beyond 5 years',
      'Bank account details'
    ],
    benefits: [
      'Fellowship: ₹31,000 per month (First 2 years)',
      'Fellowship: ₹35,000 per month (Next 3 years)',
      'Contingency grant: ₹10,000 per year (First 2 years)',
      'Contingency grant: ₹20,500 per year (Next 3 years)',
      'Total duration: 5 years maximum'
    ],
    applicationProcess: 'Qualify UGC NET exam in JRF category. Get admission in PhD program in recognized university/institution. Submit fellowship forms through university.',
    contactInfo: {
      email: 'jrf@ugc.ac.in',
      phone: '+91-11-2323-2693',
      website: 'https://www.ugc.ac.in'
    },
    numberOfAwards: 4000,
    isRecurring: true,
    status: 'active'
  }
];

// Seed Indian Scholarships
const seedIndianScholarships = async () => {
  try {
    // Find an admin user or create one if it doesn't exist
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('⚠️  No admin user found. Creating default admin...');
      adminUser = await User.create({
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@scholarships.gov.in',
        password: 'Admin@123',
        role: 'admin',
        isActive: true
      });
      console.log('✅ Created admin user');
    }

    // Find or create a default organization
    let organization = await Organization.findOne({ name: 'Government of India' });
    
    if (!organization) {
      console.log('⚠️  No organization found. Creating default organization...');
      organization = await Organization.create({
        name: 'Government of India',
        type: 'government',
        description: 'Government of India - National Scholarship Portal',
        contactInfo: {
          email: 'scholarships@gov.in',
          phone: '+91-11-2338-1000',
          website: 'https://scholarships.gov.in'
        },
        address: {
          street: 'Shastri Bhavan',
          city: 'New Delhi',
          state: 'Delhi',
          country: 'India',
          zipCode: '110001'
        },
        createdBy: adminUser._id,
        status: 'active'
      });
      console.log('✅ Created organization');
    }
    
    console.log('\n🌱 Seeding Indian scholarships...\n');

    for (const scholarshipData of indianScholarships) {
      // Transform the amount to match the schema
      const { amount, ...restData } = scholarshipData;
      
      const scholarship = await Scholarship.create({
        ...restData,
        amount: {
          value: amount,
          currency: 'INR',
          type: 'fixed'
        },
        organization: organization._id,
        createdBy: adminUser._id
      });
      
      console.log(`✅ Created: ${scholarship.title} - ₹${scholarship.amount.value.toLocaleString('en-IN')}`);
    }

    console.log(`\n🎉 Successfully seeded ${indianScholarships.length} Indian scholarships!`);
    console.log('💰 All amounts are in Indian Rupees (₹)');
    console.log('🇮🇳 All scholarships are India-focused');
    
  } catch (error) {
    console.error('❌ Error seeding scholarships:', error);
    process.exit(1);
  }
};

// Run the seed script
const run = async () => {
  await connectDB();
  await seedIndianScholarships();
  process.exit(0);
};

run();
