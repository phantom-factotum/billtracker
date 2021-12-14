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
	Animated
} from 'react-native';

import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons'; 
import Swipeable from 'react-native-swipeable';

import useExpenseHelpers from '../hooks/useExpenseHelpers';
import useTutorialContext from '../hooks/useTutorialContext';
import useExpenseContext from '../hooks/useExpenseContext';
import useUserContext from '../hooks/useUserContext';
import SwipeArrows from './SwipeArrows'
import { lightenColor, darkenColor, getTetradicScheme, setOpacity } from './genColors';

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);
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
	const [ swipePan, setSwipePan ] = useState(new Animated.ValueXY());
	const { height, width } = useWindowDimensions();
	const reorderingAnim = useRef(new Animated.Value(0)).current;

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
	let parentContainerStyle = [styles.parentContainer,{height:iconSize,backgroundColor}]
	if(willDelete)
		parentContainerStyle.push(deleteStyle)
	if(swipeIsActive)
		parentContainerStyle.push(swipeActiveStyle)
  
	// reorderlist animation
  const reorderAnimDuration = 500
  const reorderingAnimation = Animated.loop(
    Animated.sequence([
      Animated.timing(reorderingAnim,{
        useNativeDriver:false,
        toValue:1,
        duration:reorderAnimDuration,
        delay:index*50
      }),
      Animated.timing(reorderingAnim,{
        useNativeDriver:false,
        toValue:0,
        duration:reorderAnimDuration,
        delay:index*50
      })
    ])
  )
  const translateX = reorderingAnim.interpolate({
    inputRange: [ 0, 0.5, 1],
    outputRange:[ 0, -2,  2],
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
    <Animated.View style={[{alignItems:'flex-start'},openModalTask.animationStyle]}>
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
			tutorialDispatch({
				type:'configureAnimationStyle',
				payload:{
					configs:[{deviceWidth:width,index:findTaskIndex(tutorialTaskNames[1])}]
				}
			})
			tutorialDispatch({type:'taskCompleted'})
    }  
  }
	
  useEffect(()=>{
    if(isReorderingList)
      reorderingAnimation.start()
    else
      reorderingAnimation.reset()
    return ()=>reorderingAnimation.reset()

  },[isReorderingList]);
		
	return (
		<Animated.View style={ {paddingHorizontal:2,overflow:'visible',transform:[ { translateX } ]} }>
			<Swipeable 
				leftActivationDistance={swipeActivationDistance}
        rightActivationDistance={1}
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
            reverseArrow={useReverseArrows }
            isAnimated={swipeIsActive || (tutorialIsActive && isPrompting)}
						onRender={(tutorialIsActive && isPrompting) ? 
							// Im not sure if this is needed but the tutorialMode
							// doesnt appear to skip any tasks with this present
							()=>tutorialDispatch({
								type:'taskCompleted',
							}) : null
						}
          />
        }
        <View style={ parentContainerStyle }>
          <View style={[styles.indices,{backgroundColor:indexColor,width:iconSize}]}>
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
		marginBottom:5,
		paddingRight:10,
		paddingLeft:1,
		overflow:'visible',
		paddingVertical:2,
		// borderColor:'white',
		// borderWidth:1,
		borderRadius:50,
		// backgroundColor:ColorScheme.otherPrimaries[7]
	},
	indices:{
		margin:0,
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