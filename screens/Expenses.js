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
import useExpenseContext from '../hooks/useExpenseContext';
import useCalculationsContext from '../hooks/useCalculationsContext';
import useTutorialContext from '../hooks/useTutorialContext';
import useExpenseHelpers,{ fastListGenerator } from '../hooks/useExpenseHelpers';

import RenderExpenses from '../components/RenderExpenses';
import ExpenseInput from '../components/ExpenseInput';
import TableItem from '../components/TableItem'
import { ColorScheme } from '../components/genColors';

const tutorialTaskName = 'addCommonExpenses'

export default function Home({navigation}){
	const { user:{showTutorial} }  = useUserContext().context;
	const { expenses, dispatch,  } = useExpenseContext().context;
	const {width, height} = useWindowDimensions();
  const headerHeight = useHeaderHeight();
	const isLandScape = width > height;
	// tutorial mode data
	const { currentIndex,isCurrentTask,findTask,dispatch:tutorialDispatch } = useTutorialContext().context;
	// there's one task to complete
	const addExpensesTask = findTask(tutorialTaskName);
	// tutorial mode animations
	const tutorialButtonAnimation = {
		...addExpensesTask?.animationStyle,
		top:addExpensesTask?.started ? '-12%':0,
		borderRadius:200,
	}
  const tutorialTextStyle = {
    opacity:addExpensesTask?.anim?.interpolate({
      inputRange: [0, 0.6 , 1],
      outputRange:[0, 0.0, 1]
    })
  }
	// immediately start task if addExpenseTask is current task to complete
	useEffect(()=>{
			if(!showTutorial)
				return
			if(isCurrentTask(tutorialTaskName))
				tutorialDispatch({type:'startTask'})
	},[currentIndex])
	return (
		<View style={[styles.container,{height:isLandScape ? '100%': '95%'}]}>
			{expenses.length < 5 && (
        <Animated.View style={{paddingTop:headerHeight*1.5,...tutorialButtonAnimation}}>
          <TouchableOpacity 
            style={styles.quickAddButton}
            onPress={ ()=>{
              dispatch({type:'addCommonExpenses'}) 
              showTutorial && tutorialDispatch({type:'taskCompleted'})
            }}
            >
            <Text style={{color:'white'}}>Add Common Expenses</Text>
          </TouchableOpacity>
          {addExpensesTask.started && 
            <Animated.View style={[styles.addButtonPrompt,tutorialTextStyle]}>
              <Text> Press Me </Text>
            </Animated.View>
          }
        </Animated.View>
			)}
			<View style={{flex:1, width:'100%'}}>		
				<RenderExpenses />
			</View>
			<View style={styles.addExpense}>
				<Button
					title="Add Expense"
					onPress={()=>{
            dispatch({type:'addNew'});
					}}
					color={ColorScheme[0]}
					disabled={showTutorial}
				/>
			</View>				
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