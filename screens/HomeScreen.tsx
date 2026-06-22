import { useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AirQualityDataContext } from '../context/AirQualityDataContext';
import { DetectedLocation } from '../types';
import LocationModal from '../components/LocationModal';

declare const require: any;
const { palette, typography } = require('../theme');

// ── AQI colour system (matches aqi.in scale) ─────────────────────────────────
function getAqiColor(aqi: number): string {
  if (aqi <= 50) return '#00C853';   // Good – green
  if (aqi <= 100) return '#FFD600';  // Moderate – yellow
  if (aqi <= 150) return '#FF6D00';  // Unhealthy for Sensitive – orange
  if (aqi <= 200) return '#D50000';  // Unhealthy – red
  if (aqi <= 300) return '#6A1B9A';  // Very Unhealthy – purple
  return '#4E0000';                  // Hazardous – maroon
}

function getAqiLabel(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

function getAqiEmoji(aqi: number): string {
  if (aqi <= 50) return '😊';
  if (aqi <= 100) return '😐';
  if (aqi <= 150) return '😷';
  if (aqi <= 200) return '🤧';
  if (aqi <= 300) return '😰';
  return '☠️';
}

function getAqiBg(aqi: number): string {
  if (aqi <= 50) return '#E8F5E9';
  if (aqi <= 100) return '#FFFDE7';
  if (aqi <= 150) return '#FFF3E0';
  if (aqi <= 200) return '#FFEBEE';
  if (aqi <= 300) return '#F3E5F5';
  return '#EFEBE9';
}

// ── Pollutant helpers ─────────────────────────────────────────────────────────
type Pollutant = {
  key: string;
  label: string;
  value: number;
  unit: string;
  good: number;
  max: number;
  description: string;
};

function getPollutantColor(value: number, good: number, max: number): string {
  const ratio = (value - 0) / (max - 0);
  if (ratio <= 0.3) return '#00C853';
  if (ratio <= 0.6) return '#FFD600';
  if (ratio <= 0.8) return '#FF6D00';
  return '#D50000';
}

function getPollutantStatus(value: number, good: number): string {
  if (value <= good * 0.5) return 'Good';
  if (value <= good) return 'Fair';
  if (value <= good * 2) return 'Poor';
  return 'Very Poor';
}

// ── Health tip by AQI ─────────────────────────────────────────────────────────
function getHealthTip(aqi: number): string {
  if (aqi <= 50) return 'Air quality is great. Perfect day for outdoor activities!';
  if (aqi <= 100) return 'Acceptable air quality. Unusually sensitive people should consider limiting prolonged outdoor exertion.';
  if (aqi <= 150) return 'Sensitive groups should limit outdoor exertion. Others can continue normal activity.';
  if (aqi <= 200) return 'Everyone should limit prolonged outdoor exertion. Wear a mask if going outside.';
  if (aqi <= 300) return 'Avoid outdoor activities. Keep windows closed and use air purifiers indoors.';
  return 'Health alert! Avoid all outdoor activities. Use N95 mask if you must go outside.';
}

// ── Props ─────────────────────────────────────────────────────────────────────
type Props = {
  selectedLocation: DetectedLocation;
  onRefreshLocation: () => Promise<void>;
  onLocationChange: (location: DetectedLocation) => void;
};

export default function HomeScreen({ selectedLocation, onRefreshLocation, onLocationChange }: Props) {
  const { bundle, loading, error, refresh } = useContext(AirQualityDataContext);
  const [refreshing, setRefreshing] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh(true);
    setRefreshing(false);
  }, [refresh]);

  const aqi = bundle?.reading.currentAqi ?? 0;
  const aqiColor = getAqiColor(aqi);
  const aqiLabel = getAqiLabel(aqi);
  const aqiBg = getAqiBg(aqi);
  const aqiEmoji = getAqiEmoji(aqi);
  const healthTip = getHealthTip(aqi);

  const pm25 = bundle?.reading.pm25 ?? 0;
  const pm10 = bundle?.reading.pm10 ?? 0;
  const temp = bundle?.weather?.current?.temperature2m ?? 0;
  const humidity = bundle?.weather?.current?.relativeHumidity2m ?? 0;
  const wind = bundle?.weather?.current?.windSpeed10m ?? 0;

  const pollutants: Pollutant[] = [
    { key: 'pm25', label: 'PM2.5', value: pm25, unit: 'µg/m³', good: 12, max: 250, description: 'Fine particles — main driver of AQI' },
    { key: 'pm10', label: 'PM10', value: pm10, unit: 'µg/m³', good: 54, max: 430, description: 'Coarse dust particles' },
    { key: 'temp', label: 'Temp', value: temp, unit: '°C', good: 25, max: 45, description: 'Ambient temperature' },
    { key: 'humidity', label: 'Humidity', value: humidity, unit: '%', good: 50, max: 100, description: 'Relative humidity' },
    { key: 'wind', label: 'Wind', value: wind, unit: 'km/h', good: 15, max: 60, description: 'Wind speed — higher = better dispersion' },
  ];

  // AQI scale segments for the colour bar
  const aqiSegments = [
    { label: '0', color: '#00C853' },
    { label: '50', color: '#FFD600' },
    { label: '100', color: '#FF6D00' },
    { label: '150', color: '#D50000' },
    { label: '200', color: '#6A1B9A' },
    { label: '300+', color: '#4E0000' },
  ];

  const markerPosition = Math.min(Math.max((aqi / 300) * 100, 0), 100);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity style={styles.locationPill} onPress={() => setLocationModalVisible(true)}>
          <Ionicons name="location" size={14} color={palette.primary ?? '#4F46E5'} />
          <Text style={styles.locationText}>{selectedLocation.label}</Text>
          <Ionicons name="chevron-down" size={13} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Fallback banner */}
        {bundle?.source === 'fallback' && (
          <View style={styles.banner}>
            <Ionicons name="warning-outline" size={16} color="#D97706" />
            <Text style={styles.bannerText}>Live data unavailable. Showing fallback insights.</Text>
          </View>
        )}

        {/* ── Main AQI Card ── */}
        <View style={[styles.aqiCard, { backgroundColor: aqiBg, borderColor: aqiColor + '40' }]}>
          <View style={styles.aqiTopRow}>
            <View>
              <Text style={styles.aqiSmallLabel}>CURRENT AQI</Text>
              <View style={styles.aqiValueRow}>
                <Text style={[styles.aqiNumber, { color: aqiColor }]}>{aqi}</Text>
                <View style={[styles.aqiBadge, { backgroundColor: aqiColor }]}>
                  <Text style={styles.aqiBadgeText}>{aqiLabel}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.aqiEmoji}>{aqiEmoji}</Text>
          </View>

          {/* Colour scale bar */}
          <View style={styles.scaleWrap}>
            <View style={styles.scaleBar}>
              {aqiSegments.map((seg, i) => (
                <View key={i} style={[styles.scaleSegment, { backgroundColor: seg.color }]} />
              ))}
              {/* Marker */}
              <View style={[styles.scaleMarker, { left: `${markerPosition}%` as any }]} />
            </View>
            <View style={styles.scaleLabels}>
              {aqiSegments.map((seg, i) => (
                <Text key={i} style={styles.scaleLabel}>{seg.label}</Text>
              ))}
            </View>
          </View>

          <Text style={styles.aqiLocation}>Air quality in {selectedLocation.label} is currently {aqiLabel.toLowerCase()}.</Text>

          {/* Health tip */}
          <View style={[styles.tipBox, { borderLeftColor: aqiColor }]}>
            <Ionicons name="heart-outline" size={14} color={aqiColor} />
            <Text style={styles.tipText}>{healthTip}</Text>
          </View>

          {bundle?.updatedAtUtc && (
            <Text style={styles.updatedText}>
              Last updated {formatAgo(bundle.updatedAtUtc)}
            </Text>
          )}
        </View>

        {/* ── Pollutant Breakdown ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Measurements</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={14} color={palette.primary ?? '#4F46E5'} />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pollutantGrid}>
          {pollutants.map((p) => {
            const pColor = getPollutantColor(p.value, p.good, p.max);
            const pStatus = getPollutantStatus(p.value, p.good);
            const barWidth = Math.min((p.value / p.max) * 100, 100);
            return (
              <View key={p.key} style={styles.pollutantCard}>
                <View style={styles.pollutantTopRow}>
                  <Text style={styles.pollutantLabel}>{p.label}</Text>
                  <View style={[styles.pollutantBadge, { backgroundColor: pColor + '22' }]}>
                    <Text style={[styles.pollutantBadgeText, { color: pColor }]}>{pStatus}</Text>
                  </View>
                </View>
                <Text style={[styles.pollutantValue, { color: pColor }]}>
                  {p.value.toFixed(1)}
                  <Text style={styles.pollutantUnit}> {p.unit}</Text>
                </Text>
                <View style={styles.pollutantBar}>
                  <View style={[styles.pollutantFill, { width: `${barWidth}%` as any, backgroundColor: pColor }]} />
                </View>
                <Text style={styles.pollutantDesc}>{p.description}</Text>
              </View>
            );
          })}
        </View>

        {/* ── AQI Scale Reference ── */}
        <Text style={styles.sectionTitle}>AQI Scale Reference</Text>
        <View style={styles.scaleRef}>
          {[
            { range: '0–50', label: 'Good', color: '#00C853', tip: 'Ideal for outdoor activities' },
            { range: '51–100', label: 'Moderate', color: '#FFD600', tip: 'Sensitive groups take care' },
            { range: '101–150', label: 'Unhealthy (Sensitive)', color: '#FF6D00', tip: 'Limit prolonged exertion' },
            { range: '151–200', label: 'Unhealthy', color: '#D50000', tip: 'Wear a mask outdoors' },
            { range: '201–300', label: 'Very Unhealthy', color: '#6A1B9A', tip: 'Avoid outdoor activities' },
            { range: '301+', label: 'Hazardous', color: '#4E0000', tip: 'Stay indoors, use purifier' },
          ].map((row) => (
            <View key={row.range} style={styles.scaleRow}>
              <View style={[styles.scaleDot, { backgroundColor: row.color }]} />
              <View style={styles.scaleRowContent}>
                <View style={styles.scaleRowTop}>
                  <Text style={styles.scaleRangeText}>{row.range}</Text>
                  <Text style={[styles.scaleLabelText, { color: row.color }]}>{row.label}</Text>
                </View>
                <Text style={styles.scaleTip}>{row.tip}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <LocationModal
        visible={locationModalVisible}
        onClose={() => setLocationModalVisible(false)}
        onSelect={(loc) => {
          onLocationChange(loc);
          setLocationModalVisible(false);
        }}
        currentLocation={selectedLocation}
      />
    </SafeAreaView>
  );
}

function formatAgo(utc: string): string {
  const diff = Math.max(0, Math.round((Date.now() - new Date(utc).getTime()) / 60000));
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  return `${Math.round(diff / 60)}h ago`;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontFamily: typography.fontBold,
    fontSize: 28,
    color: '#111827',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  locationText: {
    fontFamily: typography.fontMedium,
    fontSize: 13,
    color: '#374151',
  },
  scroll: { paddingHorizontal: 16 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  bannerText: { fontFamily: typography.fontMedium, fontSize: 13, color: '#92400E', flex: 1 },

  // AQI Card
  aqiCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  aqiTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  aqiSmallLabel: { fontFamily: typography.fontMedium, fontSize: 11, color: '#6B7280', letterSpacing: 1, marginBottom: 4 },
  aqiValueRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aqiNumber: { fontFamily: typography.fontBold, fontSize: 64, lineHeight: 72 },
  aqiBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'center' },
  aqiBadgeText: { fontFamily: typography.fontBold, fontSize: 13, color: '#fff' },
  aqiEmoji: { fontSize: 48 },

  // Scale bar
  scaleWrap: { marginBottom: 16 },
  scaleBar: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', position: 'relative' },
  scaleSegment: { flex: 1 },
  scaleMarker: {
    position: 'absolute',
    top: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#374151',
    marginLeft: -8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  scaleLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  scaleLabel: { fontFamily: typography.fontMedium, fontSize: 10, color: '#9CA3AF' },

  aqiLocation: { fontFamily: typography.fontMedium, fontSize: 15, color: '#374151', marginBottom: 12 },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderLeftWidth: 3,
    paddingLeft: 10,
    marginBottom: 10,
  },
  tipText: { fontFamily: typography.fontRegular, fontSize: 13, color: '#4B5563', flex: 1, lineHeight: 20 },
  updatedText: { fontFamily: typography.fontRegular, fontSize: 12, color: '#9CA3AF' },

  // Pollutants
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontFamily: typography.fontBold, fontSize: 18, color: '#111827', marginBottom: 12 },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  refreshText: { fontFamily: typography.fontMedium, fontSize: 12, color: '#4F46E5' },
  pollutantGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  pollutantCard: {
    width: '47.5%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  pollutantTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  pollutantLabel: { fontFamily: typography.fontMedium, fontSize: 12, color: '#6B7280' },
  pollutantBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  pollutantBadgeText: { fontFamily: typography.fontBold, fontSize: 10 },
  pollutantValue: { fontFamily: typography.fontBold, fontSize: 22, marginBottom: 8 },
  pollutantUnit: { fontFamily: typography.fontRegular, fontSize: 12, color: '#9CA3AF' },
  pollutantBar: { height: 5, backgroundColor: '#F3F4F6', borderRadius: 3, marginBottom: 6, overflow: 'hidden' },
  pollutantFill: { height: 5, borderRadius: 3 },
  pollutantDesc: { fontFamily: typography.fontRegular, fontSize: 11, color: '#9CA3AF', lineHeight: 15 },

  // Scale reference
  scaleRef: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  scaleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  scaleDot: { width: 12, height: 12, borderRadius: 6, marginTop: 3 },
  scaleRowContent: { flex: 1 },
  scaleRowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  scaleRangeText: { fontFamily: typography.fontMedium, fontSize: 13, color: '#374151' },
  scaleLabelText: { fontFamily: typography.fontBold, fontSize: 13 },
  scaleTip: { fontFamily: typography.fontRegular, fontSize: 12, color: '#6B7280' },
});
