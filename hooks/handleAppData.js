import React, { 
	useState, 
	useRef,
	useEffect, 
	useContext,
	useCallback
} from 'react';
import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from "expo-sharing";
const { StorageAccessFramework } = FileSystem

export const userDataPath = FileSystem.documentDirectory+'this_app_userdata/'
export const userDataFilePath = userDataPath + encodeURIComponent( 'expenses.json' )

const testUserData = {uid:'abcdefghijklmnopqrstuvwxyz',name:"Martese Goosby"}
const isTesting = false

// items to not save to file
const unsaveables = [
	'isFocused',
	'listItemRefs',
	'dispatch'
]
const fileExists = async (path)=>{
	let info = await FileSystem.getInfoAsync(path)
	return info.exists
}
export const appDataExists = async ()=>await fileExists(userDataFilePath)
const exportFileIos = async()=>{
	try{
    let result = await Sharing.shareAsync(userDataFilePath, {UTI:'public.item'} );
    return result.action !== Sharing.dismissedAction
	}catch(err){
		console.log(err)
		return false
	}
}
const exportFileAndroid = async()=>{
  // const downloadDir = await StorageAccessFramework.getUriForDirectoryInRoot('/')
  // console.log(downloadDir)
  const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync(downloadDir|| null);
  if (!permissions.granted)
    return
  // Gets SAF URI from response
  const uri = permissions.directoryUri;
  const newFile = await StorageAccessFramework.createFileAsync(
    uri,
    'expenses.json',
    'application/json'
  )
  await StorageAccessFramework.writeAsStringAsync(uri+'/expenses.json',await FileSystem.readAsStringAsync(userDataFilePath))
  // await StorageAccessFramework.copyAsync({
  //   from:userDataFilePath,
  //   to:uri+'/expenses.mp4'
  // });
  console.log('copy successfully')
}
export const exportFile = async ()=>{
	return await Platform.select({
    ios:exportFileIos,
    android:exportFileIos
  })()
}
export const clearAppData = async ()=>{
	// if file user data file path doesnt exist then data is already cleared
	if(!await fileExists(userDataPath))
		return
	await FileSystem.deleteAsync(userDataPath);
	await createAppDataDirectory();
}
export const getCachedData = async (showErrors=true)=>{
	if( !await fileExists(userDataPath) ) {
		await createAppDataDirectory();
  }
	else if( !await fileExists(userDataFilePath) ){
		console.log('No existing user data found')
  	return null
	}
  try{
		let dataAsString = await FileSystem.readAsStringAsync(userDataFilePath)
  	let json = JSON.parse(dataAsString)
  	// console.log('user data from file:')
  	// console.log(json.userData)
  	return json	
  }catch(err){
  	console.log(err)
  	if(showErrors)
  		Alert.alert('Failed to parse stored data','Sorry the previous data is corrupted/unreadable.')
  	return null
  }

};

export const saveAppData= async({calculationsData,expensesData,userData,tutorialData})=>{
	if( !await fileExists(userDataPath) ){
		await createAppDataDirectory();
	}
	// console.log('userData being saved:')
	// console.log(userData)
	let appData  = await getCachedData(false);
	if(!appData)
		appData = {};
	if(calculationsData)
		appData.calculationsData = removeUnsaveables(calculationsData)
	if(expensesData)
		appData.expensesData = removeUnsaveables(expensesData)
	if(userData)
		appData.userData = removeUnsaveables(userData)
	if(tutorialData){
		// theres no need to save when the index is 0
		if(tutorialData.index != 0){
			appData.tutorialData = removeUnsaveables(tutorialData)
		}
	}
	// if every key of newAppData is invalid then a massive failure has occurred
	if(Object.keys(appData).every(key=>!isValidObject(appData[key] || {} ))){
		console.log('boiiii failure loves u')
		return
	}
	try{
		await FileSystem.writeAsStringAsync(userDataFilePath,JSON.stringify(appData))
	}catch(err){
		console.log(err)
		Alert.alert('Failed to save user data',
			'Unable to save your data to file. This may be due to lack of read/write privileges '+
			'or the developer\'s lack of skill.'
		)
	}
}

const createAppDataDirectory = async ()=>{
	try {
		console.log('user data directory doesnt exists!')
    await FileSystem.makeDirectoryAsync(userDataPath)
    return null
	} catch(err){
		Alert.alert('Failed to create directory!',
			'Unable to create directories to save your data. This may be due to lack of '+
			'read/write privileges or the developer\'s lack of skill.'
		)
		console.log(err)
		return null
	}
}


const removeUnsaveables = obj=>{
	let newObject = {}
	Object.keys(obj).forEach(key=>{
		if(typeof obj[key] == 'function')
			return
		if( unsaveables.find(item=>item == key) )
			return
		newObject[key] = obj[key]
	})
	return newObject
}
const isValidObject = obj=>Boolean(obj) && Object.keys(obj).length > 0
