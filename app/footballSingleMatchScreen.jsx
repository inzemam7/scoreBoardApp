import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FootballSingleMatchScreen = () => {
  const { match, duration } = useLocalSearchParams();
  const router = useRouter();
  const parsedMatch = JSON.parse(match);
  const matchDuration = parseInt(duration); // in minutes

  const totalSeconds = matchDuration * 60;
  const halftimeSeconds = totalSeconds / 2;

  const [teamAScore, setTeamAScore] = useState(0);
  const [teamBScore, setTeamBScore] = useState(0);
  const [timer, setTimer] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(true);
  const [goalHistory, setGoalHistory] = useState([]); // Track goal history
  const [showGoalScorerModal, setShowGoalScorerModal] = useState(false);
  const [currentScoringTeam, setCurrentScoringTeam] = useState(null);
  const [teamAPlayers, setTeamAPlayers] = useState([]);
  const [teamBPlayers, setTeamBPlayers] = useState([]);

  // Penalty shootout states
  const [isPenaltyShootout, setIsPenaltyShootout] = useState(false);
  const [penaltyRound, setPenaltyRound] = useState(1);
  const [penaltyTeamAScore, setPenaltyTeamAScore] = useState(0);
  const [penaltyTeamBScore, setPenaltyTeamBScore] = useState(0);
  const [currentPenaltyTeam, setCurrentPenaltyTeam] = useState('A');
  const [penaltyHistory, setPenaltyHistory] = useState([]);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);

  // Add new state for penalty misses
  const [penaltyMisses, setPenaltyMisses] = useState({ A: 0, B: 0 });

  const [phase, setPhase] = useState('firstHalf'); // 'firstHalf', 'firstHalfAdded', 'halftimeBreak', 'secondHalf', 'secondHalfAdded', 'ended'
  const [addedTimeInput, setAddedTimeInput] = useState('');
  const [addedTime, setAddedTime] = useState(0);
  const [showAddedTimeModal, setShowAddedTimeModal] = useState(false);
  const [showStartSecondHalfModal, setShowStartSecondHalfModal] = useState(false);

  // Add new state for draw options
  const [showDrawOptionsModal, setShowDrawOptionsModal] = useState(false);

  // Add new state for save match
  const [showSaveMatchModal, setShowSaveMatchModal] = useState(false);

  // Load team players data
  useEffect(() => {
    // Get players directly from the parsed match data
    if (parsedMatch && parsedMatch.teamA && parsedMatch.teamB) {
      setTeamAPlayers(parsedMatch.teamA.players || []);
      setTeamBPlayers(parsedMatch.teamB.players || []);
    }
  }, []); // Empty dependency array since we only need to set players once

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
            // Check if match is a draw
            if (teamAScore === teamBScore) {
              setShowDrawOptionsModal(true);
            } else {
              handleMatchEnd();
            }
          }

          return next;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, phase, addedTime, halftimeSeconds, totalSeconds, teamAScore, teamBScore]);

  const handleGoalA = () => {
    setCurrentScoringTeam('A');
    setShowGoalScorerModal(true);
  };

  const handleGoalB = () => {
    setCurrentScoringTeam('B');
    setShowGoalScorerModal(true);
  };

  const handleGoalScorerSelect = (scorer) => {
    if (currentScoringTeam === 'A') {
      setTeamAScore((prev) => prev + 1);
      setGoalHistory((prev) => [...prev, { team: 'A', time: timer, scorer }]);
    } else {
      setTeamBScore((prev) => prev + 1);
      setGoalHistory((prev) => [...prev, { team: 'B', time: timer, scorer }]);
    }
    setShowGoalScorerModal(false);
  };

  const handleUndoGoal = () => {
    if (goalHistory.length > 0) {
      const lastGoal = goalHistory[goalHistory.length - 1];
      if (lastGoal.team === 'A') {
        setTeamAScore((prev) => prev - 1);
      } else {
        setTeamBScore((prev) => prev - 1);
      }
      setGoalHistory((prev) => prev.slice(0, -1));
    }
  };

  const handlePenaltyGoal = (team) => {
    if (team === 'A') {
      setPenaltyTeamAScore((prev) => prev + 1);
      setPenaltyHistory((prev) => [...prev, { team: 'A', round: penaltyRound, result: 'scored' }]);
    } else {
      setPenaltyTeamBScore((prev) => prev + 1);
      setPenaltyHistory((prev) => [...prev, { team: 'B', round: penaltyRound, result: 'scored' }]);
    }

    // Switch teams after each penalty
    setCurrentPenaltyTeam(currentPenaltyTeam === 'A' ? 'B' : 'A');

    // Check if round is complete
    if (currentPenaltyTeam === 'B') {
      setPenaltyRound((prev) => prev + 1);
      
      // Check for winner in sudden death (after round 5)
      if (penaltyRound >= 5) {
        const teamATotal = penaltyTeamAScore + (team === 'A' ? 1 : 0);
        const teamBTotal = penaltyTeamBScore + (team === 'B' ? 1 : 0);
        
        // In sudden death, if both teams have taken their shots and one team leads
        if (currentPenaltyTeam === 'B' && teamATotal !== teamBTotal) {
          setIsPenaltyShootout(false);
          setShowPenaltyModal(false);
        }
      }
    }
  };

  const handlePenaltyMiss = (team) => {
    if (team === 'A') {
      setPenaltyMisses((prev) => ({ ...prev, A: prev.A + 1 }));
      setPenaltyHistory((prev) => [...prev, { team: 'A', round: penaltyRound, result: 'missed' }]);
    } else {
      setPenaltyMisses((prev) => ({ ...prev, B: prev.B + 1 }));
      setPenaltyHistory((prev) => [...prev, { team: 'B', round: penaltyRound, result: 'missed' }]);
    }

    // Switch teams after each penalty
    setCurrentPenaltyTeam(currentPenaltyTeam === 'A' ? 'B' : 'A');

    // Check if round is complete
    if (currentPenaltyTeam === 'B') {
      setPenaltyRound((prev) => prev + 1);
      
      // Check for winner in sudden death (after round 5)
      if (penaltyRound >= 5) {
        // If team A missed and team B scored in the same round
        const teamATotal = penaltyTeamAScore;
        const teamBTotal = penaltyTeamBScore + (team === 'B' ? 0 : 1); // Add 1 if other team scored
        
        if (currentPenaltyTeam === 'B' && teamATotal !== teamBTotal) {
          setIsPenaltyShootout(false);
          setShowPenaltyModal(false);
        }
      }
    }
  };

  const handleUndoPenalty = () => {
    if (penaltyHistory.length > 0) {
      const lastPenalty = penaltyHistory[penaltyHistory.length - 1];
      if (lastPenalty.team === 'A') {
        if (lastPenalty.result === 'scored') {
          setPenaltyTeamAScore((prev) => prev - 1);
        } else {
          setPenaltyMisses((prev) => ({ ...prev, A: prev.A - 1 }));
        }
      } else {
        if (lastPenalty.result === 'scored') {
          setPenaltyTeamBScore((prev) => prev - 1);
        } else {
          setPenaltyMisses((prev) => ({ ...prev, B: prev.B - 1 }));
        }
      }
      setPenaltyHistory((prev) => prev.slice(0, -1));
      setCurrentPenaltyTeam(lastPenalty.team);
      if (currentPenaltyTeam === 'A') {
        setPenaltyRound((prev) => prev - 1);
      }
    }
  };

  const startPenaltyShootout = () => {
    setIsPenaltyShootout(true);
    setShowPenaltyModal(false);
    setPenaltyRound(1);
    setPenaltyTeamAScore(0);
    setPenaltyTeamBScore(0);
    setPenaltyMisses({ A: 0, B: 0 });
    setCurrentPenaltyTeam('A');
    setPenaltyHistory([]);
  };

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
    if (isPenaltyShootout) {
      if (penaltyRound >= 5) {
        return `Sudden Death - Round ${penaltyRound}`;
      }
      return `Penalty Round ${penaltyRound} of 5`;
    }
    
    if (phase === 'ended') {
      if (penaltyTeamAScore > penaltyTeamBScore) {
        return `${parsedMatch.teamA.teamName} Wins on Penalties (${penaltyTeamAScore}-${penaltyTeamBScore})!`;
      }
      if (penaltyTeamBScore > penaltyTeamAScore) {
        return `${parsedMatch.teamB.teamName} Wins on Penalties (${penaltyTeamBScore}-${penaltyTeamAScore})!`;
      }
      if (teamAScore > teamBScore) return `${parsedMatch.teamA.teamName} Wins!`;
      if (teamBScore > teamAScore) return `${parsedMatch.teamB.teamName} Wins!`;
    }
    return 'Match Draw!';
  };

  const handleDrawOption = (option) => {
    setShowDrawOptionsModal(false);
    if (option === 'penalties') {
      startPenaltyShootout();
    } else {
      // Conclude as draw
      setPhase('ended');
      handleMatchEnd();
    }
  };

  const saveMatchResult = async () => {
    try {
      const matchResult = {
        date: new Date().toISOString(),
        teamA: parsedMatch.teamA.teamName,
        teamB: parsedMatch.teamB.teamName,
        score: {
          teamA: teamAScore,
          teamB: teamBScore
        },
        duration: matchDuration,
        winner: getWinnerText(),
        goalHistory: goalHistory,
        penaltyShootout: isPenaltyShootout ? {
          teamAScore: penaltyTeamAScore,
          teamBScore: penaltyTeamBScore,
          history: penaltyHistory
        } : null
      };

      // Get existing history
      const existingHistory = await AsyncStorage.getItem('footballSingleMatchHistory');
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      
      // Add new match result
      history.push(matchResult);
      
      // Save updated history
      await AsyncStorage.setItem('footballSingleMatchHistory', JSON.stringify(history));
      
      // Navigate back to footballSingle
      router.push('/footballSingle');
    } catch (error) {
      console.error('Error saving match result:', error);
      Alert.alert('Error', 'Failed to save match result');
    }
  };

  const handleMatchEnd = () => {
    setShowSaveMatchModal(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Football Match</Text>

      <View style={styles.scoreboard}>
        <Text style={styles.timer}>{getFormattedTime(timer)}</Text>

        <View style={styles.teamsContainer}>
          <View style={styles.teamContainer}>
            <Text style={styles.teamName}>{parsedMatch.teamA.teamName}</Text>
            <Text style={styles.score}>{teamAScore}</Text>
            <View style={styles.goalScorersContainer}>
              <ScrollView>
                {goalHistory
                  .filter(goal => goal.team === 'A')
                  .map((goal, index) => (
                    <Text key={index} style={styles.goalScorer}>
                      {goal.scorer} ({Math.floor(goal.time / 60) + 1}')
                    </Text>
                  ))}
              </ScrollView>
            </View>
            {(isPenaltyShootout || phase === 'ended') && (
              <View style={styles.penaltyScoreContainer}>
                <Text style={styles.penaltyScore}>Penalties: {penaltyTeamAScore}/{penaltyTeamAScore + penaltyMisses.A}</Text>
                {penaltyRound > 5 && <Text style={styles.suddenDeathIndicator}>SD</Text>}
              </View>
            )}
          </View>

          <View style={styles.teamContainer}>
            <Text style={styles.teamName}>{parsedMatch.teamB.teamName}</Text>
            <Text style={styles.score}>{teamBScore}</Text>
            <View style={styles.goalScorersContainer}>
              <ScrollView>
                {goalHistory
                  .filter(goal => goal.team === 'B')
                  .map((goal, index) => (
                    <Text key={index} style={styles.goalScorer}>
                      {goal.scorer} ({Math.floor(goal.time / 60) + 1}')
                    </Text>
                  ))}
              </ScrollView>
            </View>
            {(isPenaltyShootout || phase === 'ended') && (
              <View style={styles.penaltyScoreContainer}>
                <Text style={styles.penaltyScore}>Penalties: {penaltyTeamBScore}/{penaltyTeamBScore + penaltyMisses.B}</Text>
                {penaltyRound > 5 && <Text style={styles.suddenDeathIndicator}>SD</Text>}
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.controls}>
        {!isPenaltyShootout && (phase !== 'ended' && phase !== 'halftimeBreak' && !showAddedTimeModal && !showStartSecondHalfModal) && (
          <>
            <TouchableOpacity style={styles.goalButton} onPress={handleGoalA}>
              <Text style={styles.buttonText}>+ Goal {parsedMatch.teamA.teamName}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.goalButton} onPress={handleGoalB}>
              <Text style={styles.buttonText}>+ Goal {parsedMatch.teamB.teamName}</Text>
            </TouchableOpacity>
            {goalHistory.length > 0 && (
              <TouchableOpacity style={styles.undoButton} onPress={handleUndoGoal}>
                <Text style={styles.buttonText}>Undo Last Goal</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {isPenaltyShootout && (
          <>
            <Text style={styles.penaltyRound}>
              {penaltyRound <= 5 ? `Penalty Round: ${penaltyRound} of 5` : `Sudden Death - Round ${penaltyRound}`}
            </Text>
            <View style={styles.penaltyControls}>
              <TouchableOpacity 
                style={[styles.penaltyButton, styles.scoreButton]} 
                onPress={() => handlePenaltyGoal(currentPenaltyTeam)}
              >
                <Text style={styles.buttonText}>
                  {currentPenaltyTeam === 'A' ? parsedMatch.teamA.teamName : parsedMatch.teamB.teamName} Scores
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.penaltyButton, styles.missButton]} 
                onPress={() => handlePenaltyMiss(currentPenaltyTeam)}
              >
                <Text style={styles.buttonText}>
                  {currentPenaltyTeam === 'A' ? parsedMatch.teamA.teamName : parsedMatch.teamB.teamName} Misses
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.penaltyStats}>
              <Text style={styles.penaltyStat}>
                {parsedMatch.teamA.teamName}: {penaltyTeamAScore} scored, {penaltyMisses.A} missed
              </Text>
              <Text style={styles.penaltyStat}>
                {parsedMatch.teamB.teamName}: {penaltyTeamBScore} scored, {penaltyMisses.B} missed
              </Text>
              {penaltyRound > 5 && (
                <Text style={styles.suddenDeathText}>
                  Sudden Death - Next Goal Wins!
                </Text>
              )}
            </View>
            {penaltyHistory.length > 0 && (
              <TouchableOpacity style={styles.undoButton} onPress={handleUndoPenalty}>
                <Text style={styles.buttonText}>Undo Last Penalty</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {(phase === 'ended' || isPenaltyShootout) && (
          <Text style={styles.gameOverText}>{getWinnerText()}</Text>
        )}
      </View>

      {/* Goal Scorer Selection Modal */}
      <Modal visible={showGoalScorerModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Goal Scorer</Text>
            <ScrollView style={styles.playersList}>
              {(currentScoringTeam === 'A' ? teamAPlayers : teamBPlayers).map((player, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.playerButton}
                  onPress={() => handleGoalScorerSelect(player)}
                >
                  <Text style={styles.playerButtonText}>{player}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => setShowGoalScorerModal(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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

      {/* Modal for Penalty Shootout */}
      <Modal visible={showPenaltyModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Match is a Draw!</Text>
            <Text style={styles.modalSubtitle}>Start Penalty Shootout?</Text>
            <TouchableOpacity style={styles.modalButton} onPress={startPenaltyShootout}>
              <Text style={styles.buttonText}>Start Penalties</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for Draw Options */}
      <Modal visible={showDrawOptionsModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Match is a Draw!</Text>
            <Text style={styles.modalSubtitle}>Choose an option:</Text>
            <View style={styles.drawOptionsContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.drawButton]} 
                onPress={() => handleDrawOption('draw')}
              >
                <Text style={styles.buttonText}>Conclude as Draw</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.penaltiesButton]} 
                onPress={() => handleDrawOption('penalties')}
              >
                <Text style={styles.buttonText}>Start Penalties</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for Save Match */}
      <Modal visible={showSaveMatchModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Match Ended!</Text>
            <Text style={styles.modalSubtitle}>{getWinnerText()}</Text>
            <Text style={styles.modalSubtitle}>Do you want to save this match result?</Text>
            <View style={styles.drawOptionsContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.drawButton]} 
                onPress={() => router.push('/footballSingle')}
              >
                <Text style={styles.buttonText}>Don't Save</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.penaltiesButton]} 
                onPress={saveMatchResult}
              >
                <Text style={styles.buttonText}>Save Result</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FootballSingleMatchScreen;

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
    width: '100%',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  timer: {
    fontSize: 60,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    width: '100%',
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  teamContainer: {
    alignItems: 'center',
    width: '45%',
    minHeight: 200,
    paddingHorizontal: 5,
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    width: '100%',
    height: 60,
  },
  score: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 10,
    height: 50,
  },
  goalScorersContainer: {
    width: '100%',
    height: 150,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  goalScorer: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  penaltyScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    justifyContent: 'center',
  },
  suddenDeathIndicator: {
    color: '#f44336',
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 14,
  },
  penaltyScore: {
    fontSize: 16,
    color: '#666',
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
  penaltyControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  penaltyButton: {
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    width: '45%',
    alignItems: 'center',
  },
  scoreButton: {
    backgroundColor: '#4CAF50',
  },
  missButton: {
    backgroundColor: '#f44336',
  },
  penaltyStats: {
    width: '100%',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    marginBottom: 20,
  },
  penaltyStat: {
    fontSize: 16,
    color: '#333',
    marginVertical: 5,
    textAlign: 'center',
  },
  undoButton: {
    backgroundColor: '#666',
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
  penaltyRound: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
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
  modalSubtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  suddenDeathText: {
    fontSize: 18,
    color: '#f44336',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  playersList: {
    maxHeight: 300,
    width: '100%',
  },
  playerButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  playerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  drawOptionsContainer: {
    width: '100%',
    gap: 10,
  },
  drawButton: {
    backgroundColor: '#666',
  },
  penaltiesButton: {
    backgroundColor: '#4CAF50',
  },
}); 