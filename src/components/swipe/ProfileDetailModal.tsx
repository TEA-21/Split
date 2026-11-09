import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  X,
  CheckCircle,
  MapPin,
  Calendar,
  Home,
  ShieldAlert,
  Check,
  Bath,
  Zap,
  Shirt,
  Car,
} from 'lucide-react-native';
import { RoommateProfile } from '../../types';
import { theme } from '../../theme/tokens';
import { useAppTheme } from '../../theme/useAppTheme';
import { useAppStore } from '../../store/useAppStore';

const { width } = Dimensions.get('window');

interface ProfileDetailModalProps {
  profile: RoommateProfile | null;
  visible: boolean;
  onClose: () => void;
  onReport: (profile: RoommateProfile) => void;
}

export const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
  profile,
  visible,
  onClose,
  onReport,
}) => {
  const { isDark, currentTheme } = useAppTheme();
  const currentUser = useAppStore((s) => s.currentUser);

  if (!profile) return null;

  const room = profile.room;
  const allPhotos = [
    profile.avatarUrl,
    ...(profile.photos || []),
    ...(room?.photos || []),
  ].filter((url, index, arr) => arr.indexOf(url) === index);

  const formatHabitValue = (key: string, val: any): string => {
    switch (val) {
      case 'early_bird':
        return 'Early Bird';
      case 'night_owl':
        return 'Night Owl';
      case 'flexible':
        return 'Flexible';
      case 'wfh':
        return 'Remote (WFH)';
      case 'office':
        return 'In Office';
      case 'hybrid':
        return 'Hybrid';
      case 'student':
        return 'Student';
      case 'has_pets':
        return 'Has Pets';
      case 'pet_friendly':
        return 'Pet Friendly';
      case 'no_pets':
        return 'No Pets';
      case 'non_smoker':
        return 'Non-Smoker';
      case 'smoker':
        return 'Smoker';
      case 'outside_only':
        return 'Outside Only';
      case 'rarely':
        return 'Quiet / Rarely';
      case 'weekends':
        return 'Weekends Only';
      default:
        return String(val || 'N/A');
    }
  };

  const isHabitMatch = (val1: any, val2: any) => {
    if (val1 === val2) return true;
    if (val1 === 'flexible' || val2 === 'flexible') return true;
    if (val1 === 'pet_friendly' || val2 === 'pet_friendly') return true;
    return false;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
        {/* Sticky Close Button */}
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <X size={20} color={currentTheme.textPrimary} strokeWidth={2.2} />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Photo Carousel */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.photoCarousel}
          >
            {allPhotos.map((photo, index) => (
              <Image key={index} source={{ uri: photo }} style={styles.carouselImage} resizeMode="cover" />
            ))}
          </ScrollView>

          <View style={styles.body}>
            {/* Header info */}
            <View style={styles.headerRow}>
              <View style={styles.nameBlock}>
                <View style={styles.nameTitleRow}>
                  <Text style={[styles.name, { color: currentTheme.textPrimary }]}>
                    {profile.fullName}, {profile.age}
                  </Text>
                  {profile.verifiedEmail && (
                    <CheckCircle size={18} color={currentTheme.verified} fill={currentTheme.verified} />
                  )}
                </View>
                <View style={styles.locationRow}>
                  <MapPin size={14} color={currentTheme.textMuted} />
                  <Text style={[styles.locationText, { color: currentTheme.textSecondary }]}>
                    {profile.locationName}
                    {profile.distanceMiles !== undefined ? ` • ${profile.distanceMiles} mi away` : ''}
                  </Text>
                </View>
              </View>

              {/* Mode & Price Pill */}
              <View style={styles.pricePillWrapper}>
                <View style={[styles.modeBadge, { backgroundColor: currentTheme.accentMuted }]}>
                  <Text style={[styles.modeText, { color: currentTheme.accent }]}>
                    {profile.userMode === 'have_room' ? 'Offers Room' : 'Looking to Team Up'}
                  </Text>
                </View>
                <Text style={[styles.priceTag, { color: currentTheme.textPrimary }]}>
                  ${profile.room?.rentMonthly ?? profile.budgetMax}/mo split
                </Text>
              </View>
            </View>

            {/* Bio */}
            {Boolean(profile.bio) && (
              <View style={[styles.section, { borderTopColor: currentTheme.border }]}>
                <Text style={[styles.sectionTitle, { color: currentTheme.textPrimary }]}>About Me</Text>
                <Text style={[styles.bioText, { color: currentTheme.textSecondary }]}>{profile.bio}</Text>
              </View>
            )}

            {/* Side-by-Side Habit Split Comparison */}
            <View style={[styles.section, { borderTopColor: currentTheme.border }]}>
              <View style={styles.sectionTitleRow}>
                <Text style={[styles.sectionTitle, { color: currentTheme.textPrimary }]}>
                  Living Habits Split Comparison
                </Text>
                <View style={[styles.matchIndicator, { backgroundColor: currentTheme.likeBg }]}>
                  <Check size={12} color={currentTheme.like} strokeWidth={2.5} />
                  <Text style={[styles.matchText, { color: currentTheme.like }]}>Compatibility</Text>
                </View>
              </View>

              <View style={[styles.comparisonTable, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
                <View style={[styles.tableHeader, { borderBottomColor: currentTheme.border }]}>
                  <Text style={[styles.colHeader, { color: currentTheme.textMuted, width: '38%' }]}>Habit</Text>
                  <Text style={[styles.colHeader, { color: currentTheme.accent, width: '31%' }]}>You</Text>
                  <Text style={[styles.colHeader, { color: currentTheme.textPrimary, width: '31%' }]}>
                    {profile.fullName.split(' ')[0]}
                  </Text>
                </View>

                {/* Cleanliness */}
                <View style={[styles.tableRow, { borderBottomColor: currentTheme.border }]}>
                  <Text style={[styles.rowLabel, { color: currentTheme.textSecondary, width: '38%' }]}>Cleanliness</Text>
                  <Text style={[styles.rowValue, { color: currentTheme.textPrimary, width: '31%' }]}>
                    {currentUser.cleanlinessLevel}/5
                  </Text>
                  <Text style={[styles.rowValue, { color: currentTheme.textPrimary, width: '31%' }]}>
                    {profile.cleanlinessLevel}/5
                  </Text>
                </View>

                {/* Sleep Schedule */}
                <View style={[styles.tableRow, { borderBottomColor: currentTheme.border }]}>
                  <Text style={[styles.rowLabel, { color: currentTheme.textSecondary, width: '38%' }]}>Schedule</Text>
                  <Text style={[styles.rowValue, { color: currentTheme.textPrimary, width: '31%' }]}>
                    {formatHabitValue('sleep', currentUser.sleepSchedule)}
                  </Text>
                  <Text
                    style={[
                      styles.rowValue,
                      {
                        color: isHabitMatch(currentUser.sleepSchedule, profile.sleepSchedule)
                          ? currentTheme.like
                          : currentTheme.textPrimary,
                        width: '31%',
                      },
                    ]}
                  >
                    {formatHabitValue('sleep', profile.sleepSchedule)}
                  </Text>
                </View>

                {/* Work Style */}
                <View style={[styles.tableRow, { borderBottomColor: currentTheme.border }]}>
                  <Text style={[styles.rowLabel, { color: currentTheme.textSecondary, width: '38%' }]}>Work Style</Text>
                  <Text style={[styles.rowValue, { color: currentTheme.textPrimary, width: '31%' }]}>
                    {formatHabitValue('work', currentUser.workStyle)}
                  </Text>
                  <Text style={[styles.rowValue, { color: currentTheme.textPrimary, width: '31%' }]}>
                    {formatHabitValue('work', profile.workStyle)}
                  </Text>
                </View>

                {/* Pets */}
                <View style={[styles.tableRow, { borderBottomColor: currentTheme.border }]}>
                  <Text style={[styles.rowLabel, { color: currentTheme.textSecondary, width: '38%' }]}>Pets</Text>
                  <Text style={[styles.rowValue, { color: currentTheme.textPrimary, width: '31%' }]}>
                    {formatHabitValue('pet', currentUser.petPolicy)}
                  </Text>
                  <Text
                    style={[
                      styles.rowValue,
                      {
                        color: isHabitMatch(currentUser.petPolicy, profile.petPolicy)
                          ? currentTheme.like
                          : currentTheme.textPrimary,
                        width: '31%',
                      },
                    ]}
                  >
                    {formatHabitValue('pet', profile.petPolicy)}
                  </Text>
                </View>

                {/* Smoking */}
                <View style={[styles.tableRow, { borderBottomColor: currentTheme.border }]}>
                  <Text style={[styles.rowLabel, { color: currentTheme.textSecondary, width: '38%' }]}>Smoking</Text>
                  <Text style={[styles.rowValue, { color: currentTheme.textPrimary, width: '31%' }]}>
                    {formatHabitValue('smoking', currentUser.smokingPolicy)}
                  </Text>
                  <Text
                    style={[
                      styles.rowValue,
                      {
                        color: isHabitMatch(currentUser.smokingPolicy, profile.smokingPolicy)
                          ? currentTheme.like
                          : currentTheme.pass,
                        width: '31%',
                      },
                    ]}
                  >
                    {formatHabitValue('smoking', profile.smokingPolicy)}
                  </Text>
                </View>

                {/* Guests */}
                <View style={styles.tableRow}>
                  <Text style={[styles.rowLabel, { color: currentTheme.textSecondary, width: '38%' }]}>Guests</Text>
                  <Text style={[styles.rowValue, { color: currentTheme.textPrimary, width: '31%' }]}>
                    {formatHabitValue('guest', currentUser.guestPolicy)}
                  </Text>
                  <Text style={[styles.rowValue, { color: currentTheme.textPrimary, width: '31%' }]}>
                    {formatHabitValue('guest', profile.guestPolicy)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Room Details (if offering a room) */}
            {profile.userMode === 'have_room' && room && (
              <View style={[styles.section, { borderTopColor: currentTheme.border }]}>
                <View style={styles.sectionHeaderIconRow}>
                  <Home size={18} color={currentTheme.accent} />
                  <Text style={[styles.sectionTitle, { color: currentTheme.textPrimary }]}>The Room & Apartment</Text>
                </View>

                <Text style={[styles.roomTitle, { color: currentTheme.textPrimary }]}>{room.title}</Text>
                <Text style={[styles.bioText, { color: currentTheme.textSecondary }]}>{room.description}</Text>

                {/* Amenities grid */}
                <View style={styles.amenitiesGrid}>
                  <View style={[styles.amenityBadge, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
                    <Bath size={14} color={room.privateBath ? currentTheme.like : currentTheme.textMuted} />
                    <Text style={[styles.amenityText, { color: currentTheme.textPrimary }]}>
                      {room.privateBath ? 'Private Bath' : 'Shared Bath'}
                    </Text>
                  </View>

                  <View style={[styles.amenityBadge, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
                    <Zap size={14} color={room.utilitiesIncluded ? currentTheme.like : currentTheme.textMuted} />
                    <Text style={[styles.amenityText, { color: currentTheme.textPrimary }]}>
                      {room.utilitiesIncluded ? 'Utilities Included' : 'Utilities Split'}
                    </Text>
                  </View>

                  <View style={[styles.amenityBadge, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
                    <Shirt size={14} color={room.hasLaundry ? currentTheme.like : currentTheme.textMuted} />
                    <Text style={[styles.amenityText, { color: currentTheme.textPrimary }]}>
                      {room.hasLaundry ? 'In-unit Laundry' : 'Laundromat nearby'}
                    </Text>
                  </View>

                  <View style={[styles.amenityBadge, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
                    <Car size={14} color={room.hasParking ? currentTheme.like : currentTheme.textMuted} />
                    <Text style={[styles.amenityText, { color: currentTheme.textPrimary }]}>
                      {room.hasParking ? 'Parking Included' : 'Street Parking'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Lease & Timeline */}
            <View style={[styles.section, { borderTopColor: currentTheme.border }]}>
              <View style={styles.sectionHeaderIconRow}>
                <Calendar size={18} color={currentTheme.textMuted} />
                <Text style={[styles.sectionTitle, { color: currentTheme.textPrimary }]}>Lease & Move-in</Text>
              </View>
              <View style={styles.timelineRow}>
                <View>
                  <Text style={[styles.timelineLabel, { color: currentTheme.textMuted }]}>Available From</Text>
                  <Text style={[styles.timelineValue, { color: currentTheme.textPrimary }]}>{profile.moveInDate}</Text>
                </View>
                <View>
                  <Text style={[styles.timelineLabel, { color: currentTheme.textMuted }]}>Target Term</Text>
                  <Text style={[styles.timelineValue, { color: currentTheme.textPrimary }]}>
                    {profile.leaseDurationMonths} Months
                  </Text>
                </View>
              </View>
            </View>

            {/* Safety & Report Button */}
            <View style={[styles.footerSection, { borderTopColor: currentTheme.border }]}>
              <TouchableOpacity
                style={[styles.reportButton, { borderColor: currentTheme.pass }]}
                onPress={() => onReport(profile)}
                activeOpacity={0.7}
              >
                <ShieldAlert size={16} color={currentTheme.pass} />
                <Text style={[styles.reportButtonText, { color: currentTheme.pass }]}>Report or Block Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  photoCarousel: {
    width: width,
    height: width * 1.05,
  },
  carouselImage: {
    width: width,
    height: width * 1.05,
  },
  body: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  nameBlock: {
    flex: 1,
  },
  nameTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: theme.typography.fontHeadingBold,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    fontFamily: theme.typography.fontBody,
  },
  pricePillWrapper: {
    alignItems: 'flex-end',
  },
  modeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radii.pill,
    marginBottom: 4,
  },
  modeText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: theme.typography.fontBodyMedium,
  },
  priceTag: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: theme.typography.fontMono,
  },
  section: {
    marginTop: 20,
    paddingTop: 18,
    borderTopWidth: 1,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: theme.typography.fontHeadingBold,
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radii.pill,
  },
  matchText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: theme.typography.fontBodyMedium,
  },
  bioText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: theme.typography.fontBody,
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: theme.typography.fontHeading,
    marginBottom: 6,
  },
  comparisonTable: {
    borderRadius: theme.radii.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  colHeader: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.typography.fontBodyMedium,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 13,
    fontFamily: theme.typography.fontBody,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: theme.typography.fontBodyMedium,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  amenityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radii.control,
    borderWidth: 1,
  },
  amenityText: {
    fontSize: 13,
    fontFamily: theme.typography.fontBody,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 40,
  },
  timelineLabel: {
    fontSize: 12,
    fontFamily: theme.typography.fontBody,
  },
  timelineValue: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: theme.typography.fontHeading,
    marginTop: 2,
  },
  footerSection: {
    marginTop: 28,
    paddingTop: 20,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.radii.control,
    borderWidth: 1,
  },
  reportButtonText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: theme.typography.fontBodyMedium,
  },
});

