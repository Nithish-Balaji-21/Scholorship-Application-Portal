# 🎓 Comprehensive Scholarship Application System

A modern, full-stack scholarship management platform built with React, Node.js, and MongoDB. This system provides a complete solution for managing scholarship programs, processing applications, and facilitating the review process with a professional multi-step application wizard.

## 🌟 Key Features

### 🎯 Multi-Step Application Process
- **6-Step Professional Wizard**: Personal Info → Academic Info → Financial Info → Documents → Essays → Review
- **Progress Tracking**: Visual completion percentage and step indicators
- **Auto-Save**: Automatic form data preservation to prevent data loss
- **Form Validation**: Real-time validation with helpful error messages

### 📋 Comprehensive Data Collection
- **Personal Information**: Identity verification, contact details, demographics
- **Academic Background**: Education history, current studies, achievements
- **Financial Assessment**: Family income, household details, bank information
- **Document Management**: Secure file upload with type validation
- **Essays & SOP**: Statement of Purpose, career goals, personal narratives

### 👨‍💼 Admin Dashboard & Review System
- **Application Management**: View, filter, search all applications
- **Review Workflow**: Approve, reject, or waitlist with detailed notes
- **Statistics Dashboard**: Real-time analytics and completion tracking
- **Bulk Operations**: Mass review and status updates
- **Export Functionality**: CSV export for reporting

### 📧 Automated Email System
- **Application Confirmation**: Professional submission confirmations
- **Status Updates**: Automated approval/rejection notifications
- **Welcome Emails**: New user onboarding
- **Beautiful Templates**: Responsive, branded email designs

### 🔒 Security & Authentication
- **JWT-based Authentication**: Secure token management
- **Role-based Access Control**: Student, admin, organization roles
- **File Security**: Validated uploads with secure storage
- **Password Protection**: bcrypt hashing with salt rounds
- Track application status
- Dashboard with personalized recommendations

### For Organizations
- Post and manage scholarships
- Review applications
- Manage organization profile
- Analytics and reporting

### For Administrators
- Complete platform management
- User and organization oversight
- Scholarship moderation
- System analytics

## Tech Stack

### Frontend
- **React 19.1.1** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router 6** - Routing
- **Zustand** - State management
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads
- **AWS S3** - File storage (optional)

## Project Structure

```
buddy4study-clone/
├── backend/                 # Backend API
│   ├── config/             # Database and app configuration
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   └── server.js          # Entry point
├── src/                   # Frontend React app
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── stores/           # Zustand stores
│   ├── utils/            # Utility functions
│   └── App.jsx           # Main app component
├── public/               # Static assets
└── README.md            # This file
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud)
- AWS S3 account (optional, for file uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd buddy4study-clone
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Set up environment variables**
   
   **Frontend (.env):**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```
   
   **Backend (backend/.env):**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

5. **Start MongoDB**
   - Local: Start your MongoDB service
   - Cloud: Ensure your MongoDB Atlas cluster is running

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on http://localhost:5000

2. **Start the frontend development server**
   ```bash
   npm run dev
   ```
   App will run on http://localhost:5173

## Environment Variables

### Frontend (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version

### Backend (backend/.env)
- `PORT` - Server port
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRE` - JWT expiration time
- `AWS_ACCESS_KEY_ID` - AWS access key (optional)
- `AWS_SECRET_ACCESS_KEY` - AWS secret key (optional)
- `AWS_REGION` - AWS region (optional)
- `AWS_BUCKET_NAME` - S3 bucket name (optional)
- `EMAIL_HOST` - SMTP host (optional)
- `EMAIL_PORT` - SMTP port (optional)
- `EMAIL_USER` - SMTP username (optional)
- `EMAIL_PASS` - SMTP password (optional)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Scholarships
- `GET /api/scholarships` - Get all scholarships (with pagination and filters)
- `GET /api/scholarships/:id` - Get single scholarship
- `POST /api/scholarships` - Create scholarship (admin/organization)
- `PUT /api/scholarships/:id` - Update scholarship
- `DELETE /api/scholarships/:id` - Delete scholarship

### Applications
- `GET /api/applications` - Get user's applications
- `POST /api/applications` - Apply for scholarship
- `PUT /api/applications/:id` - Update application status
- `DELETE /api/applications/:id` - Withdraw application

### Organizations
- `GET /api/organizations` - Get all organizations
- `GET /api/organizations/:id` - Get single organization
- `POST /api/organizations` - Create organization (admin)
- `PUT /api/organizations/:id` - Update organization

## Database Schema

### User Model
- Personal information
- Authentication credentials
- Role-based access (student/admin)
- Profile details and preferences

### Scholarship Model
- Comprehensive scholarship details
- Eligibility criteria
- Application requirements
- Status and timeline management

### Application Model
- User-scholarship relationship
- Application status tracking
- Document uploads
- Review and feedback system

### Organization Model
- Organization profile
- Contact information
- Verification status
- Associated scholarships

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@buddy4study.com or create an issue in the repository.

## Acknowledgments

- Inspired by Buddy4Study platform
- Built with modern web technologies
- Designed for scalability and maintainability+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
