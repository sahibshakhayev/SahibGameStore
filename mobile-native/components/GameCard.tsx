import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { Game } from '../types';
import { Colors } from '../constants/Colors';
import { api } from '../services/api';
import { getImageUrl } from '../config/env';

interface GameCardProps {
  game: Game;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
  showFavoriteButton?: boolean;
  onFavoriteChange?: (gameId: string, isFavorite: boolean) => void;
}

export function GameCard({ 
  game, 
  onFavoritePress, 
  isFavorite = false, 
  showFavoriteButton = true,
  onFavoriteChange 
}: GameCardProps) {
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);
  const [localIsFavorite, setLocalIsFavorite] = useState(isFavorite);

  const handleFavoritePress = async () => {
    // If custom onFavoritePress is provided, use it
    if (onFavoritePress) {
      onFavoritePress();
      return;
    }

    // Otherwise, handle favorites internally
    if (isUpdatingFavorite) return;

    setIsUpdatingFavorite(true);
    try {
      if (localIsFavorite) {
        await api.removeFromFavorites(game.id);
        setLocalIsFavorite(false);
        onFavoriteChange?.(game.id, false);
      } else {
        await api.addToFavorites(game.id);
        setLocalIsFavorite(true);
        onFavoriteChange?.(game.id, true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      Alert.alert('Error', 'Failed to update favorites. Please try again.');
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  const handleAddToCart = async (event: any) => {
    event.stopPropagation(); // Prevent navigation when adding to cart
    
    if (game.availableQuantity <= 0) {
      Alert.alert('Out of Stock', 'This game is currently out of stock.');
      return;
    }

    try {
      await api.addToCart(game.id, 1);
      Alert.alert('Success', `${game.name} added to cart!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      Alert.alert('Error', 'Failed to add to cart. Please try again.');
    }
  };

  // Use the passed isFavorite prop if onFavoritePress is provided, otherwise use local state
  const displayIsFavorite = onFavoritePress ? isFavorite : localIsFavorite;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/game/${game.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: getImageUrl(game.imageRelativePath) }}
          style={styles.image}
          defaultSource={{ uri: 'https://via.placeholder.com/150' }}
        />
        
        {/* Stock Status Badge */}
        <View style={[
          styles.stockBadge, 
          { backgroundColor: game.availableQuantity > 0 ? Colors.success : Colors.error }
        ]}>
          <Text style={styles.stockText}>
            {game.availableQuantity > 0 ? 'In Stock' : 'Out of Stock'}
          </Text>
        </View>

        {/* Favorite Button */}
        {showFavoriteButton && (
          <TouchableOpacity 
            style={[
              styles.favoriteButton,
              isUpdatingFavorite && styles.favoriteButtonDisabled
            ]} 
            onPress={handleFavoritePress}
            disabled={isUpdatingFavorite}
          >
            <Text style={[
              styles.favoriteIcon, 
              { 
                color: displayIsFavorite ? Colors.error : Colors.surface,
                opacity: isUpdatingFavorite ? 0.5 : 1
              }
            ]}>
              {displayIsFavorite ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {game.name || 'Unknown Game'}
        </Text>
        
        <Text style={styles.description} numberOfLines={2}>
          {game.shortDescription || 'No description available'}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              ${game.price?.toFixed(2) || '0.00'}
            </Text>
            {game.usersScore && game.usersScore > 0 && (
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>★ {game.usersScore.toFixed(1)}</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={[
              styles.addToCartButton,
              game.availableQuantity <= 0 && styles.addToCartButtonDisabled
            ]}
            onPress={handleAddToCart}
            disabled={game.availableQuantity <= 0}
          >
            <Text style={[
              styles.addToCartText,
              game.availableQuantity <= 0 && styles.addToCartTextDisabled
            ]}>
              {game.availableQuantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ... rest of the styles remain the same
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
  },
  stockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockText: {
    color: Colors.surface,
    fontSize: 10,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonDisabled: {
    opacity: 0.5,
  },
  favoriteIcon: {
    fontSize: 18,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: '500',
  },
  addToCartButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
  },
  addToCartButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  addToCartText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  addToCartTextDisabled: {
    color: Colors.surface,
  },
});