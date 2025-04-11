import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getUserData } from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    setIsLoading(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      
      if (userToken) {
        // If we have a token, fetch fresh user data
        const userData = await getUserData(userToken);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
      // Clear any invalid data
      await AsyncStorage.removeItem('userToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiLogin(email, password);
      
      if (response.token && response.user) {
        // Store token for future app sessions
        await AsyncStorage.setItem('userToken', response.token);
        setUser(response.user);
        return response.user;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to log in. Please check your credentials.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRegister(name, email, password, role);
      
      if (response.token && response.user) {
        // Store token for future app sessions
        await AsyncStorage.setItem('userToken', response.token);
        setUser(response.user);
        return response.user;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Call API to logout (invalidate token on server)
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if API fails
    }
    
    // Clear local storage and state
    await AsyncStorage.removeItem('userToken');
    setUser(null);
    setIsLoading(false);
  };

  // Update user context without full login
  const updateUserContext = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        updateUserContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
