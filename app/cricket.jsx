
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

const Cricket = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cricket</Text>
      <Link href="/cricTournamentSetup" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Tournament</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/cricSingle" asChild>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>One-Off Match</Text>
      </TouchableOpacity>
      </Link>

    </View>
  );
};

export default Cricket;

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