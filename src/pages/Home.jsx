import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Users,
  Search,
  IndianRupee
} from 'lucide-react';

const Home = () => {
  const stats = [
    { label: 'Active Scholarships', value: '50,000+', icon: GraduationCap },
    { label: 'Total Awards', value: '₹2.5L Cr+', icon: IndianRupee },
    { label: 'Students Helped', value: '100,000+', icon: Users },
  ];

  const features = [
    {
      title: 'Smart Search',
      description: 'Find scholarships that match your profile with our advanced filtering system.',
      icon: Search,
    },
    {
      title: 'Easy Application',
      description: 'Apply to multiple scholarships with a single profile and streamlined process.',
      icon: GraduationCap,
    },
    {
      title: 'Track Progress',
      description: 'Monitor your applications and get updates on your scholarship status.',
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Your Perfect
              <span className="block text-yellow-300">Scholarship Match</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Connect with thousands of scholarship opportunities worldwide. 
              Your educational journey starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/scholarships" className="btn-primary bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                Browse Scholarships
              </Link>
              <Link to="/register" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg font-semibold">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <stat.icon className="w-8 h-8 text-primary-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Scholarship?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make finding and applying for scholarships simple, fast, and effective.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Scholarship Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have found their perfect scholarship match.
          </p>
          <Link to="/register" className="btn-primary bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold inline-block">
            Sign Up Now - It's Free!
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Create Profile', description: 'Tell us about your academic background and goals' },
              { step: 2, title: 'Search & Filter', description: 'Find scholarships that match your criteria' },
              { step: 3, title: 'Apply Easily', description: 'Submit applications with our streamlined process' },
              { step: 4, title: 'Track Progress', description: 'Monitor your applications and get updates' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;