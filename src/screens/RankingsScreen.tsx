import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme';

function getAqiColor(aqi: number): string {
  if (aqi <= 50) return '#00C853';
  if (aqi <= 100) return '#FFB300';
  if (aqi <= 150) return '#FF6D00';
  if (aqi <= 200) return '#D50000';
  if (aqi <= 300) return '#6A1B9A';
  return '#4E0000';
}

function getAqiStatus(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Sensitive';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Poor';
  return 'Hazardous';
}

type City = {
  city: string;
  country: string;
  aqi: number;
  pm25: number;
  change: 'up' | 'down' | 'same';
};

const ALL_CITIES: City[] = [
  { city: 'Lahore', country: 'Pakistan', aqi: 312, pm25: 189, change: 'up' },
  { city: 'Dhaka', country: 'Bangladesh', aqi: 278, pm25: 168, change: 'down' },
  { city: 'Karachi', country: 'Pakistan', aqi: 241, pm25: 142, change: 'up' },
  { city: 'Delhi', country: 'India', aqi: 168, pm25: 89, change: 'down' },
  { city: 'Kabul', country: 'Afghanistan', aqi: 156, pm25: 78, change: 'same' },
  { city: 'Kolkata', country: 'India', aqi: 142, pm25: 71, change: 'up' },
  { city: 'Beijing', country: 'China', aqi: 131, pm25: 62, change: 'up' },
  { city: 'Mumbai', country: 'India', aqi: 128, pm25: 62, change: 'same' },
  { city: 'Cairo', country: 'Egypt', aqi: 119, pm25: 56, change: 'down' },
  { city: 'Lucknow', country: 'India', aqi: 119, pm25: 58, change: 'down' },
  { city: 'Jakarta', country: 'Indonesia', aqi: 108, pm25: 51, change: 'same' },
  { city: 'Ahmedabad', country: 'India', aqi: 108, pm25: 51, change: 'up' },
  { city: 'Bangkok', country: 'Thailand', aqi: 99, pm25: 47, change: 'down' },
  { city: 'Hyderabad', country: 'India', aqi: 99, pm25: 47, change: 'same' },
  { city: 'Pune', country: 'India', aqi: 92, pm25: 44, change: 'same' },
  { city: 'Chennai', country: 'India', aqi: 91, pm25: 43, change: 'down' },
  { city: 'Bengaluru', country: 'India', aqi: 87, pm25: 41, change: 'up' },
  { city: 'Kuala Lumpur', country: 'Malaysia', aqi: 81, pm25: 38, change: 'up' },
  { city: 'Jaipur', country: 'India', aqi: 78, pm25: 36, change: 'down' },
  { city: 'Seoul', country: 'South Korea', aqi: 71, pm25: 32, change: 'same' },
  { city: 'Surat', country: 'India', aqi: 71, pm25: 33, change: 'up' },
  { city: 'Chandigarh', country: 'India', aqi: 65, pm25: 29, change: 'same' },
  { city: 'Bhopal', country: 'India', aqi: 58, pm25: 26, change: 'down' },
  { city: 'Coimbatore', country: 'India', aqi: 44, pm25: 18, change: 'up' },
  { city: 'London', country: 'UK', aqi: 42, pm25: 16, change: 'down' },
  { city: 'Paris', country: 'France', aqi: 38, pm25: 14, change: 'up' },
  { city: 'Mysuru', country: 'India', aqi: 38, pm25: 15, change: 'same' },
  { city: 'Sydney', country: 'Australia', aqi: 22, pm25: 8, change: 'same' },
];

