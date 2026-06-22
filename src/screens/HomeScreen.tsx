import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAirQualityContext } from '../context/AirQualityDataContext';
import { useTheme } from '../context/ThemeContext';
import { DetectedLocation } from '../types';
import LocationModal from '../components/LocationModal';
import { typography } from '../theme';

type Props = {
  selectedLocation: DetectedLocation;
  onRefreshLocation: () => Promise<void>;
  onLocationChange: (location: DetectedLocation) => void;
};

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
  if (aqi <= 150) return 'Unhealthy for Sensitive';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

function getAqiBg(aqi: number, isDark: boolean): string {
  if (isDark) {
    if (aqi <= 50) return '#052e16';
    if (aqi <= 100) return '#2d1a00';
    if (aqi <= 150) return '#431407';
    if (aqi <= 200) return '#3b0000';
    if (aqi <= 300) return '#2d1b3d';
    return '#1a0000';
  }
  if (aqi <= 50) return '#E8F5E9';
  if (aqi <= 100) return '#FFFDE7';
  if (aqi <= 150) return '#FFF3E0';
  if (aqi <= 200) return '#FFEBEE';
  if (aqi <= 300) return '#F3E5F5';
  return '#EFEBE9';
}

function getPollutantColor(value: number, good: number, max: number): string {
  const ratio = value / max;
  if (ratio <= 0.3) return '#00C853';
  if (ratio <= 0.6) return '#FFB300';
  if (ratio <= 0.8) return '#FF6D00';
  return '#D50000';
}

function getPollutantStatus(value: number, good: number): string {
  if (value <= good * 0.5) return 'Good';
  if (value <= good) return 'Fair';
  if (value <= good * 2) return 'Poor';
  return 'Very Poor';
}

function getHealthTip(aqi: number): string {
  if (aqi <= 50) return 'Air quality is great. Perfect day for outdoor activities!';
  if (aqi <= 100) return 'Acceptable air quality. Unusually sensitive people should consider limiting prolonged outdoor exertion.';
  if (aqi <= 150) return 'Sensitive groups should limit outdoor exertion. Others can continue normal activity.';
  if (aqi <= 200) return 'Everyone should limit prolonged outdoor exertion. Wear a mask if going outside.';
  if (aqi <= 300) return 'Avoid outdoor activities. Keep windows closed and use air purifiers indoors.';
  return 'Health alert! Avoid all outdoor activities. Use N95 mask if you must go outside.';
}

function formatAgo(utc: string): string {
  const diff = Math.max(0, Math.round((Date.now() - new Date(utc).getTime()) / 60000));
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  return `${Math.round(diff / 60)}h ago`;
}

