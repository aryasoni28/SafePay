import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function PayPage({ navigation }) {
  const [amount, setAmount] = useState('');
  const [upiPin, setUpiPin] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');

  useEffect(() => {
    const fetchPhoneNumbers = async () => {
      try {
        const storedSenderPhone = await AsyncStorage.getItem('phoneNumber');
        const storedRecipientPhone = await AsyncStorage.getItem('recipientNumber');
        if (storedSenderPhone !== null) {
          setSenderPhone(storedSenderPhone);
        }
        if (storedRecipientPhone !== null) {
          setRecipientPhone(storedRecipientPhone);
        }
      } catch (error) {
        console.error('Error retrieving phone numbers:', error);
      }
    };

    fetchPhoneNumbers();
  }, []);

  const handlePay = async () => {
    if (!amount || !upiPin) {
      Alert.alert('Error', 'Please enter all details');
      return;
    }

    try {
      const response = await fetch('http://192.168.0.110:5000/process_payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_phone: senderPhone,
          recipient_phone: recipientPhone,
          amount,
          upi_pin: upiPin,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Payment processed successfully');
        // Navigate to a success or confirmation screen if needed
      } else {
        Alert.alert('Error', data.message || 'An error occurred');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Failed to process payment. Please check your connection and try again.');
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
          <Text style={styles.title}>Make Payment</Text>
        </View>

        <View style={styles.phoneNumbers}>
          <Text style={styles.phoneNumberText}>From: {senderPhone}</Text>
          <Text style={styles.phoneNumberText}>To: {recipientPhone}</Text>
        </View>

        <View style={styles.contentContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter Amount"
            placeholderTextColor="#a0a0a0"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Enter UPI PIN"
            placeholderTextColor="#a0a0a0"
            secureTextEntry
            keyboardType="numeric"
            value={upiPin}
            onChangeText={setUpiPin}
          />
          
          <TouchableOpacity style={styles.button} onPress={handlePay}>
            <Text style={styles.buttonText}>Pay Now</Text>
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
    marginBottom: 20,
  },
  phoneNumbers: {
    alignItems: 'center',
    marginBottom: 30,
  },
  phoneNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 20,
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