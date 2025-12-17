import React, { useState, useEffect } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { db, storage, auth } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

function ReportItem() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("lost");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreview(null);
    }
  }, [image]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLatitude(latitude.toFixed(6));
        setLongitude(longitude.toFixed(6));
        setLocation(
          `My current location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
        );
      },
      () => {
        setError("Unable to access your location.");
      },
      { timeout: 8000 }
    );
  };

  const handleReportItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let imageUrl = "";
      if (image) {
        const storageRef = ref(storage, `items/${Date.now()}_${image.name}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "items"), {
        title,
        description,
        category,
        type,
        location,
        latitude: latitude || null,
        longitude: longitude || null,
        imageUrl,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        verified: false,
        hidden: false,
        createdAt: new Date(),
      });

      setSuccess("Item reported successfully! Awaiting admin verification.");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="mb-4">Report an Item</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleReportItem}>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Black Wallet"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the item..."
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Accessories">Accessories</option>
                <option value="Documents">Documents</option>
                <option value="Clothing">Clothing</option>
                <option value="Pets">Pets</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where was it lost/found?"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Latitude (optional)</Form.Label>
              <Form.Control
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g., 40.7128"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Longitude (optional)</Form.Label>
              <Form.Control
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g., -74.0060"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Upload Image</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                accept="image/*"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="img-fluid rounded"
                    style={{ maxHeight: 200 }}
                  />
                </div>
              )}
            </Form.Group>

            <div className="d-flex gap-2 mb-3">
              <Button
                variant="outline-secondary"
                onClick={handleUseCurrentLocation}
              >
                Use my location
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setLatitude("");
                  setLongitude("");
                  setLocation("");
                }}
              >
                Clear location
              </Button>
            </div>

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Report Item"}
            </Button>
          </Form>
        </div>
      </div>
    </Container>
  );
}

export default ReportItem;
