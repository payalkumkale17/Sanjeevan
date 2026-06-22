import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Location from 'expo-location';
import {
  useFonts,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

declare const require: any;
const MainTabs = require('./src/navigation/MainTabs').default;
const OnboardingScreen = require('./src/screens/OnboardingScreen').default;

import { palette, typography } from './src/theme';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { loadProfile, saveProfile } from './src/storage/profile';
import { DetectedLocation, UserProfile } from './src/types';

const fallbackLocation: DetectedLocation = {
  label: 'Pune',
  latitude: 18.52,
  longitude: 73.85,
  source: 'fallback',
};

function AppContent() {
  const { isDark } = useTheme();

  const [fontsLoaded] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<DetectedLocation>(fallbackLocation);

  const refreshLocation = useCallback(async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setSelectedLocation(fallbackLocation);
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = position.coords;
      let label = 'Current Location';
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode.length > 0) {
        const geo = geocode[0];
        label = geo.city || geo.subregion || geo.region || label;
      }
      setSelectedLocation({ label, latitude, longitude, source: 'gps' });
    } catch {
      setSelectedLocation(fallbackLocation);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await refreshLocation();
      setProfile(null);
      setLoading(false);
    };
    init();
  }, [refreshLocation]);

  const handleLocationChange = useCallback((location: DetectedLocation) => {
    setSelectedLocation(location);
  }, []);

  const handleOnboardingComplete = async (nextProfile: UserProfile) => {
    await saveProfile(nextProfile);
    setProfile(nextProfile);
  };

  if (loading || !fontsLoaded) {
    return (
      <View style={[styles.loaderWrap, { backgroundColor: isDark ? '#111827' : palette.white }]}>
        <Text style={[styles.loaderText, { color: isDark ? '#9CA3AF' : palette.textMuted }]}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <GestureHandlerRootView style={styles.flex}>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <MainTabs
        profile={profile}
        selectedLocation={selectedLocation}
        onRefreshLocation={refreshLocation}
        onLocationChange={handleLocationChange}
      />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    fontFamily: typography.fontMedium,
    fontSize: 16,
  },
});