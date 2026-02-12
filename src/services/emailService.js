/**
 * Email Notification Service
 * This service generates email content for various claim operations
 */

export const ADMIN_INFO = {
  email: process.env.REACT_APP_ADMIN_EMAIL || 'admin@lostfound.com',
  name: 'Lost & Found Admin'
};

/**
 * Generate email HTML for claim approval
 */
export const generateApprovalEmailHTML = (claim, itemDetails, claimantInfo) => {
  return `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            border-radius: 5px 5px 0 0;
            text-align: center;
          }
          .content {
            background-color: white;
            padding: 20px;
            border: 1px solid #ddd;
          }
          .footer {
            background-color: #f0f0f0;
            padding: 15px;
            border-radius: 0 0 5px 5px;
            text-align: center;
            font-size: 12px;
          }
          .section {
            margin: 20px 0;
            border-left: 4px solid #4CAF50;
            padding-left: 15px;
          }
          .item-details {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
          }
          .label {
            font-weight: bold;
            color: #4CAF50;
          }
          .button {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 10px;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 10px;
            margin: 10px 0;
            border-radius: 3px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✅ Your Claim Has Been Approved!</h2>
          </div>
          
          <div class="content">
            <p>Hello ${claimantInfo.name},</p>
            
            <p>Great news! Your claim for the ${itemDetails.itemType === 'found' ? 'found' : 'lost'} item has been <strong>APPROVED</strong>.</p>
            
            <div class="section">
              <h3>Item Details</h3>
              <div class="item-details">
                <p><span class="label">Item Name:</span> ${itemDetails.itemName}</p>
                <p><span class="label">Category:</span> ${itemDetails.category}</p>
                <p><span class="label">Location:</span> ${itemDetails.location}</p>
                <p><span class="label">Date:</span> ${new Date(itemDetails.date).toLocaleDateString('en-IN')}</p>
                <p><span class="label">Description:</span> ${itemDetails.description}</p>
              </div>
            </div>

            <div class="section">
              <h3>Next Steps</h3>
              <ol>
                <li>The item owner will contact you shortly with their contact information</li>
                <li>Coordinate with the owner to arrange item recovery</li>
                <li>Once you've received the item, mark the claim as completed in your account</li>
              </ol>
            </div>

            <div class="warning">
              <strong>⚠️ Important:</strong> Keep your contact information updated to facilitate smooth communication with the item owner.
            </div>

            <p>If you have any questions, feel free to reach out to our admin team.</p>
            
            <p>Best regards,<br/>
            <strong>${ADMIN_INFO.name}</strong>
            </p>
          </div>
          
          <div class="footer">
            <p>Lost & Found Management System</p>
            <p>Email: ${ADMIN_INFO.email}</p>
            <p>All rights reserved © 2026</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Generate email HTML for claim rejection
 */
export const generateRejectionEmailHTML = (claim, itemDetails, claimantInfo, rejectionReason = '') => {
  return `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background-color: #f44336;
            color: white;
            padding: 20px;
            border-radius: 5px 5px 0 0;
            text-align: center;
          }
          .content {
            background-color: white;
            padding: 20px;
            border: 1px solid #ddd;
          }
          .footer {
            background-color: #f0f0f0;
            padding: 15px;
            border-radius: 0 0 5px 5px;
            text-align: center;
            font-size: 12px;
          }
          .section {
            margin: 20px 0;
            border-left: 4px solid #f44336;
            padding-left: 15px;
          }
          .item-details {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
          }
          .label {
            font-weight: bold;
            color: #f44336;
          }
          .button {
            display: inline-block;
            background-color: #2196F3;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 10px;
          }
          .info-box {
            background-color: #e3f2fd;
            border-left: 4px solid #2196F3;
            padding: 10px;
            margin: 10px 0;
            border-radius: 3px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>❌ Claim Rejection Notice</h2>
          </div>
          
          <div class="content">
            <p>Hello ${claimantInfo.name},</p>
            
            <p>Unfortunately, your claim for the item has been <strong>REJECTED</strong> at this time.</p>
            
            <div class="section">
              <h3>Item Details</h3>
              <div class="item-details">
                <p><span class="label">Item Name:</span> ${itemDetails.itemName}</p>
                <p><span class="label">Category:</span> ${itemDetails.category}</p>
                <p><span class="label">Location:</span> ${itemDetails.location}</p>
              </div>
            </div>

            ${rejectionReason ? `
              <div class="section">
                <h3>Reason for Rejection</h3>
                <p>${rejectionReason}</p>
              </div>
            ` : ''}

            <div class="info-box">
              <h4>What You Can Do</h4>
              <ul>
                <li>Review the item details carefully</li>
                <li>Gather additional proof or documentation</li>
                <li>Submit a new claim with more details</li>
                <li>Contact our admin team for clarification</li>
              </ul>
            </div>

            <p>We encourage you to try again with more details. If you believe this is an error, please contact our admin team for assistance.</p>
            
            <p>Best regards,<br/>
            <strong>${ADMIN_INFO.name}</strong>
            </p>
          </div>
          
          <div class="footer">
            <p>Lost & Found Management System</p>
            <p>Email: ${ADMIN_INFO.email}</p>
            <p>All rights reserved © 2026</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Generate email HTML for sharing owner contact
 */
export const generateContactSharingEmailHTML = (claimantInfo, ownerInfo, itemDetails) => {
  return `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background-color: #2196F3;
            color: white;
            padding: 20px;
            border-radius: 5px 5px 0 0;
            text-align: center;
          }
          .content {
            background-color: white;
            padding: 20px;
            border: 1px solid #ddd;
          }
          .footer {
            background-color: #f0f0f0;
            padding: 15px;
            border-radius: 0 0 5px 5px;
            text-align: center;
            font-size: 12px;
          }
          .contact-card {
            background-color: #f5f5f5;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
          }
          .label {
            font-weight: bold;
            color: #2196F3;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📞 Contact Information Shared</h2>
          </div>
          
          <div class="content">
            <p>Hello ${claimantInfo.name},</p>
            
            <p>The item owner has shared their contact information with you so you can coordinate the item recovery. Please reach out to them at your earliest convenience.</p>
            
            <div class="contact-card">
              <h3>Owner's Contact Details</h3>
              <p><span class="label">Name:</span> ${ownerInfo.name}</p>
              ${ownerInfo.email ? `<p><span class="label">Email:</span> <a href="mailto:${ownerInfo.email}">${ownerInfo.email}</a></p>` : ''}
              ${ownerInfo.phone ? `<p><span class="label">Phone:</span> <a href="tel:${ownerInfo.phone}">${ownerInfo.phone}</a></p>` : ''}
              ${ownerInfo.whatsapp ? `<p><span class="label">WhatsApp:</span> ${ownerInfo.whatsapp}</p>` : ''}
            </div>

            <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h4>Item Summary</h4>
              <p><strong>${itemDetails.itemName}</strong></p>
              <p>${itemDetails.description}</p>
            </div>

            <p style="color: #f44336; font-weight: bold;">⚠️ Important: Please arrange the recovery at a safe, public location and verify the item thoroughly before completing the handover.</p>
            
            <p>Good luck with the recovery, and thank you for using our service!</p>
            
            <p>Best regards,<br/>
            <strong>${ADMIN_INFO.name}</strong>
            </p>
          </div>
          
          <div class="footer">
            <p>Lost & Found Management System</p>
            <p>Email: ${ADMIN_INFO.email}</p>
            <p>All rights reserved © 2026</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Generate email for notifying owner of a new claim
 */
export const generateNewClaimNotificationEmail = (ownerInfo, claimantInfo, itemDetails) => {
  return `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background-color: #FF9800;
            color: white;
            padding: 20px;
            border-radius: 5px 5px 0 0;
            text-align: center;
          }
          .content {
            background-color: white;
            padding: 20px;
            border: 1px solid #ddd;
          }
          .footer {
            background-color: #f0f0f0;
            padding: 15px;
            border-radius: 0 0 5px 5px;
            text-align: center;
            font-size: 12px;
          }
          .section {
            margin: 20px 0;
            border-left: 4px solid #FF9800;
            padding-left: 15px;
          }
          .item-details {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
          }
          .label {
            font-weight: bold;
            color: #FF9800;
          }
          .button {
            display: inline-block;
            background-color: #FF9800;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔔 New Claim On Your Item</h2>
          </div>
          
          <div class="content">
            <p>Hello ${ownerInfo.name},</p>
            
            <p>Someone has submitted a claim for your ${itemDetails.itemType === 'found' ? 'found' : 'lost'} item. Please review and decide whether to approve or reject the claim.</p>
            
            <div class="section">
              <h3>Claimant Information</h3>
              <div class="item-details">
                <p><span class="label">Name:</span> ${claimantInfo.name}</p>
                <p><span class="label">Email:</span> ${claimantInfo.email}</p>
                ${claimantInfo.phone ? `<p><span class="label">Phone:</span> ${claimantInfo.phone}</p>` : ''}
              </div>
            </div>

            <div class="section">
              <h3>Item Details</h3>
              <div class="item-details">
                <p><span class="label">Item Name:</span> ${itemDetails.itemName}</p>
                <p><span class="label">Category:</span> ${itemDetails.category}</p>
                <p><span class="label">Description:</span> ${itemDetails.description}</p>
              </div>
            </div>

            <p>Please log in to your account to review and take action on this claim.</p>
            
            <p style="color: #d32f2f; font-weight: bold;">📌 Action Required: Approve or reject this claim within 7 days.</p>
            
            <p>Best regards,<br/>
            <strong>${ADMIN_INFO.name}</strong>
            </p>
          </div>
          
          <div class="footer">
            <p>Lost & Found Management System</p>
            <p>Email: ${ADMIN_INFO.email}</p>
            <p>All rights reserved © 2026</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Copy email text to clipboard (for manual sending)
 */
export const copyEmailToClipboard = (emailHTML) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = emailHTML;
  const text = tempDiv.textContent || tempDiv.innerText;
  
  navigator.clipboard.writeText(text).then(() => {
    return { success: true, message: 'Email content copied to clipboard' };
  }).catch(() => {
    return { success: false, message: 'Failed to copy email content' };
  });
};

/**
 * Generate plain text version of approval email
 */
export const generateApprovalEmailText = (claim, itemDetails, claimantInfo) => {
  return `
CLAIM APPROVAL NOTIFICATION

Hello ${claimantInfo.name},

Great news! Your claim for the item has been APPROVED.

ITEM DETAILS
- Item Name: ${itemDetails.itemName}
- Category: ${itemDetails.category}
- Location: ${itemDetails.location}
- Date: ${new Date(itemDetails.date).toLocaleDateString('en-IN')}
- Description: ${itemDetails.description}

NEXT STEPS
1. The item owner will contact you shortly with their contact information
2. Coordinate with the owner to arrange item recovery
3. Once you've received the item, mark the claim as completed in your account

IMPORTANT: Keep your contact information updated to facilitate smooth communication.

If you have any questions, feel free to reach out to our admin team.

Best regards,
Lost & Found Admin
Email: ${ADMIN_INFO.email}
  `;
};
