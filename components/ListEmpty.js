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
	Image,

} from 'react-native';
import img from '../assets/nature.png'
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

export default function SwipeArrows (){
	const [ viewDimensions, setViewDimensions ] = useState({height:400,width:400})
	const onLayout = ({nativeEvent: {layout: {x, y, width, height}}})=>{
		setViewDimensions({width,height})
	}
	return (
		<View style={styles.parentContainer} onLayout={onLayout}>
			<Image
        style={{...styles.img,...viewDimensions}}
        source={img}
        resizeMode={'contain'}
      />
      <View style={ [styles.messageContainer,{top: viewDimensions.height/2,}] }>
			  <Text style={styles.message}>Lets add some expenses</Text>
			</View>
		</View>
	)
}
	
const styles = StyleSheet.create({
	parentContainer:{
		flex:1,
		alignItems:'center',
		justifyContent:'center'
	},
	arrowContainer:{
		flexDirection:'row',
		alignSelf:'center',
		overflow:'hidden',
		justifyContent:'center',
	},
	messageContainer:{
		flexDirection:'column'
	},
	textContainer:{
		position:'absolute',
		top:0,
		backgroundColor:'pink',
		zIndex:11
	},
	message:{
		fontSize:20,
		fontWeight:'700',
		color:'white',
		textAlign:'center', 
		textShadowColor: 'rgba(0, 0, 0, 0.75)',
		textShadowOffset: {width: -2, height: 2},
		textShadowRadius: 10
	},
	messageContainer:{
		position: 'absolute',
		width:'100%',
		left:0,
		right: 0,
		bottom: 0,
		zIndex:11
	},
	img:{
		zIndex:10
	}
})