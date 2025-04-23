import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TeamSetup = () => {
  const [tournamentData, setTournamentData] = useState(null);
  const [teamPlayers, setTeamPlayers] = useState({});
  const [teamNamesInput, setTeamNamesInput] = useState({});
  const [expandedTeams, setExpandedTeams] = useState({});
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await AsyncStorage.getItem('cricTournamentSetup');
        if (data) {
          setTournamentData(JSON.parse(data));
        }
      } catch (error) {
        console.error('Error fetching tournament data:', error);
      }
    }
    fetchData();
  }, []);

  const handleTeamNameChange = (team, value) => {
    setTeamNamesInput(prev => ({ ...prev, [team]: value }));
  };

  const handlePlayerChange = (team, index, value) => {
    setTeamPlayers(prev => {
      const updatedTeamPlayers = { ...prev };
      if (!updatedTeamPlayers[team]) {
        updatedTeamPlayers[team] = {};
      }
      updatedTeamPlayers[team][index] = value;
      return updatedTeamPlayers;
    });
  };

  const isFormValid = () => {
    for (const team in teamPlayers) {
      if (!teamNamesInput[team]) {
        return false;
      }
      if (!teamPlayers[team] || Object.keys(teamPlayers[team]).length !== 1) {
        return false;
      }
      if (!teamPlayers[team][0]) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (isFormValid()) {
      try {
        await AsyncStorage.setItem('teamPlayers', JSON.stringify(teamPlayers));
        await AsyncStorage.setItem('teamNamesInput', JSON.stringify(teamNamesInput));
        // Set flag for new tournament
        await AsyncStorage.setItem('isNewTournament', 'true');
        // Clear any existing tournament data
        await AsyncStorage.removeItem('matchHistory');
        await AsyncStorage.removeItem('tournamentFixtures');
        
        router.push('/fixtures');
      } catch (error) {
        Alert.alert('Error', 'Failed to save team data');
      }
    }
  };

  if (!tournamentData) {
    return <Text>Loading...</Text>;
  }

  const teamCount = parseInt(tournamentData.teams);
  const teamNames = Array.from({ length: teamCount }, (_, i) => `Team${i + 1}`);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Team Setup</Text>
      {teamNames.map((team) => (
        <View key={team} style={styles.teamContainer}>
          <TouchableOpacity onPress={() => setExpandedTeams({ ...expandedTeams, [team]: !expandedTeams[team] })}>
            <Text style={styles.teamTitle}>{team} {expandedTeams[team] ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {expandedTeams[team] && (
            <View>
              {/* Team Name Input */}
              <TextInput
                style={styles.teamNameInput}
                placeholder="Enter Team Name"
                onChangeText={(text) => handleTeamNameChange(team, text)}
                value={teamNamesInput[team] || ''}
              />
              <TextInput
                style={styles.playerInput}
                placeholder="Player Name"
                onChangeText={(text) => handlePlayerChange(team, 0, text)}
                value={teamPlayers[team] ? teamPlayers[team][0] : ''}
              />
            </View>
          )}
        </View>
      ))}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Teams</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default TeamSetup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightyellow',
    padding: 20,
  },
  title: {
    color: 'gold',
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  teamContainer: {
    marginBottom: 20,
  },
  teamTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  teamNameInput: {
    width: '100%',
    height: 40,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  playerInput: {
    width: '100%',
    height: 40,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  submitButton: {
    backgroundColor: '#333',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginTop: 30,
    width: 300,
    alignItems: 'center',
    alignSelf: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 35,
    fontWeight: 'bold',
  },
});
