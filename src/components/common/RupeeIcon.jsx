import React from 'react';
import { IndianRupee } from 'lucide-react';

/**
 * Reusable Rupee Icon Component
 * 
 * Usage Examples:
 * <RupeeIcon />                           // Default size (16px)
 * <RupeeIcon size={20} />                 // Custom size
 * <RupeeIcon className="text-green-600" />  // Custom styling
 * <RupeeIcon size={24} className="text-primary-600" />
 */

const RupeeIcon = ({ size = 16, className = '', ...props }) => {
  return (
    <IndianRupee 
      size={size} 
      className={`inline-block ${className}`}
      {...props}
    />
  );
};

export default RupeeIcon;

/**
 * Utility function to format currency with Rupee symbol
 * 
 * Usage:
 * import { formatRupees } from './RupeeIcon';
 * formatRupees(50000) => "₹50,000"
 * formatRupees(50000, true) => "₹50,000 (with icon)"
 */
export const formatRupees = (amount, showIcon = false) => {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
  
  return showIcon ? (
    <span className="inline-flex items-center gap-1">
      <IndianRupee size={16} className="inline-block" />
      {formatted.replace('₹', '')}
    </span>
  ) : formatted;
};
