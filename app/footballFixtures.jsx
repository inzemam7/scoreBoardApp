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
              status: 'upcoming',
              score: { teamA: 0, teamB: 0 },
              scheduledTime: new Date(Date.now() + (i * 30 * 60000)), // Schedule matches 30 minutes apart
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return '#4CAF50';
      case 'in_progress':
        return '#FFC107';
      case 'completed':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
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
          <View style={styles.matchHeader}>
            <Text style={styles.matchNumber}>Match {index + 1}</Text>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(match.status) }]} />
          </View>
          <Text style={styles.matchText}>
            {match.teamA.teamName} vs {match.teamB.teamName}
          </Text>
          <Text style={styles.scheduledTime}>
            Scheduled: {formatDate(match.scheduledTime)}
          </Text>
          {match.status === 'completed' && (
            <Text style={styles.scoreText}>
              Score: {match.score.teamA} - {match.score.teamB}
            </Text>
          )}
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
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  matchNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  matchText: {
    fontSize: 22,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scheduledTime: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  scoreText: {
    fontSize: 18,
    color: '#2196F3',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
