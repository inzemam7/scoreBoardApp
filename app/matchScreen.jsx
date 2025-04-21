// All imports stay the same
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MatchScreen = () => {
    const params = useLocalSearchParams();
    const { teamA, teamB, matchNumber, tossWinner: passedTossWinner, isViewOnly, matchData, isSingleMatch } = params;
    const router = useRouter();

    const [tossWinner, setTossWinner] = useState(null);
    const [tossDecision, setTossDecision] = useState(null);
    const [currentInning, setCurrentInning] = useState(1);
    const [battingTeam, setBattingTeam] = useState(null);
    const [bowlingTeam, setBowlingTeam] = useState(null);
    const [teamAName, setTeamAName] = useState(teamA);
    const [teamBName, setTeamBName] = useState(teamB);
    const [returnPath] = useState(isSingleMatch === 'true' ? '/cricSingle' : '/fixtures');
    const [historyKey] = useState(isSingleMatch === 'true' ? 'singleMatchHistory' : 'matchHistory');

    const [inningsData, setInningsData] = useState([
        { score: 0, wickets: 0, balls: 0, history: [] },
        { score: 0, wickets: 0, balls: 0, history: [] },
    ]);

    const [oversLimit, setOversLimit] = useState(2);
    const [isMatchOver, setIsMatchOver] = useState(false);
    const [target, setTarget] = useState(null);
    const [winner, setWinner] = useState(null);
    

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (isViewOnly && matchData) {
                    const parsedMatchData = JSON.parse(matchData);
                    setTeamAName(parsedMatchData.teamA);
                    setTeamBName(parsedMatchData.teamB);
                    setTossWinner(parsedMatchData.tossWinner);
                    setTossDecision(parsedMatchData.tossDecision);
                    setInningsData([
                        {
                            score: parsedMatchData.innings[0].score,
                            wickets: parsedMatchData.innings[0].wickets,
                            balls: Math.floor(parsedMatchData.innings[0].overs * 6),
                            history: []
                        },
                        {
                            score: parsedMatchData.innings[1].score,
                            wickets: parsedMatchData.innings[1].wickets,
                            balls: Math.floor(parsedMatchData.innings[1].overs * 6),
                            history: []
                        }
                    ]);
                    setWinner(parsedMatchData.winner);
                    setIsMatchOver(true);
                    return;
                }

                // Check if it's a single match
                const singleMatchData = await AsyncStorage.getItem('currentMatchData');
                if (singleMatchData) {
                    const parsed = JSON.parse(singleMatchData);
                    setOversLimit(parseInt(parsed.overs));
                } else {
                    // Tournament match
                    const tournamentData = await AsyncStorage.getItem('cricTournamentSetup');
                    if (tournamentData) {
                        const parsed = JSON.parse(tournamentData);
                        setOversLimit(parseInt(parsed.overs));
                    }
                }

                if (passedTossWinner) {
                    setTossWinner(passedTossWinner);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const handleToss = () => {
        if (isMatchOver) {
            Alert.alert('Match Already Over', `${winner} won the match!`);
            return;
        }
        const winnerTeam = Math.random() < 0.5 ? teamAName : teamBName;
        console.log('Toss Winner Selected:', winnerTeam);
        setTossWinner(winnerTeam);
    };

    const handleDecision = (decision) => {
        setTossDecision(decision);
        const batting = decision === 'bat' ? tossWinner : tossWinner === teamAName ? teamBName : teamAName;
        const bowling = batting === teamAName ? teamBName : teamAName;
        setBattingTeam(batting);
        setBowlingTeam(bowling);
    };

    const startSecondInnings = (isAllOut) => {
        const firstInningScore = inningsData[0].score;
        const targetScore = firstInningScore + 1;
        setTarget(targetScore);

        if (isAllOut) {
            Alert.alert(`${battingTeam} All Out`, `${bowlingTeam} needs ${targetScore} runs to win.`);
        } else {
            Alert.alert('1st Innings Over', `${bowlingTeam} needs ${targetScore} runs to win.`);
        }

        setBattingTeam(bowlingTeam);
        setBowlingTeam(battingTeam);
        setCurrentInning(2);
    };

    const saveMatchToHistory = async (matchData) => {
        try {
            const historyJSON = await AsyncStorage.getItem(historyKey);
            const history = historyJSON ? JSON.parse(historyJSON) : [];
    
            history.push(matchData);
    
            await AsyncStorage.setItem(historyKey, JSON.stringify(history));
            console.log("✅ Match saved to history");
        } catch (error) {
            console.error("❌ Error saving match history", error);
        }
    };

    const endMatch = (matchWinner) => {
        setIsMatchOver(true);
        setWinner(matchWinner);
    
        const matchData = {
            teamA: teamAName,
            teamB: teamBName,
            winner: matchWinner,
            matchNumber,
            playedOn: new Date().toLocaleString(),
            innings: [
                {
                    team: currentInning === 1 ? battingTeam : bowlingTeam,
                    score: inningsData[0].score,
                    wickets: inningsData[0].wickets,
                    overs: Math.floor(inningsData[0].balls / 6) + (inningsData[0].balls % 6) / 10
                },
                {
                    team: currentInning === 2 ? battingTeam : bowlingTeam,
                    score: inningsData[1].score,
                    wickets: inningsData[1].wickets,
                    overs: Math.floor(inningsData[1].balls / 6) + (inningsData[1].balls % 6) / 10
                }
            ],
            tossWinner,
            tossDecision,
            teamAScore: currentInning === 1 ? inningsData[0].score : inningsData[1].score,
            teamBScore: currentInning === 1 ? inningsData[1].score : inningsData[0].score,
            teamAWickets: currentInning === 1 ? inningsData[0].wickets : inningsData[1].wickets,
            teamBWickets: currentInning === 1 ? inningsData[1].wickets : inningsData[0].wickets
        };
    
        Alert.alert(
            '🏆 Match Over',
            matchWinner === 'Tie' ? "It's a tie!" : `${matchWinner} wins!\n\nDo you want to save this match to history?`,
            [
                {
                    text: 'No',
                    style: 'cancel',
                    onPress: () => router.push(returnPath),
                },
                {
                    text: 'Yes',
                    onPress: async () => {
                        await saveMatchToHistory(matchData);
                        router.push(returnPath);
                    },
                },
            ]
        );
    };
    
    

    const updateBall = (runs, extra = false, isWicket = false) => {
        if (isMatchOver) return;

        const newData = [...inningsData];
        const inningIndex = currentInning - 1;
        const historyEntry = { type: '', runs: 0 };

        if (isWicket) {
            newData[inningIndex].wickets += 1;
            newData[inningIndex].balls += 1;
            historyEntry.type = 'wicket';
        } else {
            newData[inningIndex].score += runs;
            historyEntry.type = extra ? 'extra' : 'run';
            historyEntry.runs = runs;
            if (!extra) newData[inningIndex].balls += 1;
        }

        newData[inningIndex].history.push(historyEntry);

        const { score, wickets, balls } = newData[inningIndex];
        const maxBalls = oversLimit * 6;

        const isAllOut = wickets >= 10;
        const isOversCompleted = balls >= maxBalls;

        if (currentInning === 2 && score >= target) {
            setInningsData(newData);
            endMatch(battingTeam);
            return;
        }

        if (isOversCompleted || isAllOut) {
            setInningsData(newData);
            if (currentInning === 1) {
                startSecondInnings(isAllOut);
            } else {
                const team1Score = inningsData[0].score;
                const team2Score = newData[1].score;
                const matchWinner = team2Score > team1Score ? battingTeam : team2Score < team1Score ? bowlingTeam : 'Tie';
                endMatch(matchWinner);
            }
            return;
        }

        setInningsData(newData);
    };

    const undoLastBall = () => {
        if (isMatchOver) return;

        const newData = [...inningsData];
        const inningIndex = currentInning - 1;
        const history = newData[inningIndex].history;

        if (history.length === 0) {
            Alert.alert('No action to undo');
            return;
        }

        const last = history.pop();

        if (last.type === 'run') {
            newData[inningIndex].score -= last.runs;
            newData[inningIndex].balls -= 1;
        } else if (last.type === 'extra') {
            newData[inningIndex].score -= last.runs;
        } else if (last.type === 'wicket') {
            newData[inningIndex].wickets -= 1;
            newData[inningIndex].balls -= 1;
        }

        setInningsData(newData);
    };

    const currentData = inningsData[currentInning - 1];
    const overs = Math.floor(currentData.balls / 6);
    const currentBall = currentData.balls % 6;

    const renderInningsSummary = () => {
        const team1 = teamAName;
        const team2 = teamBName;

        const firstInningData = inningsData[0];
        const secondInningData = inningsData[1];

        const firstInningBatting = currentInning === 1 ? battingTeam : bowlingTeam;
        const secondInningBatting = currentInning === 2 ? battingTeam : bowlingTeam;

        return (
            <View style={styles.inningsRow}>
                <View style={styles.inningsBox}>
                    <Text style={styles.inningsTeam}>{firstInningBatting === teamAName ? team1 : team2}</Text>
                    <Text style={styles.inningsScore}>
                        {firstInningData.balls === 0 && currentInning === 2
                            ? 'Yet to bat'
                            : `${firstInningData.score}/${firstInningData.wickets} (${Math.floor(firstInningData.balls / 6)}.${firstInningData.balls % 6} ov)`}
                    </Text>
                </View>
                <View style={styles.inningsBox}>
                    <Text style={styles.inningsTeam}>{secondInningBatting === teamAName ? team1 : team2}</Text>
                    <Text style={styles.inningsScore}>
                        {secondInningData.balls === 0 && currentInning === 1
                            ? 'Yet to bat'
                            : `${secondInningData.score}/${secondInningData.wickets} (${Math.floor(secondInningData.balls / 6)}.${secondInningData.balls % 6} ov)`}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    {isViewOnly ? '📜 Match Details' :
                     matchNumber === '3' ? '🏆 Final' : 
                     matchNumber === '2' ? '🎯 Semi-Final' : 
                     '🏏 Match - ' + (matchNumber || 1)}
                </Text>
                <Text style={styles.teams}>
                    {teamAName} vs {teamBName}
                </Text>
            </View>

            {isViewOnly ? (
                <>
                    <Text style={styles.tossResult}>
                        {tossWinner} won the toss and chose to {tossDecision}
                    </Text>
                    {renderInningsSummary()}
                    <Text style={[styles.winnerText, { marginTop: 20 }]}>
                        {winner === 'Tie' ? "Match Tied!" : `${winner} won the match!`}
                    </Text>
                </>
            ) : tossWinner === null ? (
                <TouchableOpacity style={styles.tossButton} onPress={handleToss}>
                    <Text style={styles.buttonText}>🎯 Toss</Text>
                </TouchableOpacity>
            ) : !tossDecision ? (
                <>
                    <Text style={styles.tossResult}>
                        {tossWinner} won the toss
                    </Text>
                    <Text style={styles.chooseText}>Choose to bat or bowl</Text>
                    <View style={styles.actions}>
                        <Button title="Bat" onPress={() => handleDecision('bat')} />
                        <Button title="Bowl" onPress={() => handleDecision('bowl')} />
                    </View>
                </>
            ) : (
                <>
                    <Text style={styles.tossResult}>
                        {tossWinner} won the toss and chose to {tossDecision}
                    </Text>
                    <Text style={styles.inningText}>
                        {currentInning === 1
                            ? `1st Inning - ${battingTeam} Batting`
                            : `2nd Inning - ${battingTeam} Batting`}
                    </Text>

                    {currentInning === 2 && target && (
                        <Text style={styles.targetText}>🎯 Target: {target}</Text>
                    )}

                    {renderInningsSummary()}

                    <View style={styles.scoreBoard}>
                        <Text style={styles.scoreText}>
                            Score: {currentData.score}/{currentData.wickets}
                        </Text>
                        <Text style={styles.scoreText}>
                            Overs: {overs}.{currentBall} / {oversLimit}
                        </Text>
                    </View>

                    <Text style={styles.chooseText}>Choose Outcome:</Text>
                    <View style={styles.actionsWrap}>
                        <Button title="Dot" onPress={() => updateBall(0)} />
                        <Button title="1" onPress={() => updateBall(1)} />
                        <Button title="2" onPress={() => updateBall(2)} />
                        <Button title="3" onPress={() => updateBall(3)} />
                        <Button title="4" onPress={() => updateBall(4)} />
                        <Button title="5" onPress={() => updateBall(5)} />
                        <Button title="6" onPress={() => updateBall(6)} />
                        <Button title="Wide" color="purple" onPress={() => updateBall(1, true)} />
                        <Button title="No Ball" color="orange" onPress={() => updateBall(1, true)} />
                        <Button title="Leg Bye" color="#999" onPress={() => updateBall(1, true)} />
                        <Button title="Wicket" color="red" onPress={() => updateBall(0, false, true)} />
                        <Button title="Undo" color="#ffcc00" onPress={undoLastBall} />
                    </View>
                </>
            )}
        </ScrollView>
    );
};

export default MatchScreen;


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#222', padding: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'gold', marginBottom: 5 },
  teams: { fontSize: 18, color: 'white', marginBottom: 10 },
  tossButton: {
    backgroundColor: '#444',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  tossResult: { fontSize: 16, color: 'lightgreen', marginBottom: 10, textAlign: 'center' },
  inningText: { fontSize: 16, color: 'skyblue', textAlign: 'center', marginBottom: 10 },
  targetText: { fontSize: 18, color: 'gold', textAlign: 'center', marginBottom: 10 },
  chooseText: { fontSize: 16, color: '#ccc', marginVertical: 10, textAlign: 'center' },
  scoreBoard: { backgroundColor: '#333', padding: 20, borderRadius: 10, marginBottom: 20 },
  scoreText: { color: 'white', fontSize: 18, marginBottom: 5 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10, flexWrap: 'wrap' },
  actionsWrap: { flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'space-between', rowGap: 10, columnGap: 10, marginBottom: 20 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  inningsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  inningsBox: { flex: 1, backgroundColor: '#333', padding: 15, borderRadius: 10, marginHorizontal: 5, alignItems: 'center' },
  inningsTeam: { fontSize: 16, fontWeight: 'bold', color: 'lightblue', marginBottom: 5 },
  inningsScore: { fontSize: 16, color: 'white' },
  winnerText: { fontSize: 18, color: 'gold', textAlign: 'center', marginTop: 20 },
});
