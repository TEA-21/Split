import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle, ShieldAlert } from 'lucide-react-native';
import { theme } from '../../src/theme/tokens';
import { useAppStore } from '../../src/store/useAppStore';
import { roommateService } from '../../src/services/roommateService';
import { ChatBubble } from '../../src/components/chat/ChatBubble';
import { ChatInput } from '../../src/components/chat/ChatInput';
import { ChatMessage, MatchItem } from '../../src/types';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentTheme = isDark ? theme.dark : theme.light;

  const { currentUser, matches, reportAndBlockUser } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [match, setMatch] = useState<MatchItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const currentMatch = matches.find((m) => m.id === id);
    if (currentMatch) {
      setMatch(currentMatch);
    }

    const loadMessages = async () => {
      if (!id) return;
      try {
        const msgs = await roommateService.getMessages(id);
        setMessages(msgs);
        await roommateService.markMessagesRead(id, currentUser.id);
      } catch (err) {
        console.error('Error loading chat messages:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    // Poll for mock auto-replies every 2.5 seconds
    const interval = setInterval(async () => {
      if (!id) return;
      const msgs = await roommateService.getMessages(id);
      setMessages((prev) => {
        if (msgs.length !== prev.length) {
          return msgs;
        }
        return prev;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [id, matches]);

  const handleSendMessage = async (text: string) => {
    if (!id) return;

    // Optimistic message append
    const tempMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      matchId: id,
      senderId: currentUser.id,
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);

    try {
      const savedMsg = await roommateService.sendMessage(id, currentUser.id, text);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempMsg.id ? savedMsg : m))
      );
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleReport = async () => {
    if (!match) return;
    await reportAndBlockUser(match.matchedUser.id, 'Chat safety concern', undefined, true);
    router.back();
  };

  if (!match && !isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: currentTheme.textSecondary }]}>
            Conversation not found.
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={{ color: currentTheme.accent }}>Return to matches</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const partner = match?.matchedUser;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      edges={['top', 'bottom']}
    >
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: currentTheme.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={currentTheme.textPrimary} />
        </TouchableOpacity>

        {partner && (
          <View style={styles.partnerInfo}>
            <Image source={{ uri: partner.avatarUrl }} style={styles.avatar} />
            <View>
              <View style={styles.nameRow}>
                <Text style={[styles.partnerName, { color: currentTheme.textPrimary }]}>
                  {partner.fullName}
                </Text>
                {partner.verifiedEmail && (
                  <CheckCircle size={14} color={currentTheme.verified} fill={currentTheme.verified} />
                )}
              </View>
              <Text style={[styles.partnerSub, { color: currentTheme.textMuted }]}>
                ${partner.room?.rentMonthly ?? partner.budgetMax}/mo split • {partner.locationName}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity onPress={handleReport} style={styles.reportBtn} activeOpacity={0.7}>
          <ShieldAlert size={18} color={currentTheme.pass} />
        </TouchableOpacity>
      </View>

      {/* Message List */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color={currentTheme.accent} />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyPrompt, { color: currentTheme.textMuted }]}>
              Say hello! Break the ice by discussing move-in dates or apartment hunting in {partner?.locationName}.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatBubble
                message={item}
                isSender={item.senderId === currentUser.id}
              />
            )}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}

        {/* Input Bar */}
        <ChatInput onSend={handleSendMessage} disabled={isLoading} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 6,
  },
  partnerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  partnerName: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: theme.typography.fontHeadingBold,
  },
  partnerSub: {
    fontSize: 11,
    fontFamily: theme.typography.fontBody,
  },
  reportBtn: {
    padding: 6,
  },
  chatArea: {
    flex: 1,
  },
  messageList: {
    paddingVertical: 14,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  emptyPrompt: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: theme.typography.fontBody,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 12,
  },
});
