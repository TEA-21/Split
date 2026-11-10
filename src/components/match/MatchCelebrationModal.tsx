import React from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MessageSquare, HeartHandshake, X } from 'lucide-react-native';
import { theme } from '../../theme/tokens';
import { useAppTheme } from '../../theme/useAppTheme';
import { useAppStore } from '../../store/useAppStore';

const { width } = Dimensions.get('window');

export const MatchCelebrationModal: React.FC = () => {
  const router = useRouter();
  const { isDark, currentTheme } = useAppTheme();

  const { activeMatch, currentUser, dismissMatchModal } = useAppStore();

  if (!activeMatch) return null;

  const matchedUser = activeMatch.matchedUser;

  const handleSendMessage = () => {
    const matchId = activeMatch.id;
    dismissMatchModal();
    router.push({
      pathname: '/chat/[id]',
      params: { id: matchId },
    });
  };

  return (
    <Modal visible={true} transparent animationType="fade" onRequestClose={dismissMatchModal}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.container,
            { backgroundColor: currentTheme.surface, borderColor: currentTheme.border },
          ]}
        >
          {/* Close corner button */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: currentTheme.surfaceSubtle }]}
            onPress={dismissMatchModal}
            activeOpacity={0.7}
          >
            <X size={16} color={currentTheme.textPrimary} />
          </TouchableOpacity>

          {/* Sparkles icon */}
          <View style={[styles.sparkleIcon, { backgroundColor: currentTheme.likeBg }]}>
            <HeartHandshake size={24} color={currentTheme.like} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: currentTheme.textPrimary }]}>
            It's a Match!
          </Text>

          <Text style={[styles.subtitle, { color: currentTheme.textSecondary }]}>
            You and {matchedUser.fullName.split(' ')[0]} are both interested in teaming up to split rent.
          </Text>

          {/* Overlapping Avatars */}
          <View style={styles.avatarRow}>
            <Image
              source={{ uri: currentUser.avatarUrl }}
              style={[styles.avatar, styles.avatarLeft, { borderColor: currentTheme.surface }]}
            />
            <Image
              source={{ uri: matchedUser.avatarUrl }}
              style={[styles.avatar, styles.avatarRight, { borderColor: currentTheme.surface }]}
            />
          </View>

          {/* Monthly Split preview */}
          <View style={[styles.splitBanner, { backgroundColor: currentTheme.surfaceSubtle }]}>
            <Text style={[styles.splitBannerLabel, { color: currentTheme.textMuted }]}>
              Estimated Split Target
            </Text>
            <Text style={[styles.splitBannerValue, { color: currentTheme.accent }]}>
              ₹{(matchedUser.room?.rentMonthly ?? matchedUser.budgetMax).toLocaleString('en-IN')}/mo split
            </Text>
          </View>

          {/* Action CTAs */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: currentTheme.accent }]}
              onPress={handleSendMessage}
              activeOpacity={0.85}
            >
              <MessageSquare size={16} color="#FFFFFF" strokeWidth={2.2} />
              <Text style={styles.primaryButtonText}>
                Say Hello to {matchedUser.fullName.split(' ')[0]}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={dismissMatchModal}
              activeOpacity={0.7}
            >
              <Text style={[styles.secondaryButtonText, { color: currentTheme.textSecondary }]}>
                Keep Browsing
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
    backgroundColor: 'rgba(25, 22, 20, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    borderRadius: theme.radii.card,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    fontFamily: theme.typography.fontHeadingBold,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: theme.typography.fontBody,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
  },
  avatarLeft: {
    marginRight: -16,
    zIndex: 1,
  },
  avatarRight: {
    marginLeft: -16,
    zIndex: 2,
  },
  splitBanner: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.radii.control,
    alignItems: 'center',
    marginBottom: 20,
  },
  splitBannerLabel: {
    fontSize: 11,
    fontFamily: theme.typography.fontBody,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  splitBannerValue: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: theme.typography.fontMono,
    marginTop: 2,
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 14,
    borderRadius: theme.radii.control,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: theme.typography.fontBodyMedium,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: theme.typography.fontBody,
  },
});

