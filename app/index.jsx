import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const scoreBoard = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.Text}>InScore</Text> 
      <Link href='app/cricket.jsx' style={styles.Link}>Cricket</Link> 
      <Link href='app/football.jsx' style={styles.Link}>Football</Link>
      <Link href='app/aboutUs.jsx' style={styles.Link}>About Us</Link>
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
    marginTop:40,
    marginBottom:90,
    height:200,
    width:370,
    margin:'auto',
    borderRadius:60,
    paddingBlockStart:55
  },
  Link:{
    color:'white',
    fontSize:35,
    fontWeight:'bold',
    textAlign:'center',
    backgroundColor:"#333",
    marginTop:'2',
    height:'auto',
    width:300,
    margin:'auto',
    borderRadius:50,
    paddingBlockStart:'auto'
  },

});