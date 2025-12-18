# Lost and Found Application

A web-based platform for reporting and claiming lost or found items, built with React and Firebase.

## Features

- 🔐 User Authentication (Register/Login)
- 📝 Report Lost Items
- 📝 Report Found Items
- 🔍 Browse and Search Items
- 👤 User Profile Management
- 📋 Track Your Claims
- 👨‍💼 Admin Dashboard
- 📧 Contact Form

## Tech Stack

- **Frontend**: React 18
- **UI Framework**: Material-UI (MUI) v7 & React Bootstrap
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Routing**: React Router DOM v6
- **Maps**: Google Maps API (React Google Maps)

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

## Security Notes

- All sensitive credentials are stored in `.env.local` (git-ignored)
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
