import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const MatchHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const historyData = await AsyncStorage.getItem('matchHistory');
      if (historyData) {
        setHistory(JSON.parse(historyData));
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('Error fetching match history:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewMatchDetails = (match) => {
    router.push({
      pathname: '/matchScreen',
      params: {
        teamA: match.teamA,
        teamB: match.teamB,
        matchNumber: match.matchNumber || 1,
        isViewOnly: true,
        matchData: JSON.stringify(match)
      }
    });
  };

  const clearHistory = async () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to delete all match history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem('matchHistory');
            setHistory([]);
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Loading match history...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Match History</Text>

      <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
        <Text style={styles.clearButtonText}>Clear History</Text>
      </TouchableOpacity>

      {history.length === 0 ? (
        <Text style={styles.noDataText}>No matches played yet.</Text>
      ) : (
        history.map((match, index) => (
          <TouchableOpacity
            key={index}
            style={styles.matchCard}
            onPress={() => viewMatchDetails(match)}
          >
            <Text style={styles.matchText}>
              {match.teamA} vs {match.teamB}
            </Text>
            <Text style={styles.winnerText}>
              Winner: {match.winner}
            </Text>
            {match.innings && (
              <View style={styles.inningsContainer}>
                <Text style={styles.inningsText}>
                  {match.innings[0].team}: {match.innings[0].score}/{match.innings[0].wickets} ({match.innings[0].overs} ov)
                </Text>
                <Text style={styles.inningsText}>
                  {match.innings[1].team}: {match.innings[1].score}/{match.innings[1].wickets} ({match.innings[1].overs} ov)
                </Text>
              </View>
            )}
            <Text style={styles.dateText}>{match.playedOn}</Text>
          </TouchableOpacity>
        ))
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
    marginBottom: 10,
    color: 'white',
  },
  clearButton: {
    backgroundColor: '#a00',
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  clearButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  matchCard: {
    backgroundColor: '#333',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  matchText: {
    fontSize: 18,
    color: 'white',
    marginBottom: 5,
  },
  winnerText: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 8,
  },
  inningsContainer: {
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  inningsText: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  noDataText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
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

export default MatchHistory;
