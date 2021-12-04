const Color = require('color-js');
const convert = require('color-convert');
const chalk = require('chalk');
const ctx = new chalk.Instance({level:3});
// lab color dist is a scale to 100
const thresholdLevels = {
	'unacceptable': 3,
	'barelyDifferent': 7,
	'acceptable':20,
	'golden':44,
	'perfectionist':70,
	'closeOpposites':90,
	'opposite':100,
}
// use chalk to log the color
const logColor = color=>{
	if(ctx.level < 0)
		return
	console.log(ctx.bgHex(color)('  '),color)
}
const logColorSquares = colors=>{
	if(ctx.level < 0)
		return
	let squares = colors.map(color=>ctx.bgHex(color)('  '))
	let str = ''
	for(let i = 0; i<squares.length;i++){
		str+= squares[i]+' '
		if(i%20 == 0 && i>0)
			str+='\n\n'
	}
	console.log('Colors generated:')
	console.log(str)
	console.log()
}
const logBoxColor = 0;
// generates array of colors using golden ratio
export const genColorsWithGoldenRatio=(len=1,options={})=>{
	const PHI = (1+Math.sqrt(5))/2
	if(!len || len < 1)
		len = 1;
	let { 
		startHue=0,
		hueOffset=0,
		saturation=.8,
		value=.99,
		useRandom=true,
		variationRatio=.4
	} = options;
	if(useRandom)
		startHue = getRandom();
	let sOffset =  0;
	let vOffset =  0;
    //variations will do +/-
    variationRatio = Math.abs(variationRatio/2);
	// range of value variations
	let colors = new Array(len).fill(0).map((e,i)=>{
		startHue+= (1/PHI);
		startHue%=1;
    if(variationRatio && useRandom){
        sOffset=getRandom(-variationRatio*saturation,variationRatio*saturation);
        vOffset=getRandom(-variationRatio*value,variationRatio*value);
    }
		const color = Color({
      hue:Math.abs((startHue*256 - hueOffset) % 255),
			saturation: clipValue( saturation +sOffset ),
			value: clipValue( value + vOffset )
		})
		// logColor(color.toString())
		return color.toString()
	})
	logColorSquares(colors);
	return colors;
}

//forces a number to be inclusively between 0 and 1
const clipValue=value=>{
	if(value > 1)
		return 1
	if(value<0)
		return 0
	return value
}
// uses l*a*b* dist to remove similar colors
const removeSimilarColors=(colors,thresholdLevel='golden')=>{
	if(!Object.keys(thresholdLevels).find(t=>t==thresholdLevel))
		thresholdLevel = 'golden'
	let deleteIndices = []
	// if colors items isnt a Color object convert them
	if(colors.every(color=>color instanceof Color))
		colors = colors.map(color=>Color(color))
	colors.forEach((color1,i)=>{
		colors.forEach((color2,j)=>{
			// no need to compare same item
			if(i == j)
				return
			// if color2 will already be deleted no need to compare
			if(deleteIndices.find(index=>j==index))
				return
			let dist = getColorDist(color1,color2)
			if(dist < thresholdLevels[thresholdLevel])
				deleteIndices.push(j)
		})
	})
	// return the colors with indices that arent in deleteIndices
	return colors.filter((color,i)=>!deleteIndices.find(index=>index == i))
}
const changeThreshold = (threshold,isIncrementing=true)=>{
	let keys = Object.keys(thresholdLevels)
	let index = keys.findIndex(t=>t == threshold)
	index+= isIncrementing ? 1 : -1
	return keys[index]
}
// list of colors generated from creating schemes from
// random colors
export const genColorsWithScheme=len=>{
	let maxIterations = Math.max(len/4,15)
	let colors = []
	let iterations = 0
	let threshold ='perfectionist'
	while(colors.length < len){
		if(iterations > maxIterations){
			let newThreshold = changeThreshold(threshold,false)
			// console.log('changing threshold from',threshold, 'to',newThreshold)
			threshold = newThreshold
			iterations = 0
			maxIterations *= 2
		}
		let color = getRandomColor()
		let scheme = getColorSchemes(color)
		// if it begins to take too many iterations to get colors lower threshold
		// colors.push(color)
		// if( iterations > maxIterations * 1.5 )
		// 	threshold = 'barelyDifferent'
		colors = removeSimilarColors(colors.concat(scheme), threshold)
		iterations++
	}
	colors = colors.slice(0,len).map(c=>c.toString())
	logColorSquares(colors);
	return colors
}
// l*a*b* color dist
export const getColorDist = (color1,color2)=>{
	// if color isnt a color object, then convert it
	color1 = Color(color1)
  color2 = Color(color2)
  // convert color object to l*a*b*
	let [ l1, a1 , b1 ] = convert.hex.lab(color1.toString())
	let [ l2, a2 , b2 ] = convert.hex.lab(color2.toString())
	// get lab dist
	return Math.sqrt(
		(l2 - l1)**2 +
		(a2 - a1)**2 +
		(b2 - b1)**2 
	)
}


