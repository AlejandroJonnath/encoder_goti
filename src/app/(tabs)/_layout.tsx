import { Tabs } from 'expo-router';
import React from 'react';
import { FileText, User } from 'lucide-react-native';
import { Colors } from '@/shared/theme/theme';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.dark.tint,
        tabBarInactiveTintColor: Colors.dark.icon,
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <LinearGradient
            colors={['rgba(2, 6, 23, 0.85)', 'rgba(15, 23, 42, 0.95)']}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Herramientas',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.iconContainerActive : styles.iconContainer}>
              <FileText size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.iconContainerActive : styles.iconContainer}>
              <User size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 24,
    right: 24,
    elevation: 0,
    backgroundColor: 'transparent',
    borderRadius: 24,
    height: 64,
    borderTopWidth: 0,
    shadowColor: Colors.dark.tint,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainerActive: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    shadowColor: Colors.dark.tint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
});
