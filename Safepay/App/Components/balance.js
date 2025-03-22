import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function BalancePage({ navigation }) {
  const [upiPin, setUpiPin] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    getPhoneNumber();
  }, []);

  const getPhoneNumber = async () => {
    try {
      const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
      if (storedPhoneNumber !== null) {
        setPhoneNumber(storedPhoneNumber);
      }
    } catch (error) {
      console.error('Error retrieving phone number:', error);
    }
  };

  const handleCheckBalance = async () => {
    try {
      const response = await fetch('http://192.168.0.110:5000/check_balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          upiPin: upiPin,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data.balance !== undefined) {
        Alert.alert('Balance', `Your balance is: ${data.balance}`);
      } else {
        Alert.alert('Error', data.message || 'Unable to retrieve balance');
      }

    } catch (error) {
      console.error('Error checking balance:', error);
      Alert.alert('Error', 'Error checking balance. Please try again.');
    }
  };

  return (
    <LinearGradient
      colors={['#4a90e2', '#63a4ff']}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={styles.title}>SafePay</Text>
          <Text style={styles.subtitle}>Check Balance</Text>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Phone Number</Text>
            <Text style={styles.phoneNumber}>{phoneNumber}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={24} color="#4a90e2" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter UPI PIN"
              placeholderTextColor="#a0a0a0"
              secureTextEntry
              keyboardType="numeric"
              value={upiPin}
              onChangeText={setUpiPin}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleCheckBalance}>
            <Text style={styles.buttonText}>Check Balance</Text>
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
  topSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
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
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    color: '#4a90e2',
    marginBottom: 5,
  },
  phoneNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    marginBottom: 20,
    paddingHorizontal: 15,
    width: '100%',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#4a90e2',
    fontSize: 18,
    fontWeight: 'bold',
  },
});