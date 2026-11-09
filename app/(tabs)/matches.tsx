import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, MessageSquareDashed } from 'lucide-react-native';
import { theme } from '../../src/theme/tokens';
import { useAppTheme } from '../../src/theme/useAppTheme';
import { useAppStore } from '../../src/store/useAppStore';
import { MatchItem } from '../../src/types';

export default function MatchesScreen() {
  const router = useRouter();
  const { isDark, currentTheme } = useAppTheme();

  const { matches, loadMatches } = useAppStore();

  useEffect(() => {
    loadMatches();
  }, []);

  const handleOpenChat = (match: MatchItem) => {
    router.push({
      pathname: '/chat/[id]',
      params: { id: match.id },
    });
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const newMatchesOnly = matches.filter((m) => !m.lastMessage);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: currentTheme.border }]}>
        <Text style={[styles.headerTitle, { color: currentTheme.textPrimary }]}>
          Matches & Messages
        </Text>
      </View>

      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: currentTheme.accentMuted }]}>
            <MessageSquareDashed size={28} color={currentTheme.accent} />
          </View>
          <Text style={[styles.emptyTitle, { color: currentTheme.textPrimary }]}>
            No Matches Yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: currentTheme.textSecondary }]}>
            Head to the Discover tab and swipe right on potential flatmates. When they like you back, you can chat here!
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
          {/* New Matches Carousel */}
          {newMatchesOnly.length > 0 && (
            <View style={styles.carouselSection}>
              <Text style={[styles.sectionHeading, { color: currentTheme.textMuted }]}>
                NEW MATCHES ({newMatchesOnly.length})
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselContent}
              >
                {newMatchesOnly.map((match) => (
                  <TouchableOpacity
                    key={match.id}
                    style={styles.newMatchItem}
                    onPress={() => handleOpenChat(match)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.newMatchAvatarRing,
                        { borderColor: currentTheme.accent },
                      ]}
                    >
                      <Image
                        source={{ uri: match.matchedUser.avatarUrl }}
                        style={styles.newMatchAvatar}
                      />
                    </View>
                    <Text
                      style={[styles.newMatchName, { color: currentTheme.textPrimary }]}
                      numberOfLines={1}
                    >
                      {match.matchedUser.fullName.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Messages Section */}
          <View style={styles.messagesSection}>
            <Text style={[styles.sectionHeading, { color: currentTheme.textMuted }]}>
              CONVERSATIONS ({matches.length})
            </Text>

            <View style={styles.conversationsList}>
              {matches.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.conversationRow,
                    { borderBottomColor: currentTheme.border },
                  ]}
                  onPress={() => handleOpenChat(item)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: item.matchedUser.avatarUrl }}
                    style={styles.convoAvatar}
                  />

                  <View style={styles.convoCenter}>
                    <View style={styles.convoTopLine}>
                      <View style={styles.nameRow}>
                        <Text style={[styles.convoName, { color: currentTheme.textPrimary }]}>
                          {item.matchedUser.fullName}
                        </Text>
                        {item.matchedUser.verifiedEmail && (
                          <CheckCircle
                            size={14}
                            color={currentTheme.verified}
                            fill={currentTheme.verified}
                          />
                        )}
                      </View>
                      <Text style={[styles.convoTime, { color: currentTheme.textMuted }]}>
                        {formatTimestamp(item.lastMessageTimestamp || item.createdAt)}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.convoSnippet,
                        {
                          color:
                            item.unreadCount > 0
                              ? currentTheme.textPrimary
                              : currentTheme.textSecondary,
                          fontWeight: item.unreadCount > 0 ? '600' : '400',
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {item.lastMessage || 'Matched! Tap to send a message...'}
                    </Text>
                  </View>

                  {item.unreadCount > 0 && (
                    <View style={[styles.unreadDot, { backgroundColor: currentTheme.accent }]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: theme.typography.fontHeadingBold,
    letterSpacing: -0.4,
  },
  scrollBody: {
    paddingBottom: 40,
  },
  carouselSection: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    fontFamily: theme.typography.fontBodyMedium,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  carouselContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  newMatchItem: {
    alignItems: 'center',
    width: 68,
  },
  newMatchAvatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newMatchAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  newMatchName: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: theme.typography.fontBodyMedium,
    marginTop: 6,
    textAlign: 'center',
  },
  messagesSection: {
    paddingTop: 18,
  },
  conversationsList: {
    paddingHorizontal: 20,
  },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  convoAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
  },
  convoCenter: {
    flex: 1,
  },
  convoTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  convoName: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: theme.typography.fontHeadingBold,
  },
  convoTime: {
    fontSize: 11,
    fontFamily: theme.typography.fontMono,
  },
  convoSnippet: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: theme.typography.fontBody,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: theme.typography.fontHeadingBold,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: theme.typography.fontBody,
  },
});
