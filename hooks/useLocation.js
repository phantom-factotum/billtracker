import React from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';


export default function useLocation(){

	const getLocation = async ()=>{
		let canUseLocation = await requestPermission();
		if(canUseLocation)
			return await getGeoCodeData()
		Alert('Cant access location!', 
			'Your location is used to determine your sales tax rate. If you do not wish '+
			'to expose this information manually provide a sales tax rate'
		)
		return null

	}
	const requestPermission = async ()=>{
		try{	
			let { canAskAgain, granted } = await Location.getForegroundPermissionsAsync();
			if(granted)
				return true
			else if(canAskAgain){
				let newPermissionRequest = await Location.requestForegroundPermissionsAsync();
				return newPermissionRequest.granted;
			}
			else
				return false
		}catch(err){
			return false
		}

	}
	const getGeoCodeData = async ()=>{
		let { coords: {latitude,longitude} } = await Location.getLastKnownPositionAsync({})
		let [ geoCodeData ] =  await Location.reverseGeocodeAsync({latitude,longitude})
		return geoCodeData
	}
	
	return getLocation()
}