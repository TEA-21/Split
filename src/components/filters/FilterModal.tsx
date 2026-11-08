import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { theme } from '../../theme/tokens';
import { useAppStore } from '../../store/useAppStore';
import { SearchFilters } from '../../types';

export const FilterModal: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentTheme = isDark ? theme.dark : theme.light;

  const {
    filters,
    setFilters,
    isFilterModalVisible,
    setIsFilterModalVisible,
  } = useAppStore();

  const [localFilters, setLocalFilters] = useState<SearchFilters>({ ...filters });

  const radiusOptions = [5, 10, 15, 25, 50];
  const cleanlinessOptions = [1, 2, 3, 4, 5];
  const budgetPresets = [
    { label: '< $1,000', min: 0, max: 1000 },
    { label: '$1,000 - $1,500', min: 1000, max: 1500 },
    { label: '$1,500 - $2,000', min: 1500, max: 2000 },
    { label: '$2,000+', min: 2000, max: 9999 },
    { label: 'Any Budget', min: 0, max: 9999 },
  ];

  const handleApply = () => {
    setFilters(localFilters);
    setIsFilterModalVisible(false);
  };

  const handleReset = () => {
    const defaultFilters: Partial<SearchFilters> = {
      userMode: 'all',
      budgetMin: 500,
      budgetMax: 2500,
      radiusMiles: 25,
      cleanlinessMin: 1,
      petFriendlyOnly: false,
      nonSmokerOnly: false,
    };
    setLocalFilters((prev) => ({ ...prev, ...defaultFilters }));
  };

  return (
    <Modal
      visible={isFilterModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setIsFilterModalVisible(false)}
    >
      <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: currentTheme.border }]}>
          <TouchableOpacity onPress={() => setIsFilterModalVisible(false)} style={styles.headerBtn}>
            <X size={20} color={currentTheme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: currentTheme.textPrimary }]}>Filters</Text>
          <TouchableOpacity onPress={handleReset} style={styles.headerBtn}>
            <Text style={[styles.resetText, { color: currentTheme.accent }]}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
          {/* Roommate Mode */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.textPrimary }]}>Candidate Mode</Text>
            <Text style={[styles.sectionSubtitle, { color: currentTheme.textMuted }]}>
              Choose who you want to see in your card deck
            </Text>

            <View style={styles.segmentedControl}>
              {(['all', 'have_room', 'need_room'] as const).map((mode) => {
                const isSelected = localFilters.userMode === mode;
                const labels = {
                  all: 'All',
                  have_room: 'Has Room',
                  need_room: 'Needs Room',
                };
                return (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.segmentButton,
                      {
                        backgroundColor: isSelected ? currentTheme.surface : 'transparent',
                        borderColor: isSelected ? currentTheme.accent : currentTheme.border,
                      },
                    ]}
                    onPress={() => setLocalFilters({ ...localFilters, userMode: mode })}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        {
                          color: isSelected ? currentTheme.accent : currentTheme.textSecondary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {labels[mode]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Search Radius */}
          <View style={[styles.section, { borderTopColor: currentTheme.border }]}>
            <View style={styles.rowBetween}>
              <Text style={[styles.sectionTitle, { color: currentTheme.textPrimary }]}>Maximum Distance</Text>
              <Text style={[styles.valueHighlight, { color: currentTheme.accent }]}>
                {localFilters.radiusMiles} miles
              </Text>
            </View>

            <View style={styles.optionsRow}>
              {radiusOptions.map((rad) => {
                const isSelected = localFilters.radiusMiles === rad;
                return (
                  <TouchableOpacity
                    key={rad}
                    style={[
                      styles.pillOption,
                      {
                        backgroundColor: isSelected ? currentTheme.accent : currentTheme.surface,
                        borderColor: isSelected ? currentTheme.accent : currentTheme.border,
                      },
                    ]}
                    onPress={() => setLocalFilters({ ...localFilters, radiusMiles: rad })}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        { color: isSelected ? '#FFFFFF' : currentTheme.textPrimary },
                      ]}
                    >
                      {rad} mi
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Budget Range Presets */}
          <View style={[styles.section, { borderTopColor: currentTheme.border }]}>
            <View style={styles.rowBetween}>
              <Text style={[styles.sectionTitle, { color: currentTheme.textPrimary }]}>Monthly Rent Split</Text>
              <Text style={[styles.valueHighlight, { color: currentTheme.accent }]}>
                ${localFilters.budgetMin} - ${localFilters.budgetMax === 9999 ? 'Any' : localFilters.budgetMax}
              </Text>
            </View>

            <View style={styles.presetsGrid}>
              {budgetPresets.map((preset) => {
                const isSelected =
                  localFilters.budgetMin === preset.min && localFilters.budgetMax === preset.max;
                return (
                  <TouchableOpacity
                    key={preset.label}
                    style={[
                      styles.budgetChip,
                      {
                        backgroundColor: isSelected ? currentTheme.accentMuted : currentTheme.surface,
                        borderColor: isSelected ? currentTheme.accent : currentTheme.border,
                      },
                    ]}
                    onPress={() =>
                      setLocalFilters({
                        ...localFilters,
                        budgetMin: preset.min,
                        budgetMax: preset.max,
                      })
                    }
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.budgetText,
                        {
                          color: isSelected ? currentTheme.accent : currentTheme.textPrimary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {preset.label}
                    </Text>
                    {isSelected && <Check size={14} color={currentTheme.accent} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Cleanliness Minimum */}
          <View style={[styles.section, { borderTopColor: currentTheme.border }]}>
            <View style={styles.rowBetween}>
              <Text style={[styles.sectionTitle, { color: currentTheme.textPrimary }]}>Cleanliness Minimum</Text>
              <Text style={[styles.valueHighlight, { color: currentTheme.accent }]}>
                Level {localFilters.cleanlinessMin}+
              </Text>
            </View>
            <Text style={[styles.sectionSubtitle, { color: currentTheme.textMuted }]}>
              1 (Relaxed) to 5 (Meticulously Tidy)
            </Text>

            <View style={styles.optionsRow}>
              {cleanlinessOptions.map((level) => {
                const isSelected = localFilters.cleanlinessMin === level;
                return (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.pillOption,
                      {
                        backgroundColor: isSelected ? currentTheme.accent : currentTheme.surface,
                        borderColor: isSelected ? currentTheme.accent : currentTheme.border,
                      },
                    ]}
                    onPress={() => setLocalFilters({ ...localFilters, cleanlinessMin: level })}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        { color: isSelected ? '#FFFFFF' : currentTheme.textPrimary },
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Toggle Switches */}
          <View style={[styles.section, { borderTopColor: currentTheme.border }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.textPrimary }]}>Lifestyle Dealbreakers</Text>

            <View style={styles.switchRow}>
              <View style={styles.switchTextCol}>
                <Text style={[styles.switchLabel, { color: currentTheme.textPrimary }]}>
                  Pet Friendly Only
                </Text>
                <Text style={[styles.switchSub, { color: currentTheme.textMuted }]}>
                  Only show users who have pets or welcome pets
                </Text>
              </View>
              <Switch
                value={localFilters.petFriendlyOnly}
                onValueChange={(val) => setLocalFilters({ ...localFilters, petFriendlyOnly: val })}
                trackColor={{ false: currentTheme.surfaceSubtle, true: currentTheme.accent }}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchTextCol}>
                <Text style={[styles.switchLabel, { color: currentTheme.textPrimary }]}>
                  Non-Smoker Only
                </Text>
                <Text style={[styles.switchSub, { color: currentTheme.textMuted }]}>
                  Hide all profiles where tobacco/vaping occurs
                </Text>
              </View>
              <Switch
                value={localFilters.nonSmokerOnly}
                onValueChange={(val) => setLocalFilters({ ...localFilters, nonSmokerOnly: val })}
                trackColor={{ false: currentTheme.surfaceSubtle, true: currentTheme.accent }}
              />
            </View>
          </View>
        </ScrollView>

        {/* Apply CTA footer */}
        <View style={[styles.footer, { backgroundColor: currentTheme.surface, borderTopColor: currentTheme.border }]}>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: currentTheme.accent }]}
            onPress={handleApply}
            activeOpacity={0.85}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  resetText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: theme.typography.fontBodyMedium,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    paddingVertical: 20,
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: theme.typography.fontHeadingBold,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: theme.typography.fontBody,
    marginTop: 2,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  valueHighlight: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: theme.typography.fontMono,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.control,
    borderWidth: 1,
  },
  segmentText: {
    fontSize: 13,
    fontFamily: theme.typography.fontBodyMedium,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  pillOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.control,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: theme.typography.fontBodyMedium,
  },
  presetsGrid: {
    gap: 8,
    marginTop: 8,
  },
  budgetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.radii.control,
    borderWidth: 1,
  },
  budgetText: {
    fontSize: 14,
    fontFamily: theme.typography.fontBodyMedium,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchTextCol: {
    flex: 1,
    paddingRight: 16,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: theme.typography.fontHeading,
  },
  switchSub: {
    fontSize: 12,
    fontFamily: theme.typography.fontBody,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  applyButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.control,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: theme.typography.fontBodyMedium,
  },
});

