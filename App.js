import { LogBox, YellowBox } from "react-native"
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
import TutorialScreen from './screens/Tutorial';
import DrawerRenderer from './components/Drawer';

import useUserContext from './hooks/useUserContext';
import useExpenseContext from './hooks/useExpenseContext';
import useExpenseHelpers from './hooks/useExpenseHelpers';
import useCalculationsContext from './hooks/useCalculationsContext';
import ExpensesReducer from './hooks/ExpensesReducer';
import CalculationsReducer from './hooks/CalculationsReducer';
// import useUser from './hooks/useUser';
import { getCachedData, saveAppData, appDataExists } from './hooks/handleAppData';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator()

const ignoreSavedData = true;

const App = () => {
  // context providers☻
  const { provider:UserContextProvider } = useUserContext();
  const { provider:ExpenseContextProvider } = useExpenseContext();
  const { provider:CalculationsContextProvider } = useCalculationsContext();
  // state vars
  const calculationsData = CalculationsReducer();
  const expensesData = ExpensesReducer();
  const [user,setUser] = useState({});
  const [ isSigningOut, setIsSigningOut] = useState(false);
  const [ isReady, setIsReady ] = useState(false);
  // let expensesData, calculationsData
  
  const isSignedIn = Object.keys(user || {}).length > 0 && user.uid
  const hasExpenses = expensesData?.expenses?.length > 0 || false;
  const {canRenderChart} = useExpenseHelpers();
 
  const headerShown = {headerShown:false}
  const logout = ()=>{
    // when logging out, data is overwritten isSigningOut will be used to preserve that data
    setIsSigningOut(true)
    expensesData.listItemRefs = [];
    expensesData.isFocused = '';
    const {uid,...newUser} = user;
    setUser(newUser)
  }
  const userData = {...user,setUser,logout,isSigningOut, setIsSigningOut}
  const loadData = async ()=>{
    return await new Promise (async (resolve, reject)=>{
      if(ignoreSavedData)
        resolve()
      const data = await getCachedData();
      if(data){
        if(data.calculationsData)
          calculationsData.dispatch({type:'setAll',payload:data.calculationsData});
        if(data.expensesData)
          expensesData.dispatch({type:'setAll',payload:data.expensesData});
        // load user data last, as this will trigger navigation
        if(data.userData)
          setUser({showTutorial:true,...data.userData});
        resolve();
      }
      reject();
    })
  }
 
  const onLoadFinish = ()=>{
    setIsReady(true)
  } 
  useEffect(()=>{
    // dont overwrite on log outs
    if(isSigningOut)
      return
    saveAppData({
      userData:user,
      expensesData,
      calculationsData
    })
    // saveData()
  },
  [user,isSigningOut,expensesData,calculationsData,user])
  useEffect(() => LogBox.ignoreLogs(['']), [])
  return (
    <SafeAreaView style={styles.container}>
    <NavigationContainer>
      <UserContextProvider value={{ user, setUser, logout, isSigningOut,setIsSigningOut }}>
      <ExpenseContextProvider value={ expensesData }>
      <CalculationsContextProvider value={ calculationsData }>
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
