import React, { useState, useEffect } from "react";
import { Container, Table, Button, Badge, Alert } from "react-bootstrap";
import { db } from "../firebaseConfig";
import { collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";

function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchAllItems();
  }, []);

  const fetchAllItems = async () => {
    try {
      const itemsCollection = collection(db, "items");
      const snapshot = await getDocs(itemsCollection);
      const itemsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(itemsList);
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };

  const verifyItem = async (itemId) => {
    try {
      await updateDoc(doc(db, "items", itemId), { verified: true });
      setMessage("Item verified successfully!");
      fetchAllItems();
    } catch (err) {
      setMessage("Error verifying item: " + err.message);
    }
  };

  const deleteItem = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "items", itemId));
        setMessage("Item deleted successfully!");
        fetchAllItems();
      } catch (err) {
        setMessage("Error deleting item: " + err.message);
      }
    }
  };

  const hideItem = async (itemId, isHidden) => {
    try {
      await updateDoc(doc(db, "items", itemId), { hidden: !isHidden });
      setMessage(isHidden ? "Item unhidden!" : "Item hidden!");
      fetchAllItems();
    } catch (err) {
      setMessage("Error updating item: " + err.message);
    }
  };

  if (loading) {
    return <div className="spinner-border" role="status" />;
  }

  return (
    <Container className="mt-5 mb-5">
      <h2 className="mb-4">Admin Dashboard</h2>
      {message && (
        <Alert
          variant="info"
          onClose={() => setMessage("")}
          dismissible
        >
          {message}
        </Alert>
      )}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Category</th>
            <th>Reporter</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>
                <Badge bg={item.type === "lost" ? "danger" : "success"}>
                  {item.type}
                </Badge>
              </td>
              <td>{item.category}</td>
              <td>{item.userEmail}</td>
              <td>
                <Badge bg={item.verified ? "success" : "warning"}>
                  {item.verified ? "Verified" : "Pending"}
                </Badge>
                {item.hidden && (
                  <Badge bg="secondary" className="ms-2">
                    Hidden
                  </Badge>
                )}
              </td>
              <td>
                {!item.verified && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => verifyItem(item.id)}
                    className="me-2"
                  >
                    Verify
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="warning"
                  onClick={() => hideItem(item.id, item.hidden)}
                  className="me-2"
                >
                  {item.hidden ? "Unhide" : "Hide"}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => deleteItem(item.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default AdminDashboard;
