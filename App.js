import { LogBox } from "react-native"
// try to suppress logbox warnings
LogBox.ignoreAllLogs([""]);
// YellowBox.ignoreAllLogs([""]);

import 'react-native-gesture-handler';
import React,{
  useState,
  useContext,
  useEffect,
  useRef,
  createContext
} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Dimensions,
  useWindowDimensions
} from 'react-native';

import AppLoading from 'expo-app-loading';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

import LoginScreen from './screens/Login';
import HomeScreen from './screens/Home';
import AddExpensesScreen from './screens/Expenses';
import SettingsScreen from './screens/Settings';
import DrawerRenderer from './components/Drawer';

import useUserContext from './hooks/useUserContext';
import useExpenseContext from './hooks/useExpenseContext';
import useTutorialContext from './hooks/useTutorialContext';
import useCalculationsContext from './hooks/useCalculationsContext';
import useExpenseHelpers from './hooks/useExpenseHelpers';
import ExpensesReducer from './hooks/ExpensesReducer';
import CalculationsReducer from './hooks/CalculationsReducer';
import TasksReducer from "./hooks/TasksReducer";
// import useUser from './hooks/useUser';
import { getCachedData, saveAppData, appDataExists } from './hooks/handleAppData';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator()
// created to open app without using saved data
const ignoreSavedData = false;

const App = () => {
  // context providers
  const { provider:UserContextProvider } = useUserContext();
  const { provider:ExpenseContextProvider } = useExpenseContext();
  const { provider:TutorialContextProvider } = useTutorialContext();
  const { provider:CalculationsContextProvider } = useCalculationsContext();
  // state vars
  const calculationsData = CalculationsReducer();
  const expensesData = ExpensesReducer();
	const tutorialData = TasksReducer();
  const [user,setUser] = useState({showTutorial:true});
  const [ isSigningOut, setIsSigningOut] = useState(false);
  const [ isReady, setIsReady ] = useState(false);
  // let expensesData, calculationsData
  
  const isSignedIn = Object.keys(user || {}).length > 0 && user.uid
  const hasExpenses = expensesData?.expenses?.length > 0 || false;
  // home page has pie chart so I created function to determine
  // if a useful chart could be rendered
  const {canRenderChart} = useExpenseHelpers();
 
  const headerShown = {headerShown:false}
  const logout = ()=>{
    // when logging out, data is overwritten isSigningOut will be used to preserve that data
    setIsSigningOut(true)
    expensesData.listItemRefs = [];
    expensesData.isFocused = '';
    const {uid,...newUser} = user;
		tutorialData.dispatch({type:'setIndex',payload:{index:0}})
    setUser(newUser);
  }
  const userData = {...user,setUser,logout,isSigningOut, setIsSigningOut}
  const loadData = async ()=>{
    return await new Promise (async (resolve, reject)=>{
      if(ignoreSavedData){
				return resolve()
      }
      const data = await getCachedData();
      if(data){
        if(data.calculationsData)
          calculationsData.dispatch({type:'setAll',payload:data.calculationsData});
        if(data.expensesData)
          expensesData.dispatch({type:'setAll',payload:data.expensesData});
        // load user data last, as this will trigger navigation
        if(data.userData)
          // showTutorial should be only active if new user
          setUser({...user,...data.userData});
				if(data.tutorialData){
					tutorialData.dispatch({
						type:'setIndex',
						payload:{
							index:data.tutorialData.index
						}
					})
				}
        return resolve();
      }
      return;
    })
  }
  const onLoadFinish = ()=>{
    setIsReady(true)
  }

  //effects
	// saveAppData on expense/user/calculations data change
  useEffect(()=>{
    // dont overwrite on log outs
    if(isSigningOut)
      return
    saveAppData({
      userData:user,
      expensesData,
      calculationsData,
			tutorialData:{
				index:tutorialData.currentIndex
			}
    })
    // saveData()
  },
  [user,isSigningOut,expensesData,calculationsData])
	//listen for user cancellation or completion of tutorial
	useEffect(()=>{
		// user has completed tutorial
		if(user.showTutorial && tutorialData.completed){
			console.log('tutorial disabled by user completion')
			setUser({...user,showTutorial:false})
		}
		//user has gone into settings and turn off tutorial mode
		else if(!user.showTutorial && !tutorialData.completed){
			console.log('tutorial mode disabled by settings')
			// tutorialData.dispatch({type:'removeAll'})
			setUser({...user,showTutorial:false})
		}
	},[user.showTutorial,tutorialData])
// try to suppress logbox warnings
  useEffect(() => LogBox.ignoreLogs(['']), [])

  return (
    <SafeAreaView style={styles.container}>
    <NavigationContainer>
      <UserContextProvider value={{ user, setUser, logout, isSigningOut,setIsSigningOut }}>
      <ExpenseContextProvider value={ expensesData }>
      <CalculationsContextProvider value={ calculationsData }>
			<TutorialContextProvider value={tutorialData}>
        {isReady ? (
          isSignedIn ? (
            <Drawer.Navigator drawerContent={props=><DrawerRenderer {...props} />} >
              { hasExpenses && canRenderChart(expensesData.expenses) &&
                <Drawer.Screen
                  name="Home" 
                  component={HomeScreen}
                  options={headerShown}
                />
              }
              <Drawer.Screen 
                name="Expenses" 
                component={AddExpensesScreen}
              />
              <Drawer.Screen 
                name="Settings"
                component={SettingsScreen}
              />
            </Drawer.Navigator>
            ) : (
              <Stack.Navigator>
                <Stack.Screen name="Login" component={LoginScreen} options={headerShown}/>
              </Stack.Navigator>
            )
          ) : (
          <AppLoading
            startAsync={loadData}
            onError={console.warn}
            onFinish={onLoadFinish}
          />
        )
        }
			</TutorialContextProvider>
      </CalculationsContextProvider>
      </ExpenseContextProvider>
      </UserContextProvider>
    </NavigationContainer>  
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
  }
});

export default App;
