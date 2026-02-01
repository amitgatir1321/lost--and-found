import React from 'react';
import { TextField } from '@mui/material';

const Input = ({
  label,
  helperText,
  error = false,
  ...props
}) => (
  <TextField
    label={label}
    helperText={helperText}
    error={error}
    fullWidth
    margin="normal"
    variant="outlined"
    sx={{
      borderRadius: 8,
      background: '#fff',
      '& .MuiOutlinedInput-root': {
        borderRadius: 8,
      },
    }}
    {...props}
  />
);

export default Input;
