// All imports stay the same
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, Alert, ScrollView, Modal } from 'react-native';
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
    const [teamPlayers, setTeamPlayers] = useState({});

    // Add new state variables for players
    const [teamAPlayers, setTeamAPlayers] = useState([]);
    const [teamBPlayers, setTeamBPlayers] = useState([]);
    const [currentBatter1, setCurrentBatter1] = useState(null);
    const [currentBatter2, setCurrentBatter2] = useState(null);
    const [currentBowler, setCurrentBowler] = useState(null);
    const [showPlayerSelection, setShowPlayerSelection] = useState(false);

    const [inningsData, setInningsData] = useState([
        { score: 0, wickets: 0, balls: 0, history: [] },
        { score: 0, wickets: 0, balls: 0, history: [] },
    ]);

    const [oversLimit, setOversLimit] = useState(2);
    const [isMatchOver, setIsMatchOver] = useState(false);
    const [target, setTarget] = useState(null);
    const [winner, setWinner] = useState(null);
    
    const [showWideOptions, setShowWideOptions] = useState(false);
    const [showNoBallOptions, setShowNoBallOptions] = useState(false);
    const [showLegByeOptions, setShowLegByeOptions] = useState(false);

    const extraRunOptions = [0, 1, 2, 3, 4, 5, 6];

    // Add these new state variables at the top with other state declarations
    const [showBatter1Dropdown, setShowBatter1Dropdown] = useState(false);
    const [showBatter2Dropdown, setShowBatter2Dropdown] = useState(false);
    const [showBowlerDropdown, setShowBowlerDropdown] = useState(false);
    const [showNewBatterPopup, setShowNewBatterPopup] = useState(false);
    const [showNewBowlerPopup, setShowNewBowlerPopup] = useState(false);

    const [outBatsmen, setOutBatsmen] = useState([]);

    const [onStrike, setOnStrike] = useState('batter1'); // 'batter1' or 'batter2'

    const [batterStats, setBatterStats] = useState({ batter1: { runs: 0, balls: 0 }, batter2: { runs: 0, balls: 0 } });
    const [bowlerStats, setBowlerStats] = useState({});

    // Add new state for dropdown position
    const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0, width: 0 });

    // Add refs for the fields
    const batter1FieldRef = useRef(null);
    const batter2FieldRef = useRef(null);
    const bowlerFieldRef = useRef(null);

    const [isSuperOver, setIsSuperOver] = useState(false);
    const [superOverData, setSuperOverData] = useState({
        team1: { score: 0, balls: 0 },
        team2: { score: 0, balls: 0 }
    });

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

                // Fetch team setup data
                const teamPlayersData = await AsyncStorage.getItem('teamPlayers');
                const teamNamesData = await AsyncStorage.getItem('teamNamesInput');
                
                if (teamPlayersData && teamNamesData) {
                    const players = JSON.parse(teamPlayersData);
                    const teamNames = JSON.parse(teamNamesData);
                    
                    setTeamPlayers(players);
                    
                    // Get the correct team players based on team names
                    const teamAKey = Object.keys(players).find(key => teamNames[key] === teamAName);
                    const teamBKey = Object.keys(players).find(key => teamNames[key] === teamBName);
                    
                    const teamAPlayersList = teamAKey ? Object.values(players[teamAKey]) : [];
                    const teamBPlayersList = teamBKey ? Object.values(players[teamBKey]) : [];
                    
                    console.log('Team A Players:', teamAPlayersList);
                    console.log('Team B Players:', teamBPlayersList);
                    
                    setTeamAPlayers(teamAPlayersList);
                    setTeamBPlayers(teamBPlayersList);
                }

                // Fetch tournament setup data for overs
                const tournamentData = await AsyncStorage.getItem('cricTournamentSetup');
                if (tournamentData) {
                    const parsed = JSON.parse(tournamentData);
                    if (parsed.overs) {
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
        setShowPlayerSelection(true);
    };

    const handlePlayerSelection = () => {
        if (!currentBatter1 || !currentBatter2 || !currentBowler) {
            Alert.alert('Selection Required', 'Please select both batters and a bowler');
            return;
        }

        // Check if any player is selected more than once
        if (currentBatter1 === currentBatter2 || 
            currentBatter1 === currentBowler || 
            currentBatter2 === currentBowler) {
            Alert.alert('Invalid Selection', 'A player cannot be selected more than once');
            return;
        }

        setShowPlayerSelection(false);
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

        // Switch batting and bowling teams
        setBattingTeam(bowlingTeam);
        setBowlingTeam(battingTeam);
        setCurrentInning(2);

        // Reset batter stats for new batters
        setBatterStats({ batter1: { runs: 0, balls: 0 }, batter2: { runs: 0, balls: 0 } });

        // Show player selection popups at the start of the second inning
        setShowPlayerSelection(true);
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
        const team1Score = inningsData[0].score;
        const team2Score = inningsData[1].score;

        // Check if match is tied
        if (team1Score === team2Score) {
            setIsSuperOver(true);
            // In super over, the team that batted second in main match bats first
            // So if currentInning is 2, battingTeam is the one that should bat first in super over
            const superOverBattingTeam = currentInning === 2 ? battingTeam : bowlingTeam;
            const superOverBowlingTeam = superOverBattingTeam === teamAName ? teamBName : teamAName;
            
            setBattingTeam(superOverBattingTeam);
            setBowlingTeam(superOverBowlingTeam);
            setCurrentInning(1);
            setOversLimit(1); // Super over is 1 over
            setInningsData([
                { score: 0, wickets: 0, balls: 0, history: [] },
                { score: 0, wickets: 0, balls: 0, history: [] }
            ]);
            setBatterStats({ batter1: { runs: 0, balls: 0 }, batter2: { runs: 0, balls: 0 } });
            setBowlerStats({});
            setOutBatsmen([]);
            setShowPlayerSelection(true);
            return;
        }

        setIsMatchOver(true);
        setWinner(matchWinner);

        const matchData = {
            teamA: teamAName,
            teamB: teamBName,
            winner: matchWinner,
            matchNumber: parseInt(matchNumber) || 1,
            round: getRoundName(),
            playedOn: new Date().toLocaleString(),
            innings: [
                {
                    team: currentInning === 1 ? battingTeam : bowlingTeam,
                    score: inningsData[0].score,
                    wickets: inningsData[0].wickets,
                    overs: (Math.floor(inningsData[0].balls / 6) + (inningsData[0].balls % 6) / 10).toFixed(1)
                },
                {
                    team: currentInning === 2 ? battingTeam : bowlingTeam,
                    score: inningsData[1].score,
                    wickets: inningsData[1].wickets,
                    overs: (Math.floor(inningsData[1].balls / 6) + (inningsData[1].balls % 6) / 10).toFixed(1)
                }
            ],
            tossWinner,
            tossDecision,
            target: target || null,
            result: getMatchResult(matchWinner),
            isSuperOver: isSuperOver,
            superOverData: isSuperOver ? superOverData : null
        };

        Alert.alert(
            '🏆 Match Over',
            getMatchSummary(matchData),
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

    const getRoundName = () => {
        if (!isSingleMatch) {
            const currentRound = parseInt(matchNumber);
            if (currentRound <= 2) return 'Quarter Finals';
            if (currentRound <= 4) return 'Semi Finals';
            return 'Finals';
        }
        return null;
    };

    const getMatchResult = (matchWinner) => {
        if (matchWinner === 'Tie') return 'Match Tied';
        
        const winningInnings = currentInning === 1 ? 0 : 1;
        const isChasingTeamWon = currentInning === 2 && matchWinner === battingTeam;
        
        if (isChasingTeamWon) {
            // If chasing team won, show wickets remaining
            const wicketsRemaining = 10 - inningsData[1].wickets;
            return `${matchWinner} won by ${wicketsRemaining} wickets`;
        } else {
            // If defending team won, show runs margin
            const margin = currentInning === 2 
                ? `${target - inningsData[1].score - 1} runs`
                : `${10 - inningsData[0].wickets} wickets`;
            return `${matchWinner} won by ${margin}`;
        }
    };

    const getMatchSummary = (matchData) => {
        let summary = matchData.winner === 'Tie' 
            ? "It's a tie!\n\n" 
            : `${matchData.winner} wins!\n\n`;

        summary += `${matchData.innings[0].team}: ${matchData.innings[0].score}/${matchData.innings[0].wickets} (${matchData.innings[0].overs})\n`;
        summary += `${matchData.innings[1].team}: ${matchData.innings[1].score}/${matchData.innings[1].wickets} (${matchData.innings[1].overs})\n\n`;
        summary += matchData.result;
        summary += '\n\nDo you want to save this match to history?';

        return summary;
    };

    const updateBall = (runs, extra = false, isWicket = false, extraType = null) => {
        if (isMatchOver) return;

        const newData = [...inningsData];
        const inningIndex = currentInning - 1;
        const historyEntry = { type: '', runs: 0 };

        if (isWicket) {
            newData[inningIndex].wickets += 1;
            newData[inningIndex].balls += 1;
            historyEntry.type = 'wicket';
            setOutBatsmen([...outBatsmen, currentBatter1]);
            setShowNewBatterPopup(true);
            setBowlerStats(prev => ({
                ...prev,
                [currentBowler]: {
                    ...prev[currentBowler],
                    wickets: (prev[currentBowler]?.wickets || 0) + 1,
                    balls: (prev[currentBowler]?.balls || 0) + 1
                }
            }));
        } else if (extra) {
            newData[inningIndex].score += runs;
            historyEntry.type = extraType || 'extra';
            historyEntry.runs = runs;
            
            // Handle leg byes differently
            if (extraType === 'legbye') {
                newData[inningIndex].balls += 1;
                // Add ball to batsman's stats but not runs
                if (onStrike === 'batter1') {
                    setBatterStats(prev => ({
                        ...prev,
                        batter1: { ...prev.batter1, balls: prev.batter1.balls + 1 }
                    }));
                } else {
                    setBatterStats(prev => ({
                        ...prev,
                        batter2: { ...prev.batter2, balls: prev.batter2.balls + 1 }
                    }));
                }
                // Change strike if odd number of runs
                if (runs % 2 !== 0) {
                    setOnStrike(onStrike === 'batter1' ? 'batter2' : 'batter1');
                }
            } else if (extraType === 'wide' || extraType === 'noball') {
                // For wides and no balls, consider only the additional runs (not the extra run) for strike rotation
                const additionalRuns = runs - 1; // Subtract 1 to get only the additional runs
                if (additionalRuns % 2 !== 0) {
                    setOnStrike(onStrike === 'batter1' ? 'batter2' : 'batter1');
                }
            }
            
            setBowlerStats(prev => ({
                ...prev,
                [currentBowler]: {
                    ...prev[currentBowler],
                    runs: (prev[currentBowler]?.runs || 0) + runs,
                    balls: extraType === 'legbye' ? (prev[currentBowler]?.balls || 0) + 1 : (prev[currentBowler]?.balls || 0)
                }
            }));
        } else {
            newData[inningIndex].score += runs;
            historyEntry.type = 'run';
            historyEntry.runs = runs;
            newData[inningIndex].balls += 1;

            // Update batter stats
            if (onStrike === 'batter1') {
                setBatterStats(prev => ({
                    ...prev,
                    batter1: { runs: prev.batter1.runs + runs, balls: prev.batter1.balls + 1 }
                }));
            } else {
                setBatterStats(prev => ({
                    ...prev,
                    batter2: { runs: prev.batter2.runs + runs, balls: prev.batter2.balls + 1 }
                }));
            }

            // Update bowler stats
            setBowlerStats(prev => ({
                ...prev,
                [currentBowler]: {
                    ...prev[currentBowler],
                    runs: (prev[currentBowler]?.runs || 0) + runs,
                    balls: (prev[currentBowler]?.balls || 0) + 1
                }
            }));

            // Rotate strike if odd number of runs
            if (runs % 2 !== 0) {
                setOnStrike(onStrike === 'batter1' ? 'batter2' : 'batter1');
            }
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

        // Only show new bowler popup after 6 legal balls (not counting extras)
        const legalBalls = newData[inningIndex].history.filter(entry => 
            entry.type === 'run' || entry.type === 'wicket' || entry.type === 'legbye'
        ).length;
        
        if (legalBalls > 0 && legalBalls % 6 === 0) {
            setOnStrike(onStrike === 'batter1' ? 'batter2' : 'batter1');
            setShowNewBowlerPopup(true);
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
            
            // First undo strike rotation if it was an odd number of runs
            if (last.runs % 2 !== 0) {
                setOnStrike(onStrike === 'batter1' ? 'batter2' : 'batter1');
            }

            // Then undo batter stats based on the original strike
            const originalStrike = last.runs % 2 !== 0 ? (onStrike === 'batter1' ? 'batter2' : 'batter1') : onStrike;
            
            if (originalStrike === 'batter1') {
                setBatterStats(prev => ({
                    ...prev,
                    batter1: { 
                        runs: Math.max(0, prev.batter1.runs - last.runs), 
                        balls: Math.max(0, prev.batter1.balls - 1) 
                    }
                }));
            } else {
                setBatterStats(prev => ({
                    ...prev,
                    batter2: { 
                        runs: Math.max(0, prev.batter2.runs - last.runs), 
                        balls: Math.max(0, prev.batter2.balls - 1) 
                    }
                }));
            }

            // Undo bowler stats
            setBowlerStats(prev => ({
                ...prev,
                [currentBowler]: {
                    ...prev[currentBowler],
                    runs: Math.max(0, prev[currentBowler].runs - last.runs),
                    balls: Math.max(0, prev[currentBowler].balls - 1)
                }
            }));
        } else if (last.type === 'extra') {
            newData[inningIndex].score -= last.runs;
            
            if (last.type === 'legbye') {
                newData[inningIndex].balls -= 1;
                
                // First undo strike rotation if it was an odd number of runs
                if (last.runs % 2 !== 0) {
                    setOnStrike(onStrike === 'batter1' ? 'batter2' : 'batter1');
                }

                // Then undo batter ball count based on the original strike
                const originalStrike = last.runs % 2 !== 0 ? (onStrike === 'batter1' ? 'batter2' : 'batter1') : onStrike;
                
                if (originalStrike === 'batter1') {
                    setBatterStats(prev => ({
                        ...prev,
                        batter1: { ...prev.batter1, balls: Math.max(0, prev.batter1.balls - 1) }
                    }));
                } else {
                    setBatterStats(prev => ({
                        ...prev,
                        batter2: { ...prev.batter2, balls: Math.max(0, prev.batter2.balls - 1) }
                    }));
                }
            }

            // Undo bowler stats
            setBowlerStats(prev => ({
                ...prev,
                [currentBowler]: {
                    ...prev[currentBowler],
                    runs: Math.max(0, prev[currentBowler].runs - last.runs),
                    balls: last.type === 'legbye' ? Math.max(0, prev[currentBowler].balls - 1) : prev[currentBowler].balls
                }
            }));
        } else if (last.type === 'wicket') {
            newData[inningIndex].wickets -= 1;
            newData[inningIndex].balls -= 1;
            
            // Remove the last out batsman
            setOutBatsmen(prev => prev.slice(0, -1));
            
            // Undo bowler stats
            setBowlerStats(prev => ({
                ...prev,
                [currentBowler]: {
                    ...prev[currentBowler],
                    wickets: Math.max(0, prev[currentBowler].wickets - 1),
                    balls: Math.max(0, prev[currentBowler].balls - 1)
                }
            }));
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

    const renderPlayerSelection = () => {
        // Get the correct team players based on batting/bowling
        const battingTeamPlayers = battingTeam === teamAName ? teamAPlayers : teamBPlayers;
        const bowlingTeamPlayers = bowlingTeam === teamAName ? teamAPlayers : teamBPlayers;

        return (
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Players</Text>
                    
                    <Text style={styles.sectionTitle}>Select Batters:</Text>
                    <View style={styles.playerSelection}>
                        <View style={styles.playerColumn}>
                            <Text style={styles.playerLabel}>Batter 1:</Text>
                            <View style={styles.dropdownWrapper}>
                                <TouchableOpacity 
                                    ref={batter1FieldRef}
                                    style={styles.dropdownField}
                                    onPress={(event) => handleDropdownPress(event, batter1FieldRef, setShowBatter1Dropdown, showBatter1Dropdown)}
                                >
                                    <Text style={styles.dropdownButtonText}>
                                        {currentBatter1 || 'Select Batter 1'}
                                    </Text>
                                </TouchableOpacity>
                                {showBatter1Dropdown && (
                                    <Modal
                                        transparent={true}
                                        visible={showBatter1Dropdown}
                                        onRequestClose={() => setShowBatter1Dropdown(false)}
                                    >
                                        <TouchableOpacity 
                                            style={styles.modalOverlay}
                                            activeOpacity={1}
                                            onPress={() => setShowBatter1Dropdown(false)}
                                        >
                                            <View style={[styles.dropdownList, { 
                                                position: 'absolute',
                                                top: dropdownPosition.y,
                                                left: dropdownPosition.x,
                                                width: dropdownPosition.width,
                                            }]}>
                                                <ScrollView 
                                                    style={styles.dropdownScrollView}
                                                    showsVerticalScrollIndicator={true}
                                                    nestedScrollEnabled={true}
                                                    scrollEnabled={true}
                                                >
                                            {battingTeamPlayers.map((player, index) => (
                                                <TouchableOpacity
                                                    key={`batter1-${index}`}
                                                    style={styles.dropdownItem}
                                                    onPress={() => {
                                                        setCurrentBatter1(player);
                                                        setShowBatter1Dropdown(false);
                                                    }}
                                                >
                                                    <Text style={styles.dropdownItemText}>{player}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                        </TouchableOpacity>
                                    </Modal>
                                )}
                            </View>
                        </View>
                        
                        <View style={styles.playerColumn}>
                            <Text style={styles.playerLabel}>Batter 2:</Text>
                            <View style={styles.dropdownWrapper}>
                                <TouchableOpacity 
                                    ref={batter2FieldRef}
                                    style={styles.dropdownField}
                                    onPress={(event) => handleDropdownPress(event, batter2FieldRef, setShowBatter2Dropdown, showBatter2Dropdown)}
                                >
                                    <Text style={styles.dropdownButtonText}>
                                        {currentBatter2 || 'Select Batter 2'}
                                    </Text>
                                </TouchableOpacity>
                                {showBatter2Dropdown && (
                                    <Modal
                                        transparent={true}
                                        visible={showBatter2Dropdown}
                                        onRequestClose={() => setShowBatter2Dropdown(false)}
                                    >
                                        <TouchableOpacity 
                                            style={styles.modalOverlay}
                                            activeOpacity={1}
                                            onPress={() => setShowBatter2Dropdown(false)}
                                        >
                                            <View style={[styles.dropdownList, { 
                                                position: 'absolute',
                                                top: dropdownPosition.y,
                                                left: dropdownPosition.x,
                                                width: dropdownPosition.width,
                                            }]}>
                                                <ScrollView 
                                                    style={styles.dropdownScrollView}
                                                    showsVerticalScrollIndicator={true}
                                                    nestedScrollEnabled={true}
                                                    scrollEnabled={true}
                                                >
                                            {battingTeamPlayers.map((player, index) => (
                                                <TouchableOpacity
                                                    key={`batter2-${index}`}
                                                    style={styles.dropdownItem}
                                                    onPress={() => {
                                                        setCurrentBatter2(player);
                                                        setShowBatter2Dropdown(false);
                                                    }}
                                                >
                                                    <Text style={styles.dropdownItemText}>{player}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                        </TouchableOpacity>
                                    </Modal>
                                )}
                            </View>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Select Bowler:</Text>
                    <View style={styles.dropdownWrapper}>
                        <TouchableOpacity 
                            ref={bowlerFieldRef}
                            style={styles.dropdownField}
                            onPress={(event) => handleDropdownPress(event, bowlerFieldRef, setShowBowlerDropdown, showBowlerDropdown)}
                        >
                            <Text style={styles.dropdownButtonText}>
                                {currentBowler || 'Select Bowler'}
                            </Text>
                        </TouchableOpacity>
                        {showBowlerDropdown && (
                            <Modal
                                transparent={true}
                                visible={showBowlerDropdown}
                                onRequestClose={() => setShowBowlerDropdown(false)}
                            >
                                <TouchableOpacity 
                                    style={styles.modalOverlay}
                                    activeOpacity={1}
                                    onPress={() => setShowBowlerDropdown(false)}
                                >
                                    <View style={[styles.dropdownList, { 
                                        position: 'absolute',
                                        top: dropdownPosition.y,
                                        left: dropdownPosition.x,
                                        width: dropdownPosition.width,
                                    }]}>
                                        <ScrollView 
                                            style={styles.dropdownScrollView}
                                            showsVerticalScrollIndicator={true}
                                            nestedScrollEnabled={true}
                                            scrollEnabled={true}
                                        >
                                    {bowlingTeamPlayers.map((player, index) => (
                                        <TouchableOpacity
                                            key={`bowler-${index}`}
                                            style={styles.dropdownItem}
                                            onPress={() => {
                                                setCurrentBowler(player);
                                                setShowBowlerDropdown(false);
                                            }}
                                        >
                                                    <Text style={styles.dropdownItemText}>
                                                        {player} {bowlerStats[player] ? 
                                                            `(${bowlerStats[player].wickets}/${bowlerStats[player].runs} in ${Math.floor(bowlerStats[player].balls/6)}.${bowlerStats[player].balls%6})` 
                                                            : ''}
                                                    </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                                </TouchableOpacity>
                            </Modal>
                        )}
                    </View>

                    <TouchableOpacity 
                        style={styles.confirmButton}
                        onPress={handlePlayerSelection}
                    >
                        <Text style={styles.confirmButtonText}>Confirm Selection</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderNewBatterPopup = () => {
        const battingTeamPlayers = battingTeam === teamAName ? teamAPlayers : teamBPlayers;
        const availablePlayers = battingTeamPlayers.filter(player => !outBatsmen.includes(player) && player !== currentBatter1 && player !== currentBatter2);
        return (
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select New Batter</Text>
                    <View style={styles.dropdownWrapper}>
                        <TouchableOpacity 
                            style={styles.dropdownField}
                            onPress={(event) => {
                                measureDropdownPosition(event);
                                setShowBatter1Dropdown(!showBatter1Dropdown);
                            }}
                        >
                            <Text style={styles.dropdownButtonText}>
                                {currentBatter1 || 'Select New Batter'}
                            </Text>
                        </TouchableOpacity>
                        {showBatter1Dropdown && (
                            <Modal
                                transparent={true}
                                visible={showBatter1Dropdown}
                                onRequestClose={() => setShowBatter1Dropdown(false)}
                            >
                                <TouchableOpacity 
                                    style={styles.modalOverlay}
                                    activeOpacity={1}
                                    onPress={() => setShowBatter1Dropdown(false)}
                                >
                                    <View style={[styles.dropdownList, { zIndex: 999999 }]}>
                                        <ScrollView 
                                            style={[styles.dropdownScrollView, { zIndex: 999999 }]}
                                            showsVerticalScrollIndicator={true}
                                            nestedScrollEnabled={true}
                                            scrollEnabled={true}
                                            contentContainerStyle={{ flexGrow: 1 }}
                                        >
                                    {availablePlayers.map((player, index) => (
                                        <TouchableOpacity
                                            key={`newbatter-${index}`}
                                                    style={[styles.dropdownItem, { zIndex: 999999 }]}
                                            onPress={() => {
                                                setCurrentBatter1(player);
                                                setBatterStats(prev => ({ ...prev, batter1: { runs: 0, balls: 0 } }));
                                                setShowBatter1Dropdown(false);
                                                setShowNewBatterPopup(false);
                                            }}
                                        >
                                            <Text style={styles.dropdownItemText}>{player}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                                </TouchableOpacity>
                            </Modal>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    const renderNewBowlerPopup = () => {
        const bowlingTeamPlayers = bowlingTeam === teamAName ? teamAPlayers : teamBPlayers;
        return (
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select New Bowler</Text>
                    <View style={styles.dropdownWrapper}>
                        <TouchableOpacity 
                            style={styles.dropdownField}
                            onPress={(event) => {
                                measureDropdownPosition(event);
                                setShowBowlerDropdown(!showBowlerDropdown);
                            }}
                        >
                            <Text style={styles.dropdownButtonText}>
                                {currentBowler || 'Select New Bowler'}
                            </Text>
                        </TouchableOpacity>
                        {showBowlerDropdown && (
                            <Modal
                                transparent={true}
                                visible={showBowlerDropdown}
                                onRequestClose={() => setShowBowlerDropdown(false)}
                            >
                                <TouchableOpacity 
                                    style={styles.modalOverlay}
                                    activeOpacity={1}
                                    onPress={() => setShowBowlerDropdown(false)}
                                >
                                    <View style={[styles.dropdownList, { zIndex: 999999 }]}>
                                        <ScrollView 
                                            style={[styles.dropdownScrollView, { zIndex: 999999 }]}
                                            showsVerticalScrollIndicator={true}
                                            nestedScrollEnabled={true}
                                            scrollEnabled={true}
                                            contentContainerStyle={{ flexGrow: 1 }}
                                        >
                                    {bowlingTeamPlayers.map((player, index) => (
                                        <TouchableOpacity
                                            key={`newbowler-${index}`}
                                                    style={[styles.dropdownItem, { zIndex: 999999 }]}
                                            onPress={() => {
                                                setCurrentBowler(player);
                                                if (!bowlerStats[player]) {
                                                    setBowlerStats(prev => ({
                                                        ...prev,
                                                        [player]: { runs: 0, wickets: 0, balls: 0 }
                                                    }));
                                                }
                                                setShowBowlerDropdown(false);
                                                setShowNewBowlerPopup(false);
                                            }}
                                        >
                                            <Text style={styles.dropdownItemText}>
                                                {player} {bowlerStats[player] ? 
                                                    `(${bowlerStats[player].wickets}/${bowlerStats[player].runs} in ${Math.floor(bowlerStats[player].balls/6)}.${bowlerStats[player].balls%6})` 
                                                    : ''}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                                </TouchableOpacity>
                            </Modal>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    const measureDropdownPosition = (event, fieldRef) => {
        if (!fieldRef || !fieldRef.current) {
            console.warn('Field ref not initialized');
            return;
        }
        
        fieldRef.current.measure((x, y, width, height, pageX, pageY) => {
            if (pageX === undefined || pageY === undefined) {
                console.warn('Could not measure field position');
                return;
            }
            
            setDropdownPosition({
                x: pageX,
                y: pageY + height,
                width: width
            });
        });
    };

    // Update the dropdown triggers to use event-based positioning as fallback
    const handleDropdownPress = (event, fieldRef, setShowDropdown, showDropdown) => {
        if (fieldRef && fieldRef.current) {
            measureDropdownPosition(event, fieldRef);
        } else {
            // Fallback to event-based positioning
            const { pageY, pageX } = event.nativeEvent;
            setDropdownPosition({
                x: pageX,
                y: pageY + 50,
                width: 200 // Default width
            });
        }
        setShowDropdown(!showDropdown);
    };

    const renderExtrasContainer = () => {
        return (
            <View style={styles.extrasContainer}>
                <View style={styles.extraColumn}>
                    <Text style={styles.extraTitle}>Wide Ball Options</Text>
                    <TouchableOpacity
                        style={styles.extraButton}
                        onPress={() => setShowWideOptions(!showWideOptions)}
                    >
                        <Text style={styles.buttonText}>Wide +</Text>
                    </TouchableOpacity>
                    {showWideOptions && (
                        <Modal
                            transparent={true}
                            visible={showWideOptions}
                            onRequestClose={() => setShowWideOptions(false)}
                        >
                            <TouchableOpacity 
                                style={styles.modalOverlay}
                                activeOpacity={1}
                                onPress={() => setShowWideOptions(false)}
                            >
                                <View style={[styles.dropdownList, { 
                                    position: 'absolute',
                                    top: '50%',
                                    left: '25%',
                                    width: '50%',
                                    maxHeight: 300,
                                }]}>
                                    <ScrollView 
                                        style={styles.dropdownScrollView}
                                        showsVerticalScrollIndicator={true}
                                        nestedScrollEnabled={true}
                                        scrollEnabled={true}
                                    >
                                        {extraRunOptions.map((runs) => (
                                            <TouchableOpacity
                                                key={`wide${runs}`}
                                                style={styles.dropdownItem}
                                                onPress={() => {
                                                    updateBall(runs + 1, true, false, 'wide');
                                                    setShowWideOptions(false);
                                                }}
                                            >
                                                <Text style={styles.dropdownItemText}>Wide + {runs}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            </TouchableOpacity>
                        </Modal>
                    )}
                </View>

                <View style={styles.extraColumn}>
                    <Text style={styles.extraTitle}>No Ball Options</Text>
                    <TouchableOpacity
                        style={styles.extraButton}
                        onPress={() => setShowNoBallOptions(!showNoBallOptions)}
                    >
                        <Text style={styles.buttonText}>No Ball +</Text>
                    </TouchableOpacity>
                    {showNoBallOptions && (
                        <Modal
                            transparent={true}
                            visible={showNoBallOptions}
                            onRequestClose={() => setShowNoBallOptions(false)}
                        >
                            <TouchableOpacity 
                                style={styles.modalOverlay}
                                activeOpacity={1}
                                onPress={() => setShowNoBallOptions(false)}
                            >
                                <View style={[styles.dropdownList, { 
                                    position: 'absolute',
                                    top: '50%',
                                    left: '25%',
                                    width: '50%',
                                    maxHeight: 300,
                                }]}>
                                    <ScrollView 
                                        style={styles.dropdownScrollView}
                                        showsVerticalScrollIndicator={true}
                                        nestedScrollEnabled={true}
                                        scrollEnabled={true}
                                    >
                                        {extraRunOptions.map((runs) => (
                                            <TouchableOpacity
                                                key={`noball${runs}`}
                                                style={styles.dropdownItem}
                                                onPress={() => {
                                                    updateBall(runs + 1, true, false, 'noball');
                                                    setShowNoBallOptions(false);
                                                }}
                                            >
                                                <Text style={styles.dropdownItemText}>No Ball + {runs}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            </TouchableOpacity>
                        </Modal>
                    )}
                </View>

                <View style={styles.extraColumn}>
                    <Text style={styles.extraTitle}>Leg Bye Options</Text>
                    <TouchableOpacity
                        style={styles.extraButton}
                        onPress={() => setShowLegByeOptions(!showLegByeOptions)}
                    >
                        <Text style={styles.buttonText}>Leg Bye +</Text>
                    </TouchableOpacity>
                    {showLegByeOptions && (
                        <Modal
                            transparent={true}
                            visible={showLegByeOptions}
                            onRequestClose={() => setShowLegByeOptions(false)}
                        >
                            <TouchableOpacity 
                                style={styles.modalOverlay}
                                activeOpacity={1}
                                onPress={() => setShowLegByeOptions(false)}
                            >
                                <View style={[styles.dropdownList, { 
                                    position: 'absolute',
                                    top: '50%',
                                    left: '25%',
                                    width: '50%',
                                    maxHeight: 300,
                                }]}>
                                    <ScrollView 
                                        style={styles.dropdownScrollView}
                                        showsVerticalScrollIndicator={true}
                                        nestedScrollEnabled={true}
                                        scrollEnabled={true}
                                    >
                                        {extraRunOptions.map((runs) => (
                                            <TouchableOpacity
                                                key={`legbye${runs}`}
                                                style={styles.dropdownItem}
                                                onPress={() => {
                                                    updateBall(runs, true, false, 'legbye');
                                                    setShowLegByeOptions(false);
                                                }}
                                            >
                                                <Text style={styles.dropdownItemText}>Leg Bye + {runs}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            </TouchableOpacity>
                        </Modal>
                    )}
                </View>
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>
                    {isViewOnly ? '📜 Match Details' :
                     isSuperOver ? '🎯 Super Over' :
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
                    {isSuperOver ? (
                        <Text style={styles.superOverText}>Super Over in Progress</Text>
                    ) : (
                        <Text style={styles.tossResult}>
                            {tossWinner} won the toss and chose to {tossDecision}
                        </Text>
                    )}
                    <Text style={styles.inningText}>
                        {currentInning === 1
                            ? `1st Inning - ${battingTeam} Batting`
                            : `2nd Inning - ${battingTeam} Batting`}
                    </Text>

                    {currentInning === 2 && target && (
                        <Text style={styles.targetText}>Target: {target}</Text>
                    )}

                    {renderInningsSummary()}

                    <View style={styles.scoreBoard}>
                        <Text style={styles.scoreText}>
                            Score: {currentData.score}/{currentData.wickets}
                        </Text>
                        <Text style={styles.scoreText}>
                            Overs: {overs}.{currentBall} / {oversLimit}
                        </Text>
                        <View style={styles.playerInfoContainer}>
                            <View style={styles.battersContainer}>
                                <Text style={styles.playerInfo}>
                                    Batter1: {currentBatter1} {onStrike === 'batter1' ? '•' : ''} - {batterStats.batter1.runs}({batterStats.batter1.balls})
                                </Text>
                                <Text style={styles.playerInfo}>
                                    Batter2: {currentBatter2} {onStrike === 'batter2' ? '•' : ''} - {batterStats.batter2.runs}({batterStats.batter2.balls})
                                </Text>
                            </View>
                            <View style={styles.bowlerContainer}>
                                <Text style={styles.playerInfo}>
                                    Bowler: {currentBowler} - {bowlerStats[currentBowler]?.wickets || 0}/{bowlerStats[currentBowler]?.runs || 0} ({Math.floor((bowlerStats[currentBowler]?.balls || 0) / 6)}.{(bowlerStats[currentBowler]?.balls || 0) % 6})
                                </Text>
                            </View>
                        </View>
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
                        <Button title="Wicket" color="red" onPress={() => updateBall(0, false, true)} />
                        <Button title="Undo" color="#ffcc00" onPress={undoLastBall} />
                    </View>

                    {renderExtrasContainer()}
                </>
            )}

            {showPlayerSelection && renderPlayerSelection()}
            {showNewBatterPopup && renderNewBatterPopup()}
            {showNewBowlerPopup && renderNewBowlerPopup()}
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
  extrasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    padding: 10,
    position: 'relative',
    zIndex: 1,
  },
  extraColumn: {
    flex: 1,
    marginHorizontal: 5,
    position: 'relative',
    zIndex: 1,
  },
  extraTitle: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
  extraButton: {
    backgroundColor: '#444',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  optionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#333',
    borderRadius: 5,
    marginTop: 5,
    zIndex: 1000,
    elevation: 5,
    height: 200,
    borderWidth: 1,
    borderColor: '#444',
    overflow: 'hidden',
  },
  optionsScrollView: {
    flex: 1,
    maxHeight: 200,
    showsVerticalScrollIndicator: true,
  },
  optionButton: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  optionText: {
    color: 'white',
    textAlign: 'center',
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999999,
  },
  modalContent: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    zIndex: 999999,
  },
  modalTitle: {
    fontSize: 24,
    color: 'gold',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
  },
  playerSelection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
    position: 'relative',
    zIndex: 10003,
  },
  playerColumn: {
    flex: 1,
    position: 'relative',
    zIndex: 10003,
    elevation: 1,
  },
  playerLabel: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  dropdownWrapper: {
    position: 'relative',
    zIndex: 10003,
    elevation: 1,
  },
  dropdownField: {
    backgroundColor: '#444',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#666',
    minHeight: 50,
    justifyContent: 'center',
    marginBottom: 5,
    elevation: 1,
  },
  dropdownButtonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownList: {
    position: 'absolute',
    backgroundColor: '#333',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#666',
    maxHeight: 300,
    zIndex: 999999,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '100%',
  },
  dropdownScrollView: {
    flex: 1,
    maxHeight: 300,
    showsVerticalScrollIndicator: true,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    backgroundColor: '#333',
    zIndex: 999999,
  },
  dropdownItemText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    position: 'relative',
    zIndex: 10001,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  battersContainer: {
    alignItems: 'flex-start',
  },
  bowlerContainer: {
    alignItems: 'flex-end',
  },
  playerInfo: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
  superOverText: {
    fontSize: 24,
    color: 'gold',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold'
  },
});