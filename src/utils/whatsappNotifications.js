import { buildWhatsAppUrl } from './whatsapp';

// Admin Contact Information
export const ADMIN_INFO = {
  phone: '8999271196',
  email: 'amitgatir1308@gmail.com',
  name: 'Lost & Found Admin'
};

/**
 * Generate WhatsApp message for claim approval
 */
export const generateApprovalMessage = (claim, itemDetails) => {
  const itemType = claim.itemType === 'lost' ? 'LOST ITEM' : 'FOUND ITEM';
  const approvalDate = new Date().toLocaleDateString('en-IN');
  const approvalTime = new Date().toLocaleTimeString('en-IN');

  return `
╔═════════════════════════════════════╗
║   📋 CLAIM APPROVAL REPORT 📋       ║
║   Lost & Found Management System    ║
╚═════════════════════════════════════╝

✅ *CLAIM STATUS: APPROVED*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 *ITEM DETAILS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏷️  *Item Type:* ${itemType}
📝 *Item Name:* ${itemDetails.itemName || 'N/A'}
🏷️  *Category:* ${itemDetails.category || 'N/A'}
📍 *Location:* ${itemDetails.location || 'N/A'}
📅 *Date:* ${itemDetails.date ? new Date(itemDetails.date).toLocaleDateString('en-IN') : 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 *ITEM DESCRIPTION*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${itemDetails.description || 'No description provided'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ *APPROVAL CONFIRMATION*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 *Status:* ✅ APPROVED BY ADMIN
✔️  *Approved On:* ${approvalDate} at ${approvalTime}
📞 *Admin Contact:* ${ADMIN_INFO.phone}
📧 *Admin Email:* ${ADMIN_INFO.email}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 *NEXT STEPS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Item has been verified and approved
• You can now proceed with item recovery
• Once item is recovered, you'll receive a final confirmation report
• Contact admin for any queries

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for using Lost & Found Service!
For support: ${ADMIN_INFO.email}

╔═════════════════════════════════════╗
║   Report Generated: ${approvalDate}      ║
╚═════════════════════════════════════╝
`;
};

/**
 * Generate WhatsApp message for claim rejection
 */
