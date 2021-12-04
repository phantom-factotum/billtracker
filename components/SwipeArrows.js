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
	Animated,
	Text,
	useWindowDimensions
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useIsFocused } from "@react-navigation/native";

const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons)

export default function SwipeArrows ({ size, color, prompt,isAnimated=true,reverseArrow=false }){
  const {width, height} = useWindowDimensions();
  const isFocused = useIsFocused();
	const animationValues = useRef([]).current;
	const duration = 100;
  const fontSize = size*.8;
	const useNativeDriver = false;
	const message = prompt || 'Keep swiping to delete'
	
  let totalArrows = Math.floor((width*.8)/size) -2
	for(let i = 0; i<totalArrows;i++){
    animationValues[i] = new Animated.Value(0)
	}
  let animations = animationValues.map((anim,i)=>
		Animated.sequence([
			Animated.timing(anim,{
				toValue:1,
				duration,
				// delay:(index+1)*duration,
				useNativeDriver
			}),
			// Animated.delay(duration*.7),
			Animated.timing(anim,{
				toValue:0,
				duration,
				// delay:(index+1)*duration,
				useNativeDriver
			}),
		])
	)
  
  if(reverseArrow)
    animations = animations.reverse();
  const loopAnimations = Animated.loop(
    Animated.stagger(duration,animations,{useNativeDriver})
  )
  if(isAnimated)
    loopAnimations.start()
  else
    loopAnimations.reset()
	useEffect(()=>{
		return ()=>{
      loopAnimations.reset()
		}
	},[])
	return (
		<View style={[styles.parentContainer,{height:size+fontSize}]}>
			<Text style={{fontSize,textAlign:'center',left:reverseArrow? width*.07:-width*.07}}>{message}</Text>
			<View style={styles.arrowContainer}>
				{animationValues.map((anim,i)=>(
					<SwipeArrow
						key={'swipe-arrow-'+i}
						size={size}
						totalArrows={totalArrows}
						animationValue={anim}
						useNativeDriver={useNativeDriver}
						index={i}
						color={color}
						reverseArrow={reverseArrow}
					/>
				))
			}
			</View>
		</View>
	)
}
const SwipeArrow = ({color,index,totalArrows,duration,size, animationValue, reverseArrow,NativeDriver=false})=>{
	let opacity = animationValue.interpolate({
		inputRange:[0,1],
    // outputRange:[0,1],
		outputRange:reverseArrow?[index*.1/totalArrows, 1] :[((totalArrows-index)*.1/totalArrows),1]
	})
	return (
		<AnimatedIcon 
			name={reverseArrow? "chevron-left":"chevron-right" }
			size={size} 
			style={{ opacity,color }}
			color={color}
		/>
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
		alignSelf:'center',
    alignItems:'center',
		// width:'70%',
		overflow:'hidden',
		justifyContent:'center',
	},
	messageContainer:{
		flexDirection:'column'
	}
})