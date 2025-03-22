import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomePage({ navigation }) {
  return (
    <LinearGradient
      colors={['#4a90e2', '#63a4ff']}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity 
          style={styles.aboutUsButton} 
          onPress={() => navigation.navigate('AboutUs')}
        >
          <Text style={styles.aboutUsButtonText}>i</Text>
        </TouchableOpacity>
        
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={styles.title}>SafePay</Text>
          <Text style={styles.subtitle}>The only place for safe and secure payments</Text>
        </View>
        
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.mainButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.mainButtonText}>Get Started</Text>
          </TouchableOpacity>
          
          <View style={styles.secondaryButtonsContainer}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.secondaryButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.secondaryButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.tertiaryButton} onPress={() => navigation.navigate('CreateAccount')}>
            <Text style={styles.tertiaryButtonText}>Create Bank Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4a90e2',
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  mainButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 20,
  },
  mainButtonText: {
    color: '#4a90e2',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
  },
  secondaryButton: {
    borderColor: '#fff',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  tertiaryButton: {
    marginTop: 10,
  },
  tertiaryButtonText: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  aboutUsButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  aboutUsButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});