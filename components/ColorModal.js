import React, {useEffect, useState,useRef} from 'react';
import { 
	View,
	StyleSheet,
	Modal,
	Text,
  Animated,
} from 'react-native';
// import Slider from 'react-native-slider';
import { TriangleColorPicker, ColorPicker, fromHsv } from 'react-native-color-picker';
import ScrollPicker from 'react-native-wheel-scrollview-picker';
import { LinearGradient } from 'expo-linear-gradient';
import ModalButton from './ModalButton';
import { setOpacity } from './genColors'
import useExpenseContext from '../hooks/useExpenseContext';
import useTutorialTask from '../hooks/TasksReducer';
import useUserContext from '../hooks/useUserContext';
import useTutorialContext from '../hooks/useTutorialContext';


const pickerHeight = 40;
const pickerLeftPadding = 5;
const padding = 10;
const margin = 10

export default function ColorModal ({visible,setVisible,index,setIndex}){
	const { expenses, dispatch } = useExpenseContext().context;	
	const [ modalHeight, setModalHeight ] = useState(500);
	const [ modalWidth, setModalWidth ] = useState(400);
	const expense = expenses[index] || {}
	const { user:{showTutorial} }  = useUserContext().context;
	const {findTask,isCurrentTask, dispatch:tutorialDispatch} = useTutorialContext().context;
	// in tutorial mode one task will be to change expense color
	const changeColorTask = findTask('changeExpenseColor')
	const changeIndexTask = findTask('scrollToNewExpense');

  const onColorSelected = (hsvColor)=>{
		dispatch({
			type:'updateItem',
			payload:{
				index,
				value:{
					color:fromHsv(hsvColor)
				}
			}
		})
    if(showTutorial){
			tutorialDispatch({
				type:'taskCompleted',
				payload:{
					name:'changeExpenseColor'
				}
			})
    }
	}
	// using percentages in a modal has given me very odd results
	// so im just gonna manually calculate the important stuff
	const onModalLayout = ({nativeEvent: { layout: {x, y, width, height}}})=>{
		const widthPercentage = parseInt(styles.linearGradient.width) /100
		const heightPercentage = parseInt(styles.linearGradient.height) /100
		setModalWidth(width*widthPercentage);
		setModalHeight(height*heightPercentage);
	}
	
	const genGradientColors = ()=>{
		// map to colors
		let colors = expenses.slice().map(e=>e.color);	  
  	// shift list so current index is first item
  	let newStart = colors.slice(index);
  	let newEnd = colors.slice(0,index);
  	// repeat currently selected color make it more visible in gradient
  	const mainColor = colors[index]
  	colors = newStart.concat(mainColor,newEnd,mainColor);
  	return colors
	}
	
	const modalButtonStyle = {
		borderColor:expense?.color,
		backgroundColor:setOpacity(expense?.color,0.2),
		borderWidth:3
	}
	
	// calculate the maximum width the picker can be
	const pickerWidth = modalWidth - pickerHeight - pickerLeftPadding
	//calculate the maximum height the color picker can be
	const colorPickerHeight = modalHeight - pickerHeight 
	return (
		<Modal  visible={visible} transparent>
		<LinearGradient
			style={styles.linearGradient}
		  colors={genGradientColors()}
		  onLayout={onModalLayout}
		>
		<View style={styles.modal} >
			<View style ={styles.row}>
				<ModalButton
          title={'X'}
          onPress={()=>setVisible(false)}
          start={{x:0,y:0}}
          end={{x:1,y:0.7}}
          buttonStyle={[styles.modalButton,modalButtonStyle]}
        />
      	<Animated.View style={{paddingLeft:pickerLeftPadding,width:pickerWidth,height:pickerHeight,...changeIndexTask.animationStyle}}>
          <ScrollPicker
		  			dataSource={expenses}
		  			itemHeight={pickerHeight}
		  			wrapperHeight={pickerHeight}
		  			selectedIndex={index}
		  			highlightColor={expense.color}
		  			highlightBorderWidth={3}
		  			onValueChange={(itemValue,itemIndex)=>{
              if( showTutorial && changeIndexTask.started){
								tutorialDispatch({
									type:'taskCompleted',
									payload:{
										name:'scrollToNewExpense'
									}
								})
              }			
		  				setIndex(itemIndex)
		  			}}
		  			renderItem={(item,index)=>(
		  				<View style={[styles.pickerItem,{
		  					borderColor:item.color,
		  					backgroundColor:setOpacity(item.color,.2)
		  					}
		  				]}>
		  					<Text style={item.name ? styles.expenseName : styles.blankText}>{item.name || '(Untitled)'}</Text>
		  				</View>
		  			)}
					/>
				</Animated.View>			
			</View>			
	     <View style={{width:modalWidth,height:colorPickerHeight,}}>
          {showTutorial && changeColorTask.started &&
            <Animated.Text style={{...changeColorTask.animationStyle,textAlign:'center'}}>Change your expense color</Animated.Text>
          }
          {showTutorial && changeIndexTask.started && 
            <Animated.Text style={{...changeIndexTask.animationStyle,textAlign:'center'}}>Scroll to another expense! </Animated.Text>
          }
					<ColorPicker 
						style={{flex:1,margin:'1%',borderRadius:0}}
						oldColor={expense.color}
						defaultColor={expense.color}
						onColorSelected={onColorSelected}
						// sliderComponent={Slider}
					/>
			</View>
		</View>
		</LinearGradient>
		</Modal>
  )
}

const styles = StyleSheet.create({
  linearGradient:{
    alignItems:'center',
    alignSelf:'center',
    padding,
    margin:0,
    top:'10%',
    width:'90%',
    height:'88%',
    opacity:1,
    // borderWidth:4,
    borderRadius:25,
    borderColor:'#414141',
    backgroundColor:'white',
  },
  modal:{
  	flex:1,
  	backgroundColor:'white',
  	padding,
  	alignItems:'center',
  	marginVertical:-2,
  	borderRadius:25
  },
  row:{
    opacity:1,
    flexDirection: 'row',
    width:"100%",
    overflow:'hidden'
  },
  titleText:{
  	fontSize:16,
  	flexWrap:'wrap'
  },
  expenseName:{
  	fontWeight:'700',
  	fontSize:16
  },
  emptyText:{
  	fontWeight:'400',
  	fontSize:16
  },
  modalButton:{
  	width:pickerHeight,
  	height:pickerHeight,
  	aspectRatio:1,
  	padding:0,
  	margin:0,
  }, 
	pickerItem:{
		width:'100%',
		alignItems:'center',
		height:pickerHeight*.8,
		justifyContent:'center'
	},
	colorLabelText:{
		width:'50%',
		textAlign:'center',
		fontSize:14,
		color:'white',
		textShadowColor:'black',
		textShadowRadius:3,
		textShadowOffset:{width:0.7,height:0.7}
	},	
})