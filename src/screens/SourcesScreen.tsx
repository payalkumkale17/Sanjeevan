import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getSourcesByLocation } from '../data/mockData';
import { typography } from '../theme';
import { DetectedLocation } from '../types';
import { useAirQualityContext } from '../context/AirQualityDataContext';
import { useTheme } from '../context/ThemeContext';

type Props = { selectedLocation: DetectedLocation };

const SOURCE_META: Record<string, {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  lightBg: string;
  darkBg: string;
  description: string;
  tip: string;
}> = {
  Vehicles: {
    icon: 'car-outline', color: '#D50000', lightBg: '#FFEBEE', darkBg: '#3b0000',
    description: 'Exhaust from cars, buses, trucks and two-wheelers on roads.',
    tip: 'Use public transport or carpool to reduce this source.',
  },
  Dust: {
    icon: 'partly-sunny-outline', color: '#FF6D00', lightBg: '#FFF3E0', darkBg: '#431407',
    description: 'Road dust, construction sites and bare land resuspension.',
    tip: 'Avoid roads under construction during high-wind days.',
  },
  Industry: {
    icon: 'business-outline', color: '#6A1B9A', lightBg: '#F3E5F5', darkBg: '#2d1b3d',
    description: 'Emissions from factories, power plants and industrial activity.',
    tip: 'Industrial zones are most active 8AM–6PM on weekdays.',
  },
  Burning: {
    icon: 'flame-outline', color: '#E65100', lightBg: '#FBE9E7', darkBg: '#3b0f00',
    description: 'Crop burning, waste burning and biomass combustion.',
    tip: 'Burning peaks in October–November (post-harvest season).',
  },
};

function getDefaultMeta(name: string) {
  return {
    icon: 'ellipse-outline' as keyof typeof Ionicons.glyphMap,
    color: '#4F46E5', lightBg: '#EEF2FF', darkBg: '#1E1B4B',
    description: `Estimated impact from ${name.toLowerCase()} sources.`,
    tip: 'Reduce exposure by staying indoors during peak hours.',
  };
}

