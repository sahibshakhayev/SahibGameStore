import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { api } from '../../services/api';
import { Colors } from '../../constants/Colors';

interface FavoriteItem {
  gameId: string;
  name: string;
  coverImageUrl: string;
}

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const favoritesData = await api.getFavorites();
      console.log('Favorites data:', favoritesData);
      
      if (Array.isArray(favoritesData)) {
        setFavorites(favoritesData);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
      setFavorites([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const removeFavorite = async (gameId: string) => {
    try {
      await api.removeFromFavorites(gameId);
      setFavorites(favorites.filter(item => item.gameId !== gameId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return 'https://via.placeholder.com/150';
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/')) {
      return `http://10.0.77.174:5159${imagePath}`; // Replace with your actual base URL
    }
    
    return imagePath;
  };

  const renderFavoriteItem = ({ item }: { item: FavoriteItem }) => {
    if (!item || !item.gameId) {
      return null;
    }

    return (
      <View style={styles.favoriteItem}>
        <TouchableOpacity
          style={styles.gameContent}
          onPress={() => router.push(`/game/${item.gameId}`)}
        >
          <Image
            source={{ uri: getImageUrl(item.coverImageUrl) }}
            style={styles.gameImage}
            defaultSource={{ uri: 'https://via.placeholder.com/80' }}
          />
          <View style={styles.gameInfo}>
            <Text style={styles.gameName}>{item.name}</Text>
            <Text style={styles.gameId}>ID: {item.gameId.slice(-8)}</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => router.push(`/game/${item.gameId}`)}
          >
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeFavorite(item.gameId)}
          >
            <Text style={styles.removeButtonText}>💔</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading favorites..." />;
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>❤️</Text>
        <Text style={styles.emptyText}>No favorites yet</Text>
        <Text style={styles.emptySubtext}>
          Add games to your favorites to see them here
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.browseButtonText}>Browse Games</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item.gameId}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={() => loadFavorites(true)} 
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.favoritesHeader}>
              {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.favoritesSubheader}>
              Tap on any game to view details
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  browseButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  favoritesHeader: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  favoritesSubheader: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  favoriteItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gameContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  gameInfo: {
    flex: 1,
    marginLeft: 16,
  },
  gameName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  gameId: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  viewButtonText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: Colors.error,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 20,
  },
});