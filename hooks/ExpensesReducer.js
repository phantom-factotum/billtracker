import React, {
	useState, 
	useReducer,
	useRef,
	useCallback,
	useEffect
} from 'react';
import { colorGenerators, getRandom, randomNegation, alterHSVByRatio } from '../components/genColors'
import { getCachedData, saveAppData } from './handleAppData';


export default function ExpensesReducer (initialState={}){
	initialState = {
		expenses:[],
		colorGenType:'golden_ratio',
		...initialState
	}
	const reducer = (state, action)=>{
		const {expenses, colorGenType} = state;
		const colorGenerator = (len,gen)=>{
			if(gen && colorGenerators[gen])
				return colorGenerators[gen].generate(len)
			if(colorGenerators[colorGenType]){
				return colorGenerators[colorGenType].generate(len)
			}
			else
				return colorGenerator.golden_ratio.generate(len)
		}
		switch(action.type){
			case 'addNew':{
				let newExpenses = [...expenses ];
				const itemIndex = expenses.length
				const colors = colorGenerator(itemIndex+1)
				newExpenses.push({
					price:'',
					name:'',
					id:idGenerator(itemIndex),
					color:colors[itemIndex],

				});
        action.callback && action.callback(newExpenses)
				return {...state,expenses:newExpenses}
			}
			case 'delete':{
				return {
					...state,
					expenses:expenses.filter(expense=>expense.id != action.payload)
				}
			}
			case 'updateItem':{
				const newExpenses = expenses.slice();
				const prevExpense = newExpenses[action.payload.index]
				// user can only update name and price, things like
				// color,id should not be overwritten when updates occur
				newExpenses[action.payload.index] = {...prevExpense,...action.payload.value}
				return {...state,expenses:newExpenses}
			}
			case 'addCommonExpenses':{	
				const itemsToAdd = commonExpenses.filter(commonExpense=>
					!expenses.find(expense=>
						expense.name.includes(commonExpense.name)
					)
				)
				let newExpenses = itemsToAdd.concat(expenses)
				newExpenses = colorGenerator(newExpenses.length).map((color,i)=>{
					return {
						...newExpenses[i],
						color,
						id:idGenerator(i)
					}
				})
				return {
					...state,
					expenses:newExpenses
				}
			}
			case 'emptyList':{
				return {...state,expenses:[]}
			}
			case 'reorderList':{
				expenses.splice(action.payload.toIndex, 0, expenses.splice(action.payload.fromIndex, 1)[0])
				// return expenses
				return {
					...state,
					expenses:expenses.map((e,i)=>{
						e.id = idGenerator(i)
						// e.color = colors[i]
						return e
					})
				}
			}
			case 'setAll':{
				const newState  = action.payload
				const colors = colorGenerator(newState.length)
				return {
					...newState,
					colorGenerator: newState.colorGenerator || 'golden_ratio',
					expenses:newState.expenses.map((expense,i)=>{
						expense.id = idGenerator(i)
						if(!expense.color)
							expense.color=colors[i]
						return expense
					})
				}
			}
			case 'useColorVariation':{
				const colors = colorGenerator(expenses.length)
				return {
					...state,
					expenses:expenses.map((expense,i)=>{
						// increase color randomness by randomly
						// increasing/decreasing hsv ratios
						let hsvRatios = {
							// change hue by up to +/-2%
							h:randomNegation( getRandom(0, 0.02) ),
							// change saturation by up to +/-20%
							s:randomNegation( getRandom(0, 0.2) ),
							// change value by up to +/-20%
							v:randomNegation( getRandom(0, 0.2) )
						}
						expense.color = alterHSVByRatio(colors[i],hsvRatios)
						return expense
					})
				}
			}
			case 'setColorGenerator':{
				let newColorGenType = action.payload
				// if key doesnt exist do nothing
				if(!Object.keys(colorGenerators).find(key=>key==newColorGenType))
					return state
				// when color generator changes, regenerate colors for expenses
				const colors = colorGenerator(state.expenses.length, newColorGenType)
				// update colorGenType and expenses
				return {
					...state,
					//update colorGenType
					colorGenType:newColorGenType,
					expenses:expenses.map((e,i)=>{
						return {
							...e,
							color:colors[i]
						}
					})
				}
			}
			default:{
				return state
			}
		}
	}

	// ref used to know what input is in focused
	const isFocused = useRef("");
	// list of text input refs
  const listItemRefs = useRef([]);
	const [ expensesData, dispatch] = useReducer(reducer,initialState)
	
 
	
	return {
		isFocused, listItemRefs, ...expensesData, dispatch
	}
	
}

const commonExpenses = [
	{name:'Rent', price:750},
	{name: 'Water Bill',price:50.00},
	{name:'Electric Bill',price:75.00},
	{name:'Gas Bill',price:75.00},
	{name:'Groceries', price:150.00},
	{name:'Internet Bill',price:125},
	{name:'Phone Bill',price:75.00},
	{name:'Hygiene',price:50},
	{name:'Gas (Vehicle)',price:100.00},
	{name:'Car Insurance',price:200},
	{name:'Savings', price:200.00},
	{name:'Miscellaneous',price:50},
	{name:'Entertainment',price:50},
]

export const idGenerator=(index='',name='item')=>{
	const characters = 'abcdefghijklmnopqrstuvwxyz'+'0123456789'.repeat(2);
	const charsToAdd = 20;
	
	let id = `${name}-`
	if(index)
		id+=`${index+1}-`;
	let offset = id.length
	let addedChars = 0;
	while(addedChars < charsToAdd){
		let i = parseInt(getRandom(0,characters.length));
		//every few letters add a separator to make ids more readable
		if(addedChars % 6 == 0 && addedChars != 0)
			id+='-'
		id+=characters[i];
		addedChars++
	}
	return id
}
