import { View, Text, StyleSheet, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OneoffScore = () => {
  const [matchData, setMatchData] = useState(null);

  useEffect(() => {
    const loadMatchData = async () => {
      try {
        const data = await AsyncStorage.getItem('matchData');
        if (data) {
          setMatchData(JSON.parse(data));
        }
      } catch (error) {
        console.error('Failed to load match data:', error);
      }
    };

    loadMatchData();
  }, []);

  if (!matchData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading match data...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Match Summary</Text>

      <Text style={styles.label}>Total Overs:</Text>
      <Text style={styles.value}>{matchData.overs}</Text>

      <Text style={styles.label}>Team 1: {matchData.team1.name}</Text>
      {matchData.team1.players.map((player, index) => (
        <Text key={`t1-${index}`} style={styles.player}>
          {index + 1}. {player}
        </Text>
      ))}

      <Text style={styles.label}>Team 2: {matchData.team2.name}</Text>
      {matchData.team2.players.map((player, index) => (
        <Text key={`t2-${index}`} style={styles.player}>
          {index + 1}. {player}
        </Text>
      ))}
    </ScrollView>
  );
};

export default OneoffScore;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'lightcyan',
    alignItems: 'flex-start',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    color: 'gray',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  label: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
  },
  value: {
    fontSize: 18,
    marginBottom: 10,
  },
  player: {
    fontSize: 16,
    marginLeft: 10,
    marginTop: 5,
  },
});
