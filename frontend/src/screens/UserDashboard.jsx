// Import necessary libraries and components
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  SafeAreaView,
  RefreshControl,
  Modal,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Define the API URL for the backend
// const API_URL = 'http://192.168.50.143:8000'; 
const API_URL = 'http://localhost:8000'; // Use localhost for local development

// Genre options for book reviews
const GENRES = [
  "Fiction", "Non-Fiction", "Mystery", "Romance", 
  "Science Fiction", "Fantasy", "Biography", 
  "History", "Self-Help", "Young Adult"
];

// UserDashboard component definition
const UserDashboard = () => {
  // State variables to manage reviews, loading, filters, and UI interactions
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedRating, setSelectedRating] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Navigation and authentication context
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  // Fetch reviews when the component mounts
  useEffect(() => {
    fetchReviews();
  }, []);

  // Function to fetch reviews from the backend with optional filters
  const fetchReviews = async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchText) params.append('search', searchText); // Add search text to filters
      if (selectedGenre) params.append('genre', selectedGenre); // Add selected genre to filters
      if (selectedRating) params.append('rating', selectedRating); // Add selected rating to filters
      
      const response = await axios.get(
        `${API_URL}/reviews?${params.toString()}`
      );
      setReviews(response.data); // Update reviews state with fetched data
    } catch (error) {
      console.error('Error fetching reviews:', error);
      Alert.alert('Error', 'Failed to load reviews');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Function to refresh the reviews list
  const onRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  // Function to handle search action
  const handleSearch = () => {
    fetchReviews();
  };

  // Navigate to the review creation screen
  const handleCreateReview = () => {
    navigation.navigate('ReviewForm');
  };

  // Navigate to the user's reviews screen
  const handleViewMyReviews = () => {
    navigation.navigate('MyReviews');
  };

  // Function to handle user logout
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await logout();
              if (result.success) {
                // Navigate back to Welcome screen
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Welcome' }],
                });
              } else {
                Alert.alert('Logout Failed', result.error);
              }
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  // Clear all filters and refresh the reviews list
  const clearFilters = () => {
    setSearchText('');
    setSelectedGenre('');
    setSelectedRating(null);
    setShowFilters(false);
    fetchReviews();
  };

  // Render a single review item in the list
  const renderReviewItem = ({ item }) => (
    <TouchableOpacity style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.bookTitle}>{item.book_title}</Text>
        <Text style={styles.rating}>⭐ {item.rating}/5</Text>
      </View>
      
      <Text style={styles.author}>by {item.author}</Text>
      <Text style={styles.genre}>{item.genre}</Text>
      
      <Text style={styles.reviewText} numberOfLines={3}>
        {item.review_text}
      </Text>
      
      <View style={styles.reviewFooter}>
        <Text style={styles.userName}>By: {item.user_name}</Text>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome, {user?.full_name}!</Text>
          <Text style={styles.roleText}>Role: {user?.role}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search books, authors, or reviews..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryAction]}
          onPress={handleCreateReview}
        >
          <Text style={styles.actionButtonText}>✍️ Write Review</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryAction]}
          onPress={handleViewMyReviews}
        >
          <Text style={styles.actionButtonText}>📖 My Reviews</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.filterAction]}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.actionButtonText}>🔍 Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Reviews List */}
      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4a6fa5']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? 'Loading reviews...' : 'No reviews found'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Reviews</Text>
            
            {/* Genre Filter */}
            <Text style={styles.filterLabel}>Genre</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {GENRES.map((genre) => (
                <TouchableOpacity
                  key={genre}
                  style={[
                    styles.genreChip,
                    selectedGenre === genre && styles.selectedChip
                  ]}
                  onPress={() => setSelectedGenre(
                    selectedGenre === genre ? '' : genre
                  )}
                >
                  <Text style={[
                    styles.genreChipText,
                    selectedGenre === genre && styles.selectedChipText
                  ]}>
                    {genre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Rating Filter */}
            <Text style={styles.filterLabel}>Rating</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingChip,
                    selectedRating === rating && styles.selectedChip
                  ]}
                  onPress={() => setSelectedRating(
                    selectedRating === rating ? null : rating
                  )}
                >
                  <Text style={[
                    styles.ratingChipText,
                    selectedRating === rating && styles.selectedChipText
                  ]}>
                    {rating} ⭐
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Filter Actions */}
            <View style={styles.filterActions}>
              <TouchableOpacity
                style={[styles.filterButton, styles.clearButton]}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.filterButton, styles.applyButton]}
                onPress={() => {
                  setShowFilters(false);
                  fetchReviews();
                }}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  roleText: {
    fontSize: 14,
    color: '#666',
  },
  logoutText: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#4a6fa5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  primaryAction: {
    backgroundColor: '#27ae60',
  },
  secondaryAction: {
    backgroundColor: '#4a6fa5',
  },
  filterAction: {
    backgroundColor: '#f39c12',
    flex: 0.8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  rating: {
    fontSize: 16,
    color: '#f39c12',
    fontWeight: '600',
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  genre: {
    fontSize: 12,
    color: '#4a6fa5',
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 10,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  userName: {
    fontSize: 12,
    color: '#999',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginTop: 15,
  },
  genreChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedChip: {
    backgroundColor: '#4a6fa5',
  },
  genreChipText: {
    fontSize: 14,
    color: '#333',
  },
  selectedChipText: {
    color: 'white',
  },
  ratingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ratingChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  ratingChipText: {
    fontSize: 14,
    color: '#333',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  clearButton: {
    backgroundColor: '#e0e0e0',
  },
  applyButton: {
    backgroundColor: '#4a6fa5',
  },
  clearButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default UserDashboard;
