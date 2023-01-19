import vegaEmbed, { VisualizationSpec } from "vega-embed";
import { ARC, BAR } from 'vega-lite/build/src/mark';

// Read the dataset of your billionaires
const dataString: string = await (await fetch('data/billionaires.json')).text();
const billionairesDataset: Billionaire[] = JSON.parse(dataString);

// Interface to describe the dataset, and set that interface as the type of this dataset array.
interface Billionaire {
  "name": string,
  "rank": number,
  "year": number,
  "company": {
    "founded": number,
    "name": string,
    "relationship": string,
    "sector": string,
    "type": string,
  },
  "demographics": {
    "age": number,
    "gender": string,
  },
  "location": {
    "citizenship": string,
    "country code": string,
    "gdp": number,
    "region": string
  },
  "wealth": {
    "type": string,
    "worth in billions": number,
    "how": {
      "category": string,
      "from emerging": boolean,
      "industry": string,
      "inherited": string,
      "was founder": boolean,
      "was political": boolean
    }
  }
};

// Billionaries by gender
interface BillionairesByGender {
  "Year": number,
  "Gender": string,
  "Billionaires": number
}

// Getting Data from form 
const submitBtn = document.querySelector(".submit-btn");
submitBtn.addEventListener('click', () => {
  const countryFromForm: string = (<HTMLInputElement>document.getElementById("country")).value;
  const graphType: string = (<HTMLInputElement>document.getElementById("typeOfGraph")).value;
  let newGraph: VisualizationSpec;
  newGraph = getNewGraph(countryFromForm, graphType);
  vegaEmbed('#graph', newGraph);
})

function getNewGraph(Country: string, GraphType: string): VisualizationSpec {
  const copy: VisualizationSpec = JSON.parse(JSON.stringify(baseChart));
  copy['title'] = `Billionaires by ${GraphType} (${Country})`;
  if (GraphType === "Self Made") {
    const newData: BillionairesSelfMade[] = createSelfMadeData(Country, billionairesDataset);
    copy['data']['values'] = newData;
  } else if (GraphType === "Sector") {
    const newData: BillionairesBySector[] = getBillionairesBySector(Country, billionairesDataset);
    copy['data'] = {
      values: newData
    }
    copy['mark']['type'] = ARC;
    copy['encoding']['x'] = "";
    copy['encoding'] = {
        theta: {
  		    field: 'Billionaires',
      		type: 'quantitative',
      		title: 'Number of billionaires'
  	  }
    };
    copy['encoding']['y'] = '';
    copy['encoding']['color'] = {
      field: 'Sector',
      type: 'nominal'
    }
  } else if (GraphType === "Gender") {
    const newData: BillionairesByGender[] = createGenderData(Country, billionairesDataset);
    copy['data']['values'] = newData;
    copy['encoding']['color'] = {
      field: 'Gender',
      type: 'nominal'
    }
  }
  return copy;
}

// Base Chart
interface SelfMadeAndYear {
  year: number,
  selfMade: boolean
}

const selfMadeAndYear: SelfMadeAndYear[] = [
  {
    year: 1996,
    selfMade: true
  },
  {
    year: 1996,
    selfMade: false
  },
  {
    year: 2001,
    selfMade: true
  },
  {
    year: 2001,
    selfMade: false
  },
  {
    year: 2014,
    selfMade: true
  },
  {
    year: 2014,
    selfMade: false
  }
]

const selfMadeBaseData: BillionairesSelfMade[] = createSelfMadeData("Global", billionairesDataset);

const baseChart: VisualizationSpec = {
  title: "Billionaires by self made (Global)",
  data: {
    values: selfMadeBaseData
  },
  mark: {
    type: BAR
  },
  encoding: {
    x: {
      field: 'Year',
      type: 'nominal'
    },
    y: {
      field: 'Billionaires',
      type: 'quantitative',
      title: 'Number of billionaires'
    },
    color: {
      field: 'SelfMade',
      type: 'nominal'
    }
  }
}

vegaEmbed("#graph", baseChart);

// Self-made 
interface BillionairesSelfMade {
  "Year": number,
  "SelfMade": boolean,
  "Billionaires": number
}

