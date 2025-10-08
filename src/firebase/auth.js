import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword as firebaseSignIn, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './config.js';

// Sign up with email and password
export const signUpWithEmailAndPassword = async (email, password, firstName, lastName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user's display name
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`
    });
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      firstName: firstName,
      lastName: lastName,
      displayName: `${firstName} ${lastName}`,
      bio: '',
      favoriteGenres: [],
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      preferences: {
        theme: 'dark',
        notifications: true
      },
      stats: {
        savedItems: 0,
        recommendations: 0,
        readingTime: '0 hours'
      }
    });
    
    return { success: true, user };
  } catch (error) {
    console.error('Error signing up:', error);
    return { success: false, error: error.message };
  }
};

// Sign in with email and password
export const signInWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await firebaseSignIn(auth, email, password);
    const user = userCredential.user;
    
    // Update last login time
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      lastLoginAt: new Date().toISOString()
    });
    
    return { success: true, user };
  } catch (error) {
    console.error('Error signing in:', error);
    return { success: false, error: error.message };
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Get user profile data
export const getUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: 'User profile not found' };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error: error.message };
  }
};

// Update user profile
export const updateUserProfile = async (uid, profileData) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      ...profileData,
      updatedAt: new Date().toISOString()
    });
    
    // Update auth profile if display name changed
    if (profileData.firstName || profileData.lastName) {
      await updateProfile(auth.currentUser, {
        displayName: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim()
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: error.message };
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};