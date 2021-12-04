import React, { 
	useState, 
	useEffect, 
	useContext 
} from 'react';
import { 
	View,
	StyleSheet,
	Text,
	Button
} from 'react-native';

export default function defaultButton({label='I need a label', onPress=()=>{}, style, color='green'}){
	style = [styles.button,style];
	return (
		<View style={styles.container}>
			<View style={style}>
				<Button
					title={label}
					onPress={onPress}
					color={color}
				/>
			</View>
		</View>

	);
}

const styles = StyleSheet.create({
	container:{
		// flex:1,
		flexDirection:'row',
		alignItems:'center',
		justifyContent:'center',
		width:'100%',
	},
	button:{
		margin:5,
	}
});