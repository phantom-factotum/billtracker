import React, { 
	useState, 
	useEffect, 
	useContext 
} from 'react';
import { 
	View,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	Keyboard,
	KeyboardAvoidingView,
	Button
} from 'react-native';
import {Picker} from '@react-native-picker/picker';

import useExpenseContext from '../hooks/useExpenseContext';
import { ColorScheme } from '../Styles'

export const HoursInput = ()=>{
	const {  weeklyHours, setWeeklyHours } = useExpenseContext().context;
	const handleInputEditing = ({nativeEvent:{text}})=>{
		setWeeklyHours(text)
	}
	return (
		<KeyboardAvoidingView  behavior={"padding"} style={styles.hoursContainer}>
			<View style={styles.hourPromptContainer}>
				<Text style={styles.labelText}>Hours you are willing to work:</Text>
			</View>
			<View style={styles.hoursInputContainer}>
				<TextInput
					placeholder={"Hours?"}
					style={styles.textInput}
					keyboardType={"numeric"}
					label={useHours ? "Hours you are willing to work" : "Your wage ($/hr)"}
					onSubmitEditing={handleInputEditing}
					defaultValue={weeklyHours.toString()}
					returnKeyType={'done'}
				/>
			</View>
		</KeyboardAvoidingView>
	)
}
export const SalaryInput = ()=>{
	const {  weeklyHours, setWeeklyHours } = useExpenseContext().context;
	const handleInputEditing = ({nativeEvent:{text}})=>{
		setWeeklyHours(text)
	}
	return (
		<KeyboardAvoidingView  behavior={"padding"} style={styles.hoursContainer}>
			<View style={styles.hourPromptContainer}>
				<Text style={styles.labelText}>Wage ($/hr):</Text>
			</View>
			<View style={styles.hoursInputContainer}>
				<TextInput
					placeholder={"$/hr"}
					style={styles.textInput}
					keyboardType={"numeric"}
					returnKeyType={'done'}
				/>
			</View>
		</KeyboardAvoidingView>
	)
}

const styles = StyleSheet.create({
	hoursContainer:{
		flexDirection:'row',
		width:'100%',
		justifyContent:'space-between',
		paddingVertical:5
	},
	hoursPromptContainer:{
		justifyContent:'flex-start',
		width:'50%',
		flexWrap:'wrap'
	},
	hoursInputContainer:{
		justifyContent:'flex-end',
		textAlign:'right',
		margin:0,
		padding:0,
		width:'20%',
		borderBottomWidth:1,
		borderBottomColor:ColorScheme.primary,
	},
	labelText:{
		fontSize:16
	},
	textInput:{
		width:'100%', 
		fontSize:16,
		// fontWeight:'700',
		textAlign:'right',
		color:'black'
	},
})