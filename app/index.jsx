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
    alignItems: "center", // Centering items horizontally
    justifyContent: "center", // Centering items vertically
    padding: 20, // Ensuring spacing around the content
  },
  Text: {
    color: "white",
    fontSize: 50,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "gold",
    marginBottom: 50, // Adjusting bottom margin
    height: 150, // Reduced height for better appearance
    width: "80%", // Using percentage width to make it more responsive
    borderRadius: 60,
    justifyContent: "center", // Centering text vertically inside the box
    paddingVertical: 50, // Padding to center the text vertically
  },
  Link: {
    marginTop: 15, // Adding margin to space out the links
    marginBottom: 10, // Adjusted margin to separate links properly
    width: 300,
    alignItems: "center", // Center the link text horizontally
    backgroundColor: "#333",
    paddingVertical: 15,
    borderRadius: 50,
  },
  linkText: {
    color: "white",
    fontSize: 35,
    fontWeight: "bold",
    textAlign: "center",
  }
});
