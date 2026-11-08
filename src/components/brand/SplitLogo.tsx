import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { theme } from '../../theme/tokens';

interface SplitLogoProps {
  size?: number;
  showWordmark?: boolean;
  isDark?: boolean;
}

export const SplitLogo: React.FC<SplitLogoProps> = ({
  size = 32,
  showWordmark = true,
  isDark = false,
}) => {
  const currentTheme = isDark ? theme.dark : theme.light;
  const pillarWidth = (size - 4) / 2;
  const height = size * 1.35;
  const cornerRadius = size * 0.18;

  return (
    <View style={styles.container}>
      <Svg width={size} height={height} viewBox={`0 0 ${size} ${height}`}>
        {/* Left Pillar */}
        <Rect
          x={0}
          y={0}
          width={pillarWidth}
          height={height}
          rx={cornerRadius}
          ry={cornerRadius}
          fill={currentTheme.accent}
        />
        {/* Right Pillar */}
        <Rect
          x={pillarWidth + 4}
          y={0}
          width={pillarWidth}
          height={height}
          rx={cornerRadius}
          ry={cornerRadius}
          fill={currentTheme.accent}
        />
      </Svg>
      {showWordmark && (
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.wordmark,
              { color: currentTheme.textPrimary },
            ]}
          >
            split
          </Text>
          <View
            style={[
              styles.dot,
              { backgroundColor: currentTheme.accent },
            ]}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordmark: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontFamily: theme.typography.fontHeadingBold,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginLeft: 3,
  },
});

