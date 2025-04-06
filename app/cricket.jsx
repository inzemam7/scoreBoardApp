import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

const Cricket = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cricket</Text>

      <Link href="/cricSingle" asChild>
        <Text style={styles.Link}>One-off Match</Text>
      </Link>

      <Link href="/cricTournament" asChild>
        <Text style={styles.Link}>Tournament</Text>
      </Link>
    </View>
  );
};

export default Cricket;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    backgroundColor: "lightyellow",
  },
  title: {
    fontSize: 60,
    fontWeight: "bold",
    margin: 'auto',
  },
  Link: {
    color: "white",
    fontSize: 35,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#333",
    marginTop: "0",
    marginBlockEnd: "90",
    height: "auto",
    width: 300,
    margin: "auto",
    borderRadius: 50,
    paddingBlockStart: "auto",
  }
});