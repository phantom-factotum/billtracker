import React, {useReducer, useEffect, useState} from 'react';
import { getCachedData, saveAppData } from './handleAppData';

export default function useCalculations (initialState = {}){ 
	initialState = {
	  payType:'hours',
	  weeklyHours:40,
	  wage:0.0,
	  includeSalesTax:false,
	  salesTax:0.00,
	  ...initialState,
	}
	const reducer = (state, action)=>{
		let newState = {...state}
		switch(action.type){
			case 'setPayType':
				newState.payType= action.payload
				return newState
			case 'setPay':
				if(state.payType == 'hours')
					newState.weeklyHours = action.payload
				else if(state.payType == 'wage')
					newState.wage = action.payload
				else
					return state
				return newState
			case 'setIncludeSalesTax':
				newState.includeSalesTax = action.payload
				return newState
			case 'setSalesTax':
				newState.salesTax = action.payload
				return newState
			case 'setAll':
				newState = {...newState,...action.payload}
				return newState
			default:
				return state

		}
	}
	const [ calculationsData, dispatch ] = useReducer(reducer, initialState)
	return {...calculationsData, dispatch }
}