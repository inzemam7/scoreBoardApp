import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const cricTournamentSetup = () => {
  const [overs, setOvers] = useState('');
  const [teams, setTeams] = useState('');
  const router = useRouter();

  const handleSetup = async () => {
    if (!overs || !teams) {
      Alert.alert(
        'Missing Info',
        'Please fill all fields including number of overs and teams.',
        [{ text: 'OK' }]
      );
      return; // Stop the function from proceeding
    }

    await AsyncStorage.setItem('tournamentSetup', JSON.stringify({ overs, teams }));
    router.push('/teamSetup');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tournament Setup</Text>
      <TextInput
        style={styles.input}
        placeholder="Number of Overs"
        keyboardType="numeric"
        value={overs}
        onChangeText={setOvers}
      />
      <TextInput
        style={styles.input}
        placeholder="Number of Teams"
        keyboardType="numeric"
        value={teams}
        onChangeText={setTeams}
      />
      <TouchableOpacity style={styles.submitButton} onPress={handleSetup}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

export default cricTournamentSetup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightyellow',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    color: 'gold',
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  input: {
    width: 300,
    height: 60,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 50,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 20,
    backgroundColor: 'white',
  },
  submitButton: {
    backgroundColor: '#333',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginTop: 30,
    width: 300,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 35,
    fontWeight: 'bold',
  },
});