export default function RankingsScreen() {
  const { colors, isDark } = useTheme();
  const [sortBy, setSortBy] = useState<'aqi' | 'pm25'>('aqi');
  const [refreshing, setRefreshing] = useState(false);

  const data = ALL_CITIES.slice().sort((a, b) => b[sortBy] - a[sortBy]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  const worst = data[0];
  const cleanest = data[data.length - 1];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>City Rankings</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Global AQI • {data.length} cities
          </Text>
        </View>
        <View style={[styles.sortPill, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
          <TouchableOpacity
            style={[styles.sortBtn, sortBy === 'aqi' && styles.sortBtnActive]}
            onPress={() => setSortBy('aqi')}
          >
            <Text style={[styles.sortBtnText, { color: sortBy === 'aqi' ? '#fff' : colors.textMuted }]}>AQI</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortBtn, sortBy === 'pm25' && styles.sortBtnActive]}
            onPress={() => setSortBy('pm25')}
          >
            <Text style={[styles.sortBtnText, { color: sortBy === 'pm25' ? '#fff' : colors.textMuted }]}>PM2.5</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.summaryAccent, { backgroundColor: getAqiColor(worst.aqi) }]} />
          <View style={styles.summaryBody}>
            <View style={[styles.summaryIconWrap, { backgroundColor: getAqiColor(worst.aqi) + '22' }]}>
              <Ionicons name="trending-up" size={18} color={getAqiColor(worst.aqi)} />
            </View>
            <View>
              <Text style={[styles.summaryTopLabel, { color: colors.textMuted }]}>Most Polluted</Text>
              <Text style={[styles.summaryCity, { color: colors.textPrimary }]}>{worst.city}</Text>
              <Text style={[styles.summaryAqi, { color: getAqiColor(worst.aqi) }]}>AQI {worst.aqi}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.summaryAccent, { backgroundColor: getAqiColor(cleanest.aqi) }]} />
          <View style={styles.summaryBody}>
            <View style={[styles.summaryIconWrap, { backgroundColor: getAqiColor(cleanest.aqi) + '22' }]}>
              <Ionicons name="leaf-outline" size={18} color={getAqiColor(cleanest.aqi)} />
            </View>
            <View>
              <Text style={[styles.summaryTopLabel, { color: colors.textMuted }]}>Cleanest Air</Text>
              <Text style={[styles.summaryCity, { color: colors.textPrimary }]}>{cleanest.city}</Text>
              <Text style={[styles.summaryAqi, { color: getAqiColor(cleanest.aqi) }]}>AQI {cleanest.aqi}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Table header */}
      <View style={[styles.tableHeader, {
        backgroundColor: isDark ? '#1F2937' : '#F9FAFB',
        borderTopColor: isDark ? '#374151' : '#E5E7EB',
        borderBottomColor: isDark ? '#374151' : '#E5E7EB',
      }]}>
        <Text style={[styles.thText, { color: colors.textMuted, width: 40 }]}>#</Text>
        <Text style={[styles.thText, { color: colors.textMuted, flex: 1 }]}>CITY</Text>
        <Text style={[styles.thText, { color: colors.textMuted, width: 80, textAlign: 'center' }]}>AQI</Text>
        <Text style={[styles.thText, { color: colors.textMuted, width: 76, textAlign: 'center' }]}>STATUS</Text>
        <Text style={[styles.thText, { color: colors.textMuted, width: 46, textAlign: 'right' }]}>PM2.5</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.textMuted}
          />
        }
      >
        {data.map((city, index) => {
          const color = getAqiColor(city.aqi);
          const status = getAqiStatus(city.aqi);
          const rank = index + 1;
          const rowBg = index % 2 === 0
            ? colors.surface
            : isDark ? '#0f172a' : '#F9FAFB';

          return (
            <View
              key={`${city.city}-${city.country}`}
              style={[styles.row, { backgroundColor: rowBg, borderBottomColor: isDark ? '#1F2937' : '#F3F4F6' }]}
            >
              {/* Rank */}
              <View style={[styles.rankCell, { width: 40 }]}>
                {rank <= 3 ? (
                  <View style={[styles.topRankBadge, {
                    backgroundColor: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32'
                  }]}>
                    <Text style={styles.topRankText}>{rank}</Text>
                  </View>
                ) : (
                  <Text style={[styles.rankNum, { color: colors.textMuted }]}>{rank}</Text>
                )}
              </View>

              {/* City */}
              <View style={{ flex: 1 }}>
                <Text style={[styles.cityName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {city.city}
                </Text>
                <Text style={[styles.countryName, { color: colors.textMuted }]}>{city.country}</Text>
              </View>

              {/* AQI chip + trend arrow inline */}
              <View style={[styles.aqiCell, { width: 80 }]}>
                <View style={[styles.aqiChip, { backgroundColor: color + '20' }]}>
                  <Text style={[styles.aqiChipText, { color }]}>{city.aqi}</Text>
                </View>
                <View style={[styles.trendBadge, {
                  backgroundColor: city.change === 'up'
                    ? '#D50000' + '18'
                    : city.change === 'down'
                    ? '#00C853' + '18'
                    : isDark ? '#374151' : '#F3F4F6'
                }]}>
                  <Ionicons
                    name={city.change === 'up' ? 'arrow-up' : city.change === 'down' ? 'arrow-down' : 'remove'}
                    size={10}
                    color={city.change === 'up' ? '#D50000' : city.change === 'down' ? '#00C853' : colors.textMuted}
                  />
                </View>
              </View>

              {/* Status */}
              <View style={{ width: 76, alignItems: 'center' }}>
                <View style={[styles.statusChip, { backgroundColor: color + '18' }]}>
                  <Text style={[styles.statusText, { color }]} numberOfLines={1}>{status}</Text>
                </View>
              </View>

              {/* PM2.5 */}
              <Text style={[styles.pm25Val, { color: colors.textLight, width: 46, textAlign: 'right' }]}>
                {city.pm25}
              </Text>
            </View>
          );
        })}

        {/* Legend */}
        <View style={[styles.legend, { borderTopColor: isDark ? '#374151' : '#E5E7EB', backgroundColor: colors.bg }]}>
          <View style={styles.legendItem}>
            <View style={[styles.trendBadge, { backgroundColor: '#D5000018' }]}>
              <Ionicons name="arrow-up" size={10} color="#D50000" />
            </View>
            <Text style={[styles.legendText, { color: colors.textMuted }]}>Worsening</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.trendBadge, { backgroundColor: '#00C85318' }]}>
              <Ionicons name="arrow-down" size={10} color="#00C853" />
            </View>
            <Text style={[styles.legendText, { color: colors.textMuted }]}>Improving</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.trendBadge, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
              <Ionicons name="remove" size={10} color={colors.textMuted} />
            </View>
            <Text style={[styles.legendText, { color: colors.textMuted }]}>Stable</Text>
          </View>
          <Text style={[styles.legendText, { color: colors.textMuted }]}>• 24h trend</Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  title: { fontFamily: typography.fontBold, fontSize: 24 },
  subtitle: { fontFamily: typography.fontRegular, fontSize: 12, marginTop: 2 },

  sortPill: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
  },
  sortBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  sortBtnActive: { backgroundColor: '#4F46E5' },
  sortBtnText: { fontFamily: typography.fontBold, fontSize: 12 },

  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryAccent: { height: 3, width: '100%' },
  summaryBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  summaryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryTopLabel: { fontFamily: typography.fontRegular, fontSize: 10, marginBottom: 2 },
  summaryCity: { fontFamily: typography.fontBold, fontSize: 14 },
  summaryAqi: { fontFamily: typography.fontBold, fontSize: 12, marginTop: 1 },

  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  thText: {
    fontFamily: typography.fontBold,
    fontSize: 10,
    letterSpacing: 0.8,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },

  rankCell: { alignItems: 'center', justifyContent: 'center' },
  topRankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRankText: { fontFamily: typography.fontBold, fontSize: 11, color: '#fff' },
  rankNum: { fontFamily: typography.fontBold, fontSize: 13 },

  cityName: { fontFamily: typography.fontBold, fontSize: 13 },
  countryName: { fontFamily: typography.fontRegular, fontSize: 11, marginTop: 1 },

  aqiCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  aqiChip: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 40,
    alignItems: 'center',
  },
  aqiChipText: { fontFamily: typography.fontBold, fontSize: 13 },
  trendBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusChip: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  statusText: { fontFamily: typography.fontBold, fontSize: 10 },

  pm25Val: { fontFamily: typography.fontMedium, fontSize: 12 },

  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    flexWrap: 'wrap',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendText: { fontFamily: typography.fontRegular, fontSize: 11 },
});