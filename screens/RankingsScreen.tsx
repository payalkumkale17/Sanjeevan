import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

declare const require: any;
const { typography } = require('../theme');

type CityRanking = {
  rank: number;
  city: string;
  country: string;
  aqi: number;
  status: string;
  statusColor: string;
  pm25: number;
  change: 'up' | 'down' | 'same';
};

function getAqiColor(aqi: number): string {
  if (aqi <= 50) return '#00C853';
  if (aqi <= 100) return '#FFD600';
  if (aqi <= 150) return '#FF6D00';
  if (aqi <= 200) return '#D50000';
  if (aqi <= 300) return '#6A1B9A';
  return '#4E0000';
}

function getAqiStatus(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy*';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

// Static city data (would be fetched from API in production)
const INDIAN_CITIES: CityRanking[] = [
  { rank: 1, city: 'Delhi', country: 'India', aqi: 168, status: 'Unhealthy', statusColor: '#D50000', pm25: 89, change: 'down' },
  { rank: 2, city: 'Kolkata', country: 'India', aqi: 142, status: 'Unhealthy*', statusColor: '#FF6D00', pm25: 71, change: 'up' },
  { rank: 3, city: 'Mumbai', country: 'India', aqi: 128, status: 'Unhealthy*', statusColor: '#FF6D00', pm25: 62, change: 'same' },
  { rank: 4, city: 'Lucknow', country: 'India', aqi: 119, status: 'Unhealthy*', statusColor: '#FF6D00', pm25: 58, change: 'down' },
  { rank: 5, city: 'Ahmedabad', country: 'India', aqi: 108, status: 'Moderate', statusColor: '#FFD600', pm25: 51, change: 'up' },
  { rank: 6, city: 'Hyderabad', country: 'India', aqi: 99, status: 'Moderate', statusColor: '#FFD600', pm25: 47, change: 'same' },
  { rank: 7, city: 'Chennai', country: 'India', aqi: 91, status: 'Moderate', statusColor: '#FFD600', pm25: 43, change: 'down' },
  { rank: 8, city: 'Bengaluru', country: 'India', aqi: 87, status: 'Moderate', statusColor: '#FFD600', pm25: 41, change: 'up' },
  { rank: 9, city: 'Pune', country: 'India', aqi: 92, status: 'Moderate', statusColor: '#FFD600', pm25: 44, change: 'same' },
  { rank: 10, city: 'Jaipur', country: 'India', aqi: 78, status: 'Moderate', statusColor: '#FFD600', pm25: 36, change: 'down' },
  { rank: 11, city: 'Surat', country: 'India', aqi: 71, status: 'Moderate', statusColor: '#FFD600', pm25: 33, change: 'up' },
  { rank: 12, city: 'Chandigarh', country: 'India', aqi: 65, status: 'Moderate', statusColor: '#FFD600', pm25: 29, change: 'same' },
  { rank: 13, city: 'Bhopal', country: 'India', aqi: 58, status: 'Moderate', statusColor: '#FFD600', pm25: 26, change: 'down' },
  { rank: 14, city: 'Coimbatore', country: 'India', aqi: 44, status: 'Good', statusColor: '#00C853', pm25: 18, change: 'up' },
  { rank: 15, city: 'Mysuru', country: 'India', aqi: 38, status: 'Good', statusColor: '#00C853', pm25: 15, change: 'same' },
];

const WORLD_CITIES: CityRanking[] = [
  { rank: 1, city: 'Lahore', country: 'Pakistan', aqi: 312, status: 'Hazardous', statusColor: '#4E0000', pm25: 189, change: 'up' },
  { rank: 2, city: 'Dhaka', country: 'Bangladesh', aqi: 278, status: 'Very Unhealthy', statusColor: '#6A1B9A', pm25: 168, change: 'down' },
  { rank: 3, city: 'Karachi', country: 'Pakistan', aqi: 241, status: 'Very Unhealthy', statusColor: '#6A1B9A', pm25: 142, change: 'up' },
  { rank: 4, city: 'Delhi', country: 'India', aqi: 168, status: 'Unhealthy', statusColor: '#D50000', pm25: 89, change: 'down' },
  { rank: 5, city: 'Kabul', country: 'Afghanistan', aqi: 156, status: 'Unhealthy', statusColor: '#D50000', pm25: 78, change: 'same' },
  { rank: 6, city: 'Beijing', country: 'China', aqi: 131, status: 'Unhealthy*', statusColor: '#FF6D00', pm25: 62, change: 'up' },
  { rank: 7, city: 'Cairo', country: 'Egypt', aqi: 119, status: 'Unhealthy*', statusColor: '#FF6D00', pm25: 56, change: 'down' },
  { rank: 8, city: 'Kolkata', country: 'India', aqi: 142, status: 'Unhealthy*', statusColor: '#FF6D00', pm25: 71, change: 'up' },
  { rank: 9, city: 'Jakarta', country: 'Indonesia', aqi: 108, status: 'Moderate', statusColor: '#FFD600', pm25: 51, change: 'same' },
  { rank: 10, city: 'Bangkok', country: 'Thailand', aqi: 99, status: 'Moderate', statusColor: '#FFD600', pm25: 47, change: 'down' },
  { rank: 11, city: 'Kuala Lumpur', country: 'Malaysia', aqi: 81, status: 'Moderate', statusColor: '#FFD600', pm25: 38, change: 'up' },
  { rank: 12, city: 'Seoul', country: 'South Korea', aqi: 71, status: 'Moderate', statusColor: '#FFD600', pm25: 32, change: 'same' },
  { rank: 13, city: 'London', country: 'UK', aqi: 42, status: 'Good', statusColor: '#00C853', pm25: 16, change: 'down' },
  { rank: 14, city: 'Paris', country: 'France', aqi: 38, status: 'Good', statusColor: '#00C853', pm25: 14, change: 'up' },
  { rank: 15, city: 'Sydney', country: 'Australia', aqi: 22, status: 'Good', statusColor: '#00C853', pm25: 8, change: 'same' },
];

type Tab = 'india' | 'world';

export default function RankingsScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('india');
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'aqi' | 'pm25'>('aqi');

  const data = (activeTab === 'india' ? INDIAN_CITIES : WORLD_CITIES)
    .slice()
    .sort((a, b) => b[sortBy] - a[sortBy])
    .map((city, index) => ({ ...city, rank: index + 1 }));

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1000));
    setRefreshing(false);
  }, []);

  const worstCity = data[0];
  const cleanestCity = data[data.length - 1];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rankings</Text>
        <Text style={styles.headerSubtitle}>City AQI Leaderboard</Text>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'india' && styles.tabActive]}
          onPress={() => setActiveTab('india')}
        >
          <Text style={[styles.tabText, activeTab === 'india' && styles.tabTextActive]}>🇮🇳 India</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'world' && styles.tabActive]}
          onPress={() => setActiveTab('world')}
        >
          <Text style={[styles.tabText, activeTab === 'world' && styles.tabTextActive]}>🌍 World</Text>
        </TouchableOpacity>
      </View>

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderLeftColor: worstCity?.statusColor }]}>
          <Text style={styles.summaryLabel}>Most Polluted</Text>
          <Text style={styles.summaryCity}>{worstCity?.city}</Text>
          <Text style={[styles.summaryAqi, { color: worstCity?.statusColor }]}>AQI {worstCity?.aqi}</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: cleanestCity?.statusColor }]}>
          <Text style={styles.summaryLabel}>Cleanest Air</Text>
          <Text style={styles.summaryCity}>{cleanestCity?.city}</Text>
          <Text style={[styles.summaryAqi, { color: cleanestCity?.statusColor }]}>AQI {cleanestCity?.aqi}</Text>
        </View>
      </View>

      {/* Sort toggle */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity
          style={[styles.sortBtn, sortBy === 'aqi' && styles.sortBtnActive]}
          onPress={() => setSortBy('aqi')}
        >
          <Text style={[styles.sortBtnText, sortBy === 'aqi' && styles.sortBtnTextActive]}>AQI</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortBtn, sortBy === 'pm25' && styles.sortBtnActive]}
          onPress={() => setSortBy('pm25')}
        >
          <Text style={[styles.sortBtnText, sortBy === 'pm25' && styles.sortBtnTextActive]}>PM2.5</Text>
        </TouchableOpacity>
      </View>

      {/* Table header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, { width: 36 }]}>No.</Text>
        <Text style={[styles.tableHeaderText, { flex: 1 }]}>City</Text>
        <Text style={[styles.tableHeaderText, { width: 60, textAlign: 'center' }]}>AQI</Text>
        <Text style={[styles.tableHeaderText, { width: 80, textAlign: 'center' }]}>Status</Text>
        <Text style={[styles.tableHeaderText, { width: 60, textAlign: 'right' }]}>PM2.5</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {data.map((city, index) => (
          <View
            key={`${city.city}-${city.country}`}
            style={[styles.row, index % 2 === 0 && styles.rowAlt]}
          >
            {/* Rank */}
            <View style={[styles.rankCell, { width: 36 }]}>
              {city.rank <= 3 ? (
                <Text style={styles.rankMedal}>
                  {city.rank === 1 ? '🥇' : city.rank === 2 ? '🥈' : '🥉'}
                </Text>
              ) : (
                <Text style={styles.rankNum}>{city.rank}</Text>
              )}
            </View>

            {/* City name */}
            <View style={{ flex: 1 }}>
              <Text style={styles.cityName}>{city.city}</Text>
              <Text style={styles.countryName}>{city.country}</Text>
            </View>

            {/* AQI */}
            <View style={{ width: 60, alignItems: 'center' }}>
              <View style={[styles.aqiChip, { backgroundColor: getAqiColor(city.aqi) + '22' }]}>
                <Text style={[styles.aqiChipText, { color: getAqiColor(city.aqi) }]}>{city.aqi}</Text>
              </View>
              <Ionicons
                name={city.change === 'up' ? 'arrow-up' : city.change === 'down' ? 'arrow-down' : 'remove'}
                size={11}
                color={city.change === 'up' ? '#D50000' : city.change === 'down' ? '#00C853' : '#9CA3AF'}
              />
            </View>

            {/* Status */}
            <View style={{ width: 80, alignItems: 'center' }}>
              <View style={[styles.statusChip, { backgroundColor: city.statusColor + '22' }]}>
                <Text style={[styles.statusChipText, { color: city.statusColor }]} numberOfLines={1}>
                  {city.status}
                </Text>
              </View>
            </View>

            {/* PM2.5 */}
            <Text style={[styles.pm25Text, { width: 60, textAlign: 'right' }]}>{city.pm25}</Text>
          </View>
        ))}

        <Text style={styles.footnote}>* Unhealthy for Sensitive Groups</Text>
        <Text style={styles.footnote2}>Data updates every 15 minutes. Arrow shows 24h trend.</Text>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  headerTitle: { fontFamily: typography.fontBold, fontSize: 28, color: '#111827' },
  headerSubtitle: { fontFamily: typography.fontRegular, fontSize: 13, color: '#6B7280', marginTop: 2 },

  tabRow: { flexDirection: 'row', marginHorizontal: 16, marginVertical: 12, backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  tabText: { fontFamily: typography.fontMedium, fontSize: 14, color: '#9CA3AF' },
  tabTextActive: { color: '#111827' },

  summaryRow: { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 12 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryLabel: { fontFamily: typography.fontMedium, fontSize: 11, color: '#9CA3AF', marginBottom: 4 },
  summaryCity: { fontFamily: typography.fontBold, fontSize: 16, color: '#111827', marginBottom: 2 },
  summaryAqi: { fontFamily: typography.fontBold, fontSize: 14 },

  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 8 },
  sortLabel: { fontFamily: typography.fontMedium, fontSize: 13, color: '#6B7280' },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, backgroundColor: '#F3F4F6' },
  sortBtnActive: { backgroundColor: '#4F46E5' },
  sortBtnText: { fontFamily: typography.fontMedium, fontSize: 12, color: '#6B7280' },
  sortBtnTextActive: { color: '#fff' },

  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  tableHeaderText: { fontFamily: typography.fontBold, fontSize: 11, color: '#6B7280', letterSpacing: 0.5 },

  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff' },
  rowAlt: { backgroundColor: '#FAFAFA' },

  rankCell: { alignItems: 'center', justifyContent: 'center' },
  rankMedal: { fontSize: 18 },
  rankNum: { fontFamily: typography.fontBold, fontSize: 13, color: '#6B7280' },

  cityName: { fontFamily: typography.fontBold, fontSize: 14, color: '#111827' },
  countryName: { fontFamily: typography.fontRegular, fontSize: 11, color: '#9CA3AF', marginTop: 1 },

  aqiChip: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 2 },
  aqiChipText: { fontFamily: typography.fontBold, fontSize: 13 },

  statusChip: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  statusChipText: { fontFamily: typography.fontBold, fontSize: 10 },

  pm25Text: { fontFamily: typography.fontMedium, fontSize: 13, color: '#374151' },

  footnote: { fontFamily: typography.fontRegular, fontSize: 11, color: '#9CA3AF', marginTop: 12, marginHorizontal: 16 },
  footnote2: { fontFamily: typography.fontRegular, fontSize: 11, color: '#9CA3AF', marginTop: 2, marginHorizontal: 16 },
});
