// // app/footballMatchscreen.jsx
// import React, { useState, useEffect } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { useRouter } from 'expo-router';

// const FootballMatchscreen = () => {
//   const router = useRouter();
//   const match = JSON.parse(router.query.match);
//   const matchDuration = parseInt(router.query.duration);  // In minutes

//   const [teamAScore, setTeamAScore] = useState(0);
//   const [teamBScore, setTeamBScore] = useState(0);
//   const [timer, setTimer] = useState(0);  // Timer in seconds
//   const [isHalftime, setIsHalftime] = useState(false);
//   const [addedTime, setAddedTime] = useState(0);  // In seconds
//   const [gameOver, setGameOver] = useState(false);

//   const totalMatchTime = matchDuration * 60; // Total match time in seconds
//   const halftimeTime = totalMatchTime / 2;

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (!gameOver) {
//         setTimer((prevTime) => prevTime + 1);
//       }
//     }, 1000); // Increment timer every second

//     return () => clearInterval(interval);
//   }, [gameOver]);

//   const handleGoalA = () => setTeamAScore(teamAScore + 1);
//   const handleGoalB = () => setTeamBScore(teamBScore + 1);

//   const handleHalftime = () => {
//     setIsHalftime(true);
//   };

//   const handleResume = () => {
//     setIsHalftime(false);
//     setAddedTime(0);
//   };

//   const handleAddedTime = () => {
//     const addedTime = prompt("Enter added time (in minutes):");
//     if (addedTime) {
//       setAddedTime(parseInt(addedTime) * 60);  // Convert minutes to seconds
//     }
//   };

//   const formattedTime = (timeInSeconds) => {
//     const minutes = Math.floor(timeInSeconds / 60);
//     const seconds = timeInSeconds % 60;
//     return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
//   };

//   const isHalftimeOrOver = timer >= halftimeTime + addedTime;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Football Match</Text>

//       <View style={styles.scoreboard}>
//         <View style={styles.teamContainer}>
//           <Text style={styles.teamName}>{match.teamA.teamName}</Text>
//           <Text style={styles.score}>{teamAScore}</Text>
//         </View>

//         <Text style={styles.timer}>{formattedTime(timer)}</Text>

//         <View style={styles.teamContainer}>
//           <Text style={styles.teamName}>{match.teamB.teamName}</Text>
//           <Text style={styles.score}>{teamBScore}</Text>
//         </View>
//       </View>

//       <View style={styles.controls}>
//         {!isHalftimeOrOver ? (
//           <>
//             <TouchableOpacity style={styles.goalButton} onPress={handleGoalA}>
//               <Text style={styles.buttonText}>+ Goal Team A</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.goalButton} onPress={handleGoalB}>
//               <Text style={styles.buttonText}>+ Goal Team B</Text>
//             </TouchableOpacity>

//             {timer >= halftimeTime && !isHalftime && !gameOver && (
//               <TouchableOpacity style={styles.halftimeButton} onPress={handleHalftime}>
//                 <Text style={styles.buttonText}>Halftime</Text>
//               </TouchableOpacity>
//             )}
//           </>
//         ) : (
//           <>
//             {addedTime === 0 ? (
//               <TouchableOpacity style={styles.addedTimeButton} onPress={handleAddedTime}>
//                 <Text style={styles.buttonText}>Enter Added Time</Text>
//               </TouchableOpacity>
//             ) : (
//               <TouchableOpacity style={styles.resumeButton} onPress={handleResume}>
//                 <Text style={styles.buttonText}>Resume Second Half</Text>
//               </TouchableOpacity>
//             )}
//           </>
//         )}

//         {gameOver && (
//           <Text style={styles.gameOverText}>Game Over</Text>
//         )}
//       </View>
//     </View>
//   );
// };

// export default FootballMatchscreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'lightyellow',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   title: {
//     fontSize: 30,
//     color: 'gold',
//     fontWeight: 'bold',
//     marginBottom: 30,
//   },
//   scoreboard: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     width: '100%',
//     marginBottom: 30,
//   },
//   teamContainer: {
//     alignItems: 'center',
//   },
//   teamName: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   score: {
//     fontSize: 40,
//     fontWeight: 'bold',
//   },
//   timer: {
//     fontSize: 50,
//     fontWeight: 'bold',
//   },
//   controls: {
//     width: '100%',
//     alignItems: 'center',
//   },
//   goalButton: {
//     backgroundColor: '#333',
//     padding: 15,
//     borderRadius: 5,
//     marginVertical: 10,
//     width: 250,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   halftimeButton: {
//     backgroundColor: '#FF6347',
//     padding: 15,
//     borderRadius: 5,
//     marginVertical: 10,
//     width: 250,
//     alignItems: 'center',
//   },
//   addedTimeButton: {
//     backgroundColor: '#FFD700',
//     padding: 15,
//     borderRadius: 5,
//     marginVertical: 10,
//     width: 250,
//     alignItems: 'center',
//   },
//   resumeButton: {
//     backgroundColor: '#32CD32',
//     padding: 15,
//     borderRadius: 5,
//     marginVertical: 10,
//     width: 250,
//     alignItems: 'center',
//   },
//   gameOverText: {
//     fontSize: 30,
//     fontWeight: 'bold',
//     color: 'red',
//   },
// });

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const FootballMatchscreen = () => {
  const router = useRouter();
  const { match, duration } = router.query;

  const [matchData, setMatchData] = useState(null);
  const [goalsTeamA, setGoalsTeamA] = useState(0);
  const [goalsTeamB, setGoalsTeamB] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isHalftime, setIsHalftime] = useState(false);
  const [addedTime, setAddedTime] = useState(0);
  const [matchDuration, setMatchDuration] = useState(0);

  useEffect(() => {
    if (match) {
      setMatchData(JSON.parse(match));
    }
    if (duration) {
      setMatchDuration(parseInt(duration) * 60); // Convert minutes to seconds
    }
  }, [match, duration]);

  useEffect(() => {
    if (matchData) {
      setTimer(0);
      startTimer();
    }
  }, [matchData]);

  const startTimer = () => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer >= matchDuration + addedTime) {
          clearInterval(interval);
          return matchDuration + addedTime;
        }
        return prevTimer + 1;
      });
    }, 1000);
  };

  const handleGoalA = () => {
    setGoalsTeamA(goalsTeamA + 1);
  };

  const handleGoalB = () => {
    setGoalsTeamB(goalsTeamB + 1);
  };

  const handleHalftime = () => {
    setIsHalftime(true);
    setAddedTime(0);
    const halftimeDuration = matchDuration / 2; // Half of the match duration
    setTimer(halftimeDuration);
  };

  const handleResumeSecondHalf = () => {
    setIsHalftime(false);
    startTimer();
  };

  const handleAddTime = () => {
    const additionalTime = parseInt(prompt('Enter added time (minutes):')) * 60; // convert minutes to seconds
    setAddedTime(additionalTime);
  };

  return (
    <View style={styles.container}>
      {matchData && (
        <>
          <Text style={styles.matchTitle}>
            {matchData.teamA} vs {matchData.teamB}
          </Text>
          <Text style={styles.timer}>
            Time: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
          </Text>
          <Text style={styles.score}>
            {goalsTeamA} - {goalsTeamB}
          </Text>

          {isHalftime ? (
            <View>
              <Text style={styles.halftimeText}>Halftime</Text>
              <TouchableOpacity style={styles.resumeButton} onPress={handleResumeSecondHalf}>
                <Text style={styles.resumeButtonText}>Resume Second Half</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <TouchableOpacity style={styles.goalButton} onPress={handleGoalA}>
                <Text style={styles.goalButtonText}>Goal {matchData.teamA}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.goalButton} onPress={handleGoalB}>
                <Text style={styles.goalButtonText}>Goal {matchData.teamB}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.halftimeButton} onPress={handleHalftime}>
                <Text style={styles.halftimeButtonText}>Halftime</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.addTimeButton} onPress={handleAddTime}>
                <Text style={styles.addTimeButtonText}>Add Time</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
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
  matchTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  timer: {
    fontSize: 30,
    marginBottom: 30,
  },
  score: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  goalButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderRadius: 5,
  },
  goalButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  halftimeButton: {
    backgroundColor: '#f0a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    borderRadius: 5,
  },
  halftimeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  resumeButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    borderRadius: 5,
  },
  resumeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  halftimeText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#f00',
  },
  addTimeButton: {
    backgroundColor: '#f9c74f',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    borderRadius: 5,
  },
  addTimeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
