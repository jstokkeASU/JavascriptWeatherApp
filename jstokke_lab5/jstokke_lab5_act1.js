var names = [];
var dates = [];
var timeStamp = [];
var temps = [];
var humids = [];
var winds = [];
var clouds = [];
var score = [];
var update = false;
var thirdCity = false;
var update3 = false;

function getRequestObject() {
	if (window.XMLHttpRequest) {
		return(new XMLHttpRequest());
	} else {
		return(null);
	}
}

//Calls functions based on type of update
function getCityWeather(city, cityNum, type) {
	var request = getRequestObject();
	var addressString = "http://api.openweathermap.org/data/2.5/weather?q="+city+"&APPID=93021f0e68f17e324cec151b3ca4b502";
	request.onreadystatechange = 
	function() { 
		if (type === "standard") {
			getWeather(request, cityNum);
		} else if (type === "addition"){
			addCity(request);
		} else if (type === "stored"){
			getStored(request, cityNum);
		} else {
			refreshData(request, cityNum);
		}
	}
	request.open("GET", addressString, true);
	request.send(null);
	
}
		
//Filling in first two cities
function getWeather(request, line){
	var cityLine = "cityName"+line;
	var dateLine = "date"+line;
	var tempLine = "temp"+line;
	var humidLine = "humidity"+line;
	var windLine = "wind"+line; 
	var cloudLine = "clouds"+line;
	if ((request.readyState == 4) && (request.status == 200)) {
		var cityWeather = JSON.parse(request.responseText);
		fillCity(cityLine, line, cityWeather);
		fillDate(dateLine, line, cityWeather);
		fillTemp(tempLine, line, cityWeather);
		fillHumid(humidLine, line, cityWeather);
		fillWind(windLine, line, cityWeather);
		fillClouds(cloudLine, line, cityWeather);
		getCompData(names, temps, "temperature", "hottest");
		getCompData(names, humids, "humidity", "most humid");
		scoreWeather(names, temps, humids, winds, clouds);
	} else if (request.status == 404) {
		document.write("Error Message 404:  This is an invalid URI");
	} else if (request.status == 400) {
		document.write("Error Message 400:  This is an improper client request");
	} else if (request.status == 409) {
		document.write("Error Message 409:  Conflict.  Completing this request would leave the server in an unstable state.");
	} else if ((request.status > 499) && (request.status < 600)) {
		document.write("Error Message 5xx:  Server Error");
	}
}

//If data in local storage, load that, otherwise get new data for table
function fillTables(){
	if ((localStorage.getItem("cityName1")) == null){
		getCityWeather("London", 1, "standard");
	} else {
		getCityWeather("London", 1, "stored");
	}
	if ((localStorage.getItem("cityName2")) == null){
		getCityWeather("Phoenix", 2, "standard");
	} else {
		getCityWeather("Phoenix", 2, "stored");
	}
	if ((localStorage.getItem("cityName3")) != null){
		getCityWeather(localStorage.getItem("cityName3"), 3, "stored");
	}
}

//Called from getWeather.  Used for first two cities.
function fillCity(elemID, line, dataSource){
	var cityString = "";
	cityString += dataSource.name;
	cityString += ", ";
	cityString += dataSource.sys.country;
	document.getElementById(elemID).innerHTML=cityString;
	names[line-1] = cityString;
	localStorage.setItem(elemID, cityString);
	//document.getElementById("temperature").innerHTML=names;
}

//Called from getWeather.  Used for first two cities.
function fillDate(elemID, line, cityWeather){
	var dateString = "";
	var timeStampString = "timeStamp"+line;
	var myDate = new Date(cityWeather.dt*1000);
	var year = myDate.getFullYear();
	var month = (myDate.getMonth())+1;
	var date = myDate.getDate();
	var hour = myDate.getHours();
	var minutes = myDate.getMinutes();
	var seconds = myDate.getSeconds();
	dateString += year;
	dateString +=":";
	dateString += month;
	dateString += ":";
	dateString += date;
	dateString += ":";
	dateString += hour;
	dateString += ":";
	dateString += minutes;
	dateString += ":";
	dateString += seconds;
	document.getElementById(elemID).innerHTML=dateString;
	timeStamp[line-1] = dateString;
	localStorage.setItem(timeStampString, dateString);
	dates[line-1] = cityWeather.dt;
	localStorage.setItem(elemID, cityWeather.dt);
}

