const nodemailer = require('nodemailer');

// Create transporter (use your email service configuration)
const createTransporter = () => {
  // For development - you can use Gmail, SendGrid, or other services
  return nodemailer.createTransporter({
    service: 'gmail', // or your preferred service
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
  });
};

// @desc Send application confirmation email
exports.sendApplicationConfirmationEmail = async (applicant, scholarship, application) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'scholarship@yourplatform.com',
      to: applicant.email,
      subject: `Application Submitted Successfully - ${scholarship.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Application Submitted Successfully! 🎉</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${applicant.name || 'Applicant'},</p>
            
            <p>Your scholarship application has been successfully submitted!</p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin: 0 0 15px 0; color: #333;">Application Details</h3>
              <p><strong>Scholarship:</strong> ${scholarship.title}</p>
              <p><strong>Organization:</strong> ${scholarship.organization}</p>
              <p><strong>Amount:</strong> ₹${scholarship.amount ? scholarship.amount.toLocaleString() : 'N/A'}</p>
              <p><strong>Application ID:</strong> ${application._id}</p>
              <p><strong>Submission Date:</strong> ${new Date(application.submissionDate).toLocaleDateString('en-IN')}</p>
              <p><strong>Completion Status:</strong> ${application.completionPercentage}%</p>
            </div>

            <div style="background: #e8f4fd; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #0066cc;">Next Steps</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Our review team will evaluate your application</li>
                <li>You'll receive updates via email as your application progresses</li>
                <li>The review process typically takes 2-4 weeks</li>
                <li>You can track your application status in your dashboard</li>
              </ul>
            </div>

            <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h4 style="margin: 0 0 10px 0; color: #856404;">📋 Important Reminders</h4>
              <ul style="margin: 0; padding-left: 20px; color: #856404;">
                <li>Keep this email for your records</li>
                <li>Check your email regularly for updates</li>
                <li>Contact support if you have any questions</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard/applications" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Your Applications
              </a>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Best of luck with your scholarship application!<br>
              <strong>The Scholarship Team</strong>
            </p>
          </div>

          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2024 Scholarship Platform. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">
              <a href="${process.env.FRONTEND_URL}/contact" style="color: #667eea;">Contact Support</a> | 
              <a href="${process.env.FRONTEND_URL}/privacy" style="color: #667eea;">Privacy Policy</a>
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Application confirmation email sent successfully');
    
  } catch (error) {
    console.error('Error sending application confirmation email:', error);
    throw error;
  }
};

// @desc Send application status update email
exports.sendApplicationStatusEmail = async (applicant, scholarship, application, status, reviewNotes) => {
  try {
    const transporter = createTransporter();

    let statusColor = '#667eea';
    let statusEmoji = '📋';
    let statusMessage = '';
    
    switch (status) {
      case 'approved':
        statusColor = '#28a745';
        statusEmoji = '🎉';
        statusMessage = 'Congratulations! Your scholarship application has been APPROVED!';
        break;
      case 'rejected':
        statusColor = '#dc3545';
        statusEmoji = '📝';
        statusMessage = 'Your scholarship application status has been updated.';
        break;
      case 'waitlisted':
        statusColor = '#ffc107';
        statusEmoji = '⏳';
        statusMessage = 'Your scholarship application has been WAITLISTED.';
        break;
      default:
        statusMessage = 'Your scholarship application status has been updated.';
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'scholarship@yourplatform.com',
      to: applicant.email,
      subject: `Application Update - ${scholarship.title} | Status: ${status.toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}aa 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">${statusEmoji} Application Update</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${applicant.name || 'Applicant'},</p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid ${statusColor};">
              <h2 style="margin: 0 0 15px 0; color: ${statusColor};">${statusMessage}</h2>
              
              <div style="margin: 20px 0;">
                <p><strong>Scholarship:</strong> ${scholarship.title}</p>
                <p><strong>Organization:</strong> ${scholarship.organization}</p>
                <p><strong>Application ID:</strong> ${application._id}</p>
                <p><strong>New Status:</strong> <span style="color: ${statusColor}; font-weight: bold; text-transform: uppercase;">${status}</span></p>
                <p><strong>Review Date:</strong> ${new Date(application.reviewDate || Date.now()).toLocaleDateString('en-IN')}</p>
                ${application.awardAmount ? `<p><strong>Award Amount:</strong> ₹${application.awardAmount.toLocaleString()}</p>` : ''}
              </div>
            </div>

            ${reviewNotes ? `
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #6c757d;">
              <h3 style="margin: 0 0 15px 0; color: #495057;">Review Notes</h3>
              <p style="color: #495057; line-height: 1.6; margin: 0;">${reviewNotes}</p>
            </div>
            ` : ''}

            ${status === 'approved' ? `
            <div style="background: #d4edda; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="margin: 0 0 15px 0; color: #155724;">🎊 Next Steps for Approved Applications</h3>
              <ul style="margin: 0; padding-left: 20px; color: #155724;">
                <li>You will be contacted within 5-7 business days with disbursement details</li>
                <li>Please keep your documents ready for verification</li>
                <li>Monitor your email for further communications</li>
                <li>Congratulations on this achievement!</li>
              </ul>
            </div>
            ` : ''}

            ${status === 'waitlisted' ? `
            <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="margin: 0 0 15px 0; color: #856404;">⏳ What does Waitlisted mean?</h3>
              <ul style="margin: 0; padding-left: 20px; color: #856404;">
                <li>Your application meets our criteria but is pending availability</li>
                <li>You may be considered if slots become available</li>
                <li>We'll notify you of any status changes</li>
                <li>Keep applying to other scholarships in the meantime</li>
              </ul>
            </div>
            ` : ''}

            ${status === 'rejected' ? `
            <div style="background: #f8d7da; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #dc3545;">
              <h3 style="margin: 0 0 15px 0; color: #721c24;">💪 Don't Give Up!</h3>
              <ul style="margin: 0; padding-left: 20px; color: #721c24;">
                <li>This is just one opportunity among many</li>
                <li>Consider the feedback for future applications</li>
                <li>Continue applying to other scholarships</li>
                <li>Our platform has many other opportunities for you</li>
              </ul>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard/applications" 
                 style="background: ${statusColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                View Application Details
              </a>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Thank you for using our platform!<br>
              <strong>The Scholarship Team</strong>
            </p>
          </div>

          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2024 Scholarship Platform. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">
              <a href="${process.env.FRONTEND_URL}/contact" style="color: #667eea;">Contact Support</a> | 
              <a href="${process.env.FRONTEND_URL}/scholarships" style="color: #667eea;">Browse More Scholarships</a>
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Application ${status} email sent successfully`);
    
  } catch (error) {
    console.error(`Error sending application ${status} email:`, error);
    throw error;
  }
};

// @desc Send welcome email to new users
exports.sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'scholarship@yourplatform.com',
      to: user.email,
      subject: 'Welcome to Our Scholarship Platform! 🎓',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to Our Platform! 🎓</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${user.name},</p>
            
            <p>Welcome to our comprehensive scholarship platform! We're excited to help you discover and apply for educational opportunities.</p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin: 0 0 15px 0; color: #333;">Getting Started</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Complete your profile for better scholarship matching</li>
                <li>Browse available scholarships</li>
                <li>Save interesting opportunities</li>
                <li>Submit comprehensive applications</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/scholarships" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Browse Scholarships
              </a>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Best of luck with your scholarship journey!<br>
              <strong>The Scholarship Team</strong>
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
    
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

module.exports = exports;