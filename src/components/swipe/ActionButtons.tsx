import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { RotateCcw, X, Star, Heart, Info } from 'lucide-react-native';
import { theme } from '../../theme/tokens';
import { useAppTheme } from '../../theme/useAppTheme';

interface ActionButtonsProps {
  onRewind: () => void;
  onPass: () => void;
  onSuperlike: () => void;
  onLike: () => void;
  onInfo: () => void;
  canRewind?: boolean;
  disabled?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onRewind,
  onPass,
  onSuperlike,
  onLike,
  onInfo,
  canRewind = true,
  disabled = false,
}) => {
  const { isDark, currentTheme } = useAppTheme();

  return (
    <View style={styles.container}>
      {/* Rewind Button */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.smallButton,
          {
            backgroundColor: currentTheme.surface,
            borderColor: currentTheme.border,
            opacity: canRewind && !disabled ? 1 : 0.4,
          },
        ]}
        onPress={onRewind}
        disabled={!canRewind || disabled}
        activeOpacity={0.7}
      >
        <RotateCcw size={18} color={currentTheme.rewind} strokeWidth={2.2} />
      </TouchableOpacity>

      {/* Pass (Nope) Button */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.largeButton,
          {
            backgroundColor: currentTheme.surface,
            borderColor: currentTheme.pass,
            opacity: disabled ? 0.4 : 1,
          },
        ]}
        onPress={onPass}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <X size={26} color={currentTheme.pass} strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Superlike Button */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.smallButton,
          {
            backgroundColor: currentTheme.surface,
            borderColor: currentTheme.superlike,
            opacity: disabled ? 0.4 : 1,
          },
        ]}
        onPress={onSuperlike}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Star size={20} color={currentTheme.superlike} strokeWidth={2.2} fill={currentTheme.superlike} />
      </TouchableOpacity>

      {/* Like Button */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.largeButton,
          {
            backgroundColor: currentTheme.surface,
            borderColor: currentTheme.like,
            opacity: disabled ? 0.4 : 1,
          },
        ]}
        onPress={onLike}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Heart size={26} color={currentTheme.like} strokeWidth={2.5} fill={currentTheme.like} />
      </TouchableOpacity>

      {/* Info Button */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.smallButton,
          {
            backgroundColor: currentTheme.surface,
            borderColor: currentTheme.border,
            opacity: disabled ? 0.4 : 1,
          },
        ]}
        onPress={onInfo}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Info size={18} color={currentTheme.textMuted} strokeWidth={2.2} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 14,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  smallButton: {
    width: 44,
    height: 44,
  },
  largeButton: {
    width: 58,
    height: 58,
  },
});

