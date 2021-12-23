import React, {
	useReducer,
	useEffect,
	useRef,
} from 'react';
import { 
  // Animated,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Button,
  Alert,
  useWindowDimensions
} from 'react-native';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	interpolate,
	withSequence,
	withRepeat,
	withTiming,
	withDelay,
	cancelAnimation
} from 'react-native-reanimated';
const chalk = require('chalk');
const myChalk = new chalk.Instance({level:3});
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
        return useAnimatedStyle(()=>{
          const scale = interpolate(anim.value,[0,1],[1,growthScale])
					return {
							transform:[
								{scaleX:scale},
								{scaleY:scale}
							]
					}
        })
      }
      // if placement is important while growing, then
      // slideAndGrow may fix placement by
      //sliding base on growthScale and deviceWidth
      case 'slideAndGrow':{
				const { width } = useWindowDimensions();
				return  useAnimatedStyle(()=>{
					const scale = interpolate(anim.value,[0,1],[1,growthScale])
					return {
						transform:[
							{translateX:interpolate(anim.value,[0,1],[0,growthScale*width*.1])},
							{scaleX:scale},
							{scaleY:scale}
						],
					}
        })
      }
      case 'fadeAndGrow':{
				return useAnimatedStyle(()=>{
					const scale = interpolate(anim.value,[0,1],[1,growthScale])
					return {
						transform:[
							{scaleX:scale},
							{scaleY:scale}
						],
						opacity:anim.value
						// textAlign:'center',
					}
        })
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
      let anim = useSharedValue(0)
      return {
        // when started is true animation will loop
        name, anim, animationType,
        started:false,
        animationStyle:animationStyles(animationType,anim),
				onStart:() => {
					console.log('Starting task',myChalk.green(name))
					anim.value = withRepeat(
						withSequence(
							withTiming(1,{
								duration:2000
							}),
							withTiming(0,{
								duration:2000
							}),
						),
						// times to repeat
						-1,
						//loop in reverse
						true
					)
				},
				onStop:()=>{
					console.log('Stopping task',myChalk.green(name))
					cancelAnimation(anim)
				},
				onComplete:()=>{
					console.log('Task',myChalk.green(name),'completed')
					cancelAnimation(anim)
				}
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
        if(!currentTask)
					return state;
        currentTask.onStart()
        tasks[currentIndex] = {...currentTask,started:true}
        return {...state,currentIndex, tasks}
      }
      case 'stopTask':{
        if(!currentTask)
					return state;
				currentTask.onStop();
        tasks[currentIndex] = {...currentTask,started:false}
        return {...state,currentIndex, tasks}
      }
      // when task is completed set currentIndex to next task
      // and update taskLeft and completed
      case 'taskCompleted':{
        if(!currentTask)
					return state;
        currentTask.onComplete();
				tasks[currentIndex] = {...currentTask,started:false};
        // update index and start the next task
				currentIndex = currentIndex+1;
        tasksLeft = tasks.length - currentIndex;
				completed = tasksLeft <= 0;
				if(!completed){
					tasks[currentIndex].started = true
					tasks[currentIndex].onStart();
				}
				else
					Alert.alert("You've completed the tutorial!","Please enjoy the app!")
        return {...state, 
					tasks,tasksLeft,currentIndex, completed
        }     
      }
			case 'setIndex':{
				let newIndex = action.payload.index;
				currentTask = tasks[newIndex];
				if(newIndex == currentIndex || !currentTask)
					return state;
				console.log('Setting active task to:',myChalk.green(currentTask.name));
				currentTask.onStart();
				tasks[newIndex] = {...currentTask,started:true}
				return {...state,tasks,currentIndex:newIndex}
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
			console.log('Failed to find tutorial task:',name)
			return null
		}
		return state.tasks[index]
	}
	return {...state, dispatch, isCurrentTask, findTask, findTaskIndex}
}