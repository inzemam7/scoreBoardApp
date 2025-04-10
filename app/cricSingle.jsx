import {
  SafeAreaView,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TextInput,
  Button,
  View,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Cricsingle = () => {
  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;

  const [overs, setOvers] = useState('');
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [team1Players, setTeam1Players] = useState(Array(11).fill(''));
  const [team2Players, setTeam2Players] = useState(Array(11).fill(''));

  const handleInputChange = (index, value, team) => {
    const updated = [...(team === 1 ? team1Players : team2Players)];
    updated[index] = value;
    team === 1 ? setTeam1Players(updated) : setTeam2Players(updated);
  };

  const handleSubmit = async () => {
    if (!overs || !team1 || !team2 || team1Players.includes('') || team2Players.includes('')) {
      Alert.alert('Missing Info', 'Please fill all fields including team players.');
      return;
    }

    const matchData = {
      overs,
      team1: {
        name: team1,
        players: team1Players,
      },
      team2: {
        name: team2,
        players: team2Players,
      },
    };

    try {
      await AsyncStorage.setItem('matchData', JSON.stringify(matchData));
      Alert.alert('Success', 'Match data saved successfully!');
    } catch (error) {
      console.error('Error saving data: ', error);
      Alert.alert('Error', 'Failed to save match data.');
    }
  };

  return (
    <Container style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>One-off Match</Text>

        <TextInput
          style={styles.input}
          placeholder="Number of Overs"
          keyboardType="numeric"
          value={overs}
          onChangeText={setOvers}
        />

        <Text style={styles.subTitle}>Team 1 Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Team 1 Name"
          value={team1}
          onChangeText={setTeam1}
        />
<Text style={styles.subTitle}>Team 1 Playes</Text>
        {team1Players.map((player, index) => (
          <TextInput
            key={`t1p${index}`}
            style={styles.input}
            placeholder={`Team 1 Player ${index + 1}`}
            value={player}
            onChangeText={(value) => handleInputChange(index, value, 1)}
          />
        ))}

        <Text style={styles.subTitle}>Team 2 Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Team 2 Name"
          value={team2}
          onChangeText={setTeam2}
        />
<Text style={styles.subTitle}>Team 2 Players</Text>
        {team2Players.map((player, index) => (
          <TextInput
            key={`t2p${index}`}
            style={styles.input}
            placeholder={`Team 2 Player ${index + 1}`}
            value={player}
            onChangeText={(value) => handleInputChange(index, value, 2)}
          />
        ))}

        <Button style={styles.btn} title="Save Match Data" onPress={handleSubmit}/>
      </ScrollView>
    </Container>
  );
};

export default Cricsingle;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightyellow',
  },
  scroll: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
  },
  input: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: 10,
    borderRadius: 15,
    backgroundColor: '#fff',
  },
  btn : {
    backgroundColor: '#333',
    margin: 20

  }
});
