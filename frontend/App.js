import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './src/context/AuthContext';

import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import AdminLoginScreen from './src/screens/AdminLoginScreen';
import UserDashboard from './src/screens/UserDashboard';
import AdminDashboard from './src/screens/AdminDashboard';
import ReviewFormScreen from './src/screens/ReviewFormScreen';
import MyReviewsScreen from './src/screens/MyReviewsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome">
          {/* Auth Screens */}
          <Stack.Screen 
            name="Welcome" 
            component={WelcomeScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ title: 'Login' }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ title: 'Register' }}
          />
          <Stack.Screen 
            name="AdminLogin" 
            component={AdminLoginScreen} 
            options={{ title: 'Admin Login' }}
          />

          {/* User Screens */}
          <Stack.Screen 
            name="UserDashboard" 
            component={UserDashboard} 
            options={{ title: 'Book Reviews', headerLeft: null }}
          />
          <Stack.Screen 
            name="ReviewForm" 
            component={ReviewFormScreen} 
            options={{ title: 'Create Review' }}
          />
          <Stack.Screen 
            name="MyReviews" 
            component={MyReviewsScreen} 
            options={{ title: 'My Reviews' }}
          />

          {/* Admin Screens */}
          <Stack.Screen 
            name="AdminDashboard" 
            component={AdminDashboard} 
            options={{ title: 'Admin Dashboard', headerLeft: null }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}