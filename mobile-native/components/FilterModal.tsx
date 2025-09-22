import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Genre, Platform, Company } from '../types';
import { api } from '../services/api';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export interface FilterOptions {
  sortBy?: string;
  isDescending?: boolean;
  genreId?: string;
  developerId?: string;
  platformId?: string;
}

export function FilterModal({ visible, onClose, onApply, currentFilters }: FilterModalProps) {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [developers, setDevelopers] = useState<Company[]>([]);

  useEffect(() => {
    if (visible) {
      loadFilterData();
      setFilters(currentFilters);
    }
  }, [visible, currentFilters]);

  const loadFilterData = async () => {
    try {
      const [genresData, platformsData, companiesData] = await Promise.all([
        api.getGenres(),
        api.getPlatforms(),
        api.getCompanies(),
      ]);
      setGenres(genresData || []);
      setPlatforms(platformsData || []);
      setDevelopers(companiesData || []);
    } catch (error) {
      console.error('Failed to load filter data:', error);
    }
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
  };

  const sortOptions = [
    { label: 'Default', value: '' },
    { label: 'Name', value: 'name' },
    { label: 'Price', value: 'price' },
    { label: 'Release Date', value: 'releaseDate' },
    { label: 'Rating', value: 'usersScore' },
  ];

  const renderPickerSection = (
    title: string,
    options: Array<{ label: string; value: string }>,
    selectedValue: string,
    onValueChange: (value: string) => void
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              selectedValue === option.value && styles.selectedOption,
            ]}
            onPress={() => onValueChange(option.value)}
          >
            <Text
              style={[
                styles.optionText,
                selectedValue === option.value && styles.selectedOptionText,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetButton}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {renderPickerSection(
            'Sort By',
            sortOptions,
            filters.sortBy || '',
            (value) => setFilters({ ...filters, sortBy: value })
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  !filters.isDescending && styles.selectedToggle,
                ]}
                onPress={() => setFilters({ ...filters, isDescending: false })}
              >
                <Text
                  style={[
                    styles.toggleText,
                    !filters.isDescending && styles.selectedToggleText,
                  ]}
                >
                  Ascending
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  filters.isDescending && styles.selectedToggle,
                ]}
                onPress={() => setFilters({ ...filters, isDescending: true })}
              >
                <Text
                  style={[
                    styles.toggleText,
                    filters.isDescending && styles.selectedToggleText,
                  ]}
                >
                  Descending
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {renderPickerSection(
            'Genre',
            [{ label: 'All Genres', value: '' }, ...genres.map(g => ({ label: g.name || '', value: g.id }))],
            filters.genreId || '',
            (value) => setFilters({ ...filters, genreId: value })
          )}

          {renderPickerSection(
            'Platform',
            [{ label: 'All Platforms', value: '' }, ...platforms.map(p => ({ label: p.name || '', value: p.id }))],
            filters.platformId || '',
            (value) => setFilters({ ...filters, platformId: value })
          )}

          {renderPickerSection(
            'Developer',
            [{ label: 'All Developers', value: '' }, ...developers.map(d => ({ label: d.name || '', value: d.id }))],
            filters.developerId || '',
            (value) => setFilters({ ...filters, developerId: value })
          )}
        </ScrollView>

        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  cancelButton: {
    color: Colors.primary,
    fontSize: 16,
  },
  resetButton: {
    color: Colors.error,
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
  },
  optionButton: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: Colors.text,
  },
  selectedOptionText: {
    color: Colors.surface,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  selectedToggle: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 14,
    color: Colors.text,
  },
  selectedToggleText: {
    color: Colors.surface,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});