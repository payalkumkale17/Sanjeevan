import AsyncStorage from '@react-native-async-storage/async-storage';

import { UserProfile, DetectedLocation } from '../types';

const profileStorageKey = 'sanjeevan:user-profile';
const locationStorageKey = 'sanjeevan:selected-location';

type StoredProfile = {
  age?: string;
  health_condition?: UserProfile['healthCondition'];
  activity_pattern?: UserProfile['activityPattern'];
  daily_exposure?: string;
  notification_preference?: UserProfile['notificationPreference'];
  
  // Legacy fields
  ageGroup?: string;
  healthCondition?: string;
  activityPreference?: string;
};

export async function saveProfile(profile: UserProfile): Promise<void> {
  const stored: StoredProfile = {
    age: profile.age,
    health_condition: profile.healthCondition,
    activity_pattern: profile.activityPattern,
    daily_exposure: profile.dailyExposure,
    notification_preference: profile.notificationPreference,
  };
  await AsyncStorage.setItem(profileStorageKey, JSON.stringify(stored));
}

export async function loadProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(profileStorageKey);
  if (!raw) {
    return null;
  }

  const parsed = JSON.parse(raw) as StoredProfile;
  const healthCondition = (parsed.health_condition ?? parsed.healthCondition ?? 'None') as UserProfile['healthCondition'];
  const activityPattern = (parsed.activity_pattern ?? parsed.activityPreference ?? 'Mixed') as UserProfile['activityPattern'];
  
  const age = parsed.age ?? '';
  const dailyExposure = parsed.daily_exposure ?? '';
  const notificationPreference = (parsed.notification_preference ?? 'Daily Updates') as UserProfile['notificationPreference'];

  // Not returning null immediately, but just taking the existing fields or fallbacks
  return {
    age,
    healthCondition,
    activityPattern,
    dailyExposure,
    notificationPreference,
  };
}

export async function saveLocation(location: DetectedLocation): Promise<void> {
  const stored = {
    label: location.label,
    latitude: location.latitude,
    longitude: location.longitude,
    source: location.source,
  };
  await AsyncStorage.setItem(locationStorageKey, JSON.stringify(stored));
}

export async function loadLocation(): Promise<DetectedLocation | null> {
  try {
    const raw = await AsyncStorage.getItem(locationStorageKey);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as DetectedLocation;
  } catch {
    return null;
  }
}
