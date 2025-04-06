import { SafeAreaView, Text, StyleSheet, ScrollView, Platform } from 'react-native';

const Cricsingle = () => {
  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;

  return (
    <Container style={styles.container}>
      <Text style={styles.title}>One-off Match</Text>

      <Text>Enter the details of your game</Text>
      
    </Container>
  );
};

export default Cricsingle;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: 'lightyellow',
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    marginBottom:'auto',
    marginTop:'auto'

  },
});
