import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { X, ShieldCheck, MapPin, DollarSign, FileCheck, Eye } from 'lucide-react-native';
import { theme } from '../../theme/tokens';

interface SafetyGuidelinesModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SafetyGuidelinesModal: React.FC<SafetyGuidelinesModalProps> = ({
  visible,
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentTheme = isDark ? theme.dark : theme.light;

  const guidelines = [
    {
      icon: MapPin,
      title: 'Meet in a Public Space First',
      desc: 'Always conduct your initial roommate chat at a daytime public venue, such as a local café or park, before visiting an apartment alone.',
    },
    {
      icon: DollarSign,
      title: 'Never Wire Upfront Cash',
      desc: 'Never transfer funds via Western Union, crypto, or gift cards before viewing the property and signing a legitimate lease agreement.',
    },
    {
      icon: FileCheck,
      title: 'Verify the Master Lease & ID',
      desc: 'Confirm the landlord’s written approval for subletting or adding co-tenants. Ask to review the official lease agreement.',
    },
    {
      icon: Eye,
      title: 'Trust Your Gut Feeling',
      desc: 'Sharing living quarters requires mutual respect. If living habits or responses feel inconsistent, feel empowered to walk away.',
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: currentTheme.border }]}>
          <View style={styles.titleRow}>
            <ShieldCheck size={20} color={currentTheme.verified} />
            <Text style={[styles.headerTitle, { color: currentTheme.textPrimary }]}>
              Roommate Safety Principles
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <X size={20} color={currentTheme.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
          <Text style={[styles.leadText, { color: currentTheme.textSecondary }]}>
            Split is designed for trustworthy roommate pairing. Follow these core safety principles whenever connecting with potential flatmates.
          </Text>

          <View style={styles.guidelinesList}>
            {guidelines.map((item, index) => {
              const Icon = item.icon;
              return (
                <View
                  key={index}
                  style={[
                    styles.card,
                    {
                      backgroundColor: currentTheme.surface,
                      borderColor: currentTheme.border,
                    },
                  ]}
                >
                  <View style={[styles.iconBox, { backgroundColor: currentTheme.surfaceSubtle }]}>
                    <Icon size={20} color={currentTheme.accent} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { color: currentTheme.textPrimary }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.cardDesc, { color: currentTheme.textSecondary }]}>
                      {item.desc}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View
            style={[
              styles.noticeBox,
              { backgroundColor: currentTheme.surfaceSubtle, borderColor: currentTheme.border },
            ]}
          >
            <Text style={[styles.noticeTitle, { color: currentTheme.textPrimary }]}>
              Notice suspicious behavior?
            </Text>
            <Text style={[styles.noticeText, { color: currentTheme.textMuted }]}>
              Use the "Report or Block" button on any profile or in your direct chat to immediately purge that user from your feed and matches.
            </Text>
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: theme.typography.fontHeadingBold,
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    padding: 20,
    paddingBottom: 40,
  },
  leadText: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: theme.typography.fontBody,
    marginBottom: 20,
  },
  guidelinesList: {
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    gap: 14,
    padding: 16,
    borderRadius: theme.radii.control,
    borderWidth: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: theme.typography.fontHeadingBold,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: theme.typography.fontBody,
  },
  noticeBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: theme.radii.control,
    borderWidth: 1,
    gap: 4,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: theme.typography.fontHeading,
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: theme.typography.fontBody,
  },
});
