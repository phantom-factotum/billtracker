import React, { 
	useState, 
	useEffect, 
	useContext,
	useRef,
	useCallback
} from 'react';
import { 
	View,
	StyleSheet,
	Text,
	Keyboard,
	KeyboardAvoidingView,
	// TextInput,
	ScrollView,
	Button,
	Alert
} from 'react-native';


import useUserContext from '../hooks/useUserContext';
import useCalculationsContext from '../hooks/useCalculationsContext';
import useSalesTaxRates from '../hooks/useSalesTaxRates';
import useLocation from '../hooks/useLocation';

import LabeledTextInput from '../components/LabeledTextInput'
import LabeledSwitch from '../components/LabeledSwitch'
import ColorGenPicker from '../components/ColorGenPicker'


export default function CalculationSettings(props){
	
	// get state variables
	const { wage, includeSalesTax, payType, salesTax, weeklyHours, dispatch } = useCalculationsContext().context;
	// handleInput changes
	const handlePayInput = ({nativeEvent:{text}})=>
		dispatch({
			type:'setPay',
			payload:parseFloat(text)
		})
	const handleSalesTaxInput = ({nativeEvent:{text}})=>
		dispatch({
			type:'setSalesTax',
			payload:parseFloat(text)/100
		});
		// const getLocation = useLocation()
	const updateSalesTax=async()=>{
		const geoCodeData = await useLocation()
		if(!geoCodeData)
			return null
		else{
			const taxRate = useSalesTaxRates(geoCodeData )
			if(!isNaN(taxRate))
	 			dispatch({
	 				type:'setSalesTax',
	 				payload:taxRate
	 			})
		}
	}
	const isUsingHours = payType == 'hours'
	
	// when user wants to includeSalesTax try to user their location to automatically set sales tax
	useEffect(()=>{
		if(!includeSalesTax) return
    updateSalesTax()
	},[includeSalesTax])
	return (
		<ScrollView style={styles.container}>
			<View style={{paddingVertical:15}}>
				<LabeledSwitch
					isActive={isUsingHours}
					onValueChange={val=>dispatch({
						type:'setPayType',
						payload:val ? 'hours' : 'wage'
					})}
					value={isUsingHours}
					label={"Edit salary or hours worked"}
					currentValueMessage={`Currently editing ${payType}`}
				/>
				<LabeledTextInput
					placeholder={payType[0].toUpperCase() + payType.substring(1)}
					keyboardType={"numeric"}
					label={isUsingHours ? "Hours you are working" : "Your wage ($/hr)"}
					onSubmitEditing={handlePayInput}
					defaultValue={isUsingHours ? weeklyHours.toString() : wage.toString()}
					returnKeyType={'done'}
				/>
			</View>
			<View style={{paddingVertical:15}}>
				<LabeledSwitch
					isActive={includeSalesTax}
					onValueChange={val=>dispatch({type:'setIncludeSalesTax',payload:val})}
					value={includeSalesTax}
					label={`Include sales tax when calculating expenses`}
					currentValueMessage={includeSalesTax ? `Taxing at ${salesTax *100}%`: "No sales tax"}
				/>
				{includeSalesTax && 
					<LabeledTextInput
						placeholder={"%"}
						keyboardType={"numeric"}
						label={"Sales tax as a percentage"}
						onSubmitEditing={handleSalesTaxInput}
						defaultValue={(salesTax*100).toString()}
						returnKeyType={'done'}
					/>
				}
			</View>
			<ColorGenPicker style={{paddingVertical:15}} />
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container:{
		flex:1,
		// justifyContent:'center',
		padding:10,
		paddingHorizontal:20
	},
	wrapper:{
		alignItems:'center',
		width:'100%',
		// height:'100%',
		borderWidth:1,
		// padding:2s0,
		// flex:1
	},
	picker:{
		flex:1,
		// top:'-300%',
		height:20,
		position:'relative',
		textAlign:'right'
	},

})