import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { CheckCircle, MapPin, Home, User } from 'lucide-react-native';
import { RoommateProfile, SwipeDirection } from '../../types';
import { theme } from '../../theme/tokens';
import { useAppTheme } from '../../theme/useAppTheme';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 110;
const VERTICAL_SUPERLIKE_THRESHOLD = -120;

interface SwipeCardProps {
  profile: RoommateProfile;
  isTopCard: boolean;
  onSwipe: (direction: SwipeDirection) => void;
  onPressDetails: () => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  profile,
  isTopCard,
  onSwipe,
  onPressDetails,
}) => {
  const { isDark, currentTheme } = useAppTheme();

  // Split Photo State (toggle between Roommate photo and Room photo if available)
  const [photoMode, setPhotoMode] = useState<'person' | 'room'>('person');
  const hasRoomPhoto = Boolean(profile.room?.photos && profile.room.photos.length > 0);
  const activePhotoUri =
    photoMode === 'room' && hasRoomPhoto
      ? profile.room!.photos[0]
      : profile.avatarUrl;

  // Reanimated gesture values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .enabled(isTopCard)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withSpring(width * 1.5, { damping: 15 });
        runOnJS(onSwipe)('like');
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-width * 1.5, { damping: 15 });
        runOnJS(onSwipe)('pass');
      } else if (translateY.value < VERTICAL_SUPERLIKE_THRESHOLD) {
        translateY.value = withSpring(-height, { damping: 15 });
        runOnJS(onSwipe)('superlike');
      } else {
        translateX.value = withSpring(0, { damping: 18, stiffness: 200 });
        translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-width / 2, 0, width / 2],
      [-12, 0, 12]
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const likeStampStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [20, 80], [0, 1]);
    return { opacity };
  });

  const nopeStampStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [-20, -80], [0, 1]);
    return { opacity };
  });

  const superlikeStampStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateY.value, [-30, -90], [0, 1]);
    return { opacity };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.cardContainer,
          {
            backgroundColor: currentTheme.surface,
            borderColor: currentTheme.border,
          },
          isTopCard && cardAnimatedStyle,
        ]}
      >
        {/* Main Photo */}
        <Image
          source={{ uri: activePhotoUri }}
          style={styles.cardImage}
          resizeMode="cover"
        />

        {/* Split Photo Toggle Bar (when profile has room) */}
        {profile.userMode === 'have_room' && hasRoomPhoto && (
          <View style={styles.splitPhotoToggleBar}>
            <TouchableOpacity
              style={[
                styles.splitToggleSegment,
                photoMode === 'person' && styles.splitToggleSegmentActive,
                { backgroundColor: photoMode === 'person' ? currentTheme.surface : 'rgba(0,0,0,0.45)' },
              ]}
              onPress={() => setPhotoMode('person')}
              activeOpacity={0.8}
            >
              <User size={13} color={photoMode === 'person' ? currentTheme.accent : '#FFFFFF'} />
              <Text
                style={[
                  styles.splitToggleText,
                  { color: photoMode === 'person' ? currentTheme.textPrimary : '#FFFFFF' },
                ]}
              >
                Person
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.splitToggleSegment,
                photoMode === 'room' && styles.splitToggleSegmentActive,
                { backgroundColor: photoMode === 'room' ? currentTheme.surface : 'rgba(0,0,0,0.45)' },
              ]}
              onPress={() => setPhotoMode('room')}
              activeOpacity={0.8}
            >
              <Home size={13} color={photoMode === 'room' ? currentTheme.accent : '#FFFFFF'} />
              <Text
                style={[
                  styles.splitToggleText,
                  { color: photoMode === 'room' ? currentTheme.textPrimary : '#FFFFFF' },
                ]}
              >
                Room
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* LIKE Stamp */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.stamp,
            styles.likeStamp,
            { borderColor: currentTheme.like, backgroundColor: currentTheme.likeBg },
            likeStampStyle,
          ]}
        >
          <Text style={[styles.stampText, { color: currentTheme.like }]}>LIKE</Text>
        </Animated.View>

        {/* NOPE Stamp */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.stamp,
            styles.nopeStamp,
            { borderColor: currentTheme.pass, backgroundColor: currentTheme.passBg },
            nopeStampStyle,
          ]}
        >
          <Text style={[styles.stampText, { color: currentTheme.pass }]}>NOPE</Text>
        </Animated.View>

        {/* SUPERLIKE Stamp */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.stamp,
            styles.superlikeStamp,
            { borderColor: currentTheme.superlike, backgroundColor: currentTheme.superlikeBg },
            superlikeStampStyle,
          ]}
        >
          <Text style={[styles.stampText, { color: currentTheme.superlike }]}>SUPERLIKE</Text>
        </Animated.View>

        {/* Bottom Metadata Overlay */}
        <TouchableOpacity
          style={styles.bottomOverlay}
          onPress={onPressDetails}
          activeOpacity={0.9}
        >
          <View style={styles.overlayContent}>
            {/* Top row: Name, age, verified, split rent */}
            <View style={styles.metaHeader}>
              <View style={styles.nameRow}>
                <Text style={styles.nameText}>
                  {profile.fullName}, {profile.age}
                </Text>
                {profile.verifiedEmail && (
                  <CheckCircle size={18} color="#FFFFFF" fill={currentTheme.verified} />
                )}
              </View>

              <View style={[styles.splitChip, { backgroundColor: currentTheme.accent }]}>
                <Text style={styles.splitChipText}>
                  ₹{(profile.room?.rentMonthly ?? profile.budgetMax).toLocaleString('en-IN')}/mo split
                </Text>
              </View>
            </View>

            {/* Location & Mode */}
            <View style={styles.subMetaRow}>
              <View style={styles.locationBlock}>
                <MapPin size={13} color="rgba(255,255,255,0.85)" />
                <Text style={styles.locationString}>
                  {profile.locationName}
                  {profile.distanceKm !== undefined ? ` • ${profile.distanceKm} km away` : (profile.distanceMiles !== undefined ? ` • ${profile.distanceMiles} mi away` : '')}
                </Text>
              </View>

              <View style={styles.modePill}>
                <Text style={styles.modePillText}>
                  {profile.userMode === 'have_room' ? 'Have Room' : 'Need Room'}
                </Text>
              </View>
            </View>

            {/* Lifestyle quick chips */}
            <View style={styles.tagsRow}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  Clean: {profile.cleanlinessLevel}/5
                </Text>
              </View>

              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  {profile.sleepSchedule === 'early_bird' ? 'Early Riser' : 'Night Owl'}
                </Text>
              </View>

              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  {profile.petPolicy === 'has_pets'
                    ? 'Has Pets'
                    : profile.petPolicy === 'pet_friendly'
                    ? 'Pet Friendly'
                    : 'No Pets'}
                </Text>
              </View>

              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  {profile.workStyle === 'wfh'
                    ? 'WFH'
                    : profile.workStyle === 'office'
                    ? 'Office'
                    : 'Hybrid'}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: width - 24,
    height: Platform.OS === 'web' ? Math.min(height * 0.72, 600) : height * 0.68,
    borderRadius: theme.radii.card,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  splitPhotoToggleBar: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    gap: 6,
    zIndex: 20,
  },
  splitToggleSegment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: theme.radii.pill,
  },
  splitToggleSegmentActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  splitToggleText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: theme.typography.fontBodyMedium,
  },
  stamp: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  likeStamp: {
    top: 40,
    left: 30,
    transform: [{ rotate: '-18deg' }],
  },
  nopeStamp: {
    top: 40,
    right: 30,
    transform: [{ rotate: '18deg' }],
  },
  superlikeStamp: {
    bottom: 120,
    alignSelf: 'center',
  },
  stampText: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 2,
    fontFamily: theme.typography.fontHeadingBold,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: 'rgba(25, 22, 20, 0.72)',
  },
  overlayContent: {
    gap: 8,
  },
  metaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    fontFamily: theme.typography.fontHeadingBold,
    letterSpacing: -0.3,
  },
  splitChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radii.pill,
  },
  splitChipText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: theme.typography.fontMono,
  },
  subMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationString: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontFamily: theme.typography.fontBody,
  },
  modePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radii.pill,
  },
  modePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: theme.typography.fontBodyMedium,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radii.control,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
    fontFamily: theme.typography.fontBody,
  },
});

