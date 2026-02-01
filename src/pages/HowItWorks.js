import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
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
import SecurityIcon from '@mui/icons-material/Security';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const HowItWorks = () => {
  const navigate = useNavigate();

  const steps = [
    {
      title: 'Report an Item',
      subtitle: 'Lost or Found',
      description: 'Submit accurate details with location and description.',
      color: '#DC2626'
    },
    {
      title: 'Smart Matching',
      subtitle: 'Automated Detection',
      description: 'Our system identifies potential matches automatically.',
      color: '#2563EB'
    },
    {
      title: 'Secure Recovery',
      subtitle: 'Verified Connection',
      description: 'Approve claims and reconnect safely.',
      color: '#16A34A'
    }
  ];

  const faqs = [
    {
      question: 'Is this service free to use?',
      answer: 'Yes. The platform is completely free and intended to help people recover their belongings.'
    },
    {
      question: 'How are matches identified?',
      answer: 'Matches are detected using category, location, date, and description similarity.'
    },
    {
      question: 'Is my contact information safe?',
      answer: 'Yes. Your contact details are only shared after you approve a claim.'
    },
    {
      question: 'What if someone submits a false claim?',
      answer: 'You can reject any claim. Always verify details before approval.'
    }
  ];

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, system-ui' }}>
      
      {/* HERO */}
      <Box sx={{ py: { xs: 6, md: 8 }, textAlign: 'center' }}>
        <Typography
          variant="h2"
          fontWeight={800}
          sx={{ color: '#0F172A', mb: 2 }}
        >
          How It Works
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: '#475569', maxWidth: 720, mx: 'auto' }}
        >
          A simple, secure and transparent process designed to help you recover lost items efficiently.
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
          <Chip icon={<CheckCircleIcon />} label="Free to Use" />
          <Chip icon={<SecurityIcon />} label="Privacy First" />
        </Stack>
      </Box>

      {/* STEPS */}
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: 3, py: 6 }}>
        <Grid container spacing={4}>
          {steps.map((step, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 3,
                  borderTop: `4px solid ${step.color}`,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ color: step.color, mb: 1 }}
                >
                  Step {index + 1}
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ color: '#0F172A' }}>
                  {step.title}
                </Typography>
                <Typography variant="subtitle2" sx={{ color: '#64748B', mb: 2 }}>
                  {step.subtitle}
                </Typography>
                <Typography variant="body1" sx={{ color: '#475569' }}>
                  {step.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* FAQ */}
      <Box sx={{ py: 6 }}>
        <Box sx={{ maxWidth: 1000, mx: 'auto', px: 3 }}>
          <Typography
            variant="h3"
            fontWeight={800}
            textAlign="center"
            sx={{ color: '#0F172A', mb: 4 }}
          >
            Frequently Asked Questions
          </Typography>

          <Grid container spacing={3}>
            {faqs.map((faq, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Accordion
                  sx={{
                    borderRadius: 2,
                    boxShadow: 'none',
                    border: '1px solid #E2E8F0'
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight={600} color="#0F172A">
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography color="#475569" lineHeight={1.7}>
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* CTA */}
      <Box sx={{ py: 6, bgcolor: '#0F172A', color: 'white' }}>
        <Box sx={{ maxWidth: 800, mx: 'auto', px: 3, textAlign: 'center' }}>
          <Typography variant="h3" fontWeight={800} sx={{ mb: 2 }}>
            Ready to Report an Item?
          </Typography>
          <Typography sx={{ opacity: 0.85, mb: 4 }}>
            Help yourself or someone else by reporting a lost or found item.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              onClick={() => navigate('/report-lost')}
              startIcon={<ReportIcon />}
              sx={{ bgcolor: '#DC2626', px: 4 }}
            >
              Report Lost
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/report-found')}
              startIcon={<HandshakeIcon />}
              sx={{ bgcolor: '#16A34A', px: 4 }}
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
