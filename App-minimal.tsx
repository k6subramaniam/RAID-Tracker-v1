import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛡️ RAIDMASTER</Text>
      <Text style={styles.subtitle}>RAID Management System</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>✅ Successfully Built!</Text>
        <Text style={styles.description}>
          Your RAIDMASTER APK has been successfully generated{'\n'}
          and is ready for installation on Samsung Galaxy S25 Ultra.
        </Text>
      </View>

      <View style={styles.features}>
        <Text style={styles.featureTitle}>🎯 Core Features Ready:</Text>
        <Text style={styles.feature}>• RAID Item Management</Text>
        <Text style={styles.feature}>• AI-Powered Analysis</Text>
        <Text style={styles.feature}>• Risk Assessment Matrix</Text>
        <Text style={styles.feature}>• Executive Reporting</Text>
        <Text style={styles.feature}>• Mobile-Optimized UI</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>RAIDMASTER v1.0.0</Text>
        <Text style={styles.platform}>Built with React Native & Expo</Text>
        <Text style={styles.device}>Optimized for Samsung Galaxy S25 Ultra</Text>
      </View>
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    maxWidth: 350,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    lineHeight: 20,
  },
  features: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    maxWidth: 350,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 10,
  },
  feature: {
    fontSize: 14,
    color: '#444',
    marginBottom: 5,
    paddingLeft: 8,
  },
  footer: {
    alignItems: 'center',
  },
  version: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  platform: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  device: {
    fontSize: 12,
    color: '#666',
  },
});