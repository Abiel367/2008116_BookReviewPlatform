import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Define the API URL for the backend
// const API_URL = 'http://192.168.50.143:8000'; 
const API_URL = 'http://localhost:8000'; // Use localhost for local development

// Create a context for authentication
const AuthContext = createContext({});

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider component to manage authentication state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // State to store user information
  const [token, setToken] = useState(null); // State to store authentication token
  const [loading, setLoading] = useState(true); // State to manage loading status

  useEffect(() => {
    loadStoredAuth(); // Load stored authentication data on component mount
  }, []);

  // Function to load stored authentication data from AsyncStorage
  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error('Error loading auth:', error); // Log any errors
    } finally {
      setLoading(false); // Set loading to false after attempting to load auth data
    }
  };

  // Function to handle user login
  const login = async (fullName, pinCode, isAdmin = false) => {
    try {
      const endpoint = isAdmin ? '/auth/admin/login' : '/auth/login'; // Determine endpoint based on user role
      const response = await axios.post(`${API_URL}${endpoint}`, {
        full_name: fullName,
        pin_code: pinCode
      });

      const { access_token, user } = response.data; // Extract token and user data from response
      
      // Store auth data in AsyncStorage
      await AsyncStorage.setItem('token', access_token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // Set axios default header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      setToken(access_token); // Update token state
      setUser(user); // Update user state
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  // Function to handle user registration
  const register = async (fullName) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        full_name: fullName
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  };

  // Function to handle user logout
  const logout = async () => {
    try {
      // Clear async storage
      await AsyncStorage.multiRemove(['token', 'user']);
      
      // Clear axios headers
      delete axios.defaults.headers.common['Authorization'];
      
      // Clear state
      setToken(null);
      setUser(null);
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  };

  // Define the context value to be provided to children components
  const value = {
    user, // Current user information
    token, // Authentication token
    loading, // Loading status
    login, // Login function
    register, // Register function
    logout, // Logout function
    isAuthenticated: !!token, // Boolean indicating if the user is authenticated
    isAdmin: user?.role === 'admin' // Boolean indicating if the user is an admin
  };

  return (
    <AuthContext.Provider value={value}>
      {children} {/* Render child components */}
    </AuthContext.Provider>
  );
};
