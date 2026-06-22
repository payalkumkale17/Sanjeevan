import { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAirQualityContext } from '../context/AirQualityDataContext';
import { useTheme } from '../context/ThemeContext';
import { DetectedLocation, UserProfile } from '../types';
import { typography } from '../theme';

type Props = { selectedLocation: DetectedLocation; profile: UserProfile };

function getAqiColor(aqi: number): string {
  if (aqi <= 50) return '#00C853';
  if (aqi <= 100) return '#FFB300';
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
  if (aqi <= 50) return [
    { icon: 'walk-outline', title: 'Outdoor Exercise', description: 'Great conditions for jogging, cycling, or sports.', level: 'good' },
    { icon: 'sunny-outline', title: 'Open Windows', description: 'Fresh air is safe to let in throughout the day.', level: 'good' },
    { icon: 'leaf-outline', title: 'General Activities', description: 'No restrictions — enjoy normal outdoor plans.', level: 'good' },
  ];
  if (aqi <= 100) return [
    { icon: 'walk-outline', title: 'Outdoor Exercise', description: isSensitive ? 'Light activity is fine; avoid intense workouts for long durations.' : 'Generally safe for most people to be active outdoors.', level: 'good' },
    { icon: 'sunny-outline', title: 'Open Windows', description: 'Ventilation is fine, especially in the morning.', level: 'good' },
    { icon: 'medkit-outline', title: 'Sensitive Groups', description: 'If you have asthma or allergies, keep a rescue inhaler handy.', level: 'caution' },
  ];
  if (aqi <= 150) return [
    { icon: 'fitness-outline', title: 'Limit Outdoor Exercise', description: isSensitive ? 'Avoid prolonged or heavy outdoor exertion today.' : 'Reduce intensity if you notice irritation or coughing.', level: 'caution' },
    { icon: 'home-outline', title: 'Keep Windows Closed', description: 'Close windows during peak traffic hours (morning & evening).', level: 'caution' },
    { icon: 'medical-outline', title: 'Mask Recommended', description: 'Sensitive individuals should wear an N95 mask outdoors.', level: 'caution' },
  ];
  if (aqi <= 200) return [
    { icon: 'close-circle-outline', title: 'Avoid Outdoor Exercise', description: 'Move workouts indoors. Outdoor exertion can trigger symptoms.', level: 'avoid' },
    { icon: 'home-outline', title: 'Stay Indoors', description: 'Keep windows and doors closed. Use an air purifier if available.', level: 'avoid' },
    { icon: 'medical-outline', title: 'Wear a Mask', description: 'N95/N99 mask is recommended for everyone when outside.', level: 'avoid' },
    { icon: 'water-outline', title: 'Stay Hydrated', description: 'Drink plenty of water to help your body cope with pollutants.', level: 'caution' },
  ];
  return [
    { icon: 'ban-outline', title: 'No Outdoor Activity', description: 'Avoid all outdoor activity, especially for children & elderly.', level: 'avoid' },
    { icon: 'home-outline', title: 'Seal Your Home', description: 'Keep windows shut and run an air purifier continuously.', level: 'avoid' },
    { icon: 'medical-outline', title: 'N95 Mask Mandatory', description: 'Always wear a properly fitted N95 mask if you must go outside.', level: 'avoid' },
    { icon: 'call-outline', title: 'Watch for Symptoms', description: 'Seek medical help if experiencing breathing difficulty.', level: 'avoid' },
  ];
}

function levelColor(level: Recommendation['level']): string {
  if (level === 'good') return '#00C853';
  if (level === 'caution') return '#FF6D00';
  return '#D50000';
}

function levelBg(level: Recommendation['level'], isDark: boolean): string {
  if (isDark) {
    if (level === 'good') return '#052e16';
    if (level === 'caution') return '#431407';
    return '#3b0000';
  }
  if (level === 'good') return '#E8F5E9';
  if (level === 'caution') return '#FFF3E0';
  return '#FFEBEE';
}

