import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
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
  const [winners, setWinners] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
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
    // If match is completed, show confirmation dialog
    if (match.status === 'completed') {
      Alert.alert(
        'Replay Match',
        'This match has already been completed. Do you want to play it again?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Play Again',
            onPress: () => {
              router.push({
                pathname: '/footballMatchscreen',
                params: {
                  match: JSON.stringify({
                    ...match,
                    round: currentRound,
                    isReplay: true
                  }),
                  duration: matchDuration.toString(),
                },
              });
            }
          }
        ]
      );
    } else {
      router.push({
        pathname: '/footballMatchscreen',
        params: {
          match: JSON.stringify({
            ...match,
            round: currentRound
          }),
          duration: matchDuration.toString(),
        },
      });
    }
  };

  const simulateNextRound = async () => {
    try {
      // Get match history to find winners
      const historyData = await AsyncStorage.getItem('footballMatchHistory');
      if (!historyData) {
        Alert.alert('Error', 'No completed matches to simulate from');
        return;
      }

      const matches = JSON.parse(historyData);
      // Filter matches from the current round
      const currentRoundMatches = matches.filter(match => match.round === currentRound);
      
      if (currentRoundMatches.length === 0) {
        Alert.alert('Error', 'No completed matches in the current round');
        return;
      }

      // Check if all matches in current round are completed
      const allMatchesCompleted = fixtures.every(fixture => 
        currentRoundMatches.some(match => 
          (match.teamA === fixture.teamA.teamName && match.teamB === fixture.teamB.teamName) ||
          (match.teamA === fixture.teamB.teamName && match.teamB === fixture.teamA.teamName)
        )
      );

      if (!allMatchesCompleted) {
        Alert.alert('Matches Pending', 'Please complete all matches before proceeding to the next round.');
        return;
      }

      // Extract winners from the current round matches
      const roundWinners = currentRoundMatches.map(match => {
        // Extract team name from winner text (e.g., "Team A Wins!" -> "Team A")
        const winnerText = match.winner;
        if (winnerText.includes('Wins')) {
          return winnerText.split(' Wins')[0];
        } else if (winnerText.includes('on Penalties')) {
          return winnerText.split(' Wins on Penalties')[0];
        }
        return null;
      }).filter(Boolean);

      // If only one winner remains, declare them the tournament winner
      if (roundWinners.length === 1) {
        Alert.alert(
          '🏆 Tournament Champion! 🏆',
          `Congratulations!\n\n${roundWinners[0]} has won the tournament!`,
          [
            { 
              text: 'View Match History',
              onPress: () => router.push('/footballMatchHistory')
            },
            {
              text: 'New Tournament',
              onPress: handleReturnToRound1
            }
          ]
        );
        return;
      }

      // Create new fixtures for the next round
      const shuffledWinners = shuffleArray(roundWinners);
      const newFixtures = [];

      for (let i = 0; i < shuffledWinners.length; i += 2) {
        if (shuffledWinners[i + 1]) {
          newFixtures.push({
            teamA: { teamName: shuffledWinners[i] },
            teamB: { teamName: shuffledWinners[i + 1] },
            status: 'upcoming',
            score: { teamA: 0, teamB: 0 },
            scheduledTime: new Date(Date.now() + (i * 30 * 60000)),
          });
        }
      }

      // Update state and storage
      setFixtures(newFixtures);
      setCurrentRound(prev => prev + 1);
      await AsyncStorage.setItem('footballCurrentRound', String(currentRound + 1));

      // Show next round fixtures
      const nextRoundName = getRoundName();
      Alert.alert(
        `Proceeding to ${nextRoundName}`,
        newFixtures.map((fixture, index) => 
          `Match ${index + 1}: ${fixture.teamA.teamName} vs ${fixture.teamB.teamName}`
        ).join('\n')
      );
    } catch (error) {
      console.error('Error simulating next round:', error);
      Alert.alert('Error', 'Failed to simulate next round');
    }
  };

  const handleReturnToRound1 = async () => {
    try {
      // Reset tournament state
      setCurrentRound(1);
      setFixtures([]);
      
      // Clear stored data
      await AsyncStorage.removeItem('footballMatchHistory');
      await AsyncStorage.removeItem('footballCurrentRound');
      
      // Load the original teams
      const teamData = await AsyncStorage.getItem('footballTeamData');
      if (teamData) {
        const teams = JSON.parse(teamData);
        const shuffledTeams = shuffleArray(teams);
        const pairs = [];

        for (let i = 0; i < shuffledTeams.length; i += 2) {
          if (shuffledTeams[i + 1]) {
            pairs.push({
              teamA: shuffledTeams[i],
              teamB: shuffledTeams[i + 1],
              status: 'upcoming',
              score: { teamA: 0, teamB: 0 },
              scheduledTime: new Date(Date.now() + (i * 30 * 60000)),
            });
          }
        }

        setFixtures(pairs);
        await AsyncStorage.setItem('footballCurrentRound', '1');
      }

      // Show success message
      Alert.alert('Success', 'Tournament has been reset successfully.');
    } catch (error) {
      console.error('Error resetting tournament:', error);
      Alert.alert('Error', 'Something went wrong while resetting the tournament.');
    }
  };

  const viewMatchHistory = () => {
    router.push('/footballMatchHistory');
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

  const getRoundName = () => {
    const totalTeams = fixtures.length * 2;
    if (totalTeams <= 4) return 'Finals';
    if (totalTeams <= 8) return 'Semi Finals';
    return 'Quarter Finals';
  };

  const getTournamentProgress = () => {
    const totalTeams = fixtures.length * 2;
    const remainingTeams = winners.length + (fixtures.length * 2);
    const progress = ((totalTeams - remainingTeams) / totalTeams) * 100;
    return `${Math.round(progress)}% Complete`;
  };

  // Add function to update match status
  const updateMatchStatus = async (matchResult) => {
    try {
      const updatedFixtures = fixtures.map(fixture => {
        if (fixture.teamA.teamName === matchResult.teamA && fixture.teamB.teamName === matchResult.teamB) {
          return {
            ...fixture,
            status: 'completed',
            score: matchResult.score,
            winner: matchResult.winner
          };
        }
        return fixture;
      });
      setFixtures(updatedFixtures);
    } catch (error) {
      console.error('Error updating match status:', error);
    }
  };

  // Add listener for match completion
  useEffect(() => {
    const checkMatchCompletion = async () => {
      try {
        const historyData = await AsyncStorage.getItem('footballMatchHistory');
        if (historyData) {
          const matches = JSON.parse(historyData);
          // Get the most recent match
          const latestMatch = matches[matches.length - 1];
          if (latestMatch && !latestMatch.isReplay) {
            updateMatchStatus(latestMatch);
          }
        }
      } catch (error) {
        console.error('Error checking match completion:', error);
      }
    };

    // Check for completed matches when component mounts
    checkMatchCompletion();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{getRoundName()}</Text>
      <Text style={styles.progressText}>{getTournamentProgress()}</Text>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={simulateNextRound}
        >
          <Text style={styles.buttonText}>Simulate Next Round</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={viewMatchHistory}
        >
          <Text style={styles.buttonText}>View Match History</Text>
        </TouchableOpacity>
      </View>

      {fixtures.map((match, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.matchCard, match.status === 'completed' && styles.completedMatchCard]}
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
            <>
              <Text style={styles.scoreText}>
                Score: {match.score.teamA} - {match.score.teamB}
              </Text>
              <Text style={styles.winnerText}>
                Winner: {match.winner}
              </Text>
              <Text style={styles.replayText}>Tap to replay match</Text>
            </>
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
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
  winnerText: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 5,
  },
  progressText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  completedMatchCard: {
    backgroundColor: '#f8f8f8',
    borderColor: '#4CAF50',
  },
  replayText: {
    fontSize: 14,
    color: '#2196F3',
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
});
