import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const GullyMatchHistory = () => {
  const params = useLocalSearchParams();
  const matchData = params.matchData ? JSON.parse(params.matchData) : null;

  if (!matchData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No match data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Match Summary</Text>
        <Text style={styles.matchup}>{matchData.teamA} vs {matchData.teamB}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Match Result</Text>
        <Text style={styles.winner}>Winner: {matchData.winner}</Text>
        <Text style={styles.score}>
          {matchData.teamA}: {matchData.teamAScore}/{matchData.teamAWickets}
        </Text>
        <Text style={styles.score}>
          {matchData.teamB}: {matchData.teamBScore}/{matchData.teamBWickets}
        </Text>
        {matchData.isSuperOver && (
          <View style={styles.superOverSection}>
            <Text style={styles.superOverTitle}>Super Over</Text>
            <Text style={styles.score}>
              {matchData.superOverData.team1.score} vs {matchData.superOverData.team2.score}
            </Text>
          </View>
        )}
      </View>

      {matchData.battingStats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Batting Statistics</Text>
          {Object.entries(matchData.battingStats).map(([player, stats]) => (
            <View key={player} style={styles.statRow}>
              <Text style={styles.playerName}>{player}</Text>
              <Text style={styles.statText}>
                {stats.runs} runs ({stats.balls} balls)
              </Text>
            </View>
          ))}
        </View>
      )}

      {matchData.bowlingStats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bowling Statistics</Text>
          {Object.entries(matchData.bowlingStats).map(([player, stats]) => (
            <View key={player} style={styles.statRow}>
              <Text style={styles.playerName}>{player}</Text>
              <Text style={styles.statText}>
                {stats.wickets}/{stats.runs} ({Math.floor(stats.balls/6)}.{stats.balls%6} overs)
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Match Details</Text>
        <Text style={styles.detailText}>
          Toss: {matchData.tossWinner} won and chose to {matchData.tossDecision}
        </Text>
        <Text style={styles.detailText}>
          Played on: {matchData.playedOn}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
  },
  header: {
    padding: 20,
    backgroundColor: '#333',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  matchup: {
    fontSize: 20,
    color: 'white',
  },
  section: {
    backgroundColor: '#333',
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  winner: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 10,
  },
  score: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  playerName: {
    color: 'white',
    fontSize: 16,
  },
  statText: {
    color: '#4CAF50',
    fontSize: 16,
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  superOverSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  superOverTitle: {
    fontSize: 16,
    color: 'gold',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 5,
  },
});

export default GullyMatchHistory; 