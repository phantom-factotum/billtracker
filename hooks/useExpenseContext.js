import React, {
	createContext,
	useState
} from 'react';
const ExpenseContext = createContext({ 
	expenses:[],
	setExpenses:()=>{},
	weeklyHours:40,
	setWeeklyHours:()=>{},
	isFocused:"",
	listItemRefs:[]
});
export default function useExpenseContext(){
	const context = React.useContext(ExpenseContext);
  return {
  	context:context,
  	provider:ExpenseContext.Provider
  };
}