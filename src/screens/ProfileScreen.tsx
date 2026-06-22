import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { typography } from '../theme';

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  bg: string;
  darkBg: string;
  action: () => void;
};

export default function ProfileScreen() {
  const { isDark, toggleTheme, colors } = useTheme();

  const menuItems: MenuItem[] = [
    {
      icon: 'person-outline',
      label: 'Personal Info',
      color: '#4F46E5',
      bg: '#EEF2FF',
      darkBg: '#1E1B4B',
      action: () => Alert.alert('Personal Info', 'Edit your name, age and health profile here.'),
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      color: '#FF6D00',
      bg: '#FFF3E0',
      darkBg: '#431407',
      action: () => Alert.alert('Notifications', 'Manage your alert preferences.'),
    },
    {
      icon: 'location-outline',
      label: 'Saved Locations',
      color: '#00C853',
      bg: '#E8F5E9',
      darkBg: '#052e16',
      action: () => Alert.alert('Saved Locations', 'Add and manage your saved locations.'),
    },
    {
      icon: 'language-outline',
      label: 'Language',
      color: '#2196F3',
      bg: '#E3F2FD',
      darkBg: '#0c1a2e',
      action: () => Alert.alert('Language', 'English (Default)\n\nMore languages coming soon.'),
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Privacy Policy',
      color: '#9C27B0',
      bg: '#F3E5F5',
      darkBg: '#2d1b3d',
      action: () => Alert.alert('Privacy Policy', 'Sanjeevan does not share your data with third parties. Location data is used only for local AQI lookups.'),
    },
    {
      icon: 'help-circle-outline',
      label: 'Help & FAQ',
      color: '#FF9800',
      bg: '#FFF8E1',
      darkBg: '#2d1a00',
      action: () => Alert.alert('FAQ', 'Q: Why is AQI showing 0?\nA: Update your OpenAQ API key.\n\nQ: How is forecast calculated?\nA: Using wind, humidity & temperature data.'),
    },
    {
      icon: 'information-circle-outline',
      label: 'About Sanjeevan',
      color: '#607D8B',
      bg: '#ECEFF1',
      darkBg: '#1a2428',
      action: () => Alert.alert('About', 'Sanjeevan v1.0.0\n\nA personal air quality monitoring app built for India.\n\nData sources: OpenAQ, Open-Meteo'),
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Profile</Text>
        </View>

        {/* Avatar card */}
        <View style={[styles.avatarCard, { backgroundColor: colors.surface }]}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={34} color="#fff" />
          </View>
          <View style={styles.avatarInfo}>
            <Text style={[styles.avatarName, { color: colors.textPrimary }]}>Sanjeevan User</Text>
            <Text style={[styles.avatarSub, { color: colors.textMuted }]}>Air Quality Monitoring</Text>
          </View>
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: isDark ? '#312E81' : '#EEF2FF' }]}
            onPress={() => Alert.alert('Edit Profile', 'Profile editing coming soon.')}
          >
            <Ionicons name="pencil-outline" size={16} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Days Active', value: '7', icon: 'calendar-outline', color: '#4F46E5' },
            { label: 'Alerts', value: '3', icon: 'notifications-outline', color: '#FF6D00' },
            { label: 'Locations', value: '2', icon: 'location-outline', color: '#00C853' },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Ionicons name={stat.icon as any} size={16} color={stat.color} />
              <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Dark mode toggle */}
        <View style={[styles.darkModeCard, { backgroundColor: colors.surface }]}>
          <View style={styles.darkModeLeft}>
            <View style={[styles.darkModeIcon, { backgroundColor: isDark ? '#312E81' : '#EEF2FF' }]}>
              <Ionicons name={isDark ? 'moon' : 'sunny-outline'} size={20} color={isDark ? '#818CF8' : '#4F46E5'} />
            </View>
            <View>
              <Text style={[styles.darkModeLabel, { color: colors.textPrimary }]}>Dark Mode</Text>
              <Text style={[styles.darkModeSub, { color: colors.textMuted }]}>
                {isDark ? 'Dark theme active' : 'Light theme active'}
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#E5E7EB', true: '#4F46E5' }}
            thumbColor="#fff"
          />
        </View>

        {/* Menu */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>SETTINGS</Text>
        <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuRow,
                index < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? '#374151' : '#F3F4F6' }
              ]}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: isDark ? item.darkBg : item.bg }]}>
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: isDark ? '#1F2937' : '#FEF2F2' }]}
          onPress={() => Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: () => Alert.alert('Signed out') },
          ])}
        >
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.textMuted }]}>
          Sanjeevan v1.0.0 • Made with ♥ in India
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

  avatarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInfo: { flex: 1 },
  avatarName: { fontFamily: typography.fontBold, fontSize: 17 },
  avatarSub: { fontFamily: typography.fontRegular, fontSize: 13, marginTop: 2 },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: { fontFamily: typography.fontBold, fontSize: 20 },
  statLabel: { fontFamily: typography.fontRegular, fontSize: 10, textAlign: 'center' },

  darkModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  darkModeLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  darkModeIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  darkModeLabel: { fontFamily: typography.fontBold, fontSize: 15 },
  darkModeSub: { fontFamily: typography.fontRegular, fontSize: 12, marginTop: 1 },

  sectionLabel: {
    fontFamily: typography.fontBold,
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 13,
  },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontFamily: typography.fontMedium, fontSize: 15, flex: 1 },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 16,
  },
  logoutText: { fontFamily: typography.fontBold, fontSize: 15, color: '#EF4444' },

  version: { fontFamily: typography.fontRegular, fontSize: 12, textAlign: 'center', marginBottom: 8 },
});