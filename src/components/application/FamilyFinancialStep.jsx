import React from 'react';
import { IndianRupee, Users, Building2, CreditCard } from 'lucide-react';

// Family & Financial Information Step Component
export const FamilyFinancialStep = ({ data = {}, onChange }) => {
  // Ensure all nested objects have default values
  const father = data.father || { name: '', occupation: '', income: '', employer: '', phoneNumber: '' };
  const mother = data.mother || { name: '', occupation: '', income: '', employer: '', phoneNumber: '' };
  const bankDetails = data.bankDetails || { accountHolderName: '', accountNumber: '', ifscCode: '', bankName: '', branchName: '' };
  
  return (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-6 flex items-center">
      <IndianRupee className="h-6 w-6 mr-2 text-blue-600" />
      Family & Financial Information
    </h2>
    
    {/* Father's Information */}
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Users className="h-5 w-5 mr-2" />
        Father's Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Father's Name *
          </label>
          <input
            type="text"
            value={father.name || ''}
            onChange={(e) => onChange('father', e.target.value, 'name')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter father's full name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Occupation *
          </label>
          <input
            type="text"
            value={father.occupation || ''}
            onChange={(e) => onChange('father', e.target.value, 'occupation')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Teacher, Farmer, Engineer"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Annual Income (₹) *
          </label>
          <input
            type="number"
            value={father.income || ''}
            onChange={(e) => onChange('father', e.target.value, 'income')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="300000"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employer/Organization
          </label>
          <input
            type="text"
            value={father.employer || ''}
            onChange={(e) => onChange('father', e.target.value, 'employer')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Company/Organization name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={father.phoneNumber || ''}
            onChange={(e) => onChange('father', e.target.value, 'phoneNumber')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+91 XXXXX XXXXX"
          />
        </div>
      </div>
    </div>
    
    {/* Mother's Information */}
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Users className="h-5 w-5 mr-2" />
        Mother's Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mother's Name *
          </label>
          <input
            type="text"
            value={mother.name || ''}
            onChange={(e) => onChange('mother', e.target.value, 'name')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter mother's full name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Occupation
          </label>
          <input
            type="text"
            value={mother.occupation || ''}
            onChange={(e) => onChange('mother', e.target.value, 'occupation')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Housewife, Teacher, Nurse"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Annual Income (₹)
          </label>
          <input
            type="number"
            value={mother.income || ''}
            onChange={(e) => onChange('mother', e.target.value, 'income')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="150000"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employer/Organization
          </label>
          <input
            type="text"
            value={mother.employer || ''}
            onChange={(e) => onChange('mother', e.target.value, 'employer')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Company/Organization name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={mother.phoneNumber || ''}
            onChange={(e) => onChange('mother', e.target.value, 'phoneNumber')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+91 XXXXX XXXXX"
          />
        </div>
      </div>
    </div>
    
    {/* Overall Financial Information */}
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Overall Financial Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Family Income (₹/year) *
          </label>
          <input
            type="number"
            value={data.totalFamilyIncome || ''}
            onChange={(e) => onChange('totalFamilyIncome', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="450000"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Household Size (Total family members) *
          </label>
          <input
            type="number"
            value={data.householdSize || ''}
            onChange={(e) => onChange('householdSize', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
            placeholder="4"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Income Category *
          </label>
          <select
            value={data.incomeCategory || ''}
            onChange={(e) => onChange('incomeCategory', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Category</option>
            <option value="BPL">BPL (Below Poverty Line)</option>
            <option value="EWS">EWS (Economically Weaker Section)</option>
            <option value="General">General</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
    
    {/* Bank Details */}
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <CreditCard className="h-5 w-5 mr-2" />
        Bank Account Details
      </h3>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-800">
          <strong>Important:</strong> Bank account must be in the applicant's name. 
          Joint accounts are not accepted for scholarship disbursement.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Holder Name *
          </label>
          <input
            type="text"
            value={bankDetails.accountHolderName || ''}
            onChange={(e) => onChange('bankDetails', e.target.value, 'accountHolderName')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="As per bank records"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Number *
          </label>
          <input
            type="text"
            value={bankDetails.accountNumber || ''}
            onChange={(e) => onChange('bankDetails', e.target.value, 'accountNumber')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="XXXXXXXXXXXXXXXXX"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            IFSC Code *
          </label>
          <input
            type="text"
            value={bankDetails.ifscCode || ''}
            onChange={(e) => onChange('bankDetails', e.target.value, 'ifscCode')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="SBIN0001234"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bank Name *
          </label>
          <input
            type="text"
            value={bankDetails.bankName || ''}
            onChange={(e) => onChange('bankDetails', e.target.value, 'bankName')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., State Bank of India"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Branch Name
          </label>
          <input
            type="text"
            value={bankDetails.branchName || ''}
            onChange={(e) => onChange('bankDetails', e.target.value, 'branchName')}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Branch location"
          />
        </div>
      </div>
    </div>
  </div>
  );
};