import React from 'react';
import { 
	View,
	StyleSheet,
	Switch,
} from 'react-native';
import { ColorScheme, lightenColor, darkenColor,setOpacity, alterHSVByRatio } from './genColors'

const mainColor = lightenColor(ColorScheme[0],0.05)
const lightestColor = lightenColor(alterHSVByRatio(mainColor,{h:-.01,s:.6,v:.6}),0.85)
const lightColor = darkenColor(lightestColor,0.15)
const darkColor = darkenColor(mainColor,0.5)

export default function MySwitch ({isActive,...props}){
	return (
		<Switch
    	trackColor={{ false: lightestColor, true: lightColor }}
	    ios_backgroundColor={lightestColor}
	    thumbColor={!isActive? mainColor : darkColor}
	    style={[{marginHorizontal:10},props.style]}
	    {...props}
	  />
  )
}
