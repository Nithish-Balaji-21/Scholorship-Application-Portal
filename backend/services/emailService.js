const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Verify email configuration
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service is ready');
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }

  // Send welcome email to new users
  async sendWelcomeEmail(user) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@scholarship.com',
      to: user.email,
      subject: 'Welcome to Scholarship - Your Scholarship Journey Begins!',
      html: this.getWelcomeEmailTemplate(user),
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@scholarship.com',
      to: user.email,
      subject: 'Password Reset Request - Scholarship',
      html: this.getPasswordResetEmailTemplate(user, resetUrl),
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw error;
    }
  }

  // Send application confirmation email
  async sendApplicationConfirmationEmail(user, scholarship, application) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@scholarship.com',
      to: user.email,
      subject: `Application Confirmation - ${scholarship.title}`,
      html: this.getApplicationConfirmationTemplate(user, scholarship, application),
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Application confirmation email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Failed to send application confirmation email:', error);
      throw error;
    }
  }

  // Send application status update email
  async sendApplicationStatusEmail(user, scholarship, application, newStatus) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@scholarship.com',
      to: user.email,
      subject: `Application Update - ${scholarship.title}`,
      html: this.getApplicationStatusTemplate(user, scholarship, application, newStatus),
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Application status email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Failed to send application status email:', error);
      throw error;
    }
  }

  // Email Templates
  getWelcomeEmailTemplate(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Scholarship!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            <p>Thank you for joining Scholarship, your trusted partner in finding and applying for scholarships.</p>
            <p>We're excited to help you on your educational journey. Here's what you can do now:</p>
            <ul>
              <li>Browse thousands of scholarships</li>
              <li>Apply for scholarships that match your profile</li>
              <li>Track your application status</li>
              <li>Get personalized recommendations</li>
            </ul>
            <p>Ready to get started?</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/scholarships" class="button">Browse Scholarships</a>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Best regards,<br>The Scholarship Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetEmailTemplate(user, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
          .warning { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            <p>We received a request to reset your password for your Scholarship account.</p>
            <p>If you made this request, click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <span style="word-break: break-all; color: #3b82f6;">${resetUrl}</span>
            </p>
            <div class="warning">
              <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
            </div>
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            <p>For security reasons, never share this email with anyone.</p>
            <p>Best regards,<br>The Scholarship Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getApplicationConfirmationTemplate(user, scholarship, application) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
          .details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Submitted Successfully!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            <p>Your application has been successfully submitted for the following scholarship:</p>
            <div class="details">
              <h3>${scholarship.title}</h3>
              <p><strong>Organization:</strong> ${scholarship.organization?.name || 'Not specified'}</p>
              <p><strong>Application ID:</strong> #${application._id}</p>
              <p><strong>Submitted:</strong> ${new Date(application.createdAt).toLocaleDateString()}</p>
              <p><strong>Status:</strong> ${application.status}</p>
            </div>
            <p>What happens next?</p>
            <ul>
              <li>Your application will be reviewed by the scholarship committee</li>
              <li>You'll receive updates via email as your application progresses</li>
              <li>You can track your application status in your dashboard</li>
            </ul>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">View Dashboard</a>
            <p>Good luck with your application!</p>
            <p>Best regards,<br>The Scholarship Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getApplicationStatusTemplate(user, scholarship, application, newStatus) {
    const statusColors = {
      pending: '#f59e0b',
      approved: '#10b981',
      rejected: '#ef4444',
      waitlisted: '#8b5cf6'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${statusColors[newStatus] || '#6b7280'}; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .button { background: ${statusColors[newStatus] || '#6b7280'}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
          .details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .status { color: ${statusColors[newStatus] || '#6b7280'}; font-weight: bold; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Status Update</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            <p>We have an update on your scholarship application:</p>
            <div class="details">
              <h3>${scholarship.title}</h3>
              <p><strong>Application ID:</strong> #${application._id}</p>
              <p><strong>New Status:</strong> <span class="status">${newStatus}</span></p>
              <p><strong>Updated:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            ${this.getStatusMessage(newStatus)}
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">View Details</a>
            <p>Best regards,<br>The Scholarship Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getStatusMessage(status) {
    const messages = {
      approved: '<p>🎉 Congratulations! Your application has been approved. You should receive further instructions from the organization soon.</p>',
      rejected: '<p>We regret to inform you that your application was not selected this time. Don\'t give up - there are many other opportunities available!</p>',
      waitlisted: '<p>Your application has been waitlisted. You\'re still in consideration and will be notified if your status changes.</p>',
      pending: '<p>Your application is still under review. We\'ll notify you as soon as there\'s an update.</p>'
    };
    return messages[status] || '<p>Your application status has been updated.</p>';
  }
}

module.exports = new EmailService();