import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Create a new claim for a found/lost item
 */
export const submitClaim = async (claimData) => {
  try {
    const claimsRef = collection(db, 'claims');
    const claimDoc = await addDoc(claimsRef, {
      ...claimData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, claimId: claimDoc.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get all claims for a specific lost item
 */
export const getClaimsForLostItem = async (lostItemId) => {
  try {
    const q = query(
      collection(db, 'claims'),
      where('lostItemId', '==', lostItemId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching claims for lost item:', error);
    return [];
  }
};

/**
 * Get all claims for a specific found item
 */
export const getClaimsForFoundItem = async (foundItemId) => {
  try {
    const q = query(
      collection(db, 'claims'),
      where('foundItemId', '==', foundItemId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching claims for found item:', error);
    return [];
  }
};

/**
 * Get all claims submitted by a user (as claimant)
 */
export const getUserClaimsAsClaimant = async (userId) => {
  try {
    const q = query(
      collection(db, 'claims'),
      where('claimantId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching user claims as claimant:', error);
    return [];
  }
};

/**
 * Get all claims related to user's items (as item owner)
 */
export const getUserClaimsAsItemOwner = async (userId, itemType = 'lost') => {
  try {
    const q = query(
      collection(db, 'claims'),
      where('itemOwnerId', '==', userId),
      where('itemType', '==', itemType),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching user claims as item owner:', error);
    return [];
  }
};

/**
 * Get all claims (admin only)
 */
export const getAllClaims = async () => {
  try {
    const q = query(
      collection(db, 'claims'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching all claims:', error);
    return [];
  }
};

/**
 * Get single claim details
 */
export const getClaimDetails = async (claimId) => {
  try {
    const claimSnap = await getDoc(doc(db, 'claims', claimId));
    if (!claimSnap.exists()) {
      throw new Error('Claim not found');
    }
    return { id: claimSnap.id, ...claimSnap.data() };
  } catch (error) {
    console.error('Error fetching claim details:', error);
    return null;
  }
};

/**
 * Approve a claim (item owner action)
 */
export const approveClaim = async (claimId, contactInfo = null) => {
  try {
    const claimRef = doc(db, 'claims', claimId);
    const updateData = {
      status: 'approved',
      updatedAt: serverTimestamp(),
      approvedAt: serverTimestamp()
    };

    // Add claimant contact info if provided
    if (contactInfo) {
      updateData.claimantContactInfo = contactInfo;
    }

    await updateDoc(claimRef, updateData);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Reject a claim (item owner action)
 */
export const rejectClaim = async (claimId, rejectionReason = '') => {
  try {
    const claimRef = doc(db, 'claims', claimId);
    await updateDoc(claimRef, {
      status: 'rejected',
      updatedAt: serverTimestamp(),
      rejectedAt: serverTimestamp(),
      rejectionReason: rejectionReason
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Item owner shares contact info with claimant (after approval)
 */
export const shareOwnerContact = async (claimId, contactInfo) => {
  try {
    const claimRef = doc(db, 'claims', claimId);
    await updateDoc(claimRef, {
      ownerContactInfo: contactInfo,
      contactSharedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Admin resolves a claim
 */
export const resolveClaim = async (claimId, notes = '') => {
  try {
    const claimRef = doc(db, 'claims', claimId);
    await updateDoc(claimRef, {
      status: 'resolved',
      updatedAt: serverTimestamp(),
      resolvedAt: serverTimestamp(),
      resolutionNotes: notes
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get claim with related item details
 */
export const getClaimWithItemDetails = async (claimId) => {
  try {
    const claim = await getClaimDetails(claimId);
    if (!claim) return null;

    // Fetch the item details
    const itemCol = claim.itemType === 'lost' ? 'lost_items' : 'found_items';
    const item = await getDoc(doc(db, itemCol, claim.itemId));

    if (!item.exists()) {
      throw new Error('Related item not found');
    }

    return {
      ...claim,
      item: { id: item.id, ...item.data() }
    };
  } catch (error) {
    console.error('Error fetching claim with item details:', error);
    return null;
  }
};

/**
 * Check if user has already claimed an item
 */
export const checkExistingClaim = async (claimantId, itemId, itemType) => {
  try {
    const q = query(
      collection(db, 'claims'),
      where('claimantId', '==', claimantId),
      where('itemId', '==', itemId),
      where('itemType', '==', itemType),
      where('status', 'in', ['pending', 'approved'])
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking existing claim:', error);
    return false;
  }
};
