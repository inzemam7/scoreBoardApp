import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const scoreBoard = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.Text}>InScore</Text>                    

    </View>
  )
}

export default scoreBoard

const styles = StyleSheet.create({
  container :{
    flex:1,
    flexDirection:'column',
    backgroundColor:'lightyellow'
  },
  Text:{
    color:'white',
    fontSize:50,
    fontWeight:'bold',
    textAlign:'center',
    backgroundColor:"gold",
    marginTop:30,
    height:200,
    width:370,
    margin:20,
    borderRadius:60,
    paddingBlockStart:55
  },
});