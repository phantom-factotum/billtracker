import React from 'react';
import { StyleSheet, Text, TouchableOpacity,View } from 'react-native';

export default function ErrorPopup (props){
  let { onPress, title, msg, buttonStyle, msgStyle,titleStyle } = props
  

  // if style is a prop put the default and the passed prop in an array
  let ButtonStyle = !buttonStyle ? styles.button : [styles.button,buttonStyle] 
  let MsgStyle = !msgStyle ? styles.text : [styles.text,{marginTop:0},msgStyle] 
  let TitleStyle = !titleStyle ? [styles.text,{marginBottom:0},{fontWeight:"700"}] : 
    [styles.text,{fontWeight:"700"}, titleStyle] 
  //flatten the style array and use compose to overwrite the defaults 
  ButtonStyle = StyleSheet.compose(flatten(ButtonStyle))
  MsgStyle = StyleSheet.compose(flatten(MsgStyle))
  TitleStyle = StyleSheet.compose(flatten(TitleStyle))
  return (
    <TouchableOpacity onPress={ onPress } style={ ButtonStyle }>
      <View style={{opacity:1,alignItems:'center'}}>
        {title && <Text style={ TitleStyle }>{title}</Text>}
        {msg && <Text style={ MsgStyle }>{ msg }</Text>}
      </View>
    </TouchableOpacity>
  )
}
//because the passed prop may have nested styles, flatten them to achieve
//proper stylesheet compose
function flatten(arr,lvl=2){
  if(arr && arr.flat)
    return arr.flat(2)
  // return original item if it cant been flatten
  return arr
}
const styles = StyleSheet.create({
  text: {
    textAlign:'center',
    color: '#000',
    fontSize: 14,
    flexWrap:'wrap'
  },
  button:{
    borderWidth:2,
    backgroundColor:'transparent',
    width:40,
    height:40,
    borderRadius:50,
    alignItems:'center',
    justifyContent:'center',
    opacity:1,
  }
});