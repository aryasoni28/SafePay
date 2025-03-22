import React from 'react';
import { StyleSheet, Text, View, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AboutUsPage({ navigation }) {
  const teamMembers = [
    { name: 'Suprith', image: require('./Team/suprith.jpeg') },
    { name: 'Sri Vidya', image: require('./Team/srividya.jpg') },
    { name: 'Soni Arya', image: require('./Team/arya.jpeg') },
    { name: 'Tushar Anil', image: require('./Team/tushar.jpeg') },
  ];

  return (
    <LinearGradient
      colors={['#4a90e2', '#63a4ff']}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <View style={styles.container}>
          <Text style={styles.title}>Meet the team behind SafePay</Text>

          <View style={styles.teamContainer}>
            <View style={styles.row}>
              {teamMembers.slice(0, 2).map((member, index) => (
                <View key={index} style={styles.memberContainer}>
                  <Image
                    source={member.image}
                    style={styles.image}
                  />
                  <Text style={styles.name}>{member.name}</Text>
                </View>
              ))}
            </View>
            <View style={styles.row}>
              {teamMembers.slice(2, 4).map((member, index) => (
                <View key={index} style={styles.memberContainer}>
                  <Image
                    source={member.image}
                    style={styles.image}
                  />
                  <Text style={styles.name}>{member.name}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>B.Tech-CSE, 4th Sem</Text>
            <Text style={styles.footerText}>PES University</Text>
          </View>
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
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  teamContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  memberContainer: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#fff',
    marginVertical: 5,
  },
});