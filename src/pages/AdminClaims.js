// pages/AdminClaims.js
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";

const approveClaim = async (claimId) => {
  await updateDoc(doc(db, "claims", claimId), {
    status: "approved",
    contactShared: true,
  });
};
