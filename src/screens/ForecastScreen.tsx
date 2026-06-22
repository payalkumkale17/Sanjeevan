import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getForecastByLocation, getReadingByLocation } from '../data/mockData';
import { typography } from '../theme';
import { DetectedLocation } from '../types';
import { useAirQualityContext } from '../context/AirQualityDataContext';
import { useTheme } from '../context/ThemeContext';

const BAR_MAX_HEIGHT = 100;
type Props = { selectedLocation: DetectedLocation };

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
  if (aqi <= 150) return 'Sensitive';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Poor';
  return 'Hazardous';
}

function getAqiIcon(aqi: number): keyof typeof Ionicons.glyphMap {
  if (aqi <= 50) return 'leaf-outline';
  if (aqi <= 100) return 'partly-sunny-outline';
  if (aqi <= 150) return 'warning-outline';
  if (aqi <= 200) return 'alert-circle-outline';
  if (aqi <= 300) return 'flame-outline';
  return 'nuclear-outline';
}

function getTrend(points: { aqi: number }[]): 'improving' | 'worsening' | 'stable' {
  if (points.length < 2) return 'stable';
  const last = points[points.length - 1].aqi;
  const first = points[0].aqi;
  if (last < first - 10) return 'improving';
  if (last > first + 10) return 'worsening';
  return 'stable';
}

