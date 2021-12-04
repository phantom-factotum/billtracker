import React from 'react';
import { 
	View,
	StyleSheet,
	KeyboardAvoidingView,
	TextInput,
	Text
} from 'react-native';

export default function MyTextInput ({label,labelContainerStyle,inputContainerStyle,
	inputStyle,contentContainerStyle,...props}){
	return (
		<KeyboardAvoidingView  behavior={"padding"} style={[styles.container, contentContainerStyle]}>
			<View style={[styles.labelContainer, labelContainerStyle]}>
				<Text style={styles.labelText}>{label}</Text>
			</View>
			<View style={styles.inputWrapper}>
				<View style={[styles.inputContainer,inputContainerStyle]}>
					<TextInput
						style={[styles.textInput,inputStyle]}
						{...props}
					/>
				</View>
			</View>
		</KeyboardAvoidingView>
  )
}
const styles = StyleSheet.create({
	container:{
		flexDirection:'row',
		width:'100%',
		// justifyContent:'space-between',
		paddingVertical:5,
		paddingHorizontal:10
	},
	labelContainer:{
		// justifyContent:'center',
		flexWrap:'wrap',
		alignItems:'center',
		width:'80%',
	},
	inputWrapper:{
		width:'20%',
		alignItems:'flex-end',
		margin:0,
		padding:0,
	},
	inputContainer:{
		// textAlign:'right',
		width:'80%',
		borderBottomWidth:1,
		// borderBottomColor:ColorScheme.primary,
	},
	textInput:{
		fontSize:18,
		// fontWeight:'700',
		paddingHorizontal:5,
		justifyContent:'flex-end',
		textAlign:'right',
		color:'black'
	},
	labelText:{
		fontSize:14,
		width:'100%',
		flexWrap:'wrap'
	},
})