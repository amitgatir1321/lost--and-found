import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminRoute from './components/AdminRoute';
import PrivateRoute from './components/PrivateRoute';
import EmailVerificationRoute from './components/EmailVerificationRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import EmailVerification from './pages/EmailVerification';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import AdminDashboard from './pages/AdminDashboard';
import AdminClaimsPage from './pages/AdminClaimsPage';
import SetupAdmin from './pages/SetupAdmin';
import Contact from './pages/Contact';
import Profile from './pages/Profile';
import MyItems from './pages/MyItems';
import MyClaims from './pages/MyClaims';
import HowItWorks from './pages/HowItWorks';
import BrowseItems from './pages/BrowseItems';
import ItemDetail from './pages/ItemDetail';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Box sx={{ flex: 1 }}>
              <Routes>
                {/* 🔐 PUBLIC ROUTES */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/auth/verify-email" element={<EmailVerification />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/browse-items" element={<BrowseItems />} />
                <Route path="/item/:itemType/:itemId" element={<ItemDetail />} />
                <Route path="/setup-admin" element={<SetupAdmin />} />
                <Route path="/contact" element={<Contact />} />

                {/* 👤 USER PROTECTED ROUTES */}
                <Route
                  path="/report-lost"
                  element={
                    <EmailVerificationRoute>
                      <ReportLost />
                    </EmailVerificationRoute>
                  }
                />
                <Route
                  path="/report-found"
                  element={
                    <EmailVerificationRoute>
                      <ReportFound />
                    </EmailVerificationRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/my-items"
                  element={
                    <PrivateRoute>
                      <MyItems />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/my-claims"
                  element={
                    <PrivateRoute>
                      <MyClaims />
                    </PrivateRoute>
                  }
                />

                {/* 🧑‍💼 ADMIN PROTECTED ROUTES */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/claims"
                  element={
                    <AdminRoute>
                      <AdminClaimsPage />
                    </AdminRoute>
                  }
                />

                {/* 🚫 CATCH ALL - REDIRECT TO HOME */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
