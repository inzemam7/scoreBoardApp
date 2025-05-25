import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  SafeAreaView,
  ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';

// Helper function defined outside the component
const shuffleTeams = (teams) => {
  const shuffled = [...teams];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const MatchCard = React.memo(({ match, onPress, statusColor }) => (
  <TouchableOpacity
    style={[
      styles.matchCard,
      match.status === 'completed' && styles.completedCard
    ]}
    onPress={() => match.status !== 'completed' && onPress(match)}
    activeOpacity={match.status === 'completed' ? 1 : 0.7}
  >
    <View style={styles.matchHeader}>
      <Text style={styles.matchStatus}>({match.status.replace('_', ' ')})</Text>
      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
    </View>
    
    <Text style={styles.teamsText}>
      {match.teamA.teamName} vs {match.teamB.teamName}
    </Text>
    
    {match.status === 'completed' ? (
      <>
        <Text style={styles.scoreText}>
          {match.score.teamA} - {match.score.teamB}
        </Text>
        <Text style={styles.winnerText}>{match.winner}</Text>
      </>
    ) : (
      <Text style={styles.scheduledText}>
        {new Date(match.scheduledTime).toLocaleString()}
      </Text>
    )}
  </TouchableOpacity>
));

const FootballFixtures = () => {
  const [fixtures, setFixtures] = useState([]);
  const [matchDuration, setMatchDuration] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load tournament data on component mount
  useEffect(() => {
    loadTournamentData();
  }, []);

  // Create fixture pairs from teams
  const createFixtures = useCallback((teams, round) => {
    return teams.reduce((acc, team, index, array) => {
      if (index % 2 === 0 && array[index + 1]) {
        acc.push({
          id: `${round}-${index/2}`,
          teamA: {
            teamName: team.teamName,
            players: team.players
          },
          teamB: {
            teamName: array[index + 1].teamName,
            players: array[index + 1].players
          },
          status: 'upcoming',
          score: { teamA: 0, teamB: 0 },
          round,
          scheduledTime: new Date(Date.now() + (index * 30 * 60000)),
        });
      }
      return acc;
    }, []);
  }, []);

  // Get winners from a specific round
  const getRoundWinners = useCallback((matches, round) => {
    return matches
      .filter(match => match.round === round && match.status === 'completed')
      .map(match => {
        // Extract the winning team's name from the winner text
        let winnerName = match.winner;
        if (winnerName.includes(' Wins')) {
          winnerName = winnerName.split(' Wins')[0];
        } else if (winnerName.includes(' Wins on Penalties')) {
          winnerName = winnerName.split(' Wins on Penalties')[0];
        }

        // Determine which team won based on the score
        let winningTeam;
        if (match.score.teamA > match.score.teamB) {
          winningTeam = match.teamA;
        } else if (match.score.teamB > match.score.teamA) {
          winningTeam = match.teamB;
        } else {
          // For penalty shootouts, use the winner text to determine the winning team
          winningTeam = match.teamA.teamName === winnerName ? match.teamA : match.teamB;
        }
        
        return {
          teamName: winningTeam.teamName,
          players: winningTeam.players || []
        };
      });
  }, []);

  // Load tournament data
  const loadTournamentData = useCallback(async () => {
    try {
      setLoading(true);
      const [setupData, teamData, roundData, fixturesData] = await Promise.all([
        AsyncStorage.getItem('footballTournamentSetup'),
        AsyncStorage.getItem('footballTeamData'),
        AsyncStorage.getItem('footballCurrentRound'),
        AsyncStorage.getItem('footballFixtures')
      ]);

      if (!setupData || !teamData) {
        Alert.alert('Error', 'Missing tournament data');
        router.back();
        return;
      }

      const { matchDuration } = JSON.parse(setupData);
      const teams = JSON.parse(teamData);
      const savedRound = roundData ? parseInt(roundData) : 1;

      setMatchDuration(Math.max(1, parseInt(matchDuration))); // Ensure minimum 1 minute
      setCurrentRound(savedRound);

      // Use existing fixtures if available
      if (fixturesData) {
        setFixtures(JSON.parse(fixturesData));
        return;
      }

      // Create new fixtures if none exist
      const initialFixtures = createFixtures(shuffleTeams(teams), savedRound);
      await AsyncStorage.setItem('footballFixtures', JSON.stringify(initialFixtures));
      setFixtures(initialFixtures);

    } catch (error) {
      console.error('Failed to load tournament:', error);
      Alert.alert('Error', 'Failed to load tournament data');
    } finally {
      setLoading(false);
    }
  }, [createFixtures, router]);

  // Update match status when returning from match screen
  useFocusEffect(
    useCallback(() => {
      const checkCompletedMatches = async () => {
        try {
          const [history, savedFixtures] = await Promise.all([
            AsyncStorage.getItem('footballMatchHistory'),
            AsyncStorage.getItem('footballFixtures')
          ]);

          if (!history || !savedFixtures) return;

          const matches = JSON.parse(history);
          const lastMatch = matches[matches.length - 1];
          if (!lastMatch) return;

          const currentFixtures = JSON.parse(savedFixtures);
          const updatedFixtures = currentFixtures.map(f => {
            if (
              (f.teamA.teamName === lastMatch.teamA && f.teamB.teamName === lastMatch.teamB) ||
              (f.teamA.teamName === lastMatch.teamB && f.teamB.teamName === lastMatch.teamA)
            ) {
              return {
                ...f,
                status: 'completed',
                score: lastMatch.score,
                winner: lastMatch.winner
              };
            }
            return f;
          });

          await AsyncStorage.setItem('footballFixtures', JSON.stringify(updatedFixtures));
          setFixtures(updatedFixtures);
        } catch (error) {
          console.error('Error updating match status:', error);
        }
      };

      checkCompletedMatches();
    }, [])
  );

  // Helper functions
  const getRoundTitle = () => {
    const teamCount = fixtures.length * 2;
    if (teamCount <= 2) return 'Final';
    if (teamCount <= 4) return 'Semi Finals';
    if (teamCount <= 8) return 'Quarter Finals';
    return `Round ${currentRound}`;
  };

  const getStatusColor = (status) => {
    return {
      upcoming: '#FFA000',  // Amber
      in_progress: '#2196F3', // Blue
      completed: '#4CAF50'   // Green
    }[status] || '#9E9E9E';  // Grey (default)
  };

  const handleMatchPress = async (match) => {
    // Double check to prevent completed matches from being started
    if (match.status === 'completed') {
      return;
    }
    
    try {
      const updatedFixtures = fixtures.map(f => {
        if (f.id === match.id) {
          return { ...f, status: 'in_progress' };
        }
        return f;
      });
      
      await AsyncStorage.setItem('footballFixtures', JSON.stringify(updatedFixtures));
      setFixtures(updatedFixtures);
      
      router.push({
        pathname: '/footballMatchscreen',
        params: {
          match: JSON.stringify(match),
          duration: matchDuration
        }
      });
    } catch (error) {
      console.error('Error starting match:', error);
      Alert.alert('Error', 'Failed to start match');
    }
  };

  const processNextRound = async () => {
    try {
      // Check if all matches are completed
      const allMatchesCompleted = fixtures.every(match => match.status === 'completed');
      if (!allMatchesCompleted) {
        Alert.alert('Incomplete Matches', 'Please complete all matches before proceeding to the next round.');
        return;
      }

      // Get winners from current round
      const winners = getRoundWinners(fixtures, currentRound);
      
      // Check if we have any winners
      if (winners.length === 0) {
        Alert.alert('No Winners', 'No winners found for the current round. Please complete the matches first.');
        return;
      }

      // Check if tournament is complete
      if (winners.length === 1) {
        Alert.alert(
          'Tournament Complete', 
          `${winners[0].teamName} has won the tournament!`,
          [
            { 
              text: 'View History',
              onPress: () => router.push('/footballMatchHistory')
            },
            {
              text: 'New Tournament',
              onPress: resetTournament
            }
          ]
        );
        return;
      }

      // Proceed to next round
      const nextRound = currentRound + 1;
      const nextRoundFixtures = createFixtures(winners, nextRound);
      
      // Save new round data
      await AsyncStorage.setItem('footballFixtures', JSON.stringify(nextRoundFixtures));
      await AsyncStorage.setItem('footballCurrentRound', String(nextRound));
      
      // Update state
      setFixtures(nextRoundFixtures);
      setCurrentRound(nextRound);

      // Show success message
      Alert.alert(
        'Round Complete',
        `Proceeding to ${getRoundTitle()} with ${winners.length} teams.`
      );
    } catch (error) {
      console.error('Error processing next round:', error);
      Alert.alert('Error', 'Failed to process next round');
    }
  };

  const resetTournament = async () => {
    try {
      // Clear all tournament data
      await AsyncStorage.removeItem('footballFixtures');
      await AsyncStorage.removeItem('footballCurrentRound');
      await AsyncStorage.removeItem('footballMatchHistory');
      
      // Get original team data
      const teamData = await AsyncStorage.getItem('footballTeamData');
      if (!teamData) {
        Alert.alert('Error', 'Could not find team data');
        return;
      }

      // Create new fixtures with original teams
      const teams = JSON.parse(teamData);
      const initialFixtures = createFixtures(shuffleTeams(teams), 1);
      
      // Save new tournament data
      await AsyncStorage.setItem('footballFixtures', JSON.stringify(initialFixtures));
      await AsyncStorage.setItem('footballCurrentRound', '1');
      
      // Update state
      setFixtures(initialFixtures);
      setCurrentRound(1);

      Alert.alert('Success', 'Tournament has been reset successfully.');
    } catch (error) {
      console.error('Error resetting tournament:', error);
      Alert.alert('Error', 'Failed to reset tournament');
    }
  };

  const clearTeamsData = async () => {
    try {
      await AsyncStorage.removeItem('footballTeamData');
      await AsyncStorage.removeItem('footballFixtures');
      await AsyncStorage.removeItem('footballCurrentRound');
      await AsyncStorage.removeItem('footballMatchHistory');
      
      setFixtures([]);
      setCurrentRound(1);
      
      Alert.alert('Success', 'All teams data has been cleared successfully.');
      router.push('/footballTeamSetup');
    } catch (error) {
      console.error('Error clearing teams data:', error);
      Alert.alert('Error', 'Failed to clear teams data');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="gold" />
        <Text style={styles.loadingText}>Loading Tournament...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{getRoundTitle()}</Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={processNextRound}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Next Round</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push('/footballMatchHistory')}
          >
            <Text style={styles.secondaryButtonText}>History</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetTournament}
          >
            <Text style={styles.buttonText}>Reset Tournament</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={clearTeamsData}
          >
            <Text style={styles.buttonText}>Clear Teams</Text>
          </TouchableOpacity>
        </View>

        {fixtures.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No fixtures scheduled</Text>
          </View>
        ) : (
          fixtures.map((match) => (
            <MatchCard 
              key={match.id}
              match={match}
              onPress={handleMatchPress}
              statusColor={getStatusColor(match.status)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'lightyellow'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightyellow'
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#333'
  },
  container: {
    padding: 20,
    paddingBottom: 40
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25
  },
  actionButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    flex: 1,
    marginRight: 10,
    alignItems: 'center'
  },
  secondaryButton: {
    backgroundColor: 'gold',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  secondaryButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16
  },
  matchCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  completedCard: {
    backgroundColor: '#F5F5F5',
    borderColor: '#4CAF50',
    opacity: 0.8  // Add slight opacity to indicate it's not interactive
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  matchStatus: {
    color: '#757575',
    fontSize: 14
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  teamsText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 10,
    color: '#333'
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2196F3',
    marginVertical: 5
  },
  winnerText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#4CAF50',
    fontWeight: '500',
    marginTop: 5
  },
  scheduledText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#757575',
    marginTop: 10
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40
  },
  emptyText: {
    fontSize: 18,
    color: '#757575',
    marginBottom: 20
  },
  resetButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10
  },
  clearButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10
  }
});

export default FootballFixtures;