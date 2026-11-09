import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../theme/tokens';
import { useAppTheme } from '../../theme/useAppTheme';
import {
  SleepSchedule,
  WorkStyle,
  PetPolicy,
  SmokingPolicy,
  GuestPolicy,
} from '../../types';

interface LifestyleSelectorProps {
  cleanliness: number;
  sleep: SleepSchedule;
  work: WorkStyle;
  pets: PetPolicy;
  smoking: SmokingPolicy;
  guests: GuestPolicy;
  onChange: (key: string, value: any) => void;
}

export const LifestyleSelector: React.FC<LifestyleSelectorProps> = ({
  cleanliness,
  sleep,
  work,
  pets,
  smoking,
  guests,
  onChange,
}) => {
  const { isDark, currentTheme } = useAppTheme();

  const renderSegment = (
    label: string,
    currentValue: any,
    options: { value: any; label: string }[],
    fieldKey: string
  ) => (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, { color: currentTheme.textSecondary }]}>{label}</Text>
      <View style={styles.optionsRow}>
        {options.map((opt) => {
          const isSelected = currentValue === opt.value;
          return (
            <TouchableOpacity
              key={String(opt.value)}
              style={[
                styles.optionBtn,
                {
                  backgroundColor: isSelected ? currentTheme.accent : currentTheme.surface,
                  borderColor: isSelected ? currentTheme.accent : currentTheme.border,
                },
              ]}
              onPress={() => onChange(fieldKey, opt.value)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: isSelected ? '#FFFFFF' : currentTheme.textPrimary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Cleanliness Meter */}
      <View style={styles.fieldGroup}>
        <View style={styles.labelBetween}>
          <Text style={[styles.fieldLabel, { color: currentTheme.textSecondary }]}>
            Cleanliness Habit
          </Text>
          <Text style={[styles.cleanlinessVal, { color: currentTheme.accent }]}>
            {cleanliness} / 5
          </Text>
        </View>
        <View style={styles.optionsRow}>
          {[1, 2, 3, 4, 5].map((level) => {
            const isSelected = cleanliness === level;
            return (
              <TouchableOpacity
                key={level}
                style={[
                  styles.optionBtn,
                  {
                    backgroundColor: isSelected ? currentTheme.accent : currentTheme.surface,
                    borderColor: isSelected ? currentTheme.accent : currentTheme.border,
                  },
                ]}
                onPress={() => onChange('cleanlinessLevel', level)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: isSelected ? '#FFFFFF' : currentTheme.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Sleep Schedule */}
      {renderSegment(
        'Sleep Schedule',
        sleep,
        [
          { value: 'early_bird', label: 'Early Bird' },
          { value: 'night_owl', label: 'Night Owl' },
          { value: 'flexible', label: 'Flexible' },
        ],
        'sleepSchedule'
      )}

      {/* Work Style */}
      {renderSegment(
        'Work Setup',
        work,
        [
          { value: 'wfh', label: 'Remote / WFH' },
          { value: 'office', label: 'In Office' },
          { value: 'hybrid', label: 'Hybrid' },
          { value: 'student', label: 'Student' },
        ],
        'workStyle'
      )}

      {/* Pet Policy */}
      {renderSegment(
        'Pet Preference',
        pets,
        [
          { value: 'has_pets', label: 'Have Pets' },
          { value: 'pet_friendly', label: 'Pet Friendly' },
          { value: 'no_pets', label: 'No Pets' },
        ],
        'petPolicy'
      )}

      {/* Smoking Policy */}
      {renderSegment(
        'Smoking / Vaping',
        smoking,
        [
          { value: 'non_smoker', label: 'Non-Smoker' },
          { value: 'outside_only', label: 'Outside Only' },
          { value: 'smoker', label: 'Smoker' },
        ],
        'smokingPolicy'
      )}

      {/* Guest Policy */}
      {renderSegment(
        'Guest & Social Policy',
        guests,
        [
          { value: 'rarely', label: 'Quiet / Rarely' },
          { value: 'weekends', label: 'Weekends' },
          { value: 'flexible', label: 'Social / Flexible' },
        ],
        'guestPolicy'
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  fieldGroup: {
    gap: 8,
  },
  labelBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: theme.typography.fontBodyMedium,
  },
  cleanlinessVal: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: theme.typography.fontMono,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionBtn: {
    flex: 1,
    minWidth: 70,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.control,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 12,
    fontFamily: theme.typography.fontBody,
  },
});

