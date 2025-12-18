import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Stack,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ReportIcon from '@mui/icons-material/Report';
import HandshakeIcon from '@mui/icons-material/Handshake';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      icon: <ReportIcon sx={{ fontSize: 60 }} />,
      title: 'Report',
      subtitle: 'Lost or Found',
      description: 'Quick form with photos',
      color: '#d32f2f',
      emoji: '📝',
      position: { top: '20%', left: '10%' }
    },
    {
      icon: <SearchIcon sx={{ fontSize: 60 }} />,
      title: 'Match',
      subtitle: 'Auto Detection',
      description: 'Smart algorithm finds matches',
      color: '#1976d2',
      emoji: '🔍',
      position: { top: '50%', left: '45%' }
    },
    {
      icon: <HandshakeIcon sx={{ fontSize: 60 }} />,
      title: 'Connect',
      subtitle: 'Secure Meetup',
      description: 'Verify & reunite safely',
      color: '#2e7d32',
      emoji: '🤝',
      position: { top: '20%', left: '80%' }
    }
  ];

  const faqs = [
    {
      question: 'Is this service really free?',
      answer: 'Yes! 100% free. No hidden charges, no subscriptions. We believe in helping people reunite with their belongings.'
    },
    {
      question: 'How does the matching work?',
      answer: 'Our system matches items based on category, location, date, and description keywords. You\'ll get notified when potential matches are found.'
    },
    {
      question: 'Is my information safe?',
      answer: 'Absolutely! Your contact info is only shared after you approve a claim. You have full control over your privacy.'
    },
    {
      question: 'What if I find a fraudulent claim?',
      answer: 'You can reject any claim. Ask for verification details before approving. Meet in public places when returning items.'
    },
    {
      question: 'How long should I keep my report active?',
      answer: 'We recommend keeping it active for at least 30 days. Items can show up unexpectedly, and our system continuously searches for new matches.'
    },
    {
      question: 'Can I report multiple items?',
      answer: 'Yes! You can report as many lost or found items as you need. Each item gets its own report with separate tracking and notifications.'
    },
    {
      question: 'What should I include in my report?',
      answer: 'Add clear photos, detailed description, exact location, date, and any unique identifiers like serial numbers, brand, color, or distinctive marks.'
    },
    {
      question: 'How do I get notified about matches?',
      answer: 'You\'ll see notifications on your dashboard with a red badge on the navbar. Check "My Claims" to view all incoming and outgoing claim requests.'
    },
    {
      question: 'What happens after I approve a claim?',
      answer: 'Once approved, your contact information is shared with the claimant so you can coordinate a safe meetup to return the item.'
    },
    {
      question: 'Can I edit my report after posting?',
      answer: 'Currently, you\'ll need to create a new report. Make sure to include all relevant details when first posting to improve matching accuracy.'
    }
  ];

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          color: 'white',
          py: { xs: 6, md: 8 },
          backgroundImage: 'url("https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(65, 74, 55, 0.92) 0%, rgba(85, 97, 71, 0.88) 100%)',
            zIndex: 1
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 3, maxWidth: '900px', mx: 'auto', px: 3, textAlign: 'center' }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 900, 
              mb: 2, 
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            How It Works
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              opacity: 0.95, 
              mb: 4,
              textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            Simple, secure process to reunite lost items with their owners
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap>
            <Chip 
              icon={<CheckCircleIcon />}
              label="100% Free" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                backdropFilter: 'blur(10px)',
                fontWeight: 700, 
                px: 2, 
                py: 2.5
              }} 
            />
            <Chip 
              icon={<SpeedIcon />}
              label="3 Easy Steps" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                backdropFilter: 'blur(10px)',
                fontWeight: 700, 
                px: 2, 
                py: 2.5
              }} 
            />
            <Chip 
              icon={<SecurityIcon />}
              label="Secure" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                backdropFilter: 'blur(10px)',
                fontWeight: 700, 
                px: 2, 
                py: 2.5
              }} 
            />
          </Stack>
        </Box>
      </Box>

      {/* Journey Path Section */}
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3, py: { xs: 6, md: 10 } }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 900, 
            textAlign: 'center', 
            mb: 2,
            color: '#414A37',
            fontSize: { xs: '2rem', md: '2.5rem' }
          }}
        >
          Your Journey to Recovery
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            textAlign: 'center', 
            mb: 6,
            color: 'text.secondary',
            maxWidth: '600px',
            mx: 'auto'
          }}
        >
          Follow this simple path to reunite with your lost items
        </Typography>

        {/* Journey Visualization */}
        <Box sx={{ position: 'relative', minHeight: { xs: '800px', md: '500px' }, mb: 4 }}>
          {/* Curved Path */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: { xs: 'none', md: 'block' }
            }}
          >
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
              <path
                d="M 150 100 Q 400 300, 600 250 T 1000 100"
                stroke="#99744A"
                strokeWidth="4"
                fill="none"
                strokeDasharray="10,5"
                opacity="0.3"
              />
            </svg>
          </Box>

          {/* Steps on Path */}
          {steps.map((step, index) => (
            <Box
              key={index}
              sx={{
                position: { xs: 'relative', md: 'absolute' },
                ...step.position,
                transform: { md: 'translate(-50%, -50%)' },
                mb: { xs: 6, md: 0 }
              }}
            >
              <Box
                sx={{
                  bgcolor: 'white',
                  borderRadius: 4,
                  p: 3,
                  maxWidth: '280px',
                  boxShadow: `0 8px 32px ${step.color}20`,
                  border: '3px solid',
                  borderColor: step.color,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: `0 12px 40px ${step.color}40`
                  }
                }}
              >
                {/* Step Number Badge */}
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: step.color,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 900,
                    mb: 2,
                    boxShadow: `0 4px 16px ${step.color}60`
                  }}
                >
                  {index + 1}
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5, color: step.color }}>
                  {step.title}
                </Typography>
                
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#414A37', mb: 1 }}>
                  {step.subtitle}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {step.description}
                </Typography>

                <Box sx={{ fontSize: '2.5rem', textAlign: 'center' }}>
                  {step.emoji}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      

      {/* FAQ Section */}
      <Box sx={{ bgcolor: '#fafafa', py: 8 }}>
        <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 900, 
              textAlign: 'center', 
              mb: 2,
              color: '#414A37',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            ❓ Frequently Asked Questions
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              textAlign: 'center', 
              mb: 5,
              color: 'text.secondary'
            }}
          >
            Got questions? We've got answers!
          </Typography>

          <Grid container spacing={3}>
            {faqs.map((faq, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Accordion
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: 2,
                    bgcolor: 'white',
                    border: '2px solid',
                    borderColor: 'grey.200',
                    '&:before': { display: 'none' },
                    '&:hover': {
                      borderColor: '#99744A',
                      boxShadow: '0 4px 12px rgba(153, 116, 74, 0.15)'
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      '& .MuiAccordionSummary-content': {
                        my: 1.5
                      }
                    }}
                  >
                    <Typography variant="h6" fontWeight={700} color="#414A37">
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, pb: 3 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          bgcolor: '#414A37', 
          color: 'white',
          py: 6
        }}
      >
        <Box sx={{ maxWidth: '800px', mx: 'auto', px: 3, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 900, 
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Ready to Get Started?
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              opacity: 0.9, 
              mb: 4
            }}
          >
            Join our community and help reunite lost items with their owners
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/report-lost')}
              startIcon={<ReportIcon />}
              sx={{
                bgcolor: '#d32f2f',
                py: 1.5,
                px: 4,
                fontWeight: 700,
                '&:hover': {
                  bgcolor: '#b71c1c',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s'
              }}
            >
              Report Lost
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/report-found')}
              startIcon={<CheckCircleIcon />}
              sx={{
                bgcolor: '#2e7d32',
                py: 1.5,
                px: 4,
                fontWeight: 700,
                '&:hover': {
                  bgcolor: '#1b5e20',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s'
              }}
            >
              Report Found
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default HowItWorks;
