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
        background: 'linear-gradient(135deg, #414A37 0%, #99744A 100%)',
        color: 'white',
        py: { xs: 5, md: 7 },
        mt: 'auto',
        boxShadow: '0 -2px 16px rgba(0,0,0,0.08)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 3, md: 5 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SearchIcon sx={{ mr: 1, fontSize: 32, color: 'secondary.main' }} />
              <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: 1, ml: 1 }}>
                Lost & Found
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.92, fontSize: 16 }}>
              Helping reunite people with their lost belongings.<br />
              <span style={{ opacity: 0.8 }}>Together we can make a difference in our community.</span>
            </Typography>
            <Box>
              <IconButton color="inherit" aria-label="Facebook" sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.08)' }}>
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter" sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.08)' }}>
                <TwitterIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram" sx={{ mr: 1, bgcolor: 'rgba(255,255,255,0.08)' }}>
                <InstagramIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="Email" sx={{ bgcolor: 'rgba(255,255,255,0.08)' }}>
                <EmailIcon />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" gutterBottom fontWeight={700} sx={{ letterSpacing: 0.5 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="inherit" underline="hover" sx={{ opacity: 0.92, fontSize: 15 }}>
                Home
              </Link>
              <Link href="/report-lost" color="inherit" underline="hover" sx={{ opacity: 0.92, fontSize: 15 }}>
                Report Lost
              </Link>
              <Link href="/report-found" color="inherit" underline="hover" sx={{ opacity: 0.92, fontSize: 15 }}>
                Report Found
              </Link>
              <Link href="/contact" color="inherit" underline="hover" sx={{ opacity: 0.92, fontSize: 15 }}>
                Contact Us
              </Link>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" gutterBottom fontWeight={700} sx={{ letterSpacing: 0.5 }}>
              Categories
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.92, fontSize: 15 }}>Electronics</Typography>
              <Typography variant="body2" sx={{ opacity: 0.92, fontSize: 15 }}>Documents</Typography>
              <Typography variant="body2" sx={{ opacity: 0.92, fontSize: 15 }}>Jewelry</Typography>
              <Typography variant="body2" sx={{ opacity: 0.92, fontSize: 15 }}>Pets</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" gutterBottom fontWeight={700} sx={{ letterSpacing: 0.5 }}>
              Contact Us
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.92, fontSize: 15 }}>
              Email: support@lostandfound.com
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.92, fontSize: 15 }}>
              Phone: (555) 123-4567
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.92, fontSize: 15 }}>
              Available 24/7
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.18)', mt: 4, pt: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.85, fontSize: 14 }}>
            © {new Date().getFullYear()} Lost & Found Platform. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
