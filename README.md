# Lost & Found Application

A comprehensive web-based platform for reporting and claiming lost or found items, built with React and Firebase. Features role-based authentication, admin management, and secure Firestore authorization.

## ✨ Features

### 👤 User Features
- 🔐 Secure Email/Password Registration & Login
- 📧 Email verification requirement
- 📝 Report lost items with details
- 🔍 Browse all lost and found items
- 💬 Claim found items with messages
- 👤 User profile management
- 📋 Track your claims and reports
- 🔄 Password reset via email

### 🧑‍💼 Admin Features
- 🔑 Dedicated admin login
- 📊 Admin dashboard with full control
- 📦 Post found items
- 🔗 Match lost & found items
- ✅ Manage and approve claims
- 🗑️ Moderate user reports
- 📧 View contact messages
- 👥 User management

### 🔐 Security
- Role-based access control (RBAC)
- Firestore security rules
- Email verification requirement
- Admin email configuration
- Single admin account model
- Ownership validation on all operations

## 🛠️ Tech Stack

- **Frontend**: React 18
- **UI Framework**: Material-UI (MUI) v5 & React Bootstrap
- **Authentication**: Firebase Authentication (Email/Password + Google OAuth)
- **Database**: Firestore (with security rules)
- **Storage**: Cloud Storage
- **Routing**: React Router DOM v6
- **State Management**: React Context API
- **Authorization**: Role-based access control (RBAC)

## Prerequisites

Before you begin, ensure you have:
- Node.js (v14 or higher)
- npm or yarn
- A Firebase project set up
- Firebase credentials

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd lost-and-found
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory with your Firebase credentials:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

   > ⚠️ **Important**: Never commit `.env.local` to version control. It's already included in `.gitignore`.

4. **Start the development server**
   ```bash
   npm start
   ```

   The app will open at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
lost-and-found/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable components
│   │   ├── AdminRoute.js
│   │   ├── Footer.js
│   │   ├── Navbar.js
│   │   └── PrivateRoute.js
│   ├── contexts/        # React Context providers
│   │   └── AuthContext.js
│   ├── firebase/        # Firebase configuration
│   │   └── config.js
│   ├── pages/          # Page components
│   │   ├── AdminDashboard.js
│   │   ├── Contact.js
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── MyClaims.js
│   │   ├── Profile.js
│   │   ├── Register.js
│   │   ├── ReportFound.js
│   │   └── ReportLost.js
│   ├── theme/          # MUI theme configuration
│   │   └── theme.js
│   ├── App.js          # Main app component
│   └── index.js        # Entry point
├── .env.local          # Environment variables (not in git)
├── .gitignore
└── package.json
```

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

## Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Enable Firebase Storage
5. Copy your Firebase config credentials to `.env.local`

## Deployment

### Build for Production
```bash
npm run build
```

The optimized production build will be in the `build/` folder, ready to deploy to your hosting platform.

### Hosting Options
- Firebase Hosting
- Vercel
- Netlify
- GitHub Pages

## 📚 Documentation

Complete documentation is available in these files:

### � Start Here
- **[INDEX.md](INDEX.md)** - Navigation guide for all documentation
- **[IMPLEMENTATION_PACKAGE.md](IMPLEMENTATION_PACKAGE.md)** - Overview of everything implemented

### 🔐 Authentication & Authorization
- **[AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md)** - Complete guide to authentication flows, user roles, and authorization implementation
- **[README_AUTHENTICATION.md](README_AUTHENTICATION.md)** - Implementation summary and feature overview

### 🗄️ Database Schema
- **[FIRESTORE_SCHEMA.md](FIRESTORE_SCHEMA.md)** - Complete Firestore database schema, collections, fields, and security rules

### 🏗️ Architecture & Design
- **[ARCHITECTURE_OVERVIEW.md](ARCHITECTURE_OVERVIEW.md)** - Visual system architecture, data flows, and security layers

### 🚀 Setup & Configuration
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Step-by-step setup instructions for Firebase, Firestore, and deployment
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick reference for common configurations and commands

### 📋 Deployment & Testing
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - 15-phase deployment checklist with security verification
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Detailed summary of implementation with statistics

---

## 🔑 Quick Start with Authentication

### For Users:
1. Go to [/register](http://localhost:3000/register)
2. Create account with email and password
3. Verify email from inbox
4. Login at [/login](http://localhost:3000/login)
5. Report lost items or browse found items

### For Admins:
1. Create admin account in Firebase Console
2. Set `REACT_APP_ADMIN_EMAIL` in `.env`
3. Go to [/admin-login](http://localhost:3000/admin-login)
4. Access admin dashboard at [/admin](http://localhost:3000/admin)

---

## 🔐 Security Notes

- **Never commit `.env` or sensitive credentials** - Use `.env.local` or `.env.example`
- **Deploy Firestore rules before production** - Use `firebase deploy --only firestore:rules`
- **Enable email verification** - Required for all user logins
- **Use HTTPS in production** - Firebase automatically enforces this
- **Admin is manually created** - No registration UI for admin accounts
- **Role-based access control** - Users cannot escalate to admin privileges

---

## 🛠️ Environment Setup

### Required Environment Variables
```bash
REACT_APP_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID
REACT_APP_ADMIN_EMAIL           # Critical! Set to your admin email
```

### Get Your Credentials
1. Firebase Console → Project Settings
2. Copy Web app config
3. Paste into `.env.local`

---- All sensitive credentials are stored in `.env.local` (git-ignored)
- Firebase security rules should be configured in `firestore.rules`
- Never commit API keys or credentials to the repository

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues or questions, please open an issue in the GitHub repository.
