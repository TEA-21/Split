import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, Platform, View } from 'react-native';
import { Flame, MessageSquare, User } from 'lucide-react-native';
import { theme } from '../../src/theme/tokens';
import { useAppTheme } from '../../src/theme/useAppTheme';

export default function TabLayout() {
  const { currentTheme } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: currentTheme.accent,
        tabBarInactiveTintColor: currentTheme.textMuted,
        tabBarStyle: {
          backgroundColor: currentTheme.surface,
          borderTopColor: currentTheme.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          fontFamily: theme.typography.fontBodyMedium,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <Flame size={size || 22} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color, size }) => (
            <MessageSquare size={size || 22} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size || 22} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}

