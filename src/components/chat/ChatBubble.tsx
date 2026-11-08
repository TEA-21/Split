import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Check, CheckCheck } from 'lucide-react-native';
import { ChatMessage } from '../../types';
import { theme } from '../../theme/tokens';

interface ChatBubbleProps {
  message: ChatMessage;
  isSender: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isSender }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentTheme = isDark ? theme.dark : theme.light;

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <View
      style={[
        styles.container,
        isSender ? styles.senderContainer : styles.receiverContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isSender
            ? [styles.senderBubble, { backgroundColor: currentTheme.accent }]
            : [
                styles.receiverBubble,
                {
                  backgroundColor: currentTheme.surface,
                  borderColor: currentTheme.border,
                },
              ],
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: isSender ? '#FFFFFF' : currentTheme.textPrimary },
          ]}
        >
          {message.content}
        </Text>

        <View style={styles.footerRow}>
          <Text
            style={[
              styles.timeText,
              { color: isSender ? 'rgba(255,255,255,0.75)' : currentTheme.textMuted },
            ]}
          >
            {formatTime(message.createdAt)}
          </Text>
          {isSender && (
            message.readAt ? (
              <CheckCheck size={12} color="rgba(255,255,255,0.9)" />
            ) : (
              <Check size={12} color="rgba(255,255,255,0.6)" />
            )
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  senderContainer: {
    justifyContent: 'flex-end',
  },
  receiverContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  senderBubble: {
    borderBottomRightRadius: 4,
  },
  receiverBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
    fontFamily: theme.typography.fontBody,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
    fontFamily: theme.typography.fontMono,
  },
});