function getBillionairesSelfMade(GivenYear: number, selfMade: boolean, billionaires: Billionaire[], Country: string): number {
  let totalBillionaires: number = 0;
  if (Country !== "Global") {
    if (selfMade == true) {
    const selfMadeArray: Billionaire[] = billionaires.filter(c => (c['year'] === GivenYear && c['wealth']['how']['inherited'] === "not inherited" && c['location']['citizenship'] === Country));
    totalBillionaires = selfMadeArray.length;
    } else {
      const selfMadeArray: Billionaire[] = billionaires.filter(c => (c['year'] === GivenYear && c['wealth']['how']['inherited'] !== "not inherited" && c['location']['citizenship'] === Country));
      totalBillionaires = selfMadeArray.length;
    }
    return totalBillionaires;
  } else {
    if (selfMade == true) {
    const selfMadeArray: Billionaire[] = billionaires.filter(c => (c['year'] === GivenYear && c['wealth']['how']['inherited'] === "not inherited"));
    totalBillionaires = selfMadeArray.length;
  }
    else {
      const selfMadeArray: Billionaire[] = billionaires.filter(c => (c['year'] === GivenYear && c['wealth']['how']['inherited'] !== "not inherited"));
      totalBillionaires = selfMadeArray.length;
    }
    return totalBillionaires;
  }
}

function createSelfMadeData(Country: string, BillionariesDataSetCopy: Billionaire[]): BillionairesSelfMade[] {
  BillionariesDataSetCopy.slice();
  let billionairesBySelfMade: BillionairesSelfMade[] = [];
  for (const current of selfMadeAndYear) {
      const numberOfBillionaires: number = getBillionairesSelfMade(current['year'], current['selfMade'], BillionariesDataSetCopy, Country);
      const billionaireBySelfMade: BillionairesSelfMade = { Year: current['year'], SelfMade: current['selfMade'], Billionaires: numberOfBillionaires };
      billionairesBySelfMade.push(billionaireBySelfMade);
  }
  return billionairesBySelfMade;
}

// By Sector 
interface BillionairesBySector {
	"Sector": string,
	"Billionaires": number
}

function getBillionairesBySector(Country: string, billionaires: Billionaire[]): BillionairesBySector[] {
  const billionairesBySector: BillionairesBySector[] = [];
  if (Country !== "Global") {
    billionaires = billionaires.filter(c => (c['location']['citizenship'] === Country));
  }
	const sector: string[] = billionaires.map(c => (c["wealth"]["how"]["industry"].toLowerCase().trim()));
	sector.forEach(sector => {
	  // Check if sector is a part of the list
	  // Check for better solution
	  const currentSectors: string[] = billionairesBySector.map(c => c['Sector']);
	  let found: number = -1;
	  for (let i = 0; i < currentSectors.length; i++) {
		if (sector == currentSectors[i]) {
		  found = i;
		}
	  }
	  if (found == -1) {
		const newSector: BillionairesBySector = { "Sector": sector, "Billionaires": 1 };
		billionairesBySector.push(newSector);
	  }
	  else {
		billionairesBySector[found]['Billionaires'] += 1;
	  }
	})
  return billionairesBySector;
}

// By Gender 
interface BillionairesByGender {
	"Year": number,
	"Gender": string,
	"Billionaires": number
}

function getBillionairesByGender(GivenYear: number, GivenGender: string, billionaires: Billionaire[], Country: string): number {
  if (Country == "Global") {
    const genderArray: Billionaire[] = billionaires.filter(c => (c['year'] === GivenYear && c['demographics']['gender'] === GivenGender));
    const totalBillionaires: number = genderArray.length;
    return totalBillionaires;
  }
  else {
    const genderArray: Billionaire[] = billionaires.filter(c => (c['year'] === GivenYear && c['demographics']['gender'] === GivenGender && c["location"]["citizenship"]) == Country);
    const totalBillionaires: number = genderArray.length;
    return totalBillionaires;
  }
}

interface GenderAndYear {
  year: number,
  gender: string
}

const genderAndYears: GenderAndYear[] = [
  {
    year: 1996,
    gender: 'male'
  },
  {
    year: 1996,
    gender: 'female'
  },
  {
    year: 2001,
    gender: 'male'
  },
  {
    year: 2001,
    gender: 'female'
  },
  {
    year: 2014,
    gender: 'male'
  },
  {
    year: 2014,
    gender: 'female'
  }
];

