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
	Text,
	TextInput,
	TouchableOpacity,
	Keyboard,
	KeyboardAvoidingView,
	Button,
	useWindowDimensions,
	// Animated
} from 'react-native';
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSequence,
	withRepeat,
	withDelay,
	interpolate,
	cancelAnimation
} from 'react-native-reanimated';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'; 
import Swipeable from 'react-native-swipeable';

import useExpenseHelpers from '../hooks/useExpenseHelpers';
import useTutorialContext from '../hooks/useTutorialContext';
import useExpenseContext from '../hooks/useExpenseContext';
import useUserContext from '../hooks/useUserContext';
import SwipeArrows from './SwipeArrows'
import { lightenColor, darkenColor, getTetradicScheme, setOpacity } from './genColors';

// const iconSize = 40;
const tutorialTaskNames = [
	'openSwipeButtonTray',
	'openColorModal',
	'deleteExpense'
]

export default function expense ({ value, index, onFocus, openModal,
  isReorderingList, iconSize,
	onSwipeStart=()=>{}, 
  onSwipeRelease=()=>{},
}){
	const [price, setPrice] = useState(value.price);
	const [name, setName] = useState(value.name);
	const [ willDelete, setWillDelete ] = useState(false);
	const [swipeIsActive, setSwipeIsActive ] = useState(false);
	const { height, width } = useWindowDimensions();
	const reorderingAnim = useSharedValue(0);

	const { isFocused, dispatch } = useExpenseContext().context;
	const { user:{showTutorial} } = useUserContext().context;
	let { goToNextFocus, hasNextFocus, addRef } = useExpenseHelpers();
	
	const {dispatch:tutorialDispatch,findTask, tasksLeft, completed, findTaskIndex} = useTutorialContext().context;
	const swipeActivationDistance = width ? Math.floor(width *.5) : 175
	// every expense is rendered by this component. Only run the tutorialMode
	// on the first expense
	const isTutorialMode = showTutorial && index == 0;
	// tutorial tasks
	const revealButtonsTask = findTask(tutorialTaskNames[0]);
	const openModalTask = findTask(tutorialTaskNames[1]);
	const deleteTask = findTask(tutorialTaskNames[2]);
	//tutorial variables
	const useReverseArrows = isTutorialMode && revealButtonsTask.started;
  const tutorialIsActive = isTutorialMode && !completed;
  const isPrompting = tutorialIsActive && (openModalTask.started || deleteTask.started);
  let swipeArrowMessage
  if(useReverseArrows)
    swipeArrowMessage = 'Swipe item right to show buttons';
  else if(isTutorialMode && openModalTask.started)
    swipeArrowMessage = "Press the button!"
  else if(isTutorialMode && deleteTask.started)
    swipeArrowMessage = 'Swipe item left to delete';
  else if(tutorialIsActive && !isPrompting)
    swipeArrowMessage = ''

  const indexColor = value.color
	const backgroundColor = setOpacity(indexColor,0.2)
	const deleteColor = darkenColor(indexColor,0.2)
	const swipeArrowColor = darkenColor(deleteColor,0.4)
  let deleteStyle=  {
		borderColor:deleteColor,
		borderWidth: 3,
	}
	let swipeActiveStyle = {
    opacity:0.4
	}
	let parentContainerStyle = [styles.parentContainer,{backgroundColor}]
	if(willDelete)
		parentContainerStyle.push(deleteStyle)
	if(swipeIsActive)
		parentContainerStyle.push(swipeActiveStyle)
  
	// reorderlist animation
  const startReorderAnimation = ()=>{
		reorderingAnim.value = withRepeat(
			withSequence(
				withDelay(index*50,withTiming(1,{
					duration:500,
				})),
				withDelay(index*50,withTiming(0,{
					duration:500,
				})),
			),
			// times to repeat
			-1,
			//loop in reverse
			true
			)
	}
	const stopAnimation = ()=> cancelAnimation(reorderingAnim)
	const reorderAnimationStyle = useAnimatedStyle(()=>{
		const translateX = interpolate(reorderingAnim.value,[ 0, 0.5, 1],[ 0, -2,  2])
		return {
			paddingHorizontal:2,
			overflow:'visible',
			transform:[ { translateX } ]
		}
	})
	const handleEndEditing = ()=>{
		if(name == value.name && price == value.price)
			return
		dispatch({
			type:'updateItem',
			payload:{
				index,
				value:{
					name,
					price:parseFloat(price) || 0}
			}
		})
	}
	const onEnterPress = (event)=>{
		if(hasNextFocus())
			goToNextFocus();
		else
			Keyboard.dismiss()
	}
	const handleSwipeStart = ()=>{
		setSwipeIsActive(true);
		onSwipeStart();
	}
	const handleSwipeRelease=()=>{
		setSwipeIsActive(false);
		onSwipeRelease();
	}
  const ColorPickerIcon = ()=>(
    <Animated.View style={[{alignItems:'flex-start'},isTutorialMode && openModalTask.animationStyle]}>
      <Ionicons 
        name="ios-color-palette"
        size={iconSize}
        color={deleteColor || 'black'}
        onPress={()=>{
          // return
          if(tutorialIsActive){
            console.log('updating modal task')
            tutorialDispatch({
							type:'taskCompleted',
						})
						// tutorialDispatch({type:'startTask'})
					}
          openModal(index);
        }}
      />
    </Animated.View>
  )

	const onLeftSwipe = ()=>{
		dispatch({type:'delete',payload:value.id})
		if(tutorialIsActive)
			tutorialDispatch({
				type:'taskCompleted',
				payload:{
					name:tutorialTaskNames[2]
				}
			})
	}
  const onRightSwipe=()=>{
		console.log('Button tray opened!')
		// mark task completed
    if( isTutorialMode && revealButtonsTask.started){
			// the next task needs device width for the animation to work smoothly
			// tutorialDispatch({
			// 	type:'configureAnimationStyle',
			// 	payload:{
			// 		configs:[{deviceWidth:width,index:findTaskIndex(tutorialTaskNames[1])}]
			// 	}
			// })
			tutorialDispatch({type:'taskCompleted'})
    }  
  }
	
  useEffect(()=>{
    if(isReorderingList)
      startReorderAnimation();
    else
      stopAnimation();
    return stopAnimation

  },[isReorderingList]);
		
	return (
		<Animated.View style={ reorderAnimationStyle }>
			<Swipeable 
				leftActivationDistance={swipeActivationDistance}
        rightActivationDistance={iconSize}
				onLeftActionActivate={()=>setWillDelete(true)}
				onLeftActionDeactivate={()=>setWillDelete(false)}
				onLeftActionRelease={onLeftSwipe}
        onRightButtonsActivate={onRightSwipe}
				onSwipeStart={handleSwipeStart}
				onSwipeRelease={handleSwipeRelease}
				leftContent={<View />}
				rightButtons={[<ColorPickerIcon/>]}
			>
				
        {(tutorialIsActive || swipeIsActive) && 
          <SwipeArrows
            size={iconSize/2}
            color={ swipeArrowColor }
            prompt={swipeArrowMessage}
            reverseArrow={ useReverseArrows }
						totalArrows={(.8*width)/(iconSize*.5)}
						
          />
        }
        <View style={ parentContainerStyle }>
          <View style={[styles.indices,{backgroundColor:indexColor,width:iconSize+(styles.parentContainer.paddingVertical*1.8),marginTop:-2}]}>
            <Text style={[styles.indexText]}>{index+1}</Text>
          </View>
          <View style={[styles.nameContainer,{borderBottomColor:darkenColor(deleteColor)}]}>
            <TextInput
              onEndEditing={handleEndEditing}
              placeholder={"Expense name"}
              onChangeText={setName}
              value={name}
              style={[styles.textInput, styles.nameInput]}
              onFocus={()=>onFocus(index,'name')}
              onSubmitEditing={onEnterPress}
              returnKeyType={hasNextFocus() ? 'next' : 'done'}
              key={'text-input-name-'+index+'-'+value.id}
              ref={ref=>addRef(index,'name',ref)}
              editable={!isReorderingList && !swipeIsActive}
            />
          </View>
          <View style={[styles.priceContainer,{borderBottomColor:darkenColor(deleteColor)}]}>
            <TextInput 
              onEndEditing={handleEndEditing}
              placeholder={"Price"}
              onChangeText={setPrice}
              keyboardType="numeric"
              value={price.toString()}
              style={[styles.textInput, styles.priceInput]}
              onSubmitEditing={onEnterPress}
              returnKeyType={Platform.select({ios:'done',android:hasNextFocus() ? 'next':'done'})}
              onFocus={()=>onFocus(index,'price')}
              ref={ref=>addRef(index,'price',ref)}
              editable={!isReorderingList && !swipeIsActive}
            />

        </View>
      </View>
			</Swipeable>
		</Animated.View>
		);
}
const styles = StyleSheet.create({
	parentContainer:{
		flexDirection:'row',
		width:'100%',
		flexWrap:'wrap',
		alignItems:'center',
		justifyContent:'space-between',
		overflow:'hidden',
		borderRadius:50,
		paddingVertical:2,
		marginVertical:2,
		paddingRight:'5%',
	},
	indices:{
		margin:0,
		marginLeft:1,
		justifyContent:'center',
		alignItems:'center',
		alignSelf:'flex-start',
		textAlign:'center',
		// width:iconSize,
		aspectRatio:1,
		borderRadius:50,
		// backgroundColor:ColorScheme.primary,
		borderColor:'transparent'
	},
	deleteContainer:{
		// width:iconSize*1.5,
		alignItems:'flex-end',
		justifyContent:'flex-end',
		// borderWidth:0,
		
	},
	icon:{
		// justifyContent:'center',
		// alignItems:'center',
		// textAlign:'center',
		alignSelf:'flex-end',
		borderRadius:50,
	},
	indexText:{
		fontSize:16,
		color:'white',
		textShadowColor:'black',
		textShadowRadius:3,
		textShadowOffset:{width:0.7,height:0.7}
	},
	nameContainer:{
		// flex:1,
		justifyContent:'flex-start',
		margin:0,
		padding:0,
		width:'45%',
		flexWrap:'wrap',
		borderBottomWidth:1,
		// borderBottomColor:ColorScheme.primary
	},
	priceContainer:{
		justifyContent:'flex-end',
		textAlign:'right',
		margin:0,
		padding:0,
		width:'15%',
		borderBottomWidth:1,
		// borderBottomColor:ColorScheme.primary
	},
	textInput:{
		// flex:1,
		margin:0,
		padding:0,
		width:'90%',
		color:'black'
	},
	priceInput:{
		justifyContent:'flex-end',
		textAlign:'right',
	},
	nameInput:{
		justifyContent:'flex-start',
		textAlign:'left'
	},
})