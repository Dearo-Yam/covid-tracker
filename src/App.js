import React, { useEffect, useState } from "react";
import{MenuItem,FormControl,Select, Card, CardContent} from "@material-ui/core"
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import { sortData } from "./util";
import LineGraph from "./LineGraph";
import './App.css';
import "leaflet/dist/leaflet.css";


function App() {
  // https://disease.sh/v3/covid-19/countries this api is a list of countries that we will call with data about each country regarding covid cases.
  //to call the link we will use a USEEFFECT

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries,setMapCountries] = useState([]);

  useEffect(() =>{
    fetch("https://disease.sh/v3/covid-19/all").then(response => response.json())
    .then(data => {
      setCountryInfo(data);
    });
  },[]);


  //useEffect is a function that will only run when it is called
  useEffect(() => {
    //when called we will fetch data from the following api. 
    const getCountriesData = async() => {
      
      await fetch ("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        //we are mapping the information for each country to data
        const countries = data.map((country) => ({
          //the two information we will be pulling from the api is country and countryInfo.iso2
          name: country.country, //UnitedStates, UnitedKingdom
          value: country.countryInfo.iso2//UK,USA
        }));
        const sortedData = sortData(data);
        setTableData(sortedData);
        setMapCountries(data);
        setCountries(countries);

      });
    };

    getCountriesData();
  }, []);



  // onCountryChange is to allow our dropdown menu to hold and display the value/name of our current selected country. 
  const onCountryChange = async (event) =>{
    const countryCode = event.target.value;
    // setCountry(countryCode);

    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`

    await fetch(url).then(response => response.json())
    .then(data =>{
      //contains country code
      setCountry(countryCode);
      //contains entire country data
      setCountryInfo(data);

      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);

    });
    // https://disease.sh/v3/covid-19/all
    // https://disease.sh/v3/covid-19/countries/[COUNTRY_CODE]
  };



  return (
    <div className="app">

      <div className="app_left">

      <div className="app__header">
      <h1>Hello lets build a covid tracker!</h1>
      {/* formcontrol helps us with styling */}
      <FormControl className="app_dropdown">

{/* select will allow us to create a dropdown menu*/}
        <Select variant="outlined" onChange={onCountryChange} value={country}>
          {/* MenuItem represents the contents that will be inside of our dropdown menu*/}
              <MenuItem value="worldwide">Worldwide</MenuItem>
            {
              // for every country in our countries we will be getting their country value and country name and appending it to our MenuItem.
              countries.map(country =>
                <MenuItem value={country.value}>{country.name}</MenuItem>)
            }
        </Select>
      </FormControl>
      </div>



      
      <div className="app_stats">
            <InfoBox title="CoronaVirus cases" cases = {countryInfo.todayCases} total={countryInfo.cases}></InfoBox>
            
            <InfoBox title="Recovered" cases = {countryInfo.todayRecovered} total={countryInfo.recovered}></InfoBox>
            
            <InfoBox title="Deaths" cases = {countryInfo.todayDeaths} total={countryInfo.deaths}></InfoBox>
      </div>

            <Map countries={mapCountries} center={mapCenter} zoom={mapZoom}/>
            </div>
      

      <Card className="app_right">
            <CardContent>
              <h3>Live Cases By Country</h3>
              <Table countries={tableData}></Table>
              <h3>Live Cases by Worldwide</h3>
              <LineGraph /> 
              
            </CardContent>
      </Card>

     
    </div>
  );
}

export default App;
