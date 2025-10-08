import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChange, 
  signUpWithEmailAndPassword as firebaseSignUp,
  signInWithEmailAndPassword as firebaseSignIn,
  signOutUser,
  sendPasswordReset,
  getUserProfile,
  updateUserProfile
} from '../firebase/auth';

// Create Auth Context
const AuthContext = createContext({});

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sign up function
  const signUp = async (email, password, firstName, lastName) => {
    try {
      setError(null);
      const result = await firebaseSignUp(email, password, firstName, lastName);
      if (result.success) {
        // The user profile will be loaded by the auth state listener
        return { success: true, user: result.user };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during sign up';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Sign in function
  const signIn = async (email, password) => {
    try {
      setError(null);
      const result = await firebaseSignIn(email, password);
      if (result.success) {
        return { success: true, user: result.user };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during sign in';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setError(null);
      const result = await signOutUser();
      if (result.success) {
        setCurrentUser(null);
        setUserProfile(null);
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred during sign out';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    try {
      setError(null);
      const result = await sendPasswordReset(email);
      if (result.success) {
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred while sending reset email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      if (!currentUser) {
        throw new Error('No user is currently signed in');
      }
      
      const result = await updateUserProfile(currentUser.uid, profileData);
      if (result.success) {
        // Reload user profile
        await loadUserProfile(currentUser.uid);
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred while updating profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Load user profile data
  const loadUserProfile = async (uid) => {
    try {
      const result = await getUserProfile(uid);
      if (result.success) {
        setUserProfile(result.data);
      } else {
        console.error('Failed to load user profile:', result.error);
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
    }
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // User is signed in, load their profile
        await loadUserProfile(user.uid);
      } else {
        // User is signed out, clear profile
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Context value
  const value = {
    // State
    currentUser,
    userProfile,
    loading,
    error,
    
    // Authentication methods
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    clearError,
    
    // Helper methods
    isAuthenticated: !!currentUser,
    isLoading: loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;