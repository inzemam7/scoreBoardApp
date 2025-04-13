import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

const Football = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Football</Text>
      <Link href="/footballTournamentSetup" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Tournament</Text>
        </TouchableOpacity>
      </Link>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>One-Off Match</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Football;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightyellow',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'gold',
    fontSize: 50,
    fontWeight: 'bold',
    marginBottom: 80,
  },
  button: {
    backgroundColor: '#333',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginBottom: 30,
    width: 300,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 35,
    fontWeight: 'bold',
  },
});
