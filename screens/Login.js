import React, { 
	useState, 
	useEffect, 
	useContext 
} from 'react';
import { 
	View,
	StyleSheet,
	Text,
	Keyboard,
	KeyboardAvoidingView,
	TextInput,
	Button,
	Alert,
	Platform
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
const {StorageAccessFramework} = FileSystem;
import { useIsFocused } from "@react-navigation/native";

import useUserContext from '../hooks/useUserContext';
import { idGenerator } from '../hooks/useExpenseHelpers';
import useExpenseContext from '../hooks/useExpenseContext';
import useCalculationsContext from '../hooks/useCalculationsContext';
import {clearAppData, exportFile, appDataExists, getCachedData} from '../hooks/handleAppData'
import { ColorScheme,appPrimaryColor, getTetradicScheme, lightenColor, darkenColor } from '../components/genColors'
// const ColorScheme = getTetradicScheme(appPrimaryColor);

export default function Login(props){
	const { user, setUser, isSigningOut,setIsSigningOut } = useUserContext().context;
	const { dispatch:calcDispatch } = useCalculationsContext().context;
	const { dispatch:expenseDispatch  } = useExpenseContext().context;
	const [ name, setName ] = useState('');
	const [ email, setEmail ] = useState('');
	const [ userDataExists, setUserDataExists ] = useState(false);
	// used to trigger stuff whenever screen is navigated back to
	const isFocused = useIsFocused();

	const updateUser = ()=>{
		console.log('isSigningOut',isSigningOut)
		setUser({
			...user,
			uid:user.uid|| idGenerator(null,'user'),
			name: name || user.name || 'Anonymous the Great',
			email:email || user.email
		});
	}
 	const startNew= async ()=>{
 		if(!userDataExists)
 			return updateUser();
 		Alert.alert('Start new?','This will delete all saved data. Are you sure you want to do this?',[
 			{
 				text:'Save data and start over',onPress:async()=>{
					let success = await exportFile();
					// if export fails, dont clear data
					if(!success)
						return
					await clearAppData();
					expenseDispatch({type:'emptyList'})
					updateUser();
 				}
 			},
 			{
 				text:'Start over',onPress:async()=>{
 					await clearAppData();
					expenseDispatch({type:'emptyList'})
 					updateUser();
 				}
 			},
 			{
 				text:'Cancel',onPress:()=>{
 					return
 				}
 			}
 		])	
		
	}
	const importOld = async ()=>{
		let result = await DocumentPicker.getDocumentAsync({type:'application/json'})
		if(!result.uri){
			return
		}
		try{
			console.log('attempting to read user data')
			let uri = Platform.select({
				ios:result.uri,
				android: encodeURI('file://'+result.uri)
			})
			let dataAsString = await FileSystem.readAsStringAsync(uri)
			console.log('read user data file no problemo')
			const data = JSON.parse(dataAsString)
			console.log('data')
			console.log(data)
			if(!data)
				throw new Error()
			const {calculationsData, user:userData, expensesData } = data
			expenseDispatch({
				type:'setAll',
				payload:expensesData
			})
			setUser(userData.user);
			calcDispatch({
				type:'setAll',
				payload:calculationsData
			})
		}catch(err){
			console.log(err)
			Alert.alert('Failed to parse file data','The previous data is unusable, sorry!')
			return
		}
	}
	const checkForData = async ()=>{
		// if user has made it to this screen then the signout is complete
		setIsSigningOut(false);
		let oldDataExists = await appDataExists()
		if(!oldDataExists)
			return
		setUserDataExists(oldDataExists);
		const { userData } = await getCachedData();
		if(!userData)
			return
		setName(userData.name);
		setEmail(userData.email);
	}
	useEffect(()=>{
		checkForData();
	},[isFocused])
	return (
		<View style={styles.container}>
		<View style={styles.wrapper}>
			<View style={styles.inputWrapper}>
				<TextInput
					placeholder={"Set your name"}
					defaultValue={name}
					onChangeText={setName}
					value={name}
					style={styles.textInput}
					placeholderTextColor={ColorScheme[4]}
				/>
			</View>
			<View style={styles.inputWrapper}>
				<TextInput
					placeholder={"Email address (optional)"}
					defaultValue={email}
					onChangeText={setEmail}
					value={email}
					style={styles.textInput}
					placeholderTextColor={ColorScheme[4]}
					keyboardType={'email-address'}
				/>
			</View>
		</View>
		<View style={styles.buttonWrapper}>
			{ userDataExists &&
				<Button 
					title={"Resume"}
					color={darkenColor(ColorScheme[0])}
					onPress={updateUser}
				/>
		 }
			<Button 
				title={"Start new"}
				color={ColorScheme[0]}
				onPress={startNew}
			/>
			<Button 
				title={"Import old"}
				color={ColorScheme[4]}
				onPress={importOld}
			/>
		</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container:{
		flex:1,
		justifyContent:'center',
		padding:10,
		backgroundColor:'transparent'

	},
	wrapper:{
		alignItems:'center',
		width:'100%',
		// height:'100%',
		paddingHorizontal:10
		// padding:10,
		// flex:1
	},
	importButton:{
		// paddingTop:20,
		// marginTop:20,
		// paddingBottom:20,
		width:'100%',
		justifyContent:'center',
		alignItems:'center',
	},
	buttonWrapper:{
		flexDirection:'row',
		// borderWidth:5,
		borderColor:ColorScheme.primary,
		paddingVertical:10,
		marginVertical:10,
		alignItems:'center',
		justifyContent:'space-around'
	},
	bigText:{
		borderTopColor:'lightgray',
		borderTopWidth:5,
		fontSize:18,
		fontWeight:'700',
		textAlign:'center',
		width:'60%'
	},
	inputWrapper:{
		paddingVertical:10,
		borderBottomWidth:1,
		justifyContent:'flex-end',
		// alignItems:'flex-end',
		borderBottomColor:ColorScheme.primary,
		width:'100%'
	},
	textInput:{
		color:'black',
		// paddingVertical:4,
		fontSize:16,
	}
})