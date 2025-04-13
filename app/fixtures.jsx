import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const Fixtures = () => {
  const [teamPlayers, setTeamPlayers] = useState({});
  const [teamNames, setTeamNames] = useState({});
  const [fixtures, setFixtures] = useState([]);
  const [currentTeams, setCurrentTeams] = useState([]);
  const [round, setRound] = useState(1);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const playersData = await AsyncStorage.getItem('teamPlayers');
      const namesData = await AsyncStorage.getItem('teamNamesInput');

      if (playersData && namesData) {
        const parsedPlayers = JSON.parse(playersData);
        const parsedNames = JSON.parse(namesData);
        setTeamPlayers(parsedPlayers);
        setTeamNames(parsedNames);
        setCurrentTeams(Object.keys(parsedPlayers));
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (currentTeams.length > 0 && Object.keys(teamNames).length > 0) {
      generateFixtures(currentTeams);
    }
  }, [currentTeams, teamNames]);

  const generateFixtures = (teams) => {
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    const roundFixtures = [];

    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        roundFixtures.push([shuffled[i], shuffled[i + 1]]);
      } else {
        roundFixtures.push([shuffled[i], null]); // Bye
      }
    }

    setFixtures(roundFixtures);
  };

  const simulateWinners = () => {
    const winners = fixtures.map(([teamA, teamB]) => {
      if (!teamB) return teamA; // bye
      return Math.random() < 0.5 ? teamA : teamB;
    });

    if (winners.length === 1) {
      alert(`🏆 ${teamNames[winners[0]]} wins the tournament!`);
      setRound(1);
      setCurrentTeams(Object.keys(teamPlayers)); // Restart tournament
    } else {
      setRound((prev) => prev + 1);
      setCurrentTeams(winners);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Round {round} Fixtures</Text>
      {fixtures.map(([teamA, teamB], index) => (
        <View style={styles.fixtureCard} key={index}>
          <Text style={styles.fixtureText}>
            {teamNames[teamA]} vs {teamB ? teamNames[teamB] : 'BYE'}
          </Text>
          <TouchableOpacity
            style={styles.matchButton}
            onPress={() => {
              // Navigate to match screen and pass teams
              router.push({ pathname: '/matchScreen', params: { teamA, teamB } });
            }}
          >
            <Text style={styles.buttonText}>Start Match</Text>
          </TouchableOpacity>
        </View>
      ))}
      {fixtures.length > 0 && (
        <View style={styles.buttonContainer}>
          <Button title="Simulate Winners → Next Round" onPress={simulateWinners} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#222',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  fixtureCard: {
    backgroundColor: '#333',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  fixtureText: {
    fontSize: 18,
    marginBottom: 5,
    color: 'white',
  },
  matchButton: {
    backgroundColor: '#444',
    paddingVertical: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default Fixtures;
