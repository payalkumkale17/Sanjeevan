import React, { useState } from 'react';
import {
  Pressable, StyleSheet, Text, View, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../theme';
import { ActivityPattern, HealthCondition, NotificationPreference, UserProfile } from '../types';

type Props = { onComplete: (profile: UserProfile) => void };

const HEALTH_OPTIONS: { value: HealthCondition; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'None', icon: 'checkmark-circle-outline' },
  { value: 'Asthma / Respiratory', icon: 'fitness-outline' },
  { value: 'Heart Condition', icon: 'heart-outline' },
  { value: 'Allergies', icon: 'leaf-outline' },
];

const ACTIVITY_OPTIONS: { value: ActivityPattern; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'Mostly Indoor', icon: 'home-outline' },
  { value: 'Mixed', icon: 'partly-sunny-outline' },
  { value: 'Mostly Outdoor', icon: 'walk-outline' },
];

const NOTIF_OPTIONS: { value: NotificationPreference; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'Critical Alerts Only', icon: 'alert-circle-outline' },
  { value: 'Daily Updates', icon: 'calendar-outline' },
  { value: 'All Alerts', icon: 'notifications-outline' },
];

export default function OnboardingScreen({ onComplete }: Props) {
  const [profile, setProfile] = useState<UserProfile>({
    age: '',
    healthCondition: 'None',
    activityPattern: 'Mixed',
    dailyExposure: '',
    notificationPreference: 'Daily Updates',
  });

  const set = (key: keyof UserProfile, value: string) =>
    setProfile((prev) => ({ ...prev, [key]: value }));

  const canSubmit = profile.age.trim() !== '' && profile.dailyExposure.trim() !== '';

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand header */}
          <View style={styles.brandRow}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} />
            <View>
              <Text style={styles.brandName}>Sanjeevan</Text>
              <Text style={styles.brandTagline}>Air Quality Intelligence</Text>
            </View>
          </View>

          {/* Welcome text */}
          <Text style={styles.welcomeTitle}>Set up your profile</Text>
          <Text style={styles.welcomeSubtitle}>
            Tell us about yourself so we can personalise air quality guidance for you.
          </Text>

          {/* Single form card */}
          <View style={styles.formCard}>

            {/* Age + Exposure in a row */}
            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={styles.fieldLabel}>Age</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="person-outline" size={16} color="#4F46E5" />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 28"
                    keyboardType="numeric"
                    value={profile.age}
                    onChangeText={(t) => set('age', t)}
                    placeholderTextColor="#9CA3AF"
                    maxLength={3}
                  />
                </View>
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.fieldLabel}>Outdoor hrs/day</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="time-outline" size={16} color="#4F46E5" />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 2"
                    keyboardType="numeric"
                    value={profile.dailyExposure}
                    onChangeText={(t) => set('dailyExposure', t)}
                    placeholderTextColor="#9CA3AF"
                    maxLength={2}
                  />
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Health condition */}
            <Text style={styles.fieldLabel}>Health Condition</Text>
            <View style={styles.chipRow}>
              {HEALTH_OPTIONS.map((opt) => {
                const active = profile.healthCondition === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => set('healthCondition', opt.value)}
                  >
                    <Ionicons name={opt.icon} size={13} color={active ? '#fff' : '#6B7280'} />
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {opt.value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.divider} />

            {/* Activity pattern */}
            <Text style={styles.fieldLabel}>Activity Pattern</Text>
            <View style={styles.activityRow}>
              {ACTIVITY_OPTIONS.map((opt) => {
                const active = profile.activityPattern === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    style={[styles.activityCard, active && styles.activityCardActive]}
                    onPress={() => set('activityPattern', opt.value)}
                  >
                    <Ionicons name={opt.icon} size={20} color={active ? '#fff' : '#6B7280'} />
                    <Text style={[styles.activityText, active && styles.activityTextActive]}>
                      {opt.value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.divider} />

            {/* Notifications */}
            <Text style={styles.fieldLabel}>Notification Preference</Text>
            <View style={styles.chipRow}>
              {NOTIF_OPTIONS.map((opt) => {
                const active = profile.notificationPreference === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => set('notificationPreference', opt.value)}
                  >
                    <Ionicons name={opt.icon} size={13} color={active ? '#fff' : '#6B7280'} />
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {opt.value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Submit button */}
          <Pressable
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={() => canSubmit && onComplete(profile)}
            disabled={!canSubmit}
          >
            <Text style={styles.submitBtnText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>

          <Text style={styles.hint}>
            You can update these anytime from your Profile.
          </Text>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  safeArea: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 20 },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  logo: { width: 44, height: 44, resizeMode: 'contain' },
  brandName: { fontFamily: typography.fontBold, fontSize: 20, color: '#111827' },
  brandTagline: { fontFamily: typography.fontRegular, fontSize: 12, color: '#6B7280' },

  welcomeTitle: {
    fontFamily: typography.fontBold,
    fontSize: 26,
    color: '#111827',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontFamily: typography.fontRegular,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 24,
  },

  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  rowInputs: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  halfInput: { flex: 1 },
  fieldLabel: {
    fontFamily: typography.fontBold,
    fontSize: 13,
    color: '#374151',
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontFamily: typography.fontMedium,
    fontSize: 15,
    color: '#111827',
  },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  chipText: {
    fontFamily: typography.fontMedium,
    fontSize: 12,
    color: '#6B7280',
  },
  chipTextActive: { color: '#fff' },

  activityRow: { flexDirection: 'row', gap: 8 },
  activityCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  activityCardActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  activityText: {
    fontFamily: typography.fontMedium,
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  activityTextActive: { color: '#fff' },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: '#4F46E5',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#C7D2FE',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    fontFamily: typography.fontBold,
    fontSize: 16,
    color: '#fff',
  },

  hint: {
    fontFamily: typography.fontRegular,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});