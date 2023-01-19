import vegaEmbed from "vega-embed";
import { ARC, BAR } from 'vega-lite/build/src/mark';
// Read the dataset of your billionaires
const dataString = await (await fetch('data/billionaires.json')).text();
const billionairesDataset = JSON.parse(dataString);
;
// Getting Data from form 
const submitBtn = document.querySelector(".submit-btn");
submitBtn.addEventListener('click', () => {
    const countryFromForm = document.getElementById("country").value;
    const graphType = document.getElementById("typeOfGraph").value;
    let newGraph;
    newGraph = getNewGraph(countryFromForm, graphType);
    vegaEmbed('#graph', newGraph);
});
function getNewGraph(Country, GraphType) {
    const copy = JSON.parse(JSON.stringify(baseChart));
    copy['title'] = `Billionaires by ${GraphType} (${Country})`;
    if (GraphType === "Self Made") {
        const newData = createSelfMadeData(Country, billionairesDataset);
        copy['data']['values'] = newData;
    }
    else if (GraphType === "Sector") {
        const newData = getBillionairesBySector(Country, billionairesDataset);
        copy['data'] = {
            values: newData
        };
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
        };
    }
    else if (GraphType === "Gender") {
        const newData = createGenderData(Country, billionairesDataset);
        copy['data']['values'] = newData;
        copy['encoding']['color'] = {
            field: 'Gender',
            type: 'nominal'
        };
    }
    return copy;
}
const selfMadeAndYear = [
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
];
const selfMadeBaseData = createSelfMadeData("Global", billionairesDataset);
const baseChart = {
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
};
vegaEmbed("#graph", baseChart);
function getBillionairesSelfMade(GivenYear, selfMade, billionaires, Country) {
    let totalBillionaires = 0;
    if (Country !== "Global") {
        if (selfMade == true) {
            const selfMadeArray = billionaires.filter(c => (c['year'] === GivenYear && c['wealth']['how']['inherited'] === "not inherited" && c['location']['citizenship'] === Country));
            totalBillionaires = selfMadeArray.length;
        }
        else {
            const selfMadeArray = billionaires.filter(c => (c['year'] === GivenYear && c['wealth']['how']['inherited'] !== "not inherited" && c['location']['citizenship'] === Country));
            totalBillionaires = selfMadeArray.length;
        }
        return totalBillionaires;
    }
    else {
        if (selfMade == true) {
            const selfMadeArray = billionaires.filter(c => (c['year'] === GivenYear && c['wealth']['how']['inherited'] === "not inherited"));
            totalBillionaires = selfMadeArray.length;
        }
        else {
            const selfMadeArray = billionaires.filter(c => (c['year'] === GivenYear && c['wealth']['how']['inherited'] !== "not inherited"));
            totalBillionaires = selfMadeArray.length;
        }
        return totalBillionaires;
    }
}
function createSelfMadeData(Country, BillionariesDataSetCopy) {
    BillionariesDataSetCopy.slice();
    let billionairesBySelfMade = [];
    for (const current of selfMadeAndYear) {
        const numberOfBillionaires = getBillionairesSelfMade(current['year'], current['selfMade'], BillionariesDataSetCopy, Country);
        const billionaireBySelfMade = { Year: current['year'], SelfMade: current['selfMade'], Billionaires: numberOfBillionaires };
        billionairesBySelfMade.push(billionaireBySelfMade);
    }
    return billionairesBySelfMade;
}
function getBillionairesBySector(Country, billionaires) {
    const billionairesBySector = [];
    if (Country !== "Global") {
        billionaires = billionaires.filter(c => (c['location']['citizenship'] === Country));
    }
    const sector = billionaires.map(c => (c["wealth"]["how"]["industry"].toLowerCase().trim()));
    sector.forEach(sector => {
        // Check if sector is a part of the list
        // Check for better solution
        const currentSectors = billionairesBySector.map(c => c['Sector']);
        let found = -1;
        for (let i = 0; i < currentSectors.length; i++) {
            if (sector == currentSectors[i]) {
                found = i;
            }
        }
        if (found == -1) {
            const newSector = { "Sector": sector, "Billionaires": 1 };
            billionairesBySector.push(newSector);
        }
        else {
            billionairesBySector[found]['Billionaires'] += 1;
        }
    });
    return billionairesBySector;
}
function getBillionairesByGender(GivenYear, GivenGender, billionaires, Country) {
    if (Country == "Global") {
        const genderArray = billionaires.filter(c => (c['year'] === GivenYear && c['demographics']['gender'] === GivenGender));
        const totalBillionaires = genderArray.length;
        return totalBillionaires;
    }
    else {
        const genderArray = billionaires.filter(c => (c['year'] === GivenYear && c['demographics']['gender'] === GivenGender && c["location"]["citizenship"]) == Country);
        const totalBillionaires = genderArray.length;
        return totalBillionaires;
    }
}
const genderAndYears = [
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
function createGenderData(Country, BillionariesDataSetCopy) {
    const billionairesByGender = [];
    for (const current of genderAndYears) {
        const numberOfBillionaires = getBillionairesByGender(current['year'], current['gender'], BillionariesDataSetCopy, Country);
        const billionaireByGender = { Year: current['year'], Gender: current['gender'], Billionaires: numberOfBillionaires };
        billionairesByGender.push(billionaireByGender);
    }
    return billionairesByGender;
}
// By Country 
// Read the dataset for country codes
const dataString2 = await (await fetch('data/countryCodes.json')).text();
const countryCodesDataSet = JSON.parse(dataString2);
for (const current of countryCodesDataSet) {
    delete current.my19;
    delete current.mypct;
}
function findCountryID(Country) {
    for (const current of countryCodesDataSet) {
        if (Country == current['country']) {
            return current['id'];
        }
    }
}
var billionairesByCountry = [];
function getBillionairesByCountry(billionaires) {
    const countries = billionaires.map(c => (c["location"]["citizenship"]));
    countries.forEach((country) => {
        // Check if country is a part of the list
        // Check for better solution
        const currentcountries = billionairesByCountry.map(c => c['Country']);
        let found = -1;
        for (let i = 0; i < currentcountries.length; i++) {
            if (country == currentcountries[i]) {
                found = i;
            }
        }
        if (found == -1) {
            const countryId = findCountryID(country);
            const newCountry = { "Country": country, "Billionaires": 1, "id": countryId };
            billionairesByCountry.push(newCountry);
        }
        else {
            billionairesByCountry[found]['Billionaires'] += 1;
        }
    });
}
getBillionairesByCountry(billionairesDataset);
console.log(billionairesByCountry);
const billionariesMap = {
    "width": 500,
    "height": 300,
    "title": "Billionaires By Country",
    "projection": { type: "equalEarth" },
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
        "shape": { "field": "geo", "type": "geojson" },
        "color": { "field": "Billionaires", "type": "quantitative" }
    },
};
vegaEmbed('#billionariesMap', billionariesMap);
// GDP per capita 2019
const gdpMap = {
    "width": 500,
    "height": 300,
    "title": "GDP per capita for 2019",
    "projection": { type: "equalEarth" },
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
        "shape": { "field": "geo", "type": "geojson" },
        "color": { "field": "gdppc", "type": "quantitative" }
    },
};
vegaEmbed('#gdpMap', gdpMap);
//# sourceMappingURL=script.js.map