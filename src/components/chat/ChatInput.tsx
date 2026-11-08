import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import { ArrowUp } from 'lucide-react-native';
import { theme } from '../../theme/tokens';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled = false }) => {
  const [text, setText] = useState('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentTheme = isDark ? theme.dark : theme.light;

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: currentTheme.surface,
          borderTopColor: currentTheme.border,
        },
      ]}
    >
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: currentTheme.surfaceSubtle,
            borderColor: currentTheme.border,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: currentTheme.textPrimary },
          ]}
          placeholder="Type a message..."
          placeholderTextColor={currentTheme.textMuted}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={600}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: text.trim().length > 0 ? currentTheme.accent : currentTheme.border,
              opacity: text.trim().length > 0 ? 1 : 0.4,
            },
          ]}
          onPress={handleSend}
          disabled={!text.trim() || disabled}
          activeOpacity={0.8}
        >
          <ArrowUp size={16} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: Platform.OS === 'ios' ? 6 : 2,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.typography.fontBody,
    maxHeight: 100,
    paddingVertical: 6,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

