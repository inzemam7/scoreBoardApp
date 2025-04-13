import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FootballTournamentSetup = () => {
  const [matchDuration, setMatchDuration] = useState('');
  const [teams, setTeams] = useState('');
  const router = useRouter();

  const handleSetup = async () => {
    if (!matchDuration || !teams) {
      Alert.alert(
        'Missing Info',
        'Please fill all fields including match duration and number of teams.',
        [{ text: 'OK' }]
      );
      return;
    }

    await AsyncStorage.setItem('footballTournamentSetup', JSON.stringify({ matchDuration, teams }));
    router.push('/footballTeamSetup');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Football Tournament Setup</Text>
      <TextInput
        style={styles.input}
        placeholder="Match Duration (minutes)"
        keyboardType="numeric"
        value={matchDuration}
        onChangeText={setMatchDuration}
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

export default FootballTournamentSetup;

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