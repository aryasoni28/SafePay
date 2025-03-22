import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function CreateBankAccountPage({ navigation }) {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [upiPin, setUpiPin] = useState('');
  const [balance, setBalance] = useState('');

  const handleCreateAccount = async () => {
    try {
      const response = await fetch('http://192.168.0.110:5000/create_account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          phoneNumber,
          bankName,
          upiPin,
          balance
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log('Account created successfully:', data);
        
        setName('');
        setPhoneNumber('');
        setBankName('');
        setUpiPin('');
        setBalance('');
  
        Alert.alert('Success', `Account created successfully! User ID: ${data.user_id}`);
      } else {
        throw new Error(data.message || 'Failed to create account');
      }
    } catch (error) {
      console.error('Error creating account:', error);
      Alert.alert('Error', `Failed to create account: ${error.message}`);
    }
  };
  
  return (
    <LinearGradient colors={['#4a90e2', '#63a4ff']} style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.topSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>S</Text>
            </View>
            <Text style={styles.title}>SafePay</Text>
            <Text style={styles.subtitle}>Create Bank Account</Text>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="person" size={24} color="#4a90e2" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#a0a0a0"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="call" size={24} color="#4a90e2" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#a0a0a0"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="business" size={24} color="#4a90e2" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Bank Name"
                placeholderTextColor="#a0a0a0"
                value={bankName}
                onChangeText={setBankName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={24} color="#4a90e2" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="UPI PIN"
                placeholderTextColor="#a0a0a0"
                secureTextEntry
                keyboardType="numeric"
                value={upiPin}
                onChangeText={setUpiPin}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="cash" size={24} color="#4a90e2" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Balance"
                placeholderTextColor="#a0a0a0"
                keyboardType="numeric"
                value={balance}
                onChangeText={setBalance}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
              <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
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
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    marginBottom: 20,
    paddingHorizontal: 15,
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