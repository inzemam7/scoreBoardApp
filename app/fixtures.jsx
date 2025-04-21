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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tournamentWinner, setTournamentWinner] = useState(null);
  const [matchResults, setMatchResults] = useState(null);
  const [completedMatches, setCompletedMatches] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const playersData = await AsyncStorage.getItem('teamPlayers');
        const namesData = await AsyncStorage.getItem('teamNamesInput');
        const historyData = await AsyncStorage.getItem('matchHistory');
        const savedFixtures = await AsyncStorage.getItem('tournamentFixtures');
        
        if (playersData && namesData) {
          const parsedPlayers = JSON.parse(playersData);
          const parsedNames = JSON.parse(namesData);
          setTeamPlayers(parsedPlayers);
          setTeamNames(parsedNames);
          setCurrentTeams(Object.keys(parsedPlayers));

          // Generate new fixtures if none exist
          if (!savedFixtures) {
            const initialFixtures = generateFixtures(Object.keys(parsedPlayers));
            setFixtures(initialFixtures);
            await AsyncStorage.setItem('tournamentFixtures', JSON.stringify(initialFixtures));
            // Save the initial fixtures separately
            await AsyncStorage.setItem('initialTournamentFixtures', JSON.stringify(initialFixtures));
          } else {
            setFixtures(JSON.parse(savedFixtures));
          }
        } else {
          Alert.alert('Error', 'Could not load teams data.');
        }

        if (historyData) {
          setCompletedMatches(JSON.parse(historyData));
        }
      } catch (error) {
        Alert.alert('Error', 'Error fetching team data: ' + error.message);
      } finally {
        setLoading(false); 
      }
    }

    fetchData();
  }, []);

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

    return roundFixtures;
  };

  const simulateWinners = async () => {
    try {
      const history = await AsyncStorage.getItem('matchHistory');
      const completedMatches = history ? JSON.parse(history) : [];

      // Check if there are any matches played
      if (!fixtures.length) {
        Alert.alert('No fixtures available', 'Please start a new tournament.');
        return;
      }

      if (completedMatches.length === 0) {
        Alert.alert('No matches played', 'Please play some matches first.');
        return;
      }

      // If there's only one team left, they're the tournament winner
      if (currentTeams.length === 1) {
        setTournamentWinner(teamNames[currentTeams[0]]);
        Alert.alert(`🏆 Tournament Complete`, `${teamNames[currentTeams[0]]} wins the tournament!`);
        return;
      }

      // Check which matches from current fixtures have been played
      const playedFixtures = fixtures.map(([teamA, teamB]) => {
        if (!teamB) return { teamA, teamB: null, winner: teamA, isPlayed: true }; // Handle bye matches

        const isPlayed = completedMatches.some(match => 
          (match.teamA === teamNames[teamA] && match.teamB === teamNames[teamB]) ||
          (match.teamA === teamNames[teamB] && match.teamB === teamNames[teamA])
        );
        
        if (isPlayed) {
          const matchResult = completedMatches.find(match =>
            (match.teamA === teamNames[teamA] && match.teamB === teamNames[teamB]) ||
            (match.teamA === teamNames[teamB] && match.teamB === teamNames[teamA])
          );
          return {
            teamA,
            teamB,
            winner: Object.keys(teamNames).find(key => teamNames[key] === matchResult.winner),
            isPlayed: true
          };
        }
        
        return {
          teamA,
          teamB,
          winner: null,
          isPlayed: false
        };
      });

      // Check if all matches in current round are played
      const unplayedMatches = playedFixtures.filter(match => !match.isPlayed && match.teamB !== null);
      if (unplayedMatches.length > 0) {
        Alert.alert(
          'Matches Pending',
          'Please complete all matches in the current round before proceeding.'
        );
        return;
      }

      // Get winners from played matches
      const winners = playedFixtures.map(fixture => fixture.winner).filter(Boolean);

      // Create next round fixtures
      const nextRoundFixtures = generateFixtures(winners);

      // Update tournament state based on number of winners
      if (winners.length === 1) {
        setTournamentWinner(teamNames[winners[0]]);
        Alert.alert(`🏆 Tournament Complete`, `${teamNames[winners[0]]} wins the tournament!`);
        setRound(1);
      } else if (winners.length === 2) {
        Alert.alert('Proceeding to Final!');
        setRound(3);
        setCurrentTeams(winners);
        setFixtures(nextRoundFixtures);
        await AsyncStorage.setItem('tournamentFixtures', JSON.stringify(nextRoundFixtures));
      } else if (winners.length === 4) {
        Alert.alert('Proceeding to Semi-Final!');
        setRound(2);
        setCurrentTeams(winners);
        setFixtures(nextRoundFixtures);
        await AsyncStorage.setItem('tournamentFixtures', JSON.stringify(nextRoundFixtures));
      }
    } catch (error) {
      console.error('Error in simulateWinners:', error);
      Alert.alert('Error', 'Something went wrong while processing the matches.');
    }
  };

  const handleReturnToRound1 = async () => {
    try {
      // Reset tournament state while preserving match history
      setRound(1);
      setTournamentWinner(null);
      
      // Get the initial teams and tournament setup
      const playersData = await AsyncStorage.getItem('teamPlayers');
      const namesData = await AsyncStorage.getItem('teamNamesInput');
      const initialFixturesData = await AsyncStorage.getItem('initialTournamentFixtures');
      const historyData = await AsyncStorage.getItem('matchHistory');
      
      if (playersData && namesData) {
        const parsedPlayers = JSON.parse(playersData);
        const parsedNames = JSON.parse(namesData);
        
        // Set the teams back to initial state
        setTeamPlayers(parsedPlayers);
        setTeamNames(parsedNames);
        setCurrentTeams(Object.keys(parsedPlayers));

        // Restore initial fixtures
        if (initialFixturesData) {
          const initialFixtures = JSON.parse(initialFixturesData);
          setFixtures(initialFixtures);
          await AsyncStorage.setItem('tournamentFixtures', JSON.stringify(initialFixtures));
        }

        // Preserve match history
        if (historyData) {
          const history = JSON.parse(historyData);
          setCompletedMatches(history);
        }
      }
    } catch (error) {
      console.error('Error resetting tournament:', error);
      Alert.alert("Error", "Something went wrong resetting the tournament.");
    }
  };

  const startMatch = async (teamA, teamB) => {
    try {
      const completedMatches = JSON.parse(await AsyncStorage.getItem('matchHistory')) || [];
      const matchKey = `${teamA}-${teamB}`;

      const alreadyPlayed = completedMatches.some(match =>
        (match.teamA === teamNames[teamA] && match.teamB === teamNames[teamB]) ||
        (match.teamA === teamNames[teamB] && match.teamB === teamNames[teamA])
      );

      if (alreadyPlayed) {
        Alert.alert("This match has already been played!");
        return;
      }

      // Storing match result temporarily when user navigates away
      setMatchResults({
        teamA: teamNames[teamA],
        teamB: teamNames[teamB] || 'BYE',
        winner: teamNames[teamA], // You can modify this depending on actual match results
      });

      router.push({
        pathname: '/matchScreen',
        params: {
          teamA: teamNames[teamA],
          teamB: teamNames[teamB],
          matchNumber: round,
        },
      });
    } catch (error) {
      console.error("Error checking match history:", error);
      Alert.alert("Error", "Something went wrong checking match history.");
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
      <Text style={styles.title}>{round === 1 ? 'Round 1 Fixtures' : round === 2 ? 'Semi-Final' : 'Final'} Fixtures</Text>
      {fixtures.map(([teamA, teamB], index) => {
        const isMatchPlayed = completedMatches.some(match =>
          (match.teamA === teamNames[teamA] && match.teamB === teamNames[teamB]) ||
          (match.teamA === teamNames[teamB] && match.teamB === teamNames[teamA])
        );

        return (
          <View style={styles.fixtureCard} key={`${teamA}-${teamB}`}>
            <Text style={styles.fixtureText}>
              {teamNames[teamA]} vs {teamB ? teamNames[teamB] : 'Under Process'}
            </Text>
            {teamA && teamB && !isMatchPlayed && (
              <TouchableOpacity
                style={styles.matchButton}
                onPress={() => startMatch(teamA, teamB)}
              >
                <Text style={styles.buttonText}>Start Match</Text>
              </TouchableOpacity>
            )}
            {isMatchPlayed && (
              <Text style={styles.matchPlayedText}>Match Completed</Text>
            )}
          </View>
        );
      })}

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.matchButton,
            (!fixtures.length || fixtures.some(([teamA, teamB]) => 
              teamA && teamB && !completedMatches.some(match =>
                (match.teamA === teamNames[teamA] && match.teamB === teamNames[teamB]) ||
                (match.teamA === teamNames[teamB] && match.teamB === teamNames[teamA])
              )
            )) && styles.disabledButton
          ]}
          onPress={simulateWinners}
          disabled={!fixtures.length || fixtures.some(([teamA, teamB]) => 
            teamA && teamB && !completedMatches.some(match =>
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
});

export default Fixtures;
