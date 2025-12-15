import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// WelcomeScreen component serves as the landing page for the app
const WelcomeScreen = () => {
  const navigation = useNavigation(); // Hook to navigate between screens

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" /> {/* Sets the status bar style */}
      
      <View style={styles.content}>
        <Text style={styles.logo}>📚</Text> {/* Displays a book emoji as the logo */}
        
        <Text style={styles.title}>Book Review Platform</Text> {/* App title */}
        <Text style={styles.subtitle}>
          Discover, review, and share your favorite books
        </Text> {/* App subtitle */}

        <View style={styles.buttonContainer}>
          {/* Button to navigate to the Register screen */}
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>

          {/* Button to navigate to the User Login screen */}
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              User Login
            </Text>
          </TouchableOpacity>

          {/* Button to navigate to the Admin Login screen */}
          <TouchableOpacity
            style={[styles.button, styles.adminButton]}
            onPress={() => navigation.navigate('AdminLogin')}
          >
            <Text style={styles.buttonText}>Admin Login</Text>
          </TouchableOpacity>
        </View>

        {/* Note for admin login credentials */}
        <Text style={styles.note}>
          Note: Use "Abiel Robinson" and PIN "0000" for admin access
        </Text>
      </View>
    </SafeAreaView>
  );
};

// Styles for the WelcomeScreen component
const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#f5f5f5', 
  },
  content: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, 
  },
  logo: {
    fontSize: 100, 
    marginBottom: 30, 
    textAlign: 'center', 
  },
  title: {
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 10, 
    textAlign: 'center', 
  },
  subtitle: {
    fontSize: 16, 
    color: '#666',
    textAlign: 'center', 
    marginBottom: 50, 
    paddingHorizontal: 20, 
  },
  buttonContainer: {
    width: '100%', 
    maxWidth: 300, 
  },
  button: {
    paddingVertical: 15, 
    borderRadius: 8, 
    marginBottom: 15,
    alignItems: 'center', 
    justifyContent: 'center', 
  },
  primaryButton: {
    backgroundColor: '#4a6fa5', 
  },
  secondaryButton: {
    backgroundColor: 'transparent', 
    borderWidth: 1, 
    borderColor: '#4a6fa5', 
  },
  adminButton: {
    backgroundColor: '#e74c3c', 
    marginTop: 10, 
  },
  buttonText: {
    color: 'white',
    fontSize: 16, 
    fontWeight: '600', 
  },
  secondaryButtonText: {
    color: '#4a6fa5', 
  },
  note: {
    marginTop: 40, 
    fontSize: 12,
    color: '#999', 
    textAlign: 'center', 
    fontStyle: 'italic', 
  },
});

export default WelcomeScreen; // Exports the component for use in other parts of the app