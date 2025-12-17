import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, ListGroup, Card } from "react-bootstrap";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { useSearchParams } from "react-router-dom";

function Messaging({ user }) {
  const [searchParams] = useSearchParams();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(
    searchParams.get("contact") || null
  );
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages();
    }
  }, [selectedContact]);

  const fetchContacts = async () => {
    try {
      const msgCollection = collection(db, "messages");
      const q = query(
        msgCollection,
        where("participants", "array-contains", user.uid)
      );
      const snapshot = await getDocs(q);
      const uniqueContacts = new Set();

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const otherUser = data.participants.find((p) => p !== user.uid);
        uniqueContacts.add(otherUser);
      });

      setContacts(Array.from(uniqueContacts));
    } catch (err) {
      console.error("Error fetching contacts:", err);
    }
  };

  const fetchMessages = async () => {
    try {
      const msgCollection = collection(db, "messages");
      const q = query(
        msgCollection,
        where("participants", "array-contains", user.uid)
      );
      const snapshot = await getDocs(q);
      const userMessages = snapshot.docs
        .filter((doc) => {
          const data = doc.data();
          return data.participants.includes(selectedContact);
        })
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.timestamp - b.timestamp);

      setMessages(userMessages);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "messages"), {
        senderId: user.uid,
        recipientId: selectedContact,
        participants: [user.uid, selectedContact],
        content: newMessage,
        timestamp: new Date(),
      });

      setNewMessage("");
      fetchMessages();
      fetchContacts();
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5 mb-5">
      <h2 className="mb-4">Messages</h2>

      <Row>
        <Col md={4}>
          <h5>Contacts</h5>
          <ListGroup>
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <ListGroup.Item
                  key={contact}
                  active={contact === selectedContact}
                  onClick={() => setSelectedContact(contact)}
                  style={{ cursor: "pointer" }}
                >
                  {contact}
                </ListGroup.Item>
              ))
            ) : (
              <p className="text-muted">No contacts yet</p>
            )}
          </ListGroup>
        </Col>

        <Col md={8}>
          {selectedContact ? (
            <>
              <Card>
                <Card.Header>
                  <strong>Chat with {selectedContact}</strong>
                </Card.Header>
                <Card.Body style={{ height: "400px", overflowY: "auto" }}>
                  {messages.length > 0 ? (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`mb-2 p-2 rounded ${
                          msg.senderId === user.uid
                            ? "bg-primary text-white text-end"
                            : "bg-light"
                        }`}
                      >
                        <p className="mb-1">{msg.content}</p>
                        <small>
                          {msg.timestamp?.toDate?.().toLocaleTimeString()}
                        </small>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No messages yet</p>
                  )}
                </Card.Body>
              </Card>

              <Form onSubmit={sendMessage} className="mt-3">
                <Form.Group className="mb-2">
                  <Form.Control
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="w-100"
                >
                  {loading ? "Sending..." : "Send"}
                </Button>
              </Form>
            </>
          ) : (
            <p className="text-muted">Select a contact to start messaging</p>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Messaging;
