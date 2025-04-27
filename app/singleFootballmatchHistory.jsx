import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const SingleFootballMatchHistory = () => {
  const [matchHistory, setMatchHistory] = useState([]);
  const router = useRouter();

  useEffect(() => {
    loadMatchHistory();
  }, []);

  const loadMatchHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('footballSingleMatchHistory');
      if (history) {
        setMatchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading match history:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const viewMatchDetails = (match) => {
    router.push({
      pathname: '/footballSingleMatchHistory',
      params: {
        matchData: JSON.stringify(match),
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Match History</Text>
      
      {matchHistory.length === 0 ? (
        <Text style={styles.noMatches}>No match history available</Text>
      ) : (
        matchHistory.map((match, index) => (
          <TouchableOpacity
            key={index}
            style={styles.matchCard}
            onPress={() => viewMatchDetails(match)}
          >
            <Text style={styles.matchDate}>{formatDate(match.date)}</Text>
            <View style={styles.teamsContainer}>
              <Text style={styles.teamName}>{match.teamA}</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.score}>{match.score.teamA}</Text>
                <Text style={styles.scoreSeparator}>-</Text>
                <Text style={styles.score}>{match.score.teamB}</Text>
              </View>
              <Text style={styles.teamName}>{match.teamB}</Text>
            </View>
            <Text style={styles.winnerText}>
              {match.winner}
            </Text>
            {match.penaltyShootout && (
              <Text style={styles.penaltyText}>
                Penalties: {match.penaltyShootout.teamAScore}-{match.penaltyShootout.teamBScore}
              </Text>
            )}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

export default SingleFootballMatchHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'gold',
    marginBottom: 20,
    textAlign: 'center',
  },
  matchCard: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  matchDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  scoreSeparator: {
    fontSize: 20,
    marginHorizontal: 10,
    color: '#666',
  },
  winnerText: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 5,
  },
  penaltyText: {
    fontSize: 14,
    color: '#f44336',
    textAlign: 'center',
    marginTop: 5,
  },
  noMatches: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
}); 