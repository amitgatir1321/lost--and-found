import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        email,
        role: "user",
        createdAt: new Date(),
      });

      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container className="mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="mb-4">Register</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleRegister}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Register
            </Button>
          </Form>
          <p className="mt-3">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </Container>
  );
}

export default Register;
