var fs = require('fs');

var path = "./log";

//console.log(fileList);
function monitorLogfolder(){
	var fileList = [];
	fileList = fs.readdirSync(path);
	analyzeList(fileList)
}

function analyzeList(fileList){
	for(i = 0; i < fileList.length; i++){
		//console.log(fileList[i]);
		var currentDate = new Date();
		//console.log(currentDate.getTime());
		/*var currentDates = currentDate.getDate();
    	var currentMonths = currentDate.getMonth();
    	var currentYears = currentDate.getFullYear();
    	var currentHours = currentDate.getHours();
    	var currentMinutes = currentDate.getMinutes();
*/

		var dates = parseInt(fileList[i].substr(0,2));
	    var months = parseInt(fileList[i].substr(3,2))-1;
	    var years = parseInt(fileList[i].substr(6,4));
	    var hours = parseInt(fileList[i].substr(11,2));
	    var minutes = parseInt(fileList[i].substr(14,2));
	    //new Date(year, month[, date[, hours[, minutes[, seconds[, milliseconds]]]]]);
	    var fileDate = new Date(years,months,dates,hours,minutes,0);
	    //console.log(fileDate.toLocaleString());
	    //console.log(fileDate.getTime());
	    //console.log(minutes);
	    if((currentDate.getTime()-fileDate.getTime())>60000){
	    	processLogFile(fileList[i]);
	    }


	}
}

function processLogFile(fileName){
	console.log(fileName);
}

monitorLogfolder();
//setInterval(monitorLogfolder, 1*1000);