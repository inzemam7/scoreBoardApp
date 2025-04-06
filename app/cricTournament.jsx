import { View, Text, StyleSheet , SafeAreaView, Platform} from 'react-native';

const Football = () => {
  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Football Page</Text>
    </View>
  );
};

export default Football;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection:'column',
     backgroundColor:'lightyellow'
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
  },
});