import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Button, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const Fixtures = () => {
  const [teamPlayers, setTeamPlayers] = useState({});
  const [teamNames, setTeamNames] = useState({});
  const [fixtures, setFixtures] = useState([]);
  const [currentTeams, setCurrentTeams] = useState([]);
  const [round, setRound] = useState(1);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const playersData = await AsyncStorage.getItem('teamPlayers');
        const namesData = await AsyncStorage.getItem('teamNamesInput');

        // Debugging logs
        console.log("Retrieved playersData:", playersData);
        console.log("Retrieved namesData:", namesData);

        if (playersData && namesData) {
          const parsedPlayers = JSON.parse(playersData);
          const parsedNames = JSON.parse(namesData);
          setTeamPlayers(parsedPlayers);
          setTeamNames(parsedNames);
          setCurrentTeams(Object.keys(parsedPlayers));
        } else {
          Alert.alert('Error', 'Could not load teams data. Please check if the data is saved properly.');
        }
      } catch (error) {
        Alert.alert('Error', 'Error fetching team data: ' + error.message);
      } finally {
        setLoading(false); // Set loading to false after data fetch
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
      if (!teamB) return teamA; // Bye
      return Math.random() < 0.5 ? teamA : teamB; // Simulate winner
    });

    if (winners.length === 1) {
      Alert.alert(`🏆 ${teamNames[winners[0]]} wins the tournament!`);
      setRound(1);
      setCurrentTeams(Object.keys(teamPlayers)); // Restart tournament
    } else {
      setRound((prev) => prev + 1);
      setCurrentTeams(winners);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Loading fixtures...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Round {round} Fixtures</Text>
      {fixtures.map(([teamA, teamB], index) => (
        <View style={styles.fixtureCard} key={`${teamA}-${teamB}`}>
          <Text style={styles.fixtureText}>
            {teamNames[teamA]} vs {teamB ? teamNames[teamB] : 'BYE'}
          </Text>
          {teamA && teamB && (
            <TouchableOpacity
              style={styles.matchButton}
              onPress={() => {
                // Navigate to match screen and pass teams
                router.push({ pathname: '/matchScreen', query: { teamA, teamB } });
              }}
            >
              <Text style={styles.buttonText}>Start Match</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      {fixtures.length > 0 && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.matchButton} onPress={simulateWinners}>
            <Text style={styles.buttonText}>Simulate Winners → Next Round</Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  loadingText: {
    marginTop: 10,
    color: 'white',
  },
});

export default Fixtures;
