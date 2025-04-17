import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const FootballFixtures = () => {
  const [fixtures, setFixtures] = useState([]);
  const [matchDuration, setMatchDuration] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const setupData = await AsyncStorage.getItem('footballTournamentSetup');
      const teamData = await AsyncStorage.getItem('footballTeamData');
      if (setupData && teamData) {
        const { matchDuration } = JSON.parse(setupData);
        const teams = JSON.parse(teamData);
        setMatchDuration(parseInt(matchDuration));

        const shuffledTeams = shuffleArray(teams);
        const pairs = [];

        for (let i = 0; i < shuffledTeams.length; i += 2) {
          if (shuffledTeams[i + 1]) {
            pairs.push({
              teamA: shuffledTeams[i],
              teamB: shuffledTeams[i + 1],
            });
          }
        }

        setFixtures(pairs);
      }
    };

    fetchData();
  }, []);

  const handleMatchPress = (match) => {
    router.push({
      pathname: '/footballMatchscreen',
      params: {
        match: JSON.stringify(match),
        duration: matchDuration.toString(),
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Knockout Fixtures</Text>
      {fixtures.map((match, index) => (
        <TouchableOpacity
          key={index}
          style={styles.matchCard}
          onPress={() => handleMatchPress(match)}
        >
          <Text style={styles.matchText}>
            {match.teamA.teamName} vs {match.teamB.teamName}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default FootballFixtures;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightyellow',
    padding: 20,
  },
  title: {
    fontSize: 30,
    color: 'gold',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    borderColor: '#333',
    borderWidth: 1,
  },
  matchText: {
    fontSize: 22,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
