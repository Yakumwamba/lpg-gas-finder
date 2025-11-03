/**
 * Authentication Context
 * Manages user authentication state, token persistence, and user data
 * Integrates with backend API for signup, signin, and phone verification
 */

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI, apiClient, userAPI } from '../config/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState(null);
  const [phoneVerificationState, setPhoneVerificationState] = useState(null);

  /**
   * Initialize auth state on app start
   * Checks if user has valid stored token
   */
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        setIsLoading(true);
        // Check if token exists and is valid
        const token = await apiClient.token;
        if (token) {
          try {
            // Verify token is still valid by fetching user profile
            const profile = await userAPI.getProfile();
            setUser(profile);
            setError(null);
          } catch (err) {
            // Token might be expired, clear it
            await apiClient.clearToken();
            setUser(null);
          }
        }
      } catch (e) {
        console.error('Error initializing auth:', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  /**
   * Sign up new user
   */
  const authContext = {
    signUp: useCallback(
      async (email, password, name, userType = 'customer') => {
        setIsSigningUp(true);
        setError(null);
        try {
          const response = await authAPI.signup(email, password, name, userType);

          // Store token
          if (response.token) {
            await apiClient.setToken(response.token);
          }

          // Set user data
          if (response.user) {
            setUser(response.user);
          }

          return { success: true, data: response };
        } catch (err) {
          const errorMsg = err.message || 'Failed to sign up. Please try again.';
          setError(errorMsg);
          return { success: false, error: errorMsg };
        } finally {
          setIsSigningUp(false);
        }
      },
      []
    ),

    /**
     * Sign in existing user
     */
    signIn: useCallback(
      async (email, password) => {
        setIsSigningIn(true);
        setError(null);
        try {
          const response = await authAPI.signin(email, password);

          // Store token
          if (response.token) {
            await apiClient.setToken(response.token);
          }

          // Set user data
          if (response.user) {
            setUser(response.user);
          }

          return { success: true, data: response };
        } catch (err) {
          const errorMsg = err.message || 'Failed to sign in. Please check your credentials.';
          setError(errorMsg);
          return { success: false, error: errorMsg };
        } finally {
          setIsSigningIn(false);
        }
      },
      []
    ),

    /**
     * Sign out current user
     */
    signOut: useCallback(
      async () => {
        try {
          await authAPI.signout();
        } catch (err) {
          console.error('Error during signout API call:', err);
        } finally {
          // Clear token and user regardless of API call success
          await apiClient.clearToken();
          setUser(null);
          setError(null);
          setPhoneVerificationState(null);
        }
      },
      []
    ),

    /**
     * Request phone verification code
     */
    sendPhoneCode: useCallback(
      async (phoneNumber) => {
        setError(null);
        try {
          const response = await authAPI.sendPhoneCode(phoneNumber);
          setPhoneVerificationState({
            phoneNumber,
            codeRequested: true,
            timestamp: new Date(),
          });
          return { success: true, data: response };
        } catch (err) {
          const errorMsg = err.message || 'Failed to send verification code.';
          setError(errorMsg);
          return { success: false, error: errorMsg };
        }
      },
      []
    ),

    /**
     * Verify phone with code
     */
    verifyPhone: useCallback(
      async (phoneNumber, code) => {
        setError(null);
        try {
          const response = await authAPI.verifyPhone(phoneNumber, code);
          setPhoneVerificationState({
            ...phoneVerificationState,
            verified: true,
          });
          return { success: true, data: response };
        } catch (err) {
          const errorMsg = err.message || 'Failed to verify phone.';
          setError(errorMsg);
          return { success: false, error: errorMsg };
        }
      },
      [phoneVerificationState]
    ),

    /**
     * Update user profile
     */
    updateProfile: useCallback(
      async (profileData) => {
        setError(null);
        try {
          const response = await userAPI.updateProfile(profileData);
          setUser({ ...user, ...response });
          return { success: true, data: response };
        } catch (err) {
          const errorMsg = err.message || 'Failed to update profile.';
          setError(errorMsg);
          return { success: false, error: errorMsg };
        }
      },
      [user]
    ),

    /**
     * Update user location
     */
    updateLocation: useCallback(
      async (latitude, longitude) => {
        setError(null);
        try {
          await userAPI.updateLocation(latitude, longitude);
          return { success: true };
        } catch (err) {
          const errorMsg = err.message || 'Failed to update location.';
          setError(errorMsg);
          return { success: false, error: errorMsg };
        }
      },
      []
    ),

    /**
     * Clear error messages
     */
    clearError: useCallback(
      () => {
        setError(null);
      },
      []
    ),

    // State
    isLoading,
    isSigningIn,
    isSigningUp,
    user,
    error,
    phoneVerificationState,
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
