// Test/Demo Data for Application Forms
// Use this to quickly fill forms during testing

export const demoPersonalInfo = {
  fullName: "Rajesh Kumar",
  email: "rajesh.kumar@test.com",
  phone: "+91-9876543210",
  dateOfBirth: "2002-05-15",
  gender: "male",
  address: {
    street: "123 MG Road",
    city: "Mumbai",
    state: "Maharashtra",
    zipCode: "400001",
    country: "India"
  },
  nationality: "Indian",
  aadhaarNumber: "1234-5678-9012"
};

export const demoAcademicInfo = {
  currentEducationLevel: "undergraduate",
  currentCourse: "B.Tech Computer Science",
  institution: {
    name: "Mumbai University",
    address: "Vidyanagari, Mumbai, Maharashtra 400098",
    website: "https://mu.ac.in"
  },
  enrollmentNumber: "MU2023CS12345",
  fieldOfStudy: "Computer Science and Engineering",
  currentGPA: {
    value: "8.5",
    scale: "10.0"
  },
  currentSemester: "4",
  expectedGraduation: "2026-05-30",
  yearOfStudy: "2nd Year",
  gpa: "8.5",
  expectedGraduationDate: "2026-05-30",
  course: "B.Tech Computer Science",
  institutionName: "Mumbai University",
  previousEducation: [
    {
      level: "12th",
      board: "Maharashtra State Board",
      institution: "St. Xavier's High School",
      passingYear: "2020",
      percentage: "92",
      grade: "A+",
      degree: "12th Grade",
      field: "Science (PCM)",
      startDate: "2018-06-01",
      endDate: "2020-03-31",
      gpa: "9.2"
    },
    {
      level: "10th",
      board: "Maharashtra State Board",
      institution: "St. Xavier's High School",
      passingYear: "2018",
      percentage: "90",
      grade: "A+",
      degree: "10th Grade",
      field: "General",
      startDate: "2016-06-01",
      endDate: "2018-03-31",
      gpa: "9.0"
    }
  ],
  achievements: [
    "Winner - State Level Coding Competition 2023",
    "Best Student Award 2022",
    "National Science Olympiad - Silver Medal"
  ],
  extracurricularActivities: [
    "Member of College Coding Club",
    "Volunteer at NGO for Teaching Underprivileged Children",
    "College Football Team Captain"
  ]
};

export const demoFamilyFinancialInfo = {
  father: {
    name: "Suresh Kumar",
    occupation: "Farmer",
    income: "150000",
    employer: "Self-Employed (Agriculture)",
    phoneNumber: "+91-9876543210"
  },
  mother: {
    name: "Sunita Kumar",
    occupation: "Homemaker",
    income: "0",
    employer: "N/A",
    phoneNumber: "+91-9876543211"
  },
  totalFamilyIncome: "200000",
  householdSize: "5",
  numberOfDependents: "4",
  incomeCategory: "below_2_lakhs",
  bankDetails: {
    accountHolderName: "Rahul Kumar",
    accountNumber: "1234567890123456",
    ifscCode: "SBIN0001234",
    bankName: "State Bank of India",
    branchName: "Mumbai Main Branch"
  },
  financialNeed: "Our family relies primarily on agricultural income which varies with seasons. My father's farming income is unpredictable due to weather conditions. I have two younger siblings who are also studying. This scholarship would greatly help me continue my education without financial burden on my family.",
  specialCircumstances: "Single income family with agricultural background",
  additionalFinancialInfo: "Father's farming income varies seasonally. Need scholarship support to continue education.",
  // Legacy fields for backward compatibility
  fatherName: "Suresh Kumar",
  fatherOccupation: "Farmer",
  fatherIncome: "150000",
  motherName: "Sunita Kumar",
  motherOccupation: "Homemaker",
  motherIncome: "0",
  guardianName: "",
  guardianRelation: "",
  familySize: "5",
  annualIncome: "200000"
};

