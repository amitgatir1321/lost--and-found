import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import EmailIcon from '@mui/icons-material/Email';
import SearchIcon from '@mui/icons-material/Search';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#414A37',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SearchIcon sx={{ mr: 1, fontSize: 30 }} />
              <Typography variant="h6" fontWeight="bold">
                Lost & Found
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
              Helping reunite people with their lost belongings. Together we can make a difference in our community.
            </Typography>
            <Box>
              <IconButton color="inherit" aria-label="Facebook">
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter">
                <TwitterIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram">
                <InstagramIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="Email">
                <EmailIcon />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="inherit" underline="hover" sx={{ opacity: 0.9 }}>
                Home
              </Link>
              <Link href="/report-lost" color="inherit" underline="hover" sx={{ opacity: 0.9 }}>
                Report Lost
              </Link>
              <Link href="/report-found" color="inherit" underline="hover" sx={{ opacity: 0.9 }}>
                Report Found
              </Link>
              <Link href="/contact" color="inherit" underline="hover" sx={{ opacity: 0.9 }}>
                Contact Us
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Categories
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Electronics</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Documents</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Jewelry</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Pets</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Contact Us
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
              Email: support@lostandfound.com
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
              Phone: (555) 123-4567
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Available 24/7
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.2)', mt: 4, pt: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © {new Date().getFullYear()} Lost & Found Platform. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
