import { View, Text, StyleSheet , SafeAreaView, Platform} from 'react-native';

const AboutUs = () => {
  const Container = Platform.OS === 'web' ? ScrollView : SafeAreaView;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About Us</Text>
      <Text style={styles.Text}>Syed Inzemamuddin : 22361A05B4</Text>
      <Text style={styles.Text}>Nawaz Mohd Khan: 22361A0577</Text>
      <Text style={styles.Text}>Nikitha : 22361A0580</Text>
      <Text style={styles.Text}>Sharnika : 22361A0591</Text>
      <Text style={styles.Text}>Syed Mubassir : 22361A05B5</Text>

    </View>
  );
};

export default AboutUs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column',
    alignItems: 'center',
    flexDirection:'column',
     backgroundColor:'lightyellow'
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign:'center',
    margin:30
  },
  Text: {
    fontSize: 20,
    fontWeight:'700',
    backgroundColor:'papayawhip',
    textAlign:'center',
    margin:10,
    padding:10,
    borderRadius:20
  }
});
