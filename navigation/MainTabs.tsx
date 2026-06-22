import { StyleSheet, Platform, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AirQualityDataProvider } from '../context/AirQualityDataContext';
import { DetectedLocation, UserProfile } from '../types';
import { palette, typography, shadows } from '../theme';

declare const require: any;

const ForecastScreen = require('../screens/ForecastScreen').default;
const GuidanceScreen = require('../screens/GuidanceScreen').default;
const HomeScreen = require('../screens/HomeScreen').default;
const SourcesScreen = require('../screens/SourcesScreen').default;
const RankingsScreen = require('../screens/RankingsScreen').default;

type MainTabsProps = {
  selectedLocation: DetectedLocation;
  onRefreshLocation: () => Promise<void>;
  onLocationChange: (location: DetectedLocation) => void;
  profile: UserProfile;
};

type TabParamList = {
  Overview: undefined;
  Rankings: undefined;
  Forecast: undefined;
  Origins: undefined;
  Guidance: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const tabIcons: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
  Overview: 'home',
  Rankings: 'trophy',
  Forecast: 'calendar',
  Origins: 'stats-chart',
  Guidance: 'shield-checkmark',
};

export default function MainTabs({ selectedLocation, onRefreshLocation, onLocationChange, profile }: MainTabsProps) {
  return (
    <NavigationContainer>
      <AirQualityDataProvider selectedLocation={selectedLocation}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: true,
            tabBarActiveTintColor: '#4F46E5', // Indigo matching the image
            tabBarInactiveTintColor: '#9CA3AF',
            tabBarStyle: styles.tabBar,
            tabBarLabelStyle: styles.tabBarLabel,
            tabBarIcon: ({ color }) => {
              const iconName = (`${tabIcons[route.name]}-outline` as any);
              return <Ionicons name={iconName} size={22} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Overview">
            {() => <HomeScreen selectedLocation={selectedLocation} onRefreshLocation={onRefreshLocation} onLocationChange={onLocationChange} />}
          </Tab.Screen>
          <Tab.Screen name="Rankings">
            {() => <RankingsScreen />}
          </Tab.Screen>
          <Tab.Screen name="Forecast">
            {() => <ForecastScreen selectedLocation={selectedLocation} />}
          </Tab.Screen>
          <Tab.Screen name="Origins">
            {() => <SourcesScreen selectedLocation={selectedLocation} />}
          </Tab.Screen>
          <Tab.Screen name="Guidance">
            {() => <GuidanceScreen selectedLocation={selectedLocation} profile={profile} />}
          </Tab.Screen>
        </Tab.Navigator>
      </AirQualityDataProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: palette.white,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    elevation: 0,
    shadowOpacity: 0,
    paddingTop: 8,
    minHeight: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
  },
  tabBarLabel: {
    fontFamily: typography.fontMedium,
    fontSize: 10,
    marginTop: 2,
  },
});
