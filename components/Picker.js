import React, { 
	useState, 
	useContext,
	useEffect,
	useCallback,
	useRef
} from 'react';
import { 
	View,
	StyleSheet,
	Text,
	TextInput,
	Keyboard,
	KeyboardAvoidingView,
	Animated,
	Alert
} from 'react-native';

import PickerItem from './PickerItem';
import FlatList from './FlatList';
import useExpenseContext from '../hooks/useExpenseContext';

export default function Picker(props){
	// destructure props
	let { 
		data=[],
		placeholder="Make a selection", 
		padding=0,
		height=20,
		initialScrollIndex=0, 
		onSelection=()=>{},
		overrideItemStyle=false,
		removePadding=true,
		paddingVertical,
		borderWidth=1,
		snapToItem=true,
		renderItem, itemStyle,
		...otherProps
	} =  props;
	let RenderItem = renderItem 
	/*
		renderItem should have a static property height to lock the height
	*/
	if(!RenderItem){
		if(itemStyle) 
			PickerItem.style = itemStyle
		if(height) 
			PickerItem.height = height
		RenderItem = PickerItem;
	}
	height = RenderItem.height;
	// state variables
	const [ selected, setSelected ] = useState(initialScrollIndex);
	const [ isScrolling,setIsScrolling] = useState(false);
	if(data.length == 0){
		({expenses:data} = useExpenseContext().context);
	}
	// set data[initialScrollIndex].isSelcted to true to trigger 
	if(Number.isInteger(selected) && selected > -1)
		data[selected].isSelected = true

	// when selected changes
	useEffect(()=>{
		// update isSelected values in data
		data = data.map((item,i)=>{

			item.isSelected = i == selected;
			return item
		})
		// pass selected to onSelection function
		onSelection(selected)
	},[selected])
	
	// when the view changes on the flatlist
	function onViewChange(viewToken){
		const viewableItems = viewToken && viewToken.viewableItems;
		if(viewableItems.length > 0){
			const index = viewableItems[0]["index"]
			if(Number.isInteger(index) && index >=0)
				setSelected(index);
		}
	}
	let RenderPlaceholder=()=>{
		if( typeof placeholder == 'function' )
			return <placeholder />
		return (
		 	<RenderItem 
				item={{name:placeholder.toString(),isPlaceholder:true}} 
			/>
		)
	}
	return (
		<View style={[styles.container, styles.center]}>
			<RenderPlaceholder />
			{/*the parent view will have extra height to make it look cleaner*/}
			<View style={[styles.center,{height:height+10}]}>
				<FlatList
					{...props } 
					style={{flex:1}}
					height={height}
					onViewChange={ onViewChange }
					removePadding={removePadding}
					snapToItem={snapToItem}
					extraData={selected}
					renderItem={RenderItem}
				/>
			</View>
		</View>
	);
}
const styles = StyleSheet.create({
	center:{
		alignItems:'center',
		justifyContent:'center',
		textAlign:'center',
		width:'100%',
	},
	container:{
		margin:0,
		padding:0,
		marginTop:10,
	},
});