import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  Image,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Plus, Trash2, Home } from 'lucide-react-native';
import { RoomListing } from '../../types';
import { theme } from '../../theme/tokens';

interface RoomEditorProps {
  room: Partial<RoomListing>;
  onChange: (updated: Partial<RoomListing>) => void;
}

export const RoomEditor: React.FC<RoomEditorProps> = ({ room, onChange }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentTheme = isDark ? theme.dark : theme.light;

  const handlePickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUri = result.assets[0].uri;
        const currentPhotos = room.photos || [];
        onChange({ ...room, photos: [...currentPhotos, newUri] });
      }
    } catch (e) {
      console.warn('Image picker error:', e);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const currentPhotos = room.photos || [];
    onChange({
      ...room,
      photos: currentPhotos.filter((_, i) => i !== index),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerIconRow}>
        <Home size={18} color={currentTheme.accent} />
        <Text style={[styles.title, { color: currentTheme.textPrimary }]}>
          Room & Property Details
        </Text>
      </View>

      {/* Listing Title */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: currentTheme.textSecondary }]}>Listing Title</Text>
        <TextInput
          style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.textPrimary, borderColor: currentTheme.border }]}
          value={room.title || ''}
          onChangeText={(val) => onChange({ ...room, title: val })}
          placeholder="e.g. Sunny Bedroom with Private Bath in Ballard"
          placeholderTextColor={currentTheme.textMuted}
        />
      </View>

      {/* Description */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: currentTheme.textSecondary }]}>Room Description</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: currentTheme.surface, color: currentTheme.textPrimary, borderColor: currentTheme.border }]}
          value={room.description || ''}
          onChangeText={(val) => onChange({ ...room, description: val })}
          placeholder="Describe the room, sunlight, closet space, roommate dynamic..."
          placeholderTextColor={currentTheme.textMuted}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Financials Row */}
      <View style={styles.row}>
        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={[styles.fieldLabel, { color: currentTheme.textSecondary }]}>Monthly Rent ($)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.textPrimary, borderColor: currentTheme.border }]}
            value={room.rentMonthly ? String(room.rentMonthly) : ''}
            onChangeText={(val) => onChange({ ...room, rentMonthly: parseInt(val, 10) || 0 })}
            placeholder="1200"
            placeholderTextColor={currentTheme.textMuted}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.fieldGroup, { flex: 1 }]}>
          <Text style={[styles.fieldLabel, { color: currentTheme.textSecondary }]}>Security Deposit ($)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.textPrimary, borderColor: currentTheme.border }]}
            value={room.deposit ? String(room.deposit) : ''}
            onChangeText={(val) => onChange({ ...room, deposit: parseInt(val, 10) || 0 })}
            placeholder="1200"
            placeholderTextColor={currentTheme.textMuted}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Masked Address */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: currentTheme.textSecondary }]}>
          Cross Streets / Neighborhood (Masked)
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.textPrimary, borderColor: currentTheme.border }]}
          value={room.addressMasked || ''}
          onChangeText={(val) => onChange({ ...room, addressMasked: val })}
          placeholder="e.g. Pine St & 12th Ave, Capitol Hill"
          placeholderTextColor={currentTheme.textMuted}
        />
      </View>

      {/* Available From */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: currentTheme.textSecondary }]}>Available From (YYYY-MM-DD)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: currentTheme.surface, color: currentTheme.textPrimary, borderColor: currentTheme.border }]}
          value={room.availableFrom || ''}
          onChangeText={(val) => onChange({ ...room, availableFrom: val })}
          placeholder="2026-12-01"
          placeholderTextColor={currentTheme.textMuted}
        />
      </View>

      {/* Amenities Switches */}
      <View style={styles.switchesGroup}>
        <Text style={[styles.fieldLabel, { color: currentTheme.textSecondary }]}>Room Amenities</Text>

        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: currentTheme.textPrimary }]}>Private Bathroom</Text>
          <Switch
            value={Boolean(room.privateBath)}
            onValueChange={(val) => onChange({ ...room, privateBath: val })}
            trackColor={{ false: currentTheme.surfaceSubtle, true: currentTheme.accent }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: currentTheme.textPrimary }]}>Utilities Included in Rent</Text>
          <Switch
            value={Boolean(room.utilitiesIncluded)}
            onValueChange={(val) => onChange({ ...room, utilitiesIncluded: val })}
            trackColor={{ false: currentTheme.surfaceSubtle, true: currentTheme.accent }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: currentTheme.textPrimary }]}>In-Unit Washer & Dryer</Text>
          <Switch
            value={Boolean(room.hasLaundry)}
            onValueChange={(val) => onChange({ ...room, hasLaundry: val })}
            trackColor={{ false: currentTheme.surfaceSubtle, true: currentTheme.accent }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: currentTheme.textPrimary }]}>Assigned Parking Available</Text>
          <Switch
            value={Boolean(room.hasParking)}
            onValueChange={(val) => onChange({ ...room, hasParking: val })}
            trackColor={{ false: currentTheme.surfaceSubtle, true: currentTheme.accent }}
          />
        </View>
      </View>

      {/* Photos Carousel & Add Button */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: currentTheme.textSecondary }]}>Room & Apartment Photos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosList}>
          {(room.photos || []).map((uri, idx) => (
            <View key={idx} style={styles.photoThumbWrapper}>
              <Image source={{ uri }} style={styles.photoThumb} />
              <TouchableOpacity
                style={styles.deletePhotoBtn}
                onPress={() => handleRemovePhoto(idx)}
                activeOpacity={0.7}
              >
                <Trash2 size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.addPhotoBtn, { borderColor: currentTheme.border, backgroundColor: currentTheme.surface }]}
            onPress={handlePickPhoto}
            activeOpacity={0.8}
          >
            <Plus size={20} color={currentTheme.accent} />
            <Text style={[styles.addPhotoText, { color: currentTheme.accent }]}>Add Photo</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingTop: 10,
  },
  headerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: theme.typography.fontHeadingBold,
  },
  fieldGroup: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: theme.typography.fontBodyMedium,
  },
  input: {
    borderRadius: theme.radii.control,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: theme.typography.fontBody,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  switchesGroup: {
    gap: 10,
    paddingVertical: 6,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  switchLabel: {
    fontSize: 14,
    fontFamily: theme.typography.fontBody,
  },
  photosList: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  photoThumbWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  deletePhotoBtn: {
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
  addPhotoBtn: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addPhotoText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: theme.typography.fontBodyMedium,
  },
});
