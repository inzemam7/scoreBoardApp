import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FootballTeamSetup = () => {
  const [tournamentData, setTournamentData] = useState(null);
  const [teamPlayers, setTeamPlayers] = useState({});
  const [teamNamesInput, setTeamNamesInput] = useState({});
  const [expandedTeams, setExpandedTeams] = useState({});
  const router = useRouter();

  const playersPerTeam = 11; // 11 players 

  useEffect(() => {
    async function fetchData() {
      const data = await AsyncStorage.getItem('footballTournamentSetup');
      if (data) {
        setTournamentData(JSON.parse(data));
      }
    }
    fetchData();
  }, []);

  const handleTeamNameChange = (team, value) => {
    setTeamNamesInput(prev => ({ ...prev, [team]: value }));
  };

  const handlePlayerChange = (team, index, value) => {
    setTeamPlayers(prev => {
      const updated = { ...prev };
      if (!updated[team]) updated[team] = {};
      updated[team][index] = value;
      return updated;
    });
  };

  const handleTeamSubmit = async () => {
    try {
      // Validate all teams and players first
      let isAnyFieldEmpty = false;
      
      for (const team of teamNames) {
        if (!teamNamesInput[team] || !teamPlayers[team]) {
          isAnyFieldEmpty = true;
          break;
        }
        for (let i = 0; i < playersPerTeam; i++) {
          if (!teamPlayers[team][i]) {
            isAnyFieldEmpty = true;
            break;
          }
        }
      }
  
      if (isAnyFieldEmpty) {
        Alert.alert('Missing Info', 'Please fill all team names and all 11 player fields.');
        return;
      }
  
      // Prepare team data in the correct format
      const teamData = teamNames.map(teamKey => ({
        teamName: teamNamesInput[teamKey],
        players: Object.values(teamPlayers[teamKey])
      }));
  
      // Save data
      await AsyncStorage.setItem('footballTeamData', JSON.stringify(teamData));
      
      // Navigate to fixtures screen
      router.replace('/footballFixtures');
      
    } catch (error) {
      console.error('Error saving team data:', error);
      Alert.alert('Error', 'Failed to save team data');
    }
  };

  if (!tournamentData) {
    return <Text>Loading...</Text>;
  }

  const teamCount = parseInt(tournamentData.teams);
  const teamNames = Array.from({ length: teamCount }, (_, i) => `Team${i + 1}`);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Football Team Setup</Text>
      {teamNames.map((team) => (
        <View key={team} style={styles.teamContainer}>
          <TouchableOpacity onPress={() => setExpandedTeams({ ...expandedTeams, [team]: !expandedTeams[team] })}>
            <Text style={styles.teamTitle}>
              {teamNamesInput[team] || team} {expandedTeams[team] ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
          {expandedTeams[team] && (
            <View>
              <TextInput
                style={styles.teamNameInput}
                placeholder="Enter Team Name"
                onChangeText={(text) => handleTeamNameChange(team, text)}
                value={teamNamesInput[team] || ''}
              />
              {Array.from({ length: playersPerTeam }, (_, i) => (
                <TextInput
                  key={i}
                  style={styles.playerInput}
                  placeholder={`Player ${i + 1}`}
                  onChangeText={(text) => handlePlayerChange(team, i, text)}
                  value={teamPlayers[team] ? teamPlayers[team][i] : ''}
                />
              ))}
            </View>
          )}
        </View>
      ))}
      <TouchableOpacity style={styles.submitButton} onPress={handleTeamSubmit}>
        <Text style={styles.submitButtonText}>Submit Teams</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default FootballTeamSetup;

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
