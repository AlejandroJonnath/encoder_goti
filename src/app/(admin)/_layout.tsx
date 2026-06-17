import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { LayoutDashboard, Users, ClipboardList, LogOut } from 'lucide-react-native';
import { View, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { supabase } from '@/shared/services/supabase';

const ADMIN_COLOR = '#8B5CF6';

export default function AdminLayout() {
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Está seguro de desconectarse?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Desconectarse', 
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ADMIN_COLOR,
        tabBarInactiveTintColor: '#64748B',
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? [styles.iconContainer, styles.iconActive] : styles.iconContainer}>
              <LayoutDashboard size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Usuarios',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? [styles.iconContainer, styles.iconActive] : styles.iconContainer}>
              <Users size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: 'Logs',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? [styles.iconContainer, styles.iconActive] : styles.iconContainer}>
              <ClipboardList size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="signout"
        options={{
          title: 'Salir',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? [styles.iconContainer, styles.iconActive] : styles.iconContainer}>
              <LogOut size={22} color="#EF4444" />
            </View>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault(); // Evita navegar
            handleSignOut();
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0F172A',
    height: Platform.OS === 'ios' ? 88 : 78,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.2)',
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    paddingTop: 8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingHorizontal: 8,
  },
  iconActive: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  signOutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingHorizontal: 20,
  },
});
