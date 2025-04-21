import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';

const MatchScoreboard = () => {
  const { matchId, team1, team2, matchDuration } = useLocalSearchParams();
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');
  const router = useRouter();

  const handleSaveScore = async () => {
    if (!score1 || !score2) {
      Alert.alert('Error', 'Please enter scores for both teams.', [{ text: 'OK' }]);
      return;
    }

    try {
      const matchResult = {
        matchId,
        team1,
        team2,
        score1: parseInt(score1),
        score2: parseInt(score2),
      };
      await AsyncStorage.setItem(`matchResult_${matchId}`, JSON.stringify(matchResult));
      Alert.alert('Success', 'Scores saved successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save scores.', [{ text: 'OK' }]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Match Scoreboard</Text>
      <Text style={styles.matchInfo}>
        {team1} vs {team2} ({matchDuration} minutes)
      </Text>
      <View style={styles.scoreContainer}>
        <TextInput
          style={styles.scoreInput}
          placeholder={`${team1} Score`}
          keyboardType="numeric"
          value={score1}
          onChangeText={setScore1}
        />
        <Text style={styles.vsText}>VS</Text>
        <TextInput
          style={styles.scoreInput}
          placeholder={`${team2} Score`}
          keyboardType="numeric"
          value={score2}
          onChangeText={setScore2}
        />
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveScore}>
        <Text style={styles.saveButtonText}>Save Scores</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MatchScoreboard;

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
    marginBottom: 20,
  },
  matchInfo: {
    fontSize: 20,
    color: '#333',
    marginBottom: 30,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  scoreInput: {
    width: 120,
    height: 50,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    backgroundColor: 'white',
    textAlign: 'center',
  },
  vsText: {
    fontSize: 20,
    color: '#333',
    marginHorizontal: 20,
  },
  saveButton: {
    backgroundColor: '#333',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    width: 300,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});