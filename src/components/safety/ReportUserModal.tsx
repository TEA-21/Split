import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { X, ShieldAlert, Check } from 'lucide-react-native';
import { theme } from '../../theme/tokens';
import { useAppTheme } from '../../theme/useAppTheme';
import { RoommateProfile } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface ReportUserModalProps {
  targetProfile: RoommateProfile | null;
  visible: boolean;
  onClose: () => void;
}

export const ReportUserModal: React.FC<ReportUserModalProps> = ({
  targetProfile,
  visible,
  onClose,
}) => {
  const { isDark, currentTheme } = useAppTheme();

  const { reportAndBlockUser } = useAppStore();

  const reasons = [
    'Fake profile / Scam listing',
    'Inappropriate messages or photos',
    'Harassment or rude behavior',
    'Spam or commercial advertising',
    'Other safety concern',
  ];

  const [selectedReason, setSelectedReason] = useState(reasons[0]);
  const [details, setDetails] = useState('');
  const [isBlockChecked, setIsBlockChecked] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!targetProfile) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await reportAndBlockUser(
        targetProfile.id,
        selectedReason,
        details.trim() || undefined,
        isBlockChecked
      );
      Alert.alert(
        'Report Submitted',
        isBlockChecked
          ? `${targetProfile.fullName} has been reported and blocked. They will no longer appear in your feed or messages.`
          : `${targetProfile.fullName} has been reported. Thank you for keeping Split safe.`
      );
      onClose();
    } catch (e) {
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.dialog,
            { backgroundColor: currentTheme.surface, borderColor: currentTheme.border },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: currentTheme.border }]}>
            <View style={styles.titleRow}>
              <ShieldAlert size={18} color={currentTheme.pass} />
              <Text style={[styles.title, { color: currentTheme.textPrimary }]}>
                Report {targetProfile.fullName}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={currentTheme.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={[styles.label, { color: currentTheme.textSecondary }]}>
              Reason for Report
            </Text>

            <View style={styles.reasonsList}>
              {reasons.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.reasonItem,
                      {
                        backgroundColor: isSelected ? currentTheme.surfaceSubtle : 'transparent',
                        borderColor: isSelected ? currentTheme.accent : currentTheme.border,
                      },
                    ]}
                    onPress={() => setSelectedReason(reason)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.reasonText,
                        {
                          color: isSelected ? currentTheme.accent : currentTheme.textPrimary,
                          fontWeight: isSelected ? '600' : '400',
                        },
                      ]}
                    >
                      {reason}
                    </Text>
                    {isSelected && <Check size={14} color={currentTheme.accent} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Optional details */}
            <Text style={[styles.label, { color: currentTheme.textSecondary, marginTop: 12 }]}>
              Additional Details (Optional)
            </Text>
            <TextInput
              style={[
                styles.detailsInput,
                {
                  backgroundColor: currentTheme.surfaceSubtle,
                  borderColor: currentTheme.border,
                  color: currentTheme.textPrimary,
                },
              ]}
              placeholder="Tell us what occurred..."
              placeholderTextColor={currentTheme.textMuted}
              value={details}
              onChangeText={setDetails}
              multiline
              numberOfLines={2}
            />

            {/* Block toggle */}
            <View style={styles.blockRow}>
              <View style={styles.blockTextCol}>
                <Text style={[styles.blockLabel, { color: currentTheme.textPrimary }]}>
                  Block this user
                </Text>
                <Text style={[styles.blockSub, { color: currentTheme.textMuted }]}>
                  Instantly purges their profile and un-matches conversations
                </Text>
              </View>
              <Switch
                value={isBlockChecked}
                onValueChange={setIsBlockChecked}
                trackColor={{ false: currentTheme.surfaceSubtle, true: currentTheme.pass }}
              />
            </View>

            {/* Submit button */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: currentTheme.pass }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnText}>
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    borderRadius: theme.radii.card,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: theme.typography.fontHeadingBold,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.typography.fontBodyMedium,
    marginBottom: 8,
  },
  reasonsList: {
    gap: 6,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radii.control,
    borderWidth: 1,
  },
  reasonText: {
    fontSize: 13,
    fontFamily: theme.typography.fontBody,
  },
  detailsInput: {
    borderRadius: theme.radii.control,
    borderWidth: 1,
    padding: 10,
    fontSize: 13,
    fontFamily: theme.typography.fontBody,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 14,
  },
  blockTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  blockLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: theme.typography.fontHeading,
  },
  blockSub: {
    fontSize: 11,
    fontFamily: theme.typography.fontBody,
  },
  submitBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.control,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: theme.typography.fontBodyMedium,
  },
});

