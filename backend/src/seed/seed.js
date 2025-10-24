const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Scholarship = require('../models/Scholarship');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const users = [
  {
    name: 'Admin User',
    email: 'admin@buddy4study.com',
    password: 'password123',
    role: 'admin',
    emailVerified: true
  },
  {
    name: 'John Student',
    email: 'student@example.com',
    password: 'password123',
    role: 'student',
    profile: {
      education: {
        currentLevel: 'undergraduate',
        fieldOfStudy: 'Computer Science',
        gpa: 3.8
      }
    },
    emailVerified: true
  }
];

const organizations = [
  {
    name: 'Gates Foundation',
    description: 'The Bill & Melinda Gates Foundation works to help all people lead healthy, productive lives.',
    type: 'foundation',
    website: 'https://www.gatesfoundation.org',
    contact: {
      email: 'contact@gatesfoundation.org'
    },
    establishedYear: 2000,
    tags: ['education', 'health', 'global-development'],
    isVerified: true
  },
  {
    name: 'Google LLC',
    description: 'Google is a multinational technology company specializing in Internet-related services and products.',
    type: 'corporate',
    website: 'https://www.google.com',
    contact: {
      email: 'scholarships@google.com'
    },
    establishedYear: 1998,
    tags: ['technology', 'innovation', 'diversity'],
    isVerified: true
  },
  {
    name: 'National Science Foundation',
    description: 'The National Science Foundation is a United States government agency that supports fundamental research and education.',
    type: 'government',
    website: 'https://www.nsf.gov',
    contact: {
      email: 'info@nsf.gov'
    },
    establishedYear: 1950,
    tags: ['science', 'research', 'education'],
    isVerified: true
  }
];

const scholarships = [
  {
    title: 'Gates Millennium Scholars Program',
    shortDescription: 'Full scholarship program for outstanding minority students to pursue undergraduate and graduate studies.',
    description: 'The Gates Millennium Scholars (GMS) Program, funded by a grant from the Bill & Melinda Gates Foundation, was established in 1999 to provide outstanding African American, American Indian/Alaska Native, Asian Pacific Islander American, and Hispanic American students with an opportunity to complete an undergraduate college education in any discipline area of interest.',
    amount: {
      value: 4200000,
      currency: 'INR',
      type: 'full-tuition'
    },
    eligibility: {
      education: {
        levels: ['undergraduate', 'graduate'],
        minGPA: 3.3
      },
      demographics: {
        nationality: ['US']
      }
    },
    deadlines: {
      application: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      notification: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000)
    },
    categories: ['merit-based', 'minority', 'need-based'],
    tags: ['undergraduate', 'graduate', 'full-ride', 'minority'],
    status: 'active',
    featured: true
  },
  {
    title: 'Google Computer Science Scholarship',
    shortDescription: 'Scholarship for underrepresented groups in computer science.',
    description: 'Through our scholarship programs, we recognize and reward the academic achievements of students pursuing computing and technology.',
    amount: {
      value: 840000,
      currency: 'INR',
      type: 'fixed'
    },
    eligibility: {
      education: {
        levels: ['undergraduate', 'graduate'],
        fieldsOfStudy: ['Computer Science', 'Software Engineering', 'Information Technology'],
        minGPA: 3.0
      },
      demographics: {
        nationality: ['US', 'Canada']
      }
    },
    deadlines: {
      application: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      notification: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000)
    },
    categories: ['merit-based', 'stem', 'minority'],
    tags: ['computer-science', 'technology', 'diversity'],
    status: 'active'
  },
  {
    title: 'NSF Graduate Research Fellowship',
    shortDescription: 'Prestigious fellowship for graduate students in STEM fields.',
    description: 'The NSF Graduate Research Fellowship Program (GRFP) helps ensure the vitality of the human resource base of science and engineering in the United States.',
    amount: {
      value: 3108000,
      currency: 'INR',
      type: 'fixed'
    },
    eligibility: {
      education: {
        levels: ['graduate'],
        fieldsOfStudy: ['Science', 'Technology', 'Engineering', 'Mathematics'],
        minGPA: 3.5
      },
      demographics: {
        nationality: ['US']
      }
    },
    deadlines: {
      application: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
      notification: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
    },
    categories: ['merit-based', 'stem', 'research'],
    tags: ['graduate', 'research', 'fellowship', 'stem'],
    status: 'active',
    featured: true
  }
];

const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Organization.deleteMany({});
    await Scholarship.deleteMany({});

    console.log('📊 Data Destroyed...');

    // Create admin user first
    const createdUsers = await User.create(users);
    console.log('👤 Users Imported...');

    const adminUser = createdUsers.find(user => user.role === 'admin');

    // Create organizations
    const organizationsWithCreator = organizations.map(org => ({
      ...org,
      createdBy: adminUser._id
    }));

    const createdOrgs = await Organization.create(organizationsWithCreator);
    console.log('🏢 Organizations Imported...');

    // Create scholarships
    const scholarshipsWithDetails = scholarships.map((scholarship, index) => ({
      ...scholarship,
      organization: createdOrgs[index]._id,
      createdBy: adminUser._id,
      lastUpdatedBy: adminUser._id
    }));

    const createdScholarships = await Scholarship.create(scholarshipsWithDetails);
    console.log('🎓 Scholarships Imported...');

    // Update organizations with their scholarships
    for (let i = 0; i < createdOrgs.length; i++) {
      await Organization.findByIdAndUpdate(createdOrgs[i]._id, {
        $push: { scholarships: createdScholarships[i]._id }
      });
    }

    console.log('✅ Data Imported Successfully!');
    console.log('\n📋 Sample Users:');
    console.log('Admin: admin@buddy4study.com / password123');
    console.log('Student: student@example.com / password123');
    
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();

    await User.deleteMany({});
    await Organization.deleteMany({});
    await Scholarship.deleteMany({});

    console.log('💥 Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}