//Called from getWeather.  Used for first two cities.
function fillTemp(tempLine, line, cityWeather) {
	var tempString = "";
	var kelvTemp = parseInt(cityWeather.main.temp);
	var celsTemp = Math.round((kelvTemp-273.15) * 10) / 10;
	tempString += celsTemp;
	document.getElementById(tempLine).innerHTML=tempString;
	temps[line-1] = tempString;
	localStorage.setItem(tempLine, tempString);
}

//Called from getWeather.  Used for first two cities.
function fillHumid(humidLine, line, cityWeather) {
	var humidString = "";
	humidString += cityWeather.main.humidity;
	document.getElementById(humidLine).innerHTML=humidString;
	humids[line-1] = humidString;
	localStorage.setItem(humidLine, humidString);
}

//Called from getWeather.  Used for first two cities.
function fillWind(windLine, line, cityWeather){
	var windString = "";
	var mphWind = Math.round(((cityWeather.wind.speed)*2.23694) *10) /10;
	windString += mphWind;
	document.getElementById(windLine).innerHTML=windString;
	winds[line-1] = windString;
	localStorage.setItem(windLine, windString);
}

//Called from getWeather.  Used for first two cities.
function fillClouds(cloudLine, line, cityWeather){
	var cloudString = "";
	cloudString += cityWeather.clouds.all;
	document.getElementById(cloudLine).innerHTML=cloudString;
	clouds[line-1] = cloudString;
	localStorage.setItem(cloudLine, cloudString);
}

//Fills in Drop Down data upon selection of city and/or update of third city
function addCity(request) {
	if ((request.readyState == 4) && (request.status == 200)) {
		cityWeather = JSON.parse(request.responseText);
		var table = document.getElementById("weatherList");
		var rows = 3;
		if (update == true) {
			rows = 5;
		}
		if (thirdCity == true) {
			table.deleteRow(rows);
		}
		var row = table.insertRow(rows);
		thirdCity = true;
		var cityCell = row.insertCell(0);
		var timeCell = row.insertCell(1);
		var tempCell = row.insertCell(2);
		var humidCell = row.insertCell(3);
		var windCell = row.insertCell(4);
		var cloudCell = row.insertCell(5);
		//City
		var cityString = "";
		cityString += cityWeather.name;
		cityString += ", ";
		cityString += cityWeather.sys.country;
		cityCell.innerHTML=cityString;
		
		if (cityString != names[2]) {
			if (update3 == true){
				table.deleteRow(6);
				update3 = false;
			}
		}
		//document.getElementById("test2").innerHTML="CityString:"+cityString+".  names[2]:"+names[2]+".  Update3:"+update3+".  Third City:"+thirdCity;
		names[2] = cityString;
		localStorage.setItem("cityName3", cityString);
		//Time
		var dateString = "";
		var myDate = new Date(cityWeather.dt*1000);
		var year = myDate.getFullYear();
		var month = (myDate.getMonth())+1;
		var date = myDate.getDate();
		var hour = myDate.getHours();
		var minutes = myDate.getMinutes();
		var seconds = myDate.getSeconds();
		dateString += year;
		dateString +=":";
		dateString += month;
		dateString += ":";
		dateString += date;
		dateString += ":";
		dateString += hour;
		dateString += ":";
		dateString += minutes;
		dateString += ":";
		dateString += seconds;
		dateString 
		timeCell.innerHTML=dateString;
		localStorage.setItem("timeStamp3", dateString);
		timeStamp[2] = dateString;
		dates[2] = cityWeather.dt;
		localStorage.setItem("date3", cityWeather.dt);
		//Temperature
		var tempString = "";
		var kelvTemp = parseInt(cityWeather.main.temp);
		var celsTemp = Math.round((kelvTemp-273.15) * 10) / 10;
		tempString += celsTemp;
		tempCell.innerHTML=tempString;
		temps[2] = tempString;
		localStorage.setItem("temp3", tempString);
		//Humidity
		var humidString = "";
		humidString += cityWeather.main.humidity;
		humidCell.innerHTML=humidString;
		humids[2] = humidString;
		localStorage.setItem("humidity3", humidString);
		//Wind
		var windString = "";
		var mphWind = Math.round(((cityWeather.wind.speed)*2.23694) *10) /10;
		windString += mphWind;
		windCell.innerHTML=windString;
		winds[2] = windString;
		localStorage.setItem("wind3", windString);
		//Clouds
		var cloudString = "";
		cloudString += cityWeather.clouds.all;
		cloudCell.innerHTML=cloudString;
		clouds[2] = cloudString;
		localStorage.setItem("clouds3", cloudString);
		//Fill bottom info
		getCompData(names, temps, "temperature", "hottest");
		getCompData(names, humids, "humidity", "most humid");
		scoreWeather(names, temps, humids, winds, clouds);
	} else if (request.status == 404) {
		document.write("Error Message 404:  This is an invalid URI");
	} else if (request.status == 400) {
		document.write("Error Message 400:  This is an improper client request");
	} else if (request.status == 409) {
		document.write("Error Message 409:  Conflict.  Completing this request would leave the server in an unstable state.");
	} else if ((request.status > 499) && (request.status < 600)) {
		document.write("Error Message 5xx:  Server Error");
	}
}

