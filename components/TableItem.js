import React from 'react';
import { 
	View,
	StyleSheet,
	Text,
	
} from 'react-native';
import { ColorScheme } from './genColors'
export default function TableItem({title, value}){
	return (
		<View style ={{flexDirection:'row',width:'100%',margin:0,borderTopWidth:2,borderColor:ColorScheme[0]}}>
			<View style={{width:'50%'}}>
				<Text style={{justifyContent:'flex-start'}}>{title}</Text>
			</View>
			<View style={{flex:1}}/>
			<View style={{width:'30%',justifyContent:'center',alignItems:'center'}}>
				<Text style={{width:'100%',textAlign:'right'}}>{value}</Text>
			</View>
		</View>
	)
}