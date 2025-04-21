import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Button,
  Alert,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNPickerSelect from "react-native-picker-select";

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
        const historyEntry = { type: '', runs: 0, isExtra: extra };

        if (isWicket) {
            newData[inningIndex].wickets += 1;
            if (!extra) {
                newData[inningIndex].balls += 1;
            }
            historyEntry.type = 'wicket';
            historyEntry.runs = 0;
        } else {
            newData[inningIndex].score += runs;
            if (extra) {
                historyEntry.type = runs >= 5 ? 'no-ball' : 'wide';
                const extraRun = 1;
                newData[inningIndex].score += extraRun;
                historyEntry.runs = runs;
                historyEntry.extraRun = extraRun;
            } else {
                historyEntry.type = 'run';
                historyEntry.runs = runs;
                newData[inningIndex].balls += 1;
            }
        }

        newData[inningIndex].history.push(historyEntry);

        const { score, wickets, balls } = newData[inningIndex];
        const maxBalls = oversLimit * 6;

        const isAllOut = wickets >= 10;
        const isOversCompleted = balls >= maxBalls;

        if (currentInning === 2) {
            if (score >= target) {
                setInningsData(newData);
                endMatch(battingTeam);
                return;
            }
        }

        if (isOversCompleted || isAllOut) {
            setInningsData(newData);
            if (currentInning === 1) {
                startSecondInnings(isAllOut);
            } else {
                if (score < target - 1) {
                    endMatch(bowlingTeam);
                } else if (score === target - 1) {
                    endMatch('Tie');
                } else {
                    endMatch(battingTeam);
                }
            }
            return;
        }

        setInningsData(newData);
    };

    const undoLastBall = () => {
        if (isMatchOver) return;

        const newData = [...inningsData];
        const inningIndex = currentInning - 1;
        const lastBall = newData[inningIndex].history.pop();

        if (!lastBall) return;

        if (lastBall.type === 'wicket') {
            newData[inningIndex].wickets -= 1;
            if (!lastBall.isExtra) {
                newData[inningIndex].balls -= 1;
            }
        } else {
            newData[inningIndex].score -= lastBall.runs;
            if (lastBall.extraRun) {
                newData[inningIndex].score -= lastBall.extraRun;
            }
            if (!lastBall.isExtra) {
                newData[inningIndex].balls -= 1;
            }
        }

        setInningsData(newData);
    };

    const renderInningsSummary = () => {
        const currentInningData = inningsData[currentInning - 1];
        const overs = Math.floor(currentInningData.balls / 6);
        const balls = currentInningData.balls % 6;

        return (
            <View style={styles.summaryContainer}>
                <Text style={styles.summaryText}>
                    {battingTeam} {currentInningData.score}/{currentInningData.wickets}
                </Text>
                <Text style={styles.oversText}>
                    Overs: {overs}.{balls} / {oversLimit}
                </Text>
                {currentInning === 2 && target && (
                    <Text style={styles.targetText}>
                        Target: {target} ({target - currentInningData.score} needed from {(oversLimit * 6) - currentInningData.balls} balls)
                    </Text>
                )}
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            {!isViewOnly && (
                <>
                    {!tossWinner ? (
                        <TouchableOpacity style={styles.tossButton} onPress={handleToss}>
                            <Text style={styles.buttonText}>Conduct Toss</Text>
                        </TouchableOpacity>
                    ) : !tossDecision ? (
                        <View style={styles.decisionContainer}>
                            <Text style={styles.tossText}>{tossWinner} won the toss</Text>
                            <View style={styles.decisionButtons}>
                                <TouchableOpacity
                                    style={styles.decisionButton}
                                    onPress={() => handleDecision('bat')}
                                >
                                    <Text style={styles.buttonText}>Bat</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.decisionButton}
                                    onPress={() => handleDecision('bowl')}
                                >
                                    <Text style={styles.buttonText}>Bowl</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <>
                            {renderInningsSummary()}
                            <View style={styles.scoreButtons}>
                                {[0, 1, 2, 3, 4, 6].map((runs) => (
                                    <TouchableOpacity
                                        key={runs}
                                        style={styles.runButton}
                                        onPress={() => updateBall(runs)}
                                    >
                                        <Text style={styles.buttonText}>{runs}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <View style={styles.extraOptionsContainer}>
                                <View style={styles.extraOptionSection}>
                                    <Text style={styles.extraOptionTitle}>Wide Ball</Text>
                                    <RNPickerSelect
                                        onValueChange={(value) => value && updateBall(value, true)}
                                        placeholder={{ label: "Wide + ", value: null }}
                                        items={[
                                            { label: "Wide + 0", value: 1 },
                                            { label: "Wide + 1", value: 2 },
                                            { label: "Wide + 2", value: 3 },
                                            { label: "Wide + 4", value: 5 },
                                        ]}
                                        style={pickerSelectStyles}
                                    />
                                </View>
                                <View style={styles.extraOptionSection}>
                                    <Text style={styles.extraOptionTitle}>No Ball</Text>
                                    <RNPickerSelect
                                        onValueChange={(value) => value && updateBall(value, true)}
                                        placeholder={{ label: "No Ball + ", value: null }}
                                        items={[
                                            { label: "No Ball + 0", value: 1 },
                                            { label: "No Ball + 1", value: 2 },
                                            { label: "No Ball + 2", value: 3 },
                                            { label: "No Ball + 4", value: 5 },
                                            { label: "No Ball + 6", value: 7 },
                                        ]}
                                        style={pickerSelectStyles}
                                    />
                                </View>
                                <View style={styles.extraOptionSection}>
                                    <Text style={styles.extraOptionTitle}>Leg Bye</Text>
                                    <RNPickerSelect
                                        onValueChange={(value) => value && updateBall(value)}
                                        placeholder={{ label: "Leg Bye", value: null }}
                                        items={[
                                            { label: "Leg Bye 1", value: 1 },
                                            { label: "Leg Bye 2", value: 2 },
                                            { label: "Leg Bye 3", value: 3 },
                                            { label: "Leg Bye 4", value: 4 },
                                        ]}
                                        style={pickerSelectStyles}
                                    />
                                </View>
                            </View>
                            <View style={styles.extraButtons}>
                                <TouchableOpacity
                                    style={styles.extraButton}
                                    onPress={() => updateBall(0, false, true)}
                                >
                                    <Text style={styles.buttonText}>Wicket</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.extraButton}
                                    onPress={undoLastBall}
                                >
                                    <Text style={styles.buttonText}>Undo</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </>
            )}
            {isViewOnly && (
                <View style={styles.matchSummary}>
                    <Text style={styles.summaryTitle}>Match Summary</Text>
                    <Text style={styles.summaryText}>
                        {teamAName} vs {teamBName}
                    </Text>
                    <Text style={styles.summaryText}>
                        Winner: {winner}
                    </Text>
                    <Text style={styles.summaryText}>
                        Toss: {tossWinner} won and chose to {tossDecision}
                    </Text>
                    <View style={styles.inningsSummary}>
                        <Text style={styles.inningsTitle}>First Innings</Text>
                        <Text style={styles.inningsText}>
                            {inningsData[0].score}/{inningsData[0].wickets} ({Math.floor(inningsData[0].balls / 6)}.{inningsData[0].balls % 6} overs)
                        </Text>
                        <Text style={styles.inningsTitle}>Second Innings</Text>
                        <Text style={styles.inningsText}>
                            {inningsData[1].score}/{inningsData[1].wickets} ({Math.floor(inningsData[1].balls / 6)}.{inningsData[1].balls % 6} overs)
                        </Text>
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#222',
    },
    tossButton: {
        backgroundColor: '#444',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    decisionContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    tossText: {
        color: 'white',
        fontSize: 18,
        marginBottom: 10,
    },
    decisionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    decisionButton: {
        backgroundColor: '#444',
        padding: 15,
        borderRadius: 8,
        width: '45%',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
    },
    summaryContainer: {
        backgroundColor: '#333',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    summaryText: {
        color: 'white',
        fontSize: 20,
        marginBottom: 5,
    },
    oversText: {
        color: '#aaa',
        fontSize: 16,
    },
    targetText: {
        color: '#4CAF50',
        fontSize: 16,
        marginTop: 5,
    },
    scoreButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    runButton: {
        backgroundColor: '#444',
        padding: 20,
        borderRadius: 8,
        width: '30%',
        marginBottom: 10,
    },
    extraButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    extraButton: {
        backgroundColor: '#444',
        padding: 15,
        borderRadius: 8,
        width: '30%',
    },
    matchSummary: {
        backgroundColor: '#333',
        padding: 20,
        borderRadius: 8,
    },
    summaryTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    inningsSummary: {
        marginTop: 15,
    },
    inningsTitle: {
        color: '#4CAF50',
        fontSize: 18,
        marginTop: 10,
        marginBottom: 5,
    },
    inningsText: {
        color: 'white',
        fontSize: 16,
    },
    extraOptionsContainer: {
        backgroundColor: '#333',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    extraOptionSection: {
        marginBottom: 15,
    },
    extraOptionTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
});

const pickerSelectStyles = {
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#444',
        borderRadius: 8,
        color: 'white',
        backgroundColor: '#444',
        paddingRight: 30,
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#444',
        borderRadius: 8,
        color: 'white',
        backgroundColor: '#444',
        paddingRight: 30,
    },
    placeholder: {
        color: '#aaa',
    },
};

export default MatchScreen;
