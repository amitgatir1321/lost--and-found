import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Container, Form, InputGroup, Button } from "react-bootstrap";
import { auth } from "../firebaseConfig";

function Navigation({ user, userRole }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await auth.signOut();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // simple client-side navigation to home with search param (Home reads search input too)
    window.location.href = `/?q=${encodeURIComponent(searchQuery)}`;
  };

  const userInitials = user ? user.email?.split("@")[0].slice(0, 2).toUpperCase() : null;

  return (
    <Navbar bg="dark" expand="lg" sticky="top" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">
          🔍 Lost & Found
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {/* compact search in navbar for quicker access */}
          <Form className="me-auto d-none d-md-flex" onSubmit={handleSearchSubmit}>
            <InputGroup>
              <Form.Control
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <Button type="submit" variant="outline-light">
                Search
              </Button>
            </InputGroup>
          </Form>

          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            {user && (
              <>
                <Nav.Link as={Link} to="/report">
                  Report Item
                </Nav.Link>
                <Nav.Link as={Link} to="/messages">
                  Messages
                </Nav.Link>
                {userRole === "admin" && (
                  <Nav.Link as={Link} to="/admin">
                    Admin
                  </Nav.Link>
                )}
                <Nav.Link onClick={handleLogout} className="btn-logout">
                  Logout
                </Nav.Link>
                <Nav.Link disabled className="user-badge">
                  {userInitials ? (
                    <span className="avatar-circle">{userInitials}</span>
                  ) : (
                    user.email
                  )}
                </Nav.Link>
              </>
            )}
            {!user && (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;
