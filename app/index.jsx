import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Link } from "expo-router";

const Index = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.Text}>InScore</Text>

      <Link href="/cricket" style={styles.Link}>
        <Text style={styles.linkText}>Cricket</Text>
      </Link>

      <Link href="/football" style={styles.Link}>
        <Text style={styles.linkText}>Football</Text>
      </Link>

      <Link href="/aboutUs" style={styles.Link}>
        <Text style={styles.linkText}>About Us</Text>
      </Link>
    </View>
  );
};

export default Index;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "lightyellow",
  },
  Text: {
    color: "white",
    fontSize: 50,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "gold",
    marginTop: 40,
    marginBottom: 90,
    height: 200,
    width: 370,
    margin: "auto",
    borderRadius: 60,
    paddingBlockStart: 55,
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
