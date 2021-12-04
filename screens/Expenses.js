import React, { 
	useState, 
	useEffect, 
	useRef,
	useContext 
} from 'react';
import { 
	View,
	StyleSheet,
	Text,
	TextInput,
	Keyboard,
	KeyboardAvoidingView,
	TouchableOpacity,
	Button,
	ScrollView,
	useWindowDimensions,
	Modal,
	Animated,
	Image
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useHeaderHeight } from '@react-navigation/elements'

import useUserContext from '../hooks/useUserContext';
import useTutorialTask from '../hooks/useTutorialTask';
import useExpenseContext from '../hooks/useExpenseContext';
import useCalculationsContext from '../hooks/useCalculationsContext';
import useExpenseHelpers,{ fastListGenerator } from '../hooks/useExpenseHelpers';

import RenderExpenses from '../components/RenderExpenses';
import ExpenseInput from '../components/ExpenseInput';
import TableItem from '../components/TableItem'
import { ColorScheme } from '../components/genColors';

export default function Home({navigation}){
	const { user:{showTutorial} }  = useUserContext().context;
	const { expenses, dispatch,  } = useExpenseContext().context;
  let timesPushed = useRef(0).current
	let addButtonAnim = useRef(new Animated.Value(0)).current
	const [addButtonPrompt, setAddPrompt ] = useTutorialTask({
		onShowPrompt:()=>{
			animateAddExpenses.start();
			return ()=> {
				animateAddExpenses.reset();
			}

		},
		onCompleted: ()=>{
			animateAddExpenses.stop()
			return ()=> {
				animateAddExpenses.reset();
			}
		}
	});
	// const  { addExpense, getPriceSum	} = useExpenseHelpers()
	
	const {width, height} = useWindowDimensions();
  const headerHeight = useHeaderHeight();
	// if tutorial is showing then there is extra stuff to do
	const animateAddExpenses = Animated.loop(
		Animated.sequence([
			Animated.timing(addButtonAnim,{
				toValue:1,
				useNativeDriver:false,
				duration:2000
			}),
			Animated.timing(addButtonAnim,{
				toValue:0,
				useNativeDriver:false,
				duration:2000
			}),
			Animated.delay(1000)
		],{useNativeDriver:false})
	)
	const isLandScape = width > height;
	const addButtonAnimation = {
		transform:[
			{scaleX:addButtonAnim.interpolate({
				inputRange:[0,1],
				outputRange:[1,1.2]
			})},
			{scaleY:addButtonAnim.interpolate({
				inputRange:[0,1],
				outputRange:[1,1.2]
			})}
		],

		top:!addButtonPrompt.completed ? '-12%':0,
		borderRadius:200,
	}
  
  const tutorialTextStyle = {
    opacity:addButtonAnim.interpolate({
      inputRange: [0, 0.6 , 1],
      outputRange:[0, 0.0, 1]
    })
  }
  let tutorialText
  if(expenses.length == 0)
    tutorialText = "Press Me"
  if(expenses.length == 1){
    tutorialText = "Press Me Again"
  }
	return (
		<View style={[styles.container,{height:isLandScape ? '100%': '95%'}]}>
			{expenses.length < 5 && (
        <Animated.View style={{paddingTop:headerHeight*1.5,...addButtonAnimation}}>
          <TouchableOpacity 
            style={styles.quickAddButton}
            onPress={ ()=>{
              dispatch({type:'addCommonExpenses'}) 
              setAddPrompt({showPrompt:false,completed:true})
            }}
            >
            <Text style={{color:'white'}}>Add Common Expenses</Text>
          </TouchableOpacity>
          {addButtonPrompt.showPrompt && 
            <Animated.View style={[styles.addButtonPrompt,tutorialTextStyle]}>
              <Text> {tutorialText} </Text>
            </Animated.View>
          }
        </Animated.View>
			)}
			<View style={{flex:1, width:'100%'}}>		
				<RenderExpenses />
			</View>
			<Animated.View style={styles.addExpense}>
				<Button
					title="Add Expense"
					onPress={()=>{
            dispatch({type:'addNew'});
					}}
					color={ColorScheme[0]}
					disabled={showTutorial}
				/>
			</Animated.View>				
		</View>

	);
}
const styles = StyleSheet.create({
	container:{
		flex:1,
		backgroundColor:'transparent',
		padding:10,
		alignItems:'center',
		justifyContent:'center',
		// borderWidth:10
	},
	addExpense:{
		width:'70%',
		paddingVertical:10,
		textAlign:'center',
		alignSelf:'center',
	},
	tableItems:{
		marginVertical:2,
		padding:2,
		paddingVertical:10,
		marginBottom:0,
		paddingBottom:0,
		borderBottomWidth:2,
		borderColor:ColorScheme.primary
	},
	textInput:{
		width:'100%', 
		fontSize:14,
		fontWeight:'700',
		textAlign:'right',
		color:'black'
	},
	quickAddButton:{
		padding:10,
		margin:5,
		paddingHorizontal:15,
		borderRadius:50,
		backgroundColor:ColorScheme[0],
		// borderColor:ColorScheme.otherPrimaries[0],
		alignItems:'center'
	},
	addButtonPrompt:{
		alignItems:'center',
	}
})