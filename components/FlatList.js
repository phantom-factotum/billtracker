import React,{ useState, useCallback,useRef } from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';

function MyFlatList(props){
	let { 
		onViewChange = ()=>{},
		removePadding, snapToItem, height, 
		paddingVertical,
	} = props;
	// wrap onViewChange in callback
	onViewChange = useCallback(onViewChange,[])
	// ref variables
	const scrollViewRef = useRef(null);
	const lastUpdateRef = useRef(null);
	// viewabilityConfig has to be a ref in function components
	let viewabilityConfig = useRef({
		itemVisiblePercentThreshold:95
	}).current;
	const prevSelections = useRef([]).current;
	

	// if no number is provided and removePadding flag isnt true use default vertical padding
	if(!Number.isInteger(paddingVertical) && !removePadding){
		paddingVertical = height/2
	}
	else
		paddingVertical = 0
	
	// allows snapping to items
	function getItemLayout(data, index){
		const layoutHeight = height
		return {
    	length: layoutHeight, 
    	offset: getOffset(data,index),
    	index
    }
	}
	function getOffset(data,index){
		const layoutHeight = height
		let offset = layoutHeight * index + paddingVertical
  	return offset
	}
	// if scrolls snap to an item and no snap offsets are provided, create them
	if(snapToItem && !props.snapToOffsets )
		props.snapToOffsets = props.data.map(getOffset)
	return (
		<View style={{height:height*1.6,width:'100%'}}>
			<FlatList
				style={{flex:1}}
				contentContainerStyle={{width:'100%',paddingVertical:paddingVertical}}
				centerContent={true}
				showsVerticalScrollIndicator={false}
			  disableScrollMomentum={true}
			  {...props}			 
				ref={scrollViewRef}
				keyExtractor={(item,i)=>item?.id || 'list-key-'+i}
			  snapToStart={false}
				onViewableItemsChanged={onViewChange}
				viewabilityConfig={viewabilityConfig}
			  getItemLayout={getItemLayout}
			/>
		</View>
		)
		
}

export default MyFlatList