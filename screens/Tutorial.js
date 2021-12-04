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
import {clearAppData, exportFile, appDataExists, getCachedData } from '../hooks/handleAppData'
import { ColorScheme,appPrimaryColor, getTetradicScheme, lightenColor, darkenColor } from '../components/genColors'
// const ColorScheme = getTetradicScheme(appPrimaryColor);


/*
Demo screen will shed light on the things users can do
While it would be nice to assume that they can intuitively guess,
this ensures that they if they cant, the way to find out is easy

THings to shed light on:
  - In AddExpenses user can swipe right to delete item, or left to pull up extra buttons
  - ScrollViewPicker
  - Drawer
  - how to use the ColorModal
  - going from calculating wage to hours
*/

/*
The demo app will guide users through all basic interactions:
  - Adding common expenses
  - configuring color an expense will take
    - setting up random generation
    - manually picking color
  - viewing pie chart once expenses are added
  - configuring whats being calculated
    - going from calculating wage to hours
    - adding sales tax to expenses  
*/

export default function Demo(props){
	const { user, setUser, isSigningOut,setIsSigningOut } = useUserContext().context;
	const { dispatch:calcDispatch } = useCalculationsContext().context;
	return (
		<View>
			<Text>Bojour, Elliot</Text>
		</View>
	)
}

const styles = StyleSheet.create({
	
})