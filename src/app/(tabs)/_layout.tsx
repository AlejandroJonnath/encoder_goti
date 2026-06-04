import { Tabs } from 'expo-router';
import React from 'react';
import { FileText, User } from 'lucide-react-native';

// Sección: Este archivo se encarga de crear el menú o barra de navegación que aparece pegada en la parte inferior de la pantalla dándole a los usuarios acceso rápido a las secciones principales

// Funciones: TabLayout sirve para definir los botones íconos y nombres de las pestañas inferiores así como para darles un color uniforme en toda la app principal

// Exportamos nuestro diseño de pestañas
export default function TabLayout() {
  // Retornamos el componente maestro de navegación inferior provisto por expo
  return (
    <Tabs
      // Le inyectamos opciones generales a toda la barra
      screenOptions={{
        // Decimos que el botón que esté seleccionado se pintará de azul marino profesional
        tabBarActiveTintColor: '#1E3A8A', // Professional Navy Blue
        // Escondemos la barra de títulos de arriba para tener diseño más limpio
        headerShown: false,
      }}>
      {/* Declaramos la primera pestaña (el inicio o catálogo de herramientas) */}
      <Tabs.Screen
        // Apunta al archivo index.tsx de esta misma carpeta
        name="index"
        // Le ponemos sus propias opciones visuales
        options={{
          // Nombre que sale debajo del icono
          title: 'Herramientas',
          // Dibujamos el ícono de archivo de texto que traemos de lucide-react-native
          tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
        }}
      />
      {/* Declaramos la segunda pestaña (la zona personal del usuario) */}
      <Tabs.Screen
        // Apunta al archivo profile.tsx de esta misma carpeta
        name="profile"
        // Sus configuraciones visuales
        options={{
          // Nombre a mostrar
          title: 'Perfil',
          // Dibujamos un ícono de una silueta de persona con el color respectivo según esté activa o no
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

// si quitas TabLayout pasa que perderás tu menú principal de abajo los usuarios no sabrán cómo navegar entre la pantalla de inicio y su perfil y quedarás con pantallas sueltas
