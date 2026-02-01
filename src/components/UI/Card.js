import React from 'react';
import { Card as MuiCard, CardContent, CardActions, Typography } from '@mui/material';

const Card = ({
  title,
  subtitle,
  actions,
  children,
  ...props
}) => (
  <MuiCard
    elevation={2}
    sx={{
      borderRadius: 16,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      background: '#fff',
      mb: 3,
      p: 0,
    }}
    {...props}
  >
    <CardContent>
      {title && (
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {subtitle}
        </Typography>
      )}
      {children}
    </CardContent>
    {actions && <CardActions sx={{ pt: 0 }}>{actions}</CardActions>}
  </MuiCard>
);

export default Card;
