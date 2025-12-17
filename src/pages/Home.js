import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Badge } from "react-bootstrap";
import { db } from "../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery, categoryFilter, typeFilter]);

  const fetchItems = async () => {
    try {
      const itemsCollection = collection(db, "items");
      const q = query(
        itemsCollection,
        where("verified", "==", true),
        where("hidden", "==", false),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const itemsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(itemsList);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  const filterItems = () => {
    let filtered = items;

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter((item) => item.type === typeFilter);
    }

    setFilteredItems(filtered);
  };

  return (
    <Container className="home-container mt-5 mb-5">
      <div className="page-header">
        <h1>Lost & Found Items</h1>
        <p>Browse verified, visible items posted by the community.</p>
      </div>

      <Row className="filters mb-4">
        <Col md={4}>
          <Form.Control
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search items"
          />
        </Col>
        <Col md={4}>
          <Form.Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Accessories">Accessories</option>
            <option value="Documents">Documents</option>
            <option value="Clothing">Clothing</option>
            <option value="Pets">Pets</option>
            <option value="Other">Other</option>
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filter by type"
          >
            <option value="">All Types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </Form.Select>
        </Col>
      </Row>

      <Row>
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <Col xs={12} sm={6} md={4} className="mb-4" key={item.id}>
              <Card className="h-100 item-card d-flex flex-column">
                {item.imageUrl ? (
                  <div className="image-wrapper">
                    <Card.Img
                      variant="top"
                      src={item.imageUrl}
                      alt={item.title}
                      className="item-img"
                    />
                  </div>
                ) : (
                  <div className="image-placeholder">🏷️ No Image</div>
                )}
                <Card.Body className="d-flex flex-column">
                  <div className="item-meta">
                    <Badge className={item.type === "lost" ? "badge-danger" : "badge-success"}>
                      {item.type.toUpperCase()}
                    </Badge>
                    <Badge className="badge-info">{item.category}</Badge>
                  </div>

                  <Card.Title>{item.title}</Card.Title>
                  <Card.Text className="small">
                    {item.description ? item.description.substring(0, 120) + "..." : ""}
                  </Card.Text>

                  <div className="mt-auto">
                    <small className="text-muted d-block mb-2">📍 {item.location}</small>
                    <Link to={`/item/${item.id}`}>
                      <Button variant="primary" className="w-100">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <div className="no-results text-center">
              <div className="emoji">🔍</div>
              <h4>No items found</h4>
              <p className="text-muted">Try changing your search or filters.</p>
            </div>
          </Col>
        )}
      </Row>
    </Container>
  );
}

export default Home;
