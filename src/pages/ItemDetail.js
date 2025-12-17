import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Alert, Badge } from "react-bootstrap";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

function ItemDetail({ user }) {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const docRef = doc(db, "items", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setItem({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError("Item not found");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="spinner-border" role="status" />;
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const mapCenter = {
    lat: item?.latitude ? parseFloat(item.latitude) : 0,
    lng: item?.longitude ? parseFloat(item.longitude) : 0,
  };

  const reporterInitials =
    item?.userEmail ? item.userEmail.split("@")[0].slice(0, 2).toUpperCase() : "RU";

  return (
    <Container className="mt-5 mb-5">
      <Row className="g-4">
        <Col lg={6}>
          <Card className="h-100">
            {item?.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="img-fluid rounded-top"
                style={{ width: "100%", maxHeight: 420, objectFit: "cover" }}
              />
            )}
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div
                  className="me-3 avatar-circle"
                  style={{ background: "#e9ecef", color: "#333" }}
                >
                  {reporterInitials}
                </div>
                <div>
                  <h4 className="mb-0">{item?.title}</h4>
                  <small className="text-muted">{item?.userEmail}</small>
                </div>
              </div>
              <p className="text-muted">{item?.description}</p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card>
            <Card.Body>
              <p>
                <strong>📍 Location:</strong> {item?.location}
              </p>
              <p>
                <strong>📅 Posted:</strong>{" "}
                {item?.createdAt?.toDate?.().toLocaleString()}
              </p>
              {user && user.uid !== item?.userId && (
                <Link to={`/messages?contact=${item?.userId}`}>
                  <Button variant="primary" className="w-100">
                    Contact Reporter
                  </Button>
                </Link>
              )}
            </Card.Body>
          </Card>

          {item?.latitude && item?.longitude && (
            <Card className="mt-3">
              <Card.Body style={{ padding: 0 }}>
                <div style={{ width: "100%", height: 320 }}>
                  <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
                    <GoogleMap
                      mapContainerStyle={{ width: "100%", height: "100%" }}
                      center={mapCenter}
                      zoom={15}
                    >
                      <Marker position={mapCenter} />
                    </GoogleMap>
                  </LoadScript>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default ItemDetail;
