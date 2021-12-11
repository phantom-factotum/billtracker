import React, {
	createContext,
	useState
} from 'react';
const TutorialContext = createContext({});
export default function useTutorialContext(){
	const context = React.useContext(TutorialContext);
  return {
  	context:context,
  	provider:TutorialContext.Provider
  };
}