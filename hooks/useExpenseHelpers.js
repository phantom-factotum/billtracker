import React, { 
	useState, 
	useRef,
	useEffect, 
	useContext,
	useCallback
} from 'react';

import useExpenseContext from './useExpenseContext';
import useCalculationsContext from './useCalculationsContext';

//all expense list modifiers in one place
export default function useHelpers(){
	const {expenses, isFocused, listItemRefs} = useExpenseContext().context;
	const {includeSalesTax, salesTax, weeklyHours, wage } = useCalculationsContext().context;
	const getPriceSum = ()=> {
 		let sum = expenses.map(e=>parseFloat(e.price) || 0 ).
			reduce((a, b) => a + b,0)
		if(includeSalesTax)
			sum *= (1+salesTax)
		return sum
	}

	const getWageNeeded = ()=>{
		return getPriceSum()/(weeklyHours*4)
	}
	const getHoursNeeded = ()=>{
		return getPriceSum()/(wage*4)
	}
	const canRenderChart = (data)=>{
		//in order to render a useful chart at least 2 expenses have to  be greater than 0
		if(!data)
			data = expenses
		const validEntries = data.filter(expense=>{
			const price = parseFloat(expense.price)
			return !isNaN(price) && price > 0
		})
		return validEntries.length > 1
	}
	const addRef=(listIndex,inputType,ref)=>{
		if(!listItemRefs.current[listIndex])
			listItemRefs.current[listIndex] = {}
		listItemRefs.current[listIndex][inputType] = ref
	}
	
	// isFocused.current will be a string with an index separated by a space, followed by inputType
	//e.g. "0-name"
	const parseIsFocused = ()=>{
		if(!isFocused || !isFocused.current){
			return {index:-1,type:'price'}
		}
		let [ listIndex, inputType ] = isFocused.current.split(' ');
		listIndex = parseInt(listIndex);
		return {index:listIndex,type:inputType}
	}
	const goToNextFocus = ()=>{
		let {index:listIndex,type:inputType} = parseIsFocused()
		// if the inputType is name, then the next input to focus will be the price input of the same listIndex
		if(inputType == 'name'){
			inputType = 'price'
		}
		// if inputType is price, then the next input to focus will be the name input of the next listIndex
		else if( inputType == 'price'){
			inputType = 'name'
			listIndex++
		}
		else {
			console.log('I dont know how you manage to do it, but you secured the L.')
			console.log('\n\tAlso you have an invalid inputType:', inputType)
			return
		}
		let nextRef = listItemRefs.current[listIndex][inputType]
		if(nextRef && nextRef?.focus){
			nextRef.focus();
			isFocused.current = listIndex+' '+inputType
		}
		else{
			console.log('failed to go to next ref. Total refs:',listItemRefs.current.length,'. Current ref:',isFocused.current)

		}
	}
	const hasNextFocus = ()=>{
		let {index:listIndex, type:inputType} = parseIsFocused();
		// if the listIndex isnt the last item, then theres a next focus
		return listIndex < expenses.length -1 ||
			// if it is the last item, but the inputType is name, then theres a next focus
			inputType == 'name'
	}
	return {
		getPriceSum, getWageNeeded, getHoursNeeded, canRenderChart,
		addRef, parseIsFocused, goToNextFocus, hasNextFocus
	}
}
const randomPrice=(min,max)=>{
	if(!min)
		min = 9.99
	if(!max)
		max = 100
	let diff = max - min
	let priceStr  = (min + Math.random()*diff).toFixed(2)
	return parseFloat(priceStr)
}

export const idGenerator=(index='',name='item')=>{
	const characters = 'abcdefghijklmnopqrstuvwxyz'+'0123456789'.repeat(3);
	const idLen = 20;
	let id = `${name}-`
	if(index)
		id+=`${index}-`;
	while(id.length < idLen){
		let i = Math.floor(Math.random()*characters.length);
		id+=characters[i];
	}
	return id
}
