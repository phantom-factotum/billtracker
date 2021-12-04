import React, { 
	useState, 
	useEffect, 
	useContext,
	useRef
} from 'react';
import { 
	View,
	StyleSheet,
	Text,
	Button,
	useWindowDimensions,
	ScrollView,
} from 'react-native';
// import PieChart from 'react-native-pie-chart';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit";

import useUserContext from '../hooks/useUserContext';
import useExpenseContext from '../hooks/useExpenseContext';
import useCalculationsContext from '../hooks/useCalculationsContext';
import useExpenseHelpers from '../hooks/useExpenseHelpers';
import { idGenerator } from '../hooks/ExpensesReducer'

import TableItem from '../components/TableItem'
import LabeledSwitch from '../components/LabeledSwitch'
import ColorGenPicker from '../components/ColorGenPicker'


const totalColumns = 2 
const circleSize = 24

export default function Home({navigation}){
	
	const { expenses, colorGenType, dispatch:expenseDispatch 	} = useExpenseContext().context;
	const {getHoursNeeded, getWageNeeded, getPriceSum, canRenderChart} = useExpenseHelpers();
	const { payType, weeklyHours, wage } = useCalculationsContext().context
	const { width, height } = useWindowDimensions();
	const [ colorChanger, setColorChanger ] = useState(false)
	const interval = useRef();

	const isUsingHours = payType == 'hours'
	const isLandScape = width > height
	const chartSize = isLandScape ? height : width
	
	// sort expenses by price and generate new ids (ids are index base so this is necessary)
	let data = expenses.filter(e=>parseFloat(e.price)>0).
    sort((a,b)=>b.price - a.price).
    map((expense,i,e)=>({
		  ...expense,
		  id:idGenerator(i),
	  }))
	
	useEffect(()=>{
		// if not changing colors, then return
		if(!colorChanger){
			return
		}
		// change colors every few seconds
		interval.current = setInterval(()=>{
			expenseDispatch({
				type:'useColorVariation'
			})
		},1000)
		return ()=>clearInterval(interval.current)
	},[colorChanger])
	
	const labelStyle = isLandScape ? 
		{bottom:'50%', width:'100%',justifyContent:'space-between'} : 
		{bottom:'0%',left:'0%'}
	if(!canRenderChart()){
		return(
			<View style={styles.container}>
				<Text>Add prices to your expenses!</Text>
			</View>
		)

	}
	return (
		<View style={styles.container}>
		<Text> Analysis of your expenses: </Text>
		<ScrollView 
			style={{width:'100%'}}
			contentContainerStyle={{alignItems:'center'}}
			horizontal={false}
		>
			<PieChart
				width={chartSize}
				height={chartSize}
				accessor={"price"}
				avoidFalseZero
				data={data}
				chartConfig={{
		      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
		      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
		    }}
		    hasLegend={false}
		    center={[chartSize/4,0]}
			/>
			<View style={[styles.labelsContainer,labelStyle]}>
				<View style={styles.row}>
					{data.map((expense,i)=>{
            const isIncomplete = !expense.name || parseFloat(expense.price) == 0
            const incompleteStyle = {fontWeight:'300',opacity:.6}
            return (
              <View style={[styles.labelItemContainer]} key={idGenerator(i,'labelItems')}>
                {isLandScape && i%2 == 1 && <View style={{width:'60%'}}/>}
                <View style={[styles.minicircle,{backgroundColor:expense.color}]} />
                <Text style={ isIncomplete ? incompleteStyle : {}}>{expense.name || '(Untitled)'}</Text>
              </View>
            )
					})}
				</View>
				<LabeledSwitch
					label={'Change colors'}
					currentValueMessage={colorChanger ? "Changing colors periodically":"Static colors"}
					isActive={colorChanger}
					value={colorChanger}
					style={{padding:5, paddingVertical:20, top:isLandScape?'0%':'0%'}}
					onValueChange={setColorChanger}
				/>
				<ColorGenPicker style={{paddingVertical:20}} />
			</View>
			</ScrollView>
			<View style={styles.dataItemsContainer}>
				<TableItem title="# of expenses:" value={expenses.length} />
				<TableItem title="Total expenses:" value={getPriceSum().toFixed(2)} />
				{isUsingHours ?
					<TableItem 
						title={`Wage needed at working ${weeklyHours}/hrs a week`}
						value={`$${getWageNeeded().toFixed(2)}/hr`}
					/> :
					<TableItem 
						title={`Hours needed per week while making $${wage}/hr`} 
						value={`${getHoursNeeded().toFixed(2)}hrs`}
					/>
				}
			</View>
			</View>
	);
}

const styles = StyleSheet.create({
	container:{
		flex:1,
		justifyContent:'center',
		alignItems:'center',
		padding:10,
		backgroundColor:'transparent'
	},
	dataItemsContainer:{
		// flex:1,
		width:'100%',
		// overflow:'visible'
	},
	labelsContainer:{
		// flex:1,
		width:'100%',
		alignItems:'flex-start',
	},
	row:{
		flexDirection:'row',
		flexWrap:'wrap',

	},
	labelItemContainer:{
		// position:'absolute',
		width:'50%',
		// flexWrap:'wrap', 
		flexDirection:'row',
		// borderWidth:2
	},
	minicircle:{
		borderRadius:200,
		width:circleSize,
		height:circleSize,
		marginRight:5,
		aspectRatio:1,
		borderWidth:1,
		borderColor:'#eee'
	},
})