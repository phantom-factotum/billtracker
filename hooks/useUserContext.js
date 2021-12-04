import React, {
	createContext,
	useState
} from 'react';
const UserContext = createContext({ 
	user:{},
	setUser:()=>{},
});
export default function useUserContext(){
	const context = React.useContext(UserContext);
  return {
  	context:context,
  	provider:UserContext.Provider
  };
}