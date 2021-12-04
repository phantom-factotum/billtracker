import React from 'react';
import { 
	View,
	StyleSheet,
	Text,
	useWindowDimensions
} from 'react-native';
import ScrollPicker from 'react-native-wheel-scrollview-picker';

import useExpenseContext from '../hooks/useExpenseContext';
import {colorGenerators as colorGens, ColorScheme, setOpacity, lightenColor} from '../components/genColors';


// dont pass the generate function  to items as it is not needed
const colorGenerators = Object.keys(colorGens).map(key=>{
	const {generate,...obj} = colorGens[key]
	return obj
})
const pickerHeight = 40;

export default function ColorGeneratorPicker({label,currentValueMessage,style,...props}){
	const { colorGenType, dispatch:expenseDispatch } = useExpenseContext().context
	const { width, height } = useWindowDimensions();
	const isLandScape = width > height
	const index = colorGenerators.findIndex(t=>t.value == colorGenType)
	const colorGenObj = colorGenerators[index]
	// console.log(colorGenObj.value)
	return(
		<View style={style || {} }>
			<View style={[styles.container]}>
				<View style={{width:'50%'}}>
					<Text style={styles.labelText}>Color generation style</Text>
					{/*in landscape mode give color description less width*/}
					<View style={{width:isLandScape? '60%':'100%'}}>
						<Text style={styles.labelMessage}>{colorGenObj.description}</Text>
					</View>
				</View>
				<View style={{width:'50%',height:pickerHeight,alignItems:'flex-end',alignSelf:isLandScape? null:'center'}}>
		  		<ScrollPicker
		  			dataSource={colorGenerators}
		  			itemHeight={pickerHeight}
		  			wrapperHeight={pickerHeight}
		  			selectedIndex={index}
		  			highlightColor={ColorScheme[0]}
		  			highlightBorderWidth={3}
		  			onValueChange={itemValue=>expenseDispatch({
								type:'setColorGenerator',
								payload:itemValue.value
							})
		  			}
		  			renderItem={(item,index)=>(
		  				<View style={[styles.pickerItem,{backgroundColor:ColorScheme.slice(-1)[0]}]}>
		  					<Text style={styles.expenseText}>{item.label}</Text>
		  				</View>
		  			)}
					/>				
					{false &&<Picker
						placeholder={colorGenObj.label+" ⬇️"}
						containerStyle={{width:'100%',padding:0,alignItems:'flex-end',justifyContent:isLandScape? null:'center'}}
						textInputStyle={{ textAlign:'right' }}
						item={colorGenType}
						items={colorGenerators}
						mode={'dropdown'}
						onItemChange={itemValue=>expenseDispatch({
							type:'setColorGenerator',
							payload:itemValue.value
						})}
					/>}
				</View>
		</View>
	</View>
	)
}
const styles = StyleSheet.create({
	container:{
		flexDirection:'row',
		justifyContent:'space-between',
		width:'100%',
	},
	labelText:{
		fontSize:18,
		width:'100%',
		flexWrap:'wrap'
	},
	labelMessage:{
		fontSize:12,
		fontWeight:'300',
		fontStyle:'italic',
		flexWrap:'wrap'
	},
	pickerItem:{
		width:'100%',
		alignItems:'center',
		height:pickerHeight*.8,
		justifyContent:'center',
		alignSelf:'center'
	},
	 expenseText:{
  	fontWeight:'500',
  	fontSize:16
  },
})