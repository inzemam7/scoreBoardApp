import {
    SafeAreaView,
    Text,
    StyleSheet,
    ScrollView,
    Platform,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    Modal,
  } from 'react-native';
  import React, { useState, useEffect } from 'react';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { useRouter } from 'expo-router';
  
  const FootballSingle = () => {
    const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;
    const router = useRouter();
  
    const [duration, setDuration] = useState('');
    const [team1, setTeam1] = useState('');
    const [team2, setTeam2] = useState('');
    const [team1Players, setTeam1Players] = useState(['']);
    const [team2Players, setTeam2Players] = useState(['']);
    const [matchHistory, setMatchHistory] = useState([]);
  
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
  
    const clearHistory = async () => {
      Alert.alert(
        'Clear Match History',
        'Are you sure you want to clear all match history? This cannot be undone.',
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
                await AsyncStorage.removeItem('footballSingleMatchHistory');
                setMatchHistory([]);
                Alert.alert('Success', 'Match history has been cleared.');
              } catch (error) {
                console.error('Error clearing history:', error);
                Alert.alert('Error', 'Failed to clear match history.');
              }
            }
          }
        ]
      );
    };
  
    const handleInputChange = (index, value, team) => {
      const updated = [...(team === 1 ? team1Players : team2Players)];
      updated[index] = value;
      team === 1 ? setTeam1Players(updated) : setTeam2Players(updated);
    };
  
    const addPlayer = (team) => {
      if (team === 1) {
        setTeam1Players([...team1Players, '']);
      } else {
        setTeam2Players([...team2Players, '']);
      }
    };
  
    const removePlayer = (team, index) => {
      if (team === 1) {
        const updated = team1Players.filter((_, i) => i !== index);
        if (updated.length === 0) {
          setTeam1Players(['']);
        } else {
          setTeam1Players(updated);
        }
      } else {
        const updated = team2Players.filter((_, i) => i !== index);
        if (updated.length === 0) {
          setTeam2Players(['']);
        } else {
          setTeam2Players(updated);
        }
      }
    };
  
    const handleSubmit = async () => {
      if (!duration || !team1 || !team2) {
        Alert.alert('Missing Info', 'Please fill in all team names and select match duration.');
        return;
      }
  
      if (team1Players.some(p => !p) || team2Players.some(p => !p)) {
        Alert.alert('Missing Players', 'Please fill in all player names.');
        return;
      }
  
      if (team1Players.length < 2 || team2Players.length < 2) {
        Alert.alert('Not Enough Players', 'Each team must have at least 2 players.');
        return;
      }
  
      // Filter out empty player names
      const team1FilteredPlayers = team1Players.filter(p => p.trim() !== '');
      const team2FilteredPlayers = team2Players.filter(p => p.trim() !== '');
  
      const matchData = {
        duration: parseInt(duration),
        team1: {
          name: team1,
          players: team1FilteredPlayers,
        },
        team2: {
          name: team2,
          players: team2FilteredPlayers,
        },
      };
  
      try {
        await AsyncStorage.setItem('currentFootballMatchData', JSON.stringify(matchData));
        router.push({
          pathname: '/footballSingleMatchScreen',
          params: {
            match: JSON.stringify({
              teamA: { teamName: team1, players: team1FilteredPlayers },
              teamB: { teamName: team2, players: team2FilteredPlayers }
            }),
            duration: duration
          },
        });
      } catch (error) {
        console.error('Error saving data: ', error);
        Alert.alert('Error', 'Failed to save match data.');
      }
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
      <Container style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>One-off Match</Text>
  
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Match Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter match duration in minutes"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              placeholderTextColor="#666"
            />
          </View>
  
          <View style={styles.teamContainer}>
            <View style={styles.teamHeader}>
              <Text style={styles.subTitle}>Team 1</Text>
              <Text style={styles.playerCount}>{team1Players.length} players</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Team 1 Name"
              value={team1}
              onChangeText={setTeam1}
              placeholderTextColor="#666"
            />
            
            <Text style={styles.playerTitle}>Players</Text>
            {team1Players.map((player, index) => (
              <View key={`t1p${index}`} style={styles.playerInputContainer}>
                <TextInput
                  style={styles.playerInput}
                  placeholder={`Player ${index + 1}`}
                  value={player}
                  onChangeText={(value) => handleInputChange(index, value, 1)}
                  placeholderTextColor="#666"
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePlayer(1, index)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={() => addPlayer(1)}>
              <Text style={styles.addButtonText}>+ Add Player</Text>
            </TouchableOpacity>
          </View>
  
          <View style={styles.teamContainer}>
            <View style={styles.teamHeader}>
              <Text style={styles.subTitle}>Team 2</Text>
              <Text style={styles.playerCount}>{team2Players.length} players</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Team 2 Name"
              value={team2}
              onChangeText={setTeam2}
              placeholderTextColor="#666"
            />
            
            <Text style={styles.playerTitle}>Players</Text>
            {team2Players.map((player, index) => (
              <View key={`t2p${index}`} style={styles.playerInputContainer}>
                <TextInput
                  style={styles.playerInput}
                  placeholder={`Player ${index + 1}`}
                  value={player}
                  onChangeText={(value) => handleInputChange(index, value, 2)}
                  placeholderTextColor="#666"
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removePlayer(2, index)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={() => addPlayer(2)}>
              <Text style={styles.addButtonText}>+ Add Player</Text>
            </TouchableOpacity>
          </View>
  
          <TouchableOpacity style={styles.startButton} onPress={handleSubmit}>
            <Text style={styles.startButtonText}>Start Match</Text>
          </TouchableOpacity>
  
          <TouchableOpacity 
            style={styles.historyButton} 
            onPress={() => router.push('/singleFootballMatchHistory')}
          >
            <Text style={styles.buttonText}>View Match History</Text>
          </TouchableOpacity>
  
          {matchHistory.length > 0 && (
            <View style={styles.historyContainer}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>Match History</Text>
                <TouchableOpacity 
                  style={styles.clearHistoryButton}
                  onPress={clearHistory}
                >
                  <Text style={styles.clearHistoryText}>Clear History</Text>
                </TouchableOpacity>
              </View>
              {matchHistory.map((match, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.historyItem}
                  onPress={() => viewMatchDetails(match)}
                >
                  <Text style={styles.historyText}>
                    {match.teamA} vs {match.teamB}
                  </Text>
                  <Text style={styles.historySubText}>
                    Winner: {match.winner}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </Container>
    );
  };
  
  export default FootballSingle;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#222',
    },
    scroll: {
      padding: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 20,
      color: 'white',
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: 20,
      width: '100%',
    },
    label: {
      fontSize: 16,
      marginBottom: 5,
      color: 'white',
    },
    input: {
      backgroundColor: '#444',
      padding: 12,
      borderRadius: 8,
      color: 'white',
      marginBottom: 10,
    },
    teamContainer: {
      backgroundColor: '#333',
      padding: 15,
      borderRadius: 8,
      marginBottom: 20,
      width: '100%',
    },
    teamHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    subTitle: {
      fontSize: 24,
      fontWeight: '600',
      color: 'white',
    },
    playerTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 15,
      marginBottom: 10,
      color: 'white',
    },
    playerInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    playerInput: {
      flex: 1,
      backgroundColor: '#444',
      padding: 12,
      borderRadius: 8,
      color: 'white',
      marginRight: 8,
    },
    removeButton: {
      backgroundColor: '#ff4444',
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    removeButtonText: {
      color: 'white',
      fontSize: 16,
    },
    addButton: {
      backgroundColor: '#4CAF50',
      padding: 12,
      borderRadius: 8,
      marginTop: 10,
      alignItems: 'center',
    },
    addButtonText: {
      color: 'white',
      fontSize: 16,
    },
    startButton: {
      backgroundColor: '#2196F3',
      padding: 15,
      borderRadius: 8,
      marginTop: 20,
      alignItems: 'center',
    },
    startButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    historyContainer: {
      marginTop: 30,
    },
    historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    historyTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
    },
    historyItem: {
      backgroundColor: '#333',
      padding: 15,
      borderRadius: 8,
      marginBottom: 10,
    },
    historyText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    historySubText: {
      color: '#4CAF50',
      fontSize: 14,
      marginTop: 5,
    },
    clearHistoryButton: {
      backgroundColor: '#ff4444',
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 8,
    },
    clearHistoryText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
    playerCount: {
      color: '#4CAF50',
      fontSize: 14,
      fontWeight: '600',
    },
    // historyButton: {
    //   backgroundColor: '#666',
    //   padding: 15,
    //   borderRadius: 8,
    //   marginTop: 20,
    //   alignItems: 'center',
    // },
    buttonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
  }); 