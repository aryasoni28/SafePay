import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function OptionsPage({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [recipientNumber, setRecipientNumber] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [reportSummary, setReportSummary] = useState('');
  const [recipientInfo, setRecipientInfo] = useState({});

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
        if (storedPhoneNumber !== null) {
          setPhoneNumber(storedPhoneNumber);
          console.log('Stored phone number:', storedPhoneNumber);
        } else {
          console.log('No stored phone number found');
        }

        const storedRecipientNumber = await AsyncStorage.getItem('recipientNumber');
        if (storedRecipientNumber !== null) {
          setRecipientNumber(storedRecipientNumber);
          console.log('Stored recipient number:', storedRecipientNumber);
        } else {
          console.log('No stored recipient number found');
        }
      } catch (error) {
        console.error('Error retrieving phone number or recipient number:', error);
      }
    };

    fetchPhoneNumber();
  }, []);

  const handleScanQR = () => {
    console.log('Scan QR button pressed');
    // Implement QR scanning logic here
  };

  const handleSendMoney = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Sender phone number not available. Please log in again.');
      return;
    }

    if (!recipientNumber) {
      Alert.alert('Error', 'Please enter recipient\'s number');
      return;
    }

    console.log('Sender Phone:', phoneNumber);
    console.log('Recipient Phone:', recipientNumber);

    try {
      const response = await Promise.race([
        fetch('http://192.168.0.110:5000/initiate_transaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender_phone: phoneNumber,
            recipient_phone: recipientNumber,
          }),
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
      ]);

      if (response instanceof Error) {
        throw response;
      }

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        if (data.warning === 'high_report_count') {
          setReportSummary(data.report_summary);
          setRecipientInfo({
            name: data.recipient_name,
            bank: data.recipient_bank,
            reportCount: data.message.split(' ')[4]
          });
          setModalVisible(true);
        } else if (data.state === 'ready_to_transfer') {
          navigation.navigate('pay', {
            senderPhone: phoneNumber,
            recipientPhone: recipientNumber,
          });
        } else {
          Alert.alert('Transaction Failed', data.message || 'Unknown error occurred');
        }
      } else {
        Alert.alert('Error', data.message || 'An error occurred');
      }
    } catch (error) {
      console.error('Error initiating transaction:', error);
      if (error.message === 'Timeout') {
        Alert.alert('Error', 'App server is busy. Please try again later.');
      } else {
        Alert.alert('Error', 'Failed to initiate transaction. Please check your connection and try again.');
      }
    }
  };

  const handleRecipientNumberChange = async (number) => {
    setRecipientNumber(number);
    try {
      await AsyncStorage.setItem('recipientNumber', number);
    } catch (error) {
      console.error('Error storing recipient number:', error);
    }
  };

  const handleContinueTransaction = () => {
    setModalVisible(false);
    navigation.navigate('pay', {
      senderPhone: phoneNumber,
      recipientPhone: recipientNumber,
    });
  };

  const handleCancelTransaction = () => {
    setModalVisible(false);
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
          <Text style={styles.subtitle}>Send Money Securely</Text>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Phone Number</Text>
            <Text style={styles.phoneNumber}>{phoneNumber}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="person" size={24} color="#4a90e2" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Recipient's Number"
              placeholderTextColor="#a0a0a0"
              keyboardType="phone-pad"
              value={recipientNumber}
              onChangeText={handleRecipientNumberChange}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSendMoney}>
            <Text style={styles.buttonText}>Send Money</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleScanQR}>
            <Ionicons name="qr-code" size={24} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.secondaryButtonText}>Scan QR Code</Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Warning: High Report Count</Text>
              <Text style={styles.modalText}>Recipient: {recipientInfo.name}</Text>
              <Text style={styles.modalText}>Bank: {recipientInfo.bank}</Text>
              <Text style={styles.modalText}>Report Count: {recipientInfo.reportCount}</Text>
              <Text style={styles.modalText}>Summary: {reportSummary}</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.buttonCancel]}
                  onPress={handleCancelTransaction}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.buttonContinue]}
                  onPress={handleContinueTransaction}
                >
                  <Text style={styles.modalButtonText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    fontSize: 18,
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
    marginBottom: 20,
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
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: '100%',
  },
  buttonIcon: {
    marginRight: 10,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4a90e2',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 2,
  },
  buttonCancel: {
    backgroundColor: '#ff6b6b',
  },
  buttonContinue: {
    backgroundColor: '#4a90e2',
  },
  modalButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});