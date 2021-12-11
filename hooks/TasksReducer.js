import React, {
	useReducer,
	useEffect,
	useRef,
} from 'react';
import { 
  Animated,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Button,
  Alert,
  useWindowDimensions
} from 'react-native';

// all tutorial tasks
/*
  I tried to avoid having to hard code each task with an 
  animation value and an animation style. I found that
  all animation toValues were the same and that animation
  styles sometimes repeated so instead of hard coding each 
  animation and style I will map over these values adding
  all the needed data
*/
const tasksNames = [
	{name:'Add Common Expenses',animationType:'grow'},
	{name:'Open Swipe Button Tray',animationType:''},
	{name:'Open Color Modal',animationType:'slideAndGrow'},
	{name:'Change Expense Color',animationType:'fadeAndGrow'},
	{name:'Scroll To New Expense',animationType:'grow'},
	{name:'Delete Expense',animationType:''}
]


export default function tasksReducer (onEvents=[]){
  // get animationStyle base on type
  // anim is animatedValue
  // config allows for customization of the animations
  const animationStyles = (type,anim,config={})=>{
    const {
      // an animation slides that uses the deviceWidth
      // to slide smoothly
      deviceWidth=1,
      // view growth factor
      growthScale=1.2,
      // percentage of width to slide by 
      widthScale=.1
      } = config
   
    switch(type){
      case 'grow':{
        const scale = anim.interpolate({
          inputRange:[0,1],
          outputRange:[1,growthScale]
        })
        return {
          transform:[
            {scaleX:scale},
            {scaleY:scale}
          ]
        }
      }
      // if placement is important while growing, then
      // slideAndGrow may fix placement by
      //sliding base on growthScale and deviceWidth
      case 'slideAndGrow':{
        const scale = anim.interpolate({
          inputRange:[0,1],
          outputRange:[1,growthScale]
        })
        return  {
          transform:[
            {translateX:anim.interpolate({
              inputRange:[0,1],
              outputRange:[0,growthScale*deviceWidth*.1]
            })},
            {scaleX:scale},
            {scaleY:scale}
          ],
        } 
      }
      case 'fadeAndGrow':{
        const scale = anim.interpolate({
          inputRange:[0,1],
          outputRange:[1,growthScale]
        })
        return {
          transform:[
            {scaleX:scale},
            {scaleY:scale}
          ],
          opacity:anim.interpolate({
            inputRange:[0,1],
            outputRange:[0,1]
          }),
          // textAlign:'center',
        }

      }
      default:
        return {}
    }
  }
  const setInitialState= ()=>{
    let state = {
      currentIndex:0,
      tasksLeft:tasksNames.length,
      completed:false,
    }
    state.tasks = tasksNames.map(({name,animationType},i)=>{
      let anim = new Animated.Value(0)
      // loop to 1 and back to 0 with delay
      let animation = Animated.loop(
        Animated.sequence([
          Animated.timing(anim,{
            toValue:1,
            useNativeDriver:false,
            duration:2000
          }),
          Animated.timing(anim,{
            toValue:0,
            useNativeDriver:false,
            duration:2000
          }),
          Animated.delay(1000)
        ],{useNativeDriver:false})
      )
      return {
        // when started is true animation will loop
        started:false,
        animationType,
        animationStyle:animationStyles(animationType,anim),
        name, anim, animation
      }
    })
    return state
  }
  
	const reducer = (state, action)=>{
		let {currentIndex, tasks, tasksLeft, completed} = {...state};
    let currentTask = tasks[currentIndex];
    if(completed && action.type !== 'reset')
      return state;
		switch (action.type) {
      case 'startTask':{
        if(!currentTask) return state;
				console.log('Starting',currentTask.name)
        currentTask.animation?.start?.()
        tasks[currentIndex] = {...currentTask,started:true}
        return {...state,currentIndex, tasks}
      }
      case 'stopTask':{
        if(!currentTask) return state;
        // currentTask.animation.stop prevents the task from being started again
        Animated.spring(currentTask.anim,{toValue:0}).start();
        tasks[currentIndex] = {...currentTask,started:false}
        return {...state,currentIndex, tasks}
      }
      // when task is completed set currentIndex to next task
      // and update taskLeft and completed
      case 'taskCompleted':{
        if(!currentTask) return state;
        currentTask.animation?.reset?.()
        currentTask.started = false;
				tasks[currentIndex] = currentTask;
        currentIndex = currentIndex+1;
        tasksLeft = tasks.length - currentIndex;
				if(tasks[currentIndex]){
					tasks[currentIndex].started = true
					let newTask = tasks[currentIndex]
					console.log('Starting',newTask.name)
        	newTask.animation?.start?.()
				}
				if(tasksLeft <= 0)
					Alert.alert("You've completed the tutorial!","Please enjoy the app!")
        return {...state, tasks,tasksLeft,currentIndex,
          completed: tasksLeft <= 0
        }     
      }
      // action.payload.configs will have Array of configurations to pass to animationStyles
      // each config will have the index/targeted animationStyle to configure
      case 'configureAnimationStyle':{
        let {configs} = action.payload;
        configs.forEach(config=>{
          let task = tasks[config.index]
          if(!task) return
          tasks[config.index].animationStyle = animationStyles(task.animationType,task.anim,config)
        })
        return {...state,tasks}
      }
      case 'empty':{
        return {}
      }
      case 'reset':{
        return setInitialState();
      }
      default:{
        return state
      }
    }
	}
	const [ state, dispatch ] =  useReducer(reducer,setInitialState());	
	const isCurrentTask = name=>{
		const {tasks, currentIndex, completed} = state;
		if(completed)
			return false
		let task = findTask(name)
		if(!task)
			return false
		return currentIndex == findTaskIndex(name)
	}
	const findTaskIndex = name=>
		state.tasks.findIndex(task=>task.name.replace(/ /g,'').toLowerCase() == name.toLowerCase())
	const findTask = name=>{
		let index = findTaskIndex(name)
		if(index < 0){
		
			console.log(name)
			console.log(state.tasks.map(task=>task.name.replace(/ /g,'')))
			return null
		}
		return state.tasks[index]
	}
	return {...state, dispatch, isCurrentTask, findTask, findTaskIndex}
}