export const demoEssays = {
  personalStatement: "I am a passionate computer science student from a rural background. Technology has always fascinated me, and I believe it has the power to transform lives. Coming from a farming family, I have witnessed firsthand the challenges faced by rural communities. My dream is to use my technical skills to develop solutions that can help farmers and rural populations improve their livelihoods. This scholarship would enable me to pursue my education without financial constraints and allow me to focus on my studies and research.",
  
  whyDeserveScholarship: "I deserve this scholarship because of my strong academic record, dedication to learning, and commitment to using technology for social good. Despite financial challenges, I have maintained excellent grades and actively participated in coding competitions and community service. I come from a modest background where my father's farming income barely covers our family's basic needs. This scholarship would not only support my education but also enable me to continue contributing to society through my technical skills. I am determined to break the cycle of poverty in my family through education and hard work.",
  
  careerGoals: "My primary career goal is to become a skilled software engineer specializing in agricultural technology. I want to develop mobile applications and IoT solutions that can help farmers increase their productivity, get better market prices, and access modern farming techniques. In the short term, I aim to secure internships at leading tech companies to gain practical experience. Long term, I plan to either work with agri-tech companies or start my own venture focused on solving rural India's challenges through technology. I also want to mentor students from rural backgrounds and help them pursue careers in technology.",
  
  challenges: "Growing up in a rural area with limited access to quality education and technology was my biggest challenge. Our village had frequent power cuts, poor internet connectivity, and no computer labs. I had to travel 20 km daily to attend a decent school. Despite these obstacles, I remained focused on my studies. I taught myself programming using free online resources whenever internet was available. Financial constraints meant I couldn't afford coaching classes or study materials that my peers had. However, these challenges made me more determined and resourceful. I learned to make the most of limited resources and developed strong self-learning abilities.",
  
  additionalInfo: "I am also actively involved in community service. I volunteer at a local NGO where I teach basic computer skills to underprivileged children on weekends. I have organized coding workshops in my village to encourage students to explore technology. I am proficient in multiple programming languages including Java, Python, and JavaScript. In my free time, I work on open-source projects and contribute to tech communities online. I am also the founder of our college's Coding Club where we organize hackathons and coding competitions.",
  
  statementOfPurpose: "I am passionate about leveraging technology to solve real-world problems, especially those affecting rural communities. This scholarship will help me achieve my educational goals without financial burden.",
  
  hobbies: "Coding, Reading Tech Blogs, Playing Football, Teaching"
};

export const demoDocuments = {
  // Note: In real testing, you'll need to upload actual files
  // These are just placeholder references
  marksheets: [
    { filename: "10th_marksheet.pdf", url: "/uploads/demo/10th_marksheet.pdf", uploadedAt: new Date() },
    { filename: "12th_marksheet.pdf", url: "/uploads/demo/12th_marksheet.pdf", uploadedAt: new Date() }
  ],
  incomeCertificate: { filename: "income_certificate.pdf", url: "/uploads/demo/income_cert.pdf", uploadedAt: new Date() },
  idProof: { filename: "aadhaar_card.pdf", url: "/uploads/demo/aadhaar.pdf", uploadedAt: new Date() },
  photograph: { filename: "photo.jpg", url: "/uploads/demo/photo.jpg", uploadedAt: new Date() }
};

// Complete demo application data
export const demoApplicationData = {
  personalInfo: demoPersonalInfo,
  academicInfo: demoAcademicInfo,
  familyFinancialInfo: demoFamilyFinancialInfo,
  essays: demoEssays,
  // documents: demoDocuments // Documents need actual file upload
};

// Function to prefill form with demo data
export const prefillFormWithDemoData = (setFormData) => {
  setFormData(prevData => ({
    ...prevData,
    ...demoApplicationData
  }));
  
  console.log('✅ Form pre-filled with demo data!');
  return true;
};

// Minimal data to test submission (60% completion requirement)
export const minimalTestData = {
  personalInfo: {
    fullName: "Test Student",
    email: "test@example.com",
    phone: "+91-9999999999"
  },
  academicInfo: {
    institutionName: "Test University",
    course: "B.Tech"
  },
  familyFinancialInfo: {
    totalFamilyIncome: "100000"
  },
  essays: {
    personalStatement: "This is a test application."
  },
  documents: {}
};

export default {
  demoPersonalInfo,
  demoAcademicInfo,
  demoFamilyFinancialInfo,
  demoEssays,
  demoDocuments,
  demoApplicationData,
  minimalTestData,
  prefillFormWithDemoData
};
