import { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AirQualityDataContext } from '../context/AirQualityDataContext';
import { DetectedLocation, UserProfile } from '../types';

declare const require: any;
const { typography } = require('../theme');

type Props = {
  selectedLocation: DetectedLocation;
  profile: UserProfile;
};

function getAqiColor(aqi: number): string {
  if (aqi <= 50) return '#00C853';
  if (aqi <= 100) return '#FFD600';
  if (aqi <= 150) return '#FF6D00';
  if (aqi <= 200) return '#D50000';
  if (aqi <= 300) return '#6A1B9A';
  return '#4E0000';
}

function getAqiLabel(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

type Recommendation = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  level: 'good' | 'caution' | 'avoid';
};

function getRecommendations(aqi: number, profile: UserProfile): Recommendation[] {
  const isSensitive = profile.healthCondition !== 'None';

  if (aqi <= 50) {
    return [
      { icon: 'walk-outline', title: 'Outdoor Exercise', description: 'Great conditions for jogging, cycling, or sports.', level: 'good' },
      { icon: 'sunny-outline', title: 'Open Windows', description: 'Fresh air is safe to let in throughout the day.', level: 'good' },
      { icon: 'leaf-outline', title: 'General Activities', description: 'No restrictions — enjoy normal outdoor plans.', level: 'good' },
    ];
  }

  if (aqi <= 100) {
    return [
      { icon: 'walk-outline', title: 'Outdoor Exercise', description: isSensitive ? 'Light activity is fine; avoid intense workouts for long durations.' : 'Generally safe for most people to be active outdoors.', level: 'good' },
      { icon: 'sunny-outline', title: 'Open Windows', description: 'Ventilation is fine, especially in the morning.', level: 'good' },
      { icon: 'medkit-outline', title: 'Sensitive Groups', description: 'If you have asthma or allergies, keep a rescue inhaler handy.', level: 'caution' },
    ];
  }

  if (aqi <= 150) {
    return [
      { icon: 'fitness-outline', title: 'Limit Outdoor Exercise', description: isSensitive ? 'Avoid prolonged or heavy outdoor exertion today.' : 'Reduce intensity if you notice irritation or coughing.', level: 'caution' },
      { icon: 'home-outline', title: 'Keep Windows Closed', description: 'Close windows during peak traffic hours (morning & evening).', level: 'caution' },
      { icon: 'medical-outline', title: 'Mask Recommended', description: 'Sensitive individuals should wear an N95 mask outdoors.', level: 'caution' },
    ];
  }

  if (aqi <= 200) {
    return [
      { icon: 'close-circle-outline', title: 'Avoid Outdoor Exercise', description: 'Move workouts indoors. Outdoor exertion can trigger symptoms.', level: 'avoid' },
      { icon: 'home-outline', title: 'Stay Indoors', description: 'Keep windows and doors closed. Use an air purifier if available.', level: 'avoid' },
      { icon: 'medical-outline', title: 'Wear a Mask', description: 'N95/N99 mask is recommended for everyone when outside.', level: 'avoid' },
      { icon: 'water-outline', title: 'Stay Hydrated', description: 'Drink plenty of water to help your body cope with pollutants.', level: 'caution' },
    ];
  }

  if (aqi <= 300) {
    return [
      { icon: 'ban-outline', title: 'No Outdoor Activity', description: 'Avoid all outdoor activity, especially for children & elderly.', level: 'avoid' },
      { icon: 'home-outline', title: 'Seal Your Home', description: 'Keep windows shut and run an air purifier continuously.', level: 'avoid' },
      { icon: 'medical-outline', title: 'N95 Mask Mandatory', description: 'Always wear a properly fitted N95 mask if you must go outside.', level: 'avoid' },
      { icon: 'call-outline', title: 'Watch for Symptoms', description: 'Seek medical help if experiencing breathing difficulty.', level: 'avoid' },
    ];
  }

  return [
    { icon: 'alert-circle-outline', title: 'Health Emergency', description: 'Avoid all outdoor exposure. This is a hazardous air quality day.', level: 'avoid' },
    { icon: 'home-outline', title: 'Stay Indoors', description: 'Remain indoors with windows sealed and purifiers running on high.', level: 'avoid' },
    { icon: 'medical-outline', title: 'Mask at All Times', description: 'Wear N95/N99 masks even indoors if air quality is poor there too.', level: 'avoid' },
    { icon: 'call-outline', title: 'Medical Attention', description: 'Contact a doctor immediately if you feel unwell.', level: 'avoid' },
  ];
}

