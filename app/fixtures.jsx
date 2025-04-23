import React, { useState, useEffect } from 'react'; 
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const Fixtures = () => {
  const [teamPlayers, setTeamPlayers] = useState({});
  const [teamNames, setTeamNames] = useState({});
  const [fixtures, setFixtures] = useState([]);
  const [currentTeams, setCurrentTeams] = useState([]);
  const [round, setRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(0);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tournamentWinner, setTournamentWinner] = useState(null);
  const [matchResults, setMatchResults] = useState(null);
  const [completedMatches, setCompletedMatches] = useState([]);
  const [initialFixturesStr, setInitialFixturesStr] = useState(null);

  // Calculate total rounds needed based on number of teams
  const calculateTotalRounds = (numTeams) => {
    return Math.ceil(Math.log2(numTeams));
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const playersData = await AsyncStorage.getItem('teamPlayers');
        const namesData = await AsyncStorage.getItem('teamNamesInput');
        const historyData = await AsyncStorage.getItem('matchHistory');
        const savedFixtures = await AsyncStorage.getItem('tournamentFixtures');
        const savedRound = await AsyncStorage.getItem('currentRound');
        const isNewTournament = await AsyncStorage.getItem('isNewTournament');
        
        if (playersData && namesData) {
          const parsedPlayers = JSON.parse(playersData);
          const parsedNames = JSON.parse(namesData);
          const teams = Object.keys(parsedPlayers);
          
          console.log('Teams loaded:', teams);
          setTeamPlayers(parsedPlayers);
          setTeamNames(parsedNames);
          setCurrentTeams(teams);
          
          // Calculate total rounds needed for this tournament
          const rounds = calculateTotalRounds(teams.length);
          setTotalRounds(rounds);
          console.log('Total rounds needed:', rounds);

          if (savedRound) {
            setRound(parseInt(savedRound));
          }

          // Only generate new fixtures if this is a new tournament
          if (isNewTournament === 'true') {
            console.log('New tournament, generating fixtures');
            const initialFixtures = generateFixtures(teams);
            console.log('Generated fixtures:', initialFixtures);
            
            if (initialFixtures.length > 0) {
              setFixtures(initialFixtures);
              await AsyncStorage.setItem('tournamentFixtures', JSON.stringify(initialFixtures));
              await AsyncStorage.setItem('initialFixtures', JSON.stringify(initialFixtures));
              await AsyncStorage.setItem('isNewTournament', 'false');
            } else {
              Alert.alert('Error', 'Failed to generate fixtures');
            }
          } else if (savedFixtures) {
            console.log('Loading existing fixtures');
            const parsedFixtures = JSON.parse(savedFixtures);
            setFixtures(parsedFixtures);
          }
        } else {
          Alert.alert('Error', 'Could not load teams data.');
        }

        if (historyData) {
          setCompletedMatches(JSON.parse(historyData));
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        Alert.alert('Error', 'Error fetching team data: ' + error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const generateFixtures = (teams) => {
    console.log('Starting fixture generation for teams:', teams);
    
    if (teams.length < 2) {
      console.log('Not enough teams for fixtures');
      Alert.alert('Error', 'Tournament requires at least 2 teams');
      return [];
    }

    if (teams.length > 16) {
      console.log('Too many teams');
      Alert.alert('Error', 'Tournament cannot have more than 16 teams');
      return [];
    }

    // Create a copy of teams array to work with
    let remainingTeams = [...teams];
    const roundFixtures = [];

    // If odd number of teams, handle the bye
    if (remainingTeams.length % 2 !== 0) {
      console.log('Odd number of teams, handling bye');
      // Randomly select a team for bye
      const byeIndex = Math.floor(Math.random() * remainingTeams.length);
      const byeTeam = remainingTeams[byeIndex];
      // Remove the bye team from remaining teams
      remainingTeams.splice(byeIndex, 1);
      // Add the bye match first
      roundFixtures.push([byeTeam, 'BYE']);
    }

    // Shuffle remaining teams for random matchups
    remainingTeams = remainingTeams.sort(() => Math.random() - 0.5);
    console.log('Teams after bye handling:', remainingTeams);

    // Create matches for remaining teams
    while (remainingTeams.length >= 2) {
      const team1 = remainingTeams.shift();
      const team2 = remainingTeams.shift();
      roundFixtures.push([team1, team2]);
    }

    console.log('Final fixtures generated:', roundFixtures);
    return roundFixtures;
  };

  const simulateWinners = async () => {
    try {
      const history = await AsyncStorage.getItem('matchHistory');
      const completedMatches = history ? JSON.parse(history) : [];
      const currentRound = await AsyncStorage.getItem('currentRound');
      const tournamentWinnerStr = await AsyncStorage.getItem('tournamentWinner');
      const tournamentComplete = await AsyncStorage.getItem('tournamentComplete');

      console.log('=== Tournament State ===');
      console.log('Round:', round);
      console.log('Total Rounds:', totalRounds);
      console.log('Current Round:', currentRound);
      console.log('Tournament Winner:', tournamentWinnerStr);
      console.log('Tournament Complete:', tournamentComplete);
      console.log('Completed Matches:', completedMatches);
      console.log('Current Fixtures:', fixtures);

      // If tournament is already complete, just show the winner
      if (tournamentComplete === 'true' || tournamentWinnerStr) {
        const winner = tournamentWinnerStr;
        const finalMatch = completedMatches[completedMatches.length - 1];

        Alert.alert(
          '🏆 Tournament Champion! 🏆',
          `Congratulations!\n\n${winner} has won the tournament!\n\nFinal Match Result:\n${finalMatch.teamA} vs ${finalMatch.teamB}\nWinner: ${winner}${finalMatch.result ? '\n' + finalMatch.result : ''}`,
          [
            { 
              text: 'View Match History',
              onPress: () => router.push('/matchHistory')
            },
            {
              text: 'New Tournament',
              onPress: handleReturnToRound1
            }
          ]
        );
        return;
      }

      // Check if all non-bye matches in current fixtures are completed
      const currentNonByeMatches = fixtures.filter(([_, teamB]) => teamB !== 'BYE');
      const allMatchesCompleted = currentNonByeMatches.every(([teamA, teamB]) => {
        const isCompleted = completedMatches.some(match =>
          (match.teamA === teamNames[teamA] && match.teamB === teamNames[teamB]) ||
          (match.teamA === teamNames[teamB] && match.teamB === teamNames[teamA])
        );
        console.log(`Match ${teamNames[teamA]} vs ${teamNames[teamB]} completed:`, isCompleted);
        return isCompleted;
      });

      if (!allMatchesCompleted) {
        Alert.alert('Matches Pending', 'Please complete all matches before proceeding to the next round.');
        return;
      }

      // Handle finals (last round)
      if (round === totalRounds) {
        try {
          console.log('Processing final match');
          
          // Get the final match from completed matches
          const finalMatch = completedMatches[completedMatches.length - 1];
          if (!finalMatch) {
            throw new Error('Final match result not found');
          }

          console.log('Final match:', finalMatch);
          const winner = finalMatch.winner;
          
          // Store tournament winner and mark tournament as complete
          await AsyncStorage.setItem('tournamentWinner', winner);
          await AsyncStorage.setItem('tournamentComplete', 'true');
          setTournamentWinner(winner);
          setFixtures([]); // Clear fixtures since tournament is complete

          // Show winner alert with trophy emoji and match details
          Alert.alert(
            '🏆 Tournament Champion! 🏆',
            `Congratulations!\n\n${winner} has won the tournament!\n\nFinal Match Result:\n${finalMatch.teamA} vs ${finalMatch.teamB}\nWinner: ${winner}${finalMatch.result ? '\n' + finalMatch.result : ''}`,
            [
              { 
                text: 'View Match History',
                onPress: () => router.push('/matchHistory')
              },
              {
                text: 'New Tournament',
                onPress: handleReturnToRound1
              }
            ]
          );
          return;
        } catch (error) {
          console.error('Error processing final match:', error);
          Alert.alert('Error', 'Failed to process tournament winner: ' + error.message);
          return;
        }
      }

      // Only proceed with round progression if we haven't reached the finals
      if (round < totalRounds) {
        try {
          console.log(`Processing round ${round} progression`);
          
          // Get winners from current round matches
          const currentRoundMatches = completedMatches.filter(match => 
            !match.teamA.includes('BYE') && !match.teamB.includes('BYE')
          ).slice(-currentNonByeMatches.length);
          
          console.log('Current round matches:', currentRoundMatches);

          // Get winners from matches
          const roundWinners = currentRoundMatches.map(match => {
            const winnerTeamEntry = Object.entries(teamNames).find(([_, name]) => name === match.winner);
            if (!winnerTeamEntry) {
              throw new Error(`Could not find team key for winner: ${match.winner}`);
            }
            return winnerTeamEntry[0];
          });

          // Add bye team winners if any
          const byeMatches = fixtures.filter(([_, teamB]) => teamB === 'BYE');
          const byeWinners = byeMatches.map(([teamA]) => teamA);
          const allWinners = [...roundWinners, ...byeWinners];

          console.log('Round winners:', allWinners);

          // Generate next round fixtures
          const nextRoundFixtures = generateFixtures(allWinners);
          console.log('Next round fixtures:', nextRoundFixtures);

          // Update state and storage
          await AsyncStorage.setItem('tournamentFixtures', JSON.stringify(nextRoundFixtures));
          await AsyncStorage.setItem('currentRound', String(round + 1));
          setFixtures(nextRoundFixtures);
          setCurrentTeams(allWinners);
          setRound(round + 1);

          const nextRoundName = getRoundName(allWinners.length, round + 1);
          Alert.alert(`Proceeding to ${nextRoundName}`, 
            nextRoundFixtures.map(([teamA, teamB]) => 
              `${teamNames[teamA]} vs ${teamB === 'BYE' ? 'BYE' : teamNames[teamB]}`
            ).join('\n')
          );
        } catch (error) {
          console.error(`Error in round ${round} progression:`, error);
          Alert.alert('Error', `Failed to set up next round matches: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Error in simulateWinners:', error);
      Alert.alert('Error', 'Something went wrong while processing the matches: ' + error.message);
    }
  };

  const handleReturnToRound1 = async () => {
    try {
      // Reset tournament state
      setRound(1);
      setTournamentWinner(null);
      setCompletedMatches([]);
      
      // Clear stored data
      await AsyncStorage.removeItem('matchHistory');
      await AsyncStorage.removeItem('tournamentFixtures');
      await AsyncStorage.removeItem('currentRound');
      await AsyncStorage.removeItem('tournamentWinner');
      await AsyncStorage.removeItem('tournamentComplete');
      await AsyncStorage.setItem('isNewTournament', 'true');
      
      // Load the original teams
      const teamsData = await AsyncStorage.getItem('teamPlayers');
      if (teamsData) {
        const parsedTeams = JSON.parse(teamsData);
        const teams = Object.keys(parsedTeams);
        
        // Generate new fixtures for the original teams
        const newFixtures = generateFixtures(teams);
        setCurrentTeams(teams);
        setFixtures(newFixtures);
        await AsyncStorage.setItem('tournamentFixtures', JSON.stringify(newFixtures));
        await AsyncStorage.setItem('initialFixtures', JSON.stringify(newFixtures));
      }

      // Show success message
      Alert.alert('Success', 'Tournament has been reset successfully.');
    } catch (error) {
      console.error('Error resetting tournament:', error);
      Alert.alert('Error', 'Something went wrong while resetting the tournament.');
    }
  };

  const startMatch = async (teamA, teamB) => {
    try {
      // If it's a bye match, just mark it and continue
      if (teamB === 'BYE') {
        Alert.alert('Bye Match', `${teamNames[teamA]} automatically advances to semi-finals.`);
        return;
      }

      const completedMatches = JSON.parse(await AsyncStorage.getItem('matchHistory')) || [];
      
      const alreadyPlayed = completedMatches.some(match =>
        (match.teamA === teamNames[teamA] && match.teamB === teamNames[teamB]) ||
        (match.teamA === teamNames[teamB] && match.teamB === teamNames[teamA])
      );

      if (alreadyPlayed) {
        Alert.alert("Match Already Played", "This match has already been completed.");
        return;
      }

      // Determine match number based on the round
      const matchNumber = round === 1 ? 
        completedMatches.filter(m => !m.teamA.includes('BYE') && !m.teamB.includes('BYE')).length + 1 :
        completedMatches.length + 1;

      router.push({
        pathname: '/matchScreen',
        params: {
          teamA: teamNames[teamA],
          teamB: teamNames[teamB],
          matchNumber: matchNumber,
        },
      });
    } catch (error) {
      console.error("Error in startMatch:", error);
      Alert.alert("Error", "Failed to start match: " + error.message);
    }
  };

  const getRoundName = (totalTeams, currentRound) => {
    const totalRoundsNeeded = calculateTotalRounds(totalTeams);
    const roundsRemaining = totalRoundsNeeded - currentRound + 1;

    if (roundsRemaining === 1) return 'Finals';
    if (roundsRemaining === 2) return 'Semi Finals';
    if (roundsRemaining === 3) return 'Quarter Finals';
    return `Round ${currentRound}`;
  };

  // Add debug logging to the render section
  console.log('Current fixtures in render:', fixtures);
  console.log('Current teams:', currentTeams);

  // Add a function to start a new tournament
  const startNewTournament = async () => {
    try {
      // Clear previous tournament data
      await AsyncStorage.removeItem('matchHistory');
      await AsyncStorage.removeItem('tournamentFixtures');
      // Set flag for new tournament
      await AsyncStorage.setItem('isNewTournament', 'true');
      setCompletedMatches([]);
      setTournamentWinner(null);
      setRound(1);
      
      // Reload the component to generate new fixtures
      const teams = Object.keys(teamPlayers);
      const initialFixtures = generateFixtures(teams);
      setFixtures(initialFixtures);
      await AsyncStorage.setItem('tournamentFixtures', JSON.stringify(initialFixtures));
      await AsyncStorage.setItem('isNewTournament', 'false');
    } catch (error) {
      console.error('Error starting new tournament:', error);
      Alert.alert('Error', 'Failed to start new tournament');
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
      <Text style={styles.title}>
        {getRoundName(currentTeams.length, round)}
      </Text>
      {fixtures.length === 0 ? (
        <Text style={styles.noFixturesText}>No fixtures available</Text>
      ) : (
        <>
          {fixtures.map(([teamA, teamB], index) => {
            const isMatchPlayed = teamB === 'BYE' ? true : completedMatches.some(match =>
              (match.teamA === teamNames[teamA] && match.teamB === teamNames[teamB]) ||
              (match.teamA === teamNames[teamB] && match.teamB === teamNames[teamA])
            );

            // Ensure we have valid team names
            const teamAName = teamNames[teamA] || teamA;
            const teamBName = teamB === 'BYE' ? 'BYE' : (teamNames[teamB] || teamB);

            return (
              <View style={styles.fixtureCard} key={`${teamA}-${teamB}-${index}`}>
                <Text style={styles.fixtureText}>
                  {teamAName} vs {teamBName}
                </Text>
                {teamB !== 'BYE' && !isMatchPlayed && (
                  <TouchableOpacity
                    style={styles.matchButton}
                    onPress={() => startMatch(teamA, teamB)}
                  >
                    <Text style={styles.buttonText}>Start Match</Text>
                  </TouchableOpacity>
                )}
                {isMatchPlayed && (
                  <Text style={[styles.matchPlayedText, teamB === 'BYE' && styles.byeMatchText]}>
                    {teamB === 'BYE' ? 'Waiting for opponent' : 'Match Completed'}
                  </Text>
                )}
              </View>
            );
          })}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.matchButton,
                (!fixtures.length || fixtures.some(([teamA, teamB]) => 
                  teamB !== 'BYE' && !completedMatches.some(match =>
                    (match.teamA === teamNames[teamA] && match.teamB === teamNames[teamB]) ||
                    (match.teamA === teamNames[teamB] && match.teamB === teamNames[teamA])
                  )
                )) && styles.disabledButton
              ]}
              onPress={simulateWinners}
              disabled={!fixtures.length || fixtures.some(([teamA, teamB]) => 
                teamB !== 'BYE' && !completedMatches.some(match =>
                  (match.teamA === teamNames[teamA] && match.teamB === teamNames[teamB]) ||
                  (match.teamA === teamNames[teamB] && match.teamB === teamNames[teamA])
                )
              )}
            >
              <Text style={styles.buttonText}>Simulate Winners - Next Round</Text>
            </TouchableOpacity>
          </View>

          {tournamentWinner && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.matchButton}
                onPress={handleReturnToRound1}
              >
                <Text style={styles.buttonText}>Go Back to Round 1</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.matchButton}
              onPress={() => router.push('/matchHistory')}
            >
              <Text style={styles.buttonText}>View Match History</Text>
            </TouchableOpacity>
          </View>
        </>
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
  disabledButton: {
    backgroundColor: 'gray',
  },
  matchPlayedText: {
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 5,
    fontSize: 14,
  },
  noFixturesText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontStyle: 'italic',
  },
  byeMatchText: {
    color: '#FFD700',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 5,
    fontSize: 14,
  },
});

export default Fixtures;
