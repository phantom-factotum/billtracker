import React from 'react';
import {
	View, Text, StyleSheet
} from 'react-native';
import { setOpacity } from './genColors'
let height = 20;
const appPrimaryColor = '#0000D3'

function Item({item}){
	let {name,id,isPlaceholder,isSelected,color} = item;
	if(isPlaceholder){
		return (
			<View style={[styles.item,styles.placeholder]}>
				<Text style={styles.titleText}>{name || "Boy u have failed"}</Text>
			</View>
		);
	}
	color = color || appPrimaryColor
	const style = [styles.item];
	if( isSelected )
		style.push({...styles.selected,backgroundColor:setOpacity(color,.3),borderColor:color})
	return (
		<View style={style}>
			<Text style={styles.titleText}>{name || item.toString()}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	item:{
		backgroundColor:'white',
		justifyContent:'center',
		alignItems:'center',
	},
	placeholder:{
		backgroundColor:'transparent',
		paddingVertical:5,
		justifyContent:'center',
		width:'100%',
		borderBottomWidth:4,
		borderBottomColor:'lightgray'
	},
	selected:{
		borderWidth:2,
		borderRadius:50,
		borderColor:'blue',
	},
	titleText:{
		fontSize:16,
		// fontWeight:'700',
		width:'90%',
		textAlign:'center',
		justifyContent:'center'
	}
})

Item.height = height;
export default Item;