export default function HomeScreen({ selectedLocation, onRefreshLocation, onLocationChange }: Props) {
  const { aqiData, weatherData, sourceType, updatedAtUtc, refresh } = useAirQualityContext();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const aqi = aqiData?.currentAqi ?? 0;
  const aqiColor = getAqiColor(aqi);
  const aqiLabel = getAqiLabel(aqi);
  const aqiBg = getAqiBg(aqi, isDark);
  const healthTip = getHealthTip(aqi);
  const pm25 = aqiData?.pm25 ?? 0;
  const pm10 = aqiData?.pm10 ?? 0;
  const temp = weatherData?.current?.temperature2m ?? 0;
  const humidity = weatherData?.current?.relativeHumidity2m ?? 0;
  const wind = weatherData?.current?.windSpeed10m ?? 0;

  const pollutants = [
    { key: 'pm25', label: 'PM2.5', value: pm25, unit: 'µg/m³', good: 12, max: 250, description: 'Fine particles — main driver of AQI' },
    { key: 'pm10', label: 'PM10', value: pm10, unit: 'µg/m³', good: 54, max: 430, description: 'Coarse dust particles' },
    { key: 'temp', label: 'Temp', value: temp, unit: '°C', good: 25, max: 45, description: 'Ambient temperature' },
    { key: 'humidity', label: 'Humidity', value: humidity, unit: '%', good: 50, max: 100, description: 'Relative humidity' },
    { key: 'wind', label: 'Wind', value: wind, unit: 'km/h', good: 15, max: 60, description: 'Wind speed — higher = better dispersion' },
  ];

  const aqiSegments = [
    { label: '0', color: '#00C853' },
    { label: '50', color: '#FFB300' },
    { label: '100', color: '#FF6D00' },
    { label: '150', color: '#D50000' },
    { label: '200', color: '#6A1B9A' },
    { label: '300+', color: '#4E0000' },
  ];

  const markerPosition = Math.min(Math.max((aqi / 300) * 100, 0), 100);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Dashboard</Text>
        <TouchableOpacity
          style={[styles.locationPill, { backgroundColor: colors.surface, borderColor: isDark ? '#374151' : '#E5E7EB' }]}
          onPress={() => setLocationModalVisible(true)}
        >
          <Ionicons name="location" size={14} color="#4F46E5" />
          <Text style={[styles.locationText, { color: colors.textPrimary }]}>{selectedLocation.label}</Text>
          <Ionicons name="chevron-down" size={13} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {sourceType === 'fallback' && (
          <View style={[styles.banner, { backgroundColor: isDark ? '#2d1a00' : '#FEF3C7', borderColor: isDark ? '#78350F' : '#FDE68A' }]}>
            <Ionicons name="warning-outline" size={16} color="#D97706" />
            <Text style={[styles.bannerText, { color: isDark ? '#FCD34D' : '#92400E' }]}>Live data unavailable. Showing fallback insights.</Text>
          </View>
        )}

        {/* AQI Card */}
        <View style={[styles.aqiCard, { backgroundColor: aqiBg, borderColor: aqiColor + '40' }]}>
          <View style={styles.aqiTopRow}>
            <View>
              <Text style={[styles.aqiSmallLabel, { color: colors.textMuted }]}>CURRENT AQI</Text>
              <View style={styles.aqiValueRow}>
                <Text style={[styles.aqiNumber, { color: aqiColor }]}>{aqi}</Text>
                <View style={[styles.aqiBadge, { backgroundColor: aqiColor }]}>
                  <Text style={styles.aqiBadgeText}>{aqiLabel}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.scaleWrap}>
            <View style={styles.scaleBar}>
              {aqiSegments.map((seg, i) => (
                <View key={i} style={[styles.scaleSegment, { backgroundColor: seg.color }]} />
              ))}
              <View style={[styles.scaleMarker, { left: `${markerPosition}%` as any, borderColor: colors.textPrimary }]} />
            </View>
            <View style={styles.scaleLabels}>
              {aqiSegments.map((seg, i) => (
                <Text key={i} style={[styles.scaleLabel, { color: colors.textMuted }]}>{seg.label}</Text>
              ))}
            </View>
          </View>

          <Text style={[styles.aqiLocation, { color: colors.textPrimary }]}>
            Air quality in {selectedLocation.label} is currently {aqiLabel.toLowerCase()}.
          </Text>

          <View style={[styles.tipBox, { borderLeftColor: aqiColor }]}>
            <Ionicons name="heart-outline" size={14} color={aqiColor} />
            <Text style={[styles.tipText, { color: colors.textLight }]}>{healthTip}</Text>
          </View>

          {updatedAtUtc && (
            <Text style={[styles.updatedText, { color: colors.textMuted }]}>
              Last updated {formatAgo(updatedAtUtc)}
            </Text>
          )}
        </View>

        {/* Live Measurements */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Live Measurements</Text>
          <TouchableOpacity onPress={handleRefresh} style={[styles.refreshBtn, { backgroundColor: isDark ? '#312E81' : '#EEF2FF' }]}>
            <Ionicons name="refresh" size={14} color="#4F46E5" />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pollutantGrid}>
          {pollutants.map((p) => {
            const pColor = getPollutantColor(p.value, p.good, p.max);
            const pStatus = getPollutantStatus(p.value, p.good);
            const barWidth = Math.min((p.value / p.max) * 100, 100);
            return (
              <View key={p.key} style={[styles.pollutantCard, { backgroundColor: colors.surface }]}>
                <View style={styles.pollutantTopRow}>
                  <Text style={[styles.pollutantLabel, { color: colors.textMuted }]}>{p.label}</Text>
                  <View style={[styles.pollutantBadge, { backgroundColor: pColor + '22' }]}>
                    <Text style={[styles.pollutantBadgeText, { color: pColor }]}>{pStatus}</Text>
                  </View>
                </View>
                <Text style={[styles.pollutantValue, { color: pColor }]}>
                  {p.value.toFixed(1)}
                  <Text style={[styles.pollutantUnit, { color: colors.textMuted }]}> {p.unit}</Text>
                </Text>
                <View style={[styles.pollutantBar, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                  <View style={[styles.pollutantFill, { width: `${barWidth}%` as any, backgroundColor: pColor }]} />
                </View>
                <Text style={[styles.pollutantDesc, { color: colors.textMuted }]}>{p.description}</Text>
              </View>
            );
          })}
        </View>

        {/* AQI Scale Reference */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>AQI Scale Reference</Text>
        <View style={[styles.scaleRef, { backgroundColor: colors.surface }]}>
          {[
            { range: '0–50', label: 'Good', color: '#00C853', tip: 'Ideal for outdoor activities' },
            { range: '51–100', label: 'Moderate', color: '#FFB300', tip: 'Sensitive groups take care' },
            { range: '101–150', label: 'Unhealthy (Sensitive)', color: '#FF6D00', tip: 'Limit prolonged exertion' },
            { range: '151–200', label: 'Unhealthy', color: '#D50000', tip: 'Wear a mask outdoors' },
            { range: '201–300', label: 'Very Unhealthy', color: '#6A1B9A', tip: 'Avoid outdoor activities' },
            { range: '301+', label: 'Hazardous', color: '#4E0000', tip: 'Stay indoors, use purifier' },
          ].map((row) => (
            <View key={row.range} style={styles.scaleRow}>
              <View style={[styles.scaleDot, { backgroundColor: row.color }]} />
              <View style={styles.scaleRowContent}>
                <View style={styles.scaleRowTop}>
                  <Text style={[styles.scaleRangeText, { color: colors.textPrimary }]}>{row.range}</Text>
                  <Text style={[styles.scaleLabelText, { color: row.color }]}>{row.label}</Text>
                </View>
                <Text style={[styles.scaleTip, { color: colors.textMuted }]}>{row.tip}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <LocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onSelect={(loc) => { onLocationChange(loc); setLocationModalVisible(false); }}
        currentLocation={selectedLocation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { fontFamily: typography.fontBold, fontSize: 28 },
  locationPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  locationText: { fontFamily: typography.fontMedium, fontSize: 13 },
  scroll: { paddingHorizontal: 16 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  bannerText: { fontFamily: typography.fontMedium, fontSize: 13, flex: 1 },
  aqiCard: { borderRadius: 20, borderWidth: 1.5, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  aqiTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  aqiSmallLabel: { fontFamily: typography.fontMedium, fontSize: 11, letterSpacing: 1, marginBottom: 4 },
  aqiValueRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aqiNumber: { fontFamily: typography.fontBold, fontSize: 64, lineHeight: 72 },
  aqiBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'center' },
  aqiBadgeText: { fontFamily: typography.fontBold, fontSize: 13, color: '#fff' },
  scaleWrap: { marginBottom: 16 },
  scaleBar: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', position: 'relative' },
  scaleSegment: { flex: 1 },
  scaleMarker: { position: 'absolute', top: -3, width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', borderWidth: 3, marginLeft: -8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3, elevation: 4 },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  scaleLabel: { fontFamily: typography.fontMedium, fontSize: 10 },
  aqiLocation: { fontFamily: typography.fontMedium, fontSize: 15, marginBottom: 12 },
  tipBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderLeftWidth: 3, paddingLeft: 10, marginBottom: 10 },
  tipText: { fontFamily: typography.fontRegular, fontSize: 13, flex: 1, lineHeight: 20 },
  updatedText: { fontFamily: typography.fontRegular, fontSize: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontFamily: typography.fontBold, fontSize: 18, marginBottom: 12 },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  refreshText: { fontFamily: typography.fontMedium, fontSize: 12, color: '#4F46E5' },
  pollutantGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  pollutantCard: { width: '47.5%', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  pollutantTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  pollutantLabel: { fontFamily: typography.fontMedium, fontSize: 12 },
  pollutantBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  pollutantBadgeText: { fontFamily: typography.fontBold, fontSize: 10 },
  pollutantValue: { fontFamily: typography.fontBold, fontSize: 22, marginBottom: 8 },
  pollutantUnit: { fontFamily: typography.fontRegular, fontSize: 12 },
  pollutantBar: { height: 5, borderRadius: 3, marginBottom: 6, overflow: 'hidden' },
  pollutantFill: { height: 5, borderRadius: 3 },
  pollutantDesc: { fontFamily: typography.fontRegular, fontSize: 11, lineHeight: 15 },
  scaleRef: { borderRadius: 16, padding: 16, gap: 12, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  scaleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  scaleDot: { width: 12, height: 12, borderRadius: 6, marginTop: 3 },
  scaleRowContent: { flex: 1 },
  scaleRowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  scaleRangeText: { fontFamily: typography.fontMedium, fontSize: 13 },
  scaleLabelText: { fontFamily: typography.fontBold, fontSize: 13 },
  scaleTip: { fontFamily: typography.fontRegular, fontSize: 12 },
});