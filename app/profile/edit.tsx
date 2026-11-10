import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { X, Check, Camera, Plus, Trash2 } from 'lucide-react-native';
import { theme } from '../../src/theme/tokens';
import { useAppTheme } from '../../src/theme/useAppTheme';
import { useAppStore } from '../../src/store/useAppStore';
import { LifestyleSelector } from '../../src/components/profile/LifestyleSelector';
import { RoomEditor } from '../../src/components/room/RoomEditor';
import { RoommateProfile, RoomListing } from '../../src/types';

export default function EditProfileScreen() {
  const router = useRouter();
  const { isDark, currentTheme } = useAppTheme();

  const { currentUser, updateUserProfile, updateRoom } = useAppStore();

  const [form, setForm] = useState<RoommateProfile>({ ...currentUser });
  const [roomForm, setRoomForm] = useState<Partial<RoomListing>>({
    ...(currentUser.room || {
      title: '',
      description: '',
      rentMonthly: 1200,
      deposit: 1200,
      privateBath: true,
      utilitiesIncluded: false,
      hasLaundry: true,
      hasParking: true,
      photos: [],
      addressMasked: 'Ballard, Seattle',
      availableFrom: '2026-12-01',
    }),
  });

  const [isSaving, setIsSaving] = useState(false);

  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setForm({ ...form, avatarUrl: result.assets[0].uri });
      }
    } catch (e) {
      console.warn('Avatar picker error:', e);
    }
  };

  const handleAddPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photos = form.photos || [];
        setForm({ ...form, photos: [...photos, result.assets[0].uri] });
      }
    } catch (e) {
      console.warn('Photo picker error:', e);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const photos = form.photos || [];
    setForm({ ...form, photos: photos.filter((_, i) => i !== index) });
  };

  const handleLifestyleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile(form);
      if (form.userMode === 'have_room') {
        await updateRoom(roomForm);
      }
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      edges={['top']}
    >
      {/* Header bar */}
      <View style={[styles.header, { borderBottomColor: currentTheme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} activeOpacity={0.7}>
          <X size={20} color={currentTheme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.textPrimary }]}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          style={[styles.headerBtn, { opacity: isSaving ? 0.5 : 1 }]}
          activeOpacity={0.7}
        >
          <Check size={20} color={currentTheme.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* User Mode Switch */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.textPrimary }]}>Your Status</Text>
          <View style={styles.modeToggleRow}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                {
                  backgroundColor: form.userMode === 'need_room' ? currentTheme.surface : 'transparent',
                  borderColor: form.userMode === 'need_room' ? currentTheme.accent : currentTheme.border,
                },
              ]}
              onPress={() => setForm({ ...form, userMode: 'need_room' })}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  {
                    color: form.userMode === 'need_room' ? currentTheme.accent : currentTheme.textSecondary,
                    fontWeight: form.userMode === 'need_room' ? '700' : '500',
                  },
                ]}
              >
                Looking for a Room / Team Up
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                {
                  backgroundColor: form.userMode === 'have_room' ? currentTheme.surface : 'transparent',
                  borderColor: form.userMode === 'have_room' ? currentTheme.accent : currentTheme.border,
                },
              ]}
              onPress={() => setForm({ ...form, userMode: 'have_room' })}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  {
                    color: form.userMode === 'have_room' ? currentTheme.accent : currentTheme.textSecondary,
                    fontWeight: form.userMode === 'have_room' ? '700' : '500',
                  },
                ]}
              >
                I Have a Room to Fill
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Avatar & Photo Gallery */}
        <View style={[styles.section, { borderTopColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.textPrimary }]}>Photos</Text>

          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: form.avatarUrl }} style={styles.avatar} />
              <TouchableOpacity
                style={[styles.editAvatarBtn, { backgroundColor: currentTheme.accent }]}
                onPress={handlePickAvatar}
                activeOpacity={0.8}
              >
                <Camera size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.avatarTextCol}>
              <Text style={[styles.avatarLabel, { color: currentTheme.textPrimary }]}>
                Main Profile Avatar
              </Text>
              <Text style={[styles.avatarSub, { color: currentTheme.textMuted }]}>
                Shown as your primary card portrait
              </Text>
            </View>
          </View>

          <View style={styles.galleryList}>
            {(form.photos || []).map((uri, idx) => (
              <View key={idx} style={styles.photoBox}>
                <Image source={{ uri }} style={styles.photoImg} />
                <TouchableOpacity
                  style={styles.delBtn}
                  onPress={() => handleRemovePhoto(idx)}
                  activeOpacity={0.7}
                >
                  <Trash2 size={12} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.addBox, { borderColor: currentTheme.border, backgroundColor: currentTheme.surface }]}
              onPress={handleAddPhoto}
              activeOpacity={0.8}
            >
              <Plus size={20} color={currentTheme.accent} />
              <Text style={[styles.addBoxText, { color: currentTheme.accent }]}>Add Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Basic Info */}
        <View style={[styles.section, { borderTopColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.textPrimary }]}>Personal Information</Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: currentTheme.textSecondary }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.textPrimary, borderColor: currentTheme.border }]}
              value={form.fullName}
              onChangeText={(val) => setForm({ ...form, fullName: val })}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: currentTheme.textSecondary }]}>Age</Text>
              <TextInput
                style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.textPrimary, borderColor: currentTheme.border }]}
                value={String(form.age)}
                keyboardType="numeric"
                onChangeText={(val) => setForm({ ...form, age: parseInt(val, 10) || 18 })}
              />
            </View>

            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: currentTheme.textSecondary }]}>Gender</Text>
              <TextInput
                style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.textPrimary, borderColor: currentTheme.border }]}
                value={form.gender}
                onChangeText={(val) => setForm({ ...form, gender: val })}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: currentTheme.textSecondary }]}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: currentTheme.surface, color: currentTheme.textPrimary, borderColor: currentTheme.border }]}
              value={form.bio}
              onChangeText={(val) => setForm({ ...form, bio: val })}
              multiline
              numberOfLines={3}
              placeholder="What are your hobbies, what do you do, how do you live?"
              placeholderTextColor={currentTheme.textMuted}
            />
          </View>

          {/* Budget */}
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: currentTheme.textSecondary }]}>Min Budget (₹/mo)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.textPrimary, borderColor: currentTheme.border }]}
                value={String(form.budgetMin)}
                keyboardType="numeric"
                onChangeText={(val) => setForm({ ...form, budgetMin: parseInt(val, 10) || 0 })}
              />
            </View>

            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: currentTheme.textSecondary }]}>Max Budget (₹/mo)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.textPrimary, borderColor: currentTheme.border }]}
                value={String(form.budgetMax)}
                keyboardType="numeric"
                onChangeText={(val) => setForm({ ...form, budgetMax: parseInt(val, 10) || 0 })}
              />
            </View>
          </View>

          {/* Target Move In Date */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: currentTheme.textSecondary }]}>Move-In Date (YYYY-MM-DD)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.textPrimary, borderColor: currentTheme.border }]}
              value={form.moveInDate}
              onChangeText={(val) => setForm({ ...form, moveInDate: val })}
            />
          </View>

          {/* Dietary Preference */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: currentTheme.textSecondary }]}>Dietary Preference</Text>
            <View style={styles.dietaryChipsRow}>
              {['Vegetarian', 'Pure Veg', 'Eggetarian', 'Non-Veg', 'Jain Food'].map((diet) => {
                const isSelected = form.dietaryPref === diet;
                return (
                  <TouchableOpacity
                    key={diet}
                    style={[
                      styles.dietChip,
                      {
                        backgroundColor: isSelected ? currentTheme.accent : currentTheme.surface,
                        borderColor: isSelected ? currentTheme.accent : currentTheme.border,
                      },
                    ]}
                    onPress={() => setForm({ ...form, dietaryPref: diet })}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.dietChipText,
                        {
                          color: isSelected ? '#FFFFFF' : currentTheme.textPrimary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {diet}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Lifestyle Questionnaire */}
        <View style={[styles.section, { borderTopColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.textPrimary }]}>Living Habits & Compatibility</Text>
          <LifestyleSelector
            cleanliness={form.cleanlinessLevel}
            sleep={form.sleepSchedule}
            work={form.workStyle}
            pets={form.petPolicy}
            smoking={form.smokingPolicy}
            guests={form.guestPolicy}
            onChange={handleLifestyleChange}
          />
        </View>

        {/* Room Editor (if have_room mode) */}
        {form.userMode === 'have_room' && (
          <View style={[styles.section, { borderTopColor: currentTheme.border }]}>
            <RoomEditor room={roomForm} onChange={setRoomForm} />
          </View>
        )}

        {/* Save CTA */}
        <View style={styles.footerSection}>
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: currentTheme.accent }]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>{isSaving ? 'Saving...' : 'Save Profile'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: theme.typography.fontHeadingBold,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    paddingVertical: 18,
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: theme.typography.fontHeadingBold,
    marginBottom: 12,
  },
  modeToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: theme.radii.control,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonText: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: theme.typography.fontBodyMedium,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarTextCol: {
    flex: 1,
  },
  avatarLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: theme.typography.fontHeading,
  },
  avatarSub: {
    fontSize: 12,
    fontFamily: theme.typography.fontBody,
    marginTop: 2,
  },
  galleryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoBox: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
  delBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addBoxText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: theme.typography.fontBodyMedium,
  },
  field: {
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: theme.typography.fontBodyMedium,
    marginBottom: 6,
  },
  input: {
    borderRadius: theme.radii.control,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: theme.typography.fontBody,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  footerSection: {
    marginTop: 20,
  },
  saveBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.control,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: theme.typography.fontBodyMedium,
  },
  dietaryChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  dietChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.radii.pill,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dietChipText: {
    fontSize: 13,
    fontFamily: theme.typography.fontBodyMedium,
  },
});

