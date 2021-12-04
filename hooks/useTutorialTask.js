import React, {useReducer, useEffect, useState} from 'react';
import { getCachedData, saveAppData } from './handleAppData';
import useUserContext from './useUserContext';

export default function useTutorialTask (props={}){
  let {defaultValue={},onShowPrompt,onCompleted} = props;
  const {user:{showTutorial}} = useUserContext().context;
  const [task, setTask ] = useState({
    showPrompt:showTutorial,
    completed:showTutorial ? false : true,
    ...defaultValue
  });
  useEffect(()=>{
    if(!showTutorial)
      return
    if(task.showPrompt)
     return onShowPrompt && onShowPrompt()
    if(task.completed){
      return  onCompleted && onCompleted()
    }
  },[task])

  if(!showTutorial)
    return [{
      showPrompt:false,
      complete:true,
    },()=>{}]
  return [task, setTask]
}