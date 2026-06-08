import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/shared/theme/theme';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react-native';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertOptions {
  title: string;
  message: string;
  type?: AlertType;
}

interface AlertContextType {
  showAlert: (title: string, message: string, type?: AlertType) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useCustomAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useCustomAlert debe usarse dentro de un AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [alertData, setAlertData] = useState<AlertOptions>({
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = (title: string, message: string, type: AlertType = 'info') => {
    setAlertData({ title, message, type });
    setVisible(true);
  };

  const hideAlert = () => {
    setVisible(false);
  };

  const getAlertConfig = (type: AlertType) => {
    switch (type) {
      case 'error':
        return { color: '#EF4444', icon: <AlertCircle color="#EF4444" size={40} /> }; // Rojo
      case 'success':
        return { color: '#10B981', icon: <CheckCircle2 color="#10B981" size={40} /> }; // Verde
      case 'warning':
        return { color: '#F59E0B', icon: <AlertTriangle color="#F59E0B" size={40} /> }; // Amarillo
      case 'info':
      default:
        return { color: Colors.dark.tint, icon: <Info color={Colors.dark.tint} size={40} /> }; // Cian Neón
    }
  };

  const config = getAlertConfig(alertData.type || 'info');

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}

      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
      >
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          style={styles.overlay}
        >
          <Animated.View
            entering={ZoomIn.duration(400).springify()}
            exiting={ZoomOut.duration(300)}
            style={[styles.alertBox, { borderColor: config.color }]}
          >
            <LinearGradient
              colors={['rgba(15, 23, 42, 0.95)', 'rgba(2, 6, 23, 0.98)']}
              style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
            />

            {/* Glow sutil basado en el tipo */}
            <View style={[styles.glow, { shadowColor: config.color }]} />

            <View style={styles.iconContainer}>
              {config.icon}
            </View>

            <Text style={styles.title}>{alertData.title}</Text>
            <Text style={styles.message}>{alertData.message}</Text>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: config.color }]}
              onPress={hideAlert}
            >
              <Text style={styles.buttonText}>Aceptar</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    </AlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fondo difuminado oscuro
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertBox: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  glow: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    borderRadius: 20,
  },
  iconContainer: {
    marginBottom: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
    zIndex: 1,
  },
  message: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    zIndex: 1,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  buttonText: {
    color: '#020617',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
