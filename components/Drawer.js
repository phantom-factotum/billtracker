import React, {useState, useEffect} from 'react';
import {
  View, Image, Text, Alert, Platform
} from 'react-native'
import { 
  createDrawerNavigator, DrawerContentScrollView,
  DrawerItemList, DrawerItem
} from '@react-navigation/drawer';
import * as MediaLibrary from 'expo-media-library';
import * as DocumentPicker from 'expo-document-picker';

import useUserContext from '../hooks/useUserContext'
import { userDataFilePath, clearAppData, exportFile } from '../hooks/handleAppData';
import useCalculationsContext from '../hooks/useCalculationsContext'

export default function AppDrawerContent(props){
  const {user,setUser, logout}  = useUserContext().context;
  // exporting a file on ios is such a breeze...
  
  let photoUrl = user?.photoURL || 
    `https://gracecirocco.com/wp-content/uploads/2014/02/Flowing-11.jpg`
  return (
    <DrawerContentScrollView {...props}>
      <View style={{alignItems:'center',paddingBottom:10}}>
        <Image 
          source={{uri:photoUrl}}
          style={{
            aspectRatio:1,
            width:100,
            height:100,
            borderRadius:400,
            margin:5
          }}
        />
        <Text style={{fontWeight:'700',fontSize:14}}>Hi, {user?.name || 'user'}!</Text>
        <Text style={{fontWeight:'300',fontSize:12}}>{user?.email || 'test@example.com'}</Text>
      </View>
      <DrawerItemList {...props}  />
      <View style={{marginVertical:20,paddingVertical:20,justifyContent:'flex-end',borderTopWidth:1}}>
        <DrawerItem
          label="Delete App Cache"
          onPress={()=>{
            clearAppData(false).then(()=>{
              logout();
            })
          }}
        />
        <DrawerItem 
          label="Export Data"
          onPress={exportFile}
          style={{margin:0,padding:0}}
        />
        <DrawerItem 
          label="Sign out"
          onPress={()=>{
            logout();
          }}
          style={{margin:0,padding:0}}
        />
      </View>
    </DrawerContentScrollView>
  );
  }