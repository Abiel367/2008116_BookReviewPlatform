import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Define the API URL for the backend
// const API_URL = 'http://192.168.50.143:8000';  
const API_URL = 'http://localhost:8000'; 

// Genre options for book reviews
const GENRES = [
  "Fiction", "Non-Fiction", "Mystery", "Romance", 
  "Science Fiction", "Fantasy", "Biography", 
  "History", "Self-Help", "Young Adult"
];

// ReviewFormScreen component definition
const ReviewFormScreen = () => {
  // State variables for form fields and UI behavior
  const [bookTitle, setBookTitle] = useState(''); // Book title input
  const [author, setAuthor] = useState(''); // Author input
  const [rating, setRating] = useState(5); // Rating input (default 5)
  const [genre, setGenre] = useState(''); // Genre selection
  const [reviewText, setReviewText] = useState(''); // Review text input
  const [loading, setLoading] = useState(false); // Loading state for submit button
  const [showGenreModal, setShowGenreModal] = useState(false); // Modal visibility for genre selection
  
  const navigation = useNavigation(); // Hook to navigate between screens
  const route = useRoute(); // Hook to access route parameters
  const { token } = useAuth(); // Retrieve authentication token from context
  const reviewToEdit = route.params?.review; // Check if editing an existing review

  // Populate form fields if editing an existing review
  React.useEffect(() => {
    if (reviewToEdit) {
      setBookTitle(reviewToEdit.book_title);
      setAuthor(reviewToEdit.author);
      setRating(reviewToEdit.rating);
      setGenre(reviewToEdit.genre);
      setReviewText(reviewToEdit.review_text);
    }
  }, [reviewToEdit]);

  // Validate form inputs before submission
  const validateForm = () => {
    if (!bookTitle.trim()) {
      Alert.alert('Error', 'Please enter book title');
      return false;
    }
    if (!author.trim()) {
      Alert.alert('Error', 'Please enter author name');
      return false;
    }
    if (!genre) {
      Alert.alert('Error', 'Please select a genre');
      return false;
    }
    if (reviewText.trim().length < 10) {
      Alert.alert('Error', 'Review text should be at least 10 characters');
      return false;
    }
    return true;
  };

  // Handle form submission for creating or updating a review
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true); // Show loading indicator
    try {
      const reviewData = {
        book_title: bookTitle,
        author: author,
        rating: rating,
        review_text: reviewText,
        genre: genre
      };

      console.log('Submitting review:', reviewData);
      console.log('Token:', token ? 'Present' : 'Missing');

      // Configure headers for the API request
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (reviewToEdit) {
        // Update existing review
        const response = await axios.put(
          `${API_URL}/reviews/${reviewToEdit.id}`,
          reviewData,
          config
        );
        console.log('Update response:', response.data);
        Alert.alert('Success', 'Review updated successfully!');
      } else {
        // Create new review
        const response = await axios.post(
          `${API_URL}/reviews`, 
          reviewData, 
          config
        );
        console.log('Create response:', response.data);
        Alert.alert('Success', 'Review created successfully!');
      }
      
      // Clear form fields and navigate back
      setBookTitle('');
      setAuthor('');
      setRating(5);
      setGenre('');
      setReviewText('');
      navigation.goBack(); // Navigate back to the previous screen
      
    } catch (error) {
      console.error('Error saving review:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to save review';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage); // Show error message
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  // Render rating stars for user selection
  const renderRatingStars = () => {
    return (
      <View style={styles.ratingContainer}>
        <Text style={styles.label}>Rating</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)} // Update rating on star press
              style={styles.starButton}
            >
              <Text style={[
                styles.star,
                star <= rating ? styles.starSelected : styles.starUnselected
              ]}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.ratingText}>{rating}/5</Text> {/* Display selected rating */}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>
            {reviewToEdit ? 'Edit Review' : 'Write a Review'}
          </Text>

          {/* Book Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Book Title *</Text>
            <TextInput
              style={styles.input}
              value={bookTitle}
              onChangeText={setBookTitle}
              placeholder="Enter book title"
              editable={!loading}
            />
          </View>

          {/* Author */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Author *</Text>
            <TextInput
              style={styles.input}
              value={author}
              onChangeText={setAuthor}
              placeholder="Enter author name"
              editable={!loading}
            />
          </View>

          {/* Genre Dropdown */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Genre *</Text>
            <TouchableOpacity
              style={[styles.input, styles.dropdown]}
              onPress={() => setShowGenreModal(true)}
              disabled={loading}
            >
              <Text style={genre ? styles.dropdownText : styles.placeholderText}>
                {genre || 'Select a genre'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Rating Stars */}
          {renderRatingStars()}

          {/* Review Text */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Review *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="Write your review here (minimum 10 characters)..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!loading}
            />
            <Text style={styles.charCount}>
              {reviewText.length} characters {reviewText.length < 10 ? '(minimum 10)' : ''}
            </Text>
          </View>

          {/* Action Buttons - Made more prominent */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                loading && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Saving...' : reviewToEdit ? 'Update Review' : 'Submit Review'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Help text */}
          <Text style={styles.helpText}>
            * Required fields
          </Text>
        </View>
      </ScrollView>

      {/* Genre Modal */}
      <Modal
        visible={showGenreModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGenreModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowGenreModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Genre</Text>
                <ScrollView style={styles.genreList}>
                  {GENRES.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.genreItem,
                        genre === item && styles.selectedGenreItem
                      ]}
                      onPress={() => {
                        setGenre(item);
                        setShowGenreModal(false);
                      }}
                    >
                      <Text style={[
                        styles.genreItemText,
                        genre === item && styles.selectedGenreItemText
                      ]}>
                        {item}
                      </Text>
                      {genre === item && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowGenreModal(false)}
                >
                  <Text style={styles.modalCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  ratingContainer: {
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  starButton: {
    padding: 5,
  },
  star: {
    fontSize: 32,
    marginRight: 5,
  },
  starSelected: {
    color: '#f39c12',
  },
  starUnselected: {
    color: '#ddd',
  },
  ratingText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 15,
    fontWeight: '500',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: '#27ae60',
  },
  disabledButton: {
    backgroundColor: '#999',
    opacity: 0.7,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    textAlign: 'center',
  },
  genreList: {
    maxHeight: 300,
  },
  genreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedGenreItem: {
    backgroundColor: '#f0f7ff',
  },
  genreItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedGenreItemText: {
    color: '#4a6fa5',
    fontWeight: '500',
  },
  checkmark: {
    color: '#27ae60',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalCloseButtonText: {
    color: '#4a6fa5',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReviewFormScreen;
