import React, { 
	useState, 
	useRef,
	useEffect, 
	useContext,
	useCallback
} from 'react';
import { 
	View,
	StyleSheet,
	Text,
	TextInput,
	Keyboard,
	KeyboardAvoidingView,
	FlatList,
	Button,
	Platform,
	Animated,
	useWindowDimensions,
	TouchableOpacity
} from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements'
import { DraxProvider, DraxList } from 'react-native-drax';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

import ExpenseInput from './ExpenseInput';
import ListEmpty from './ListEmpty';
import Switch from './Switch';
import ColorModal from './ColorModal';
import SwipeArrows from './SwipeArrows';
import {ColorScheme} from './genColors';

import useExpenseContext from '../hooks/useExpenseContext'
import useUserContext from '../hooks/useUserContext';
import useTutorialTask from '../hooks/useTutorialTask';

const iconSize = 40

export default function RenderExpenses(){
	//state and ref variables
	const [ listIsDraggable, setListIsDraggable ] = useState(false);
	const [ isSwiping, setIsSwiping ] = useState(false);
	const [ modalIsVisible, setModalVisibility ] = useState(false);
	const [ selectedIndex, setSelectedIndex ] = useState(0);

	const draxListRef = useRef({}).current;
	const isDraggableAnim = useRef(new Animated.Value(0)).current;
	const {expenses, dispatch, isFocused, listItemRefs } = useExpenseContext().context;
	const { user:{showTutorial} } = useUserContext().context;
	
	
	const headerHeight = useHeaderHeight()

	
	//helper functions
	const handleReorder = ()=>{
		console.log('Yahhhh')
		setListIsDraggable(true)
	}
	const handleFocus = (listIndex,inputType)=>{
		isFocused.current = listIndex+" "+inputType
		/*
			console.log(draxListRef)
			// draxlist github page has been updated to give access to flatlist ref
			// npm package does not yet reflect this
			setTimeout(()=>{
				draxListRef?.scrollToIndex?.({index:0})
			},500)
		*/
	}
	const onSwipeStart = ()=>{
		// setListIsDraggable(false)
		setIsSwiping(true)
	}
	const onSwipeRelease = ()=>{
		setIsSwiping(false)
	}
	const openModal= index=>{
		if(index < 0 || index > expenses.length - 1)
			index = 0
		setSelectedIndex(index)
		setModalVisibility(true)
	}
	const onItemReorder = ({ fromIndex, toIndex }) => {
		dispatch({
			type:'reorderList',
			payload:{fromIndex,toIndex}
		})
  }
	return (
		<View style={styles.container}>
		<DraxProvider>
			{expenses.length> 1 &&<View style={styles.switchView}>
				<Text>Reorder list</Text>
				<Switch
	        isActive={listIsDraggable}
	        onValueChange={setListIsDraggable}
	        value={listIsDraggable}
	      />
			</View>
			}
			<ColorModal 
				visible={modalIsVisible}
				setVisible={setModalVisibility}
				setIndex={setSelectedIndex}
				index={selectedIndex}
			/>
			<KeyboardAvoidingView 
				behavior={Platform.select({ios:'padding',android:''})}
				keyboardVerticalOffset={Platform.select({
					ios:headerHeight+25, 
					android:-headerHeight
				}) 
				}
				style={{flex:1}}
			>
					<DraxList
						data={expenses}
						id={'main-drax-list'}
						keyExtractor={item=>item.id}
						style={styles.listStyle}
						contentContainerStyle={styles.listContentContainer}
	          lockItemDragsToMainAxis={true}
	          itemsDraggable={listIsDraggable}
	          scrollEnabled={!isSwiping}
						renderItemContent={({item,index})=> (
							<ExpenseInput
								value={item}
								index={index}
								onFocus={handleFocus}
								onSwipeStart={onSwipeStart}
								onSwipeRelease={onSwipeRelease}
								isReorderingList={listIsDraggable}
								iconSize={iconSize}
								openModal={openModal}
							/>		
						)}
						ListEmptyComponent={ListEmpty}
						onItemReorder={ onItemReorder }
					 />
		  </KeyboardAvoidingView>
		</DraxProvider>
		</View>
	)
}

const styles = StyleSheet.create({
	icon:{
		justifyContent:'center',
		alignItems:'center',
		textAlign:'center',
		alignSelf:'flex-start',
		padding:3,
		margin:1,
		borderRadius:50,
		padding:5,
		paddingHorizontal:10,
	},
	container:{
		flex:1,
	},
	listContentContainer:{
		width:'100%',
		backgroundColor:'transparent',
		// overflow:'visible',
		paddingBottom:300
	},
	listStyle:{
		// borderColor:ColorScheme.primary,
		// paddingVertical:20,
		width:'100%',
	},
	switchView:{
		flexDirection:'row',
		justifyContent:'center',
		alignItems:'center',
		paddingBottom:10
	},
	quickAddButton:{
		padding:10,
		margin:5,
		paddingHorizontal:15,
		borderRadius:50,
		backgroundColor:ColorScheme[0],
		borderColor:ColorScheme[0],
		alignItems:'center',
		alignSelf:'center',
		justifyContent:'center',
		width:'70%',
	}
})
