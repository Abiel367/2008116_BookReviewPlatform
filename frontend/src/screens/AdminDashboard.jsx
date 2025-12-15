import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// Define the API URL for the backend
// const API_URL = 'http://192.168.50.143:8000'; // memba to uncomment this line for testing on a specific IP
const API_URL = 'http://localhost:8000'; // Use localhost for local development

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'reviews'
  const [users, setUsers] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [archiveModalVisible, setArchiveModalVisible] = useState(false);
  const [itemToAction, setItemToAction] = useState(null);
  const [actionType, setActionType] = useState(''); // 'delete_user', 'archive_review'
  const [searchText, setSearchText] = useState('');
  
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  // Fetch all users and reviews data from the server
  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      const usersResponse = await axios.get(`${API_URL}/admin/users`);
      setUsers(usersResponse.data);
      
      // Fetch all reviews (including archived)
      const reviewsResponse = await axios.get(`${API_URL}/admin/reviews`);
      setAllReviews(reviewsResponse.data);
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      Alert.alert('Error', 'Failed to load admin data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh data when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [])
  );

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  // Handle user logout
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

  // Confirm user deletion
  const confirmDeleteUser = (user) => {
    setItemToAction(user);
    setActionType('delete_user');
    setDeleteModalVisible(true);
  };

  // Confirm review archiving
  const confirmArchiveReview = (review) => {
    setItemToAction(review);
    setActionType('archive_review');
    setArchiveModalVisible(true);
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    try {
      await axios.delete(`${API_URL}/admin/users/${itemToAction.id}`);
      
      // Remove from local state
      setUsers(users.filter(u => u.id !== itemToAction.id));
      
      Alert.alert('Success', 'User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to delete user');
    } finally {
      setDeleteModalVisible(false);
      setItemToAction(null);
    }
  };

  // Handle review archiving
  const handleArchiveReview = async () => {
    try {
      await axios.post(`${API_URL}/admin/reviews/${itemToAction.id}/archive`);
      
      // Update local state - mark as archived
      setAllReviews(allReviews.map(r => 
        r.id === itemToAction.id ? { ...r, is_archived: true } : r
      ));
      
      Alert.alert('Success', 'Review archived successfully');
    } catch (error) {
      console.error('Error archiving review:', error);
      Alert.alert('Error', 'Failed to archive review');
    } finally {
      setArchiveModalVisible(false);
      setItemToAction(null);
    }
  };

  // Filter users based on search text
  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
    user.role.toLowerCase().includes(searchText.toLowerCase())
  );

  // Filter reviews based on search text
  const filteredReviews = allReviews.filter(review =>
    review.book_title.toLowerCase().includes(searchText.toLowerCase()) ||
    review.author.toLowerCase().includes(searchText.toLowerCase()) ||
    review.user_name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Render each user item in the list
  const renderUserItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.full_name}</Text>
          <View style={[
            styles.roleBadge,
            item.role === 'admin' ? styles.adminBadge : styles.userBadge
          ]}>
            <Text style={styles.roleText}>
              {item.role.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.userId}>ID: {item.id}</Text>
      </View>
      
      <Text style={styles.userDate}>
        Joined: {new Date(item.created_at).toLocaleDateString()}
      </Text>
      
      {item.id !== user?.id && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDeleteUser(item)}
        >
          <Text style={styles.deleteButtonText}>Delete User</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Render each review item in the list
  const renderReviewItem = ({ item }) => (
    <View style={[
      styles.itemCard,
      item.is_archived && styles.archivedCard
    ]}>
      <View style={styles.itemHeader}>
        <Text style={styles.bookTitle}>{item.book_title}</Text>
        <View style={styles.reviewMeta}>
          <Text style={styles.rating}>⭐ {item.rating}/5</Text>
          {item.is_archived && (
            <Text style={styles.archivedBadge}>ARCHIVED</Text>
          )}
        </View>
      </View>
      
      <Text style={styles.author}>by {item.author}</Text>
      <Text style={styles.genre}>{item.genre}</Text>
      
      <Text style={styles.reviewText} numberOfLines={2}>
        {item.review_text}
      </Text>
      
      <View style={styles.reviewFooter}>
        <View>
          <Text style={styles.userName}>By: {item.user_name}</Text>
          <Text style={styles.date}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        
        {!item.is_archived && (
          <TouchableOpacity
            style={styles.archiveButton}
            onPress={() => confirmArchiveReview(item)}
          >
            <Text style={styles.archiveButtonText}>Archive</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Render empty state when there is no data
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {loading ? 'Loading...' : `No ${activeTab} found`}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Admin Dashboard</Text>
          <Text style={styles.adminName}>Logged in as: {user?.full_name}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'users' && styles.activeTab
          ]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'users' && styles.activeTabText
          ]}>
            👥 Users ({users.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'reviews' && styles.activeTab
          ]}
          onPress={() => setActiveTab('reviews')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'reviews' && styles.activeTabText
          ]}>
            📚 Reviews ({allReviews.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${activeTab}...`}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchText('')}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Data List */}
      <FlatList
        data={activeTab === 'users' ? filteredUsers : filteredReviews}
        renderItem={activeTab === 'users' ? renderUserItem : renderReviewItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4a6fa5']}
          />
        }
        ListEmptyComponent={renderEmptyState()}
        contentContainerStyle={styles.listContent}
      />

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {allReviews.filter(r => !r.is_archived).length}
          </Text>
          <Text style={styles.statLabel}>Active Reviews</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {allReviews.filter(r => r.is_archived).length}
          </Text>
          <Text style={styles.statLabel}>Archived Reviews</Text>
        </View>
      </View>

      {/* Delete User Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete User</Text>
            
            <Text style={styles.modalText}>
              Are you sure you want to delete user:
            </Text>
            
            <Text style={styles.modalItemName}>
              "{itemToAction?.full_name}"
            </Text>
            
            <Text style={styles.modalWarning}>
              This will permanently delete the user and all their reviews.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setItemToAction(null);
                }}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteModalButton]}
                onPress={handleDeleteUser}
              >
                <Text style={styles.deleteModalButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Archive Review Modal */}
      <Modal
        visible={archiveModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setArchiveModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Archive Review</Text>
            
            <Text style={styles.modalText}>
              Are you sure you want to archive this review:
            </Text>
            
            <Text style={styles.modalItemName}>
              "{itemToAction?.book_title}"
            </Text>
            
            <Text style={styles.modalWarning}>
              Archived reviews are hidden from regular users but preserved in the database.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => {
                  setArchiveModalVisible(false);
                  setItemToAction(null);
                }}
              >
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.archiveModalButton]}
                onPress={handleArchiveReview}
              >
                <Text style={styles.archiveModalButtonText}>Archive</Text>
              </TouchableOpacity>
            </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  adminName: {
    fontSize: 14,
    color: '#666',
  },
  logoutText: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#4a6fa5',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4a6fa5',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  clearButton: {
    marginLeft: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  clearButtonText: {
    color: '#666',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    flexGrow: 1,
  },
  itemCard: {
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
  archivedCard: {
    backgroundColor: '#f8f9fa',
    borderColor: '#dee2e6',
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  adminBadge: {
    backgroundColor: '#e74c3c',
  },
  userBadge: {
    backgroundColor: '#4a6fa5',
  },
  roleText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userId: {
    fontSize: 12,
    color: '#999',
  },
  userDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  reviewMeta: {
    alignItems: 'flex-end',
  },
  rating: {
    fontSize: 16,
    color: '#f39c12',
    fontWeight: '600',
  },
  archivedBadge: {
    fontSize: 10,
    color: '#e74c3c',
    fontWeight: 'bold',
    marginTop: 5,
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
  date: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-end',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  archiveButton: {
    backgroundColor: '#f39c12',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  archiveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a6fa5',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
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
    padding: 25,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalWarning: {
    fontSize: 14,
    color: '#e74c3c',
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelModalButton: {
    backgroundColor: '#e0e0e0',
  },
  deleteModalButton: {
    backgroundColor: '#e74c3c',
  },
  archiveModalButton: {
    backgroundColor: '#f39c12',
  },
  cancelModalButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  archiveModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});


export default AdminDashboard;
