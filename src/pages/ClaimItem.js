// pages/ClaimItem.js
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";

const createClaim = async (foundItem, lostItem) => {
  const { currentUser } = useAuth();

  await addDoc(collection(db, "claims"), {
    foundItemId: foundItem.id,
    lostItemId: lostItem.id,
    foundUserId: foundItem.userId,
    lostUserId: currentUser.uid,
    status: "requested",
    contactShared: false,
    createdAt: serverTimestamp(),
  });
};

export default createClaim;