export default function GuidanceScreen({ selectedLocation, profile }: Props) {
  const { aqiData } = useAirQualityContext();
  const { colors, isDark } = useTheme();
  const aqi = aqiData?.currentAqi ?? 0;
  const aqiColor = getAqiColor(aqi);
  const aqiLabel = getAqiLabel(aqi);
  const recommendations = getRecommendations(aqi, profile);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Guidance</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            Health recommendations for {selectedLocation.label}
          </Text>
        </View>

        {/* Status banner */}
        <View style={[styles.statusBanner, { backgroundColor: aqiColor + '15', borderColor: aqiColor + '40' }]}>
          <View>
            <Text style={[styles.statusLabel, { color: colors.textMuted }]}>Current Conditions</Text>
            <Text style={[styles.statusValue, { color: aqiColor }]}>{aqiLabel}</Text>
          </View>
          <View style={[styles.statusAqiBadge, { backgroundColor: aqiColor }]}>
            <Text style={styles.statusAqiText}>{aqi}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recommendations for You</Text>

        {profile.healthCondition !== 'None' && (
          <View style={[styles.profileNote, { backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF' }]}>
            <Ionicons name="person-outline" size={14} color="#4F46E5" />
            <Text style={styles.profileNoteText}>
              Personalized for your profile: {profile.healthCondition}
            </Text>
          </View>
        )}

        {recommendations.map((rec, idx) => (
          <View key={idx} style={[styles.recCard, { backgroundColor: levelBg(rec.level, isDark) }]}>
            <View style={[styles.recIconWrap, { backgroundColor: levelColor(rec.level) + '22' }]}>
              <Ionicons name={rec.icon} size={20} color={levelColor(rec.level)} />
            </View>
            <View style={styles.recContent}>
              <Text style={[styles.recTitle, { color: colors.textPrimary }]}>{rec.title}</Text>
              <Text style={[styles.recDesc, { color: colors.textLight }]}>{rec.description}</Text>
            </View>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>General Tips</Text>
        <View style={[styles.tipsCard, { backgroundColor: colors.surface }]}>
          {[
            { icon: 'time-outline', text: 'Check AQI before planning outdoor activities, especially exercise.' },
            { icon: 'car-outline', text: 'Avoid high-traffic roads during rush hour when pollution peaks.' },
            { icon: 'restaurant-outline', text: 'Eat antioxidant-rich foods (fruits, vegetables) to support lung health.' },
            { icon: 'bed-outline', text: 'Keep bedroom windows closed at night when pollution often settles.' },
          ].map((tip, idx) => (
            <View key={idx} style={[styles.tipRow, idx > 0 && { borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#F3F4F6' }]}>
              <Ionicons name={tip.icon as any} size={16} color="#4F46E5" />
              <Text style={[styles.tipRowText, { color: colors.textLight }]}>{tip.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  header: { paddingTop: 16, paddingBottom: 16 },
  headerTitle: { fontFamily: typography.fontBold, fontSize: 28 },
  headerSubtitle: { fontFamily: typography.fontRegular, fontSize: 13, marginTop: 2 },
  statusBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 16, borderWidth: 1.5, padding: 16, marginBottom: 20 },
  statusLabel: { fontFamily: typography.fontMedium, fontSize: 12, marginBottom: 4 },
  statusValue: { fontFamily: typography.fontBold, fontSize: 18 },
  statusAqiBadge: { borderRadius: 12, width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  statusAqiText: { fontFamily: typography.fontBold, fontSize: 18, color: '#fff' },
  sectionTitle: { fontFamily: typography.fontBold, fontSize: 18, marginBottom: 12 },
  profileNote: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, padding: 10, marginBottom: 12 },
  profileNoteText: { fontFamily: typography.fontMedium, fontSize: 12, color: '#4F46E5' },
  recCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: 16, padding: 14, marginBottom: 10 },
  recIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  recContent: { flex: 1 },
  recTitle: { fontFamily: typography.fontBold, fontSize: 14, marginBottom: 2 },
  recDesc: { fontFamily: typography.fontRegular, fontSize: 12, lineHeight: 18 },
  tipsCard: { borderRadius: 16, padding: 16, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 12 },
  tipRowText: { fontFamily: typography.fontRegular, fontSize: 13, flex: 1, lineHeight: 19 },
});