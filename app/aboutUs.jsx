import { View, Text, StyleSheet , SafeAreaView, Platform} from 'react-native';

const AboutUs = () => {
  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About Us Page</Text>
    </View>
  );
};

export default AboutUs;

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
