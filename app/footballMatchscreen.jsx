import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const FootballMatchscreen = () => {
  const { match, duration } = useLocalSearchParams();
  const parsedMatch = JSON.parse(match);
  const matchDuration = parseInt(duration); // in minutes

  const totalSeconds = matchDuration * 60;
  const halftimeSeconds = totalSeconds / 2;

  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  const [timer, setTimer] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(true);

  const [phase, setPhase] = useState('firstHalf'); // 'firstHalf', 'firstHalfAdded', 'halftimeBreak', 'secondHalf', 'secondHalfAdded', 'ended'
  const [addedTimeInput, setAddedTimeInput] = useState('');
  const [addedTime, setAddedTime] = useState(0);
  const [showAddedTimeModal, setShowAddedTimeModal] = useState(false);
  const [showStartSecondHalfModal, setShowStartSecondHalfModal] = useState(false);

  // Timer Logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (isRunning && phase !== 'ended') {
        setTimer((prev) => {
          const next = prev + 1;

          // Phase transitions
          if (phase === 'firstHalf' && next >= halftimeSeconds) {
            setIsRunning(false);
            setShowAddedTimeModal(true);
            setPhase('firstHalfPause');
          }

          else if (phase === 'firstHalfAdded' && next >= halftimeSeconds + addedTime) {
            setIsRunning(false);
            setShowStartSecondHalfModal(true);
            setPhase('halftimeBreak');
          }

          else if (phase === 'secondHalf' && next >= totalSeconds) {
            setIsRunning(false);
            setShowAddedTimeModal(true);
            setPhase('secondHalfPause');
          }

          else if (phase === 'secondHalfAdded' && next >= totalSeconds + addedTime) {
            setIsRunning(false);
            setPhase('ended');
          }

          return next;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, phase, addedTime]);

  const handleGoalA = () => setTeamAScore((prev) => prev + 1);
  const handleGoalB = () => setTeamBScore((prev) => prev + 1);

  const handleConfirmAddedTime = () => {
    const minutes = parseInt(addedTimeInput);
    const seconds = isNaN(minutes) ? 0 : minutes * 60;
    setAddedTime(seconds);
    setAddedTimeInput('');
    setShowAddedTimeModal(false);

    if (phase === 'firstHalfPause') {
      setPhase('firstHalfAdded');
      setIsRunning(true);
    } else if (phase === 'secondHalfPause') {
      setPhase('secondHalfAdded');
      setIsRunning(true);
    }
  };

  const handleStartSecondHalf = () => {
    setTimer(halftimeSeconds); // Start from 45 minutes
    setAddedTime(0);
    setPhase('secondHalf');
    setShowStartSecondHalfModal(false);
    setIsRunning(true);
  };

  const getFormattedTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const getWinnerText = () => {
    if (teamAScore > teamBScore) return `${parsedMatch.teamA.teamName} Wins!`;
    if (teamBScore > teamAScore) return `${parsedMatch.teamB.teamName} Wins!`;
    return 'Match Draw!';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Football Match</Text>

      <View style={styles.scoreboard}>
        <View style={styles.teamContainer}>
          <Text style={styles.teamName}>{parsedMatch.teamA.teamName}</Text>
          <Text style={styles.score}>{teamAScore}</Text>
        </View>

        <Text style={styles.timer}>{getFormattedTime(timer)}</Text>

        <View style={styles.teamContainer}>
          <Text style={styles.teamName}>{parsedMatch.teamB.teamName}</Text>
          <Text style={styles.score}>{teamBScore}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        {(phase !== 'ended' && phase !== 'halftimeBreak' && !showAddedTimeModal && !showStartSecondHalfModal) && (
          <>
            <TouchableOpacity style={styles.goalButton} onPress={handleGoalA}>
              <Text style={styles.buttonText}>+ Goal {parsedMatch.teamA.teamName}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.goalButton} onPress={handleGoalB}>
              <Text style={styles.buttonText}>+ Goal {parsedMatch.teamB.teamName}</Text>
            </TouchableOpacity>
          </>
        )}

        {phase === 'ended' && (
          <Text style={styles.gameOverText}>{getWinnerText()}</Text>
        )}
      </View>

      {/* Modal for Added Time Input */}
      <Modal visible={showAddedTimeModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Enter Added Time (min)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={addedTimeInput}
              onChangeText={setAddedTimeInput}
              placeholder="e.g. 2"
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleConfirmAddedTime}>
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal to Start Second Half */}
      <Modal visible={showStartSecondHalfModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Start Second Half?</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleStartSecondHalf}>
              <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FootballMatchscreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightyellow',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 30,
    color: 'gold',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  scoreboard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  teamContainer: {
    alignItems: 'center',
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  score: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  timer: {
    fontSize: 50,
    fontWeight: 'bold',
  },
  controls: {
    width: '100%',
    alignItems: 'center',
  },
  goalButton: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    width: 280,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gameOverText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'red',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalBox: {
    backgroundColor: 'white',
    margin: 30,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    width: '80%',
    borderBottomWidth: 1,
    borderColor: '#333',
    fontSize: 18,
    paddingVertical: 5,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#32CD32',
    padding: 10,
    borderRadius: 5,
  },
});
