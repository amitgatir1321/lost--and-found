const WHATSAPP_BASE_URL = 'https://wa.me';

export const formatIndianWhatsAppNumber = (value) => {
  if (value === undefined || value === null) return null;

  let digits = String(value).trim().replace(/\D/g, '');

  // Handle various country code prefixes
  if (digits.startsWith('0091')) {
    // Remove 00 + 91 prefix (e.g., "0091" + 10 digits)
    digits = digits.slice(4);
  } else if (digits.startsWith('91')) {
    // Remove 91 prefix (e.g., "91" + 10 digits)
    digits = digits.slice(2);
  } else if (digits.startsWith('00')) {
    // Remove international dialing prefix "00"
    digits = digits.slice(2);
    // After removing "00", check for "91"
    if (digits.startsWith('91')) {
      digits = digits.slice(2);
    }
  }

  // Remove leading zero if present (e.g., "0" + 10 digits)
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Validate: must be exactly 10 digits starting with 6-9
  if (!/^[6-9]\d{9}$/.test(digits)) {
    return null;
  }

  return `91${digits}`;
};

export const buildWhatsAppUrl = (phoneNumber, message = '') => {
  if (!phoneNumber) return null;
  
  const normalizedNumber = formatIndianWhatsAppNumber(phoneNumber);
  if (!normalizedNumber) return null;

  let url = `${WHATSAPP_BASE_URL}/${normalizedNumber}`;
  
  if (message && message.trim()) {
    url += `?text=${encodeURIComponent(message)}`;
  }
  
  return url;
};

export const buildEmailUrl = (email, subject = '', body = '') => {
  if (!email) return null;
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);

  const paramString = params.toString();
  return `mailto:${encodeURIComponent(email)}${paramString ? `?${paramString}` : ''}`;
};