//Function called from page to update weather
function checkUpdate(cityThree){
	getCityWeather("London", 1, "update");
	getCityWeather("Phoenix", 2, "update");
	if (thirdCity == true){
		getCityWeather(cityThree, 3, "update");
		update3 = true;
	}
	update = true;
}

//add necessary rows/cells and calculate changes
function refreshData(request, number) {
	var temp = [];
	var cityItem = "cityName"+number;
	var dateItem = "date"+number;
	var tempItem = "temp"+number;
	var humidItem = "humidity"+number;
	var windItem = "wind"+number;
	var cloudsItem = "clouds"+number;
	temp[0] = localStorage.getItem(dateItem);
	temp[1] = localStorage.getItem(tempItem);
	temp[2] = localStorage.getItem(humidItem);
	temp[3] = localStorage.getItem(windItem);
	temp[4] = localStorage.getItem(cloudsItem);
	var table = document.getElementById("weatherList");
	if (number < 3){
		getWeather(request, number);
		if (number == 1){
			rowNum = 2;
		} else if (number == 2) {
			rowNum = 4;
		}
		if (update == true){
			table.deleteRow(rowNum);
		}
	} else {
		rowNum = 6;
		addCity(request);
		if (update3 == true){
			table.deleteRow(rowNum);
		}
	}
	var row = table.insertRow(rowNum);
	var cityCell = row.insertCell(0);
	var timeCell = row.insertCell(1);
	var tempCell = row.insertCell(2);
	var humidCell = row.insertCell(3);
	var windCell = row.insertCell(4);
	var cloudCell = row.insertCell(5);
	cityCell.innerHTML = localStorage.getItem(cityItem);
	var timeDiff = (parseFloat(localStorage.getItem(dateItem))-temp[0])/60;
	var timeDiffString = timeDiff+" Minutes";
	timeCell.innerHTML = timeDiffString;
	var tempDiff = parseFloat(localStorage.getItem(tempItem))-temp[1];
	tempCell.innerHTML = Math.round(tempDiff*10) /10;
	var humidDiff = parseFloat(localStorage.getItem(humidItem))-temp[2];
	humidCell.innerHTML = Math.round(humidDiff*10) /10;
	var windDiff = parseFloat(localStorage.getItem(windItem))-temp[3];
	windCell.innerHTML = Math.round(windDiff*10) /10;
	var cloudDiff = parseFloat(localStorage.getItem(cloudsItem))-temp[4];
	cloudCell.innerHTML = Math.round(cloudDiff*10) /10;
}

