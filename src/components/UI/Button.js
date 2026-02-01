import React from 'react';
import { Button as MuiButton, CircularProgress } from '@mui/material';

const Button = ({
  children,
  variant = 'contained',
  color = 'primary',
  loading = false,
  disabled = false,
  startIcon,
  endIcon,
  ...props
}) => (
  <MuiButton
    variant={variant}
    color={color}
    disabled={disabled || loading}
    startIcon={startIcon}
    endIcon={endIcon}
    sx={{
      borderRadius: 8,
      fontWeight: 600,
      textTransform: 'none',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      minHeight: 44,
      px: 3,
    }}
    {...props}
  >
    {loading ? <CircularProgress size={22} color="inherit" /> : children}
  </MuiButton>
);

export default Button;
