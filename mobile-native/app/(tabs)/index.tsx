import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SearchBar } from '../../components/SearchBar';
import { GameCard } from '../../components/GameCard';
import { FilterModal, FilterOptions } from '../../components/FilterModal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { api } from '../../services/api';
import { Game } from '../../types';
import { Colors } from '../../constants/Colors';

export default function HomeScreen() {
  const [bestRated, setBestRated] = useState<Game[]>([]);
  const [bestSellers, setBestSellers] = useState<Game[]>([]);
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadInitialData();
    }, [])
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm || Object.keys(filters).length > 0) {
        setIsSearching(true);
        searchGames();
      } else {
        setIsSearching(false);
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filters]);

  const loadInitialData = async () => {
    setIsInitialLoading(true);
    try {
      await Promise.all([
        loadFeaturedGames(),
        loadFavorites(),
      ]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const loadFeaturedGames = async () => {
    try {
      const [bestRatedData, bestSellersData] = await Promise.all([
        api.getBestRatedGames(),
        api.getBestSellers(),
      ]);
      setBestRated(bestRatedData || []);
      setBestSellers(bestSellersData || []);
    } catch (error) {
      console.error('Failed to load featured games:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const favoritesData = await api.getFavorites();
      setFavorites((favoritesData || []).map((item: any) => item.gameId || item.id));
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const searchGames = async () => {
    setIsLoading(true);
    try {
      const params = {
        SearchTerm: searchTerm || undefined,
        PageSize: 50,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        ),
      };
      
      const gamesData = await api.getGames(params);
      setSearchResults(gamesData?.items || gamesData || []);
    } catch (error) {
      console.error('Failed to search games:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (gameId: string) => {
    try {
      if (favorites.includes(gameId)) {
        await api.removeFromFavorites(gameId);
        setFavorites(favorites.filter(id => id !== gameId));
      } else {
        await api.addToFavorites(gameId);
        setFavorites([...favorites, gameId]);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const renderHorizontalSection = (title: string, data: Game[]) => {
    if (!data || data.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <View style={styles.horizontalCard}>
              <GameCard
                game={item}
                onFavoritePress={() => toggleFavorite(item.id)}
                isFavorite={favorites.includes(item.id)}
              />
            </View>
          )}
          keyExtractor={(item) => `${title}-${item.id}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>
    );
  };

  const renderSearchResults = () => (
    <FlatList
      data={searchResults}
      renderItem={({ item }) => (
        <View style={styles.gameCardContainer}>
          <GameCard
            game={item}
            onFavoritePress={() => toggleFavorite(item.id)}
            isFavorite={favorites.includes(item.id)}
          />
        </View>
      )}
      keyExtractor={(item) => `search-${item.id}`}
      contentContainerStyle={styles.searchResults}
      ListHeaderComponent={
        <Text style={styles.searchHeader}>
          {searchTerm ? `Search Results for "${searchTerm}"` : 'Filtered Games'}
                    {searchResults.length > 0 && ` (${searchResults.length})`}
        </Text>
      }
      ListEmptyComponent={
        !isLoading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No games found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={searchGames} />
      }
      showsVerticalScrollIndicator={false}
    />
  );

  const renderFeaturedSections = () => (
    <ScrollView
      style={styles.featuredContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isInitialLoading} onRefresh={loadInitialData} />
      }
    >
      {renderHorizontalSection('Best Rated', bestRated)}
      {renderHorizontalSection('Best Sellers', bestSellers)}
      
      {bestRated.length === 0 && bestSellers.length === 0 && !isInitialLoading && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No featured games available</Text>
        </View>
      )}
    </ScrollView>
  );

  if (isInitialLoading) {
    return <LoadingSpinner text="Loading games..." />;
  }

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchTerm}
        onChangeText={setSearchTerm}
        onFilterPress={() => setShowFilters(true)}
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <LoadingSpinner text="Searching..." />
        </View>
      )}

      {isSearching ? renderSearchResults() : renderFeaturedSections()}

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={setFilters}
        currentFilters={filters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  featuredContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  horizontalCard: {
    width: 280,
    marginRight: 16,
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
  gameCardContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  searchResults: {
    paddingBottom: 20,
  },
  searchHeader: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: Colors.background + 'CC',
    paddingVertical: 20,
  },
});