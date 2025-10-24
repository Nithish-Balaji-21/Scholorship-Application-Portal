import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const ScholarshipEditModal = ({ scholarship, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: {
      value: '',
      currency: 'INR',
      type: 'one-time'
    },
    status: 'active',
    educationLevel: [],
    maxApplications: 50,
    deadlines: {
      application: '',
      decision: '',
      acceptance: ''
    },
    eligibility: {
      criteria: [],
      minimumGPA: ''
    },
    requirements: {
      documents: [],
      essays: []
    },
    contactInfo: {
      email: '',
      phone: '',
      website: ''
    }
  });

  const [newCriterion, setNewCriterion] = useState('');
  const [newDocument, setNewDocument] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (scholarship) {
      setFormData({
        title: scholarship.title || '',
        description: scholarship.description || '',
        amount: {
          value: scholarship.amount?.value || '',
          currency: scholarship.amount?.currency || 'INR',
          type: scholarship.amount?.type || 'one-time'
        },
        status: scholarship.status || 'active',
        educationLevel: scholarship.educationLevel || [],
        maxApplications: scholarship.maxApplications || 50,
        deadlines: {
          application: scholarship.deadlines?.application ? new Date(scholarship.deadlines.application).toISOString().split('T')[0] : '',
          decision: scholarship.deadlines?.decision ? new Date(scholarship.deadlines.decision).toISOString().split('T')[0] : '',
          acceptance: scholarship.deadlines?.acceptance ? new Date(scholarship.deadlines.acceptance).toISOString().split('T')[0] : ''
        },
        eligibility: {
          criteria: scholarship.eligibility?.criteria || [],
          minimumGPA: scholarship.eligibility?.minimumGPA || ''
        },
        requirements: {
          documents: scholarship.requirements?.documents || [],
          essays: scholarship.requirements?.essays || []
        },
        contactInfo: {
          email: scholarship.contactInfo?.email || '',
          phone: scholarship.contactInfo?.phone || '',
          website: scholarship.contactInfo?.website || ''
        }
      });
    }
  }, [scholarship]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEducationLevelChange = (level) => {
    setFormData(prev => ({
      ...prev,
      educationLevel: prev.educationLevel.includes(level)
        ? prev.educationLevel.filter(l => l !== level)
        : [...prev.educationLevel, level]
    }));
  };

  const addCriterion = () => {
    if (newCriterion.trim()) {
      setFormData(prev => ({
        ...prev,
        eligibility: {
          ...prev.eligibility,
          criteria: [...prev.eligibility.criteria, newCriterion.trim()]
        }
      }));
      setNewCriterion('');
    }
  };

  const removeCriterion = (index) => {
    setFormData(prev => ({
      ...prev,
      eligibility: {
        ...prev.eligibility,
        criteria: prev.eligibility.criteria.filter((_, i) => i !== index)
      }
    }));
  };

  const addDocument = () => {
    if (newDocument.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          documents: [...prev.requirements.documents, newDocument.trim()]
        }
      }));
      setNewDocument('');
    }
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        documents: prev.requirements.documents.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!scholarship || !scholarship._id) {
      toast.error('Invalid scholarship data');
      console.error('Scholarship object:', scholarship);
      return;
    }
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.amount.value || formData.amount.value <= 0) {
      toast.error('Valid amount is required');
      return;
    }
    if (!formData.deadlines.application) {
      toast.error('Application deadline is required');
      return;
    }

    const loadingToast = toast.loading('Saving scholarship changes...');
    setLoading(true);
    
    try {
      await onSave(scholarship._id, formData);
      toast.success('Scholarship updated successfully! Changes are visible in the background.', { 
        id: loadingToast,
        duration: 3000 
      });
      // Close modal so user can see the changes
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to update scholarship', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const educationLevels = ['undergraduate', 'postgraduate', 'doctorate', 'high-school'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Edit Scholarship</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="amount.value"
                  value={formData.amount.value}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  name="amount.type"
                  value={formData.amount.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="one-time">One-time</option>
                  <option value="annual">Annual</option>
                  <option value="semester">Semester</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Applications
              </label>
              <input
                type="number"
                name="maxApplications"
                value={formData.maxApplications}
                onChange={handleChange}
                min="1"
                placeholder="Leave empty for unlimited"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Default: 50 applications</p>
            </div>
          </div>

          {/* Deadlines */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Deadlines</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="deadlines.application"
                  value={formData.deadlines.application}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Decision Date
                </label>
                <input
                  type="date"
                  name="deadlines.decision"
                  value={formData.deadlines.decision}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Acceptance Deadline
                </label>
                <input
                  type="date"
                  name="deadlines.acceptance"
                  value={formData.deadlines.acceptance}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Education Level */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Education Level</h3>
            
            <div className="flex flex-wrap gap-3">
              {educationLevels.map(level => (
                <label key={level} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.educationLevel.includes(level)}
                    onChange={() => handleEducationLevelChange(level)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm capitalize">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Eligibility Criteria</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum GPA
              </label>
              <input
                type="number"
                name="eligibility.minimumGPA"
                value={formData.eligibility.minimumGPA}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Criteria
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newCriterion}
                  onChange={(e) => setNewCriterion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCriterion())}
                  placeholder="Add eligibility criterion"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addCriterion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-2">
                {formData.eligibility.criteria.map((criterion, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                    <span className="flex-1 text-sm">{criterion}</span>
                    <button
                      type="button"
                      onClick={() => removeCriterion(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Required Documents */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Required Documents</h3>
            
            <div>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newDocument}
                  onChange={(e) => setNewDocument(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDocument())}
                  placeholder="Add required document"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addDocument}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-2">
                {formData.requirements.documents.map((doc, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                    <span className="flex-1 text-sm">{doc}</span>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="contactInfo.email"
                  value={formData.contactInfo.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="contactInfo.phone"
                  value={formData.contactInfo.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="contactInfo.website"
                  value={formData.contactInfo.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScholarshipEditModal;
