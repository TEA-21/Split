import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Edit3,
  CheckCircle,
  MapPin,
  ShieldCheck,
  Home,
  Sliders,
  ChevronRight,
  Sun,
  Moon,
  Smartphone,
} from 'lucide-react-native';
import { theme } from '../../src/theme/tokens';
import { useAppTheme } from '../../src/theme/useAppTheme';
import { useAppStore } from '../../src/store/useAppStore';
import { SafetyGuidelinesModal } from '../../src/components/safety/SafetyGuidelinesModal';

export default function ProfileScreen() {
  const router = useRouter();
  const { isDark, currentTheme, themePreference, setThemePreference } = useAppTheme();

  const { currentUser } = useAppStore();
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: currentTheme.border }]}>
        <Text style={[styles.headerTitle, { color: currentTheme.textPrimary }]}>My Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Card Portrait Preview */}
        <View
          style={[
            styles.cardPreview,
            { backgroundColor: currentTheme.surface, borderColor: currentTheme.border },
          ]}
        >
          <Image source={{ uri: currentUser.avatarUrl }} style={styles.cardImage} />

          <View style={styles.cardOverlay}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.nameRow}>
                <Text style={styles.cardName}>
                  {currentUser.fullName}, {currentUser.age}
                </Text>
                {currentUser.verifiedEmail && (
                  <CheckCircle size={18} color="#FFFFFF" fill={currentTheme.verified} />
                )}
              </View>

              <View style={[styles.splitChip, { backgroundColor: currentTheme.accent }]}>
                <Text style={styles.splitChipText}>
                  ${currentUser.room?.rentMonthly ?? currentUser.budgetMax}/mo split
                </Text>
              </View>
            </View>

            <View style={styles.locationRow}>
              <MapPin size={13} color="rgba(255,255,255,0.85)" />
              <Text style={styles.locationText}>{currentUser.locationName}</Text>
              <View style={styles.modeBadge}>
                <Text style={styles.modeBadgeText}>
                  {currentUser.userMode === 'have_room' ? 'Offers Room' : 'Looking to Team Up'}
                </Text>
              </View>
            </View>

            <Text style={styles.bioExcerpt} numberOfLines={2}>
              {currentUser.bio}
            </Text>
          </View>
        </View>

        {/* Primary Edit Button */}
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: currentTheme.accent }]}
          onPress={() => router.push('/profile/edit')}
          activeOpacity={0.85}
        >
          <Edit3 size={16} color="#FFFFFF" strokeWidth={2.2} />
          <Text style={styles.editButtonText}>Edit Profile & Room Details</Text>
        </TouchableOpacity>

        {/* Appearance & Dark Mode Settings */}
        <View style={styles.menuSection}>
          <Text style={[styles.menuHeading, { color: currentTheme.textMuted }]}>
            APPEARANCE
          </Text>

          <View
            style={[
              styles.themeSegmentContainer,
              { backgroundColor: currentTheme.surface, borderColor: currentTheme.border },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.themeOption,
                themePreference === 'system' && {
                  backgroundColor: currentTheme.surfaceSubtle,
                  borderColor: currentTheme.accent,
                },
              ]}
              onPress={() => setThemePreference('system')}
              activeOpacity={0.8}
            >
              <Smartphone
                size={16}
                color={themePreference === 'system' ? currentTheme.accent : currentTheme.textSecondary}
              />
              <Text
                style={[
                  styles.themeOptionText,
                  {
                    color: themePreference === 'system' ? currentTheme.accent : currentTheme.textSecondary,
                    fontWeight: themePreference === 'system' ? '700' : '500',
                  },
                ]}
              >
                System
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                themePreference === 'light' && {
                  backgroundColor: currentTheme.surfaceSubtle,
                  borderColor: currentTheme.accent,
                },
              ]}
              onPress={() => setThemePreference('light')}
              activeOpacity={0.8}
            >
              <Sun
                size={16}
                color={themePreference === 'light' ? currentTheme.accent : currentTheme.textSecondary}
              />
              <Text
                style={[
                  styles.themeOptionText,
                  {
                    color: themePreference === 'light' ? currentTheme.accent : currentTheme.textSecondary,
                    fontWeight: themePreference === 'light' ? '700' : '500',
                  },
                ]}
              >
                Light
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                themePreference === 'dark' && {
                  backgroundColor: currentTheme.surfaceSubtle,
                  borderColor: currentTheme.accent,
                },
              ]}
              onPress={() => setThemePreference('dark')}
              activeOpacity={0.8}
            >
              <Moon
                size={16}
                color={themePreference === 'dark' ? currentTheme.accent : currentTheme.textSecondary}
              />
              <Text
                style={[
                  styles.themeOptionText,
                  {
                    color: themePreference === 'dark' ? currentTheme.accent : currentTheme.textSecondary,
                    fontWeight: themePreference === 'dark' ? '700' : '500',
                  },
                ]}
              >
                Dark
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Settings & Safety Menu */}
        <View style={styles.menuSection}>
          <Text style={[styles.menuHeading, { color: currentTheme.textMuted }]}>
            TRUST & SAFETY
          </Text>

          <TouchableOpacity
            style={[
              styles.menuItem,
              { backgroundColor: currentTheme.surface, borderColor: currentTheme.border },
            ]}
            onPress={() => setShowSafetyModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <ShieldCheck size={18} color={currentTheme.verified} />
              <Text style={[styles.menuLabel, { color: currentTheme.textPrimary }]}>
                Roommate Safety Guidelines
              </Text>
            </View>
            <ChevronRight size={16} color={currentTheme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Room Details Quick View if user has room */}
        {currentUser.userMode === 'have_room' && currentUser.room && (
          <View style={styles.menuSection}>
            <Text style={[styles.menuHeading, { color: currentTheme.textMuted }]}>
              ACTIVE ROOM LISTING
            </Text>
            <View
              style={[
                styles.roomCard,
                { backgroundColor: currentTheme.surface, borderColor: currentTheme.border },
              ]}
            >
              <View style={styles.roomIconRow}>
                <Home size={16} color={currentTheme.accent} />
                <Text style={[styles.roomCardTitle, { color: currentTheme.textPrimary }]}>
                  {currentUser.room.title || 'Untitled Room Listing'}
                </Text>
              </View>
              <Text style={[styles.roomCardSub, { color: currentTheme.textSecondary }]}>
                ${currentUser.room.rentMonthly}/mo • {currentUser.room.privateBath ? 'Private Bath' : 'Shared Bath'} • {currentUser.room.hasLaundry ? 'In-unit Laundry' : 'Laundry nearby'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Safety Modal */}
      <SafetyGuidelinesModal
        visible={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: theme.typography.fontHeadingBold,
    letterSpacing: -0.4,
  },
  scrollBody: {
    padding: 20,
    paddingBottom: 40,
  },
  cardPreview: {
    height: 380,
    borderRadius: theme.radii.card,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 36,
    backgroundColor: 'rgba(25, 22, 20, 0.72)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: theme.typography.fontHeadingBold,
  },
  splitChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: theme.radii.pill,
  },
  splitChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: theme.typography.fontMono,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  locationText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    fontFamily: theme.typography.fontBody,
  },
  modeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: theme.radii.pill,
    marginLeft: 6,
  },
  modeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: theme.typography.fontBodyMedium,
  },
  bioExcerpt: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: theme.typography.fontBody,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: theme.radii.control,
    marginBottom: 24,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: theme.typography.fontBodyMedium,
  },
  menuSection: {
    marginBottom: 20,
  },
  menuHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    fontFamily: theme.typography.fontBodyMedium,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: theme.radii.control,
    borderWidth: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: theme.typography.fontBodyMedium,
  },
  roomCard: {
    padding: 16,
    borderRadius: theme.radii.control,
    borderWidth: 1,
    gap: 6,
  },
  roomIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: theme.typography.fontHeading,
  },
  roomCardSub: {
    fontSize: 12,
    fontFamily: theme.typography.fontBody,
  },
  themeSegmentContainer: {
    flexDirection: 'row',
    borderRadius: theme.radii.control,
    borderWidth: 1,
    padding: 4,
    gap: 6,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: theme.radii.control - 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  themeOptionText: {
    fontSize: 13,
    fontFamily: theme.typography.fontBodyMedium,
  },
});