// color manipulation

// sometimes its easier to just convert color to rgba
// and play with opacity
export const setOpacity = (color,opacity=1)=>{

	color = Color(color)
	const r = Math.floor(color.getRed()*256);
	const g = Math.floor(color.getGreen()*256);
	const b = Math.floor(color.getBlue()*256);
	const rgb = [r,g,b].join(', ')
	return `{rgba(${rgb}, ${opacity})}`
}
// lighten color using Color
export const lightenColor = (color,ratio=0.4)=>{
	return Color(color).
		lightenByRatio(ratio).
		toString()
}
export const darkenColor = (color,ratio=0.4)=>{
	return Color(color).
		darkenByRatio(ratio).
		toString()
}
// alter hsv by ratio
export const alterHSVByRatio = (color,{h=1,s=1,v=1})=>{
	return Color(color).
		//shift hue accepts a value between 0-360 so multiply
		//ratio byt this value
		shiftHue(h*360).
		saturateByRatio(s).
		valueByRatio(v).
		toString()
}


// scheme grabbing
export const getComplementary = (color)=>{
	return Color(color).complementaryScheme().map(c=>c.darkenByRatio(0.6).toString())
}
export const getTetradicScheme=color=>{
	return Color(color).tetradicScheme().map(c=>c.toString())
}
// combine all schemes for a given color
const getColorSchemes = color=>{
	color = Color(color)
	let colorSchemes = [
		...color.tetradicScheme(),
		...color.clashScheme(),
		...color.triadicScheme(),
		...color.fiveToneAScheme(),
		...color.fiveToneBScheme(),
		...color.fiveToneCScheme(),
		...color.fiveToneDScheme(),
		...color.fiveToneEScheme(),
		...color.neutralScheme(),
		...color.sixToneCWScheme(),
		...color.sixToneCCWScheme(),
	]
	return removeSimilarColors(colorSchemes,'barelyDifferent')
}


// randomization
export const getRandomColors=(num)=>{
	let colors = Array(num).fill(0).map(e=>{
		return getRandomColor()
	})
	logColorSquares(colors);
	return colors
}
export const getRandomColor = (min=0,max=255)=>{
	let randomRGB = [ getRandom(min,max), getRandom(min,max), getRandom(min,max) ]
	return Color(randomRGB)
}
export const randomNegation = num=>{
	return Math.random() > .5 ? -num : num
}
export const getRandom = (min=0,max=1)=>{
	let range = max - min
	return Math.random()*range+min
}

let getRandomNumbers = (len,min,max)=>
	new Array(len).fill(0).map(n=>getRandom(min,max))

// the color generator itself
export  const colorGenerators = {
	'golden_ratio':{
		generate:genColorsWithGoldenRatio,
		label:'Even variation', 
		value:'golden_ratio',
		description:'Use the golden ratio to produce evenly distant colors in hsv color space.'+
		' Doesnt gaurantee distinct color variation'

	},
	'random_schemes':{
		generate:genColorsWithScheme,
		label:'Random schemes',
		value:'random_schemes',
		description:'Grab random color schemes and remove similar colors.'+
		' The smaller the list, the greater the color distinction'
	},
	'random':{
		generate:len=>getRandomColors(len).map(c=>c.toString()),
		label:'Random Colors', 
		value:'random', 
		description:'Randomly grab colors. Color distinction is not considered',
	},
}

// my personal fav primary app color
const ogColor = '#0000D3';
// I can use the Color module to generate color schemes for the app!!
// if i 
const appPrimaryColor = ogColor || '#6624A9';
const appColorScheme = ()=>{
	let scheme = getTetradicScheme(appPrimaryColor);
	// this is used in placeholder text
	scheme = scheme.concat(
		setOpacity(alterHSVByRatio(appPrimaryColor,{h:-.01,s:-.4,v:.4}),0.4),
		lightenColor(alterHSVByRatio(appPrimaryColor,{h:-.01,s:.6,v:.6}),0.85)
	)
	return scheme
}
export const ColorScheme = appColorScheme();