function levelColor(level: Recommendation['level']): string {
  if (level === 'good') return '#00C853';
  if (level === 'caution') return '#FF6D00';
  return '#D50000';
}

function levelBg(level: Recommendation['level']): string {
  if (level === 'good') return '#E8F5E9';
  if (level === 'caution') return '#FFF3E0';
  return '#FFEBEE';
}

export default function GuidanceScreen({ selectedLocation, profile }: Props) {
  const { bundle } = useContext(AirQualityDataContext);
  const aqi = bundle?.reading.currentAqi ?? 0;
  const aqiColor = getAqiColor(aqi);
  const aqiLabel = getAqiLabel(aqi);
  const recommendations = getRecommendations(aqi, profile);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Guidance</Text>
          <Text style={styles.headerSubtitle}>Health recommendations for {selectedLocation.label}</Text>
        </View>

        {/* Current status banner */}
        <View style={[styles.statusBanner, { backgroundColor: aqiColor + '15', borderColor: aqiColor + '40' }]}>
          <View>
            <Text style={styles.statusLabel}>Current Conditions</Text>
            <Text style={[styles.statusValue, { color: aqiColor }]}>{aqiLabel}</Text>
          </View>
          <View style={[styles.statusAqiBadge, { backgroundColor: aqiColor }]}>
            <Text style={styles.statusAqiText}>{aqi}</Text>
          </View>
        </View>

        {/* Recommendations */}
        <Text style={styles.sectionTitle}>Recommendations for You</Text>
        {profile.healthCondition !== 'None' && (
          <View style={styles.profileNote}>
            <Ionicons name="person-outline" size={14} color="#4F46E5" />
            <Text style={styles.profileNoteText}>
              Personalized for your profile: {profile.healthCondition}
            </Text>
          </View>
        )}

        {recommendations.map((rec, idx) => (
          <View key={idx} style={[styles.recCard, { backgroundColor: levelBg(rec.level) }]}>
            <View style={[styles.recIconWrap, { backgroundColor: levelColor(rec.level) + '22' }]}>
              <Ionicons name={rec.icon} size={20} color={levelColor(rec.level)} />
            </View>
            <View style={styles.recContent}>
              <Text style={styles.recTitle}>{rec.title}</Text>
              <Text style={styles.recDesc}>{rec.description}</Text>
            </View>
          </View>
        ))}

        {/* General tips */}
        <Text style={styles.sectionTitle}>General Tips</Text>
        <View style={styles.tipsCard}>
          {[
            { icon: 'time-outline', text: 'Check AQI before planning outdoor activities, especially exercise.' },
            { icon: 'car-outline', text: 'Avoid high-traffic roads during rush hour when pollution peaks.' },
            { icon: 'restaurant-outline', text: 'Eat antioxidant-rich foods (fruits, vegetables) to support lung health.' },
            { icon: 'bed-outline', text: 'Keep bedroom windows closed at night when pollution often settles.' },
          ].map((tip, idx) => (
            <View key={idx} style={styles.tipRow}>
              <Ionicons name={tip.icon as any} size={16} color="#6B7280" />
              <Text style={styles.tipRowText}>{tip.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { paddingHorizontal: 16 },
  header: { paddingTop: 12, paddingBottom: 16 },
  headerTitle: { fontFamily: typography.fontBold, fontSize: 28, color: '#111827' },
  headerSubtitle: { fontFamily: typography.fontRegular, fontSize: 13, color: '#6B7280', marginTop: 2 },

  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 20,
  },
  statusLabel: { fontFamily: typography.fontMedium, fontSize: 12, color: '#6B7280', marginBottom: 4 },
  statusValue: { fontFamily: typography.fontBold, fontSize: 18 },
  statusAqiBadge: { borderRadius: 12, width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  statusAqiText: { fontFamily: typography.fontBold, fontSize: 18, color: '#fff' },

  sectionTitle: { fontFamily: typography.fontBold, fontSize: 18, color: '#111827', marginBottom: 12 },

  profileNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  profileNoteText: { fontFamily: typography.fontMedium, fontSize: 12, color: '#4F46E5' },

  recCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  recIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  recContent: { flex: 1 },
  recTitle: { fontFamily: typography.fontBold, fontSize: 14, color: '#111827', marginBottom: 2 },
  recDesc: { fontFamily: typography.fontRegular, fontSize: 12, color: '#4B5563', lineHeight: 18 },

  tipsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  tipRowText: { fontFamily: typography.fontRegular, fontSize: 13, color: '#4B5563', flex: 1, lineHeight: 19 },
});