export default function ForecastScreen({ selectedLocation }: Props) {
  const { aqiData, forecastData, weatherData } = useAirQualityContext();
  const { colors, isDark } = useTheme();
  const points = forecastData.length ? forecastData : getForecastByLocation('Pune');
  const reading = aqiData ?? getReadingByLocation('Pune');
  const currentAqi = reading.currentAqi ?? 0;
  const aqiColor = getAqiColor(currentAqi);
  const trend = getTrend(points);
  const maxAqi = Math.max(...points.map(p => p.aqi), 1);

  const trendConfig = {
    improving: { icon: 'trending-down' as const, color: '#00C853', text: 'Improving', bg: isDark ? '#052e16' : '#E8F5E9' },
    worsening: { icon: 'trending-up' as const, color: '#D50000', text: 'Worsening', bg: isDark ? '#3b0000' : '#FFEBEE' },
    stable: { icon: 'remove' as const, color: '#6B7280', text: 'Stable', bg: isDark ? '#1F2937' : '#F3F4F6' },
  }[trend];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Forecast</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>{selectedLocation.label} • Next 72h</Text>
          </View>
          <View style={[styles.trendPill, { backgroundColor: trendConfig.bg }]}>
            <Ionicons name={trendConfig.icon} size={14} color={trendConfig.color} />
            <Text style={[styles.trendPillText, { color: trendConfig.color }]}>{trendConfig.text}</Text>
          </View>
        </View>

        {/* Main card */}
        <View style={[styles.mainCard, { backgroundColor: colors.surface }]}>
          <View style={styles.currentRow}>
            <View style={[styles.aqiCircle, { borderColor: aqiColor }]}>
              <Text style={[styles.aqiNumber, { color: aqiColor }]}>{currentAqi}</Text>
              <Text style={[styles.aqiUnitText, { color: colors.textMuted }]}>AQI</Text>
            </View>
            <View style={styles.currentMeta}>
              <View style={[styles.statusBadge, { backgroundColor: aqiColor }]}>
                <Text style={styles.statusBadgeText}>{getAqiLabel(currentAqi)}</Text>
              </View>
              <Text style={[styles.currentLocation, { color: colors.textPrimary }]}>{selectedLocation.label}</Text>
              <Text style={[styles.currentTime, { color: colors.textMuted }]}>Updated just now</Text>
            </View>
            <View style={[styles.aqiIconCircle, { backgroundColor: aqiColor + '18' }]}>
              <Ionicons name={getAqiIcon(currentAqi)} size={28} color={aqiColor} />
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]} />

          <Text style={[styles.chartTitle, { color: colors.textMuted }]}>72-Hour AQI Trend</Text>
          <View style={styles.chartArea}>
            {points.map((point, i) => {
              const barH = Math.max((point.aqi / maxAqi) * BAR_MAX_HEIGHT, 6);
              const color = getAqiColor(point.aqi);
              const isNow = i === 0;
              return (
                <View key={point.hourLabel} style={styles.barCol}>
                  <Text style={[styles.barValue, { color }]}>{point.aqi}</Text>
                  <View style={[styles.barTrack, { height: BAR_MAX_HEIGHT }]}>
                    <View style={[styles.bar, { height: barH, backgroundColor: color, opacity: isNow ? 1 : 0.75 }]} />
                  </View>
                  <Text style={[styles.barLabel, { color: colors.textMuted }, isNow && { color: colors.textPrimary, fontFamily: typography.fontBold }]}>
                    {point.hourLabel}
                  </Text>
                  {isNow && <View style={[styles.nowDot, { backgroundColor: color }]} />}
                </View>
              );
            })}
          </View>

          <View style={[styles.refRow, { borderTopColor: isDark ? '#374151' : '#F3F4F6' }]}>
            {[
              { val: '0', color: '#00C853' },
              { val: '50', color: '#FFB300' },
              { val: '100', color: '#FF6D00' },
              { val: '150', color: '#D50000' },
              { val: '200+', color: '#6A1B9A' },
            ].map((r) => (
              <View key={r.val} style={styles.refItem}>
                <View style={[styles.refDot, { backgroundColor: r.color }]} />
                <Text style={[styles.refLabel, { color: colors.textMuted }]}>{r.val}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Horizontal snapshot */}
        <View style={[styles.timelineCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Hourly Snapshot</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {points.map((point, i) => {
              const color = getAqiColor(point.aqi);
              const prev = i > 0 ? points[i - 1].aqi : point.aqi;
              const delta = point.aqi - prev;
              return (
                <View key={point.hourLabel} style={[
                  styles.timelineItem,
                  { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderColor: isDark ? '#374151' : '#F3F4F6' },
                  i === 0 && { borderColor: color, backgroundColor: color + '18' }
                ]}>
                  <Text style={[styles.tlTime, { color: colors.textMuted }, i === 0 && { color: colors.textPrimary }]}>
                    {point.hourLabel}
                  </Text>
                  <Ionicons name={getAqiIcon(point.aqi)} size={20} color={color} />
                  <Text style={[styles.tlAqi, { color }]}>{point.aqi}</Text>
                  <View style={[styles.tlBadge, { backgroundColor: color + '18' }]}>
                    <Text style={[styles.tlLabel, { color }]}>{getAqiLabel(point.aqi)}</Text>
                  </View>
                  {i > 0 && (
                    <View style={styles.tlDelta}>
                      <Ionicons
                        name={delta > 0 ? 'arrow-up' : delta < 0 ? 'arrow-down' : 'remove'}
                        size={10}
                        color={delta > 0 ? '#D50000' : delta < 0 ? '#00C853' : '#9CA3AF'}
                      />
                      <Text style={[styles.tlDeltaText, { color: delta > 0 ? '#D50000' : delta < 0 ? '#00C853' : '#9CA3AF' }]}>
                        {Math.abs(delta)}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Weather 2x2 grid */}
        {weatherData && (
          <View style={[styles.weatherCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Weather Now</Text>
            <View style={styles.weatherGrid}>
              {[
                { icon: 'thermometer-outline', label: 'Temp', value: `${weatherData.current.temperature2m.toFixed(1)}°C`, color: '#FF6D00' },
                { icon: 'water-outline', label: 'Humidity', value: `${weatherData.current.relativeHumidity2m}%`, color: '#2196F3' },
                { icon: 'speedometer-outline', label: 'Wind', value: `${weatherData.current.windSpeed10m} km/h`, color: '#00C853' },
                { icon: 'compass-outline', label: 'Direction', value: `${weatherData.current.windDirection10m}°`, color: '#9C27B0' },
              ].map((w) => (
                <View key={w.label} style={[styles.weatherItem, { backgroundColor: isDark ? '#1F2937' : '#F9FAFB', borderLeftColor: w.color }]}>
                  <Ionicons name={w.icon as any} size={16} color={w.color} />
                  <Text style={[styles.weatherVal, { color: w.color }]}>{w.value}</Text>
                  <Text style={[styles.weatherLbl, { color: colors.textMuted }]}>{w.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Text style={[styles.footnote, { color: colors.textMuted }]}>
          Rule-based forecast using wind, humidity & temperature data.
        </Text>
        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 16, paddingBottom: 14 },
  title: { fontFamily: typography.fontBold, fontSize: 26 },
  subtitle: { fontFamily: typography.fontRegular, fontSize: 13, marginTop: 2 },
  trendPill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginTop: 4 },
  trendPillText: { fontFamily: typography.fontBold, fontSize: 12 },
  mainCard: { borderRadius: 20, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  currentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  aqiCircle: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  aqiNumber: { fontFamily: typography.fontBold, fontSize: 26, lineHeight: 30 },
  aqiUnitText: { fontFamily: typography.fontMedium, fontSize: 10 },
  currentMeta: { flex: 1, gap: 4 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  statusBadgeText: { fontFamily: typography.fontBold, fontSize: 12, color: '#fff' },
  currentLocation: { fontFamily: typography.fontMedium, fontSize: 13 },
  currentTime: { fontFamily: typography.fontRegular, fontSize: 11 },
  aqiIconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, marginBottom: 14 },
  chartTitle: { fontFamily: typography.fontBold, fontSize: 13, marginBottom: 10 },
  chartArea: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 10 },
  barCol: { alignItems: 'center', gap: 4 },
  barValue: { fontFamily: typography.fontBold, fontSize: 11 },
  barTrack: { justifyContent: 'flex-end' },
  bar: { width: 36, borderRadius: 8 },
  barLabel: { fontFamily: typography.fontMedium, fontSize: 11 },
  nowDot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
  refRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1 },
  refItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  refDot: { width: 8, height: 8, borderRadius: 4 },
  refLabel: { fontFamily: typography.fontRegular, fontSize: 10 },
  timelineCard: { borderRadius: 20, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  sectionTitle: { fontFamily: typography.fontBold, fontSize: 15, marginBottom: 12 },
  timelineItem: { alignItems: 'center', gap: 6, borderRadius: 14, borderWidth: 1.5, paddingVertical: 12, paddingHorizontal: 10, marginRight: 8, minWidth: 72 },
  tlTime: { fontFamily: typography.fontMedium, fontSize: 11 },
  tlAqi: { fontFamily: typography.fontBold, fontSize: 18 },
  tlBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  tlLabel: { fontFamily: typography.fontBold, fontSize: 9 },
  tlDelta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  tlDeltaText: { fontFamily: typography.fontBold, fontSize: 10 },
  weatherCard: { borderRadius: 20, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  weatherGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  weatherItem: { width: '47%', borderRadius: 12, padding: 12, borderLeftWidth: 3, gap: 3 },
  weatherVal: { fontFamily: typography.fontBold, fontSize: 18 },
  weatherLbl: { fontFamily: typography.fontRegular, fontSize: 11 },
  footnote: { fontFamily: typography.fontRegular, fontSize: 11, textAlign: 'center', lineHeight: 16 },
});