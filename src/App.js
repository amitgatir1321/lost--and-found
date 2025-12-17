import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./firebaseConfig";
import Navigation from "./components/Navigation";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ReportItem from "./pages/ReportItem";
import ItemDetail from "./pages/ItemDetail";
import AdminDashboard from "./pages/AdminDashboard";
import Messaging from "./pages/Messaging";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const role = await getUserRole(currentUser.uid);
        setUserRole(role);
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getUserRole = async (uid) => {
    const { doc, getDoc } = await import("firebase/firestore");
    const { db } = await import("./firebaseConfig");
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.data()?.role || "user";
  };

  if (loading) {
    return <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>;
  }

  return (
    <Router>
      <Navigation user={user} userRole={userRole} />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/report" element={user ? <ReportItem /> : <Navigate to="/login" />} />
        <Route path="/item/:id" element={<ItemDetail user={user} />} />
        <Route path="/messages" element={user ? <Messaging user={user} /> : <Navigate to="/login" />} />
        <Route path="/admin" element={user && userRole === "admin" ? <AdminDashboard /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
