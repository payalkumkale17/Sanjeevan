import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  ScrollView, 
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, typography } from '../theme';
import { DetectedLocation } from '../types';

type LocationModalProps = {
  visible: boolean;
  currentLocation: DetectedLocation;
  onSelect: (location: DetectedLocation) => void;
  onClose: () => void;
};

const PRESET_LOCATIONS: DetectedLocation[] = [
  { label: 'Pune', latitude: 18.52, longitude: 73.85, source: 'preset' },
  { label: 'New Delhi', latitude: 28.6139, longitude: 77.209, source: 'preset' },
  { label: 'Mumbai', latitude: 19.076, longitude: 72.8777, source: 'preset' },
  { label: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, source: 'preset' },
  { label: 'Kolkata', latitude: 22.5726, longitude: 88.3639, source: 'preset' },
];

export default function LocationModal({ visible, currentLocation, onSelect, onClose }: LocationModalProps) {
  const [searchText, setSearchText] = useState('');

  const filteredLocations = PRESET_LOCATIONS.filter((loc) =>
    loc.label.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSelect = (location: DetectedLocation) => {
    onSelect(location);
    setSearchText('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={24} color={palette.black} />
          </Pressable>
          <Text style={styles.title}>Select Location</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={palette.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search location..."
            placeholderTextColor={palette.textMuted}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText && (
            <Pressable onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color={palette.textMuted} />
            </Pressable>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.locationList}>
          {filteredLocations.map((location) => (
            <Pressable
              key={location.label}
              style={[
                styles.locationItem,
                currentLocation.label === location.label && styles.locationItemActive,
              ]}
              onPress={() => handleSelect(location)}
            >
              <View style={styles.locationContent}>
                <Ionicons
                  name="location"
                  size={20}
                  color={currentLocation.label === location.label ? palette.black : palette.textMuted}
                />
                <View style={{ marginLeft: 12 }}>
                  <Text
                    style={[
                      styles.locationName,
                      currentLocation.label === location.label && styles.locationNameActive,
                    ]}
                  >
                    {location.label}
                  </Text>
                  <Text style={styles.locationCoords}>
                    {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
                  </Text>
                </View>
              </View>
              {currentLocation.label === location.label && (
                <Ionicons name="checkmark-circle" size={20} color={palette.black} />
              )}
            </Pressable>
          ))}

          {filteredLocations.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color={palette.textMuted} />
              <Text style={styles.emptyText}>No locations found</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.gray,
  },
  title: {
    fontFamily: typography.fontBold,
    fontSize: 18,
    color: palette.black,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginVertical: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontRegular,
    fontSize: 14,
    color: palette.black,
    padding: 0,
  },
  locationList: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: palette.gray,
    borderRadius: 12,
    backgroundColor: palette.white,
  },
  locationItemActive: {
    borderColor: palette.black,
    backgroundColor: '#f9f9f9',
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationName: {
    fontFamily: typography.fontSemiBold,
    fontSize: 15,
    color: palette.black,
  },
  locationNameActive: {
    color: palette.black,
  },
  locationCoords: {
    fontFamily: typography.fontRegular,
    fontSize: 12,
    color: palette.textMuted,
    marginTop: 2,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: typography.fontMedium,
    fontSize: 14,
    color: palette.textMuted,
    marginTop: 12,
  },
});
