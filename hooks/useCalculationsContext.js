import React, {
	createContext,
	useState
} from 'react';
const CalculationsContext = createContext({ 
	useHours:true,
	weeklyHours:40,
	setWeeklyHours:()=>{},
	wage:0.0,
	setWage:()=>{},
});
export default function useExpenseContext(){
	const context = React.useContext(CalculationsContext);
  return {
  	context:context,
  	provider:CalculationsContext.Provider
  };
}