export default function SourcesScreen({ selectedLocation }: Props) {
  const { sourcesData, aqiData } = useAirQualityContext();
  const { colors, isDark } = useTheme();
  const sources = sourcesData.length ? sourcesData : getSourcesByLocation('Pune');
  const totalAqi = aqiData?.currentAqi ?? 0;
  const sorted = [...sources].sort((a, b) => b.percentage - a.percentage);
  const dominant = sorted[0];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Origins</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Pollution sources in {selectedLocation.label}</Text>
        </View>

        {/* Dominant source banner */}
        {dominant && (() => {
          const meta = SOURCE_META[dominant.name] ?? getDefaultMeta(dominant.name);
          const bg = isDark ? meta.darkBg : meta.lightBg;
          return (
            <View style={[styles.dominantCard, { backgroundColor: bg, borderColor: meta.color + '40' }]}>
              <View style={[styles.dominantIconWrap, { backgroundColor: meta.color + '22' }]}>
                <Ionicons name={meta.icon} size={28} color={meta.color} />
              </View>
              <View style={styles.dominantContent}>
                <Text style={[styles.dominantLabel, { color: colors.textMuted }]}>PRIMARY SOURCE</Text>
                <Text style={[styles.dominantName, { color: meta.color }]}>{dominant.name}</Text>
                <Text style={[styles.dominantDesc, { color: colors.textMuted }]}>
                  Contributes ~{dominant.percentage}% of local air pollution
                </Text>
              </View>
              <View style={[styles.dominantPct, { backgroundColor: meta.color }]}>
                <Text style={styles.dominantPctText}>{dominant.percentage}%</Text>
              </View>
            </View>
          );
        })()}

        {/* Summary breakdown */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>Contribution Breakdown</Text>
          <View style={styles.summaryBars}>
            {sorted.map((src) => {
              const meta = SOURCE_META[src.name] ?? getDefaultMeta(src.name);
              return (
                <View key={src.name} style={styles.summaryBarRow}>
                  <View style={[styles.summaryDot, { backgroundColor: meta.color }]} />
                  <Text style={[styles.summaryBarLabel, { color: colors.textPrimary }]}>{src.name}</Text>
                  <View style={[styles.summaryBarTrack, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                    <View style={[styles.summaryBarFill, { width: `${src.percentage}%` as any, backgroundColor: meta.color }]} />
                  </View>
                  <Text style={[styles.summaryBarPct, { color: meta.color }]}>{src.percentage}%</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Source detail cards */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Source Details</Text>
        {sorted.map((src, index) => {
          const meta = SOURCE_META[src.name] ?? getDefaultMeta(src.name);
          const bg = isDark ? meta.darkBg : meta.lightBg;
          const aqiContrib = Math.round((src.percentage / 100) * totalAqi);
          return (
            <View key={src.name} style={[styles.sourceCard, { backgroundColor: colors.surface }]}>
              <View style={styles.sourceTopRow}>
                <View style={[styles.sourceIconWrap, { backgroundColor: bg }]}>
                  <Ionicons name={meta.icon} size={22} color={meta.color} />
                </View>
                <View style={styles.sourceNameWrap}>
                  <Text style={[styles.sourceName, { color: colors.textPrimary }]}>{src.name}</Text>
                  <Text style={[styles.sourceRank, { color: colors.textMuted }]}>#{index + 1} contributor</Text>
                </View>
                <View style={[styles.sourcePctBadge, { backgroundColor: meta.color }]}>
                  <Text style={styles.sourcePctText}>{src.percentage}%</Text>
                </View>
              </View>

              <View style={[styles.sourceBar, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
                <View style={[styles.sourceBarFill, { width: `${src.percentage}%` as any, backgroundColor: meta.color }]} />
              </View>

              <View style={[styles.sourceMetaRow, { backgroundColor: isDark ? '#111827' : '#F9FAFB' }]}>
                <View style={styles.sourceMetaItem}>
                  <Text style={[styles.sourceMetaValue, { color: colors.textPrimary }]}>{src.percentage}%</Text>
                  <Text style={[styles.sourceMetaLabel, { color: colors.textMuted }]}>Share</Text>
                </View>
                <View style={[styles.sourceMetaDivider, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
                <View style={styles.sourceMetaItem}>
                  <Text style={[styles.sourceMetaValue, { color: colors.textPrimary }]}>~{aqiContrib}</Text>
                  <Text style={[styles.sourceMetaLabel, { color: colors.textMuted }]}>AQI pts</Text>
                </View>
                <View style={[styles.sourceMetaDivider, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]} />
                <View style={[styles.sourceMetaItem, { flex: 2 }]}>
                  <Text style={[styles.sourceMetaValue, { color: colors.textPrimary }]}>
                    {index === 0 ? 'Dominant' : index === 1 ? 'Significant' : 'Minor'}
                  </Text>
                  <Text style={[styles.sourceMetaLabel, { color: colors.textMuted }]}>Impact</Text>
                </View>
              </View>

              <Text style={[styles.sourceDesc, { color: colors.textLight }]}>{meta.description}</Text>

              <View style={[styles.tipRow, { borderLeftColor: meta.color }]}>
                <Ionicons name="bulb-outline" size={13} color={meta.color} />
                <Text style={[styles.tipText, { color: colors.textMuted }]}>{meta.tip}</Text>
              </View>
            </View>
          );
        })}

        <Text style={[styles.footnote, { color: colors.textMuted }]}>
          Source contributions are estimated using meteorological data and regional emission patterns.
        </Text>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { paddingHorizontal: 16 },
  header: { paddingTop: 16, paddingBottom: 12 },
  title: { fontFamily: typography.fontBold, fontSize: 28 },
  subtitle: { fontFamily: typography.fontRegular, fontSize: 13, marginTop: 2 },
  dominantCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 20, borderWidth: 1.5, padding: 16, marginBottom: 14 },
  dominantIconWrap: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dominantContent: { flex: 1 },
  dominantLabel: { fontFamily: typography.fontMedium, fontSize: 10, letterSpacing: 1, marginBottom: 2 },
  dominantName: { fontFamily: typography.fontBold, fontSize: 20, marginBottom: 2 },
  dominantDesc: { fontFamily: typography.fontRegular, fontSize: 12 },
  dominantPct: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' },
  dominantPctText: { fontFamily: typography.fontBold, fontSize: 18, color: '#fff' },
  summaryCard: { borderRadius: 20, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  summaryTitle: { fontFamily: typography.fontBold, fontSize: 15, marginBottom: 14 },
  summaryBars: { gap: 12 },
  summaryBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryDot: { width: 10, height: 10, borderRadius: 5 },
  summaryBarLabel: { fontFamily: typography.fontMedium, fontSize: 13, width: 72 },
  summaryBarTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  summaryBarFill: { height: 8, borderRadius: 4 },
  summaryBarPct: { fontFamily: typography.fontBold, fontSize: 13, width: 36, textAlign: 'right' },
  sectionTitle: { fontFamily: typography.fontBold, fontSize: 18, marginBottom: 12 },
  sourceCard: { borderRadius: 20, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  sourceTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  sourceIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sourceNameWrap: { flex: 1 },
  sourceName: { fontFamily: typography.fontBold, fontSize: 16 },
  sourceRank: { fontFamily: typography.fontRegular, fontSize: 12, marginTop: 1 },
  sourcePctBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  sourcePctText: { fontFamily: typography.fontBold, fontSize: 14, color: '#fff' },
  sourceBar: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 12 },
  sourceBarFill: { height: 6, borderRadius: 3 },
  sourceMetaRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 10, marginBottom: 12 },
  sourceMetaItem: { flex: 1, alignItems: 'center' },
  sourceMetaValue: { fontFamily: typography.fontBold, fontSize: 14 },
  sourceMetaLabel: { fontFamily: typography.fontRegular, fontSize: 11, marginTop: 2 },
  sourceMetaDivider: { width: 1, height: 28 },
  sourceDesc: { fontFamily: typography.fontRegular, fontSize: 13, lineHeight: 19, marginBottom: 10 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, borderLeftWidth: 3, paddingLeft: 8 },
  tipText: { fontFamily: typography.fontRegular, fontSize: 12, flex: 1, lineHeight: 17 },
  footnote: { fontFamily: typography.fontRegular, fontSize: 11, lineHeight: 16, marginTop: 4 },
});