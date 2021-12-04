const isoCodes = require('../assets/jsons/codes.json')
const salesTaxRates = require('../assets/jsons/sales-tax-rates.json')

export default function useSalesTaxRates({isoCountryCode,region}){
	let countryTaxInfo = salesTaxRates[isoCountryCode]
	let states = countryTaxInfo?.states
	let isValidRegion = Boolean(countryTaxInfo) && 
		//if country has states confirm that info about that region exists
		states && states[region]
	if(!isValidRegion){
		let keys = Object.keys(isoCodes)
		// isoCodes keys are region names
		region = keys.find(key=>key.toLowerCase() == region.toLowerCase())
		if(!region)
			return null
		// use region name to get iso codes
		isoCountryCode = isoCodes[region].countryCode
		region = isoCodes[region].provinceCode
		// use country isocode to get countryinfo
		countryTaxInfo = salesTaxRates[isoCountryCode]
		if(!countryTaxInfo)
			return null
		states = countryTaxInfo.states
	}
	// country tax rate
	let countryTaxRate = countryTaxInfo.rate
	let regionTaxRate = 0.0
	if(states){
		// use states to get region tax
		regionTaxRate = states[region].rate
		// if country has states but tax for given region is undefined then a failure has occurred
		if(!regionTaxRate)
			return null
	}
	return countryTaxRate + regionTaxRate
	
}