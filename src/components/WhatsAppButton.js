// components/WhatsAppButton.js
import React from "react";
import { Button } from "@mui/material";
import { buildWhatsAppUrl } from "../utils/whatsapp";

const WhatsAppButton = ({ number, itemName, onClick }) => {
  const openWhatsApp = () => {
    if (!number) {
      alert('Phone number is not available.');
      return;
    }

    const message = `Hello, I am contacting you regarding the item: ${itemName || 'an item'}`;
    const url = buildWhatsAppUrl(number, message);
    
    if (!url) {
      alert('Invalid WhatsApp number. Please provide a valid 10-digit Indian mobile number.');
      return;
    }
    
    // Open WhatsApp link
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      alert('Unable to open WhatsApp. Please check your internet connection.');
    }
  };

  return (
    <Button
      variant="contained"
      color="success"
      onClick={onClick || openWhatsApp}
      sx={{ mt: 2 }}
    >
      Connect on WhatsApp
    </Button>
  );
};

export default WhatsAppButton;