function createGenderData(Country: string, BillionariesDataSetCopy: Billionaire[]): BillionairesByGender[] {
  const billionairesByGender: BillionairesByGender[] = [];
  for (const current of genderAndYears) {
    const numberOfBillionaires: number = getBillionairesByGender(current['year'], current['gender'], BillionariesDataSetCopy, Country);
    const billionaireByGender: BillionairesByGender = { Year: current['year'], Gender: current['gender'], Billionaires: numberOfBillionaires };
    billionairesByGender.push(billionaireByGender);
  }
  return billionairesByGender;
}



// By Country 
// Read the dataset for country codes
const dataString2: string = await (await fetch('data/countryCodes.json')).text();
const countryCodesDataSet: Country[] = JSON.parse(dataString2);

// Interface to describe the country code dataset
interface Country {
  "id": number,
  "country": string,
  "my19": number,
  "gdppc": number,
  "billionaires": number,
  "mypct": number
}

for (const current of countryCodesDataSet) {
    delete current.my19;
    delete current.mypct;
}

function findCountryID(Country: string): number {
  for (const current of countryCodesDataSet) {
    if (Country == current['country']) {
      return current['id'];
    }
  }
}

// Billionaries by country 
interface BillionairesByCountry {
	"Country": string,
	"Billionaires": number,
  "id": number
}


var billionairesByCountry: BillionairesByCountry[] = [];

function getBillionairesByCountry(billionaires: Billionaire[]) {
	const countries: string[] = billionaires.map(c => (c["location"]["citizenship"]));
	countries.forEach((country) => {
	    // Check if country is a part of the list
  	  // Check for better solution
  	  const currentcountries: string[] = billionairesByCountry.map(c => c['Country']);
  	  let found: number = -1;
  	  for (let i = 0; i < currentcountries.length; i++) {
  		  if (country == currentcountries[i]) {
    		  found = i;
    		}
  	  }
  	  if (found == -1) {
        const countryId: number = findCountryID(country);
  		  const newCountry: BillionairesByCountry = { "Country": country, "Billionaires": 1, "id": countryId };
    		billionairesByCountry.push(newCountry);
  	  }
  	  else {
  		  billionairesByCountry[found]['Billionaires'] += 1;
  	  }
  	})
  }
  
getBillionairesByCountry(billionairesDataset);
console.log(billionairesByCountry);

const billionariesMap: VisualizationSpec = {
	"width": 500,
	"height": 300,
  "title": "Billionaires By Country",
	"projection": {type: "equalEarth"},
	"data": {
    "values": billionairesByCountry,
  },
  "transform": [
    {
      "lookup": "id",
      "from": {
        "data": {
          "url": "https://raw.githubusercontent.com/vega/datalib/master/test/data/world-110m.json",
	        "format": {
		      "type": "topojson",
		      "feature": "countries"
	        }
	      },
        "key": "id",
      },
      "as": "geo"
    }
  ],
	"mark": {
    "type": "geoshape"
  },
  "encoding": {
    "shape": {"field": "geo", "type": "geojson"},
    "color": {"field": "Billionaires", "type": "quantitative"}
  },
}

vegaEmbed('#billionariesMap', billionariesMap);


// GDP per capita 2019
const gdpMap: VisualizationSpec = {
	"width": 500,
	"height": 300,
  "title": "GDP per capita for 2019",
	"projection": {type: "equalEarth"},
	"data": {
    "values": countryCodesDataSet,
  },
  "transform": [
    {
      "lookup": "id",
      "from": {
        "data": {
          "url": "https://raw.githubusercontent.com/vega/datalib/master/test/data/world-110m.json",
	        "format": {
		      "type": "topojson",
		      "feature": "countries"
	        }
	      },
        "key": "id",
      },
      "as": "geo"
    }
  ],
	"mark": {
    "type": "geoshape"
  },
  "encoding": {
    "shape": {"field": "geo", "type": "geojson"},
    "color": {"field": "gdppc", "type": "quantitative"}
  },
}

vegaEmbed('#gdpMap', gdpMap);