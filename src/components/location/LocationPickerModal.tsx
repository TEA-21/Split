import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { X, Navigation, Check, MapPin } from 'lucide-react-native';
import { theme } from '../../theme/tokens';
import { useAppStore } from '../../store/useAppStore';
import { LOCATION_PRESETS, getCurrentDeviceLocation } from '../../services/locationService';
import { Coordinates } from '../../types';

export const LocationPickerModal: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentTheme = isDark ? theme.dark : theme.light;

  const {
    filters,
    setFilters,
    isLocationModalVisible,
    setIsLocationModalVisible,
  } = useAppStore();

  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const handleSelectPreset = (preset: { name: string; coordinates: Coordinates }) => {
    setGpsError(null);
    setFilters({
      referenceLocation: preset.coordinates,
      referenceLocationName: preset.name,
      isGpsActive: false,
    });
    setIsLocationModalVisible(false);
  };

  const handleUseGps = async () => {
    setIsLocating(true);
    setGpsError(null);
    const loc = await getCurrentDeviceLocation();
    setIsLocating(false);

    if (loc) {
      setFilters({
        referenceLocation: loc.coordinates,
        referenceLocationName: loc.name,
        isGpsActive: true,
      });
      setIsLocationModalVisible(false);
    } else {
      setGpsError('Could not access GPS. Please allow location permissions or select a city below.');
    }
  };

  return (
    <Modal
      visible={isLocationModalVisible}
      animationType="fade"
      transparent
      onRequestClose={() => setIsLocationModalVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: currentTheme.border }]}>
            <View>
              <Text style={[styles.title, { color: currentTheme.textPrimary }]}>Vicinity Location</Text>
              <Text style={[styles.subtitle, { color: currentTheme.textMuted }]}>
                Match roommates near your location or destination
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsLocationModalVisible(false)}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <X size={18} color={currentTheme.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* GPS Option */}
          <View style={styles.content}>
            <TouchableOpacity
              style={[
                styles.gpsButton,
                {
                  backgroundColor: filters.isGpsActive ? currentTheme.accentMuted : currentTheme.surfaceSubtle,
                  borderColor: filters.isGpsActive ? currentTheme.accent : currentTheme.border,
                },
              ]}
              onPress={handleUseGps}
              disabled={isLocating}
              activeOpacity={0.8}
            >
              <View style={styles.gpsRow}>
                {isLocating ? (
                  <ActivityIndicator size="small" color={currentTheme.accent} />
                ) : (
                  <Navigation size={18} color={currentTheme.accent} />
                )}
                <View style={styles.gpsTextCol}>
                  <Text style={[styles.gpsTitle, { color: currentTheme.textPrimary }]}>
                    Use Current GPS Vicinity
                  </Text>
                  <Text style={[styles.gpsSubtitle, { color: currentTheme.textSecondary }]}>
                    Find roommates within radius of where you stand right now
                  </Text>
                </View>
              </View>
              {filters.isGpsActive && <Check size={18} color={currentTheme.accent} />}
            </TouchableOpacity>

            {Boolean(gpsError) && (
              <Text style={[styles.errorText, { color: currentTheme.pass }]}>{gpsError}</Text>
            )}

            {/* Presets Header */}
            <Text style={[styles.presetsSectionTitle, { color: currentTheme.textMuted }]}>
              OR SELECT TARGET RELOCATION CITY
            </Text>

            {/* Presets List */}
            <View style={styles.presetsList}>
              {LOCATION_PRESETS.map((preset) => {
                const isSelected =
                  !filters.isGpsActive && filters.referenceLocationName === preset.name;
                return (
                  <TouchableOpacity
                    key={preset.name}
                    style={[
                      styles.presetItem,
                      {
                        borderBottomColor: currentTheme.border,
                        backgroundColor: isSelected ? currentTheme.surfaceSubtle : 'transparent',
                      },
                    ]}
                    onPress={() => handleSelectPreset(preset)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.presetLeft}>
                      <MapPin
                        size={15}
                        color={isSelected ? currentTheme.accent : currentTheme.textMuted}
                      />
                      <Text
                        style={[
                          styles.presetName,
                          {
                            color: isSelected ? currentTheme.accent : currentTheme.textPrimary,
                            fontWeight: isSelected ? '700' : '400',
                          },
                        ]}
                      >
                        {preset.name}
                      </Text>
                    </View>
                    {isSelected && <Check size={16} color={currentTheme.accent} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    borderRadius: theme.radii.card,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: theme.typography.fontHeadingBold,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: theme.typography.fontBody,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: theme.radii.control,
    borderWidth: 1,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  gpsTextCol: {
    flex: 1,
  },
  gpsTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: theme.typography.fontHeading,
  },
  gpsSubtitle: {
    fontSize: 12,
    fontFamily: theme.typography.fontBody,
    marginTop: 2,
  },
  errorText: {
    fontSize: 12,
    fontFamily: theme.typography.fontBody,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  presetsSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    fontFamily: theme.typography.fontBodyMedium,
    marginTop: 20,
    marginBottom: 8,
  },
  presetsList: {
    borderRadius: theme.radii.control,
    overflow: 'hidden',
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  presetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  presetName: {
    fontSize: 14,
    fontFamily: theme.typography.fontBody,
  },
});