export const generateRejectionMessage = (claim, itemDetails, rejectionReason = '') => {
  const itemType = claim.itemType === 'lost' ? 'LOST ITEM' : 'FOUND ITEM';
  const rejectionDate = new Date().toLocaleDateString('en-IN');
  const rejectionTime = new Date().toLocaleTimeString('en-IN');

  return `
╔═════════════════════════════════════╗
║   📋 CLAIM REJECTION REPORT 📋      ║
║   Lost & Found Management System    ║
╚═════════════════════════════════════╝

❌ *CLAIM STATUS: REJECTED*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 *ITEM DETAILS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏷️  *Item Type:* ${itemType}
📝 *Item Name:* ${itemDetails.itemName || 'N/A'}
🏷️  *Category:* ${itemDetails.category || 'N/A'}
📍 *Location:* ${itemDetails.location || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  *REJECTION NOTICE*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ *Status:* CLAIM REJECTED
🗓️  *Rejected On:* ${rejectionDate} at ${rejectionTime}
📞 *Admin Contact:* ${ADMIN_INFO.phone}

${rejectionReason ? `📝 *Reason:* ${rejectionReason}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ️  *NEXT STEPS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Your claim could not be verified at this time
• Please resubmit with additional details or clarification
• Contact admin for more information about the rejection
• You can file a new claim with improved information

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📧 *NEED HELP?*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Contact Admin:
📞 Phone: ${ADMIN_INFO.phone}
📧 Email: ${ADMIN_INFO.email}

╔═════════════════════════════════════╗
║   Report Generated: ${rejectionDate}      ║
╚═════════════════════════════════════╝
`;
};

/**
 * Generate WhatsApp message for item recovery confirmation
 */
export const generateRecoveryMessage = (claim, itemDetails) => {
  const recoveryDate = new Date().toLocaleDateString('en-IN');
  const recoveryTime = new Date().toLocaleTimeString('en-IN');
  const itemType = claim.itemType === 'lost' ? 'LOST ITEM' : 'FOUND ITEM';

  return `
╔═════════════════════════════════════╗
║  🎉 ITEM RECOVERY CONFIRMATION 🎉   ║
║   Lost & Found Management System    ║
╚═════════════════════════════════════╝

🎉 *CONGRATULATIONS! ITEM RECOVERED* 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 *RECOVERED ITEM DETAILS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏷️  *Item Type:* ${itemType}
📝 *Item Name:* ${itemDetails.itemName || 'N/A'}
🏷️  *Category:* ${itemDetails.category || 'N/A'}
📍 *Location:* ${itemDetails.location || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ *RECOVERY CONFIRMATION*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 *Status:* ✅ ITEM RECOVERED
📅 *Recovery Date:* ${recoveryDate}
⏰ *Recovery Time:* ${recoveryTime}
✓ *Verified By:* ${ADMIN_INFO.name}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🙏 *THANK YOU!*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
We're delighted to hear that your item has been successfully recovered!
This testimony helps us serve the community better.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📧 *ADMIN CONTACT*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 Phone: ${ADMIN_INFO.phone}
📧 Email: ${ADMIN_INFO.email}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For any further assistance, feel free to contact us.
We appreciate your trust in our service!

╔═════════════════════════════════════╗
║   Report Generated: ${recoveryDate}      ║
╚═════════════════════════════════════╝
`;
};

/**
 * Generate WhatsApp message for initial report submission notification
 */
export const generateSubmissionConfirmationMessage = (itemDetails, itemType) => {
  const submissionDate = new Date().toLocaleDateString('en-IN');
  const submissionTime = new Date().toLocaleTimeString('en-IN');
  const reportType = itemType === 'lost' ? 'LOST ITEM' : 'FOUND ITEM';

  return `
╔═════════════════════════════════════╗
║  📋 REPORT SUBMISSION CONFIRMATION   ║
║   Lost & Found Management System    ║
╚═════════════════════════════════════╝

✅ *REPORT SUBMITTED SUCCESSFULLY*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 *ITEM REPORT DETAILS*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏷️  *Report Type:* ${reportType}
📝 *Item Name:* ${itemDetails.itemName || 'N/A'}
🏷️  *Category:* ${itemDetails.category || 'N/A'}
📍 *Location:* ${itemDetails.location || 'N/A'}
📅 *Date:* ${itemDetails.date ? new Date(itemDetails.date).toLocaleDateString('en-IN') : 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 *WHAT HAPPENS NEXT?*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏳ Your report has been received and is under admin review
📌 Once verified, you'll receive an approval/rejection message
✉️  keep your WhatsApp active for updates
⏱️  Approval usually takes 24-48 hours

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✉️  *SUBMISSION CONFIRMATION*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 *Submitted On:* ${submissionDate}
⏰ *Submitted At:* ${submissionTime}
✓ *Status:* PENDING ADMIN REVIEW

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📧 *ADMIN CONTACT*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 Phone: ${ADMIN_INFO.phone}
📧 Email: ${ADMIN_INFO.email}

Thank you for using Lost & Found Service!

╔═════════════════════════════════════╗
║   Report ID: ${itemDetails.id || 'TXN_' + Date.now()}          ║
╚═════════════════════════════════════╝
`;
};

/**
 * Send WhatsApp message via WhatsApp Web
 */
export const sendWhatsAppMessage = (phoneNumber, message) => {
  try {
    const url = buildWhatsAppUrl(phoneNumber, message);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error opening WhatsApp:', error);
    return false;
  }
};

/**
 * Send approval message to claimant
 */
export const sendApprovalNotification = (claimantPhone, claim, itemDetails) => {
  const message = generateApprovalMessage(claim, itemDetails);
  return sendWhatsAppMessage(claimantPhone, message);
};

/**
 * Send rejection message to claimant
 */
export const sendRejectionNotification = (claimantPhone, claim, itemDetails, reason = '') => {
  const message = generateRejectionMessage(claim, itemDetails, reason);
  return sendWhatsAppMessage(claimantPhone, message);
};

/**
 * Send recovery confirmation message to user
 */
export const sendRecoveryNotification = (userPhone, claim, itemDetails) => {
  const message = generateRecoveryMessage(claim, itemDetails);
  return sendWhatsAppMessage(userPhone, message);
};

/**
 * Send submission confirmation to reporter
 */
export const sendSubmissionConfirmation = (reporterPhone, itemDetails, itemType) => {
  const message = generateSubmissionConfirmationMessage(itemDetails, itemType);
  return sendWhatsAppMessage(reporterPhone, message);
};
