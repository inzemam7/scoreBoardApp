import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FootballMatchHistory = () => {
  const [matchHistory, setMatchHistory] = useState([]);
  const [statistics, setStatistics] = useState({
    totalMatches: 0,
    totalGoals: 0,
    averageGoals: 0,
  });

  useEffect(() => {
    fetchMatchHistory();
  }, []);

  const fetchMatchHistory = async () => {
    try {
      const historyData = await AsyncStorage.getItem('footballMatchHistory');
      if (historyData) {
        const matches = JSON.parse(historyData);
        setMatchHistory(matches);
        
        // Calculate statistics
        const totalGoals = matches.reduce((sum, match) => 
          sum + match.score.teamA + match.score.teamB, 0);
        
        setStatistics({
          totalMatches: matches.length,
          totalGoals,
          averageGoals: matches.length > 0 ? (totalGoals / matches.length).toFixed(1) : 0,
        });
      }
    } catch (error) {
      console.error('Error fetching match history:', error);
    }
  };

  const clearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all match history? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('footballMatchHistory');
              setMatchHistory([]);
              setStatistics({
                totalMatches: 0,
                totalGoals: 0,
                averageGoals: 0,
              });
              Alert.alert('Success', 'Match history has been cleared');
            } catch (error) {
              console.error('Error clearing match history:', error);
              Alert.alert('Error', 'Failed to clear match history');
            }
          }
        }
      ]
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const getRoundName = (round) => {
    switch (round) {
      case 1:
        return 'Quarter Finals';
      case 2:
        return 'Semi Finals';
      case 3:
        return 'Finals';
      default:
        return `Round ${round}`;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Match History</Text>
      
      {/* Clear History Button */}
      <TouchableOpacity 
        style={styles.clearButton} 
        onPress={clearHistory}
      >
        <Text style={styles.clearButtonText}>Clear History</Text>
      </TouchableOpacity>
      
      {/* Statistics Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{statistics.totalMatches}</Text>
          <Text style={styles.statLabel}>Total Matches</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{statistics.totalGoals}</Text>
          <Text style={styles.statLabel}>Total Goals</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{statistics.averageGoals}</Text>
          <Text style={styles.statLabel}>Avg. Goals</Text>
        </View>
      </View>

      {/* Match History List */}
      {matchHistory.map((match, index) => (
        <View key={index} style={styles.matchCard}>
          <Text style={styles.matchDate}>{formatDate(match.date)}</Text>
          <Text style={styles.roundName}>{getRoundName(match.round)}</Text>
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
            Winner: {match.winner}
          </Text>
          {match.penaltyShootout && (
            <Text style={styles.penaltyText}>
              Penalties: {match.penaltyShootout.teamAScore}-{match.penaltyShootout.teamBScore}
            </Text>
          )}
        </View>
      ))}

      {matchHistory.length === 0 && (
        <Text style={styles.noMatches}>No match history available</Text>
      )}
    </ScrollView>
  );
};

export default FootballMatchHistory;

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
  clearButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  matchDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  roundName: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
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
    color: '#2196F3',
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