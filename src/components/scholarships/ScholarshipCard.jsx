import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Calendar, 
  IndianRupee,
  Building 
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useScholarshipStore } from '../../stores/scholarshipStore';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const ScholarshipCard = ({ scholarship }) => {
  const { isAuthenticated } = useAuthStore();
  const { saveScholarship, unsaveScholarship } = useScholarshipStore();

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to save scholarships');
      return;
    }

    try {
      if (scholarship.isSaved) {
        await unsaveScholarship(scholarship._id);
        toast.success('Scholarship removed from saved list');
      } else {
        await saveScholarship(scholarship._id);
        toast.success('Scholarship saved successfully');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatAmount = (amount) => {
    if (amount.value >= 1000000) {
      return `${(amount.value / 1000000).toFixed(1)}M`;
    } else if (amount.value >= 1000) {
      return `${(amount.value / 1000).toFixed(0)}K`;
    } else {
      return `${amount.value.toLocaleString()}`;
    }
  };

  const getDaysUntilDeadline = () => {
    const deadline = new Date(scholarship.deadlines.application);
    const now = new Date();
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilDeadline();
  const isFull = scholarship.maxApplications && scholarship.applicationCount >= scholarship.maxApplications;
  const isNearlyFull = scholarship.maxApplications && (scholarship.applicationCount / scholarship.maxApplications) >= 0.8;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="p-6">
        {/* Header with save button */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            {scholarship.featured && (
              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full mb-2 mr-2">
                Featured
              </span>
            )}
            {isFull && (
              <span className="inline-block bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full mb-2">
                Applications Full
              </span>
            )}
            {!isFull && isNearlyFull && (
              <span className="inline-block bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full mb-2">
                Filling Fast
              </span>
            )}
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {scholarship.title}
            </h3>
          </div>
          
          {isAuthenticated && (
            <button
              onClick={handleSaveToggle}
              className="text-gray-400 hover:text-red-500 transition-colors ml-2"
            >
              {scholarship.isSaved ? (
                <Heart className="h-6 w-6 text-red-500 fill-current" />
              ) : (
                <Heart className="h-6 w-6" />
              )}
            </button>
          )}
        </div>

        {/* Organization */}
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <Building className="h-4 w-4 mr-2" />
          <span>{scholarship.organization?.name}</span>
        </div>

        {/* Short Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {scholarship.shortDescription || scholarship.description}
        </p>

        {/* Amount */}
        <div className="flex items-center text-lg font-semibold text-green-600 mb-3">
          <IndianRupee className="h-5 w-5 mr-1" />
          <span>{formatAmount(scholarship.amount)}</span>
          {scholarship.amount.type === 'full-tuition' && (
            <span className="text-sm text-gray-600 ml-2">(Full Tuition)</span>
          )}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1 mb-4">
          {scholarship.categories?.slice(0, 3).map((category, index) => (
            <span
              key={index}
              className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
            >
              {category.replace('-', ' ')}
            </span>
          ))}
          {scholarship.categories?.length > 3 && (
            <span className="text-xs text-gray-500">
              +{scholarship.categories.length - 3} more
            </span>
          )}
        </div>

        {/* Deadline */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              Due: {format(new Date(scholarship.deadlines.application), 'MMM dd, yyyy')}
            </span>
          </div>
          <div className={`font-medium ${
            daysLeft <= 7 ? 'text-red-600' : 
            daysLeft <= 30 ? 'text-orange-600' : 'text-green-600'
          }`}>
            {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t">
        <Link
          to={`/scholarships/${scholarship._id}`}
          className="btn-primary w-full text-center"
          onClick={() => {
            console.log('Scholarship card clicked:', scholarship._id);
            console.log('Navigating to:', `/scholarships/${scholarship._id}`);
          }}
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ScholarshipCard;