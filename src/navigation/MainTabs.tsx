import { StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AirQualityDataProvider } from '../context/AirQualityDataContext';
import { DetectedLocation, UserProfile } from '../types';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme';

declare const require: any;
const ForecastScreen = require('../screens/ForecastScreen').default;
const GuidanceScreen = require('../screens/GuidanceScreen').default;
const HomeScreen = require('../screens/HomeScreen').default;
const SourcesScreen = require('../screens/SourcesScreen').default;
const RankingsScreen = require('../screens/RankingsScreen').default;
const ProfileScreen = require('../screens/ProfileScreen').default;

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
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const tabIcons: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
  Overview: 'home',
  Rankings: 'podium',
  Forecast: 'calendar',
  Origins: 'stats-chart',
  Guidance: 'shield-checkmark',
  Profile: 'person',
};

export default function MainTabs({ selectedLocation, onRefreshLocation, onLocationChange, profile }: MainTabsProps) {
  const { isDark, colors } = useTheme();

  return (
    <NavigationContainer>
      <AirQualityDataProvider selectedLocation={selectedLocation}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: true,
            tabBarActiveTintColor: '#4F46E5',
            tabBarInactiveTintColor: isDark ? '#6B7280' : '#9CA3AF',
            tabBarStyle: [styles.tabBar, { backgroundColor: isDark ? '#1F2937' : '#fff', borderTopColor: isDark ? '#374151' : '#F3F4F6' }],
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
          <Tab.Screen name="Profile">
            {() => <ProfileScreen />}
          </Tab.Screen>
        </Tab.Navigator>
      </AirQualityDataProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
    paddingTop: 6,
    minHeight: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
  },
  tabBarLabel: {
    fontFamily: typography.fontMedium,
    fontSize: 9,
    marginTop: 2,
  },
});