//Fill Table with previously stored weather data
function getStored(request, number){
	if ((request.readyState == 4) && (request.status == 200)) {
		var index = number-1;
		var cityItem = "cityName"+(number.toString());
		var dateItem = "date"+number;
		var timeStampItem = "timeStamp"+number;
		var tempItem = "temp"+number;
		var humidItem = "humidity"+number;
		var windItem = "wind"+number;
		var cloudsItem = "clouds"+number;
		document.getElementById(cityItem).innerHTML=localStorage.getItem(cityItem);
		names[index] = localStorage.getItem(cityItem);
		document.getElementById(dateItem).innerHTML=localStorage.getItem(timeStampItem);
		timeStamp[index] = localStorage.getItem(timeStampItem);
		document.getElementById(tempItem).innerHTML=localStorage.getItem(tempItem);
		temps[index] = localStorage.getItem(tempItem);
		document.getElementById(humidItem).innerHTML=localStorage.getItem(humidItem);;
		humids[index] = localStorage.getItem(humidItem);
		document.getElementById(windItem).innerHTML=localStorage.getItem(windItem);
		winds[index] = localStorage.getItem(windItem);
		document.getElementById(cloudsItem).innerHTML=localStorage.getItem(cloudsItem);
		clouds[index] = localStorage.getItem(cloudsItem);
		getCompData(names, temps, "temperature", "hottest");
		getCompData(names, humids, "humidity", "most humid");
		scoreWeather(names, temps, humids, winds, clouds);
	} else if (request.status == 404) {
		document.write("Error Message 404:  This is an invalid URI");
	} else if (request.status == 400) {
		document.write("Error Message 400:  This is an improper client request");
	} else if (request.status == 409) {
		document.write("Error Message 409:  Conflict.  Completing this request would leave the server in an unstable state.");
	} else if ((request.status > 499) && (request.status < 600)) {
		document.write("Error Message 5xx:  Server Error");
	}
}

//Compare Data to find avg and max of given data
function getCompData(nameArray, calcArray, section, descriptor){
	
	var hotCityTemp = -273;
	var hotCityName = "";
	var total = 0;
	for (i=0;i<calcArray.length;i++){
		total+=parseFloat(calcArray[i]);
		if (parseFloat(calcArray[i])>hotCityTemp) {
			hotCityTemp = parseFloat(calcArray[i]);
			hotCityName = "";
			hotCityName += nameArray[i];
		}
	}
	var avg = Math.round((total/temps.length)*10) / 10;
	document.getElementById(section).innerHTML="The average "+section+" is "+avg+" and the "+descriptor+" city is "+hotCityName; 
}

//Function for scoring weather to evaluate best and worst.  Since I prefer snow to cold rain, extra points for temps being at or below freezing.
//Temperatures abov 24 are less than ideal, so penalty based on degrees above 24.  Humidity and Temperature are the biggest factors.
function scoreWeather(names, temps, humids, winds, clouds){
	for (i=0;i<temps.length;i++){
		if (temps[i] < 0) {
			score[i] = parseFloat(temps[i])+12-parseFloat(humids[i])*.6-parseInt(winds[i])-parseFloat(clouds[i])*.4;
		} else if (temps[i]>24){
			score[i] = parseFloat(temps[i])-2*(parseFloat(temps[i])-24)-parseFloat(humids[i])*.6+parseInt(winds[i])-parseFloat(clouds[i])*.4;
		} else {
			score[i] = Math.round((parseFloat(temps[i]) - parseFloat(humids[i])*.6-parseInt(winds[i])-parseFloat(clouds[i])*.4)*100) / 100;
		}
	}
	var lowScore = 10000;
	var highScore = -10000;
	var lowName = "";
	var highName = "";
	for (j=0;j<score.length;j++){
		if (score[j]>highScore){
			highScore = score[j];
			highName = names[j];
		}
		if (score[j]<lowScore){
			lowScore=score[j];
			lowName=names[j];
		}
	}
	document.getElementById("best").innerHTML="The city with the nicest weather is "+highName;
	document.getElementById("worst").innerHTML="The city with the worst weather is "+lowName;
	//document.getElementById("test").innerHTML=score;
}

function clearStorage(){
	localStorage.clear();
}

