import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function ReportPage({ navigation }) {
  const [recipientPhoneNumber, setRecipientPhoneNumber] = useState('');
  const [description, setDescription] = useState('');
  const [senderPhoneNumber, setSenderPhoneNumber] = useState('');

  useEffect(() => {
    const fetchSenderPhoneNumber = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
        if (storedPhoneNumber) {
          setSenderPhoneNumber(storedPhoneNumber);
        }
      } catch (error) {
        console.error('Error retrieving sender phone number:', error);
      }
    };

    fetchSenderPhoneNumber();
  }, []);

  const handleSubmitReport = async () => {
    if (!recipientPhoneNumber || !description) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('http://192.168.0.110:5000/submit_report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderPhoneNumber,
          recipientPhoneNumber,
          description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Report submitted successfully');
        setRecipientPhoneNumber('');
        setDescription('');
      } else {
        Alert.alert('Error', data.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please check your connection and try again.');
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
          <Text style={styles.subtitle}>Report Fraud</Text>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.inputContainer}>
            <Ionicons name="person" size={24} color="#4a90e2" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Recipient's Phone Number"
              placeholderTextColor="#a0a0a0"
              keyboardType="phone-pad"
              value={recipientPhoneNumber}
              onChangeText={setRecipientPhoneNumber}
            />
          </View>

          <Text style={styles.descriptionLabel}>Describe how you've been cheated:</Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Description"
              placeholderTextColor="#a0a0a0"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmitReport}>
            <Text style={styles.buttonText}>Submit Report</Text>
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
  descriptionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  textAreaContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    marginBottom: 20,
  },
  textArea: {
    padding: 15,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 120,
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