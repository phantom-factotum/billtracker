import React, { 
	useState, 
	useEffect, 
	useContext,
	useCallback,
	useRef
} from 'react';
import { 
	View,
	StyleSheet,
	// Animated,
	Text,
	useWindowDimensions
} from 'react-native';
import Animated,{
	withDelay,
	withTiming,
	withSequence,
	withRepeat,
	useSharedValue,
	useAnimatedStyle,
	cancelAnimation,
	interpolate,
	withSpring
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useIsFocused } from "@react-navigation/native";

const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons)

export default function SwipeArrows ({ size=40, color, prompt,totalArrows=10,
	onRender,reverseArrow=false 
}){
	const animationVal = useSharedValue(-2);
  const isFocused = useIsFocused();
  const fontSize = size*.8;
	const message = prompt || 'Keep swiping to delete'
	const duration = 2000;
	totalArrows = Math.floor(totalArrows)
	
	const startAnimation = ()=>{
		animationVal.value = withRepeat(
			withSequence(
				// withTiming(0,{duration}),
				withTiming(totalArrows+1,{duration}),
				withTiming(-1,{duration:10})
			),
			-1,
			false
		)
	}
	const stopAnimation = ()=>{
		cancelAnimation(animationVal)
	}
	const genOutputRange = (index,targetValue)=>{
		'worklet';
		return [0,targetValue,0,0]
	}
	const arrowStyles = Array(totalArrows).fill(null).map((nada,index)=>
		useAnimatedStyle(()=>{
			// animationValue will cover every arrow
			// arrows should animating when approaching or leaving their index
			let inputRange = [index-1,index,index+1, totalArrows+1]
			let outputRange = [0,1,0,0]
			//if arrows are reversed the last items should animate first
			let val = reverseArrow ? 
				totalArrows - animationVal.value - 1 :
				animationVal.value
			return {
				// color:interpolate(animationVal.value,inputRange,['#fff',color,'#fff','#fff']),
				opacity:interpolate(val,inputRange,outputRange),
			}
		})
	)
	useEffect(()=>{
		onRender && onRender();
		startAnimation();
		// return stopAnimation
	},[])
	return (
		<View style={[styles.parentContainer,{height:size+fontSize}]}>
			<Text style={{fontSize,textAlign:'center',left:reverseArrow? '-7%':'7%'}}>{message} {totalArrows}</Text>
			<View style={styles.arrowContainer}>
				{arrowStyles.map(style=>(
					<AnimatedIcon
						name={reverseArrow? "chevron-left":"chevron-right" }
						size={size} 
						style={style}
						color={color}
					/>
				))}
			</View>
		</View>
	)
}
const styles = StyleSheet.create({
	parentContainer:{
		position:'absolute',
		width:'100%', 
		justifyContent:'center',
		alignItems:'center',
    opacity:2,
    zIndex:3
	},
	arrowContainer:{
		flexDirection:'row',
		width:'100%',
		// alignSelf:'center',
    // alignItems:'center',
		// // width:'70%',
		// overflow:'hidden',
		justifyContent:'center',
	},
	messageContainer:{
		flexDirection:'column'
	}
})