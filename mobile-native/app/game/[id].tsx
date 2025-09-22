import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
const BASE_URL = 'http://10.0.77.174:5159';
import { useLocalSearchParams, Stack } from 'expo-router';
import { WebView } from 'react-native-webview';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { api } from '../../services/api';
import { Game } from '../../types';
import { Colors } from '../../constants/Colors';

interface Review {
  userId: string;
  productId: string;
  rating: number;
  considerations: string;
}

interface GameOverview {
  id: string;
  gameId: string;
  html: string;
  videoRelativeUrl: string;
}

const { width } = Dimensions.get('window');

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [overview, setOverview] = useState<GameOverview | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'overview' | 'reviews'>('details');
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, considerations: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      loadGameData();
    }
  }, [id]);

  const loadGameData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadGame(),
        loadGameOverview(),
        loadGameReviews(),
        checkFavoriteStatus(),
      ]);
    } catch (error) {
      console.error('Failed to load game data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGame = async () => {
    try {
      const gameData = await api.getGame(id!);
      setGame(gameData);
    } catch (error) {
      console.error('Failed to load game:', error);
      Alert.alert('Error', 'Failed to load game details');
    }
  };

  const loadGameOverview = async () => {
    try {
      const overviewData = await api.getGameOverview(id!);
      setOverview(overviewData);
    } catch (error) {
      console.error('Failed to load game overview:', error);
    }
  };

  const loadGameReviews = async () => {
    try {
      const reviewsData = await api.getGameReviews(id!);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Failed to load game reviews:', error);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const favorites = await api.getFavorites();
      setIsFavorite((favorites || []).some((item: any) => (item.gameId || item.id) === id));
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await api.removeFromFavorites(id!);
        setIsFavorite(false);
      } else {
        await api.addToFavorites(id!);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const addToCart = async () => {
    try {
      await api.addToCart(id!, 1);
      Alert.alert('Success', 'Game added to cart');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      Alert.alert('Error', 'Failed to add to cart');
    }
  };

  const submitReview = async () => {
    if (!newReview.considerations.trim()) {
      Alert.alert('Error', 'Please write a review');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await api.addReview(id!, newReview.rating, newReview.considerations);
      Alert.alert('Success', 'Review submitted successfully');
      setShowReviewModal(false);
      setNewReview({ rating: 5, considerations: '' });
      loadGameReviews(); // Reload reviews
    } catch (error) {
      console.error('Failed to submit review:', error);
      Alert.alert('Error', 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getAverageRating = (): number => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const renderStars = (rating: number, size = 16, interactive = false, onPress?: (rating: number) => void) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => interactive && onPress && onPress(i)}
          disabled={!interactive}
        >
          <Text style={[styles.star, { fontSize: size, color: i <= rating ? Colors.warning : Colors.border }]}>
            ★
          </Text>
        </TouchableOpacity>
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const renderTabButton = (tab: 'details' | 'overview' | 'reviews', title: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderDetailsTab = () => (
    <View style={styles.tabContent}>
      {game?.shortDescription && (
        <Text style={styles.shortDescription}>{game.shortDescription}</Text>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Release Date</Text>
        <Text style={styles.infoText}>
          {new Date(game?.releaseDate || '').toLocaleDateString()}
        </Text>
      </View>

      {game?.genres && game.genres.length > 0 && (
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Genres</Text>
          <Text style={styles.infoText}>
            {game.genres.map((g: any) => g.name).join(', ')}
          </Text>
        </View>
      )}

      {game?.platforms && game.platforms.length > 0 && (
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Platforms</Text>
          <Text style={styles.infoText}>
            {game.platforms.map((p: any) => p.name).join(', ')}
          </Text>
        </View>
      )}

      {game?.developers && game.developers.length > 0 && (
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Developers</Text>
          <Text style={styles.infoText}>
            {game.developers.map((d: any) => d.name).join(', ')}
          </Text>
        </View>
      )}

      {game?.description && (
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Description</Text>
          <Text style={styles.description}>{game.description}</Text>
        </View>
      )}
    </View>
  );

  const renderOverviewTab = () => {
  const getVideoUrl = (videoPath: string): string => {
    if (!videoPath) return '';
    
    if (videoPath.startsWith('http')) {
      return videoPath;
    }
    
    if (videoPath.startsWith('/')) {
      return `${BASE_URL}${videoPath}`; // Replace with your actual base URL
    }
    
    return videoPath;
  };

  return (
    <View style={styles.tabContent}>
      {overview?.videoRelativeUrl && (
        <View style={styles.videoSection}>
          <Text style={styles.videoTitle}>Game Trailer</Text>
          <View style={styles.videoContainer}>
            <WebView
              source={{ uri: getVideoUrl(overview.videoRelativeUrl) }}
              style={styles.videoWebView}
              allowsFullscreenVideo={true}
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.videoLoading}>
                  <LoadingSpinner text="Loading video..." />
                </View>
              )}
            />
          </View>
        </View>
      )}

      {overview?.html ? (
        <View style={styles.overviewContainers
        }>
          <Text style={styles.overviewTitle}>Game Overview</Text>
          <WebView
            source={{ html: overview.html }}
            style={styles.webViews}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            onMessage={() => {}}
            injectedJavaScript={`
              document.body.style.margin = '0';
              document.body.style.padding = '16px';
              document.body.style.fontFamily = 'system-ui';
              document.body.style.fontSize = '14px';
              document.body.style.lineHeight = '1.5';
              document.body.style.color = '${Colors.text}';
              document.body.style.backgroundColor = 'transparent';
              
              // Make images responsive
              const images = document.querySelectorAll('img');
              images.forEach(img => {
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
              });
              
              // Style headings
              const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
              headings.forEach(heading => {
                heading.style.color = '${Colors.text}';
                heading.style.marginTop = '16px';
                heading.style.marginBottom = '8px';
              });
              
              // Style paragraphs
              const paragraphs = document.querySelectorAll('p');
              paragraphs.forEach(p => {
                p.style.marginBottom = '12px';
              });
              
              true;
            `}
          />
        </View>
      ) : (
        !overview?.videoRelativeUrl && (
          <View style={styles.noOverviewContainer}>
            <Text style={styles.noOverviewText}>No overview available for this game</Text>
          </View>
        )
      )}
    </View>
  );
};

  const renderReviewsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.reviewsHeader}>
        <View style={styles.reviewsStats}>
          <Text style={styles.averageRating}>{getAverageRating().toFixed(1)}</Text>
          {renderStars(Math.round(getAverageRating()), 20)}
          <Text style={styles.reviewCount}>({reviews.length} review{reviews.length !== 1 ? 's' : ''})</Text>
        </View>
        
        <TouchableOpacity
          style={styles.addReviewButton}
          onPress={() => setShowReviewModal(true)}
        >
          <Text style={styles.addReviewButtonText}>Write Review</Text>
        </TouchableOpacity>
      </View>

      {reviews.length === 0 ? (
        <View style={styles.noReviewsContainer}>
          <Text style={styles.noReviewsText}>No reviews yet</Text>
          <Text style={styles.noReviewsSubtext}>Be the first to review this game!</Text>
        </View>
      ) : (
        reviews.map((review, index) => (
          <View key={`${review.userId}-${index}`} style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewUser}>User {review.userId.slice(-8)}</Text>
              {renderStars(review.rating, 14)}
            </View>
            <Text style={styles.reviewText}>{review.considerations}</Text>
          </View>
        ))
      )}
    </View>
  );

  if (isLoading) {
    return <LoadingSpinner text="Loading game details..." />;
  }

  if (!game) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Game not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: game.name,
          headerBackTitle: 'Back'
        }} 
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: BASE_URL+ game.coverImageRelativePath || BASE_URL+ game.imageRelativePath || 'https://via.placeholder.com/400x200' }}
          style={styles.coverImage}
          resizeMode="cover"
        />

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <Text style={styles.title}>{game.name}</Text>
              {game.userScore !== undefined && game.userScore > 0 && (
                <View style={styles.ratingContainer}>
                  {renderStars(Math.round(game.userScore), 16)}
                  <Text style={styles.rating}>{game.userScore.toFixed(1)}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
              <Text style={[styles.favoriteIcon, { color: isFavorite ? Colors.error : Colors.textSecondary }]}>
                {isFavorite ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.priceSection}>
            <Text style={styles.price}>${game.price?.toFixed(2) || '0.00'}</Text>
            <Text style={[styles.availability, { color: game.availableQuantity > 0 ? Colors.success : Colors.error }]}>
              {game.availableQuantity > 0 ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {renderTabButton('details', 'Details')}
            {renderTabButton('overview', 'Overview')}
            {renderTabButton('reviews', `Reviews (${reviews.length})`)}
          </View>

          {/* Tab Content */}
          {activeTab === 'details' && renderDetailsTab()}
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'reviews' && renderReviewsTab()}

          <TouchableOpacity
            style={[
              styles.addToCartButton, 
              game.availableQuantity === 0 && styles.disabledButton
            ]}
            onPress={addToCart}
            disabled={game.availableQuantity === 0}
          >
            <Text style={styles.addToCartText}>
              {game.availableQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

          {/* Review Modal */}
      <Modal visible={showReviewModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowReviewModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Write Review</Text>
            <TouchableOpacity 
              onPress={submitReview}
              disabled={isSubmittingReview}
            >
              <Text style={[styles.saveButton, isSubmittingReview && styles.disabledText]}>
                {isSubmittingReview ? 'Submitting...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Rating</Text>
              {renderStars(newReview.rating, 32, true, (rating) => 
                setNewReview({ ...newReview, rating })
              )}
              <Text style={styles.ratingText}>{newReview.rating} out of 5 stars</Text>
            </View>

            <View style={styles.reviewTextSection}>
              <Text style={styles.reviewLabel}>Your Review</Text>
              <TextInput
                style={styles.reviewInput}
                placeholder="Share your thoughts about this game..."
                placeholderTextColor={Colors.textSecondary}
                value={newReview.considerations}
                onChangeText={(text) => setNewReview({ ...newReview, considerations: text })}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>
                {newReview.considerations.length}/500 characters
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  coverImage: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    color: Colors.warning,
    marginLeft: 8,
    fontWeight: '600',
  },
  favoriteButton: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteIcon: {
    fontSize: 20,
  },

  // Add these to your existing styles
videoSection: {
  marginBottom: 24,
},
videoTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: Colors.text,
  marginBottom: 12,
},
videoContainer: {
  backgroundColor: Colors.surface,
  borderRadius: 12,
  overflow: 'hidden',
  aspectRatio: 16 / 9, // Standard video aspect ratio
  marginBottom: 16,
},
videoWebView: {
  flex: 1,
  backgroundColor: '#000',
},
video: {
  width: '100%',
  height: '100%',
},
videoLoading: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: Colors.surface,
},
overviewTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: Colors.text,
  marginBottom: 12,
},
overviewContainer: {
  backgroundColor: Colors.surface,
  borderRadius: 12,
  overflow: 'hidden',
  minHeight: 300,
  padding: 16,
},
webView: {
  flex: 1,
  backgroundColor: 'transparent',
  minHeight: 250,
},
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
  },
  availability: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabButtonText: {
    color: Colors.surface,
  },
  tabContent: {
    minHeight: 200,
  },
  shortDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  overviewContainers: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 300,
  },
  webViews: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  noOverviewContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  noOverviewText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  reviewsStats: {
    flex: 1,
    alignItems: 'flex-start',
  },
  averageRating: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  addReviewButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addReviewButtonText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  noReviewsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  noReviewsText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  noReviewsSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  reviewItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 2,
  },
  addToCartButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  disabledButton: {
    backgroundColor: Colors.textSecondary,
  },
  addToCartText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  cancelButton: {
    color: Colors.primary,
    fontSize: 16,
  },
  saveButton: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.5,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  reviewTextSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  reviewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  reviewInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    minHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  characterCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 8,
  },
});