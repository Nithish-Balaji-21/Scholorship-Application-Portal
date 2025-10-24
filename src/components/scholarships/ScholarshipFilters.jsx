import React, { useEffect } from 'react';
import { useScholarshipStore } from '../../stores/scholarshipStore';

const ScholarshipFilters = ({ onFilterChange, searchFilters }) => {
  const { filters, fetchFilters } = useScholarshipStore();

  useEffect(() => {
    if (!filters.categories.length) {
      fetchFilters();
    }
  }, []);

  const handleCategoryChange = (category) => {
    const updatedCategories = searchFilters.categories.includes(category)
      ? searchFilters.categories.filter(c => c !== category)
      : [...searchFilters.categories, category];
    
    onFilterChange({ categories: updatedCategories });
  };

  const handleEducationLevelChange = (level) => {
    const updatedLevels = searchFilters.educationLevel.includes(level)
      ? searchFilters.educationLevel.filter(l => l !== level)
      : [...searchFilters.educationLevel, level];
    
    onFilterChange({ educationLevel: updatedLevels });
  };

  const handleOrganizationChange = (orgId) => {
    onFilterChange({ organization: orgId });
  };

  const handleAmountChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      categories: [],
      tags: [],
      organization: '',
      minAmount: '',
      maxAmount: '',
      educationLevel: [],
    });
  };

  const educationLevels = [
    { value: 'high-school', label: 'High School' },
    { value: 'undergraduate', label: 'Undergraduate' },
    { value: 'graduate', label: 'Graduate' },
    { value: 'postgraduate', label: 'Postgraduate' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        {/* Amount Range */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Award Amount
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                placeholder="Min (₹)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={searchFilters.minAmount}
                onChange={(e) => handleAmountChange('minAmount', e.target.value)}
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max (₹)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={searchFilters.maxAmount}
                onChange={(e) => handleAmountChange('maxAmount', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Education Level */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Education Level
          </label>
          <div className="space-y-2">
            {educationLevels.map((level) => (
              <label key={level.value} className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={searchFilters.educationLevel.includes(level.value)}
                  onChange={() => handleEducationLevelChange(level.value)}
                />
                <span className="ml-3 text-sm text-gray-700">{level.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Categories
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filters.categories.map((category) => (
              <label key={category} className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={searchFilters.categories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                />
                <span className="ml-3 text-sm text-gray-700 capitalize">
                  {category.replace('-', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Organization */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Organization
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={searchFilters.organization}
            onChange={(e) => handleOrganizationChange(e.target.value)}
          >
            <option value="">All Organizations</option>
            {filters.organizations.map((org) => (
              <option key={org._id} value={org._id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>

        {/* Popular Tags */}
        {filters.tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Popular Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {filters.tags.slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  className={`px-3 py-1 text-xs rounded-full border ${
                    searchFilters.tags.includes(tag)
                      ? 'bg-primary-100 border-primary-300 text-primary-800'
                      : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => {
                    const updatedTags = searchFilters.tags.includes(tag)
                      ? searchFilters.tags.filter(t => t !== tag)
                      : [...searchFilters.tags, tag];
                    onFilterChange({ tags: updatedTags });
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScholarshipFilters;