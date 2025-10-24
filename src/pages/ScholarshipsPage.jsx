import React, { useState, useEffect } from 'react';
import { useScholarshipStore } from '../stores/scholarshipStore';
import { Search, Filter } from 'lucide-react';
import ScholarshipCard from '../components/scholarships/ScholarshipCard';
import ScholarshipFilters from '../components/scholarships/ScholarshipFilters';
import Pagination from '../components/common/Pagination';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ScholarshipsPage = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    scholarships,
    isLoading,
    pagination,
    searchFilters,
    fetchScholarships,
    fetchFilters,
    updateSearchFilters,
  } = useScholarshipStore();

  useEffect(() => {
    fetchFilters();
    handleSearch();
  }, []);

  const handleSearch = () => {
    const params = {
      ...searchFilters,
      search: searchTerm,
      page: 1,
    };
    fetchScholarships(params);
  };

  const handleFilterChange = (newFilters) => {
    updateSearchFilters(newFilters);
    const params = {
      ...searchFilters,
      ...newFilters,
      search: searchTerm,
      page: 1,
    };
    fetchScholarships(params);
  };

  const handlePageChange = (page) => {
    const params = {
      ...searchFilters,
      search: searchTerm,
      page,
    };
    fetchScholarships(params);
  };

  const handleSortChange = (sort) => {
    handleFilterChange({ sort });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Find Your Perfect Scholarship
          </h1>
          <p className="text-lg text-gray-600">
            Discover thousands of scholarship opportunities tailored to your profile
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search scholarships by title, organization, or keywords..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              className="btn-primary px-6 py-3"
            >
              Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline px-6 py-3 flex items-center gap-2"
            >
              <Filter className="h-5 w-5" />
              Filters
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <ScholarshipFilters
              onFilterChange={handleFilterChange}
              searchFilters={searchFilters}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div className="mb-4 sm:mb-0">
                <p className="text-gray-600">
                  {isLoading ? 'Searching...' : `${pagination.totalCount} scholarships found`}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm text-gray-600">
                  Sort by:
                </label>
                <select
                  id="sort"
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={searchFilters.sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="featured">Featured</option>
                  <option value="deadline">Deadline</option>
                  <option value="amount-high">Amount (High to Low)</option>
                  <option value="amount-low">Amount (Low to High)</option>
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {/* Scholarships Grid */}
            {!isLoading && scholarships.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {scholarships.map((scholarship) => (
                    <ScholarshipCard key={scholarship._id} scholarship={scholarship} />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}

            {/* No Results */}
            {!isLoading && scholarships.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg p-8 shadow-sm">
                  <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No scholarships found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or filters to find more results.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      updateSearchFilters({
                        search: '',
                        categories: [],
                        tags: [],
                        organization: '',
                        minAmount: '',
                        maxAmount: '',
                        educationLevel: [],
                        sort: 'featured',
                      });
                      handleSearch();
                    }}
                    className="btn-primary"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipsPage;